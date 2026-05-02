# Quick Reference Guide

## Command Cheat Sheet

### Installation
```bash
npm install              # Install all dependencies
```

### Run Servers
```bash
npm run dev:restful      # Start RESTful API on port 3001
npm run dev:graphql      # Start GraphQL API on port 3002
npm run dev:both         # Start both servers simultaneously
```

### Test Examples
```bash
npm run test:restful     # Show RESTful API problems
npm run test:graphql     # Show GraphQL API benefits
npm run demo             # Run GraphQL demo
```

---

## API Quick Reference

### RESTful API (port 3001)

#### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users |
| GET | `/api/users/{id}` | Get user by ID |
| POST | `/api/users` | Create new user |
| PUT | `/api/users/{id}` | Update user |
| DELETE | `/api/users/{id}` | Delete user |

#### Posts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/posts` | Get all posts |
| GET | `/api/posts/{id}` | Get post by ID |
| POST | `/api/posts` | Create new post |
| PUT | `/api/posts/{id}` | Update post |
| DELETE | `/api/posts/{id}` | Delete post |

### GraphQL API (port 3002)

#### Queries
```graphql
users                    # Get all users
user(id: ID!)           # Get single user
posts                   # Get all posts
post(id: ID!)           # Get single post
searchUsers(keyword)    # Search users
stats                   # Get statistics
```

#### Mutations
```graphql
createUser              # Create new user
updateUser              # Update user
deleteUser              # Delete user
createPost              # Create new post
updatePost              # Update post
deletePost              # Delete post
likePost                # Like a post
```

---

## Common cURL Examples

### RESTful
```bash
# Get users
curl http://localhost:3001/api/users

# Get specific user
curl http://localhost:3001/api/users/1

# Create user
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Bob","email":"bob@example.com"}'
```

### GraphQL
```bash
# Query users
curl -X POST http://localhost:3002/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ users { id name } }"}'

# Mutation
curl -X POST http://localhost:3002/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation { createUser(name: \"Alice\", email: \"alice@example.com\") { id } }"}'
```

---

## RESTful vs GraphQL at a Glance

| Feature | RESTful | GraphQL |
|---------|---------|---------|
| Requests | Multiple | Single |
| Endpoints | Many | One |
| Over-fetching | ❌ Yes | ✅ No |
| Under-fetching | ❌ Yes | ✅ No |
| Caching | ✅ Easy | ⚠️ Difficult |
| Learning | ✅ Simple | ⚠️ Complex |
| Real-time | ⚠️ Polling | ✅ Subscriptions |
| Query Syntax | HTTP verbs | Query language |
| Version Management | ✅ v1, v2 | ✅ No versioning |
| Performance | ✅ Fast | ⚠️ Depends on queries |

---

## When to Use What

### Use RESTful When:
- ✅ Simple, CRUD operations
- ✅ Resource-based design fits
- ✅ HTTP caching critical
- ✅ Team familiar with REST
- ✅ High throughput needed
- ✅ Public API with stable structure

### Use GraphQL When:
- ✅ Complex data relationships
- ✅ Multiple clients with different needs
- ✅ Rapid API evolution
- ✅ Real-time features needed
- ✅ Bandwidth optimization critical
- ✅ Single unified API

### Use Both When:
- ✅ Legacy + modern clients
- ✅ Gradual migration
- ✅ Different departments
- ✅ Hybrid architecture needed

---

## Documentation Map

| Document | Purpose | Best For |
|----------|---------|----------|
| README.md | Overview & structure | Getting started |
| SETUP.md | Installation & running | First-time setup |
| architecture.md | Detailed comparison | Understanding design |
| api-endpoints.md | REST endpoints | API reference |
| graphql-schema.md | GraphQL types | Query building |
| performance-analysis.md | Metrics & benchmarks | Decision making |
| case-studies.md | Real-world examples | Business context |
| sample-data.json | Test data | API testing |

---

## File Structure

```
project/
├── examples/
│   ├── restful-api.js          # REST server
│   ├── graphql-api.js          # GraphQL server
│   ├── restful-client.js       # REST demo
│   └── graphql-client.js       # GraphQL demo
├── docs/
│   ├── architecture.md
│   ├── api-endpoints.md
│   ├── graphql-schema.md
│   ├── performance-analysis.md
│   ├── case-studies.md
│   └── SETUP.md
├── package.json
├── sample-data.json
└── README.md
```

---

## Testing Workflow

### 1. Local Development
```bash
npm run dev:both        # Both servers
curl http://localhost:3001/api/users
curl -X POST http://localhost:3002/graphql
```

### 2. Performance Testing
```bash
npm run test:restful    # See REST limitations
npm run test:graphql    # See GraphQL benefits
```

### 3. Compare Results
- Check bandwidth differences
- Check request counts
- Check response times

---

## Troubleshooting Quick Fixes

| Problem | Solution |
|---------|----------|
| Port in use | `taskkill /PID <id> /F` (Windows) |
| Module not found | `npm install` |
| Server won't start | Check port/firewall |
| GraphQL query fails | Check schema/syntax |
| REST returns 404 | Check endpoint/method |

---

## Key Concepts

### RESTful Key Terms
- **Resources** - /users, /posts, /comments
- **Methods** - GET, POST, PUT, DELETE
- **Status Codes** - 200, 201, 404, 500
- **Over-fetching** - Getting more data than needed
- **Under-fetching** - Getting less data than needed

### GraphQL Key Terms
- **Schema** - Type definitions
- **Query** - Request data
- **Mutation** - Modify data
- **Resolver** - Function that returns data
- **Type** - Object definition

---

## Real-World Comparison

```
Scenario: Get user with 10 posts + 5 comments each

RESTful:
1. GET /api/users/1                    (500 bytes)
2. GET /api/posts?userId=1             (50 KB)
3. GET /api/comments?postId=1,2,3...   (25 KB)
Total: 3 requests, 75 KB

GraphQL:
1. POST /graphql (single query)         (15 KB)
Total: 1 request, 15 KB

Savings: 80% bandwidth, 66% requests
```

---

## Performance Tips

### RESTful Optimization
1. Use HTTP/2 multiplexing
2. Enable gzip compression
3. Implement ETag caching
4. Use pagination
5. Optimize database queries

### GraphQL Optimization
1. Implement DataLoader
2. Set query depth limits
3. Use persisted queries
4. Cache at client level
5. Monitor query complexity

---

## Resources

- [Express.js](https://expressjs.com/)
- [Apollo Server](https://www.apollographql.com/docs/apollo-server/)
- [GraphQL Official](https://graphql.org/)
- [REST API Best Practices](https://restfulapi.net/)

---

## Next Steps

1. Read [README.md](./README.md) for overview
2. Follow [SETUP.md](./SETUP.md) to install
3. Run `npm run dev:both` to start servers
4. Test APIs with curl or Postman
5. Read docs for deeper understanding
6. Modify examples to experiment
7. Deploy to Azure/cloud

---

## Key Takeaways

| Point | Insight |
|-------|---------|
| **Not Either/Or** | Many companies use both |
| **Choose by Problem** | REST for simple, GraphQL for complex |
| **Performance Tradeoff** | REST faster, GraphQL more efficient |
| **Developer Experience** | GraphQL better for flexibility |
| **Operational Complexity** | REST simpler to operate |
| **Future Proof** | GraphQL better for evolving APIs |

---

Last Updated: January 2024
For more information, see detailed documentation in `/docs` folder.
