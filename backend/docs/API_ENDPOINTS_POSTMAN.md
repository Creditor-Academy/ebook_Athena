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

**Important:** 
- The `userId` is **automatically extracted** from the authenticated user's token
- You **DO NOT** need to send `userId` in the request body
- The system automatically tracks which user uploaded the book based on the authentication token

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

**Note:** Do NOT include `userId` in the form-data. It is automatically set from the authenticated user.

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
    "coverImageUrl": "https://bucket-name.s3.region.amazonaws.com/users/{user-id}/covers/cover_1234567890_abc123.jpg",
    "bookFileUrl": "https://bucket-name.s3.region.amazonaws.com/users/{user-id}/books/book_1234567890_def456.epub",
    "category": "Fiction",
    "rating": 4.5,
    "downloads": 0,
    "recommended": true,
    "isActive": true,
    "userId": "user-uuid",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "chapters": [
      {
        "id": "chapter-uuid-1",
        "title": "Chapter 1: Introduction",
        "order": 1,
        "href": "OEBPS/chapter1.xhtml",
        "cfi": null,
        "position": 0
      }
    ]
  },
  "chapters": [
    {
      "id": "chapter-uuid-1",
      "title": "Chapter 1: Introduction",
      "order": 1,
      "href": "OEBPS/chapter1.xhtml",
      "cfi": null,
      "position": 0
    }
  ],
  "totalChapters": 1
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

**How userId Works:**
1. User sends request with `Authorization: Bearer <token>` header
2. The `authenticate` middleware extracts user information from the token
3. The system automatically sets `req.userId` from the authenticated user
4. The `userId` is used to:
   - Organize files in S3: `users/{user-id}/books/` and `users/{user-id}/covers/`
   - Store in database to track which user uploaded the book
5. **You don't need to send userId in the request body** - it's handled automatically!

**Note:** 
- Files are automatically uploaded to S3
- Files are organized by user ID: `users/{user-id}/books/` (EPUB) and `users/{user-id}/covers/` (images)
- All books uploaded by the same author/user go in the same folder
- File names are automatically generated with timestamps to prevent conflicts
- The `userId` field in the response shows which user uploaded the book (automatically set from authenticated user)
- **Chapters are automatically extracted from the EPUB file** during upload and stored in the database
- The response includes `chapters` array and `totalChapters` count
- If chapter extraction fails, the book is still created (with empty chapters array)
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

### 17. Get Popular Books (Most Purchased)

**Method:** `GET`  
**URL:** `http://localhost:5000/api/books/popular`

**Access:** Public (no authentication required)

**Headers:** None required

**Query Parameters:**
- `limit` (optional) - Maximum number of books to return (default: 6)

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
      "category": "Fiction",
      "rating": 4.5,
      "downloads": 150,
      "recommended": true,
      "purchaseCount": 45,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": "uuid-2",
      "title": "To Kill a Mockingbird",
      "author": "Harper Lee",
      "description": "A gripping tale of racial injustice.",
      "shortDescription": "A gripping tale",
      "price": "8.99",
      "coverImageUrl": "https://s3.amazonaws.com/bucket/covers/mockingbird.jpg",
      "category": "Fiction",
      "rating": 4.8,
      "downloads": 200,
      "recommended": false,
      "purchaseCount": 38,
      "createdAt": "2024-01-02T00:00:00.000Z",
      "updatedAt": "2024-01-02T00:00:00.000Z"
    }
  ],
  "count": 2,
  "message": "Popular books retrieved successfully"
}
```

**Success Response (200) - No books with purchases:**
```json
{
  "books": [],
  "count": 0,
  "message": "Popular books retrieved successfully"
}
```

**Error Response (500):**
```json
{
  "error": {
    "message": "Failed to fetch popular books",
    "code": "GET_POPULAR_BOOKS_ERROR"
  }
}
```

**Notes:**
- Returns books sorted by purchase count (most purchased first)
- Only includes books that have at least one COMPLETED purchase
- Only returns active books (`isActive: true`)
- The `purchaseCount` field indicates the number of completed purchases for each book
- Use this endpoint to display the "Popular Books" section on the homepage
- If no books have been purchased, returns an empty array

**Example Usage:**
```
GET http://localhost:5000/api/books/popular?limit=6
```

---

### 18. Get Book by ID

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

### 18. Get Book Chapters (Table of Contents)

**Method:** `GET`  
**URL:** `http://localhost:5000/api/books/:id/chapters`

**Access:** Public (no authentication required)

**Headers:** None required

**URL Parameters:**
- `id` - Book's UUID

**Body:** None

**Success Response (200):**
```json
{
  "book": {
    "id": "uuid",
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald"
  },
  "chapters": [
    {
      "id": "chapter-uuid-1",
      "title": "Chapter 1: Introduction",
      "order": 1,
      "href": "OEBPS/chapter1.xhtml",
      "cfi": null,
      "position": 0
    },
    {
      "id": "chapter-uuid-2",
      "title": "Chapter 2: The Journey Begins",
      "order": 2,
      "href": "OEBPS/chapter2.xhtml",
      "cfi": null,
      "position": 0.5
    },
    {
      "id": "chapter-uuid-3",
      "title": "Chapter 3: Conclusion",
      "order": 3,
      "href": "OEBPS/chapter3.xhtml",
      "cfi": null,
      "position": 1
    }
  ],
  "totalChapters": 3
}
```

**Error Response (404) - Book not found:**
```json
{
  "error": {
    "message": "Book not found",
    "code": "BOOK_NOT_FOUND"
  }
}
```

**Error Response (500):**
```json
{
  "error": {
    "message": "Failed to fetch chapters",
    "code": "GET_CHAPTERS_ERROR"
  }
}
```

