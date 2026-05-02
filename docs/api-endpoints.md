# API Endpoints Documentation

## RESTful API Endpoints

### Base URL
```
http://localhost:3001/api
```

---

## Users Endpoints

### 1. List All Users
```http
GET /api/users

Query Parameters:
  - page: number (default: 1)
  - limit: number (default: 10)

Example: GET /api/users?page=1&limit=5

Response: 200 OK
{
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "age": 28,
      "posts": [1, 2]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 2,
    "totalPages": 1
  }
}
```

### 2. Get User By ID
```http
GET /api/users/:id

Example: GET /api/users/1

Response: 200 OK
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "age": 28,
  "posts": [1, 2]
}

Response: 404 Not Found
{
  "error": "User not found"
}
```

### 3. Get User With Posts
```http
GET /api/users/:id/with-posts

Example: GET /api/users/1/with-posts

Response: 200 OK
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "age": 28,
  "posts": [
    {
      "id": 1,
      "title": "First Post",
      "content": "Hello World",
      "userId": 1,
      "likes": 10
    },
    {
      "id": 2,
      "title": "Second Post",
      "content": "GraphQL vs REST",
      "userId": 1,
      "likes": 25
    }
  ]
}
```

### 4. Create User
```http
POST /api/users

Body:
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "age": 34
}

Response: 201 Created
{
  "id": 3,
  "name": "Jane Smith",
  "email": "jane@example.com",
  "age": 34,
  "posts": []
}

Response: 400 Bad Request
{
  "error": "Name and email required"
}
```

### 5. Update User
```http
PUT /api/users/:id

Body:
{
  "name": "John Updated",
  "age": 29
}

Response: 200 OK
{
  "id": 1,
  "name": "John Updated",
  "email": "john@example.com",
  "age": 29,
  "posts": [1, 2]
}
```

### 6. Delete User
```http
DELETE /api/users/:id

Example: DELETE /api/users/1

Response: 200 OK
{
  "message": "User deleted",
  "deleted": {
    "id": 1,
    "name": "John Doe",
    ...
  }
}
```

---

## Posts Endpoints

### 1. List All Posts
```http
GET /api/posts

Query Parameters:
  - userId: number (filter by author)
  - sortBy: "likes" | "date"

Example: GET /api/posts?userId=1&sortBy=likes

Response: 200 OK
[
  {
    "id": 1,
    "title": "First Post",
    "content": "Hello World",
    "userId": 1,
    "likes": 10
  },
  ...
]
```

### 2. Get Post By ID
```http
GET /api/posts/:id

Example: GET /api/posts/1

Response: 200 OK
{
  "id": 1,
  "title": "First Post",
  "content": "Hello World",
  "userId": 1,
  "likes": 10
}
```

### 3. Create Post
```http
POST /api/posts

Body:
{
  "title": "New Post",
  "content": "This is a new post",
  "userId": 1
}

Response: 201 Created
{
  "id": 4,
  "title": "New Post",
  "content": "This is a new post",
  "userId": 1,
  "likes": 0
}
```

### 4. Update Post
```http
PUT /api/posts/:id

Body:
{
  "title": "Updated Title",
  "likes": 50
}

Response: 200 OK
{
  "id": 1,
  "title": "Updated Title",
  "content": "Hello World",
  "userId": 1,
  "likes": 50
}
```

### 5. Delete Post
```http
DELETE /api/posts/:id

Response: 200 OK
{
  "message": "Post deleted",
  "deleted": {
    "id": 1,
    ...
  }
}
```

---

## HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | GET successful |
| 201 | Created | POST successful |
| 400 | Bad Request | Missing required fields |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Internal error |

---

## Error Responses

### Standard Error Format
```json
{
  "error": "Error description"
}
```

### Examples

#### Missing Required Fields
```
POST /api/users
Body: { "name": "John" }

400 Bad Request
{
  "error": "Name and email required"
}
```

#### Resource Not Found
```
GET /api/users/999

404 Not Found
{
  "error": "User not found"
}
```

---

## Rate Limiting

Current: No rate limiting implemented

**Recommendations**:
- 100 requests per minute per IP
- 1000 requests per hour per authenticated user
- Include rate limit headers:
  - X-RateLimit-Limit
  - X-RateLimit-Remaining
  - X-RateLimit-Reset

---

## Authentication

Current: No authentication implemented

**Recommended**:
- JWT tokens for authenticated endpoints
- OAuth 2.0 for third-party apps
- API keys for public endpoints

---

## Example CURL Commands

### Get all users
```bash
curl -X GET http://localhost:3001/api/users
```

### Get user by ID
```bash
curl -X GET http://localhost:3001/api/users/1
```

### Create new user
```bash
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane","email":"jane@example.com","age":30}'
```

### Update user
```bash
curl -X PUT http://localhost:3001/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"John Updated"}'
```

### Delete user
```bash
curl -X DELETE http://localhost:3001/api/users/1
```

---

## Pagination Best Practices

### Page-Based (Current)
```
GET /api/users?page=1&limit=10
```
- Easy to understand
- Good for UI pagination
- Inefficient for large datasets

### Cursor-Based (Recommended)
```
GET /api/users?limit=10&cursor=abc123
```
- More efficient
- Handles real-time inserts
- Better for mobile

### Offset-Based
```
GET /api/users?offset=0&limit=10
```
- Good balance
- Shows gaps in data
- Most common

---

## Filtering & Sorting

### Current Implementation
```
GET /api/posts?userId=1&sortBy=likes
```

### Recommended OData Format
```
GET /api/users?$filter=age gt 25&$orderby=name asc&$top=10
```

### Recommended JSON:API Format
```
GET /api/posts?filter[userId]=1&sort=-likes&page[size]=10
```
