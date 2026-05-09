import { Body, Controller, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { TransactionsService } from './transactions.service';
import { CompleteWithGrnDto, CreateTransactionDto, UpdateTransactionDto } from './dto/transaction.dto';

@ApiTags('Transactions / Purchase Orders / GRN')
@ApiBearerAuth('bearer')
@Controller('transactions')
export class TransactionsController {
  constructor(private service: TransactionsService) {}

  @Get()
  @ApiOperation({ summary: 'List transactions, purchase orders and service invoices' })
  findAll(){ return this.service.findAll(); }

  @Get(':id')
  @ApiOperation({ summary: 'Get transaction detail with linked vehicles' })
  @ApiParam({ name: 'id', example: 'transaction-uuid' })
  findOne(@Param('id') id:string){ return this.service.findOne(id); }

  @Roles(Role.ADMIN, Role.STORE_KEEPER)
  @Post()
  @ApiOperation({ summary: 'Create transaction / purchase order - Admin or Store Keeper' })
  @ApiBody({ type: CreateTransactionDto })
  create(@Body() body: CreateTransactionDto, @Req() req:any){ return this.service.create(body, req.user.id); }

  @Roles(Role.ADMIN, Role.STORE_KEEPER)
  @Patch(':id')
  @ApiOperation({ summary: 'Update transaction, invoice, status or payment details' })
  @ApiParam({ name: 'id', example: 'transaction-uuid' })
  @ApiBody({ type: UpdateTransactionDto })
  update(@Param('id') id:string, @Body() body: UpdateTransactionDto){ return this.service.update(id, body); }

  @Roles(Role.ADMIN, Role.STORE_KEEPER)
  @Post(':id/complete-with-grn')
  @ApiOperation({ summary: 'Complete transaction and attach Goods Received Note data' })
  @ApiParam({ name: 'id', example: 'transaction-uuid' })
  @ApiBody({ type: CompleteWithGrnDto })
  grn(@Param('id') id:string, @Body() body: CompleteWithGrnDto){ return this.service.completeWithGrn(id, body); }
}