**Notes:**
- Chapters are automatically extracted from EPUB files when a book is uploaded
- Chapters are returned in order (by `order` field, ascending)
- `href` is the EPUB internal reference for navigation
- `position` is a value from 0.0 to 1.0 indicating the chapter's position in the book
- `cfi` (Canonical Fragment Identifier) can be used for precise EPUB navigation (may be null if not calculated)
- Use this endpoint to display a table of contents/index for e-book navigation

**Example Usage:**
```javascript
// Fetch chapters for a book
fetch('http://localhost:5000/api/books/123e4567-e89b-12d3-a456-426614174000/chapters')
  .then(res => res.json())
  .then(data => {
    console.log(`Book: ${data.book.title}`);
    console.log(`Total chapters: ${data.totalChapters}`);
    data.chapters.forEach(chapter => {
      console.log(`${chapter.order}. ${chapter.title}`);
    });
  });
```

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

## ❤️ WISHLIST ENDPOINTS

### 20. Add Book to Wishlist

**Method:** `POST`  
**URL:** `http://localhost:5000/api/wishlist`

**Access:** Authenticated users only

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "bookId": "uuid-of-book"
}
```

**Success Response (201):**
```json
{
  "message": "Book added to wishlist successfully",
  "wishlistItem": {
    "id": "wishlist-uuid",
    "book": {
      "id": "book-uuid",
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
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "addedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Response (400) - Already in Wishlist:**
```json
{
  "error": {
    "message": "Book is already in your wishlist",
    "code": "ALREADY_IN_WISHLIST"
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

---

### 21. Remove Book from Wishlist

**Method:** `DELETE`  
**URL:** `http://localhost:5000/api/wishlist/:bookId`

**Access:** Authenticated users only

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `bookId` - Book's UUID

**Success Response (200):**
```json
{
  "message": "Book removed from wishlist successfully"
}
```

**Error Response (404) - Not in Wishlist:**
```json
{
  "error": {
    "message": "Book is not in your wishlist",
    "code": "NOT_IN_WISHLIST"
  }
}
```

---

### 22. Get User's Wishlist

**Method:** `GET`  
**URL:** `http://localhost:5000/api/wishlist`

**Access:** Authenticated users only

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters (all optional):**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `sortBy` - Sort field: `createdAt`, `title`, `author`, `price`, `rating` (default: `createdAt`)
- `sortOrder` - Sort order: `asc` or `desc` (default: `desc`)

**Example URLs:**
```
GET http://localhost:5000/api/wishlist
GET http://localhost:5000/api/wishlist?page=1&limit=10
GET http://localhost:5000/api/wishlist?sortBy=title&sortOrder=asc
```

**Success Response (200):**
```json
{
  "books": [
    {
      "id": "book-uuid",
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
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "addedToWishlistAt": "2024-01-15T00:00:00.000Z",
      "wishlistId": "wishlist-uuid"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

---

### 23. Check Wishlist Status

**Method:** `GET`  
**URL:** `http://localhost:5000/api/wishlist/check/:bookId`

**Access:** Authenticated users only

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `bookId` - Book's UUID

**Success Response (200):**
```json
{
  "isInWishlist": true,
  "addedAt": "2024-01-15T00:00:00.000Z"
}
```

**If not in wishlist:**
```json
{
  "isInWishlist": false,
  "addedAt": null
}
```

---

### 24. Get Wishlist Count

**Method:** `GET`  
**URL:** `http://localhost:5000/api/wishlist/count`

**Access:** Authenticated users only

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "count": 5
}
```

**Note:** Returns the total number of books in the user's wishlist. Useful for displaying a badge count.

---

## 🛒 CART ENDPOINTS

### 25. Add Book to Cart

**Method:** `POST`  
**URL:** `http://localhost:5000/api/cart`

**Access:** Authenticated users only

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "bookId": "uuid-of-book",
  "quantity": 1
}
```

**Field Requirements:**
- `bookId`: Required, UUID of the book
- `quantity`: Optional, default is 1 (must be at least 1)

**Success Response (201) - New Item:**
```json
{
  "message": "Book added to cart successfully",
  "cartItem": {
    "id": "cart-uuid",
    "book": {
      "id": "book-uuid",
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
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "quantity": 1,
    "price": "9.99",
    "itemTotal": 9.99,
    "addedAt": "2024-01-15T00:00:00.000Z"
  }
}
```

**Success Response (200) - Quantity Updated:**
```json
{
  "message": "Cart item quantity updated successfully",
  "cartItem": {
    "id": "cart-uuid",
    "book": { ... },
    "quantity": 2,
    "price": "9.99",
    "itemTotal": 19.98,
    "addedAt": "2024-01-15T00:00:00.000Z",
    "updatedAt": "2024-01-15T01:00:00.000Z"
  }
}
```

**Error Response (400) - Book Inactive:**
```json
{
  "error": {
    "message": "Book is not available",
    "code": "BOOK_INACTIVE"
  }
}
```

**Note:** 
- If the book is already in cart, the quantity is increased instead of creating a duplicate
- Book price is stored at the time of adding to cart (price snapshot)
- Price is fetched from the book model

---

### 26. Remove Book from Cart

**Method:** `DELETE`  
**URL:** `http://localhost:5000/api/cart/:bookId`

**Access:** Authenticated users only

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `bookId` - Book's UUID

**Success Response (200):**
```json
{
  "message": "Book removed from cart successfully"
}
```

**Error Response (404) - Not in Cart:**
```json
{
  "error": {
    "message": "Book is not in your cart",
    "code": "NOT_IN_CART"
  }
}
```

---

### 27. Update Cart Item Quantity

**Method:** `PATCH`  
**URL:** `http://localhost:5000/api/cart/:bookId`

**Access:** Authenticated users only

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**URL Parameters:**
- `bookId` - Book's UUID

**Body (JSON):**
```json
{
  "quantity": 3
}
```

**Success Response (200):**
```json
{
  "message": "Cart item updated successfully",
  "cartItem": {
    "id": "cart-uuid",
    "book": { ... },
    "quantity": 3,
    "price": "9.99",
    "itemTotal": 29.97,
    "updatedAt": "2024-01-15T01:00:00.000Z"
  }
}
```

---

### 28. Get User's Cart with Total Pricing

**Method:** `GET`  
**URL:** `http://localhost:5000/api/cart`

**Access:** Authenticated users only

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "items": [
    {
      "id": "cart-uuid-1",
      "book": {
        "id": "book-uuid-1",
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
        "createdAt": "2024-01-01T00:00:00.000Z"
      },
      "quantity": 1,
      "price": "9.99",
      "itemTotal": 9.99,
      "addedAt": "2024-01-15T00:00:00.000Z",
      "updatedAt": "2024-01-15T00:00:00.000Z"
    },
    {
      "id": "cart-uuid-2",
      "book": {
        "id": "book-uuid-2",
        "title": "To Kill a Mockingbird",
        "author": "Harper Lee",
        "price": "12.99",
        ...
      },
      "quantity": 2,
      "price": "12.99",
      "itemTotal": 25.98,
      "addedAt": "2024-01-15T01:00:00.000Z",
      "updatedAt": "2024-01-15T01:00:00.000Z"
    }
  ],
  "summary": {
    "subtotal": 35.97,
    "platformCharge": 5.00,
    "total": 40.97
  },
  "itemCount": 2,
  "totalQuantity": 3
}
```

**Pricing Breakdown:**
- **Subtotal**: Sum of all book prices × quantities
- **Platform Charge**: Fixed at $5.00 USD
- **Total**: Subtotal + Platform Charge

**Note:** 
- Book prices are fetched from the book model at the time of adding to cart
- Prices are stored in cart (snapshot) to prevent price changes affecting cart
- Platform charge is fixed at $5.00 USD

---

### 29. Clear Cart

**Method:** `DELETE`  
**URL:** `http://localhost:5000/api/cart`

**Access:** Authenticated users only

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "message": "Cart cleared successfully"
}
```

**Note:** Removes all items from the user's cart.

---

### 30. Get Cart Count

**Method:** `GET`  
**URL:** `http://localhost:5000/api/cart/count`

