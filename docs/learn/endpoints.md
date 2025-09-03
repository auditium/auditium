# API Endpoints

Detailed documentation for all available API endpoints.

## Users

### Get User

Retrieve information about a specific user.

**Endpoint**: `GET /api/v1/users/{id}`

**Parameters**:
- `id` (required): The user ID

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "12345",
    "name": "John Doe",
    "email": "john@example.com",
    "created_at": "2025-01-01T00:00:00Z"
  }
}
```

**Example**:
```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
     https://api.your-service.com/v1/users/12345
```

### Create User

Create a new user.

**Endpoint**: `POST /api/v1/users`

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "12345",
    "name": "John Doe",
    "email": "john@example.com",
    "created_at": "2025-01-01T00:00:00Z"
  }
}
```

**Example**:
```bash
curl -X POST \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"name":"John Doe","email":"john@example.com"}' \
     https://api.your-service.com/v1/users
```

## Items

### List Items

Retrieve a list of items.

**Endpoint**: `GET /api/v1/items`

**Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `filter` (optional): Filter criteria

**Response**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "item1",
        "name": "Sample Item",
        "description": "A sample item",
        "created_at": "2025-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "total_pages": 5
    }
  }
}
```

**Example**:
```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
     "https://api.your-service.com/v1/items?page=1&limit=10"
```

### Get Item

Retrieve a specific item.

**Endpoint**: `GET /api/v1/items/{id}`

**Parameters**:
- `id` (required): The item ID

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "item1",
    "name": "Sample Item",
    "description": "A sample item",
    "metadata": {},
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-01T00:00:00Z"
  }
}
```

## Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": {
      "field": "email",
      "message": "Email format is invalid"
    }
  }
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or missing API key"
  }
}
```

### 404 Not Found

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found"
  }
}
```

### 429 Rate Limited

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many requests. Please try again later.",
    "retry_after": 3600
  }
}
```

## SDK Examples

### JavaScript/Node.js

```javascript
const Client = require('your-sdk');

const client = new Client({
  apiKey: 'YOUR_API_KEY'
});

// Get user
const user = await client.users.get('12345');

// Create user
const newUser = await client.users.create({
  name: 'John Doe',
  email: 'john@example.com'
});

// List items
const items = await client.items.list({
  page: 1,
  limit: 10
});
```

### Python

```python
from your_sdk import Client

client = Client(api_key='YOUR_API_KEY')

# Get user
user = client.users.get('12345')

# Create user
new_user = client.users.create({
    'name': 'John Doe',
    'email': 'john@example.com'
})

# List items
items = client.items.list(page=1, limit=10)
```

## Next Steps

- [API Overview](overview.md) - General API information
- [Authentication](overview.md#authentication) - Authentication details
- [Examples](../examples/basic-examples.md) - More code examples
