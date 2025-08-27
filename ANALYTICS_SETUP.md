# Analytics Setup Guide

This guide explains how to set up analytics for your documentation site.

## Google Analytics Setup

### 1. Get Your Google Analytics Measurement ID

1. go to [Google Analytics](https://analytics.google.com/)
2. Create a new property or use an existing one
3. Get your Measurement ID (format: G-XXXXXXXXXX)

### 2. Configure Environment Variables

Add your Google Analytics Measurement ID to your environment variables:

```bash
# In your .env file or environment variables
GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

**Important**: Replace `G-XXXXXXXXXX` with your actual Google Analytics Measurement ID.

### 3. Deploy with Analytics

The analytics system will automatically:
- Load Google Analytics when a valid Measurement ID is provided
- Track page views, user interactions, and performance metrics
- Send data to both Google Analytics and your custom analytics endpoint

## Custom Analytics Endpoint

The system includes a custom analytics endpoint at `/api/analytics` that:

- Tracks user interactions (clicks, form submissions, scroll depth)
- Monitors performance metrics (load times, paint events)
- Captures error events
- Stores session data

### Available Endpoints

- `POST /api/analytics` - Track custom events
- `POST /api/analytics/session` - Track session data
- `GET /api/analytics/stats` - Get analytics statistics
- `GET /api/analytics/health` - Health check
- `GET /api/analytics/config` - Get analytics configuration

## Testing Analytics

### 1. Check Analytics Configuration

Visit `/api/analytics/config` to verify your GA Measurement ID is properly configured.

### 2. Test Event Tracking

Open your browser's developer tools and check the console for analytics messages:
- "Google Analytics initialized with ID: G-XXXXXXXXXX" (success)
- "Google Analytics not initialized - no valid measurement ID found" (needs configuration)

### 3. Verify Data Collection

- Check Google Analytics Real-Time reports
- Visit `/api/analytics/stats` to see custom analytics data
- Monitor browser console for analytics events

## Troubleshooting

### Analytics Not Loading

1. **Check Environment Variables**: Ensure `GA_MEASUREMENT_ID` is set correctly
2. **Verify ID Format**: GA Measurement ID should start with "G-"
3. **Check Network**: Ensure the site can reach Google Analytics servers

### Custom Analytics Endpoint Issues

1. **Check Server Logs**: Look for analytics-related errors
2. **Verify Route Registration**: Ensure analytics routes are properly loaded
3. **Test Endpoint**: Visit `/api/analytics/health` to check endpoint status

### Data Not Appearing in Google Analytics

1. **Wait for Processing**: GA data can take 24-48 hours to appear
2. **Check Real-Time Reports**: Use GA Real-Time to verify immediate data
3. **Verify Tracking Code**: Check browser network tab for GA requests

## Privacy Considerations

- Analytics data is collected anonymously
- No personally identifiable information is tracked
- Users can opt out via browser settings
- Local storage fallback respects user privacy

## Performance Impact

- Google Analytics loads asynchronously
- Custom analytics use efficient data structures
- Local storage fallback prevents data loss
- Minimal impact on page load times