**Access:** Authenticated users only

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "itemCount": 3,
  "totalQuantity": 5
}
```

**Note:** 
- `itemCount`: Number of unique books in cart
- `totalQuantity`: Total quantity of all books (sum of all quantities)
- Useful for displaying cart badge count

---

## 🔖 BOOKMARK ENDPOINTS

### 31. Add Bookmark (Reading Position)

**Method:** `POST`  
**URL:** `http://localhost:5000/api/bookmarks`

**Access:** Authenticated users only (must own the book)

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "bookId": "uuid-of-book",
  "pageNumber": 42,
  "chapter": "Chapter 3: The Journey Begins",
  "selectedText": "It was the best of times, it was the worst of times...",
  "cfi": "epubcfi(/6/4[chap01ref]!/4/2/2[heading01]/10)",
  "position": 0.35,
  "note": "Important quote about the era",
  "isLastPosition": true
}
```

**Field Requirements:**
- `bookId`: Required, UUID of the book
- `pageNumber`: Optional, page number where bookmark was created
- `chapter`: Optional, chapter or section name
- `selectedText`: Optional, the text/paragraph that was selected
- `cfi`: Optional, Canonical Fragment Identifier (EPUB standard position)
- `position`: Optional, numeric position (0.0 to 1.0 or specific offset)
- `note`: Optional, user note about this bookmark
- `isLastPosition`: Optional, mark as last reading position (default: false)

**Success Response (201):**
```json
{
  "message": "Bookmark created successfully",
  "bookmark": {
    "id": "bookmark-uuid",
    "userId": "user-uuid",
    "bookId": "book-uuid",
    "pageNumber": 42,
    "chapter": "Chapter 3: The Journey Begins",
    "selectedText": "It was the best of times, it was the worst of times...",
    "cfi": "epubcfi(/6/4[chap01ref]!/4/2/2[heading01]/10)",
    "position": 0.35,
    "note": "Important quote about the era",
    "isLastPosition": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "book": {
      "id": "book-uuid",
      "title": "A Tale of Two Cities",
      "author": "Charles Dickens",
      "coverImageUrl": "https://s3.amazonaws.com/bucket/covers/tale-two-cities.jpg"
    }
  }
}
```

**Error Response (403) - Book Not Owned:**
```json
{
  "error": {
    "message": "You must purchase the book before bookmarking",
    "code": "BOOK_NOT_OWNED"
  }
}
```

**Note:** 
- User must own the book (have purchased it) to create bookmarks
- If `isLastPosition` is true, it automatically unmarks other last positions for that book
- Multiple bookmarks can be created for the same book
- `cfi` is the EPUB standard way to reference exact positions in e-books

---

### 32. Get Bookmarks for a Book

**Method:** `GET`  
**URL:** `http://localhost:5000/api/bookmarks/book/:bookId`

**Access:** Authenticated users only (must own the book)

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `bookId` - Book's UUID

**Success Response (200):**
```json
{
  "bookmarks": [
    {
      "id": "bookmark-uuid-1",
      "userId": "user-uuid",
      "bookId": "book-uuid",
      "pageNumber": 42,
      "chapter": "Chapter 3: The Journey Begins",
      "selectedText": "It was the best of times...",
      "cfi": "epubcfi(/6/4[chap01ref]!/4/2/2[heading01]/10)",
      "position": 0.35,
      "note": "Important quote",
      "isLastPosition": true,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "book": {
        "id": "book-uuid",
        "title": "A Tale of Two Cities",
        "author": "Charles Dickens",
        "coverImageUrl": "https://s3.amazonaws.com/bucket/covers/tale-two-cities.jpg"
      }
    },
    {
      "id": "bookmark-uuid-2",
      "pageNumber": 15,
      "selectedText": "Another important passage...",
      "isLastPosition": false,
      ...
    }
  ],
  "count": 2
}
```

