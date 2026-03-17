import { Router } from "express";
import { handleRequest } from "../controllers/requestController";
import { validateEnvelopeMiddleware } from "../middleware/validateEnvelopeMiddleware";
import { nonceMiddleware } from "../middleware/nonceMiddleware";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.post("/request", validateEnvelopeMiddleware, nonceMiddleware, authMiddleware, handleRequest);

export default router;