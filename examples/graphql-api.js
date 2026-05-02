/**
 * GraphQL API Example - Library System
 * Topic 3: API Design RESTful vs GraphQL
 *
 * GraphQL endpoint: http://localhost:3002/graphql
 */

const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');

// ============================================
// SAMPLE LIBRARY DATA
// ============================================

const authors = [
  {
    id: '1',
    name: 'Robert C. Martin',
    country: 'United States',
    birthYear: 1952,
    bio: 'Software engineer and author known for Clean Code and software craftsmanship.'
  },
  {
    id: '2',
    name: 'Martin Fowler',
    country: 'United Kingdom',
    birthYear: 1963,
    bio: 'Author and consultant known for enterprise application architecture and refactoring.'
  },
  {
    id: '3',
    name: 'Kyle Simpson',
    country: 'United States',
    birthYear: 1978,
    bio: 'JavaScript educator and author of the You Don\'t Know JS book series.'
  }
];

const categories = [
  { id: '1', name: 'Software Engineering', description: 'Books about software design, clean code, and engineering practices.' },
  { id: '2', name: 'Web Development', description: 'Books about JavaScript, frontend, backend, and modern web technologies.' },
  { id: '3', name: 'Architecture', description: 'Books about system design, patterns, and enterprise architecture.' }
];

const books = [
  {
    id: '1',
    title: 'Clean Code',
    isbn: '9780132350884',
    publishedYear: 2008,
    pages: 464,
    rating: 4.7,
    totalCopies: 8,
    availableCopies: 5,
    authorId: '1',
    categoryId: '1',
    description: 'A handbook of agile software craftsmanship with principles for writing readable and maintainable code.',
    createdAt: '2026-04-01T08:00:00.000Z',
    updatedAt: '2026-04-20T10:15:00.000Z'
  },
  {
    id: '2',
    title: 'Refactoring',
    isbn: '9780134757599',
    publishedYear: 2018,
    pages: 448,
    rating: 4.6,
    totalCopies: 6,
    availableCopies: 2,
    authorId: '2',
    categoryId: '3',
    description: 'A practical guide to improving the design of existing code without changing observable behavior.',
    createdAt: '2026-04-03T08:00:00.000Z',
    updatedAt: '2026-04-19T09:00:00.000Z'
  },
  {
    id: '3',
    title: 'You Don\'t Know JS Yet',
    isbn: '9781091210092',
    publishedYear: 2020,
    pages: 278,
    rating: 4.5,
    totalCopies: 10,
    availableCopies: 7,
    authorId: '3',
    categoryId: '2',
    description: 'A deep dive into the JavaScript language for developers who want to understand JS internals.',
    createdAt: '2026-04-06T08:00:00.000Z',
    updatedAt: '2026-04-18T11:30:00.000Z'
  }
];

const borrowRecords = [
  { id: '1', bookId: '1', borrowerName: 'Nguyen Van A', borrowedAt: '2026-04-10', returnedAt: null },
  { id: '2', bookId: '2', borrowerName: 'Tran Thi B', borrowedAt: '2026-04-12', returnedAt: null },
  { id: '3', bookId: '3', borrowerName: 'Le Van C', borrowedAt: '2026-04-14', returnedAt: '2026-04-22' }
];

let nextBookId = 4;
let nextBorrowRecordId = 4;

// ============================================
// GRAPHQL SCHEMA
// ============================================

const typeDefs = `#graphql
  type Author {
    id: ID!
    name: String!
    country: String!
    birthYear: Int
    bio: String
    books: [Book!]!
  }

  type Category {
    id: ID!
    name: String!
    description: String
    books: [Book!]!
  }

  type Book {
    id: ID!
    title: String!
    isbn: String!
    publishedYear: Int!
    pages: Int!
    rating: Float!
    totalCopies: Int!
    availableCopies: Int!
    description: String
    createdAt: String!
    updatedAt: String!
    author: Author!
    category: Category!
    borrowRecords: [BorrowRecord!]!
  }

  type BorrowRecord {
    id: ID!
    book: Book!
    borrowerName: String!
    borrowedAt: String!
    returnedAt: String
  }

  type Stats {
    totalBooks: Int!
    totalAuthors: Int!
    totalCategories: Int!
    totalCopies: Int!
    availableCopies: Int!
    borrowedCopies: Int!
    averageRating: Float!
  }

  type Query {
    books(limit: Int, offset: Int, keyword: String): [Book!]!
    book(id: ID!): Book
    authors: [Author!]!
    author(id: ID!): Author
    categories: [Category!]!
    category(id: ID!): Category
    borrowRecords: [BorrowRecord!]!
    stats: Stats!
  }

  type Mutation {
    createBook(
      title: String!
      isbn: String
      publishedYear: Int
      pages: Int
      rating: Float
      totalCopies: Int
      availableCopies: Int
      authorId: ID!
      categoryId: ID!
      description: String
    ): Book!

    updateBook(
      id: ID!
      title: String
      isbn: String
      publishedYear: Int
      pages: Int
      rating: Float
      totalCopies: Int
      availableCopies: Int
      authorId: ID
      categoryId: ID
      description: String
    ): Book

    deleteBook(id: ID!): Boolean!
    borrowBook(bookId: ID!, borrowerName: String!): BorrowRecord!
    returnBook(recordId: ID!): BorrowRecord
  }
`;

// ============================================
// GRAPHQL RESOLVERS
// ============================================

