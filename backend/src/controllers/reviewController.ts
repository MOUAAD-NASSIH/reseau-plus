/**
 * Review Controller
 */

import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import * as reviewService from "../services/reviewService";

/**
 * Extended request with authenticated user
 */
interface AuthenticatedRequest extends Request {
    user?: {
        id: number;
        userId: number;
        email: string;
        role: string;
        workerId?: number;
        institutionId?: number;
    };
}

/**
 * @desc    Create a review for a completed assignment
 * @route   POST /api/reviews
 * @access  Private (Worker or Institution)
 */
export const createReview = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { missionAssignmentId, rating, comment } = req.body;
    const user = req.user as any;
    const reviewerId = user.userId;

    const review = await reviewService.createReview(
        reviewerId,
        Number(missionAssignmentId),
        Number(rating),
        comment
    );

    res.status(201).json({
        success: true,
        data: review,
        message: "Review created successfully"
    });
});

/**
 * @desc    Get all reviews (admin) or filtered reviews
 * @route   GET /api/reviews
 * @access  Private (Admin)
 */
export const getReviews = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const {
        missionAssignmentId,
        reviewerId,
        revieweeId,
        minRating,
        maxRating,
        page = 1,
        limit = 10
    } = req.query;

    const filters = {
        missionAssignmentId: missionAssignmentId ? Number(missionAssignmentId) : undefined,
        reviewerId: reviewerId ? Number(reviewerId) : undefined,
        revieweeId: revieweeId ? Number(revieweeId) : undefined,
        minRating: minRating ? Number(minRating) : undefined,
        maxRating: maxRating ? Number(maxRating) : undefined
    };

    const result = await reviewService.getAllReviews(
        filters,
        Number(page),
        Number(limit)
    );

    res.json({
        success: true,
        data: result.reviews,
        pagination: result.pagination
    });
});

/**
 * @desc    Get reviews for a specific worker
 * @route   GET /api/reviews/worker/:workerId
 * @access  Public
 */
export const getWorkerReviews = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { workerId } = req.params;
    const { minRating, maxRating, page = 1, limit = 10 } = req.query;

    const filters = {
        minRating: minRating ? Number(minRating) : undefined,
        maxRating: maxRating ? Number(maxRating) : undefined
    };

    const result = await reviewService.getWorkerReviews(
        Number(workerId),
        Number(page),
        Number(limit),
        filters
    );

    res.json({
        success: true,
        data: result.reviews,
        pagination: result.pagination
    });
});

/**
 * @desc    Get reviews for a specific institution
 * @route   GET /api/reviews/institution/:id
 * @access  Public
 */
export const getInstitutionReviews = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { minRating, maxRating, page = 1, limit = 10 } = req.query;

    const filters = {
        minRating: minRating ? Number(minRating) : undefined,
        maxRating: maxRating ? Number(maxRating) : undefined
    };

    const result = await reviewService.getInstitutionReviews(
        Number(id),
        Number(page),
        Number(limit),
        filters
    );

    res.json({
        success: true,
        data: result.reviews,
        pagination: result.pagination
    });
});

/**
 * @desc    Get my received reviews
 * @route   GET /api/reviews/received
 * @access  Private
 */
export const getMyReceivedReviews = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user as any;
    const userId = user.userId;

    const reviews = await reviewService.getReviewsReceived(userId);

    res.json({
        success: true,
        data: reviews
    });
});

/**
 * @desc    Get reviews I wrote
 * @route   GET /api/reviews/written
 * @access  Private
 */
export const getMyWrittenReviews = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user as any;
    const userId = user.userId;

    const reviews = await reviewService.getReviewsWritten(userId);

    res.json({
        success: true,
        data: reviews
    });
});

/**
 * @desc    Get average rating for a worker
 * @route   GET /api/reviews/worker/:workerId/rating
 * @access  Public
 */
export const getWorkerAverageRating = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { workerId } = req.params;

    const rating = await reviewService.getWorkerAverageRating(Number(workerId));

    res.json({
        success: true,
        data: {
            average: rating.averageRating,
            count: rating.totalReviews
        }
    });
});

/**
 * @desc    Get average rating for an institution
 * @route   GET /api/reviews/institution/:id/rating
 * @access  Public
 */
export const getInstitutionAverageRating = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    const rating = await reviewService.getInstitutionAverageRating(Number(id));

    res.json({
        success: true,
        data: {
            average: rating.averageRating,
            count: rating.totalReviews
        }
    });
});

/**
 * @desc    Delete a review (admin moderation)
 * @route   DELETE /api/reviews/:id
 * @access  Private (Admin only)
 */
export const deleteReview = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { reason } = req.body;
    const user = req.user as any;
    const adminId = user.userId;

    const result = await reviewService.deleteReview(
        Number(id),
        adminId,
        reason
    );

    res.json({
        success: true,
        data: result,
        message: "Review deleted successfully"
    });
});
