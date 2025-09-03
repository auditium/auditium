# Advanced Examples

Complex examples demonstrating advanced features and patterns.

## Streaming and Real-time

### WebSocket Connection

```javascript
const WebSocket = require('ws');

class RealtimeClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.ws = null;
    this.listeners = new Map();
  }

  connect() {
    this.ws = new WebSocket('wss://api.your-service.com/ws', {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });

    this.ws.on('open', () => {
      console.log('Connected to WebSocket');
    });

    this.ws.on('message', (data) => {
      const message = JSON.parse(data);
      this.handleMessage(message);
    });

    this.ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  }

  handleMessage(message) {
    const listeners = this.listeners.get(message.type) || [];
    listeners.forEach(callback => callback(message.data));
  }

  subscribe(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType).push(callback);
  }

  send(type, data) {
    this.ws.send(JSON.stringify({ type, data }));
  }
}

// Usage
const realtimeClient = new RealtimeClient('your-api-key');
realtimeClient.connect();

realtimeClient.subscribe('user_update', (data) => {
  console.log('User updated:', data);
});
```

### Server-Sent Events

```javascript
class EventStreamClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.eventSource = null;
  }

  connect() {
    this.eventSource = new EventSource(
      `https://api.your-service.com/events?api_key=${this.apiKey}`
    );

    this.eventSource.onopen = () => {
      console.log('Event stream connected');
    };

    this.eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleEvent(data);
    };

    this.eventSource.onerror = (error) => {
      console.error('Event stream error:', error);
    };
  }

  handleEvent(data) {
    switch (data.type) {
      case 'item_created':
        console.log('New item:', data.payload);
        break;
      case 'item_updated':
        console.log('Updated item:', data.payload);
        break;
      default:
        console.log('Unknown event:', data);
    }
  }

  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
    }
  }
}
```

## Bulk Operations

### Bulk Data Import

```javascript
class BulkImporter {
  constructor(client, options = {}) {
    this.client = client;
    this.batchSize = options.batchSize || 100;
    this.concurrency = options.concurrency || 5;
    this.retryAttempts = options.retryAttempts || 3;
  }

  async import(data) {
    const batches = this.createBatches(data, this.batchSize);
    const results = [];

    // Process batches with limited concurrency
    for (let i = 0; i < batches.length; i += this.concurrency) {
      const concurrentBatches = batches.slice(i, i + this.concurrency);
      const batchPromises = concurrentBatches.map(batch => 
        this.processBatch(batch)
      );
      
      const batchResults = await Promise.allSettled(batchPromises);
      results.push(...batchResults);
    }

    return this.summarizeResults(results);
  }

  createBatches(data, batchSize) {
    const batches = [];
    for (let i = 0; i < data.length; i += batchSize) {
      batches.push(data.slice(i, i + batchSize));
    }
    return batches;
  }

  async processBatch(batch) {
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        return await this.client.items.bulkCreate(batch);
      } catch (error) {
        if (attempt === this.retryAttempts) {
          throw error;
        }
        await this.delay(1000 * attempt);
      }
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  summarizeResults(results) {
    const summary = {
      total: results.length,
      successful: 0,
      failed: 0,
      errors: []
    };

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        summary.successful++;
      } else {
        summary.failed++;
        summary.errors.push({
          batch: index,
          error: result.reason.message
        });
      }
    });

    return summary;
  }
}

// Usage
const importer = new BulkImporter(client, {
  batchSize: 50,
  concurrency: 3,
  retryAttempts: 2
});

const data = [/* large array of items */];
const result = await importer.import(data);
console.log('Import summary:', result);
```

## Advanced Caching

### Multi-Level Cache

```javascript
class MultiLevelCache {
  constructor(options = {}) {
    this.memoryCache = new Map();
    this.redisClient = options.redisClient;
    this.defaultTTL = options.defaultTTL || 3600;
    this.maxMemorySize = options.maxMemorySize || 1000;
  }

  async get(key) {
    // Check memory cache first
    if (this.memoryCache.has(key)) {
      const item = this.memoryCache.get(key);
      if (item.expires > Date.now()) {
        return item.value;
      }
      this.memoryCache.delete(key);
    }

    // Check Redis cache
    if (this.redisClient) {
      const cached = await this.redisClient.get(key);
      if (cached) {
        const value = JSON.parse(cached);
        this.setMemoryCache(key, value);
        return value;
      }
    }

    return null;
  }

  async set(key, value, ttl = this.defaultTTL) {
    // Set in memory cache
    this.setMemoryCache(key, value, ttl);

    // Set in Redis cache
    if (this.redisClient) {
      await this.redisClient.setex(key, ttl, JSON.stringify(value));
    }
  }

  setMemoryCache(key, value, ttl = this.defaultTTL) {
    // Evict oldest items if cache is full
    if (this.memoryCache.size >= this.maxMemorySize) {
      const firstKey = this.memoryCache.keys().next().value;
      this.memoryCache.delete(firstKey);
    }

    this.memoryCache.set(key, {
      value,
      expires: Date.now() + (ttl * 1000)
    });
  }

