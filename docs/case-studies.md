# Real-World Case Studies

## Case Study 1: Twitter API Evolution

### Background
Twitter faced scalability challenges as their API matured with diverse clients (web, mobile, third-party apps).

### Challenge
- Different clients needed different data representations
- API versioning became complex (v1, v1.1, v2)
- Over-fetching increased bandwidth costs
- Mobile clients suffering from data waste

### Initial Approach: RESTful v1.1
```
GET /1.1/statuses/home_timeline.json

Response: All tweet fields
{
  "id": 123,
  "created_at": "...",
  "text": "...",
  "user": { ... },
  "entities": { ... },
  "extended_entities": { ... },
  "display_text_range": [...],
  ...  (20+ fields)
}
```

**Problem:** Mobile apps don't need all this data, wasting bandwidth.

### Solution: Adopt GraphQL
```
query {
  timeline {
    tweets {
      id
      text
      author { name handle }
      stats { likes retweets }
    }
  }
}
```

**Result:**
- 60% bandwidth reduction
- Single endpoint for all clients
- No versioning needed for new fields
- Mobile app users saw faster loading

---

## Case Study 2: GitHub API

### Background
GitHub serves multiple types of clients with complex data relationships.

### Approach: Hybrid (RESTful + GraphQL)

#### RESTful v3 (Still maintained)
```
GET /repos/microsoft/vscode/issues

Simple, cacheable
✅ Widely integrated
✅ Stable
❌ Not optimized for complex queries
```

#### GraphQL v4 (Added later)
```
query {
  repository(owner: "microsoft", name: "vscode") {
    issues(first: 10) {
      nodes {
        title
        author { login }
        labels { name }
      }
    }
  }
}
```

**Benefit:**
- Existing integrations use REST (stable)
- New integrations can use GraphQL (flexible)
- Community prefers GraphQL for complex queries

**Result:**
- 40% reduction in API calls for complex queries
- GraphQL very popular with new developers
- REST endpoints still handle 60% of requests

---

## Case Study 3: Stripe Payment Processing

### Background
Stripe needed a stable, high-performance API for payments.

### Approach: Primarily RESTful
```
POST /v1/charges

Highly optimized RESTful API
✅ Simple and predictable
✅ Excellent caching
✅ Transaction-critical (needs reliability)
✅ Rate limiting straightforward
```

#### Optional GraphQL Beta
- Added later for complex reporting queries
- Not for payment processing
- Separate endpoint for analytics

**Why RESTful for Payments:**
- Simplicity = fewer bugs
- HTTP caching crucial for PCI compliance
- Payment operations need to be atomic
- High-throughput requirement

**Result:**
- RESTful API handles 99.99% uptime
- Excellent developer experience
- Clear error codes with HTTP status

---

## Case Study 4: Netflix Content Discovery

### Background
Netflix streams content to millions of users worldwide with personalized recommendations.

### Challenge
- Diverse clients: Web, mobile, TV, gaming consoles
- Each needs different data:
  - Mobile: Lightweight profiles
  - TV: Full HD images
  - Web: Detailed metadata
- Massive data relationships (shows → cast → other shows)

### Evolution

#### Stage 1: RESTful API
```
Problem: Mobile getting desktop-size images
GET /api/shows/123

All image sizes, all metadata = large payload
```

#### Stage 2: Custom REST Endpoints
```
Created:
GET /api/shows/123?profile=mobile
GET /api/shows/123?profile=tv

❌ Endpoint explosion
```

#### Stage 3: GraphQL Internal API
```
query GetShowData($deviceType: String!) {
  show(id: 123) {
    title
    poster(width: 200, height: 300, profile: $deviceType)
    cast(limit: 5) { name }
    recommendations(limit: 10) { title }
  }
}
```

**Result:**
- 50% average bandwidth reduction
- Single query language for all clients
- Client teams love the flexibility
- Still use REST for simpler endpoints

---

## Case Study 5: Shopify eCommerce Platform

### Background
Shopify provides APIs for millions of online stores with complex product relationships.

### Approach: Hybrid (RESTful + GraphQL)

#### RESTful Admin API
```
GET /admin/api/2024-01/products.json

Simple products listing
✅ Easy pagination
✅ Good caching
✅ 3rd party tool compatible
```

#### GraphQL Admin API
```
query {
  products(first: 10) {
    edges {
      node {
        id
        title
        variants {
          title
          priceV2 { amount }
        }
        collections { title }
      }
    }
  }
}
```

#### GraphQL Storefront API (for themes)
```
query {
  shop {
    products(first: 10) {
      edges { node { title } }
    }
  }
}
```

**Why Both:**
- REST for legacy apps (10+ year old integrations)
- GraphQL for modern apps (better DX)
- Allows gradual migration

