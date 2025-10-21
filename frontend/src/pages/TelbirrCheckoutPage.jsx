import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../stores/useCartStore";
import { motion } from "framer-motion";
import axios from "../lib/axios";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";

const TelbirrCheckoutPage = () => {
	const { cart, total, subtotal, coupon, isCouponApplied } = useCartStore();
	const [phoneNumber, setPhoneNumber] = useState("");
	const [telbirrPaymentDetails, setTelbirrPaymentDetails] = useState(null);
	const [isProcessing, setIsProcessing] = useState(false);
	const navigate = useNavigate();

	const savings = subtotal - total;
	const formattedSubtotal = subtotal.toFixed(2);
	const formattedTotal = total.toFixed(2);
	const formattedSavings = savings.toFixed(2);

	useEffect(() => {
		if (cart.length === 0) {
			navigate("/cart");
		}
	}, [cart, navigate]);

	const handleTelbirrPayment = async (e) => {
		e.preventDefault();
		try {
			setIsProcessing(true);

			// Validate cart data before sending
			if (!cart || cart.length === 0) {
				toast.error("Cart is empty");
				setIsProcessing(false);
				return;
			}

			// Validate phone number
			if (!phoneNumber || !/^[0-9]{10}$/.test(phoneNumber)) {
				toast.error("Please enter a valid Ethiopian phone number (10 digits)");
				setIsProcessing(false);
				return;
			}

			const res = await axios.post("/payments/create-telbirr-payment", {
				products: cart,
				couponCode: coupon ? coupon.code : null,
				phoneNumber: phoneNumber
			});

			const paymentData = res.data;

			if (!paymentData.paymentReference) {
				toast.error("Failed to create Telbirr payment");
				setIsProcessing(false);
				return;
			}

			// Store payment details for verification
			setTelbirrPaymentDetails(paymentData);
			toast.success("Payment instructions generated. Please check the details below.");

		} catch (error) {
			console.error("Telbirr payment error:", error);
			toast.error("Payment failed. Please try again.");
		} finally {
			setIsProcessing(false);
		}
	};

	const verifyTelbirrPayment = async () => {
		try {
			setIsProcessing(true);

			if (!telbirrPaymentDetails) {
				toast.error("No payment to verify");
				setIsProcessing(false);
				return;
			}

			const res = await axios.post("/payments/verify-telbirr-payment", {
				paymentReference: telbirrPaymentDetails.paymentReference
			});

			const verificationData = res.data;

			if (verificationData.success) {
				toast.success("Payment verified successfully!");
				// Redirect to success page
				navigate("/purchase-success");
			} else {
				toast.error("Payment verification failed. Please try again.");
			}

		} catch (error) {
			console.error("Telbirr verification error:", error);
			toast.error("Verification failed. Please try again.");
		} finally {
			setIsProcessing(false);
		}
	};

	return (
		<div className="py-8 md:py-16">
			<div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
				<motion.div
					className="mx-auto max-w-2xl"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
				>
					<div className="flex items-center gap-4 mb-6">
						<button
							onClick={() => navigate("/cart")}
							className="flex items-center text-emerald-400 hover:text-emerald-300"
						>
							<ArrowLeft size={20} className="mr-1" />
							Back to Cart
						</button>
					</div>

					<div className="space-y-6">
						<motion.div
							className="rounded-lg border border-gray-700 bg-gray-800 p-6 shadow-sm"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.1 }}
						>
							<h1 className="text-2xl font-bold text-emerald-400 mb-2">Telebirr Payment</h1>
							<p className="text-gray-300 mb-6">
								Complete your purchase using Telebirr mobile payment. Enter your phone number to generate payment instructions.
							</p>

							<div className="space-y-4">
								<div className="space-y-2">
									<dl className="flex items-center justify-between gap-4">
										<dt className="text-base font-normal text-gray-300">Original price</dt>
										<dd className="text-base font-medium text-white">${formattedSubtotal}</dd>
									</dl>

									{savings > 0 && (
										<dl className="flex items-center justify-between gap-4">
											<dt className="text-base font-normal text-gray-300">Savings</dt>
											<dd className="text-base font-medium text-emerald-400">-${formattedSavings}</dd>
										</dl>
									)}

									{coupon && isCouponApplied && (
										<dl className="flex items-center justify-between gap-4">
											<dt className="text-base font-normal text-gray-300">Coupon ({coupon.code})</dt>
											<dd className="text-base font-medium text-emerald-400">-{coupon.discountPercentage}%</dd>
										</dl>
									)}
									<dl className="flex items-center justify-between gap-4 border-t border-gray-600 pt-2">
										<dt className="text-base font-bold text-white">Total</dt>
										<dd className="text-base font-bold text-emerald-400">${formattedTotal}</dd>
									</dl>
								</div>
							</div>
						</motion.div>

						{!telbirrPaymentDetails ? (
							<motion.div
								className="rounded-lg border border-gray-700 bg-gray-800 p-6 shadow-sm"
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.5, delay: 0.2 }}
							>
								<h2 className="text-xl font-semibold text-emerald-400 mb-4">Payment Details</h2>
								<form onSubmit={handleTelbirrPayment} className="space-y-4">
									<div className="space-y-2">
										<label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-300">
											Phone Number
										</label>
										<input
											type="tel"
											id="phoneNumber"
											value={phoneNumber}
											onChange={(e) => setPhoneNumber(e.target.value)}
											placeholder="Enter your phone number (e.g., 0912345678)"
											className="block w-full rounded-lg border border-gray-600 bg-gray-700 p-2.5 text-sm text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-emerald-500"
											required
										/>
										<p className="text-xs text-gray-400">
											Enter your Ethiopian phone number (10 digits)
										</p>
									</div>

									<button
										type="submit"
										disabled={isProcessing}
										className="flex w-full items-center justify-center rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-300 disabled:opacity-50"
									>
										{isProcessing ? "Processing..." : "Generate Payment Instructions"}
									</button>
								</form>
							</motion.div>
						) : (
							<motion.div
								className="rounded-lg border border-gray-700 bg-gray-800 p-6 shadow-sm"
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.5, delay: 0.2 }}
							>
								<h2 className="text-xl font-semibold text-emerald-400 mb-4">Payment Instructions</h2>
								<div className="rounded-lg bg-gray-700 p-4">
									<h3 className="text-lg font-medium text-emerald-400">Telebirr Payment Instructions</h3>
									<div className="mt-2 space-y-2 text-sm text-gray-300">
										<p><span className="font-medium">Reference:</span> {telbirrPaymentDetails.paymentReference}</p>
										<p><span className="font-medium">Amount:</span> ${telbirrPaymentDetails.totalAmount.toFixed(2)}</p>
										<p><span className="font-medium">Phone:</span> {telbirrPaymentDetails.phoneNumber}</p>
										<p className="mt-3 font-medium">Steps:</p>
										<ol className="list-decimal pl-5 space-y-1">
											<li>Dial *847# on your phone</li>
											<li>Select "Send Money"</li>
											<li>Enter the merchant phone number: {import.meta.env.VITE_TELBIRR_MERCHANT_PHONE || "MERCHANT_PHONE"}</li>
											<li>Enter the amount: ${telbirrPaymentDetails.totalAmount.toFixed(2)}</li>
											<li>Enter the reference: {telbirrPaymentDetails.paymentReference}</li>
											<li>Confirm and complete the payment</li>
										</ol>
									</div>
									<button
										onClick={verifyTelbirrPayment}
										disabled={isProcessing}
										className="mt-4 w-full rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-300 disabled:opacity-50"
									>
										{isProcessing ? "Verifying..." : "Verify Payment"}
									</button>
								</div>
							</motion.div>
						)}
					</div>
				</motion.div>
			</div>
		</div>
	);
};

export default TelbirrCheckoutPage;