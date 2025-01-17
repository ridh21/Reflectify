# API Guide for Admin Management

## Sample Credentials
- **Super Admin**:
  - Email: `superdmin@gmail.com`
  - Password: `superadmin123`
- **Regular Admin**:
  - Email: `admin@gmail.com`
  - Password: `admin123`

## Create Super Admin
```bash
curl -X POST http://localhost:4000/api/admin/super/signup \
-H "Content-Type: application/json" \
-d '{
  "name": "Super Admin",
  "email": "super@reflectify.com",
  "password": "superadmin123",
  "designation": "Super Administrator"
}'
```


---

## Login as Admin
```bash
curl -X POST http://localhost:4000/api/admin/login \
-H "Content-Type: application/json" \
-d '{
  "email": "super@reflectify.com",
  "password": "superadmin123"
}'
```

---

## Create Regular Admin (requires Super Admin token)
```bash
curl -X POST http://localhost:4000/api/admin/signup \
-H "Content-Type: application/json" \
-H "Authorization: Bearer YOUR_JWT_TOKEN" \
-d '{
  "name": "Regular Admin",
  "email": "admin@reflectify.com",
  "password": "admin123",
  "designation": "Department Administrator"
}'
```


---

## Expected Responses

### Super Admin Creation:
```json
{
  "id": "uuid",
  "name": "Super Admin",
  "email": "super@reflectify.com",
  "designation": "Super Administrator",
  "isSuper": true
}
```


### Login Success:
```json
{
  "token": "jwt_token_here",
  "admin": {
    "id": "uuid",
    "name": "Super Admin",
    "email": "super@reflectify.com",
    "designation": "Super Administrator",
    "isSuper": true
  }
}
```


### Regular Admin Creation:
```json
{
  "id": "uuid",
  "name": "Regular Admin",
  "email": "admin@reflectify.com",
  "designation": "Department Administrator",
  "isSuper": false
}
```


---

## Environment Variables for Postman:

- **baseUrl**: `http://localhost:4000`
- **authToken**: JWT token received after login

**Note**: Remember to save the JWT token from the login response and use it in the Authorization header for protected routes.

---
## Instructions 
1. Create a Super Admin
2. Login as Super Admin
3. Create a Regular Admin
4. Login as Regular Admin