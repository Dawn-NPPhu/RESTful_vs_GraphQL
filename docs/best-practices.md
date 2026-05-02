# Best Practices: RESTful & GraphQL API Design

## RESTful Best Practices

### 1. Resource-Oriented Design

#### ✅ Good
```
GET    /api/users              # Get all users
GET    /api/users/123          # Get user
POST   /api/users              # Create user
PUT    /api/users/123          # Update user
DELETE /api/users/123          # Delete user
GET    /api/users/123/posts    # Get user's posts
POST   /api/users/123/posts    # Create post for user
```

#### ❌ Bad
```
GET    /api/getUsers
GET    /api/getUserById?id=123
POST   /api/createUser
GET    /api/user/fetchPosts
```

### 2. Proper HTTP Methods

```http
GET     - Safe, idempotent, retrieve data
POST    - Create new resource, not idempotent
PUT     - Replace entire resource, idempotent
PATCH   - Partial update, not always idempotent
DELETE  - Remove resource, idempotent
HEAD    - Like GET but no body
OPTIONS - Describe communication options
```

### 3. HTTP Status Codes

#### Success Responses
```
200 OK              - Request successful
201 Created         - Resource created successfully
202 Accepted        - Request accepted for processing
204 No Content      - Successful but no content to return
```

#### Client Errors
```
400 Bad Request     - Invalid request format
401 Unauthorized    - Authentication required
403 Forbidden       - Permission denied
404 Not Found       - Resource doesn't exist
409 Conflict        - Request conflicts with state
```

#### Server Errors
```
500 Internal Server Error   - Server error
501 Not Implemented         - Feature not implemented
503 Service Unavailable     - Server temporarily unavailable
```

### 4. Versioning

#### URL Versioning (Common)
```
GET /api/v1/users
GET /api/v2/users
```

#### Header Versioning (Better)
```
GET /api/users
Accept: application/vnd.api+json;version=2
```

#### Content Negotiation
```
GET /api/users
Accept: application/json+v2
```

### 5. Error Response Format

#### ✅ Consistent Error Response
```json
{
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "The requested user does not exist",
    "details": {
      "userId": 123,
      "timestamp": "2024-01-09T10:00:00Z"
    },
    "helpUrl": "https://api.example.com/docs/errors#USER_NOT_FOUND"
  }
}
```

### 6. Pagination

#### Limit-Offset
```
GET /api/users?limit=10&offset=20
```

#### Page-Based
```
GET /api/users?page=3&size=10
```

#### Cursor-Based (Best for large datasets)
```
GET /api/users?cursor=abc123&limit=10

Response:
{
  "data": [...],
  "pagination": {
    "nextCursor": "xyz789",
    "hasMore": true
  }
}
```

### 7. Filtering & Sorting

#### Filtering
```
GET /api/posts?userId=1&status=published&minViews=100
```

#### Sorting
```
GET /api/posts?sort=createdAt:desc,likes:asc
```

#### Combined
```
GET /api/posts?userId=1&sort=-createdAt&limit=10
```

### 8. CORS Headers

```http
GET /api/users

HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://example.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 3600
```

### 9. Rate Limiting

```http
HTTP/1.1 200 OK
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1609972800

X-RateLimit-RetryAfter: 60
```

### 10. Documentation

#### Using OpenAPI/Swagger
```yaml
/api/users:
  get:
    summary: Get all users
    parameters:
      - name: limit
        in: query
        type: integer
        description: Number of users to return
    responses:
      200:
        description: List of users
        schema:
          type: array
          items: User
```

---

## GraphQL Best Practices

### 1. Schema Design

#### ✅ Well-Structured Schema
```graphql
type User {
  id: ID!
  name: String!
  email: String!
  posts(first: Int, after: String): PostConnection!
}

type Post {
  id: ID!
  title: String!
  content: String!
  author: User!
}

type Query {
  user(id: ID!): User
  users(first: Int, after: String): [User!]!
  post(id: ID!): Post
}
```

