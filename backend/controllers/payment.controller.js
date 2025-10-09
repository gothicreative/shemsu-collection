import Coupon from "../models/coupon.model.js";
import Order from "../models/order.model.js";
import { stripe } from "../lib/stripe.js";
import User from "../models/user.model.js";

export const createCheckoutSession = async (req, res) => {
	try {
		const { products, couponCode } = req.body;

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

		const session = await stripe.checkout.sessions.create({
			payment_method_types: ["card"],
			line_items: lineItems,
			mode: "payment",
			success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
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
		// More detailed error response
		if (error.type === 'StripeCardError') {
			return res.status(400).json({ message: "Card error", error: error.message });
		} else if (error.type === 'StripeRateLimitError') {
			return res.status(429).json({ message: "Too many requests", error: error.message });
		} else if (error.type === 'StripeInvalidRequestError') {
			return res.status(400).json({ message: "Invalid request", error: error.message });
		} else if (error.type === 'StripeAPIError') {
			return res.status(500).json({ message: "Stripe API error", error: error.message });
		} else if (error.type === 'StripeConnectionError') {
			return res.status(503).json({ message: "Network error", error: error.message });
		}
		res.status(500).json({ message: "Error processing checkout", error: error.message });
	}
};

export const checkoutSuccess = async (req, res) => {
    try {
        const { sessionId } = req.body;
        if (!sessionId) {
            return res.status(400).json({ message: "Session ID is required" });
        }

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
    } catch (error) {
        console.error("Error processing successful checkout:", error);
        res.status(500).json({ message: "Error processing successful checkout", error: error.message });
    }
};
async function createStripeCoupon(discountPercentage) {
	const coupon = await stripe.coupons.create({
		percent_off: discountPercentage,
		duration: "once",
	});

	return coupon.id;
}

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