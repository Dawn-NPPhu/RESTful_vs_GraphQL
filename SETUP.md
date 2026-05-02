# Setup & Running Guide

## Prerequisites

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Text Editor** or IDE (VS Code recommended)
- **Postman** or **Insomnia** (optional, for API testing)

### Verify Installation
```bash
node --version    # Should show v14.0.0 or higher
npm --version     # Should show 6.0.0 or higher
```

---

## Installation

### Step 1: Navigate to Project Directory
```bash
cd "d:\Lập trình web\Project GK\RESTful-vs-GraphQL"
```

### Step 2: Install Dependencies
```bash
npm install
```

This will install:
- `express` - RESTful API framework
- `apollo-server` - GraphQL server
- `graphql` - GraphQL library
- `concurrently` - Run multiple commands simultaneously

---

## Running the Examples

### Option 1: Start RESTful Server Only
```bash
npm run dev:restful
```

**Output:**
```
RESTful API Server running on http://localhost:3001
```

**Test with curl:**
```bash
curl http://localhost:3001/api/users
```

### Option 2: Start GraphQL Server Only
```bash
npm run dev:graphql
```

**Output:**
```
GraphQL Server running on http://localhost:3002/graphql
```

**Access Apollo Sandbox:**
- Open browser: http://localhost:3002/graphql

### Option 3: Run Both Servers Simultaneously
```bash
npm run dev:both
```

**Output:**
```
RESTful API: http://localhost:3001
GraphQL API: http://localhost:3002/graphql
```

### Option 4: View RESTful Problems Demo
```bash
npm run test:restful
```

**Shows:**
- Underfetching (2 requests needed)
- Overfetching (unnecessary fields)
- Multiple endpoints complexity
- HTTP caching challenges
- Error handling differences
- Query complexity risks
- Network requests comparison
- Real-time update difficulties

### Option 5: View GraphQL Benefits Demo
```bash
npm run test:graphql
```

**Shows:**
- Precise data fetching
- Single request completeness
- Flexible queries
- Built-in filtering
- Mutations
- Introspection
- Error handling
- Batch requests
- Query variables

---

## Project Structure

```
RESTful-vs-GraphQL/
├── package.json                 # Dependencies & scripts
├── README.md                    # Project overview
│
├── examples/
│   ├── restful-api.js          # RESTful Server (Express.js)
│   ├── graphql-api.js          # GraphQL Server (Apollo)
│   ├── restful-client.js       # RESTful API problems demo
│   └── graphql-client.js       # GraphQL benefits demo
│
└── docs/
    ├── architecture.md         # Detailed comparison
    ├── api-endpoints.md        # REST endpoints reference
    ├── graphql-schema.md       # GraphQL types & queries
    ├── performance-analysis.md # Bandwidth & latency analysis
    ├── case-studies.md         # Real-world examples
    └── SETUP.md                # This file
```

---

## Testing the APIs

### Testing RESTful API

#### Using cURL

**Get all users:**
```bash
curl http://localhost:3001/api/users
```

**Get specific user:**
```bash
curl http://localhost:3001/api/users/1
```

**Get user with posts:**
```bash
curl http://localhost:3001/api/users/1?include=posts
```

**Create new user:**
```bash
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com","age":25}'
```

**Get posts:**
```bash
curl http://localhost:3001/api/posts
```

**Get post with author:**
```bash
curl http://localhost:3001/api/posts/1
```

#### Using Postman
1. Open Postman
2. Create new request
3. Select GET/POST/PUT/DELETE
4. Enter URL: `http://localhost:3001/api/users`
5. Add headers: `Content-Type: application/json`
6. Add body for POST/PUT requests
7. Click Send

---

### Testing GraphQL API

#### Using Apollo Sandbox
1. Start GraphQL server: `npm run dev:graphql`
2. Open browser: http://localhost:3002/graphql
3. Apollo Sandbox opens automatically
4. Write your query in the editor
5. Click play button to execute

#### Using cURL

**Get all users:**
```bash
curl -X POST http://localhost:3002/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ users { id name email } }"}'
```

**Get user with posts:**
```bash
curl -X POST http://localhost:3002/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ user(id: \"1\") { name posts { title } } }"}'
```

**Create user (mutation):**
```bash
curl -X POST http://localhost:3002/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { createUser(name: \"Bob\", email: \"bob@example.com\") { id name } }"
  }'
```

