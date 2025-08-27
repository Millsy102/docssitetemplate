# Examples

This document provides practical examples and use cases for Project Name, demonstrating common patterns and best practices.

## Table of Contents

- [Quick Start Examples](#quick-start-examples)
- [Authentication](#authentication)
- [Data Management](#data-management)
- [Real-time Features](#real-time-features)
- [Advanced Patterns](#advanced-patterns)
- [Integration Examples](#integration-examples)

## Quick Start Examples

### Basic Setup

```javascript
import { ProjectName } from '@projectname/sdk';

// Initialize with your API key
const client = new ProjectName({
  apiKey: 'your-api-key',
  environment: 'production'
});

// Connect to the service
await client.connect();
```

### Simple Data Fetching

```javascript
// Fetch user data
const user = await client.users.get('user_123');
console.log('User:', user.name);

// Fetch project data
const project = await client.projects.get('proj_456');
console.log('Project:', project.name);

// List items with pagination
const items = await client.projects.items.list('proj_456', {
  limit: 50,
  status: 'active'
});

items.data.forEach(item => {
  console.log('Item:', item.name);
});
```

## Authentication

### OAuth2 Flow

```javascript
import { ProjectName } from '@projectname/sdk';

const client = new ProjectName({
  clientId: 'your-client-id',
  redirectUri: 'https://yourapp.com/callback'
});

// Start OAuth flow
const authUrl = client.auth.getAuthorizationUrl({
  scope: ['read', 'write'],
  state: 'random-state-string'
});

// Redirect user to auth URL
window.location.href = authUrl;

// Handle callback
client.auth.handleCallback(code, state)
  .then(token => {
    console.log('Authenticated:', token);
    // Store token securely
    localStorage.setItem('auth_token', token.access_token);
  })
  .catch(error => {
    console.error('Authentication failed:', error);
  });
```

### Token Management

```javascript
// Set token for requests
client.setToken('your-access-token');

// Refresh token
const newToken = await client.auth.refreshToken('refresh-token');
client.setToken(newToken.access_token);

// Check token validity
const isValid = await client.auth.validateToken();
console.log('Token valid:', isValid);
```

### API Key Authentication

```javascript
const client = new ProjectName({
  apiKey: 'your-api-key'
});

// API key is automatically included in requests
const data = await client.projects.list();
```

## Data Management

### CRUD Operations

```javascript
// Create a new project
const newProject = await client.projects.create({
  name: 'My New Project',
  description: 'A sample project',
  settings: {
    visibility: 'private',
    autoBackup: true
  }
});

// Read project data
const project = await client.projects.get(newProject.id);

// Update project
const updatedProject = await client.projects.update(newProject.id, {
  name: 'Updated Project Name',
  settings: {
    ...project.settings,
    notifications: {
      email: true,
      slack: false
    }
  }
});

// Delete project
await client.projects.delete(newProject.id);
```

### Batch Operations

```javascript
// Create multiple items
const items = await client.projects.items.batchCreate('proj_123', [
  {
    name: 'Item 1',
    type: 'document',
    content: { text: 'Content 1' }
  },
  {
    name: 'Item 2',
    type: 'image',
    content: { url: 'https://example.com/image.jpg' }
  }
]);

// Update multiple items
await client.projects.items.batchUpdate('proj_123', [
  { id: 'item_1', name: 'Updated Item 1' },
  { id: 'item_2', name: 'Updated Item 2' }
]);

// Delete multiple items
await client.projects.items.batchDelete('proj_123', ['item_1', 'item_2']);
```

### Search and Filtering

```javascript
// Search items
const searchResults = await client.projects.items.search('proj_123', {
  query: 'important document',
  filters: {
    type: 'document',
    status: 'active',
    createdAfter: '2024-01-01'
  },
  sort: {
    field: 'created_at',
    order: 'desc'
  },
  limit: 20
});

// Advanced filtering
const filteredItems = await client.projects.items.list('proj_123', {
  filters: {
    tags: ['urgent', 'review'],
    priority: ['high', 'critical'],
    assignee: 'user_123'
  }
});
```

## Real-time Features

### WebSocket Connection

```javascript
// Connect to real-time updates
const ws = client.realtime.connect();

// Listen for project updates
ws.on('project.updated', (data) => {
  console.log('Project updated:', data.project.name);
  // Update UI accordingly
});

// Listen for item changes
ws.on('item.created', (data) => {
  console.log('New item:', data.item.name);
  // Add to UI
});

ws.on('item.updated', (data) => {
  console.log('Item updated:', data.item.name);
  // Update UI
});

ws.on('item.deleted', (data) => {
  console.log('Item deleted:', data.itemId);
  // Remove from UI
});

// Subscribe to specific project
ws.subscribe('project:proj_123');

// Unsubscribe when done
ws.unsubscribe('project:proj_123');
ws.disconnect();
```

### Live Collaboration

```javascript
// Join collaboration session
const session = await client.collaboration.join('proj_123');

// Send presence update
session.setPresence({
  status: 'editing',
  location: 'item_456',
  activity: 'typing'
});

// Listen for other users
session.on('user.joined', (user) => {
  console.log('User joined:', user.name);
});

session.on('user.left', (user) => {
  console.log('User left:', user.name);
});

session.on('presence.updated', (presence) => {
  console.log('User activity:', presence);
});

// Leave session
await session.leave();
```

## Advanced Patterns

### Error Handling

```javascript
try {
  const data = await client.projects.get('invalid-id');
} catch (error) {
  switch (error.code) {
    case 'RESOURCE_NOT_FOUND':
      console.log('Project not found');
      break;
    case 'PERMISSION_DENIED':
      console.log('Access denied');
      break;
    case 'RATE_LIMIT_EXCEEDED':
      console.log('Rate limit exceeded, retrying...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Retry request
      break;
    default:
      console.error('Unexpected error:', error);
  }
}
```

### Retry Logic

```javascript
import { retry } from '@projectname/utils';

const fetchWithRetry = retry(async (projectId) => {
  return await client.projects.get(projectId);
}, {
  maxAttempts: 3,
  delay: 1000,
  backoff: 'exponential'
});

const project = await fetchWithRetry('proj_123');
```

### Caching

```javascript
import { cache } from '@projectname/utils';

// Cache project data for 5 minutes
const getProject = cache(async (projectId) => {
  return await client.projects.get(projectId);
}, {
  ttl: 5 * 60 * 1000, // 5 minutes
  key: (projectId) => `project:${projectId}`
});

// Use cached version
const project = await getProject('proj_123');
```

### Event Handling

```javascript
// Set up event handlers
client.on('connected', () => {
  console.log('Connected to Project Name');
});

client.on('disconnected', () => {
  console.log('Disconnected from Project Name');
});

client.on('error', (error) => {
  console.error('Client error:', error);
});

client.on('rate.limited', (info) => {
  console.log('Rate limited:', info);
});
```

## Integration Examples

### React Integration

```jsx
import React, { useState, useEffect } from 'react';
import { ProjectName } from '@projectname/sdk';

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const client = new ProjectName({
      apiKey: process.env.REACT_APP_API_KEY
    });

    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await client.projects.list();
        setProjects(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {projects.map(project => (
        <div key={project.id}>
          <h3>{project.name}</h3>
          <p>{project.description}</p>
        </div>
      ))}
    </div>
  );
};
```

### Node.js Server

```javascript
const express = require('express');
const { ProjectName } = require('@projectname/sdk');

const app = express();
const client = new ProjectName({
  apiKey: process.env.PROJECT_NAME_API_KEY
});

// Middleware to handle authentication
app.use(async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token) {
    client.setToken(token);
  }
  next();
});

// API routes
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await client.projects.list({
      limit: parseInt(req.query.limit) || 20,
      page: parseInt(req.query.page) || 1
    });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/projects', async (req, res) => {
  try {
    const project = await client.projects.create(req.body);
    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

### Python Integration

```python
from projectname import ProjectName
import asyncio

async def main():
    # Initialize client
    client = ProjectName(api_key='your-api-key')
    
    # Create project
    project = await client.projects.create({
        'name': 'Python Project',
        'description': 'Created with Python SDK'
    })
    
    # Add items
    items = await client.projects.items.batch_create(project.id, [
        {
            'name': 'Python Item 1',
            'type': 'document',
            'content': {'text': 'Hello from Python!'}
        },
        {
            'name': 'Python Item 2',
            'type': 'code',
            'content': {'language': 'python', 'code': 'print("Hello World")'}
        }
    ])
    
    print(f"Created project: {project.name}")
    print(f"Added {len(items)} items")

# Run async function
asyncio.run(main())
```

### Webhook Handler

```javascript
const express = require('express');
const crypto = require('crypto');

const app = express();
app.use(express.json());

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

app.post('/webhook', (req, res) => {
  // Verify webhook signature
  const signature = req.headers['x-webhook-signature'];
  const payload = JSON.stringify(req.body);
  const expectedSignature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');

  if (signature !== expectedSignature) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // Handle webhook events
  const { event, data } = req.body;

  switch (event) {
    case 'item.created':
      console.log('New item created:', data.item.name);
      // Process new item
      break;
    case 'item.updated':
      console.log('Item updated:', data.item.name);
      // Process updated item
      break;
    case 'project.deleted':
      console.log('Project deleted:', data.projectId);
      // Clean up local data
      break;
  }

  res.status(200).json({ received: true });
});

app.listen(3000, () => {
  console.log('Webhook server running on port 3000');
});
```

### File Upload

```javascript
// Upload file to project
const uploadFile = async (projectId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('name', file.name);
  formData.append('type', 'document');

  const response = await fetch(`/api/projects/${projectId}/items`, {
    method: 'POST',
    body: formData,
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  return await response.json();
};

// Usage
const fileInput = document.getElementById('file-input');
fileInput.addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (file) {
    const item = await uploadFile('proj_123', file);
    console.log('File uploaded:', item);
  }
});
```

## Performance Optimization

### Lazy Loading

```javascript
// Lazy load project data
const loadProjectData = async (projectId) => {
  const [project, items, collaborators] = await Promise.all([
    client.projects.get(projectId),
    client.projects.items.list(projectId, { limit: 10 }),
    client.projects.collaborators.list(projectId)
  ]);

  return { project, items, collaborators };
};

// Use with React Suspense
const ProjectData = React.lazy(() => 
  loadProjectData('proj_123').then(data => ({ default: () => <ProjectView data={data} /> }))
);
```

### Pagination

```javascript
// Efficient pagination
const loadAllItems = async (projectId) => {
  const allItems = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await client.projects.items.list(projectId, {
      page,
      limit: 100
    });

    allItems.push(...response.data);
    hasMore = response.pagination.page < response.pagination.pages;
    page++;
  }

  return allItems;
};
```

These examples demonstrate common patterns and best practices for working with Project Name. For more specific use cases, refer to the [API Reference](api-reference.md) or [Community Examples](https://github.com/projectname/examples).
