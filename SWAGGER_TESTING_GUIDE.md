# Vallé GMS Swagger Testing Guide

## Open Swagger

```txt
http://localhost:3000/api
```

`/api` redirects to:

```txt
http://localhost:3000/api/docs
```

## Login first

Open `POST /api/auth/login`, click **Try it out**, and use:

```json
{
  "email": "admin@valle.com",
  "password": "admin123"
}
```

Copy the `accessToken` returned.

## Authorize

Click **Authorize** at the top of Swagger and paste only the access token value.
Swagger automatically adds the `Bearer` prefix.

## Editable request bodies

Every POST/PATCH endpoint now has DTO classes with Swagger decorators, so Swagger displays an editable JSON request body before executing.

## Install Swagger dependencies

```powershell
npm install
```

If you are adding Swagger to an existing folder manually, use NestJS 10 compatible Swagger:

```powershell
npm install @nestjs/swagger@7 swagger-ui-express
```