**Note:** 
- Returns all bookmarks for the specified book
- Last position bookmarks are listed first
- Then sorted by creation date (newest first)

---

### 33. Get All Bookmarks (User's Bookmarks)

**Method:** `GET`  
**URL:** `http://localhost:5000/api/bookmarks`

**Access:** Authenticated users only

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters (all optional):**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `bookId` - Filter by specific book ID

**Example URLs:**
```
GET http://localhost:5000/api/bookmarks
GET http://localhost:5000/api/bookmarks?page=1&limit=10
GET http://localhost:5000/api/bookmarks?bookId=book-uuid
```

**Success Response (200):**
```json
{
  "bookmarks": [
    {
      "id": "bookmark-uuid",
      "bookId": "book-uuid",
      "pageNumber": 42,
      "selectedText": "It was the best of times...",
      "isLastPosition": true,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "book": {
        "id": "book-uuid",
        "title": "A Tale of Two Cities",
        "author": "Charles Dickens",
        "coverImageUrl": "https://s3.amazonaws.com/bucket/covers/tale-two-cities.jpg"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

---

### 34. Get Last Reading Position

**Method:** `GET`  
**URL:** `http://localhost:5000/api/bookmarks/last-position/:bookId`

**Access:** Authenticated users only (must own the book)

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `bookId` - Book's UUID

**Success Response (200):**
```json
{
  "bookmark": {
    "id": "bookmark-uuid",
    "bookId": "book-uuid",
    "pageNumber": 42,
    "chapter": "Chapter 3: The Journey Begins",
    "selectedText": "It was the best of times, it was the worst of times...",
    "cfi": "epubcfi(/6/4[chap01ref]!/4/2/2[heading01]/10)",
    "position": 0.35,
    "note": "Important quote about the era",
    "isLastPosition": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "book": {
      "id": "book-uuid",
      "title": "A Tale of Two Cities",
      "author": "Charles Dickens",
      "coverImageUrl": "https://s3.amazonaws.com/bucket/covers/tale-two-cities.jpg"
    }
  },
  "isLastPosition": true
}
```

**Error Response (404) - No Position Found:**
```json
{
  "error": {
    "message": "No reading position found for this book",
    "code": "NO_POSITION_FOUND"
  }
}
```

**Note:** 
- Returns the bookmark marked as last position
- If no last position is marked, returns the most recent bookmark
- Useful for resuming reading from where user left off

---

### 35. Update Bookmark

**Method:** `PATCH`  
**URL:** `http://localhost:5000/api/bookmarks/:bookmarkId`

**Access:** Authenticated users only (can only update own bookmarks)

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**URL Parameters:**
- `bookmarkId` - Bookmark's UUID

**Body (JSON) - All fields optional:**
```json
{
  "pageNumber": 45,
  "chapter": "Chapter 4: New Developments",
  "selectedText": "Updated selected text...",
  "cfi": "epubcfi(/6/4[chap02ref]!/4/2/2[heading02]/10)",
  "position": 0.40,
  "note": "Updated note",
  "isLastPosition": true
}
```

**Success Response (200):**
```json
{
  "message": "Bookmark updated successfully",
  "bookmark": {
    "id": "bookmark-uuid",
    "pageNumber": 45,
    "selectedText": "Updated selected text...",
    "isLastPosition": true,
    "updatedAt": "2024-01-15T11:00:00.000Z",
    ...
  }
}
```

**Error Response (403) - Not Owner:**
```json
{
  "error": {
    "message": "You can only update your own bookmarks",
    "code": "FORBIDDEN"
  }
}
```

---

### 36. Delete Bookmark

**Method:** `DELETE`  
**URL:** `http://localhost:5000/api/bookmarks/:bookmarkId`

**Access:** Authenticated users only (can only delete own bookmarks)

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `bookmarkId` - Bookmark's UUID

**Success Response (200):**
```json
{
  "message": "Bookmark deleted successfully"
}
```

**Error Response (404) - Not Found:**
```json
{
  "error": {
    "message": "Bookmark not found",
    "code": "BOOKMARK_NOT_FOUND"
  }
}
```

---

## 🎨 HIGHLIGHTS API

### 37. Add Highlight (Text Selection with Color)

**Method:** `POST`  
**URL:** `http://localhost:5000/api/highlights`

**Access:** Authenticated users only (must own the book)

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "bookId": "uuid-of-book",
  "selectedText": "This is the text that was highlighted by the user",
  "color": "yellow",
  "pageNumber": 42,
  "chapter": "Chapter 3: The Journey Begins",
  "cfi": "epubcfi(/6/4[chap01ref]!/4/2/2[highlight-start]/1:3)",
  "position": 0.35,
  "note": "Important quote to remember"
}
```

**Field Requirements:**
- `bookId`: Required, valid UUID of the book
- `selectedText`: Required, the text that was highlighted
- `color`: Optional, default "yellow". Allowed values: `yellow`, `green`, `blue`, `pink`, `orange`, `purple`
- `pageNumber`: Optional, page number where highlight was created
- `chapter`: Optional, chapter or section name
- `cfi`: Optional, Canonical Fragment Identifier for EPUB navigation
- `position`: Optional, numeric position in book (0.0 to 1.0)
- `note`: Optional, user note about this highlight

**Success Response (201):**
```json
{
  "message": "Highlight created successfully",
  "highlight": {
    "id": "highlight-uuid",
    "userId": "user-uuid",
    "bookId": "book-uuid",
    "selectedText": "This is the text that was highlighted by the user",
    "color": "yellow",
    "pageNumber": 42,
    "chapter": "Chapter 3: The Journey Begins",
    "cfi": "epubcfi(/6/4[chap01ref]!/4/2/2[highlight-start]/1:3)",
    "position": 0.35,
    "note": "Important quote to remember",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "book": {
      "id": "book-uuid",
      "title": "A Tale of Two Cities",
      "author": "Charles Dickens",
      "coverImageUrl": "https://s3.amazonaws.com/bucket/covers/tale-two-cities.jpg"
    }
  }
}
```

**Error Response (400) - Missing Selected Text:**
```json
{
  "error": {
    "message": "Selected text is required",
    "code": "VALIDATION_ERROR"
  }
}
```

**Error Response (400) - Invalid Color:**
```json
{
  "error": {
    "message": "Invalid color. Allowed colors: yellow, green, blue, pink, orange, purple",
    "code": "VALIDATION_ERROR"
  }
}
```

**Error Response (403) - Book Not Owned:**
```json
{
  "error": {
    "message": "You must own this book to add highlights",
    "code": "BOOK_NOT_OWNED"
  }
}
```

**Note:** 
- Users can only highlight text in books they own (have purchased)
- Valid colors: `yellow` (default), `green`, `blue`, `pink`, `orange`, `purple`
- Multiple highlights can exist for the same text (with different colors or notes)

---

### 38. Get Highlights for a Book

**Method:** `GET`  
**URL:** `http://localhost:5000/api/highlights/book/:bookId`

