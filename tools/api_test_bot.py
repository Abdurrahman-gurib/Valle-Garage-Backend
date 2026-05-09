#!/usr/bin/env python3
"""
Vallé GMS API Test Bot
A lightweight Postman-like API test runner using only Python standard library.

Usage:
  python tools/api_test_bot.py --base-url http://localhost:3000/api

Pre-requisites:
  1. PostgreSQL database exists and is migrated/seeded.
  2. Backend is running: npm run start:dev
  3. Demo users exist: admin@valle.com/admin123, mechanic@valle.com/mech123, store@valle.com/store123
"""
from __future__ import annotations

import argparse
import json
import sys
import time
import traceback
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Dict, Optional, Tuple
from urllib import request, error


@dataclass
class TestResult:
    name: str
    method: str
    path: str
    expected: str
    actual_status: int
    passed: bool
    payload: Any = None
    response_preview: Any = None
    error: Optional[str] = None


class ApiTester:
    def __init__(self, base_url: str, timeout: int = 20):
        self.base_url = base_url.rstrip('/')
        self.timeout = timeout
        self.tokens: Dict[str, str] = {}
        self.users: Dict[str, Dict[str, Any]] = {}
        self.created: Dict[str, Any] = {}
        self.results: list[TestResult] = []
        self.run_id = datetime.now().strftime('%Y%m%d%H%M%S')

    def req(self, method: str, path: str, payload: Any = None, token: Optional[str] = None) -> Tuple[int, Any]:
        url = self.base_url + path
        data = None
        headers = {'Accept': 'application/json'}
        if payload is not None:
            data = json.dumps(payload).encode('utf-8')
            headers['Content-Type'] = 'application/json'
        if token:
            headers['Authorization'] = f'Bearer {token}'

        req = request.Request(url, data=data, headers=headers, method=method.upper())
        try:
            with request.urlopen(req, timeout=self.timeout) as resp:
                raw = resp.read().decode('utf-8')
                return resp.status, json.loads(raw) if raw else None
        except error.HTTPError as e:
            raw = e.read().decode('utf-8')
            try:
                parsed = json.loads(raw) if raw else None
            except Exception:
                parsed = raw
            return e.code, parsed

    def preview(self, obj: Any) -> Any:
        if isinstance(obj, dict):
            out = {}
            for k, v in list(obj.items())[:8]:
                if k == 'accessToken':
                    out[k] = '<JWT token returned>'
                elif isinstance(v, (dict, list)):
                    out[k] = self.preview(v)
                else:
                    out[k] = v
            return out
        if isinstance(obj, list):
            return [self.preview(x) for x in obj[:2]]
        return obj

    def check(self, name: str, method: str, path: str, expected_status: int | tuple[int, ...], payload: Any = None, token: Optional[str] = None) -> Any:
        expected_tuple = expected_status if isinstance(expected_status, tuple) else (expected_status,)
        try:
            status, body = self.req(method, path, payload, token)
            passed = status in expected_tuple
            self.results.append(TestResult(
                name=name,
                method=method,
                path=path,
                expected='/'.join(map(str, expected_tuple)),
                actual_status=status,
                passed=passed,
                payload=payload,
                response_preview=self.preview(body),
            ))
            status_icon = 'PASS' if passed else 'FAIL'
            print(f'[{status_icon}] {name}: {method} {path} -> {status}')
            if not passed:
                print('       Response:', json.dumps(self.preview(body), indent=2))
            return body
        except Exception as exc:
            self.results.append(TestResult(
                name=name,
                method=method,
                path=path,
                expected='/'.join(map(str, expected_tuple)),
                actual_status=0,
                passed=False,
                payload=payload,
                error=f'{type(exc).__name__}: {exc}',
            ))
            print(f'[FAIL] {name}: {method} {path} -> EXCEPTION {exc}')
            traceback.print_exc()
            return None

    def login(self, role_key: str, email: str, password: str, role: str):
        body = self.check(
            f'Login as {role_key}',
            'POST',
            '/auth/login',
            201,
            {'email': email, 'password': password, 'role': role},
        )
        if isinstance(body, dict) and body.get('accessToken'):
            self.tokens[role_key] = body['accessToken']
            self.users[role_key] = body.get('user', {})
        return body

    def run_all(self):
        suffix = self.run_id
        today = datetime.now(timezone.utc)
        future = today + timedelta(days=14)

        print('\n=== Vallé GMS API Test Bot ===')
        print('Base URL:', self.base_url)
        print('Run ID:', suffix)
        print('Started:', datetime.now().isoformat(timespec='seconds'))
        print('================================\n')

        # Negative auth test
        self.check('Protected route without token should be rejected', 'GET', '/vehicles', 401)

        # Login tests
        self.login('admin', 'admin@valle.com', 'admin123', 'admin')
        self.login('mechanic', 'mechanic@valle.com', 'mech123', 'mechanic')
        self.login('store', 'store@valle.com', 'store123', 'store')
        self.check('Invalid password rejected', 'POST', '/auth/login', 401, {'email': 'admin@valle.com', 'password': 'wrong', 'role': 'admin'})

        admin = self.tokens.get('admin')
        mechanic = self.tokens.get('mechanic')
        store = self.tokens.get('store')

        if not all([admin, mechanic, store]):
            print('\nCritical: Could not login all demo users. Stop here.')
            return

        # Auth me
        self.check('Admin /auth/me', 'GET', '/auth/me', 200, token=admin)
        self.check('Mechanic /auth/me', 'GET', '/auth/me', 200, token=mechanic)
        self.check('Store /auth/me', 'GET', '/auth/me', 200, token=store)

        # Users
        users = self.check('Admin can list users', 'GET', '/users', 200, token=admin)
        self.check('Mechanic cannot list users', 'GET', '/users', 403, token=mechanic)
        new_user_payload = {
            'name': f'Test Mechanic {suffix}',
            'email': f'test.mechanic.{suffix}@valle.com',
            'password': 'Test12345',
            'role': 'mechanic',
            'isActive': True,
        }
        new_user = self.check('Admin can create user', 'POST', '/users', 201, new_user_payload, admin)
        if isinstance(new_user, dict) and new_user.get('id'):
            self.created['userId'] = new_user['id']
            self.check('Admin can read created user', 'GET', f"/users/{new_user['id']}", 200, token=admin)
            self.check('Admin can update created user', 'PATCH', f"/users/{new_user['id']}", 200, {'isActive': True, 'name': f'Updated Mechanic {suffix}'}, admin)

        # Transactions
        txn_payload = {
            'transactionNo': f'TXN-API-{suffix}',
            'type': 'Vehicle Order',
            'status': 'In Progress',
            'title': f'API Customer Quad Build {suffix}',
            'customerName': 'API Test Customer Ltd',
            'poNumber': f'PO-API-{suffix}',
            'poAttachmentUrl': f'/uploads/po-{suffix}.pdf',
            'amount': 485000,
            'startDate': today.isoformat(),
            'expectedDeliveryDate': future.isoformat(),
            'notes': 'Created by API Test Bot.',
        }
        txn = self.check('Admin can create transaction / PO', 'POST', '/transactions', 201, txn_payload, admin)
        self.check('Mechanic cannot create transaction', 'POST', '/transactions', 403, txn_payload | {'transactionNo': f'TXN-DENY-{suffix}'}, mechanic)
        if isinstance(txn, dict) and txn.get('id'):
            self.created['transactionId'] = txn['id']
            self.check('Admin can list transactions', 'GET', '/transactions', 200, token=admin)
            self.check('Admin can read transaction', 'GET', f"/transactions/{txn['id']}", 200, token=admin)
            self.check('Admin can update transaction with invoice/payment status', 'PATCH', f"/transactions/{txn['id']}", 200, {
                'status': 'Paid',
                'invoiceAttachmentUrl': f'/uploads/invoice-{suffix}.pdf',
                'notes': 'Invoice attached and payment marked paid by test bot.',
            }, admin)
            self.check('Admin can complete transaction with GRN', 'POST', f"/transactions/{txn['id']}/complete-with-grn", 201, {
                'grnAttachmentUrl': f'/uploads/grn-{suffix}.pdf',
                'grnData': {'receivedBy': 'API Tester', 'condition': 'Good', 'receivedDate': today.date().isoformat()},
            }, admin)

        # Vehicles
        vehicle_payload = {
            'plateNumber': f'API-{suffix[-6:]}',
            'vin': f'VIN-API-{suffix}',
            'vehicleType': 'Quad',
            'ownership': 'Customer Order',
            'ownerName': 'API Test Customer Ltd',
            'companyName': 'API Test Customer Ltd',
            'deliveryPersonName': 'QA Delivery Person',
            'contactNumber': '+230 5123 4567',
            'email': 'qa.customer@example.com',
            'manufacturer': 'CFMOTO',
            'status': 'Build in Progress',
            'currentHourMeter': 0,
            'checkInDateTime': today.isoformat(),
            'expectedDeliveryDate': future.isoformat(),
            'transactionId': self.created.get('transactionId'),
            'notes': 'Vehicle created by API Test Bot from PO flow.',
        }
        vehicle = self.check('Admin can create customer order vehicle', 'POST', '/vehicles', 201, vehicle_payload, admin)
        self.check('Store cannot create vehicle', 'POST', '/vehicles', 403, vehicle_payload | {'plateNumber': f'DENY-{suffix[-6:]}'}, store)
        if isinstance(vehicle, dict) and vehicle.get('id'):
            self.created['vehicleId'] = vehicle['id']
            self.check('All roles can list vehicles - admin', 'GET', '/vehicles', 200, token=admin)
            self.check('All roles can list vehicles - mechanic', 'GET', '/vehicles', 200, token=mechanic)
            self.check('All roles can list vehicles - store', 'GET', '/vehicles', 200, token=store)
            self.check('Mechanic can update vehicle build info', 'PATCH', f"/vehicles/{vehicle['id']}", 200, {
                'status': 'Built and Testing',
                'expectedDeliveryDate': (today + timedelta(days=10)).isoformat(),
                'notes': 'Build started and expected delivery updated by mechanic.',
            }, mechanic)

        # Inventory
        item_payload = {
            'sku': f'API-PART-{suffix}',
            'name': f'API Test Part {suffix}',
            'category': 'Testing Parts',
            'barcode': f'BAR{suffix}',
            'currentStock': 3,
            'reorderLevel': 5,
            'costPrice': 100,
            'sellingPrice': 150,
            'supplierName': 'API Supplier',
            'supplierEmail': 'supplier@example.com',
            'location': 'QA Rack',
        }
        item = self.check('Store can create inventory item', 'POST', '/inventory', 201, item_payload, store)
        self.check('Mechanic cannot create inventory item', 'POST', '/inventory', 403, item_payload | {'sku': f'NOPE-{suffix}', 'barcode': f'NOPEBAR{suffix}'}, mechanic)
        if isinstance(item, dict) and item.get('id'):
            self.created['inventoryId'] = item['id']
            self.check('Inventory list works', 'GET', '/inventory', 200, token=store)
            self.check('Low stock list works', 'GET', '/inventory/low-stock', 200, token=store)
            self.check('Store can update inventory stock', 'PATCH', f"/inventory/{item['id']}", 200, {'currentStock': 12, 'reorderLevel': 5}, store)

        # Assessments
        if self.created.get('vehicleId'):
            assessment_payload = {
                'ticketNo': f'ASM-API-{suffix}',
                'vehicleId': self.created['vehicleId'],
                'status': 'OPEN',
                'issuesDetected': 'Assembly inspection found missing side mirror and brake adjustment requirement.',
                'conclusion': 'Request parts before final testing.',
                'requiredParts': [
                    {'partName': 'Side Mirror Set', 'quantity': 1},
                    {'partName': 'Brake Adjustment Kit', 'quantity': 1},
                ],
                'photos': [f'/uploads/assessment-{suffix}.jpg'],
            }
            asm = self.check('Mechanic can create assessment', 'POST', '/assessments', 201, assessment_payload, mechanic)
            self.check('Store cannot create assessment', 'POST', '/assessments', 403, assessment_payload | {'ticketNo': f'ASM-DENY-{suffix}'}, store)
            if isinstance(asm, dict) and asm.get('id'):
                self.created['assessmentId'] = asm['id']
                self.check('Assessment list works', 'GET', '/assessments', 200, token=admin)
                self.check('Assessment detail works', 'GET', f"/assessments/{asm['id']}", 200, token=mechanic)
                self.check('Mechanic can reopen assessment with reason', 'POST', f"/assessments/{asm['id']}/reopen", 201, {
                    'reason': 'Additional part requirement found during inspection.',
                }, mechanic)
                self.check('Store can issue parts to assessment', 'POST', f"/assessments/{asm['id']}/issue-parts", 201, {
                    'parts': [
                        {'partName': 'Side Mirror Set', 'quantity': 1, 'issuedBy': 'Store Keeper'},
                        {'partName': 'Brake Adjustment Kit', 'quantity': 1, 'issuedBy': 'Store Keeper'},
                    ],
                }, store)

        # Garage operations
        if self.created.get('vehicleId'):
            garage_payload = {
                'processNo': f'PRC-API-{suffix}',
                'vehicleId': self.created['vehicleId'],
                'assessmentId': self.created.get('assessmentId'),
                'processType': 'Build / Assembly',
                'status': 'In Progress',
                'proceduresPerformed': 'Started vehicle assembly and pre-delivery mechanical checks.',
                'partsUsed': [{'partName': 'Side Mirror Set', 'quantity': 1}],
                'checkInDateTime': today.isoformat(),
                'startDateTime': today.isoformat(),
                'laborHours': 1.5,
                'currentHourMeter': 0,
                'nextServiceDueAtHours': 100,
                'photos': [f'/uploads/garage-{suffix}.jpg'],
            }
            gop = self.check('Mechanic can create garage operation', 'POST', '/garage-ops', 201, garage_payload, mechanic)
            self.check('Store cannot create garage operation', 'POST', '/garage-ops', 403, garage_payload | {'processNo': f'PRC-DENY-{suffix}'}, store)
            if isinstance(gop, dict) and gop.get('id'):
                self.created['garageOpId'] = gop['id']
                self.check('Garage operations list works', 'GET', '/garage-ops', 200, token=mechanic)
                self.check('Garage operation detail works', 'GET', f"/garage-ops/{gop['id']}", 200, token=mechanic)
                self.check('Mechanic can update garage operation invoice/payment', 'PATCH', f"/garage-ops/{gop['id']}", 200, {
                    'status': 'Completed',
                    'endDateTime': datetime.now(timezone.utc).isoformat(),
                    'laborHours': '3.75',
                    'invoiceAttachmentUrl': f'/uploads/service-invoice-{suffix}.pdf',
                    'paymentDone': True,
                    'proceduresPerformed': 'Assembly completed, testing passed, invoice attached.',
                }, mechanic)

        # Complete assessment after garage workflow
        if self.created.get('assessmentId'):
            self.check('Store can mark assessment complete', 'POST', f"/assessments/{self.created['assessmentId']}/complete", 201, token=store)

        # Reports and notifications
        self.check('Dashboard report works', 'GET', '/reports/dashboard', 200, token=admin)
        self.check('Maintenance history report works', 'GET', '/reports/maintenance-history', 200, token=admin)
        self.check('Admin notifications work', 'GET', '/notifications?role=ADMIN', 200, token=admin)
        self.check('Mechanic notifications work', 'GET', '/notifications?role=MECHANIC', 200, token=mechanic)
        self.check('Store notifications work', 'GET', '/notifications?role=STORE_KEEPER', 200, token=store)

    def write_reports(self, out_dir: Path):
        out_dir.mkdir(parents=True, exist_ok=True)
        json_path = out_dir / f'api-test-results-{self.run_id}.json'
        md_path = out_dir / f'api-test-report-{self.run_id}.md'
        payload_path = out_dir / f'api-test-payloads-{self.run_id}.json'

        json_path.write_text(json.dumps([asdict(r) for r in self.results], indent=2, default=str), encoding='utf-8')

        total = len(self.results)
        passed = sum(1 for r in self.results if r.passed)
        failed = total - passed

        payloads = [
            {'name': r.name, 'method': r.method, 'path': r.path, 'payload': r.payload}
            for r in self.results
            if r.payload is not None
        ]
        payload_path.write_text(json.dumps(payloads, indent=2, default=str), encoding='utf-8')

        lines = [
            '# Vallé GMS API Test Report',
            '',
            f'- Base URL: `{self.base_url}`',
            f'- Run ID: `{self.run_id}`',
            f'- Total tests: **{total}**',
            f'- Passed: **{passed}**',
            f'- Failed: **{failed}**',
            '',
            '## Summary Table',
            '',
            '| # | Test | Method | Path | Expected | Actual | Result |',
            '|---:|---|---|---|---|---:|---|',
        ]
        for i, r in enumerate(self.results, 1):
            result = 'PASS' if r.passed else 'FAIL'
            lines.append(f'| {i} | {r.name} | {r.method} | `{r.path}` | {r.expected} | {r.actual_status} | {result} |')

        lines += ['', '## Payloads Used', '']
        for r in self.results:
            if r.payload is None:
                continue
            lines.append(f'### {r.name}')
            lines.append(f'`{r.method} {r.path}`')
            lines.append('```json')
            lines.append(json.dumps(r.payload, indent=2, default=str))
            lines.append('```')
            lines.append('')

        if failed:
            lines += ['', '## Failed Tests', '']
            for r in self.results:
                if not r.passed:
                    lines.append(f'- **{r.name}** expected `{r.expected}` but got `{r.actual_status}`. Error: `{r.error or "see response"}`')
        else:
            lines += ['', '## Result', '', 'All tested API endpoints passed successfully in this run.']

        md_path.write_text('\n'.join(lines), encoding='utf-8')

        print('\nReports written:')
        print(' -', json_path)
        print(' -', md_path)
        print(' -', payload_path)
        return json_path, md_path, payload_path


def main():
    parser = argparse.ArgumentParser(description='Postman-like API test bot for Vallé GMS backend')
    parser.add_argument('--base-url', default='http://localhost:3000/api', help='Backend API base URL')
    parser.add_argument('--out-dir', default='test-results', help='Output folder for reports')
    args = parser.parse_args()

    tester = ApiTester(args.base_url)
    try:
        tester.run_all()
    finally:
        tester.write_reports(Path(args.out_dir))

    failed = [r for r in tester.results if not r.passed]
    if failed:
        print(f'\n{len(failed)} test(s) failed. Check the generated Markdown report for details.')
        sys.exit(1)
    print('\nAll tests passed.')


if __name__ == '__main__':
    main()