const resolvers = {
  Query: {
    books(parent, args) {
      let result = books;

      if (args.keyword) {
        const keyword = args.keyword.toLowerCase();
        result = result.filter(book => book.title.toLowerCase().includes(keyword));
      }

      const offset = args.offset || 0;
      const limit = args.limit || 10;
      return result.slice(offset, offset + limit);
    },
    book(parent, args) {
      return books.find(book => book.id === args.id) || null;
    },
    authors() {
      return authors;
    },
    author(parent, args) {
      return authors.find(author => author.id === args.id) || null;
    },
    categories() {
      return categories;
    },
    category(parent, args) {
      return categories.find(category => category.id === args.id) || null;
    },
    borrowRecords() {
      return borrowRecords;
    },
    stats() {
      const totalCopies = books.reduce((sum, book) => sum + book.totalCopies, 0);
      const availableCopies = books.reduce((sum, book) => sum + book.availableCopies, 0);
      return {
        totalBooks: books.length,
        totalAuthors: authors.length,
        totalCategories: categories.length,
        totalCopies,
        availableCopies,
        borrowedCopies: totalCopies - availableCopies,
        averageRating: Number((books.reduce((sum, book) => sum + book.rating, 0) / books.length).toFixed(2))
      };
    }
  },

  Mutation: {
    createBook(parent, args) {
      const author = authors.find(item => item.id === args.authorId);
      const category = categories.find(item => item.id === args.categoryId);

      if (!author || !category) {
        throw new Error('Invalid authorId or categoryId');
      }

      const totalCopies = args.totalCopies || 1;
      const newBook = {
        id: String(nextBookId++),
        title: args.title,
        isbn: args.isbn || `ISBN-${Date.now()}`,
        publishedYear: args.publishedYear || new Date().getFullYear(),
        pages: args.pages || 0,
        rating: args.rating || 0,
        totalCopies,
        availableCopies: args.availableCopies ?? totalCopies,
        authorId: args.authorId,
        categoryId: args.categoryId,
        description: args.description || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      books.push(newBook);
      return newBook;
    },

    updateBook(parent, args) {
      const book = books.find(item => item.id === args.id);
      if (!book) return null;

      const editableFields = ['title', 'isbn', 'publishedYear', 'pages', 'rating', 'totalCopies', 'availableCopies', 'authorId', 'categoryId', 'description'];
      editableFields.forEach(field => {
        if (args[field] !== undefined) {
          book[field] = args[field];
        }
      });
      book.updatedAt = new Date().toISOString();

      return book;
    },

    deleteBook(parent, args) {
      const index = books.findIndex(book => book.id === args.id);
      if (index === -1) return false;

      books.splice(index, 1);
      for (let i = borrowRecords.length - 1; i >= 0; i -= 1) {
        if (borrowRecords[i].bookId === args.id) {
          borrowRecords.splice(i, 1);
        }
      }
      return true;
    },

    borrowBook(parent, args) {
      const book = books.find(item => item.id === args.bookId);
      if (!book) throw new Error('Book not found');
      if (book.availableCopies <= 0) throw new Error('No available copies');

      book.availableCopies -= 1;
      book.updatedAt = new Date().toISOString();

      const record = {
        id: String(nextBorrowRecordId++),
        bookId: book.id,
        borrowerName: args.borrowerName,
        borrowedAt: new Date().toISOString().split('T')[0],
        returnedAt: null
      };
      borrowRecords.push(record);
      return record;
    },

    returnBook(parent, args) {
      const record = borrowRecords.find(item => item.id === args.recordId);
      if (!record || record.returnedAt) return null;

      record.returnedAt = new Date().toISOString().split('T')[0];
      const book = books.find(item => item.id === record.bookId);
      if (book) {
        book.availableCopies += 1;
        book.updatedAt = new Date().toISOString();
      }
      return record;
    }
  },

  Author: {
    books(parent) {
      return books.filter(book => book.authorId === parent.id);
    }
  },

  Category: {
    books(parent) {
      return books.filter(book => book.categoryId === parent.id);
    }
  },

  Book: {
    author(parent) {
      return authors.find(author => author.id === parent.authorId);
    },
    category(parent) {
      return categories.find(category => category.id === parent.categoryId);
    },
    borrowRecords(parent) {
      return borrowRecords.filter(record => record.bookId === parent.id);
    }
  },

  BorrowRecord: {
    book(parent) {
      return books.find(book => book.id === parent.bookId);
    }
  }
};

// ============================================
// APOLLO SERVER
// ============================================

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true
});

const PORT = Number(process.env.PORT) || 3002;

async function startServer() {
  const { url } = await startStandaloneServer(server, {
    listen: { port: PORT }
  });

  console.log(`\n╔════════════════════════════════════╗`);
  console.log(`║ GraphQL Library API Server         ║`);
  console.log(`║ Running on: ${url.padEnd(23)}║`);
  console.log(`╚════════════════════════════════════╝\n`);

  console.log(`📍 GraphQL Sandbox: ${url}`);
  console.log('');
  console.log('📝 Example Query:');
  console.log('  query {');
  console.log('    books {');
  console.log('      id');
  console.log('      title');
  console.log('      author { name }');
  console.log('      category { name }');
  console.log('      availableCopies');
  console.log('    }');
  console.log('  }');
  console.log('');
  console.log('📝 Example Mutation:');
  console.log('  mutation {');
  console.log('    createBook(title: "Designing APIs", authorId: "1", categoryId: "1", totalCopies: 3) {');
  console.log('      id title author { name }');
  console.log('    }');
  console.log('  }');
  console.log('');
}

startServer().catch(error => {
  console.error('Failed to start GraphQL server:', error);
  process.exit(1);
});
