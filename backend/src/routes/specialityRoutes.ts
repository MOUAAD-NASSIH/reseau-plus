import { Router } from "express";
import { getAllSpecialities, getSpecialityById } from "../controllers/specialityController";

const router = Router();

router.get("/", getAllSpecialities);
router.get("/:id", getSpecialityById);

export default router;