**Access:** Authenticated users only (must own the book)

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `bookId` - Book's UUID

**Query Parameters (optional):**
- `color` - Filter highlights by color (e.g., `?color=yellow`)

**Body:** None

**Success Response (200):**
```json
{
  "bookId": "book-uuid",
  "highlights": [
    {
      "id": "highlight-uuid-1",
      "selectedText": "First highlighted text",
      "color": "yellow",
      "pageNumber": 42,
      "chapter": "Chapter 3",
      "cfi": "epubcfi(...)",
      "position": 0.35,
      "note": "Important quote",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    },
    {
      "id": "highlight-uuid-2",
      "selectedText": "Second highlighted text",
      "color": "green",
      "pageNumber": 55,
      "chapter": "Chapter 4",
      "cfi": "epubcfi(...)",
      "position": 0.45,
      "note": null,
      "createdAt": "2024-01-15T11:00:00.000Z",
      "updatedAt": "2024-01-15T11:00:00.000Z"
    }
  ],
  "totalHighlights": 2
}
```

**Error Response (403) - Book Not Owned:**
```json
{
  "error": {
    "message": "You must own this book to view highlights",
    "code": "BOOK_NOT_OWNED"
  }
}
```

**Note:** 
- Returns all highlights for the book, ordered by creation date (newest first)
- Can filter by color using query parameter: `?color=yellow`
- Only returns highlights created by the authenticated user

---

### 39. Get All Highlights (User's Highlights)

**Method:** `GET`  
**URL:** `http://localhost:5000/api/highlights`

**Access:** Authenticated users only

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters (all optional):**
- `bookId` - Filter by book ID (e.g., `?bookId=uuid`)
- `color` - Filter by color (e.g., `?color=yellow`)
- `page` - Page number for pagination (default: 1)
- `limit` - Items per page (default: 20)

**Body:** None

**Success Response (200):**
```json
{
  "highlights": [
    {
      "id": "highlight-uuid-1",
      "userId": "user-uuid",
      "bookId": "book-uuid-1",
      "selectedText": "First highlighted text",
      "color": "yellow",
      "pageNumber": 42,
      "chapter": "Chapter 3",
      "cfi": "epubcfi(...)",
      "position": 0.35,
      "note": "Important quote",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "book": {
        "id": "book-uuid-1",
        "title": "A Tale of Two Cities",
        "author": "Charles Dickens",
        "coverImageUrl": "https://s3.amazonaws.com/bucket/covers/tale-two-cities.jpg"
      }
    },
    {
      "id": "highlight-uuid-2",
      "userId": "user-uuid",
      "bookId": "book-uuid-2",
      "selectedText": "Second highlighted text",
      "color": "green",
      "pageNumber": 55,
      "chapter": "Chapter 4",
      "cfi": "epubcfi(...)",
      "position": 0.45,
      "note": null,
      "createdAt": "2024-01-15T11:00:00.000Z",
      "updatedAt": "2024-01-15T11:00:00.000Z",
      "book": {
        "id": "book-uuid-2",
        "title": "The Great Gatsby",
        "author": "F. Scott Fitzgerald",
        "coverImageUrl": "https://s3.amazonaws.com/bucket/covers/great-gatsby.jpg"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 2,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

**Note:** 
- Returns all highlights across all books for the authenticated user
- Supports pagination and filtering by book or color
- Ordered by creation date (newest first)

---

### 40. Get Highlight Count for a Book

**Method:** `GET`  
**URL:** `http://localhost:5000/api/highlights/count/:bookId`

**Access:** Authenticated users only

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `bookId` - Book's UUID

**Query Parameters (optional):**
- `color` - Filter by color (e.g., `?color=yellow`)

**Body:** None

**Success Response (200):**
```json
{
  "bookId": "book-uuid",
  "count": 15,
  "color": "all"
}
```

**Success Response (200) - Filtered by Color:**
```json
{
  "bookId": "book-uuid",
  "count": 5,
  "color": "yellow"
}
```

**Note:** 
- Returns total count of highlights for a book
- Can filter by color to get count for specific color

---

### 41. Update Highlight

**Method:** `PATCH`  
**URL:** `http://localhost:5000/api/highlights/:highlightId`

**Access:** Authenticated users only (can only update own highlights)

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**URL Parameters:**
- `highlightId` - Highlight's UUID

**Body (JSON) - All fields optional:**
```json
{
  "color": "green",
  "note": "Updated note about this highlight"
}
```

**Success Response (200):**
```json
{
  "message": "Highlight updated successfully",
  "highlight": {
    "id": "highlight-uuid",
    "selectedText": "This is the text that was highlighted",
    "color": "green",
    "note": "Updated note about this highlight",
    "updatedAt": "2024-01-15T12:00:00.000Z",
    "book": {
      "id": "book-uuid",
      "title": "A Tale of Two Cities",
      "author": "Charles Dickens",
      "coverImageUrl": "https://s3.amazonaws.com/bucket/covers/tale-two-cities.jpg"
    }
  }
}
```

