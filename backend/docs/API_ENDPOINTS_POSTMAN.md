# Complete API Endpoints Documentation for Postman

## Base URL
```
http://localhost:5000
```

---

## 🔐 AUTHENTICATION ENDPOINTS

### 1. Register / Signup

**Method:** `POST`  
**URL:** `http://localhost:5000/api/auth/signup`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "email": "newuser@example.com",
  "password": "Password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Field Requirements:**
- `email`: Valid email address (required)
- `password`: Minimum 8 characters, must contain uppercase, lowercase, and number (required)
- `firstName`: 2-50 characters (required)
- `lastName`: 2-50 characters (required)

**Success Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "email": "newuser@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "name": "John Doe",
    "emailVerified": false,
    "role": "USER",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 2. Login

**Method:** `POST`  
**URL:** `http://localhost:5000/api/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "email": "john.doe@example.com",
  "password": "Password123"
}
```

**Success Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "name": "John Doe",
    "emailVerified": true,
    "role": "USER",
    "image": null
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**💡 Copy the `accessToken` for protected routes!**

---

### 3. Logout

**Method:** `POST`  
**URL:** `http://localhost:5000/api/auth/logout`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <accessToken>
```

**Body:** None (leave empty)

**Success Response (200):**
```json
{
  "message": "Logout successful"
}
```

---

### 4. Get Current User

**Method:** `GET`  
**URL:** `http://localhost:5000/api/auth/me`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Body:** None

**Success Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "name": "John Doe",
    "emailVerified": true,
    "role": "USER",
    "image": null,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "lastLoginAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 5. Verify Email

**Method:** `POST`  
**URL:** `http://localhost:5000/api/auth/verify-email`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "token": "verification_token_here"
}
```

**Success Response (200):**
```json
{
  "message": "Email verified successfully"
}
```

---

### 6. Forgot Password

**Method:** `POST`  
**URL:** `http://localhost:5000/api/auth/forgot-password`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "email": "user@example.com"
}
```

**Success Response (200):**
```json
{
  "message": "If an account exists with this email, a password reset link has been sent"
}
```

---

### 7. Reset Password

**Method:** `POST`  
**URL:** `http://localhost:5000/api/auth/reset-password`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "token": "reset_token_here",
  "password": "NewPassword123"
}
```

**Success Response (200):**
```json
{
  "message": "Password reset successful"
}
```

---

### 8. Refresh Token

**Method:** `POST`  
**URL:** `http://localhost:5000/api/auth/refresh`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "refreshToken": "refresh_token_here"
}
```

**OR use Cookie:**
```
Cookie: refreshToken=<token>
```

**Success Response (200):**
```json
{
  "accessToken": "new_access_token_here"
}
```

---

## 👥 USER MANAGEMENT ENDPOINTS

### 9. Get All Users

**Method:** `GET`  
**URL:** `http://localhost:5000/api/users`

**Access:** Super Admin only

**Headers:**
```
Authorization: Bearer <super_admin_token>
```

**Body:** None

**Success Response (200):**
```json
{
  "users": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "name": "John Doe",
      "emailVerified": true,
      "role": "USER",
      "image": null,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "lastLoginAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

---

### 10. Get User by ID

**Method:** `GET`  
**URL:** `http://localhost:5000/api/users/:userId`

**Access:** All (Admin/Super Admin can view any, User can view own)

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `userId` - User's UUID

**Body:** None

**Success Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "name": "John Doe",
    "emailVerified": true,
    "role": "USER",
    "image": null,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "lastLoginAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 11. ⭐ Update User Role (Make User Admin)

**Method:** `PATCH`  
**URL:** `http://localhost:5000/api/users/:userId/role`

**Access:** Super Admin only

**Headers:**
```
Authorization: Bearer <super_admin_token>
Content-Type: application/json
```

**URL Parameters:**
- `userId` - User's UUID

**Body (raw JSON):**
```json
{
  "role": "ADMIN"
}
```

**Valid Roles:**
- `"USER"` - Regular user
- `"ADMIN"` - Admin user
- `"SUPER_ADMIN"` - Super admin

**Success Response (200):**
```json
{
  "message": "User role updated to ADMIN successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "name": "John Doe",
    "role": "ADMIN",
    "emailVerified": true,
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Response (403) - Not Super Admin:**
```json
{
  "error": {
    "message": "Insufficient permissions",
    "code": "FORBIDDEN"
  }
}
```

**Error Response (400) - Cannot Change Own Role:**
```json
{
  "error": {
    "message": "You cannot change your own role",
    "code": "CANNOT_CHANGE_OWN_ROLE"
  }
}
```

---

### 12. Update User Profile

**Method:** `PATCH`  
**URL:** `http://localhost:5000/api/users/:userId/profile`

**Access:** Admin/Super Admin can update any, User can update own

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**URL Parameters:**
- `userId` - User's UUID

**Body (raw JSON):**
```json
{
  "firstName": "Updated",
  "lastName": "Name",
  "image": "https://example.com/avatar.jpg"
}
```

**All fields are optional:**
- `firstName` - First name (2-50 chars)
- `lastName` - Last name (2-50 chars)
- `image` - Profile image URL

**Success Response (200):**
```json
{
  "message": "User profile updated successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "Updated",
    "lastName": "Name",
    "name": "Updated Name",
    "image": "https://example.com/avatar.jpg",
    "role": "USER",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 13. Delete User

**Method:** `DELETE`  
**URL:** `http://localhost:5000/api/users/:userId`

