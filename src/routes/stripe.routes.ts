import express, { Router } from "express";
import { StripeController } from "../controllers/stripe.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();
const controller = new StripeController();

// webhook
router.post("/webhook", express.raw({ type: "application/json" }), (req, res) =>
  controller.webhook(req, res),
);

router.post("/checkout", authMiddleware, (req, res) =>
  controller.createCheckout(req, res),
);

export default router;