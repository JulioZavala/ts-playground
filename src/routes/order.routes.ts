import { Router } from "express";
import { OrderController } from "../controllers/order.controller";
import { authMiddleware, requiredRoles } from "../middleware/auth.middleware";

const router = Router();
const controller = new OrderController();

router.use(authMiddleware);

// CUSTOMER Y ADMIN
router.get("/", (req, res) => controller.getAll(req, res));
router.post("/", (req, res) => controller.create(req, res));

// ADMIN — rutas estáticas ANTES del wildcard /:id
router.get("/archived", requiredRoles("ADMIN"), (req, res) =>
  controller.getArchived(req, res),
);

// CUSTOMER Y ADMIN — wildcard dinámico
router.get("/:id", (req, res) => controller.getById(req, res));

// CUSTOMER
router.patch("/:id/cancel", (req, res) => controller.cancelOrder(req, res));

// ADMIN
router.patch("/:id/status", requiredRoles("ADMIN"), (req, res) =>
  controller.updateStatus(req, res),
);
router.delete("/:id", requiredRoles("ADMIN"), (req, res) =>
  controller.softDelete(req, res),
);
// router.delete("/:id", (req, res) => controller.destroy(req, res));

export default router;