**Access:** Super Admin only

**Headers:**
```
Authorization: Bearer <super_admin_token>
```

**URL Parameters:**
- `userId` - User's UUID

**Body:** None

**Success Response (200):**
```json
{
  "message": "User deleted successfully"
}
```

**Error Response (400) - Cannot Delete Self:**
```json
{
  "error": {
    "message": "You cannot delete your own account",
    "code": "CANNOT_DELETE_SELF"
  }
}
```

---

## 🧪 TEST CREDENTIALS

### Super Admin (Can make users admin)
- **Email:** `superadmin@ebookathena.com`
- **Password:** `SuperAdmin@1234`
- **Role:** `SUPER_ADMIN`

### Admin
- **Email:** `admin@ebookathena.com`
- **Password:** `Admin@1234`
- **Role:** `ADMIN`

### Regular User
- **Email:** `john.doe@example.com`
- **Password:** `Password123`
- **Role:** `USER`

---

## 📋 QUICK WORKFLOW: Make User Admin

### Step 1: Login as Super Admin
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "superadmin@ebookathena.com",
  "password": "SuperAdmin@1234"
}
```
**Copy the `accessToken` from response!**

### Step 2: Get All Users (to find userId)
```
GET http://localhost:5000/api/users
Authorization: Bearer <super_admin_token>
```
**Find the user you want to make admin and copy their `id`**

### Step 3: Update User Role to Admin
```
PATCH http://localhost:5000/api/users/{userId}/role
Authorization: Bearer <super_admin_token>
Content-Type: application/json

{
  "role": "ADMIN"
}
```

---

## 📊 ENDPOINT SUMMARY TABLE

| # | Method | Endpoint | Access | Description |
|---|--------|----------|--------|-------------|
| 1 | POST | `/api/auth/signup` | Public | Register new user |
| 2 | POST | `/api/auth/login` | Public | Login user |
| 3 | POST | `/api/auth/logout` | Private | Logout user |
| 4 | GET | `/api/auth/me` | Private | Get current user |
| 5 | POST | `/api/auth/verify-email` | Public | Verify email |
| 6 | POST | `/api/auth/forgot-password` | Public | Request password reset |
| 7 | POST | `/api/auth/reset-password` | Public | Reset password |
| 8 | POST | `/api/auth/refresh` | Public | Refresh access token |
| 9 | GET | `/api/users` | Super Admin | Get all users |
| 10 | GET | `/api/users/:userId` | All | Get user by ID |
| 11 | PATCH | `/api/users/:userId/role` | Super Admin | ⭐ Update user role |
| 12 | PATCH | `/api/users/:userId/profile` | All | Update user profile |
| 13 | DELETE | `/api/users/:userId` | Super Admin | Delete user |

---

## ⚠️ COMMON ERROR CODES

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Request validation failed |
| `USER_EXISTS` | User with email already exists |
| `INVALID_CREDENTIALS` | Wrong email or password |
| `UNAUTHORIZED` | Missing or invalid authentication token |
| `FORBIDDEN` | Insufficient permissions (not Super Admin) |
| `TOKEN_EXPIRED` | Access token has expired |
| `INVALID_TOKEN` | Invalid token format |
| `CANNOT_CHANGE_OWN_ROLE` | Cannot change your own role |
| `INVALID_ROLE` | Invalid role value |
| `LAST_SUPER_ADMIN` | Cannot remove last Super Admin |
| `USER_NOT_FOUND` | User does not exist |

---

## 📝 NOTES

1. **Token Usage:** After login, copy the `accessToken` and use it in `Authorization: Bearer <token>` header for protected routes.

2. **Role Hierarchy:**
   - `SUPER_ADMIN` - Can manage all users and roles
   - `ADMIN` - Can manage content (set by Super Admin)
   - `USER` - Regular user (default for new signups)

3. **Password Requirements:**
   - Minimum 8 characters
   - At least one uppercase letter
   - At least one lowercase letter
   - At least one number

4. **Name Requirements:**
   - 2-50 characters
   - Only letters, spaces, hyphens, and apostrophes

5. **Security Features:**
   - Cannot change your own role
   - Cannot delete your own account
   - Cannot remove the last SUPER_ADMIN
   - HTTP-only cookies for token storage

6. **Postman Environment Variables (Optional):**
   - `base_url`: `http://localhost:5000`
   - `access_token`: (set after login)
   - `super_admin_token`: (set after super admin login)

---

## 🎯 POSTMAN COLLECTION EXAMPLES

### Example 1: Signup
```
POST {{base_url}}/api/auth/signup
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Test1234",
  "firstName": "Test",
  "lastName": "User"
}
```

### Example 2: Login as Super Admin
```
POST {{base_url}}/api/auth/login
Content-Type: application/json

{
  "email": "superadmin@ebookathena.com",
  "password": "SuperAdmin@1234"
}
```

### Example 3: Make User Admin
```
PATCH {{base_url}}/api/users/{userId}/role
Authorization: Bearer {{super_admin_token}}
Content-Type: application/json

{
  "role": "ADMIN"
}
```

### Example 4: Get All Users
```
GET {{base_url}}/api/users
Authorization: Bearer {{super_admin_token}}
```

### Example 5: Get Current User
```
GET {{base_url}}/api/auth/me
Authorization: Bearer {{access_token}}
```

---

**All endpoints are ready to test in Postman! 🚀**