**Error Response (400) - Invalid Color:**
```json
{
  "error": {
    "message": "Invalid color. Allowed colors: yellow, green, blue, pink, orange, purple",
    "code": "VALIDATION_ERROR"
  }
}
```

**Error Response (403) - Not Owner:**
```json
{
  "error": {
    "message": "You can only update your own highlights",
    "code": "FORBIDDEN"
  }
}
```

**Note:** 
- Only `color` and `note` can be updated
- `selectedText`, `cfi`, `position`, etc. cannot be changed (create a new highlight instead)

---

### 42. Delete Highlight

**Method:** `DELETE`  
**URL:** `http://localhost:5000/api/highlights/:highlightId`

**Access:** Authenticated users only (can only delete own highlights)

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `highlightId` - Highlight's UUID

**Body:** None

**Success Response (200):**
```json
{
  "message": "Highlight deleted successfully"
}
```

**Error Response (404) - Highlight Not Found:**
```json
{
  "error": {
    "message": "Highlight not found",
    "code": "HIGHLIGHT_NOT_FOUND"
  }
}
```

**Error Response (403) - Not Owner:**
```json
{
  "error": {
    "message": "You can only delete your own highlights",
    "code": "FORBIDDEN"
  }
}
```

**Note:** 
- Permanently deletes the highlight
- Cannot be undone

---

### 37. Get My Uploaded Books (Author Dashboard)

**Method:** `GET`  
**URL:** `http://localhost:5000/api/books/my-uploaded`

**Access:** Authenticated users only (returns books uploaded by the authenticated user)

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters (all optional):**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `sortBy` - Sort field: `createdAt`, `updatedAt`, `title`, `author`, `price`, `rating`, `downloads` (default: `createdAt`)
- `sortOrder` - Sort order: `asc` or `desc` (default: `desc`)
- `search` - Search in title, author, or description (e.g., `?search=novel`)
- `category` - Filter by category (e.g., `?category=Fiction`)
- `isActive` - Filter by active status (e.g., `?isActive=true`)

**Example URLs:**
```
GET http://localhost:5000/api/books/my-uploaded
GET http://localhost:5000/api/books/my-uploaded?page=1&limit=10
GET http://localhost:5000/api/books/my-uploaded?search=novel&sortBy=downloads&sortOrder=desc
GET http://localhost:5000/api/books/my-uploaded?category=Fiction&isActive=true
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
      "coverImageUrl": "https://bucket-name.s3.region.amazonaws.com/users/{user-id}/covers/cover_1234567890_abc123.jpg",
      "bookFileUrl": "https://bucket-name.s3.region.amazonaws.com/users/{user-id}/books/book_1234567890_def456.epub",
      "category": "Fiction",
      "rating": 4.5,
      "downloads": 150,
      "recommended": true,
      "isActive": true,
      "userId": "user-uuid",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

**Error Response (401) - Not Authenticated:**
```json
{
  "error": {
    "message": "Authentication required",
    "code": "UNAUTHORIZED"
  }
}
```

**Note:** 
- Returns all books uploaded by the authenticated user/author
- Includes `bookFileUrl` for the author's dashboard
- Supports pagination, sorting, search, and filtering
- Useful for author/admin dashboard to manage their uploaded books

---

## 🔊 TEXT-TO-SPEECH (TTS) ENDPOINTS

### 46. Generate Speech from Text

**Method:** `POST`  
**URL:** `http://localhost:5000/api/tts`

**Access:** Authenticated users only

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "text": "This is the text that will be converted to speech using OpenAI's high-quality TTS model."
}
```

**Field Requirements:**
- `text`: Required, non-empty string (max 4096 characters)

**Success Response (200):**
- **Content-Type:** `audio/mpeg`
- **Body:** Binary audio data (MP3 format)

**Note:** The response is a binary audio file (MP3), not JSON. The audio is generated using OpenAI's `tts-1-hd-1106` model with the `coral` voice.

**Error Response (400) - Missing Text:**
```json
{
  "error": {
    "message": "Text is required and must be a non-empty string",
    "code": "VALIDATION_ERROR"
  }
}
```

**Error Response (500) - API Key Not Configured:**
```json
{
  "error": {
    "message": "OpenAI API key is not configured. Please set PENAI_API_KEY or OPENAI_API_KEY in environment variables.",
    "code": "CONFIGURATION_ERROR"
  }
}
```

**Error Response (500) - OpenAI API Error:**
```json
{
  "error": {
    "message": "OpenAI API error: [error message]",
    "code": "OPENAI_ERROR"
  }
}
```

**Notes:**
- Text is automatically truncated to 4096 characters if longer (OpenAI TTS limit)
- Audio is returned as MP3 format
- Uses OpenAI TTS model `tts-1-hd-1106` with voice `coral`
- Requires `PENAI_API_KEY` or `OPENAI_API_KEY` environment variable to be set
- Response is binary audio data, not JSON
- Useful for reading e-book content aloud in the reading room

**Example Usage in JavaScript:**
```javascript
const response = await fetch('http://localhost:5000/api/tts', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ text: 'Hello, this is a test.' })
});

