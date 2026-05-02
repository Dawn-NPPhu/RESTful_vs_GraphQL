# API Architecture: RESTful vs GraphQL

## 📌 Mục Tiêu Tài Liệu
Cung cấp so sánh toàn diện về kiến trúc API RESTful và GraphQL, giúp hiểu rõ:
- Cách hoạt động của từng kiến trúc
- Ưu nhược điểm cụ thể
- Khi nào dùng cái nào
- Best practices

---

## 1. RESTful Architecture

### 1.1 Định Nghĩa
**REST (Representational State Transfer)** là phong cách kiến trúc API dựa trên các nguyên tắc:
- **Resources**: Mọi thứ là tài nguyên (users, posts, comments)
- **URIs**: Mỗi resource có URI duy nhất `/api/users/1`
- **HTTP Methods**: Sử dụng GET, POST, PUT, DELETE
- **Stateless**: Mỗi request độc lập, không lưu trạng thái

### 1.2 Ví Dụ Endpoints
```
GET    /api/users                 # Lấy tất cả users
GET    /api/users/1               # Lấy user ID 1
POST   /api/users                 # Tạo user mới
PUT    /api/users/1               # Cập nhật user ID 1
DELETE /api/users/1               # Xoá user ID 1

GET    /api/users/1/posts         # Lấy posts của user 1
POST   /api/users/1/posts         # Tạo post cho user 1
```

### 1.3 Request/Response Example
```http
GET /api/users/1 HTTP/1.1
Host: api.example.com

---

HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "age": 28,
  "role": "admin",
  "createdAt": "2024-01-01"
}
```

### 1.4 HTTP Methods Mapping
| Method | Action | Idempotent | Safe |
|--------|--------|-----------|------|
| GET | Read data | ✅ Yes | ✅ Yes |
| POST | Create resource | ❌ No | ❌ No |
| PUT | Replace resource | ✅ Yes | ❌ No |
| PATCH | Partial update | ⚠️  Depends | ❌ No |
| DELETE | Remove resource | ✅ Yes | ❌ No |

---

## 2. GraphQL Architecture

### 2.1 Định Nghĩa
**GraphQL** là query language cho API cho phép:
- **Single endpoint**: `/graphql` cho tất cả operations
- **Strongly typed schema**: Định nghĩa rõ ràng data structure
- **Query language**: Client chỉ định chính xác data cần
- **Flexible**: Không cần versioning

### 2.2 Schema Example
```graphql
type User {
  id: ID!
  name: String!
  email: String!
  age: Int
  posts: [Post!]!
}

type Post {
  id: ID!
  title: String!
  content: String!
  author: User!
  likes: Int!
}

type Query {
  users(limit: Int): [User!]!
  user(id: ID!): User
  posts: [Post!]!
}

type Mutation {
  createUser(name: String!, email: String!): User!
  createPost(title: String!, userId: ID!): Post!
}
```

### 2.3 Query Example
```graphql
# Client specifies exact fields needed
query {
  user(id: "1") {
    name
    email
    posts {
      title
      likes
    }
  }
}
```

### 2.4 Response
```json
{
  "data": {
    "user": {
      "name": "John Doe",
      "email": "john@example.com",
      "posts": [
        {
          "title": "First Post",
          "likes": 10
        },
        {
          "title": "Second Post",
          "likes": 25
        }
      ]
    }
  }
}
```

---

## 3. So Sánh Chi Tiết

### 3.1 Overfetching vs Under-fetching

#### RESTful - Overfetching Problem
```http
GET /api/users/1

Response: Tất cả fields
{
  "id": 1,
  "name": "John",        ← cần
  "email": "john@...",   ← cần
  "age": 28,             ← ❌ không cần
  "role": "admin",       ← ❌ không cần
  "createdAt": "...",    ← ❌ không cần
  "lastLogin": "..."     ← ❌ không cần
}
```

#### RESTful - Under-fetching Problem
```
Client cần: User + Posts + Comments

# Need 3 requests:
1. GET /api/users/1
2. GET /api/users/1/posts
3. GET /api/posts/1/comments
```

#### GraphQL - Precise Fetching
```graphql
query {
  user(id: "1") {
    name
    email
  }
}

Response: Only requested fields
{
  "name": "John",
  "email": "john@..."
}
```

### 3.2 Single Endpoint vs Multiple Endpoints

| Aspect | RESTful | GraphQL |
|--------|---------|---------|
| Endpoints | Multiple (/users, /posts, /comments) | Single (/graphql) |
| URL structure | Resource-based | Query-based |
| Documentation | Swagger/OpenAPI | GraphQL Schema |
| Discoverability | External docs needed | Self-documenting |

