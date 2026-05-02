/**
 * RESTful API Example - Library System
 * Topic 3: API Design RESTful vs GraphQL
 *
 * This REST server also serves the frontend dashboard from /public.
 * Frontend URL: http://localhost:3001
 */

const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// ============================================
// SAMPLE LIBRARY DATA
// ============================================

let authors = [
  {
    id: 1,
    name: 'Robert C. Martin',
    country: 'United States',
    birthYear: 1952,
    bio: 'Software engineer and author known for Clean Code and software craftsmanship.'
  },
  {
    id: 2,
    name: 'Martin Fowler',
    country: 'United Kingdom',
    birthYear: 1963,
    bio: 'Author and consultant known for enterprise application architecture and refactoring.'
  },
  {
    id: 3,
    name: 'Kyle Simpson',
    country: 'United States',
    birthYear: 1978,
    bio: 'JavaScript educator and author of the You Don\'t Know JS book series.'
  }
];

let categories = [
  { id: 1, name: 'Software Engineering', description: 'Books about software design, clean code, and engineering practices.' },
  { id: 2, name: 'Web Development', description: 'Books about JavaScript, frontend, backend, and modern web technologies.' },
  { id: 3, name: 'Architecture', description: 'Books about system design, patterns, and enterprise architecture.' }
];

let books = [
  {
    id: 1,
    title: 'Clean Code',
    isbn: '9780132350884',
    publishedYear: 2008,
    pages: 464,
    rating: 4.7,
    totalCopies: 8,
    availableCopies: 5,
    authorId: 1,
    categoryId: 1,
    description: 'A handbook of agile software craftsmanship with principles for writing readable and maintainable code.',
    createdAt: '2026-04-01T08:00:00.000Z',
    updatedAt: '2026-04-20T10:15:00.000Z'
  },
  {
    id: 2,
    title: 'Refactoring',
    isbn: '9780134757599',
    publishedYear: 2018,
    pages: 448,
    rating: 4.6,
    totalCopies: 6,
    availableCopies: 2,
    authorId: 2,
    categoryId: 3,
    description: 'A practical guide to improving the design of existing code without changing observable behavior.',
    createdAt: '2026-04-03T08:00:00.000Z',
    updatedAt: '2026-04-19T09:00:00.000Z'
  },
  {
    id: 3,
    title: 'You Don\'t Know JS Yet',
    isbn: '9781091210092',
    publishedYear: 2020,
    pages: 278,
    rating: 4.5,
    totalCopies: 10,
    availableCopies: 7,
    authorId: 3,
    categoryId: 2,
    description: 'A deep dive into the JavaScript language for developers who want to understand JS internals.',
    createdAt: '2026-04-06T08:00:00.000Z',
    updatedAt: '2026-04-18T11:30:00.000Z'
  }
];

let borrowRecords = [
  { id: 1, bookId: 1, borrowerName: 'Nguyen Van A', borrowedAt: '2026-04-10', returnedAt: null },
  { id: 2, bookId: 2, borrowerName: 'Tran Thi B', borrowedAt: '2026-04-12', returnedAt: null },
  { id: 3, bookId: 3, borrowerName: 'Le Van C', borrowedAt: '2026-04-14', returnedAt: '2026-04-22' }
];

let nextBookId = 4;
let nextBorrowRecordId = 4;

function enrichBook(book) {
  return {
    ...book,
    author: authors.find(author => author.id === book.authorId) || null,
    category: categories.find(category => category.id === book.categoryId) || null,
    borrowRecords: borrowRecords.filter(record => record.bookId === book.id)
  };
}

// ============================================
// FRONTEND ENTRY
// ============================================

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// ============================================
// HEALTH / INFO
// ============================================

app.get('/api', (req, res) => {
  res.json({
    message: 'RESTful Library API is running',
    frontend: 'http://localhost:3001',
    graphql: 'http://localhost:3002/graphql',
    endpoints: [
      'GET /api/books',
      'GET /api/books/:id',
      'GET /api/books/:id/with-details',
      'POST /api/books',
      'PUT /api/books/:id',
      'DELETE /api/books/:id',
      'GET /api/authors',
      'GET /api/authors/:id',
      'GET /api/authors/:id/books',
      'GET /api/categories',
      'GET /api/stats',
      'POST /api/borrow'
    ]
  });
});

// ============================================
// BOOK ENDPOINTS
// ============================================

app.get('/api/books', (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const start = (page - 1) * limit;
  const end = start + limit;

  // REST often returns a fixed representation. In the frontend demo, only title,
  // author and availability are needed, so fields like isbn/pages/description/etc.
  // show an OVER-FETCHING case.
  res.json({
    data: books.slice(start, end),
    pagination: {
      page,
      limit,
      total: books.length,
      totalPages: Math.ceil(books.length / limit)
    }
  });
});

app.get('/api/books/:id', (req, res) => {
  const book = books.find(item => item.id === parseInt(req.params.id, 10));

  if (!book) {
    return res.status(404).json({ error: 'Book not found' });
  }

  // UNDER-FETCHING case: this response only has authorId/categoryId.
  // Frontend needs extra calls to /api/authors/:id and /api/categories/:id.
  res.json(book);
});

app.get('/api/books/:id/with-details', (req, res) => {
  const book = books.find(item => item.id === parseInt(req.params.id, 10));

  if (!book) {
    return res.status(404).json({ error: 'Book not found' });
  }

  // Convenience endpoint, but it can over-fetch if the UI does not need all nested fields.
  res.json(enrichBook(book));
});

