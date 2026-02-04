/**
 * Speciality Controller
 * CRUD operations for specialities
 */

import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import * as specialityService from "../services/specialityService";

/**
 * Get all specialities
 * @route GET /api/specialities
 * @access Public
 */
export const getAllSpecialities = asyncHandler(async (req: Request, res: Response) => {
    const specialities = await specialityService.getAllSpecialities();
    res.json({
        success: true,
        data: specialities
    });
});

/**
 * Get speciality by ID
 * @route GET /api/specialities/:id
 * @access Public
 */
export const getSpecialityById = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const speciality = await specialityService.getSpecialityById(id);
    if (!speciality) {
        res.status(404).json({
            success: false,
            message: "Speciality not found"
        });
        return;
    }
    res.json({
        success: true,
        data: speciality
    });
});

/**
 * Create a new speciality
 * @route POST /api/specialities
 * @access Admin only
 */
export const createSpeciality = asyncHandler(async (req: Request, res: Response) => {
    const { name, description } = req.body;

    // Check if speciality with same name already exists
    const existingSpeciality = await specialityService.getSpecialityByName(name);
    if (existingSpeciality) {
        res.status(409).json({
            success: false,
            message: "Speciality with this name already exists"
        });
        return;
    }

    const speciality = await specialityService.createSpeciality({ name, description });
    res.status(201).json({
        success: true,
        data: speciality,
        message: "Speciality created successfully"
    });
});

/**
 * Update a speciality
 * @route PUT /api/specialities/:id
 * @access Admin only
 */
export const updateSpeciality = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const { name, description } = req.body;

    // Check if speciality exists
    const existingSpeciality = await specialityService.getSpecialityById(id);
    if (!existingSpeciality) {
        res.status(404).json({
            success: false,
            message: "Speciality not found"
        });
        return;
    }

    // Check if new name conflicts with another speciality
    if (name && name !== existingSpeciality.name) {
        const specialityWithName = await specialityService.getSpecialityByName(name);
        if (specialityWithName) {
            res.status(409).json({
                success: false,
                message: "Speciality with this name already exists"
            });
            return;
        }
    }

    const speciality = await specialityService.updateSpeciality(id, { name, description });
    res.json({
        success: true,
        data: speciality,
        message: "Speciality updated successfully"
    });
});

/**
 * Delete a speciality
 * @route DELETE /api/specialities/:id
 * @access Admin only
 */
export const deleteSpeciality = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    // Check if speciality exists
    const existingSpeciality = await specialityService.getSpecialityById(id);
    if (!existingSpeciality) {
        res.status(404).json({
            success: false,
            message: "Speciality not found"
        });
        return;
    }

    await specialityService.deleteSpeciality(id);
    res.json({
        success: true,
        message: "Speciality deleted successfully"
    });
});
