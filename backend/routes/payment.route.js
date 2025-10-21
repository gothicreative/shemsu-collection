import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { checkoutSuccess, createCheckoutSession, createTelbirrPayment, verifyTelbirrPayment } from "../controllers/payment.controller.js";

const router = express.Router();

router.post("/create-checkout-session", protectRoute, createCheckoutSession);
router.post("/checkout-success", protectRoute, checkoutSuccess);

// Telbirr payment routes
router.post("/create-telbirr-payment", protectRoute, createTelbirrPayment);
router.post("/verify-telbirr-payment", protectRoute, verifyTelbirrPayment);

export default router;
