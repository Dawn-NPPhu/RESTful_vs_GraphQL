# Frontend Demo Guide - RESTful vs GraphQL

## Run the project

```bash
npm install
npm run dev:both
```

Open these links:

- Frontend dashboard: http://localhost:3001
- REST API info: http://localhost:3001/api
- REST books endpoint: http://localhost:3001/api/books
- GraphQL Sandbox: http://localhost:3002/graphql

## What to show in the video

### 1. REST over-fetching
Click **REST Over-fetching**.

The frontend only displays: title, author/category IDs, availability and rating.
However, REST returns a fixed object containing extra fields such as ISBN, pages, timestamps, description, authorId and categoryId.

### 2. REST under-fetching
Click **REST Under-fetching**.

The frontend needs one book with author and category details. REST must call:

```http
GET /api/books/1
GET /api/authors/:id
GET /api/categories/:id
```

This demonstrates multiple requests for one screen.

### 3. GraphQL efficient query
Click **GraphQL Efficient Query**.

GraphQL uses one request:

```graphql
query GetBooksForUI {
  books {
    id
    title
    rating
    availableCopies
    totalCopies
    author { name }
    category { name }
  }
}
```

The frontend requests exactly the fields it needs.

### 4. Mutation comparison
Use the forms at the bottom:

- **Create by REST** sends `POST /api/books`.
- **Create by GraphQL** sends the `createBook` mutation.

## Report notes

This frontend helps satisfy the Topic 3 requirement: a dual-API backend providing both REST and GraphQL endpoints for a library system, and a frontend demonstration of fetching efficiency.