const audioBlob = await response.blob();
const audioUrl = URL.createObjectURL(audioBlob);
const audio = new Audio(audioUrl);
audio.play();
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
| 19 | GET | `/api/books/:id/chapters` | Public | Get book chapters (table of contents) |
| 20 | POST | `/api/purchase` | Private | Purchase a book |
| 21 | GET | `/api/my-books` | Private | Get user's purchased books |
| 22 | GET | `/api/books/my-uploaded` | Private | Get books uploaded by authenticated author |
| 23 | POST | `/api/wishlist` | Private | Add book to wishlist |
| 24 | DELETE | `/api/wishlist/:bookId` | Private | Remove book from wishlist |
| 25 | GET | `/api/wishlist` | Private | Get user's wishlist |
| 26 | GET | `/api/wishlist/check/:bookId` | Private | Check if book is in wishlist |
| 27 | GET | `/api/wishlist/count` | Private | Get wishlist count |
| 28 | POST | `/api/cart` | Private | Add book to cart |
| 29 | DELETE | `/api/cart/:bookId` | Private | Remove book from cart |
| 30 | PATCH | `/api/cart/:bookId` | Private | Update cart item quantity |
| 31 | GET | `/api/cart` | Private | Get cart with total pricing |
| 32 | DELETE | `/api/cart` | Private | Clear cart |
| 33 | GET | `/api/cart/count` | Private | Get cart count |
| 34 | POST | `/api/bookmarks` | Private | Add bookmark (reading position) |
| 35 | GET | `/api/bookmarks` | Private | Get all bookmarks for user |
| 36 | GET | `/api/bookmarks/book/:bookId` | Private | Get bookmarks for a book |
| 37 | GET | `/api/bookmarks/last-position/:bookId` | Private | Get last reading position |
| 38 | PATCH | `/api/bookmarks/:bookmarkId` | Private | Update bookmark |
| 39 | DELETE | `/api/bookmarks/:bookmarkId` | Private | Delete bookmark |
| 40 | POST | `/api/highlights` | Private | Add highlight (text selection with color) |
| 41 | GET | `/api/highlights/book/:bookId` | Private | Get highlights for a book |
| 42 | GET | `/api/highlights` | Private | Get all highlights (user's highlights) |
| 43 | GET | `/api/highlights/count/:bookId` | Private | Get highlight count for a book |
| 44 | PATCH | `/api/highlights/:highlightId` | Private | Update highlight (color, note) |
| 45 | DELETE | `/api/highlights/:highlightId` | Private | Delete highlight |
| 46 | POST | `/api/tts` | Private | Generate speech from text (OpenAI TTS) |

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
| `GET_CHAPTERS_ERROR` | Failed to fetch chapters |
| `PURCHASE_ERROR` | Failed to purchase book |
| `GET_MY_BOOKS_ERROR` | Failed to fetch user's books |
| `GET_MY_UPLOADED_BOOKS_ERROR` | Failed to fetch user's uploaded books |
| `UPLOAD_BOOK_ERROR` | Failed to upload book |
| `ADD_TO_WISHLIST_ERROR` | Failed to add book to wishlist |
| `REMOVE_FROM_WISHLIST_ERROR` | Failed to remove book from wishlist |
| `GET_WISHLIST_ERROR` | Failed to fetch wishlist |
| `CHECK_WISHLIST_ERROR` | Failed to check wishlist status |
| `ALREADY_IN_WISHLIST` | Book is already in wishlist |
| `NOT_IN_WISHLIST` | Book is not in wishlist |
| `ADD_TO_CART_ERROR` | Failed to add book to cart |
| `REMOVE_FROM_CART_ERROR` | Failed to remove book from cart |
| `UPDATE_CART_ERROR` | Failed to update cart item |
| `GET_CART_ERROR` | Failed to fetch cart |
| `CLEAR_CART_ERROR` | Failed to clear cart |
| `GET_CART_COUNT_ERROR` | Failed to get cart count |
| `ALREADY_IN_CART` | Book is already in cart |
| `NOT_IN_CART` | Book is not in cart |
| `ADD_BOOKMARK_ERROR` | Failed to create bookmark |
| `GET_BOOKMARKS_ERROR` | Failed to fetch bookmarks |
| `GET_ALL_BOOKMARKS_ERROR` | Failed to fetch all bookmarks |
| `GET_LAST_POSITION_ERROR` | Failed to fetch last position |
| `UPDATE_BOOKMARK_ERROR` | Failed to update bookmark |
| `DELETE_BOOKMARK_ERROR` | Failed to delete bookmark |
| `BOOKMARK_NOT_FOUND` | Bookmark does not exist |
| `NO_POSITION_FOUND` | No reading position found for book |
| `ADD_HIGHLIGHT_ERROR` | Failed to create highlight |
| `GET_HIGHLIGHTS_ERROR` | Failed to fetch highlights |
| `GET_ALL_HIGHLIGHTS_ERROR` | Failed to fetch all highlights |
| `UPDATE_HIGHLIGHT_ERROR` | Failed to update highlight |
| `DELETE_HIGHLIGHT_ERROR` | Failed to delete highlight |
| `GET_HIGHLIGHT_COUNT_ERROR` | Failed to get highlight count |
| `HIGHLIGHT_NOT_FOUND` | Highlight does not exist |
| `BOOK_NOT_OWNED` | User does not own the book |
| `TTS_ERROR` | Failed to generate speech |
| `OPENAI_ERROR` | OpenAI API error |
| `CONFIGURATION_ERROR` | OpenAI API key not configured |

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

### Example 7: Get My Uploaded Books (Author Dashboard)
```
GET {{base_url}}/api/books/my-uploaded?page=1&limit=10&sortBy=createdAt&sortOrder=desc
Authorization: Bearer {{access_token}}
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

### Example 9: Get Book Chapters
```
GET {{base_url}}/api/books/{bookId}/chapters
```

### Example 10: Purchase Book
```
POST {{base_url}}/api/purchase
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "bookId": "uuid-of-book"
}
```

### Example 11: Get My Books (Purchased Books)
```
GET {{base_url}}/api/my-books
Authorization: Bearer {{access_token}}
```

### Example 12: Get My Uploaded Books (Author Dashboard)
```
GET {{base_url}}/api/books/my-uploaded?page=1&limit=10&sortBy=createdAt&sortOrder=desc
Authorization: Bearer {{access_token}}
```

### Example 13: Add Book to Wishlist
```
POST {{base_url}}/api/wishlist
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "bookId": "uuid-of-book"
}
```

### Example 14: Get User's Wishlist
```
GET {{base_url}}/api/wishlist?page=1&limit=10&sortBy=createdAt&sortOrder=desc
Authorization: Bearer {{access_token}}
```

### Example 15: Remove Book from Wishlist
```
DELETE {{base_url}}/api/wishlist/{bookId}
Authorization: Bearer {{access_token}}
```

### Example 16: Check if Book is in Wishlist
```
GET {{base_url}}/api/wishlist/check/{bookId}
Authorization: Bearer {{access_token}}
```

### Example 17: Get Wishlist Count
```
GET {{base_url}}/api/wishlist/count
Authorization: Bearer {{access_token}}
```

### Example 18: Add Book to Cart
```
POST {{base_url}}/api/cart
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "bookId": "uuid-of-book",
  "quantity": 1
}
```

### Example 19: Get Cart with Total Pricing
```
GET {{base_url}}/api/cart
Authorization: Bearer {{access_token}}
```

### Example 20: Update Cart Item Quantity
```
PATCH {{base_url}}/api/cart/{bookId}
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "quantity": 3
}
```

### Example 21: Remove Book from Cart
```
DELETE {{base_url}}/api/cart/{bookId}
Authorization: Bearer {{access_token}}
```

### Example 22: Clear Cart
```
DELETE {{base_url}}/api/cart
Authorization: Bearer {{access_token}}
```

### Example 23: Get Cart Count
```
GET {{base_url}}/api/cart/count
Authorization: Bearer {{access_token}}
```

### Example 24: Add Highlight
```
POST {{base_url}}/api/highlights
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "bookId": "uuid-of-book",
  "selectedText": "This is the text that was highlighted",
  "color": "yellow",
  "pageNumber": 42,
  "chapter": "Chapter 3",
  "cfi": "epubcfi(/6/4[chap01ref]!/4/2/2[highlight-start]/1:3)",
  "position": 0.35,
  "note": "Important quote to remember"
}
```

### Example 25: Get Highlights for a Book
```
GET {{base_url}}/api/highlights/book/{bookId}?color=yellow
Authorization: Bearer {{access_token}}
```

### Example 26: Get All Highlights
```
GET {{base_url}}/api/highlights?bookId={bookId}&color=yellow&page=1&limit=20
Authorization: Bearer {{access_token}}
```

### Example 27: Update Highlight
```
PATCH {{base_url}}/api/highlights/{highlightId}
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "color": "green",
  "note": "Updated note"
}
```

### Example 28: Delete Highlight
```
DELETE {{base_url}}/api/highlights/{highlightId}
Authorization: Bearer {{access_token}}
```

### Example 29: Get Highlight Count
```
GET {{base_url}}/api/highlights/count/{bookId}?color=yellow
Authorization: Bearer {{access_token}}
```

### Example 30: Add Bookmark (Reading Position)
```
POST {{base_url}}/api/bookmarks
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "bookId": "uuid-of-book",
  "pageNumber": 42,
  "chapter": "Chapter 3: The Journey Begins",
  "selectedText": "It was the best of times, it was the worst of times...",
  "cfi": "epubcfi(/6/4[chap01ref]!/4/2/2[heading01]/10)",
  "position": 0.35,
  "note": "Important quote",
  "isLastPosition": true
}
```

### Example 31: Get Last Reading Position
```
GET {{base_url}}/api/bookmarks/last-position/{bookId}
Authorization: Bearer {{access_token}}
```

### Example 32: Get Bookmarks for a Book
```
GET {{base_url}}/api/bookmarks/book/{bookId}
Authorization: Bearer {{access_token}}
```

### Example 33: Update Bookmark
```
PATCH {{base_url}}/api/bookmarks/{bookmarkId}
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "pageNumber": 45,
  "selectedText": "Updated text...",
  "isLastPosition": true
}
```

### Example 34: Delete Bookmark
```
DELETE {{base_url}}/api/bookmarks/{bookmarkId}
Authorization: Bearer {{access_token}}
```

### Example 35: Generate Speech from Text (TTS)
```
POST {{base_url}}/api/tts
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "text": "This is the text that will be converted to speech using OpenAI's high-quality TTS model."
}
```

**Note:** 
- Response is binary audio (MP3), not JSON
- In Postman, you can save the response as a file or play it directly
- Text is limited to 4096 characters (automatically truncated if longer)
- Uses OpenAI TTS model `tts-1-hd-1106` with voice `coral`

---

## 📚 BOOKS API WORKFLOW

### How User Authentication Works for Upload

**The userId is automatically extracted - you don't need to send it!**

```
1. Client sends request:
   POST /api/books/upload
   Headers: Authorization: Bearer <token>
   Body: form-data (title, author, price, epub file, etc.)

2. authenticate middleware runs:
   - Extracts token from Authorization header
   - Verifies token and gets user info from database
   - Sets req.userId = user.id (automatically!)

3. uploadBookWithFiles function:
   - Gets userId from req.userId (already set by middleware)
   - Uses userId to organize files in S3: users/{userId}/books/
   - Stores userId in database when creating book record

4. Response includes userId:
   - Shows which user uploaded the book
   - All books by same user go in same S3 folder
```

**Key Point:** You only need to send the `Authorization: Bearer <token>` header. The userId is automatically extracted from the token - you never send it in the body!

### Step 1: Create a Book (Admin)

**Option A: Upload Files Directly (Recommended)**
1. Login as Admin/Super Admin (get access token)
2. Upload book using `/api/books/upload` endpoint with files
   - Include `Authorization: Bearer <token>` header
   - Send form-data (title, author, price, epub, cover)
   - **Do NOT send userId** - it's automatic!
3. Files are automatically uploaded to S3 in `users/{your-user-id}/books/`
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

