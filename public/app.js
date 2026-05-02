const REST_BASE = window.location.origin;
const GRAPHQL_URL = 'http://localhost:3002/graphql';

const elements = {
  restStatus: document.getElementById('restStatus'),
  graphqlStatus: document.getElementById('graphqlStatus'),
  restDot: document.getElementById('restDot'),
  graphqlDot: document.getElementById('graphqlDot'),
  restRequests: document.getElementById('restRequests'),
  restTime: document.getElementById('restTime'),
  restBytes: document.getElementById('restBytes'),
  graphqlRequests: document.getElementById('graphqlRequests'),
  graphqlTime: document.getElementById('graphqlTime'),
  graphqlBytes: document.getElementById('graphqlBytes'),
  restOutput: document.getElementById('restOutput'),
  graphqlOutput: document.getElementById('graphqlOutput'),
  restLabel: document.getElementById('restLabel'),
  graphqlLabel: document.getElementById('graphqlLabel'),
  booksTable: document.getElementById('booksTable'),
  summaryText: document.getElementById('summaryText')
};

function byteSize(data) {
  return new Blob([JSON.stringify(data)]).size;
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(2)} KB`;
}

function formatMs(ms) {
  return `${Math.round(ms)} ms`;
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function setStatus(type, ok, text) {
  const status = type === 'rest' ? elements.restStatus : elements.graphqlStatus;
  const dot = type === 'rest' ? elements.restDot : elements.graphqlDot;
  status.textContent = text;
  dot.classList.remove('ok', 'bad');
  dot.classList.add(ok ? 'ok' : 'bad');
}

function setMetrics(type, requestCount, elapsedMs, bytes) {
  if (type === 'rest') {
    elements.restRequests.textContent = requestCount;
    elements.restTime.textContent = formatMs(elapsedMs);
    elements.restBytes.textContent = formatBytes(bytes);
  } else {
    elements.graphqlRequests.textContent = requestCount;
    elements.graphqlTime.textContent = formatMs(elapsedMs);
    elements.graphqlBytes.textContent = formatBytes(bytes);
  }
}

function printJson(target, data) {
  target.textContent = JSON.stringify(data, null, 2);
}

function normalizeBooksFromRest(data, authorsById = {}, categoriesById = {}) {
  const books = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [data];
  return books.map(book => ({
    title: book.title,
    author: book.author?.name || authorsById[book.authorId]?.name || `authorId: ${book.authorId}`,
    category: book.category?.name || categoriesById[book.categoryId]?.name || `categoryId: ${book.categoryId}`,
    availableCopies: book.availableCopies,
    totalCopies: book.totalCopies,
    rating: book.rating ?? '-'
  }));
}

function normalizeBooksFromGraphQL(data) {
  const books = data?.data?.books || (data?.data?.createBook ? [data.data.createBook] : []);
  return books.map(book => ({
    title: book.title,
    author: book.author?.name || '-',
    category: book.category?.name || '-',
    availableCopies: book.availableCopies ?? '-',
    totalCopies: book.totalCopies ?? '-',
    rating: book.rating ?? '-'
  }));
}

function renderBooks(books) {
  if (!books.length) {
    elements.booksTable.innerHTML = '<tr><td colspan="5" class="empty">No books found.</td></tr>';
    return;
  }

  elements.booksTable.innerHTML = books
    .map(book => `
      <tr>
        <td>${book.title}</td>
        <td>${book.author}</td>
        <td>${book.category}</td>
        <td>${book.availableCopies}/${book.totalCopies}</td>
        <td>${book.rating}</td>
      </tr>
    `)
    .join('');
}

async function timedRest(path) {
  const start = performance.now();
  const response = await fetch(`${REST_BASE}${path}`);
  const data = await response.json();
  const elapsed = performance.now() - start;
  return { data, elapsed, bytes: byteSize(data), status: response.status };
}

async function timedGraphQL(query, variables = {}) {
  const start = performance.now();
  const response = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables })
  });
  const data = await response.json();
  const elapsed = performance.now() - start;
  return { data, elapsed, bytes: byteSize(data), status: response.status };
}

async function checkServers() {
  try {
    await timedRest('/api');
    setStatus('rest', true, 'Running on :3001');
  } catch (error) {
    setStatus('rest', false, 'Not running');
  }

  try {
    const result = await timedGraphQL('query { stats { totalBooks } }');
    if (result.data?.data?.stats) {
      setStatus('graphql', true, 'Running on :3002/graphql');
    } else {
      setStatus('graphql', false, 'Schema error');
    }
  } catch (error) {
    setStatus('graphql', false, 'Not running');
  }
}

async function restOverfetchingDemo() {
  try {
    elements.restLabel.textContent = 'GET /api/books';
    const result = await timedRest('/api/books');

    setMetrics('rest', 1, result.elapsed, result.bytes);
    printJson(elements.restOutput, result.data);
    renderBooks(normalizeBooksFromRest(result.data));
    elements.summaryText.textContent = 'REST over-fetching: the UI displays only a few fields, but the response includes ISBN, pages, timestamps, description, IDs, and more.';
  } catch (error) {
    elements.restOutput.textContent = error.message;
    showToast('REST server is not available. Run npm run dev:both.');
  }
}

async function restUnderfetchingDemo() {
  try {
    elements.restLabel.textContent = 'GET /api/books/1 + /api/authors/:id + /api/categories/:id';
    const totalStart = performance.now();

    const bookResult = await timedRest('/api/books/1');
    const authorResult = await timedRest(`/api/authors/${bookResult.data.authorId}`);
    const categoryResult = await timedRest(`/api/categories/${bookResult.data.categoryId}`);

    const totalElapsed = performance.now() - totalStart;
    const combined = {
      request1_book: bookResult.data,
      request2_author: authorResult.data,
      request3_category: categoryResult.data,
      explanation: 'REST under-fetching: the first response is not enough, so the frontend sends extra requests.'
    };
    const totalBytes = bookResult.bytes + authorResult.bytes + categoryResult.bytes;

    setMetrics('rest', 3, totalElapsed, totalBytes);
    printJson(elements.restOutput, combined);
    renderBooks(normalizeBooksFromRest(bookResult.data, { [authorResult.data.id]: authorResult.data }, { [categoryResult.data.id]: categoryResult.data }));
    elements.summaryText.textContent = 'REST under-fetching: 3 requests were needed to display one book with its author and category.';
  } catch (error) {
    elements.restOutput.textContent = error.message;
    showToast('REST under-fetching demo failed. Check REST server.');
  }
}

async function graphqlEfficientDemo() {
  try {
    elements.graphqlLabel.textContent = 'query books { exact fields }';
    const query = `
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
    `;

    const result = await timedGraphQL(query);

    setMetrics('graphql', 1, result.elapsed, result.bytes);
    printJson(elements.graphqlOutput, result.data);
    renderBooks(normalizeBooksFromGraphQL(result.data));
    elements.summaryText.textContent = 'GraphQL efficient fetch: one request returns exactly the fields needed by the frontend.';
  } catch (error) {
    elements.graphqlOutput.textContent = error.message;
    showToast('GraphQL server is not available. Run npm run dev:both.');
  }
}

async function graphqlStatsDemo() {
  try {
    elements.graphqlLabel.textContent = 'query stats';
    const query = `
      query LibraryStats {
        stats {
          totalBooks
          totalAuthors
          totalCategories
          totalCopies
          availableCopies
          borrowedCopies
          averageRating
        }
      }
    `;

    const result = await timedGraphQL(query);
    setMetrics('graphql', 1, result.elapsed, result.bytes);
    printJson(elements.graphqlOutput, result.data);
    elements.summaryText.textContent = 'GraphQL can request a custom statistics object without calling many separate REST endpoints.';
  } catch (error) {
    elements.graphqlOutput.textContent = error.message;
  }
}

async function createRestBook(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const payload = Object.fromEntries(form.entries());
  payload.authorId = Number(payload.authorId);
  payload.categoryId = Number(payload.categoryId);
  payload.totalCopies = Number(payload.totalCopies);
  payload.availableCopies = payload.totalCopies;
  payload.publishedYear = new Date().getFullYear();
  payload.pages = 240;
  payload.rating = 4.2;
  payload.description = 'Created from the REST frontend demo.';

  try {
    const start = performance.now();
    const response = await fetch(`${REST_BASE}/api/books`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    const elapsed = performance.now() - start;

    setMetrics('rest', 1, elapsed, byteSize(data));
    elements.restLabel.textContent = 'POST /api/books';
    printJson(elements.restOutput, data);
    renderBooks(normalizeBooksFromRest(data));
    elements.summaryText.textContent = 'REST POST created a new book resource.';
    showToast('Created book with REST POST.');
  } catch (error) {
    elements.restOutput.textContent = error.message;
  }
}

async function createGraphQLBook(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const values = Object.fromEntries(form.entries());

  const mutation = `
    mutation CreateBook($title: String!, $authorId: ID!, $categoryId: ID!, $totalCopies: Int!) {
      createBook(
        title: $title
        authorId: $authorId
        categoryId: $categoryId
        totalCopies: $totalCopies
        availableCopies: $totalCopies
        publishedYear: 2026
        pages: 260
        rating: 4.4
        description: "Created from the GraphQL frontend demo."
      ) {
        id
        title
        rating
        availableCopies
        totalCopies
        author { name }
        category { name }
      }
    }
  `;

  try {
    const result = await timedGraphQL(mutation, {
      title: values.title,
      authorId: values.authorId,
      categoryId: values.categoryId,
      totalCopies: Number(values.totalCopies)
    });

    setMetrics('graphql', 1, result.elapsed, result.bytes);
    elements.graphqlLabel.textContent = 'mutation createBook';
    printJson(elements.graphqlOutput, result.data);
    renderBooks(normalizeBooksFromGraphQL(result.data));
    elements.summaryText.textContent = 'GraphQL mutation created a new book and returned only the selected fields.';
    showToast('Created book with GraphQL mutation.');
  } catch (error) {
    elements.graphqlOutput.textContent = error.message;
  }
}

function clearOutput() {
  setMetrics('rest', 0, 0, 0);
  setMetrics('graphql', 0, 0, 0);
  elements.restOutput.textContent = 'Click a REST button.';
  elements.graphqlOutput.textContent = 'Click a GraphQL button.';
  elements.restLabel.textContent = 'Waiting...';
  elements.graphqlLabel.textContent = 'Waiting...';
  elements.booksTable.innerHTML = '<tr><td colspan="5" class="empty">No data loaded yet.</td></tr>';
  elements.summaryText.textContent = 'Click a demo button to load data.';
}

document.getElementById('btnRestOverfetch').addEventListener('click', restOverfetchingDemo);
document.getElementById('btnRestUnderfetch').addEventListener('click', restUnderfetchingDemo);
document.getElementById('btnRestUnderfetch2').addEventListener('click', restUnderfetchingDemo);
document.getElementById('btnGraphqlEfficient').addEventListener('click', graphqlEfficientDemo);
document.getElementById('btnGraphqlEfficient2').addEventListener('click', graphqlEfficientDemo);
document.getElementById('btnGraphqlStats').addEventListener('click', graphqlStatsDemo);
document.getElementById('btnReset').addEventListener('click', clearOutput);
document.getElementById('restCreateForm').addEventListener('submit', createRestBook);
document.getElementById('graphqlCreateForm').addEventListener('submit', createGraphQLBook);

checkServers();
graphqlEfficientDemo();