**Result:**
- Both APIs very popular
- Developers can choose based on needs
- GraphQL adoption growing 40% year-over-year

---

## Case Study 6: AWS AppSync (Managed GraphQL)

### Background
AWS created AppSync, a managed GraphQL service.

### Architecture
```
GraphQL API → AWS Lambda
           → DynamoDB
           → RDS
           → ElasticSearch
           → HTTP endpoints
```

### Key Insight
AWS realized developers want:
- ✅ Unified query language (GraphQL)
- ✅ Connect to multiple data sources
- ✅ Real-time subscriptions
- ✅ Automatic caching & optimization

### Result
- AppSync helps teams avoid building custom GraphQL layers
- Real-time features easier to implement
- Complex data aggregation simplified

---

## Case Study 7: Mobile App: Airbnb

### Background
Airbnb mobile app loads various screens with different data needs.

### Challenges
- Search results page needs different data than booking page
- WiFi vs cellular users need different payload sizes
- Over-fetching cost: $50K/year in bandwidth for 50 million users

### Solution: GraphQL API

#### Search Results Query (lightweight)
```
query {
  listings(city: "NYC") {
    id
    name
    price
    thumbnail
  }
}
```

#### Detail Page Query (heavier)
```
query {
  listing(id: 123) {
    id
    name
    description
    photos { url }
    reviews { comment rating }
    host { name profilePhoto }
  }
}
```

**Bandwidth Analysis:**
```
RESTful approach: Always 50KB per listing
GraphQL approach:
  - Search: 5KB per listing
  - Detail: 50KB per listing

Monthly data for 100K users:
  RESTful: 100,000 × 50KB × 30 = 150GB
  GraphQL: 100,000 × (5KB + 50KB) × 30 = 165GB (less for searches only)
  
Savings: Especially for mobile (search-heavy users)
```

**Result:**
- 30% reduction for mobile searches
- Better perceived performance (lighter payloads)
- Server load reduced by 25%

---

## Case Study 8: IoT Sensor Data

### Background
Smart building collects data from 10,000 sensors.

### Challenge
Dashboard needs:
- Real-time temperature updates
- Historical trends
- Anomaly alerts
- Different query patterns

### Solution: Hybrid Approach

#### RESTful for Simple Data
```
GET /api/sensors/123/latest
Returns: { temp: 22.5, humidity: 45 }
```

#### GraphQL for Complex Queries
```
query {
  sensor(id: 123) {
    latest { temp humidity }
    hourlyAverage { temp trend }
    weeklyData { avgTemp alerts }
  }
}
```

#### GraphQL Subscriptions for Real-time
```
subscription {
  sensorAlert(threshold: 30) {
    id
    sensor { name location }
    value
    timestamp
  }
}
```

**Result:**
- Real-time updates with subscriptions
- Reduced server load (smart batching)
- Dashboard updates 40% faster

---

## Lessons Learned

### When Companies Choose RESTful
1. **Stripe** - Payments need simplicity
2. **GitHub** - Stable v3, supplements with GraphQL
3. **AWS** - Each service has REST endpoints

**Why:** Simplicity, reliability, clear semantics

### When Companies Choose GraphQL
1. **Netflix** - Multiple clients, complex relationships
2. **Twitter** - Bandwidth optimization
3. **Shopify** - Flexible querying for developers

**Why:** Flexibility, efficiency, modern DX

### When Companies Use Both
1. **GitHub** - REST (stable) + GraphQL (modern)
2. **Shopify** - REST (existing) + GraphQL (future)
3. **AWS** - REST per service, AppSync (GraphQL)

**Why:** Gradual migration, serving different needs

---

## Key Takeaways

1. **Choose Based on Problems You Solve**
   - Simple CRUD? RESTful
   - Complex relationships? GraphQL
   - Unsure? Start with REST

2. **Hybrid Works**
   - RESTful for backwards compatibility
   - GraphQL for new features
   - Migration path possible

3. **Organization Scale Matters**
   - 1 product: RESTful probably fine
   - 10 products: GraphQL beneficial
   - 100 products: Hybrid recommended

4. **Cost Considerations**
   - RESTful: Lower infrastructure
   - GraphQL: Higher complexity
   - Bandwidth vs compute tradeoff

5. **Team Experience**
   - RESTful: More familiar to teams
   - GraphQL: Better for product teams
   - Training needed for GraphQL

---

## Recommended Reading

- [Netflix Technology Blog - GraphQL](https://netflix.techblog.com/graphql-api-design-for-modern-apps-bae8f31d70f8)
- [GitHub's GraphQL API](https://github.blog/2016-09-14-the-github-graphql-api/)
- [Shopify API Design Evolution](https://shopify.engineering/)
- [AWS AppSync Best Practices](https://docs.aws.amazon.com/appsync/)
