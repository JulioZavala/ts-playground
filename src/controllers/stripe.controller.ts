import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.middleware";
import { StripeService } from "../services/stripe.service";

const service = new StripeService();

export class StripeController {
  async createCheckout(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const userEmail = req.user!.email;
      const { orderId } = req.body;

      if (!orderId) {
        return res
          .status(400)
          .json({ ok: false, message: "El orderId es un campo requerido." });
      }

      const result = await service.createCheckoutSession({
        userEmail,
        orderId,
        userId,
      });

      res.json({ ok: true, data: result });
    } catch (error: any) {
      res.status(500).json({ ok: false, message: error.message });
    }
  }

  async webhook(req: AuthRequest, res: Response) {
    try {
      const signature = req.headers["stripe-signature"] as string;

      if (!signature) {
        return res
          .status(400)
          .json({ ok: false, message: "Falta el signature." });
      }

      const result = await service.handleWebhook(req.body, signature);
      res.json({ ok: true, data: result });
    } catch (error: any) {
      res.status(500).json({ ok: false, message: error.message });
    }
  }
}