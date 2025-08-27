# Database-Backed User Registration Implementation

## Overview

This document describes the implementation of database-backed user registration for the BeamFlow system. The registration system now properly persists user data to MongoDB and provides secure authentication.

## Implementation Details

### 1. Database Models

The system uses MongoDB with Mongoose for data persistence. The following models are defined in `BeamDatabase.js`:

#### User Model
- **username**: Unique username (3-30 characters)
- **email**: Unique email address
- **password**: Hashed password (minimum 8 characters)
- **role**: User role (admin, user, moderator)
- **profile**: User profile information
- **preferences**: User preferences
- **status**: Account status (active, inactive, suspended)
- **lastLogin**: Last login timestamp
- **loginAttempts**: Failed login attempts counter
- **lockUntil**: Account lock timestamp
- **createdAt/updatedAt**: Timestamps

#### Session Model
- **sessionId**: Unique session identifier
- **userId**: Reference to user
- **userAgent**: Browser/device information
- **ipAddress**: User's IP address
- **expiresAt**: Session expiration time
- **isActive**: Session status

#### Log Model
- **level**: Log level (error, warn, info, debug)
- **message**: Log message
- **source**: Source of the log
- **userId**: Associated user (optional)
- **metadata**: Additional log data

### 2. Authentication Service

The `BeamUserService` provides comprehensive user management:

#### Key Methods
- `createUser(userData)`: Creates new user with validation
- `authenticateUser(username, password)`: Authenticates user credentials
- `generateToken(user)`: Generates JWT token
- `verifyToken(token)`: Verifies JWT token
- `createSession(userId, userAgent, ipAddress)`: Creates user session
- `validateSession(sessionId)`: Validates session
- `invalidateSession(sessionId)`: Invalidates session

#### Security Features
- Password hashing with bcrypt (12 rounds)
- Account locking after 5 failed login attempts
- Session management with expiration
- Comprehensive logging of user actions

### 3. Authentication Middleware

The `BeamAuth` middleware provides:

#### Middleware Functions
- `authenticateToken`: Validates JWT tokens
- `requireAuth`: Requires authentication
- `requireAdmin`: Requires admin role
- `requireRole(role)`: Requires specific role
- `requireAnyRole(roles)`: Requires any of specified roles

### 4. API Endpoints

#### Registration
```
POST /api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "_id": "user_id",
    "username": "testuser",
    "email": "test@example.com",
    "role": "user",
    "status": "active",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "User created successfully"
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "username": "testuser",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "sessionId": "session_id_here",
  "user": {
    "_id": "user_id",
    "username": "testuser",
    "email": "test@example.com",
    "role": "user"
  },
  "message": "Login successful"
}
```

### 5. Environment Variables

Required environment variables:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/beamflow
REDIS_URI=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key
BCRYPT_ROUNDS=12

# Session
SESSION_TIMEOUT=3600000

# Admin (for admin login)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=secure_admin_password
```

### 6. Testing

A test script is provided at `test-registration.js` to verify the implementation:

```bash
# Start the server
npm start

# In another terminal, run the test
node test-registration.js
```

The test script verifies:
- User registration
- Duplicate registration rejection
- User login
- Invalid login rejection

## Security Considerations

1. **Password Security**: Passwords are hashed using bcrypt with 12 rounds
2. **Account Locking**: Accounts are locked after 5 failed login attempts
3. **Session Management**: Sessions expire and can be invalidated
4. **Input Validation**: All user inputs are validated
5. **Error Handling**: Comprehensive error handling prevents information leakage
6. **Logging**: All authentication events are logged for audit purposes

## Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  username: String (unique, required),
  email: String (unique, required),
  password: String (hashed, required),
  role: String (enum: ['admin', 'user', 'moderator']),
  profile: {
    firstName: String,
    lastName: String,
    avatar: String,
    bio: String,
    location: String,
    website: String
  },
  preferences: {
    theme: String,
    language: String,
    notifications: Boolean,
    twoFactorEnabled: Boolean
  },
  status: String (enum: ['active', 'inactive', 'suspended']),
  lastLogin: Date,
  loginAttempts: Number,
  lockUntil: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Session Collection
```javascript
{
  _id: ObjectId,
  sessionId: String (unique, required),
  userId: ObjectId (ref: 'User', required),
  userAgent: String,
  ipAddress: String,
  expiresAt: Date (required),
  isActive: Boolean,
  createdAt: Date
}
```

### Log Collection
```javascript
{
  _id: ObjectId,
  level: String (enum: ['error', 'warn', 'info', 'debug']),
  message: String (required),
  source: String (required),
  userId: ObjectId (ref: 'User'),
  metadata: Mixed,
  timestamp: Date
}
```

## Migration from Previous Implementation

The previous implementation had a TODO comment and only returned success without storing data. The new implementation:

1. ✅ Removes the TODO comment
2. ✅ Implements actual database persistence
3. ✅ Adds proper validation and error handling
4. ✅ Provides comprehensive user management
5. ✅ Includes security features
6. ✅ Adds session management
7. ✅ Implements proper logging

## Next Steps

1. **Email Verification**: Add email verification for new registrations
2. **Password Reset**: Implement password reset functionality
3. **Two-Factor Authentication**: Add 2FA support
4. **Rate Limiting**: Implement rate limiting for registration/login
5. **OAuth Integration**: Add social login options
6. **User Profile Management**: Add profile update endpoints
7. **Admin User Management**: Add admin interface for user management
