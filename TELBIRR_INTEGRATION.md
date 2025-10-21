# Telbirr Payment Integration Guide

This guide explains how to integrate and use Telbirr mobile payment system alongside the existing Stripe payment system.

## Overview

Telbirr is a mobile payment service widely used in Ethiopia. This integration allows customers to pay using their Telbirr mobile wallet instead of credit cards.

## How It Works

1. Customer selects Telbirr as payment method during checkout
2. Customer enters their Ethiopian phone number
3. System generates a unique payment reference number
4. Customer receives payment instructions with reference number
5. Customer completes payment using Telbirr USSD code (*847#)
6. Customer returns to website and verifies payment
7. Order is created and confirmed

## Implementation Details

### Backend Changes

1. **New Controller Functions**:
   - `createTelbirrPayment`: Generates payment reference and instructions
   - `verifyTelbirrPayment`: Verifies payment completion with Telbirr API

2. **Updated Routes**:
   - `POST /api/payments/create-telbirr-payment`
   - `POST /api/payments/verify-telbirr-payment`

3. **Order Model Updates**:
   - Added `paymentMethod` field (enum: "stripe", "telbirr")
   - Added `telbirrReference` field for storing Telbirr payment references

4. **Checkout Success Handler**:
   - Modified to handle both Stripe and Telbirr payments

### Frontend Changes

1. **OrderSummary Component**:
   - Added payment method selection (Stripe or Telbirr)
   - Added phone number input for Telbirr payments
   - Added payment instructions display
   - Added payment verification button

## API Endpoints

### Create Telbirr Payment
```
POST /api/payments/create-telbirr-payment
```

**Request Body**:
```json
{
  "products": [...],
  "couponCode": "COUPON123",
  "phoneNumber": "0912345678"
}
```

**Response**:
```json
{
  "paymentReference": "TEL1234567890",
  "totalAmount": 99.99,
  "phoneNumber": "0912345678",
  "message": "Proceed with Telbirr payment using the reference number",
  "instructions": "Dial *847# on your phone..."
}
```

### Verify Telbirr Payment
```
POST /api/payments/verify-telbirr-payment
```

**Request Body**:
```json
{
  "paymentReference": "TEL1234567890"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Payment verified successfully"
}
```

## Environment Variables

Add the following environment variable to your configuration:

```
TELBIRR_MERCHANT_PHONE=0987654321
```

This is the merchant phone number that customers will send money to.

## Frontend Implementation

The OrderSummary component now includes:

1. **Payment Method Selection**:
   - Radio buttons to choose between Stripe and Telbirr
   - Conditional rendering based on selection

2. **Phone Number Input**:
   - Validation for Ethiopian phone numbers (10 digits)
   - Proper formatting and error handling

3. **Payment Instructions**:
   - Display of reference number
   - Step-by-step payment instructions
   - Amount and merchant phone number

4. **Payment Verification**:
   - Button to verify payment completion
   - Success/error handling

## Testing

To test the Telbirr integration:

1. Select Telbirr as payment method
2. Enter a valid Ethiopian phone number
3. Click "Proceed to Checkout"
4. Follow the displayed instructions
5. Click "Verify Payment" after completing the payment

## Production Considerations

1. **Telbirr API Integration**:
   - In a production environment, integrate with the actual Telbirr API
   - Implement proper authentication and security measures
   - Handle API errors and edge cases

2. **Payment Verification**:
   - Implement server-side verification with Telbirr's API
   - Store payment details temporarily for verification
   - Handle payment status updates

3. **Security**:
   - Validate all inputs and references
   - Implement proper authentication for payment endpoints
   - Use HTTPS for all payment-related communications

4. **Error Handling**:
   - Provide clear error messages to users
   - Log errors for debugging and monitoring
   - Implement retry mechanisms for failed payments

## Future Improvements

1. **Webhook Integration**:
   - Implement Telbirr webhooks for automatic payment notifications
   - Reduce reliance on manual verification

2. **Payment Status Tracking**:
   - Add real-time payment status updates
   - Implement payment timeout handling

3. **Enhanced User Experience**:
   - Add QR code generation for easier payments
   - Implement SMS notifications for payment instructions

## Support

For issues with the Telbirr integration:

1. Check the application logs for error messages
2. Verify that all environment variables are correctly set
3. Ensure the Telbirr merchant account is properly configured
4. Contact support with detailed error messages and logs