import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.middleware";
import { AuthService } from "../services/auth.service";

const service = new AuthService();

export class AuthController {
  async register(req: AuthRequest, res: Response) {
    try {
      const user = await service.register(req.body);
      res.status(201).json({ ok: true, data: user });
    } catch (error: any) {
      res.status(500).json({ ok: false, error: error.message });
    }
  }

  async login(req: AuthRequest, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await service.login(email, password);
      res.json({ ok: true, data: result });
    } catch (error: any) {
      res.status(500).json({ ok: false, error: error.message });
    }
  }

  async profile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const user = await service.getProfile(userId as number);

      if (!user) {
        return res.status(404).json({ ok: false, message: "User not found" });
      }

      res.json({ ok: true, data: user });
    } catch (error: any) {
      res.status(500).json({ ok: false, error: error.message });
    }
  }
}
