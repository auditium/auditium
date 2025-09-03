# Basic Examples

Simple code examples to get you started.

## Getting Started

### Initialize the Client

```javascript
const Client = require('your-package');

const client = new Client({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.your-service.com/v1'
});
```

### Your First API Call

```javascript
async function getUser() {
  try {
    const user = await client.users.get('12345');
    console.log('User:', user);
    return user;
  } catch (error) {
    console.error('Error:', error.message);
  }
}

getUser();
```

## User Management

### Create a User

```javascript
async function createUser() {
  const userData = {
    name: 'John Doe',
    email: 'john@example.com',
    role: 'user'
  };

  try {
    const user = await client.users.create(userData);
    console.log('Created user:', user);
    return user;
  } catch (error) {
    console.error('Failed to create user:', error.message);
  }
}
```

### Update a User

```javascript
async function updateUser(userId) {
  const updates = {
    name: 'John Smith',
    email: 'johnsmith@example.com'
  };

  try {
    const user = await client.users.update(userId, updates);
    console.log('Updated user:', user);
    return user;
  } catch (error) {
    console.error('Failed to update user:', error.message);
  }
}
```

### Delete a User

```javascript
async function deleteUser(userId) {
  try {
    await client.users.delete(userId);
    console.log('User deleted successfully');
  } catch (error) {
    console.error('Failed to delete user:', error.message);
  }
}
```

## Working with Items

### List Items

```javascript
async function listItems() {
  try {
    const response = await client.items.list({
      page: 1,
      limit: 10,
      sort: 'created_at',
      order: 'desc'
    });
    
    console.log('Items:', response.data.items);
    console.log('Total:', response.data.pagination.total);
    
    return response.data.items;
  } catch (error) {
    console.error('Failed to list items:', error.message);
  }
}
```

### Create an Item

```javascript
async function createItem() {
  const itemData = {
    name: 'Sample Item',
    description: 'This is a sample item',
    category: 'examples',
    metadata: {
      tags: ['sample', 'example'],
      priority: 'high'
    }
  };

  try {
    const item = await client.items.create(itemData);
    console.log('Created item:', item);
    return item;
  } catch (error) {
    console.error('Failed to create item:', error.message);
  }
}
```

### Search Items

```javascript
async function searchItems(query) {
  try {
    const results = await client.items.search({
      query: query,
      filters: {
        category: 'examples',
        status: 'active'
      },
      limit: 20
    });
    
    console.log('Search results:', results.data.items);
    return results.data.items;
  } catch (error) {
    console.error('Search failed:', error.message);
  }
}
```

## Error Handling

### Basic Error Handling

```javascript
async function handleErrors() {
  try {
    const result = await client.someOperation();
    return result;
  } catch (error) {
    if (error.response) {
      // API error response
      console.error('API Error:', error.response.data.error.message);
      console.error('Status:', error.response.status);
    } else if (error.request) {
      // Network error
      console.error('Network Error:', error.message);
    } else {
      // Other error
      console.error('Error:', error.message);
    }
    throw error;
  }
}
```

### Retry Logic

```javascript
async function withRetry(operation, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      console.log(`Attempt ${attempt} failed, retrying...`);
    }
  }
}

// Usage
const result = await withRetry(() => client.users.get('12345'));
```

## Configuration Examples

### Environment-Based Configuration

```javascript
const config = {
  development: {
    apiKey: process.env.DEV_API_KEY,
    baseUrl: 'https://dev-api.your-service.com/v1',
    debug: true
  },
  production: {
    apiKey: process.env.PROD_API_KEY,
    baseUrl: 'https://api.your-service.com/v1',
    debug: false
  }
};

const env = process.env.NODE_ENV || 'development';
const client = new Client(config[env]);
```

### Custom Headers

```javascript
const client = new Client({
  apiKey: 'your-api-key',
  headers: {
    'X-Custom-Header': 'custom-value',
    'User-Agent': 'MyApp/1.0.0'
  }
});
```

## Utility Functions

### Pagination Helper

```javascript
async function getAllItems() {
  let allItems = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await client.items.list({
      page: page,
      limit: 100
    });

    allItems.push(...response.data.items);
    
    hasMore = page < response.data.pagination.total_pages;
    page++;
  }

  return allItems;
}
```

### Batch Processing

```javascript
async function processBatch(items, batchSize = 10) {
  const results = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(item => client.items.process(item))
    );
    results.push(...batchResults);
  }
  
  return results;
}
```

## Next Steps

- [Advanced Examples](advanced-examples.md) - More complex examples
- [API Reference](../api/overview.md) - Detailed API documentation
- [Guides](../guides/basic-usage.md) - In-depth usage guides