  async invalidate(pattern) {
    // Clear from memory cache
    for (const key of this.memoryCache.keys()) {
      if (key.includes(pattern)) {
        this.memoryCache.delete(key);
      }
    }

    // Clear from Redis cache
    if (this.redisClient) {
      const keys = await this.redisClient.keys(`*${pattern}*`);
      if (keys.length > 0) {
        await this.redisClient.del(...keys);
      }
    }
  }
}

// Usage with API client
class CachedApiClient {
  constructor(apiClient, cache) {
    this.api = apiClient;
    this.cache = cache;
  }

  async getUser(userId) {
    const cacheKey = `user:${userId}`;
    
    let user = await this.cache.get(cacheKey);
    if (user) {
      return user;
    }

    user = await this.api.users.get(userId);
    await this.cache.set(cacheKey, user, 1800); // 30 minutes
    
    return user;
  }

  async updateUser(userId, updates) {
    const user = await this.api.users.update(userId, updates);
    
    // Invalidate related cache entries
    await this.cache.invalidate(`user:${userId}`);
    
    return user;
  }
}
```

## Advanced Error Handling

### Circuit Breaker Pattern

```javascript
class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.recoveryTimeout = options.recoveryTimeout || 60000;
    this.monitoringPeriod = options.monitoringPeriod || 10000;
    
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.successCount = 0;
  }

  async execute(operation) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime < this.recoveryTimeout) {
        throw new Error('Circuit breaker is OPEN');
      }
      this.state = 'HALF_OPEN';
      this.successCount = 0;
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failureCount = 0;
    
    if (this.state === 'HALF_OPEN') {
      this.successCount++;
      if (this.successCount >= 3) {
        this.state = 'CLOSED';
      }
    }
  }

  onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }

  getState() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime
    };
  }
}

// Usage
const circuitBreaker = new CircuitBreaker({
  failureThreshold: 3,
  recoveryTimeout: 30000
});

async function reliableApiCall() {
  return circuitBreaker.execute(async () => {
    return await client.users.get('12345');
  });
}
```

## Data Processing Pipeline

### Stream Processing Pipeline

```javascript
class DataPipeline {
  constructor() {
    this.stages = [];
  }

  addStage(stageFn) {
    this.stages.push(stageFn);
    return this;
  }

  async process(data) {
    let result = data;
    
    for (const stage of this.stages) {
      if (Array.isArray(result)) {
        result = await Promise.all(
          result.map(item => stage(item))
        );
      } else {
        result = await stage(result);
      }
    }
    
    return result;
  }

  async processStream(inputStream, outputStream) {
    for await (const chunk of inputStream) {
      try {
        const processed = await this.process(chunk);
        outputStream.write(processed);
      } catch (error) {
        console.error('Pipeline error:', error);
        outputStream.write({ error: error.message, data: chunk });
      }
    }
  }
}

// Define processing stages
const pipeline = new DataPipeline()
  .addStage(async (data) => {
    // Validation stage
    if (!data.email || !data.name) {
      throw new Error('Missing required fields');
    }
    return data;
  })
  .addStage(async (data) => {
    // Enrichment stage
    const geoData = await getGeoLocation(data.ip);
    return { ...data, location: geoData };
  })
  .addStage(async (data) => {
    // Transformation stage
    return {
      ...data,
      email: data.email.toLowerCase(),
      name: data.name.trim(),
      processed_at: new Date().toISOString()
    };
  })
  .addStage(async (data) => {
    // Storage stage
    return await client.users.create(data);
  });

// Process data
const userData = {
  name: 'John Doe',
  email: 'JOHN@EXAMPLE.COM',
  ip: '192.168.1.1'
};

const result = await pipeline.process(userData);
```

## Integration Patterns

### Webhook Handler with Validation

```javascript
const crypto = require('crypto');
const express = require('express');

class WebhookHandler {
  constructor(secret) {
    this.secret = secret;
    this.handlers = new Map();
  }

  validateSignature(payload, signature) {
    const expectedSignature = crypto
      .createHmac('sha256', this.secret)
      .update(payload)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  register(eventType, handler) {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType).push(handler);
  }

  async handle(req, res) {
    try {
      const signature = req.headers['x-signature'];
      const payload = JSON.stringify(req.body);
      
      if (!this.validateSignature(payload, signature)) {
        return res.status(401).json({ error: 'Invalid signature' });
      }

      const { type, data } = req.body;
      const handlers = this.handlers.get(type) || [];
      
      await Promise.all(
        handlers.map(handler => handler(data))
      );
      
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

// Usage
const webhookHandler = new WebhookHandler('your-webhook-secret');

webhookHandler.register('user.created', async (data) => {
  console.log('New user created:', data);
  await sendWelcomeEmail(data.email);
});

webhookHandler.register('user.updated', async (data) => {
  console.log('User updated:', data);
  await updateUserCache(data.id);
});

const app = express();
app.use(express.json());
app.post('/webhook', (req, res) => webhookHandler.handle(req, res));
```

## Next Steps

- [Basic Examples](basic-examples.md) - Start with simpler examples
- [API Reference](../api/overview.md) - Detailed API documentation
- [Guides](../guides/advanced-features.md) - Advanced usage guides
