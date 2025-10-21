import { motion } from "framer-motion";
import { useCartStore } from "../stores/useCartStore";
import { Link } from "react-router-dom";
import { MoveRight } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import axios from "../lib/axios";
import { useState } from "react";
import toast from "react-hot-toast";

const stripePromise = loadStripe(
	"pk_test_51RfNSxDAlHiXMMaGok8oLcEJxNzGCJAeKwYvX8fehPfeA6bC9Afs3XBgklUBlCmFMGDPFWsW7NxQfVcJa96wiAx100S6GC0DnX"
);

const OrderSummary = () => {
	const { total, subtotal, coupon, isCouponApplied, cart } = useCartStore();
	const [isProcessing, setIsProcessing] = useState(false);

	const savings = subtotal - total;
	const formattedSubtotal = subtotal.toFixed(2);
	const formattedTotal = total.toFixed(2);
	const formattedSavings = savings.toFixed(2);

	const handleStripePayment = async () => {
		try {
			const stripe = await stripePromise;
			
			// Validate cart data before sending
			if (!cart || cart.length === 0) {
				toast.error("Cart is empty");
				return;
			}
			
			const res = await axios.post("/payments/create-checkout-session", {
				products: cart,
				couponCode: coupon ? coupon.code : null,
			});

			const session = res.data;
			
			if (!session.id) {
				toast.error("Invalid session data received");
				return;
			}
			
			const result = await stripe.redirectToCheckout({
				sessionId: session.id,
			});

			if (result.error) {
				toast.error(`Stripe error: ${result.error.message}`);
			}
		} catch (error) {
			console.error("Payment error:", error);
			toast.error("Payment failed. Please try again.");
			if (error.response) {
				// Server responded with error status
				console.error("Server error response:", error.response.data);
				console.error("Status code:", error.response.status);
			} else if (error.request) {
				// Request was made but no response received
				console.error("No response received:", error.request);
			} else {
				// Something else happened
				console.error("Error message:", error.message);
			}
		}
	};

	return (
		<motion.div
			className='space-y-4 rounded-lg border border-gray-700 bg-gray-800 p-4 shadow-sm sm:p-6'
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
		>
			<p className='text-xl font-semibold text-emerald-400'>Order summary</p>

			<div className='space-y-4'>
				<div className='space-y-2'>
					<dl className='flex items-center justify-between gap-4'>
						<dt className='text-base font-normal text-gray-300'>Original price</dt>
						<dd className='text-base font-medium text-white'>${formattedSubtotal}</dd>
					</dl>

					{savings > 0 && (
						<dl className='flex items-center justify-between gap-4'>
							<dt className='text-base font-normal text-gray-300'>Savings</dt>
							<dd className='text-base font-medium text-emerald-400'>-${formattedSavings}</dd>
						</dl>
					)}

					{coupon && isCouponApplied && (
						<dl className='flex items-center justify-between gap-4'>
							<dt className='text-base font-normal text-gray-300'>Coupon ({coupon.code})</dt>
							<dd className='text-base font-medium text-emerald-400'>-{coupon.discountPercentage}%</dd>
						</dl>
					)}
					<dl className='flex items-center justify-between gap-4 border-t border-gray-600 pt-2'>
						<dt className='text-base font-bold text-white'>Total</dt>
						<dd className='text-base font-bold text-emerald-400'>${formattedTotal}</dd>
					</dl>
				</div>

				<motion.button
					className='flex w-full items-center justify-center rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-300 disabled:opacity-50'
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
					onClick={handleStripePayment}
					disabled={isProcessing}
				>
					{isProcessing ? "Processing..." : "Proceed to Checkout with Stripe"}
				</motion.button>

				<div className='flex items-center justify-center gap-2'>
					<span className='text-sm font-normal text-gray-400'>or</span>
					<Link
						to='/'
						className='inline-flex items-center gap-2 text-sm font-medium text-emerald-400 underline hover:text-emerald-300 hover:no-underline'
					>
						Continue Shopping
						<MoveRight size={16} />
					</Link>
				</div>
			</div>
		</motion.div>
	);
};
export default OrderSummary;