import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import * as domainService from "../services/domainService";

export const getAllDomains = asyncHandler(async (req: Request, res: Response) => {
    const domains = await domainService.getAllDomains();
    res.json(domains);
});

export const getDomainById = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const domain = await domainService.getDomainById(id);
    if (!domain) {
        res.status(404);
        throw new Error("Domain not found");
    }
    res.json(domain);
});
