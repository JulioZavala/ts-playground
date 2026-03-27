import { Router } from "express";
import { PaymentController } from "../controllers/payment.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();
const controller = new PaymentController();

router.post("/webhook", (req, res) => controller.webhook(req, res));

router.post("/preference", authMiddleware, (req, res) =>
  controller.createPreference(req, res),
);

router.get("/status/:paymentId", authMiddleware, (req, res) =>
  controller.getStatus(req, res),
);

export default router;