### 3.3 Caching

#### RESTful Caching (Dễ)
```http
GET /api/users/1

HTTP/1.1 200 OK
Cache-Control: public, max-age=3600
ETag: "123abc"

# Browser caches automatically
# CDN-friendly
```

#### GraphQL Caching (Phức tạp)
```http
POST /graphql

# POST không cache theo HTTP standard
# Cần query-specific caching strategy
# Thường dùng Apollo Client cache
```

### 3.4 Versioning

#### RESTful
```
# Versioning in URL
/api/v1/users
/api/v2/users  (Breaking changes)

# Versioning in Header
GET /api/users
Accept-Version: 1

# Costly: Multiple versions to maintain
```

#### GraphQL
```
# Single endpoint, schema evolves
# No breaking changes with deprecation

schema {
  type User {
    id: ID!
    name: String!
    email: String! @deprecated(reason: "Use emails field")
    emails: [String!]!
  }
}
```

---

## 4. Performance Comparison

### 4.1 Bandwidth

**Scenario**: Get user with 10 posts, each post with author

**RESTful Approach**:
```
Request 1: GET /api/users/1
Response: ~500 bytes (overfetch: age, role, etc)

Request 2: GET /api/users/1/posts
Response: ~5KB (10 posts × ~500 bytes each)

Request 3: GET /api/posts/1/author (if needed)
Response: ~500 bytes

Total: 3 requests, ~6KB data
```

**GraphQL Approach**:
```
Query: 
{
  user(id: "1") {
    name email
    posts(limit: 10) {
      title
      author { name }
    }
  }
}

Response: ~2KB (only needed fields)

Total: 1 request, ~2KB data
```

### 4.2 Network Latency

```
RESTful: 3 round trips (3 requests)
GraphQL: 1 round trip (1 request)

Improvement: 66% faster (fewer requests)
But: GraphQL query parsing overhead
```

### 4.3 Server Performance

```
RESTful:
- Simple endpoint logic
- Easy to optimize per endpoint
- Caching straightforward

GraphQL:
- Complex query resolver logic
- Potential N+1 query problem
- Needs query complexity analysis
```

---

## 5. Use Cases

### 5.1 When to Use RESTful

✅ **Good fit for**:
- Simple, stable APIs
- Mobile apps (bandwidth concerns)
- Public APIs (caching important)
- Team familiar with REST
- Operations teams (standard tools)

### 5.2 When to Use GraphQL

✅ **Good fit for**:
- Complex data relationships
- Multiple client types (web, mobile, desktop)
- Frequent API changes
- Real-time features needed
- Aggregating multiple data sources

### 5.3 Hybrid Approach

Many organizations use both:
```
Internal/Complex APIs  → GraphQL
Simple/Public APIs     → RESTful
Mobile endpoints       → GraphQL (bandwidth)
```

---

## 6. Developer Experience

### 6.1 RESTful
```
Pros:
✅ Easy to learn
✅ Browser-friendly (GET)
✅ Standard conventions
✅ Great tooling (Postman, Swagger)

Cons:
❌ Boilerplate code
❌ Manual response building
❌ Versioning complexity
```

### 6.2 GraphQL
```
Pros:
✅ Type safety
✅ Excellent IDE support
✅ Single query language
✅ Self-documenting

Cons:
❌ Steeper learning curve
❌ Debugging harder
❌ Query optimization needed
❌ POST-only (debugging)
```

---

## 7. Security Considerations

### 7.1 RESTful Security
- Standard HTTP security (HTTPS, CORS)
- Rate limiting per endpoint
- Clear permission model (URL-based)

### 7.2 GraphQL Security
- Query depth limiting (prevent recursion)
- Query complexity scoring
- Timeout enforcement
- Authentication per field

---

## 8. Real-World Examples

### 8.1 Netflix Case Study
- Uses GraphQL internally for content API
- Reason: Diverse clients, flexible queries

### 8.2 Stripe API
- RESTful for payments (stable, caching important)
- GraphQL optional for complex queries

### 8.3 GitHub API
- RESTful v3 (established)
- GraphQL v4 (newer, more powerful)
- Both maintained

---

## 📚 References

- [REST API Best Practices](https://restfulapi.net)
- [GraphQL Official Docs](https://graphql.org)
- [Apollo Server](https://www.apollographql.com/docs/apollo-server/)
- [REST vs GraphQL](https://www.howtographql.com/basics/1-graphql-is-the-better-rest/)