#### Using Insomnia
1. Open Insomnia
2. Create new request (GraphQL)
3. Set URL: `http://localhost:3002/graphql`
4. Enter query in GraphQL editor
5. Click Send

---

## Example Queries for GraphQL API

### Simple Query
```graphql
query {
  users {
    name
    email
  }
}
```

### Query with Filtering
```graphql
query {
  posts(sortBy: "likes") {
    title
    likes
    author {
      name
    }
  }
}
```

### Mutation
```graphql
mutation {
  createPost(
    title: "My First Post",
    content: "Hello GraphQL!",
    userId: "1"
  ) {
    id
    title
    author {
      name
    }
  }
}
```

### Query with Variables
```graphql
query GetUser($id: ID!) {
  user(id: $id) {
    name
    email
    posts {
      title
    }
  }
}
```

Variables:
```json
{
  "id": "1"
}
```

---

## Troubleshooting

### Issue: "npm: command not found"
**Solution:** Install Node.js from https://nodejs.org/

### Issue: Port 3001 already in use
**Solution:** 
```bash
# Kill process on port 3001
# On Windows:
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# On Mac/Linux:
lsof -ti:3001 | xargs kill -9
```

### Issue: Port 3002 already in use
**Solution:** Same as above but for port 3002

### Issue: "Cannot find module 'express'"
**Solution:**
```bash
npm install
```

### Issue: "concurrently not found"
**Solution:**
```bash
npm install --save-dev concurrently
```

### Issue: Servers won't start
**Solution:**
1. Check if Node.js is installed: `node --version`
2. Check if dependencies installed: `npm install`
3. Check console for errors
4. Try running individual servers first

---

## Performance Comparison Test

### Step 1: Start both servers
```bash
npm run dev:both
```

### Step 2: Open Terminal/Command Prompt

### Step 3: Make RESTful requests (3 requests)
```bash
# Request 1: Get user
curl http://localhost:3001/api/users/1

# Request 2: Get posts
curl http://localhost:3001/api/posts?userId=1

# Request 3: Get comments (if available)
curl http://localhost:3001/api/posts/1/comments
```

### Step 4: Make GraphQL request (1 request)
```bash
curl -X POST http://localhost:3002/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "{ user(id: \"1\") { name posts { title } } }"
  }'
```

### Results
- **RESTful:** 3 separate requests needed
- **GraphQL:** 1 single request

---

## Documentation Files

### For Understanding Architecture
- Read: [architecture.md](./docs/architecture.md)
- Contains: Detailed comparison, use cases, pros/cons

### For RESTful API Details
- Read: [api-endpoints.md](./docs/api-endpoints.md)
- Contains: All endpoints, examples, best practices

### For GraphQL Details
- Read: [graphql-schema.md](./docs/graphql-schema.md)
- Contains: Schema, types, query examples

### For Performance Metrics
- Read: [performance-analysis.md](./docs/performance-analysis.md)
- Contains: Bandwidth, latency, caching analysis

### For Real-World Context
- Read: [case-studies.md](./docs/case-studies.md)
- Contains: How companies use REST vs GraphQL

---

## Next Steps

1. **Run the servers:** `npm run dev:both`
2. **Test APIs:** Use curl or Postman
3. **Read documentation:** Start with README.md
4. **Compare approaches:** Run demo files
5. **Modify examples:** Try changing queries to understand better
6. **Deploy:** Deploy to cloud (Azure, AWS, Heroku)

---

## Resources

### Official Documentation
- [Express.js Docs](https://expressjs.com/)
- [Apollo Server Docs](https://www.apollographql.com/docs/apollo-server/)
- [GraphQL Official](https://graphql.org/)

### Learning Resources
- [REST API Tutorial](https://www.restapitutorial.com/)
- [GraphQL Full Course](https://graphql.org/learn/)
- [Building APIs with GraphQL](https://www.pluralsight.com/)

### Tools
- [Postman API Platform](https://www.postman.com/)
- [Insomnia API Client](https://insomnia.rest/)
- [Apollo Sandbox](https://sandbox.apollo.dev/)

---

## Support

For issues or questions:
1. Check documentation in `/docs` folder
2. Review code comments in example files
3. Check troubleshooting section above
4. Review Real-World Case Studies for context
