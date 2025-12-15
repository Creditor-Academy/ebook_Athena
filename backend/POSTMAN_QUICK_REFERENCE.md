# Postman Quick Reference - Auth APIs

## Base URL
```
http://localhost:5000
```

---

## 🔵 1. SIGNUP / REGISTER

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

**Expected Response:** 201 Created
```json
{
  "message": "User registered successfully",
  "user": { ... },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 🟢 2. LOGIN

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

**Expected Response:** 200 OK
```json
{
  "message": "Login successful",
  "user": { ... },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**💡 Copy the `accessToken` for logout and other protected routes!**

---

## 🔴 3. LOGOUT

**Method:** `POST`  
**URL:** `http://localhost:5000/api/auth/logout`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <paste_accessToken_here>
```

**Body:** None (leave empty)

**Expected Response:** 200 OK
```json
{
  "message": "Logout successful"
}
```

---

## 📋 4. GET CURRENT USER (Optional Test)

**Method:** `GET`  
**URL:** `http://localhost:5000/api/auth/me`

**Headers:**
```
Authorization: Bearer <paste_accessToken_here>
```

**Body:** None

**Expected Response:** 200 OK
```json
{
  "user": {
    "id": "...",
    "email": "...",
    "firstName": "...",
    "lastName": "...",
    ...
  }
}
```

---

## 🧪 Test with Seeded Users

### Admin
```
Email: admin@ebookathena.com
Password: Admin@1234
```

### Regular User
```
Email: john.doe@example.com
Password: Password123
```

---

## ⚠️ Common Issues

1. **401 Unauthorized on Logout/Me:**
   - Make sure you copied the `accessToken` from login response
   - Use format: `Authorization: Bearer <token>`

2. **400 Validation Error:**
   - Password must be 8+ chars with uppercase, lowercase, and number
   - First/Last name must be 2-50 characters

3. **409 User Exists:**
   - Email already registered, try different email or login instead

