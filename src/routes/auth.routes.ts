import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();
const controller = new AuthController();

// Rutas publicas
router.post("/login", (req, res) => controller.login(req, res));
router.post("/register", (req, res) => controller.register(req, res));

// Ruta protegida
router.get("/profile", authMiddleware, (req, res) =>
  controller.profile(req, res),
);

export default router;