#### ❌ Poor Schema Design
```graphql
type User {
  id: ID
  name: String
  email: String
  userData: String    # Too generic
  extra: JSON         # Avoid generic types
}
```

### 2. Naming Conventions

```graphql
# ✅ Good - Clear, descriptive names
type UserProfile {
  firstName: String!
  lastName: String!
  emailAddress: String!
}

# ❌ Bad - Unclear abbreviations
type UP {
  fn: String!
  ln: String!
  em: String!
}
```

### 3. Nullability

#### ✅ Thoughtful Nullability
```graphql
type User {
  id: ID!              # Always present
  name: String!        # Required field
  bio: String          # Optional field
  posts: [Post!]!      # Non-null list, non-null items
  followers: [User]    # Nullable list
}
```

#### ❌ Everything Nullable
```graphql
type User {
  id: ID
  name: String
  bio: String
  posts: [Post]
}
```

### 4. Query Optimization

#### ✅ Use Aliases
```graphql
query {
  topPosts: posts(limit: 10, sort: "likes") {
    title
    likes
  }
  recentPosts: posts(limit: 10, sort: "date") {
    title
    createdAt
  }
}
```

#### ✅ Use Fragments
```graphql
fragment UserFields on User {
  id
  name
  email
}

query {
  user1: user(id: 1) { ...UserFields }
  user2: user(id: 2) { ...UserFields }
}
```

### 5. Query Variables

#### ✅ Use Variables for Dynamic Values
```graphql
query GetUser($userId: ID!, $limit: Int!) {
  user(id: $userId) {
    name
    posts(limit: $limit) {
      title
    }
  }
}
```

Variables:
```json
{
  "userId": "123",
  "limit": 10
}
```

### 6. Error Handling

#### ✅ Detailed Error Information
```json
{
  "errors": [
    {
      "message": "User not found",
      "locations": [{"line": 2, "column": 3}],
      "path": ["user"],
      "extensions": {
        "code": "USER_NOT_FOUND",
        "userId": "123"
      }
    }
  ]
}
```

### 7. Query Complexity Analysis

#### Implement Depth Limiting
```javascript
const maxDepth = 5;

// Reject queries deeper than maxDepth
query {
  user {
    posts {
      comments {
        author {
          posts {
            # 5 levels deep - allowed
          }
        }
      }
    }
  }
}
```

#### Query Cost Analysis
```graphql
# Assign costs
type Query {
  users: [User!]! @cost(multipliers: ["first"], complexity: 10)
}

# Calculate total cost
query { users(first: 100) { posts(first: 10) { title } } }
# Cost: 10 * 100 * 10 = 10,000 (if exceeds limit, reject)
```

### 8. Pagination

#### Relay Cursor-Based Pagination
```graphql
type Query {
  users(first: Int, after: String): UserConnection!
}

type UserConnection {
  edges: [UserEdge!]!
  pageInfo: PageInfo!
}

type UserEdge {
  cursor: String!
  node: User!
}

type PageInfo {
  hasNextPage: Boolean!
  endCursor: String
  hasPreviousPage: Boolean!
  startCursor: String
}
```

### 9. Caching Strategy

#### Client-Side Caching (Apollo Client)
```javascript
const client = new ApolloClient({
  cache: new InMemoryCache()
});

// First query - fetches from server
client.query({ query: GET_USER })

// Second query - serves from cache
client.query({ query: GET_USER })
```

#### Persistent Queries
```javascript
// Instead of sending full query
// Send query hash for smaller payload
POST /graphql
{
  "id": "abc123def",  // Query hash
  "variables": { "userId": "1" }
}
```

### 10. Subscriptions for Real-time

```graphql
type Subscription {
  userCreated: User!
  postLiked(postId: ID!): Int!  # Like count
}
```

Usage:
```javascript
subscription {
  userCreated {
    id
    name
  }
}
```

---

## Security Best Practices

### Both RESTful & GraphQL

