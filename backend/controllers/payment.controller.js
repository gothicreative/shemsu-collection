import Coupon from "../models/coupon.model.js";
import Order from "../models/order.model.js";
import { stripe } from "../lib/stripe.js";
import User from "../models/user.model.js";

export const createCheckoutSession = async (req, res) => {
	try {
		const { products, couponCode } = req.body;
		
		// Log request details for debugging
		console.log('Payment request received:', {
			userId: req.user?._id,
			productsCount: products?.length,
			couponCode: couponCode,
			clientUrl: process.env.CLIENT_URL || `${req.protocol}://${req.get('host')}`
		});
		
		// Log request details for debugging
		console.log('Payment request received:', {
			userId: req.user?._id,
			productsCount: products?.length,
			couponCode: couponCode,
			clientUrl: process.env.CLIENT_URL || `${req.protocol}://${req.get('host')}`
		});

		// Enhanced validation
		if (!req.user) {
			return res.status(401).json({ error: "User not authenticated" });
		}

		if (!Array.isArray(products) || products.length === 0) {
			return res.status(400).json({ error: "Invalid or empty products array" });
		}

		// Validate each product in the array
		for (const product of products) {
			if (!product._id || !product.name || typeof product.price !== 'number' || typeof product.quantity !== 'number') {
				return res.status(400).json({ error: "Invalid product data structure", product });
			}
		}

		let totalAmount = 0;

		const lineItems = products.map((product) => {
			const amount = Math.round(product.price * 100); // stripe wants u to send in the format of cents
			totalAmount += amount * product.quantity;

			return {
				price_data: {
					currency: "usd",
					product_data: {
						name: product.name,
						images: [product.image],
					},
					unit_amount: amount,
				},
				quantity: product.quantity || 1,
			};
		});

		let coupon = null;
		if (couponCode) {
			coupon = await Coupon.findOne({ code: couponCode, userId: req.user._id, isActive: true });
			// Check if coupon exists and hasn't expired
			if (coupon && coupon.expirationDate > new Date()) {
				totalAmount -= Math.round((totalAmount * coupon.discountPercentage) / 100);
			} else {
				// If coupon is invalid or expired, set coupon to null
				coupon = null;
			}
		}

		// Ensure total amount is positive
		if (totalAmount <= 0) {
			return res.status(400).json({ error: "Total amount must be greater than zero" });
		}

		// Use CLIENT_URL from environment variables, fallback to request origin for production
		const clientUrl = process.env.CLIENT_URL || `${req.protocol}://${req.get('host')}`;

		const session = await stripe.checkout.sessions.create({
			payment_method_types: ["card"],
			line_items: lineItems,
			mode: "payment",
			success_url: `${clientUrl}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${clientUrl}/purchase-cancel`,
			discounts: coupon
				? [
						{
							coupon: await createStripeCoupon(coupon.discountPercentage),
						},
				  ]
				: [],
			metadata: {
				userId: req.user._id.toString(),
				couponCode: couponCode || "",
				products: JSON.stringify(
					products.map((p) => ({
						id: p._id,
						quantity: p.quantity,
						price: p.price,
					}))
				),
			},
		});

		if (totalAmount >= 20000) {
			await createNewCoupon(req.user._id);
		}
		// await coupon.save();
		res.status(200).json({ id: session.id, totalAmount: totalAmount / 100 });
	} catch (error) {
		console.error("Error processing checkout:", error);
		// Log detailed error information
		console.error("Error details:", {
			message: error.message,
			type: error.type,
			code: error.code,
			decline_code: error.decline_code,
			doc_url: error.doc_url,
			requestId: error.requestId,
			statusCode: error.statusCode
		});
		
		// More detailed error response
		if (error.type === 'StripeCardError') {
			return res.status(400).json({ 
				message: "Card error", 
				error: error.message,
				details: {
					code: error.code,
					decline_code: error.decline_code
				}
			});
		} else if (error.type === 'StripeRateLimitError') {
			return res.status(429).json({ 
				message: "Too many requests", 
				error: error.message 
			});
		} else if (error.type === 'StripeInvalidRequestError') {
			return res.status(400).json({ 
				message: "Invalid request", 
				error: error.message 
			});
		} else if (error.type === 'StripeAPIError') {
			return res.status(500).json({ 
				message: "Stripe API error", 
				error: error.message 
			});
		} else if (error.type === 'StripeConnectionError') {
			return res.status(503).json({ 
				message: "Network error", 
				error: error.message 
			});
		}
		res.status(500).json({ 
			message: "Error processing checkout", 
			error: error.message,
			details: process.env.NODE_ENV === 'development' ? error : undefined
		});
	}
};

