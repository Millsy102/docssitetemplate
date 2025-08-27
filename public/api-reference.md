# BeamFlow API Reference

Complete API documentation for the BeamFlow data processing platform.

## Core Classes

### BeamFlow

The main class for initializing and configuring BeamFlow.

```javascript
import { BeamFlow } from 'beamflow';

const flow = new BeamFlow(options);
```

#### Constructor Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiKey` | string | required | Your BeamFlow API key |
| `environment` | string | 'production' | Environment: 'development', 'staging', 'production' |
| `region` | string | 'us-east-1' | AWS region for deployment |
| `clusterSize` | string | 'medium' | Cluster size: 'small', 'medium', 'large' |
| `timeout` | number | 30000 | Request timeout in milliseconds |
| `retries` | number | 3 | Number of retry attempts |

#### Methods

##### `pipeline(name)`

Create a new data processing pipeline.

```javascript
const pipeline = flow.pipeline('user-analytics');
```

##### `source(name, config)`

Define a data source.

```javascript
pipeline.source('user-events', {
  type: 'kafka',
  brokers: ['localhost:9092'],
  topic: 'user-events',
  groupId: 'analytics-group'
});
```

##### `transform(name, config)`

Define a data transformation.

```javascript
pipeline.transform('enrich-data', {
  type: 'javascript',
  code: `
    function transform(record) {
      record.enriched = true;
      record.timestamp = new Date().toISOString();
      return record;
    }
  `
});
```

##### `filter(name, config)`

Define a data filter.

```javascript
pipeline.filter('active-users', {
  type: 'javascript',
  code: `
    function filter(record) {
      return record.status === 'active';
    }
  `
});
```

##### `aggregate(name, config)`

Define an aggregation operation.

```javascript
pipeline.aggregate('hourly-metrics', {
  type: 'window',
  window: '1 hour',
  operations: [
    { field: 'clicks', operation: 'sum' },
    { field: 'users', operation: 'count_distinct' }
  ]
});
```

##### `sink(name, config)`

Define a data sink.

```javascript
pipeline.sink('analytics-db', {
  type: 'postgresql',
  host: 'localhost',
  port: 5432,
  database: 'analytics',
  table: 'user_metrics'
});
```

##### `execute()`

Execute the pipeline.

```javascript
pipeline.execute();
```

## Data Sources

### Kafka

```javascript
{
  type: 'kafka',
  brokers: ['localhost:9092'],
  topic: 'user-events',
  groupId: 'analytics-group',
  autoCommit: true,
  autoCommitInterval: 1000
}
```

### PostgreSQL

```javascript
{
  type: 'postgresql',
  host: 'localhost',
  port: 5432,
  database: 'analytics',
  table: 'user_events',
  username: 'user',
  password: 'password'
}
```

### MongoDB

```javascript
{
  type: 'mongodb',
  uri: 'mongodb://localhost:27017',
  database: 'analytics',
  collection: 'user_events'
}
```

### HTTP API

```javascript
{
  type: 'http',
  url: 'https://api.example.com/events',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer token'
  },
  interval: 5000
}
```

## Data Sinks

### PostgreSQL

```javascript
{
  type: 'postgresql',
  host: 'localhost',
  port: 5432,
  database: 'analytics',
  table: 'user_metrics',
  username: 'user',
  password: 'password',
  batchSize: 1000
}
```

### Elasticsearch

```javascript
{
  type: 'elasticsearch',
  nodes: ['localhost:9200'],
  index: 'user-metrics',
  type: 'document',
  batchSize: 1000
}
```

### S3

```javascript
{
  type: 's3',
  bucket: 'analytics-data',
  prefix: 'user-metrics/',
  region: 'us-east-1',
  format: 'parquet'
}
```

## Transformations

### JavaScript Transform

```javascript
{
  type: 'javascript',
  code: `
    function transform(record) {
      // Your transformation logic
      record.processed = true;
      record.timestamp = new Date().toISOString();
      return record;
    }
  `
}
```

### SQL Transform

```javascript
{
  type: 'sql',
  query: `
    SELECT 
      user_id,
      COUNT(*) as event_count,
      SUM(amount) as total_amount
    FROM input
    GROUP BY user_id
  `
}
```

