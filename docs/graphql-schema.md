# GraphQL Schema Documentation

## Endpoint
```
POST http://localhost:3002/graphql
```

## GraphQL Types

### User Type
```graphql
type User {
  id: ID!              # Unique identifier
  name: String!        # User's full name
  email: String!       # Email address
  age: Int             # Age (optional)
  posts: [Post!]!      # List of user's posts
  postCount: Int!      # Total number of posts
}
```

### Post Type
```graphql
type Post {
  id: ID!              # Unique identifier
  title: String!       # Post title
  content: String!     # Post content
  likes: Int!          # Number of likes
  createdAt: String!   # Creation date (ISO format)
  author: User!        # Post author
}
```

### Stats Type
```graphql
type Stats {
  totalUsers: Int!     # Total user count
  totalPosts: Int!     # Total post count
  averageLikes: Float! # Average likes per post
}
```

---

## Queries

### Query Root Type
```graphql
type Query {
  # Get all users with optional pagination
  users(limit: Int, offset: Int): [User!]!
  
  # Get user by ID
  user(id: ID!): User
  
  # Get all posts with filtering and sorting
  posts(limit: Int, offset: Int, sortBy: String): [Post!]!
  
  # Get post by ID
  post(id: ID!): Post
  
  # Search users by name or email
  searchUsers(keyword: String!): [User!]!
  
  # Get API statistics
  stats: Stats!
}
```

---

## Mutations

### Mutation Root Type
```graphql
type Mutation {
  # Create new user
  createUser(
    name: String!
    email: String!
    age: Int
  ): User!
  
  # Update existing user
  updateUser(
    id: ID!
    name: String
    email: String
    age: Int
  ): User
  
  # Delete user
  deleteUser(id: ID!): Boolean!
  
  # Create new post
  createPost(
    title: String!
    content: String!
    userId: ID!
  ): Post!
  
  # Update existing post
  updatePost(
    id: ID!
    title: String
    content: String
    likes: Int
  ): Post
  
  # Delete post
  deletePost(id: ID!): Boolean!
  
  # Like a post (increment likes)
  likePost(id: ID!): Post!
}
```

---

## Query Examples

### 1. Get All Users
```graphql
query {
  users {
    id
    name
    email
  }
}
```

Response:
```json
{
  "data": {
    "users": [
      {
        "id": "1",
        "name": "John Doe",
        "email": "john@example.com"
      },
      {
        "id": "2",
        "name": "Jane Smith",
        "email": "jane@example.com"
      }
    ]
  }
}
```

### 2. Get User With Posts
```graphql
query {
  user(id: "1") {
    name
    email
    posts {
      title
      likes
      createdAt
    }
  }
}
```

Response:
```json
{
  "data": {
    "user": {
      "name": "John Doe",
      "email": "john@example.com",
      "posts": [
        {
          "title": "First Post",
          "likes": 10,
          "createdAt": "2024-01-01"
        },
        {
          "title": "Second Post",
          "likes": 25,
          "createdAt": "2024-01-02"
        }
      ]
    }
  }
}
```

### 3. Get Posts With Authors
```graphql
query {
  posts(limit: 5, sortBy: "likes") {
    title
    likes
    author {
      name
      email
    }
  }
}
```

Response:
```json
{
  "data": {
    "posts": [
      {
        "title": "Second Post",
        "likes": 25,
        "author": {
          "name": "John Doe",
          "email": "john@example.com"
        }
      },
      {
        "title": "GraphQL Guide",
        "likes": 15,
        "author": {
          "name": "Jane Smith",
          "email": "jane@example.com"
        }
      }
    ]
  }
}
```

### 4. Search Users
```graphql
query {
  searchUsers(keyword: "john") {
    id
    name
    email
    postCount
  }
}
```

Response:
```json
{
  "data": {
    "searchUsers": [
      {
        "id": "1",
        "name": "John Doe",
        "email": "john@example.com",
        "postCount": 2
      }
    ]
  }
}
```

### 5. Get Statistics
```graphql
query {
  stats {
    totalUsers
    totalPosts
    averageLikes
  }
}
```

Response:
```json
{
  "data": {
    "stats": {
      "totalUsers": 2,
      "totalPosts": 3,
      "averageLikes": 16.67
    }
  }
}
```

---

## Mutation Examples

### 1. Create User
```graphql
mutation {
  createUser(
    name: "Alice"
    email: "alice@example.com"
    age: 25
  ) {
    id
    name
    email
  }
}
```

