import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import * as specialityService from "../services/specialityService";

export const getAllSpecialities = asyncHandler(async (req: Request, res: Response) => {
    const specialities = await specialityService.getAllSpecialities();
    res.json(specialities);
});

export const getSpecialityById = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const speciality = await specialityService.getSpecialityById(id);
    if (!speciality) {
        res.status(404);
        throw new Error("Speciality not found");
    }
    res.json(speciality);
});