app.post('/api/books', (req, res) => {
  const { title, isbn, publishedYear, pages, rating, totalCopies, availableCopies, authorId, categoryId, description } = req.body;

  if (!title || !authorId || !categoryId) {
    return res.status(400).json({ error: 'title, authorId and categoryId are required' });
  }

  const author = authors.find(item => item.id === Number(authorId));
  const category = categories.find(item => item.id === Number(categoryId));

  if (!author || !category) {
    return res.status(400).json({ error: 'Invalid authorId or categoryId' });
  }

  const newBook = {
    id: nextBookId++,
    title,
    isbn: isbn || `ISBN-${Date.now()}`,
    publishedYear: Number(publishedYear) || new Date().getFullYear(),
    pages: Number(pages) || 0,
    rating: Number(rating) || 0,
    totalCopies: Number(totalCopies) || 1,
    availableCopies: Number(availableCopies) || Number(totalCopies) || 1,
    authorId: Number(authorId),
    categoryId: Number(categoryId),
    description: description || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  books.push(newBook);
  res.status(201).json(newBook);
});

app.put('/api/books/:id', (req, res) => {
  const book = books.find(item => item.id === parseInt(req.params.id, 10));

  if (!book) {
    return res.status(404).json({ error: 'Book not found' });
  }

  const editableFields = ['title', 'isbn', 'publishedYear', 'pages', 'rating', 'totalCopies', 'availableCopies', 'authorId', 'categoryId', 'description'];
  editableFields.forEach(field => {
    if (req.body[field] !== undefined) {
      book[field] = ['publishedYear', 'pages', 'rating', 'totalCopies', 'availableCopies', 'authorId', 'categoryId'].includes(field)
        ? Number(req.body[field])
        : req.body[field];
    }
  });
  book.updatedAt = new Date().toISOString();

  res.json(book);
});

app.delete('/api/books/:id', (req, res) => {
  const index = books.findIndex(item => item.id === parseInt(req.params.id, 10));

  if (index === -1) {
    return res.status(404).json({ error: 'Book not found' });
  }

  const [deletedBook] = books.splice(index, 1);
  borrowRecords = borrowRecords.filter(record => record.bookId !== deletedBook.id);

  res.json({ message: 'Book deleted', deleted: deletedBook });
});

// ============================================
// AUTHOR / CATEGORY / BORROW ENDPOINTS
// ============================================

app.get('/api/authors', (req, res) => {
  res.json(authors);
});

app.get('/api/authors/:id', (req, res) => {
  const author = authors.find(item => item.id === parseInt(req.params.id, 10));

  if (!author) {
    return res.status(404).json({ error: 'Author not found' });
  }

  res.json(author);
});

app.get('/api/authors/:id/books', (req, res) => {
  const authorId = parseInt(req.params.id, 10);
  res.json(books.filter(book => book.authorId === authorId));
});

app.get('/api/categories', (req, res) => {
  res.json(categories);
});

app.get('/api/categories/:id', (req, res) => {
  const category = categories.find(item => item.id === parseInt(req.params.id, 10));

  if (!category) {
    return res.status(404).json({ error: 'Category not found' });
  }

  res.json(category);
});

app.get('/api/borrow-records', (req, res) => {
  res.json(borrowRecords);
});

app.post('/api/borrow', (req, res) => {
  const { bookId, borrowerName } = req.body;
  const book = books.find(item => item.id === Number(bookId));

  if (!book) {
    return res.status(404).json({ error: 'Book not found' });
  }

  if (!borrowerName) {
    return res.status(400).json({ error: 'borrowerName is required' });
  }

  if (book.availableCopies <= 0) {
    return res.status(400).json({ error: 'No available copies' });
  }

  book.availableCopies -= 1;
  book.updatedAt = new Date().toISOString();

  const record = {
    id: nextBorrowRecordId++,
    bookId: book.id,
    borrowerName,
    borrowedAt: new Date().toISOString().split('T')[0],
    returnedAt: null
  };
  borrowRecords.push(record);

  res.status(201).json({ record, book });
});

app.get('/api/stats', (req, res) => {
  const totalCopies = books.reduce((sum, book) => sum + book.totalCopies, 0);
  const availableCopies = books.reduce((sum, book) => sum + book.availableCopies, 0);

  res.json({
    totalBooks: books.length,
    totalAuthors: authors.length,
    totalCategories: categories.length,
    totalCopies,
    availableCopies,
    borrowedCopies: totalCopies - availableCopies,
    averageRating: Number((books.reduce((sum, book) => sum + book.rating, 0) / books.length).toFixed(2))
  });
});

// ============================================
// ERROR HANDLING
// ============================================

app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`\n╔════════════════════════════════════╗`);
  console.log(`║ RESTful API + Frontend Server      ║`);
  console.log(`║ Frontend: http://localhost:${PORT}    ║`);
  console.log(`║ REST API: http://localhost:${PORT}/api ║`);
  console.log(`╚════════════════════════════════════╝\n`);

  console.log('📍 Main REST Endpoints:');
  console.log('   GET    /api/books');
  console.log('   GET    /api/books/:id');
  console.log('   GET    /api/books/:id/with-details');
  console.log('   POST   /api/books');
  console.log('   PUT    /api/books/:id');
  console.log('   DELETE /api/books/:id');
  console.log('   GET    /api/authors');
  console.log('   GET    /api/categories');
  console.log('   GET    /api/stats');
  console.log('');
});

module.exports = app;