#### 1. Authentication
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 2. Authorization
```javascript
// Check permissions before returning data
if (!user.canView(resource)) {
  throw new Error("Unauthorized");
}
```

#### 3. Input Validation
```javascript
// RESTful
if (!isValidEmail(email)) {
  return { error: "Invalid email" };
}

// GraphQL
input UserInput {
  email: String! @validate(format: "email")
  age: Int! @validate(min: 18, max: 150)
}
```

#### 4. Rate Limiting
```javascript
// Limit by IP and user
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100  // 100 requests per windowMs
});

app.use('/api/', limiter);
```

#### 5. SQL Injection Prevention
```javascript
// ❌ Vulnerable
const query = `SELECT * FROM users WHERE id = ${userId}`;

// ✅ Safe - Use parameterized queries
const query = "SELECT * FROM users WHERE id = ?";
db.query(query, [userId]);
```

#### 6. HTTPS Only
```
Always use HTTPS for production
Never transmit sensitive data over HTTP
```

#### 7. CORS Configuration
```javascript
const cors = require('cors');

app.use(cors({
  origin: 'https://example.com',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));
```

#### 8. GraphQL-Specific: Disable Introspection in Production
```javascript
app.use('/graphql', apollo({
  introspection: process.env.NODE_ENV !== 'production'
}));
```

---

## Performance Best Practices

### Both APIs

#### 1. Caching Headers
```http
Cache-Control: public, max-age=3600
ETag: "abc123"
```

#### 2. Compression
```http
Accept-Encoding: gzip, deflate
```

#### 3. Database Optimization
- Index frequently queried fields
- Use query optimization tools
- Monitor slow queries

#### 4. Monitoring
```javascript
// Track response times
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    console.log(`${req.method} ${req.path} - ${Date.now() - start}ms`);
  });
  next();
});
```

---

## Testing Best Practices

### Unit Testing
```javascript
// RESTful endpoint
describe('GET /api/users', () => {
  it('should return all users', async () => {
    const response = await request(app).get('/api/users');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});

// GraphQL query
describe('users query', () => {
  it('should return users', async () => {
    const result = await client.query({ query: GET_USERS });
    expect(result.data.users).toBeDefined();
  });
});
```

### Integration Testing
```javascript
// Test end-to-end
describe('User workflow', () => {
  it('should create and retrieve user', async () => {
    // Create user
    const createRes = await request(app)
      .post('/api/users')
      .send({ name: 'John', email: 'john@example.com' });
    
    const userId = createRes.body.id;
    
    // Retrieve user
    const getRes = await request(app)
      .get(`/api/users/${userId}`);
    
    expect(getRes.body.name).toBe('John');
  });
});
```

---

## Deployment Best Practices

### Environment Configuration
```javascript
// Use environment variables
const DB_URL = process.env.DATABASE_URL;
const API_KEY = process.env.API_KEY;
const PORT = process.env.PORT || 3000;
```

### Logging
```javascript
const logger = require('winston');

logger.info('Server started on port', PORT);
logger.error('Database connection failed', error);
```

### Health Checks
```javascript
GET /health
Response:
{
  "status": "healthy",
  "database": "connected",
  "uptime": 3600
}
```

---

## Summary Table

| Aspect | RESTful | GraphQL |
|--------|---------|---------|
| Versioning | URL/Header | Schema evolution |
| Errors | HTTP Status Codes | GraphQL Errors object |
| Caching | HTTP Cache | Client/Query cache |
| Complexity | Method-based | Query complexity analysis |
| Real-time | Polling/WebSocket | Subscriptions built-in |
| Security | Standard HTTP auth | Same + depth limiting |
| Documentation | OpenAPI/Swagger | Introspection/SDL |
| Testing | Standard HTTP tests | GraphQL test client |

---

## Conclusion

Both RESTful and GraphQL have their place in modern API design. The key is to:
1. Choose based on your specific needs
2. Follow established best practices
3. Keep security and performance in mind
4. Document your API well
5. Test thoroughly
6. Monitor in production

For more details, refer to the official documentation and real-world case studies.
