/**
 * GraphQL API Client - Library System
 * Run after starting GraphQL server: npm run dev:graphql
 */

const GRAPHQL_URL = 'http://localhost:3002/graphql';

async function graphqlRequest(query, variables = {}) {
  const response = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables })
  });

  const data = await response.json();
  console.log('\nGraphQL operation:');
  console.log(query.trim());
  console.log('\nResponse:');
  console.log(JSON.stringify(data, null, 2));
  return data;
}

async function efficientQueryDemo() {
  console.log('\n✅ GRAPHQL EFFICIENT QUERY DEMO');
  console.log('One request returns exactly the fields needed by the frontend.');

  return graphqlRequest(`
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
  `);
}

async function statsDemo() {
  console.log('\n✅ GRAPHQL STATS QUERY DEMO');
  return graphqlRequest(`
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
  `);
}

async function createBookDemo() {
  console.log('\n✅ GRAPHQL MUTATION DEMO');
  return graphqlRequest(`
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
        description: "Created from GraphQL client demo."
      ) {
        id
        title
        author { name }
        category { name }
        availableCopies
      }
    }
  `, {
    title: 'GraphQL Query Patterns',
    authorId: '2',
    categoryId: '3',
    totalCopies: 5
  });
}

async function run() {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║ GraphQL Library API Client             ║');
  console.log('╚════════════════════════════════════════╝');

  await efficientQueryDemo();
  await statsDemo();
  await createBookDemo();
}

if (require.main === module) {
  run().catch(error => console.error(error));
}

module.exports = {
  efficientQueryDemo,
  statsDemo,
  createBookDemo
};
