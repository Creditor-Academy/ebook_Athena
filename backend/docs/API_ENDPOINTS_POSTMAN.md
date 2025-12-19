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

### 6. Resend Verification Email

**Method:** `POST`  
**URL:** `http://localhost:5000/api/auth/resend-verification`

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
  "message": "If an account exists with this email, a verification link has been sent"
}
```

**Note:** This endpoint doesn't reveal whether the email exists or is already verified (security best practice).

---

### 7. Forgot Password

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

### 8. Reset Password

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

### 9. Refresh Token

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

## 📚 BOOKS ENDPOINTS

### 14. Create Book (Admin Only)

**Method:** `POST`  
**URL:** `http://localhost:5000/api/books`

**Access:** Admin/Super Admin only

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "description": "A classic American novel about the Jazz Age.",
  "shortDescription": "A classic American novel",
  "price": 9.99,
  "coverImageUrl": "https://s3.amazonaws.com/bucket/covers/great-gatsby.jpg",
  "bookFileUrl": "https://s3.amazonaws.com/bucket/books/great-gatsby.epub",
  "category": "Fiction",
  "rating": 4.5,
  "recommended": true
}
```

**Field Requirements:**
- `title`: Required, 1-200 characters
- `author`: Required, 1-100 characters
- `bookFileUrl`: Required, valid URL (S3 URL for EPUB file)
- `price`: Required, non-negative number
- `description`: Optional, max 5000 characters
- `shortDescription`: Optional, max 500 characters
- `coverImageUrl`: Optional, valid URL (S3 URL for cover image)
- `category`: Optional, max 50 characters
- `rating`: Optional, 0-5
- `recommended`: Optional, boolean

**Success Response (201):**
```json
{
  "message": "Book created successfully",
  "book": {
    "id": "uuid",
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "description": "A classic American novel about the Jazz Age.",
    "shortDescription": "A classic American novel",
    "price": "9.99",
    "coverImageUrl": "https://s3.amazonaws.com/bucket/covers/great-gatsby.jpg",
    "bookFileUrl": "https://s3.amazonaws.com/bucket/books/great-gatsby.epub",
    "category": "Fiction",
    "rating": 4.5,
    "downloads": 0,
    "recommended": true,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Response (403) - Not Admin:**
```json
{
  "error": {
    "message": "Insufficient permissions",
    "code": "FORBIDDEN"
  }
}
```

---

### 15. Upload Book with Files (Admin Only)

**Method:** `POST`  
**URL:** `http://localhost:5000/api/books/upload`

**Access:** Admin/Super Admin only

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
```

**Body (form-data):**
- `title`: Text (required) - Book title
- `author`: Text (required) - Book author
- `description`: Text (optional) - Full description
- `shortDescription`: Text (optional) - Short description
- `price`: Number (required) - Book price
- `category`: Text (optional) - Book category
- `rating`: Number (optional) - Rating (0-5)
- `recommended`: Boolean (optional) - Whether book is recommended
- `epub`: File (required) - EPUB file (max 50MB)
- `cover`: File (optional) - Cover image (max 5MB, JPEG/PNG/WebP)

**File Requirements:**
- **EPUB file**: Required, max 50MB, must be `.epub` format
- **Cover image**: Optional, max 5MB, must be JPEG, PNG, or WebP

**Success Response (201):**
```json
{
  "message": "Book uploaded and created successfully",
  "book": {
    "id": "uuid",
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "description": "A classic American novel about the Jazz Age.",
    "shortDescription": "A classic American novel",
    "price": "9.99",
    "coverImageUrl": "https://bucket-name.s3.region.amazonaws.com/covers/cover_1234567890_abc123.jpg",
    "bookFileUrl": "https://bucket-name.s3.region.amazonaws.com/books/book_1234567890_def456.epub",
    "category": "Fiction",
    "rating": 4.5,
    "downloads": 0,
    "recommended": true,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Response (400) - Missing EPUB:**
```json
{
  "error": {
    "message": "EPUB file is required",
    "code": "VALIDATION_ERROR"
  }
}
```

**Error Response (400) - File Too Large:**
```json
{
  "error": {
    "message": "File size exceeds the maximum allowed size",
    "code": "FILE_TOO_LARGE"
  }
}
```

**Error Response (400) - Invalid File Type:**
```json
{
  "error": {
    "message": "Invalid file type. Only EPUB files (.epub) are allowed.",
    "code": "UPLOAD_ERROR"
  }
}
```

**Note:** 
- Files are automatically uploaded to S3
- Files are stored in `books/` folder (EPUB) and `covers/` folder (images)
- File names are automatically generated with timestamps to prevent conflicts
- See `S3_SETUP.md` for AWS S3 configuration

---

### 16. Get All Books

**Method:** `GET`  
**URL:** `http://localhost:5000/api/books`

**Access:** Public

**Headers:** None required

**Query Parameters (all optional):**
- `category` - Filter by category (e.g., `?category=Fiction`)
- `recommended` - Filter recommended books (e.g., `?recommended=true`)
- `search` - Search in title, author, or description (e.g., `?search=gatsby`)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `sortBy` - Sort field: `createdAt`, `title`, `author`, `price`, `rating`, `downloads` (default: `createdAt`)
- `sortOrder` - Sort order: `asc` or `desc` (default: `desc`)

**Example URLs:**
```
GET http://localhost:5000/api/books
GET http://localhost:5000/api/books?category=Fiction&page=1&limit=10
GET http://localhost:5000/api/books?recommended=true&sortBy=rating&sortOrder=desc
GET http://localhost:5000/api/books?search=gatsby
```

**Success Response (200):**
```json
{
  "books": [
    {
      "id": "uuid",
      "title": "The Great Gatsby",
      "author": "F. Scott Fitzgerald",
      "description": "A classic American novel about the Jazz Age.",
      "shortDescription": "A classic American novel",
      "price": "9.99",
      "coverImageUrl": "https://s3.amazonaws.com/bucket/covers/great-gatsby.jpg",
      "category": "Fiction",
      "rating": 4.5,
      "downloads": 150,
      "recommended": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

**Note:** Only returns active books (`isActive: true`)

---

### 17. Get Book by ID

**Method:** `GET`  
**URL:** `http://localhost:5000/api/books/:id`

**Access:** Public (shows `bookFileUrl` only if user owns the book)

**Headers (optional):**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `id` - Book's UUID

**Body:** None

**Success Response (200) - Public (no auth):**
```json
{
  "book": {
    "id": "uuid",
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "description": "A classic American novel about the Jazz Age.",
    "shortDescription": "A classic American novel",
    "price": "9.99",
    "coverImageUrl": "https://s3.amazonaws.com/bucket/covers/great-gatsby.jpg",
    "category": "Fiction",
    "rating": 4.5,
    "downloads": 150,
    "recommended": true,
    "isActive": true,
    "owned": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Success Response (200) - User owns book (with auth):**
```json
{
  "book": {
    "id": "uuid",
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "description": "A classic American novel about the Jazz Age.",
    "shortDescription": "A classic American novel",
    "price": "9.99",
    "coverImageUrl": "https://s3.amazonaws.com/bucket/covers/great-gatsby.jpg",
    "bookFileUrl": "https://s3.amazonaws.com/bucket/books/great-gatsby.epub",
    "category": "Fiction",
    "rating": 4.5,
    "downloads": 150,
    "recommended": true,
    "isActive": true,
    "owned": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Response (404):**
```json
{
  "error": {
    "message": "Book not found",
    "code": "BOOK_NOT_FOUND"
  }
}
```

**Note:** The `bookFileUrl` is only returned if the authenticated user owns the book. The `owned` field indicates ownership status.

---

## 💳 PURCHASE ENDPOINTS

### 18. Purchase Book

**Method:** `POST`  
**URL:** `http://localhost:5000/api/purchase`

**Access:** Authenticated users only

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "bookId": "uuid-of-book"
}
```

**Field Requirements:**
- `bookId`: Required, valid UUID

**Success Response (201):**
```json
{
  "message": "Book purchased successfully",
  "purchase": {
    "id": "uuid",
    "book": {
      "id": "uuid",
      "title": "The Great Gatsby",
      "author": "F. Scott Fitzgerald",
      "coverImageUrl": "https://s3.amazonaws.com/bucket/covers/great-gatsby.jpg",
      "bookFileUrl": "https://s3.amazonaws.com/bucket/books/great-gatsby.epub"
    },
    "price": "9.99",
    "status": "COMPLETED",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Response (400) - Already Owned:**
```json
{
  "error": {
    "message": "You already own this book",
    "code": "ALREADY_OWNED"
  }
}
```

**Error Response (404) - Book Not Found:**
```json
{
  "error": {
    "message": "Book not found",
    "code": "BOOK_NOT_FOUND"
  }
}
```

**Error Response (400) - Book Inactive:**
```json
{
  "error": {
    "message": "Book is not available for purchase",
    "code": "BOOK_INACTIVE"
  }
}
```

**Note:** Payment gateway integration will be added later. Currently, purchases are created with `COMPLETED` status.

---

### 19. Get My Books (User's Purchased Books)

**Method:** `GET`  
**URL:** `http://localhost:5000/api/my-books`

**Access:** Authenticated users only

**Headers:**
```
Authorization: Bearer <token>
```

**Body:** None

**Success Response (200):**
```json
{
  "books": [
    {
      "id": "uuid",
      "title": "The Great Gatsby",
      "author": "F. Scott Fitzgerald",
      "description": "A classic American novel about the Jazz Age.",
      "shortDescription": "A classic American novel",
      "price": "9.99",
      "coverImageUrl": "https://s3.amazonaws.com/bucket/covers/great-gatsby.jpg",
      "bookFileUrl": "https://s3.amazonaws.com/bucket/books/great-gatsby.epub",
      "category": "Fiction",
      "rating": 4.5,
      "downloads": 150,
      "recommended": true,
      "purchasedAt": "2024-01-01T00:00:00.000Z",
      "purchasePrice": "9.99",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

**Note:** Returns all books purchased by the authenticated user, sorted by purchase date (newest first).

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
| 6 | POST | `/api/auth/resend-verification` | Public | Resend verification email |
| 7 | POST | `/api/auth/forgot-password` | Public | Request password reset |
| 8 | POST | `/api/auth/reset-password` | Public | Reset password |
| 9 | POST | `/api/auth/refresh` | Public | Refresh access token |
| 10 | GET | `/api/users` | Super Admin | Get all users |
| 11 | GET | `/api/users/:userId` | All | Get user by ID |
| 12 | PATCH | `/api/users/:userId/role` | Super Admin | ⭐ Update user role |
| 13 | PATCH | `/api/users/:userId/profile` | All | Update user profile |
| 14 | DELETE | `/api/users/:userId` | Super Admin | Delete user |
| 15 | POST | `/api/books` | Admin/Super Admin | Create new book (with S3 URLs) |
| 16 | POST | `/api/books/upload` | Admin/Super Admin | Upload book with files |
| 17 | GET | `/api/books` | Public | Get all books (with filters) |
| 18 | GET | `/api/books/:id` | Public | Get book by ID |
| 19 | POST | `/api/purchase` | Private | Purchase a book |
| 20 | GET | `/api/my-books` | Private | Get user's purchased books |

---

## ⚠️ COMMON ERROR CODES

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Request validation failed |
| `USER_EXISTS` | User with email already exists |
| `INVALID_CREDENTIALS` | Wrong email or password |
| `UNAUTHORIZED` | Missing or invalid authentication token |
| `FORBIDDEN` | Insufficient permissions (not Admin/Super Admin) |
| `TOKEN_EXPIRED` | Access token has expired |
| `INVALID_TOKEN` | Invalid token format |
| `CANNOT_CHANGE_OWN_ROLE` | Cannot change your own role |
| `INVALID_ROLE` | Invalid role value |
| `LAST_SUPER_ADMIN` | Cannot remove last Super Admin |
| `USER_NOT_FOUND` | User does not exist |
| `BOOK_NOT_FOUND` | Book does not exist |
| `BOOK_INACTIVE` | Book is not available for purchase |
| `ALREADY_OWNED` | User already owns this book |
| `CREATE_BOOK_ERROR` | Failed to create book |
| `GET_BOOKS_ERROR` | Failed to fetch books |
| `GET_BOOK_ERROR` | Failed to fetch book |
| `PURCHASE_ERROR` | Failed to purchase book |
| `GET_MY_BOOKS_ERROR` | Failed to fetch user's books |

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

7. **Email Verification (SendGrid):**
   - Verification emails are automatically sent on signup
   - Emails contain a link to verify the user's email address
   - Links expire after 24 hours
   - Use `/api/auth/resend-verification` to resend verification email
   - **Setup Required:** Add `SENDGRID_API_KEY` to your `.env` file

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

### Example 6: Create Book with S3 URLs (Admin)
```
POST {{base_url}}/api/books
Authorization: Bearer {{admin_token}}
Content-Type: application/json

{
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "description": "A classic American novel about the Jazz Age.",
  "shortDescription": "A classic American novel",
  "price": 9.99,
  "coverImageUrl": "https://s3.amazonaws.com/bucket/covers/great-gatsby.jpg",
  "bookFileUrl": "https://s3.amazonaws.com/bucket/books/great-gatsby.epub",
  "category": "Fiction",
  "rating": 4.5,
  "recommended": true
}
```

### Example 6b: Upload Book with Files (Admin)
```
POST {{base_url}}/api/books/upload
Authorization: Bearer {{admin_token}}
Content-Type: multipart/form-data

Form Data:
- title: "The Great Gatsby"
- author: "F. Scott Fitzgerald"
- description: "A classic American novel about the Jazz Age."
- shortDescription: "A classic American novel"
- price: 9.99
- category: "Fiction"
- rating: 4.5
- recommended: true
- epub: [select EPUB file]
- cover: [select image file]
```

### Example 7: Get All Books
```
GET {{base_url}}/api/books?category=Fiction&page=1&limit=10
```

### Example 8: Get Book by ID
```
GET {{base_url}}/api/books/{bookId}
```

### Example 9: Purchase Book
```
POST {{base_url}}/api/purchase
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "bookId": "uuid-of-book"
}
```

### Example 10: Get My Books
```
GET {{base_url}}/api/my-books
Authorization: Bearer {{access_token}}
```

---

## 📚 BOOKS API WORKFLOW

### Step 1: Create a Book (Admin)

**Option A: Upload Files Directly (Recommended)**
1. Login as Admin/Super Admin
2. Upload book using `/api/books/upload` endpoint with files
3. Files are automatically uploaded to S3
4. Copy the book `id` from response

**Option B: Provide S3 URLs**
1. Login as Admin/Super Admin
2. Upload files to S3 manually (or use another service)
3. Create a book with S3 URLs using `/api/books` endpoint
4. Copy the book `id` from response

### Step 2: Browse Books (Public)
1. Get all books: `GET /api/books`
2. Filter by category: `GET /api/books?category=Fiction`
3. Search books: `GET /api/books?search=gatsby`
4. Get book details: `GET /api/books/:id`

### Step 3: Purchase a Book (User)
1. Login as regular user
2. Purchase book: `POST /api/purchase` with `bookId`
3. View purchased books: `GET /api/my-books`

### Step 4: Access Book File (User)
1. Get book details with auth token: `GET /api/books/:id`
2. If user owns the book, `bookFileUrl` will be included in response
3. Use the `bookFileUrl` to download/read the book from S3

---

**All endpoints are ready to test in Postman! 🚀**

