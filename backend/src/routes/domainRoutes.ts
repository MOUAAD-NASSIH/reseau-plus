import { Router } from "express";
import { getAllDomains, getDomainById } from "../controllers/domainController";

const router = Router();

router.get("/", getAllDomains);
router.get("/:id", getDomainById);

export default router;
