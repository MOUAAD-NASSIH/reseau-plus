/**
 * Domain Controller
 * CRUD operations for domains
 */

import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import * as domainService from "../services/domainService";

/**
 * Get all domains
 * @route GET /api/domains
 * @access Public
 */
export const getAllDomains = asyncHandler(async (req: Request, res: Response) => {
    const domains = await domainService.getAllDomains();
    res.json({
        success: true,
        data: domains
    });
});

/**
 * Get domain by ID
 * @route GET /api/domains/:id
 * @access Public
 */
export const getDomainById = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const domain = await domainService.getDomainById(id);
    if (!domain) {
        res.status(404).json({
            success: false,
            message: "Domain not found"
        });
        return;
    }
    res.json({
        success: true,
        data: domain
    });
});

/**
 * Create a new domain
 * @route POST /api/domains
 * @access Admin only
 */
export const createDomain = asyncHandler(async (req: Request, res: Response) => {
    const { name, description } = req.body;

    // Check if domain with same name already exists
    const existingDomain = await domainService.getDomainByName(name);
    if (existingDomain) {
        res.status(409).json({
            success: false,
            message: "Domain with this name already exists"
        });
        return;
    }

    const domain = await domainService.createDomain({ name, description });
    res.status(201).json({
        success: true,
        data: domain,
        message: "Domain created successfully"
    });
});

/**
 * Update a domain
 * @route PUT /api/domains/:id
 * @access Admin only
 */
export const updateDomain = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const { name, description } = req.body;

    // Check if domain exists
    const existingDomain = await domainService.getDomainById(id);
    if (!existingDomain) {
        res.status(404).json({
            success: false,
            message: "Domain not found"
        });
        return;
    }

    // Check if new name conflicts with another domain
    if (name && name !== existingDomain.name) {
        const domainWithName = await domainService.getDomainByName(name);
        if (domainWithName) {
            res.status(409).json({
                success: false,
                message: "Domain with this name already exists"
            });
            return;
        }
    }

    const domain = await domainService.updateDomain(id, { name, description });
    res.json({
        success: true,
        data: domain,
        message: "Domain updated successfully"
    });
});

/**
 * Delete a domain
 * @route DELETE /api/domains/:id
 * @access Admin only
 */
export const deleteDomain = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    // Check if domain exists
    const existingDomain = await domainService.getDomainById(id);
    if (!existingDomain) {
        res.status(404).json({
            success: false,
            message: "Domain not found"
        });
        return;
    }

    await domainService.deleteDomain(id);
    res.json({
        success: true,
        message: "Domain deleted successfully"
    });
});
