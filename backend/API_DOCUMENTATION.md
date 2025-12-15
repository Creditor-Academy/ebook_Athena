# Authentication API Documentation for Postman

## Base URL
```
http://localhost:5000
```

## 1. Register / Signup

**Endpoint:** `POST /api/auth/signup`

**Description:** Register a new user with email and password

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Field Requirements:**
- `email`: Valid email address (required)
- `password`: Minimum 8 characters, must contain uppercase, lowercase, and number (required)
- `firstName`: 2-50 characters, letters/spaces/hyphens/apostrophes only (required)
- `lastName`: 2-50 characters, letters/spaces/hyphens/apostrophes only (required)

**Success Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "name": "John Doe",
    "emailVerified": false,
    "role": "USER",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "verificationToken": "abc123..." // Only in development
}
```

**Error Response (409) - User Already Exists:**
```json
{
  "error": {
    "message": "User with this email already exists",
    "code": "USER_EXISTS"
  }
}
```

**Error Response (400) - Validation Error:**
```json
{
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "type": "field",
        "msg": "Password must be at least 8 characters long",
        "path": "password",
        "location": "body"
      }
    ]
  }
}
```

---

## 2. Login

**Endpoint:** `POST /api/auth/login`

**Description:** Login user with email and password

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```

**Field Requirements:**
- `email`: Valid email address (required)
- `password`: User's password (required)

**Success Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
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

**Note:** The response also sets HTTP-only cookies:
- `accessToken` (7 days)
- `refreshToken` (30 days)

**Error Response (401) - Invalid Credentials:**
```json
{
  "error": {
    "message": "Invalid email or password",
    "code": "INVALID_CREDENTIALS"
  }
}
```

**Error Response (401) - OAuth Required:**
```json
{
  "error": {
    "message": "Please sign in with Google",
    "code": "OAUTH_REQUIRED"
  }
}
```

---

## 3. Logout

**Endpoint:** `POST /api/auth/logout`

**Description:** Logout user and clear session

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <accessToken>
```

**OR using Cookie:**
```
Content-Type: application/json
Cookie: accessToken=<token>
```

**Request Body:** None (empty body)

**Success Response (200):**
```json
{
  "message": "Logout successful"
}
```

**Error Response (401) - Unauthorized:**
```json
{
  "error": {
    "message": "Authentication required",
    "code": "UNAUTHORIZED"
  }
}
```

---

## 4. Get Current User (Bonus)

**Endpoint:** `GET /api/auth/me`

**Description:** Get current authenticated user's information

**Headers:**
```
Authorization: Bearer <accessToken>
```

**OR using Cookie:**
```
Cookie: accessToken=<token>
```

**Request Body:** None

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

## Postman Collection Setup

### Environment Variables (Optional)
Create a Postman environment with:
- `base_url`: `http://localhost:5000`
- `access_token`: (will be set after login)

### Quick Test Examples

#### 1. Signup Request
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

#### 2. Login Request
```
POST {{base_url}}/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Test1234"
}
```

#### 3. Logout Request
```
POST {{base_url}}/api/auth/logout
Authorization: Bearer {{access_token}}
Content-Type: application/json
```

#### 4. Get Current User
```
GET {{base_url}}/api/auth/me
Authorization: Bearer {{access_token}}
```

---

## Test Credentials (From Seed)

### Admin User
- **Email:** `admin@ebookathena.com`
- **Password:** `Admin@1234`

### Regular Users
- **Email:** `john.doe@example.com`
- **Password:** `Password123`

- **Email:** `jane.smith@example.com`
- **Password:** `Password123`

---

## Common Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Request validation failed |
| `USER_EXISTS` | User with email already exists |
| `INVALID_CREDENTIALS` | Wrong email or password |
| `UNAUTHORIZED` | Missing or invalid authentication token |
| `TOKEN_EXPIRED` | Access token has expired |
| `INVALID_TOKEN` | Invalid token format |

---

## Notes

1. **Cookies:** The API sets HTTP-only cookies for security. In Postman, enable "Send cookies automatically" in Settings.

2. **Token Storage:** After login, copy the `accessToken` from the response and use it in the `Authorization: Bearer <token>` header for protected routes.

3. **CORS:** The API allows requests from `http://localhost:5173` by default. For Postman, this doesn't matter.

4. **Password Requirements:**
   - Minimum 8 characters
   - At least one uppercase letter
   - At least one lowercase letter
   - At least one number

5. **Name Requirements:**
   - 2-50 characters
   - Only letters, spaces, hyphens, and apostrophes