export const checkoutSuccess = async (req, res) => {
    try {
        const { sessionId, paymentReference } = req.body;
        
        // Log request details for debugging
        console.log('Checkout success request received:', {
            userId: req.user?._id,
            sessionId: sessionId,
            paymentReference: paymentReference
        });
        
        // Handle Stripe payment
        if (sessionId) {
            const session = await stripe.checkout.sessions.retrieve(sessionId);

            if (!session || session.payment_status !== "paid") {
                return res.status(400).json({ message: "Payment not completed or session not found" });
            }

            // Check for existing order with this stripeSessionId
            const existingOrder = await Order.findOne({ stripeSessionId: sessionId });
            if (existingOrder) {
                return res.status(200).json({
                    success: true,
                    message: "Order already exists for this session.",
                    orderId: existingOrder._id,
                });
            }

            if (session.metadata.couponCode) {
                await Coupon.findOneAndUpdate(
                    {
                        code: session.metadata.couponCode,
                        userId: session.metadata.userId,
                    },
                    {
                        isActive: false,
                    }
                );
            }

            // create a new Order
            const products = JSON.parse(session.metadata.products);
            const newOrder = new Order({
                user: session.metadata.userId,
                products: products.map((product) => ({
                    product: product.id,
                    quantity: product.quantity,
                    price: product.price,
                })),
                totalAmount: session.amount_total / 100, // convert from cents to dollars,
                stripeSessionId: sessionId,
                paymentMethod: "stripe"
            });

            await newOrder.save();

            // Clear the user's cart after successful purchase
            const user = await User.findById(session.metadata.userId);
            if (user) {
                user.cartItems = [];
                await user.save();
            }

            res.status(200).json({
                success: true,
                message: "Payment successful, order created, cart cleared, and coupon deactivated if used.",
                orderId: newOrder._id,
            });
        }
        // Handle Telbirr payment
        else if (paymentReference) {
            // In a real implementation, you would verify with Telbirr's API
            // For now, we'll simulate a successful verification
            
            // Check for existing order with this telbirrReference
            const existingOrder = await Order.findOne({ telbirrReference: paymentReference });
            if (existingOrder) {
                return res.status(200).json({
                    success: true,
                    message: "Order already exists for this payment.",
                    orderId: existingOrder._id,
                });
            }
            
            // Get payment details from a temporary storage
            // In a real implementation, you would get this from your database
            // For now, we'll assume the payment details are sent in the request
            const { products, totalAmount, couponCode } = req.body;
            
            if (couponCode) {
                await Coupon.findOneAndUpdate(
                    {
                        code: couponCode,
                        userId: req.user._id,
                    },
                    {
                        isActive: false,
                    }
                );
            }

            // create a new Order
            const newOrder = new Order({
                user: req.user._id,
                products: products.map((product) => ({
                    product: product.id,
                    quantity: product.quantity,
                    price: product.price,
                })),
                totalAmount: totalAmount,
                telbirrReference: paymentReference,
                paymentMethod: "telbirr"
            });

            await newOrder.save();

            // Clear the user's cart after successful purchase
            const user = await User.findById(req.user._id);
            if (user) {
                user.cartItems = [];
                await user.save();
            }

            res.status(200).json({
                success: true,
                message: "Payment successful, order created, cart cleared, and coupon deactivated if used.",
                orderId: newOrder._id,
            });
        }
        else {
            return res.status(400).json({ message: "Session ID or Payment Reference is required" });
        }
    } catch (error) {
        console.error("Error processing successful checkout:", error);
        // Log detailed error information
        console.error("Error details:", {
            message: error.message,
            stack: error.stack,
            userId: req.user?._id,
            sessionId: req.body?.sessionId,
            paymentReference: req.body?.paymentReference
        });
        res.status(500).json({ 
            message: "Error processing successful checkout", 
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// TELBIRR PAYMENT FUNCTIONS

export const createTelbirrPayment = async (req, res) => {
	try {
		const { products, couponCode, phoneNumber } = req.body;
		
		// Log request details for debugging
		console.log('Telbirr payment request received:', {
			userId: req.user?._id,
			productsCount: products?.length,
			couponCode: couponCode,
			phoneNumber: phoneNumber
		});

		// Enhanced validation
		if (!req.user) {
			return res.status(401).json({ error: "User not authenticated" });
		}

		if (!Array.isArray(products) || products.length === 0) {
			return res.status(400).json({ error: "Invalid or empty products array" });
		}

		// Validate phone number for Telbirr
		if (!phoneNumber || !/^[0-9]{10}$/.test(phoneNumber)) {
			return res.status(400).json({ error: "Valid Ethiopian phone number required (10 digits)" });
		}

		// Validate each product in the array
		for (const product of products) {
			if (!product._id || !product.name || typeof product.price !== 'number' || typeof product.quantity !== 'number') {
				return res.status(400).json({ error: "Invalid product data structure", product });
			}
		}

		let totalAmount = 0;

		// Calculate total amount
		products.forEach((product) => {
			totalAmount += product.price * product.quantity;
		});

		let coupon = null;
		if (couponCode) {
			coupon = await Coupon.findOne({ code: couponCode, userId: req.user._id, isActive: true });
			// Check if coupon exists and hasn't expired
			if (coupon && coupon.expirationDate > new Date()) {
				totalAmount -= (totalAmount * coupon.discountPercentage) / 100;
			} else {
				// If coupon is invalid or expired, set coupon to null
				coupon = null;
			}
		}

		// Ensure total amount is positive
		if (totalAmount <= 0) {
			return res.status(400).json({ error: "Total amount must be greater than zero" });
		}

		// Generate a unique payment reference for Telbirr
		const paymentReference = "TEL" + Date.now() + Math.random().toString(36).substring(2, 8).toUpperCase();

		// In a real implementation, you would integrate with Telbirr's API here
		// For now, we'll simulate the process
		
		// Create a pending order
		const productsData = products.map((p) => ({
			id: p._id,
			quantity: p.quantity,
			price: p.price,
		}));

		// Return payment details to frontend
		res.status(200).json({
			paymentReference,
			totalAmount,
			phoneNumber,
			message: "Proceed with Telbirr payment using the reference number",
			instructions: `Dial *847# on your phone, select Send Money, enter the phone number ${process.env.TELBIRR_MERCHANT_PHONE || "MERCHANT_PHONE"}, amount ${totalAmount.toFixed(2)}, and reference ${paymentReference}`
		});

	} catch (error) {
		console.error("Error processing Telbirr payment:", error);
		res.status(500).json({ 
			message: "Error processing Telbirr payment", 
			error: error.message 
		});
	}
};

export const verifyTelbirrPayment = async (req, res) => {
	try {
		const { paymentReference } = req.body;
		
		// Log verification request
		console.log('Telbirr payment verification request:', {
			userId: req.user?._id,
			paymentReference: paymentReference
		});

		if (!paymentReference) {
			return res.status(400).json({ message: "Payment reference is required" });
		}

		// In a real implementation, you would verify with Telbirr's API
		// For now, we'll simulate a successful verification
		
		// In a real scenario, you would check with Telbirr's API if the payment was successful
		// and match the amount and reference number
		
		// Simulate payment verification (in real implementation, call Telbirr API)
		const isPaymentSuccessful = true; // This would come from Telbirr's API
		
		if (isPaymentSuccessful) {
			// Create order after successful payment verification
			// In a real implementation, you would get order details from a temporary storage
			// For now, we'll just return success
			
			res.status(200).json({
				success: true,
				message: "Payment verified successfully"
			});
		} else {
			res.status(400).json({
				success: false,
				message: "Payment verification failed"
			});
		}

	} catch (error) {
		console.error("Error verifying Telbirr payment:", error);
		res.status(500).json({ 
			message: "Error verifying Telbirr payment", 
			error: error.message 
		});
	}
};

async function createNewCoupon(userId) {
	await Coupon.findOneAndDelete({ userId });

	const newCoupon = new Coupon({
		code: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
		discountPercentage: 10,
		expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
		userId: userId,
	});

	await newCoupon.save();

	return newCoupon;
}

async function createStripeCoupon(discountPercentage) {
	const coupon = await stripe.coupons.create({
		percent_off: discountPercentage,
		duration: "once",
	});

	return coupon.id;
}