Response:
```json
{
  "data": {
    "createUser": {
      "id": "3",
      "name": "Alice",
      "email": "alice@example.com"
    }
  }
}
```

### 2. Create Post
```graphql
mutation {
  createPost(
    title: "GraphQL Benefits"
    content: "Why GraphQL is awesome"
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

Response:
```json
{
  "data": {
    "createPost": {
      "id": "4",
      "title": "GraphQL Benefits",
      "author": {
        "name": "John Doe"
      }
    }
  }
}
```

### 3. Like Post
```graphql
mutation {
  likePost(id: "1") {
    id
    title
    likes
  }
}
```

Response:
```json
{
  "data": {
    "likePost": {
      "id": "1",
      "title": "First Post",
      "likes": 11
    }
  }
}
```

### 4. Update User
```graphql
mutation {
  updateUser(
    id: "1"
    name: "John Updated"
    age: 29
  ) {
    id
    name
    age
  }
}
```

Response:
```json
{
  "data": {
    "updateUser": {
      "id": "1",
      "name": "John Updated",
      "age": 29
    }
  }
}
```

### 5. Delete Post
```graphql
mutation {
  deletePost(id: "1")
}
```

Response:
```json
{
  "data": {
    "deletePost": true
  }
}
```

---

## Query Variables

### Named Query with Variables
```graphql
query GetUserPosts($userId: ID!, $limit: Int) {
  user(id: $userId) {
    name
    posts(limit: $limit) {
      title
      likes
    }
  }
}
```

Variables:
```json
{
  "userId": "1",
  "limit": 5
}
```

### Named Mutation with Variables
```graphql
mutation CreateNewPost($title: String!, $content: String!, $userId: ID!) {
  createPost(title: $title, content: $content, userId: $userId) {
    id
    title
    author {
      name
    }
  }
}
```

Variables:
```json
{
  "title": "New Post",
  "content": "Post content",
  "userId": "1"
}
```

---

## Aliases

### Using Aliases for Multiple Queries
```graphql
query {
  user1: user(id: "1") {
    name
    postCount
  }
  user2: user(id: "2") {
    name
    postCount
  }
  allUsers: users(limit: 10) {
    id
    name
  }
}
```

Response:
```json
{
  "data": {
    "user1": {
      "name": "John Doe",
      "postCount": 2
    },
    "user2": {
      "name": "Jane Smith",
      "postCount": 1
    },
    "allUsers": [...]
  }
}
```

---

## Fragments

### Reusable Query Fragments
```graphql
fragment UserFields on User {
  id
  name
  email
}

query {
  user1: user(id: "1") {
    ...UserFields
  }
  user2: user(id: "2") {
    ...UserFields
  }
}
```

---

## Error Handling

### Error Response Format
```json
{
  "data": null,
  "errors": [
    {
      "message": "User not found",
      "locations": [
        {
          "line": 2,
          "column": 3
        }
      ],
      "path": ["user"]
    }
  ]
}
```

### Partial Success
```json
{
  "data": {
    "user": {
      "name": "John Doe",
      "posts": null
    }
  },
  "errors": [
    {
      "message": "Posts not accessible",
      "path": ["user", "posts"]
    }
  ]
}
```

---

## Introspection

### Get Schema Information
```graphql
query {
  __schema {
    types {
      name
      kind
    }
  }
}
```

### Get Type Information
```graphql
query {
  __type(name: "User") {
    name
    fields {
      name
      type {
        name
        kind
      }
    }
  }
}
```

---

## Best Practices

1. **Use Variables for Dynamic Values**
   ```graphql
   # ❌ Bad
   query { user(id: "1") { name } }
   
   # ✅ Good
   query GetUser($id: ID!) { user(id: $id) { name } }
   ```

2. **Name Your Queries & Mutations**
   ```graphql
   # ✅ Good
   query GetUserWithPosts { ... }
   mutation CreateNewPost { ... }
   ```

3. **Only Request Needed Fields**
   ```graphql
   # ❌ Bad - Over-fetching
   query { user(id: "1") { * } }
   
   # ✅ Good
   query { user(id: "1") { name email } }
   ```

4. **Use Pagination**
   ```graphql
   query { users(limit: 10, offset: 0) { ... } }
   ```

5. **Handle Errors**
   ```graphql
   mutation {
     deleteUser(id: "1")
   }
   # Check for errors in response
   ```
