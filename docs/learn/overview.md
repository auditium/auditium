# API Overview

Welcome to the API documentation. This section provides comprehensive information about all available endpoints and methods.

## Authentication

All API requests require authentication. Include your API key in the request headers:

```bash
Authorization: Bearer YOUR_API_KEY
```

## Base URL

```
https://api.your-service.com/v1
```

## Response Format

All API responses are returned in JSON format:

```json
{
  "success": true,
  "data": {
    // Response data here
  },
  "message": "Operation completed successfully"
}
```

## Error Handling

Errors are returned with appropriate HTTP status codes:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message"
  }
}
```

## Rate Limiting

API requests are rate limited to:

- **Free tier**: 100 requests per hour
- **Pro tier**: 1000 requests per hour
- **Enterprise**: Custom limits

## Common HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 429 | Rate Limited |
| 500 | Internal Server Error |

## SDKs and Libraries

We provide official SDKs for popular languages:

- [JavaScript/Node.js SDK](https://github.com/your-org/js-sdk)
- [Python SDK](https://github.com/your-org/python-sdk)
- [Ruby SDK](https://github.com/your-org/ruby-sdk)

## Getting Started

1. [Get your API key](https://your-service.com/api-keys)
2. Choose your preferred SDK or use direct HTTP requests
3. Start making API calls

## Next Steps

- [API Endpoints](endpoints.md) - Detailed endpoint documentation
- [Authentication Guide](https://your-service.com/docs/auth) - More authentication details
- [SDK Documentation](https://your-service.com/docs/sdks) - SDK-specific guides
