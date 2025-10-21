# Deployment Guide for Render.com

This guide explains how to deploy the E-Commerce Store application to Render.com.

## Environment Variables

You must set the following environment variables in your Render.com dashboard:

### Required Environment Variables

```
# Server Configuration
PORT=5000
NODE_ENV=production

# Database Configuration
MONGO_URI=your_mongodb_connection_string
REDIS_URL=your_redis_connection_string

# JWT Configuration
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret

# Client Configuration
CLIENT_URL=https://your-render-app-name.onrender.com

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Generating Secrets

You can generate secure secrets using Node.js:

```javascript
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Run this command twice to generate values for ACCESS_TOKEN_SECRET and REFRESH_TOKEN_SECRET.

## Render.com Configuration

### Web Service Settings

1. Create a new Web Service on Render.com
2. Connect your GitHub repository
3. Set the following build command:
   ```
   npm run build
   ```
4. Set the start command:
   ```
   npm start
   ```
5. Set the root directory to: `.`

### Environment Variables in Render.com

In your Render.com dashboard:
1. Go to your Web Service
2. Click on "Environment" tab
3. Add all the required environment variables listed above

## Stripe Webhook Configuration

To handle Stripe webhooks properly in production:

1. In your Stripe Dashboard, go to Developers > Webhooks
2. Add a new endpoint with the URL:
   ```
   https://your-render-app-name.onrender.com/api/payments/webhook
   ```
3. Select the following events:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `charge.succeeded`

## Troubleshooting Payment Issues

If payments work locally but not on Render.com, check:

1. **Environment Variables**: Ensure STRIPE_SECRET_KEY is correctly set
2. **CLIENT_URL**: Make sure it matches your Render.com app URL
3. **CORS Settings**: Verify that CORS is properly configured
4. **Cookie Settings**: Check that cookies are properly configured for production
5. **SSL/HTTPS**: Render.com provides HTTPS automatically, but verify your URLs use https://

## Common Issues and Solutions

### 1. Payment Session Creation Fails
- Check that STRIPE_SECRET_KEY is set correctly
- Verify that the Stripe account is not in restricted mode
- Ensure products have valid prices and images

### 2. Redirect URLs Not Working
- Confirm CLIENT_URL matches your Render.com app URL
- Check that the frontend is properly built and served

### 3. Authentication Issues
- Verify that ACCESS_TOKEN_SECRET and REFRESH_TOKEN_SECRET are set
- Check cookie configuration for production environments

### 4. CORS Errors
- Ensure CORS is properly configured in server.js
- Verify that the origin matches your frontend URL

## Logs and Monitoring

To debug issues on Render.com:

1. Go to your Web Service dashboard
2. Click on "Logs" tab
3. Look for error messages in the application logs
4. The enhanced logging we added will provide detailed information about payment processing

## Scaling Considerations

For production deployment:

1. Use a production MongoDB database (not local)
2. Use a production Redis instance (not local)
3. Enable Redis persistence
4. Monitor Stripe webhook delivery in the Stripe Dashboard
5. Set up proper error monitoring and alerting

## Support

If you continue to experience issues:

1. Check the application logs on Render.com
2. Verify all environment variables are correctly set
3. Ensure your Stripe account is properly configured
4. Contact support with detailed error messages and logs# Deployment Guide for Render.com

This guide explains how to deploy the E-Commerce Store application to Render.com.

## Environment Variables

You must set the following environment variables in your Render.com dashboard:

### Required Environment Variables

```
# Server Configuration
PORT=5000
NODE_ENV=production

# Database Configuration
MONGO_URI=your_mongodb_connection_string
REDIS_URL=your_redis_connection_string

# JWT Configuration
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret

# Client Configuration
CLIENT_URL=https://your-render-app-name.onrender.com

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Generating Secrets

You can generate secure secrets using Node.js:

```javascript
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Run this command twice to generate values for ACCESS_TOKEN_SECRET and REFRESH_TOKEN_SECRET.

## Render.com Configuration

### Web Service Settings

1. Create a new Web Service on Render.com
2. Connect your GitHub repository
3. Set the following build command:
   ```
   npm run build
   ```
4. Set the start command:
   ```
   npm start
   ```
5. Set the root directory to: `.`

### Environment Variables in Render.com

In your Render.com dashboard:
1. Go to your Web Service
2. Click on "Environment" tab
3. Add all the required environment variables listed above

## Stripe Webhook Configuration

To handle Stripe webhooks properly in production:

1. In your Stripe Dashboard, go to Developers > Webhooks
2. Add a new endpoint with the URL:
   ```
   https://your-render-app-name.onrender.com/api/payments/webhook
   ```
3. Select the following events:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `charge.succeeded`

## Troubleshooting Payment Issues

If payments work locally but not on Render.com, check:

1. **Environment Variables**: Ensure STRIPE_SECRET_KEY is correctly set
2. **CLIENT_URL**: Make sure it matches your Render.com app URL
3. **CORS Settings**: Verify that CORS is properly configured
4. **Cookie Settings**: Check that cookies are properly configured for production
5. **SSL/HTTPS**: Render.com provides HTTPS automatically, but verify your URLs use https://

## Common Issues and Solutions

### 1. Payment Session Creation Fails
- Check that STRIPE_SECRET_KEY is set correctly
- Verify that the Stripe account is not in restricted mode
- Ensure products have valid prices and images

### 2. Redirect URLs Not Working
- Confirm CLIENT_URL matches your Render.com app URL
- Check that the frontend is properly built and served

### 3. Authentication Issues
- Verify that ACCESS_TOKEN_SECRET and REFRESH_TOKEN_SECRET are set
- Check cookie configuration for production environments

### 4. CORS Errors
- Ensure CORS is properly configured in server.js
- Verify that the origin matches your frontend URL

## Logs and Monitoring

To debug issues on Render.com:

1. Go to your Web Service dashboard
2. Click on "Logs" tab
3. Look for error messages in the application logs
4. The enhanced logging we added will provide detailed information about payment processing

## Scaling Considerations

For production deployment:

1. Use a production MongoDB database (not local)
2. Use a production Redis instance (not local)
3. Enable Redis persistence
4. Monitor Stripe webhook delivery in the Stripe Dashboard
5. Set up proper error monitoring and alerting

## Support

If you continue to experience issues:

1. Check the application logs on Render.com
2. Verify all environment variables are correctly set
3. Ensure your Stripe account is properly configured
4. Contact support with detailed error messages and logs