### JSON Path Transform

```javascript
{
  type: 'jsonpath',
  expressions: {
    'user.id': '$.user.id',
    'event.type': '$.event.type',
    'timestamp': '$.timestamp'
  }
}
```

## Aggregations

### Window Aggregation

```javascript
{
  type: 'window',
  window: '1 hour',
  operations: [
    { field: 'clicks', operation: 'sum' },
    { field: 'users', operation: 'count_distinct' },
    { field: 'revenue', operation: 'avg' }
  ]
}
```

### Group By Aggregation

```javascript
{
  type: 'groupby',
  fields: ['user_id', 'event_type'],
  operations: [
    { field: 'amount', operation: 'sum' },
    { field: 'count', operation: 'count' }
  ]
}
```

## Error Handling

### Retry Configuration

```javascript
{
  retries: 3,
  retryDelay: 1000,
  backoffMultiplier: 2,
  maxRetryDelay: 10000
}
```

### Dead Letter Queue

```javascript
{
  deadLetterQueue: {
    type: 's3',
    bucket: 'failed-records',
    prefix: 'dlq/'
  }
}
```

## Monitoring

### Metrics

```javascript
// Enable metrics collection
flow.enableMetrics({
  endpoint: 'https://metrics.beamflow.com',
  interval: 60000
});
```

### Logging

```javascript
// Configure logging
flow.configureLogging({
  level: 'info',
  format: 'json',
  destination: 'cloudwatch'
});
```

## Examples

### Real-time User Analytics

```javascript
import { BeamFlow } from 'beamflow';

const flow = new BeamFlow({
  apiKey: process.env.BEAMFLOW_API_KEY,
  environment: 'production'
});

flow.pipeline('user-analytics')
  .source('user-events', {
    type: 'kafka',
    brokers: ['kafka:9092'],
    topic: 'user-events'
  })
  .transform('enrich-data', {
    type: 'javascript',
    code: `
      function transform(record) {
        record.enriched = true;
        record.timestamp = new Date().toISOString();
        return record;
      }
    `
  })
  .filter('active-users', {
    type: 'javascript',
    code: `
      function filter(record) {
        return record.status === 'active';
      }
    `
  })
  .aggregate('hourly-metrics', {
    type: 'window',
    window: '1 hour',
    operations: [
      { field: 'clicks', operation: 'sum' },
      { field: 'users', operation: 'count_distinct' },
      { field: 'revenue', operation: 'sum' }
    ]
  })
  .sink('analytics-db', {
    type: 'postgresql',
    host: 'analytics-db',
    database: 'analytics',
    table: 'hourly_metrics'
  })
  .execute();
```

### Machine Learning Pipeline

```javascript
flow.pipeline('ml-pipeline')
  .source('training-data', {
    type: 'postgresql',
    host: 'ml-db',
    database: 'ml_data',
    table: 'training_data'
  })
  .transform('feature-engineering', {
    type: 'python',
    script: 'feature_engineering.py'
  })
  .transform('model-training', {
    type: 'python',
    script: 'train_model.py'
  })
  .sink('model-registry', {
    type: 's3',
    bucket: 'ml-models',
    prefix: 'models/'
  })
  .execute();
```

## Error Codes

| Code | Description |
|------|-------------|
| `AUTH_ERROR` | Authentication failed |
| `INVALID_CONFIG` | Invalid configuration |
| `PIPELINE_ERROR` | Pipeline execution failed |
| `SOURCE_ERROR` | Data source error |
| `SINK_ERROR` | Data sink error |
| `TRANSFORM_ERROR` | Transformation error |
| `TIMEOUT_ERROR` | Operation timeout |

## Rate Limits

- **API Requests**: 1000 requests per minute
- **Pipeline Executions**: 100 executions per hour
- **Data Processing**: 1GB per minute
- **Concurrent Pipelines**: 10 pipelines per account

## Support

For API support and questions:

- [API Documentation](https://docs.beamflow.com/api)
- [Community Forum](https://community.beamflow.com)
- [Email Support](mailto:api-support@beamflow.com)
- [Live Chat](https://beamflow.com/chat)

---

**Need help?** Check out our [troubleshooting guide](troubleshooting.md) or contact our support team.
