/**
 * RESTful API Client - Library System
 * Run after starting REST server: npm run dev:restful
 */

const BASE_URL = 'http://localhost:3001/api';

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, options);
  const data = await response.json();
  console.log(`\n${options.method || 'GET'} ${path}`);
  console.log(JSON.stringify(data, null, 2));
  return data;
}

async function restOverfetchingDemo() {
  console.log('\n❌ REST OVER-FETCHING DEMO');
  console.log('The UI may need only title + availability, but REST returns a fixed full object.');
  return request('/books');
}

async function restUnderfetchingDemo() {
  console.log('\n❌ REST UNDER-FETCHING DEMO');
  console.log('To display one book with author and category details, REST uses 3 requests.');

  const book = await request('/books/1');
  const author = await request(`/authors/${book.authorId}`);
  const category = await request(`/categories/${book.categoryId}`);

  console.log('\nCombined UI data:');
  console.log(JSON.stringify({
    title: book.title,
    author: author.name,
    category: category.name,
    availableCopies: book.availableCopies
  }, null, 2));
}

async function createBookDemo() {
  console.log('\n✅ REST POST DEMO');
  return request('/books', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'REST API Design Handbook',
      authorId: 1,
      categoryId: 1,
      totalCopies: 4,
      availableCopies: 4,
      publishedYear: 2026,
      pages: 240,
      rating: 4.2,
      description: 'Created from REST client demo.'
    })
  });
}

async function run() {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║ RESTful Library API Client             ║');
  console.log('╚════════════════════════════════════════╝');

  await restOverfetchingDemo();
  await restUnderfetchingDemo();
  await createBookDemo();
}

if (require.main === module) {
  run().catch(error => console.error(error));
}

module.exports = {
  restOverfetchingDemo,
  restUnderfetchingDemo,
  createBookDemo
};
