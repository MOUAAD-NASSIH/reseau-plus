/**
 * Review Routes
 */

import express from "express";
import { protect, adminOnly, workerOrInstitution } from "../middleware/authMiddleware";
import { validateRequest } from "../middleware/validateMiddleware";
import {
    createReview,
    getReviews,
    getWorkerReviews,
    getInstitutionReviews,
    getMyReceivedReviews,
    getMyWrittenReviews,
    getWorkerAverageRating,
    getInstitutionAverageRating,
    deleteReview
} from "../controllers/reviewController";
import {
    createReviewSchema,
    getWorkerReviewsSchema,
    getInstitutionReviewsSchema,
    deleteReviewSchema,
    reviewFilterSchema
} from "../schemas/reviewSchemas";

const router = express.Router();

// Public routes - Get reviews for workers and institutions
router.get("/worker/:workerId", validateRequest(getWorkerReviewsSchema), getWorkerReviews);
router.get("/worker/:workerId/rating", getWorkerAverageRating);
router.get("/institution/:id", validateRequest(getInstitutionReviewsSchema), getInstitutionReviews);
router.get("/institution/:id/rating", getInstitutionAverageRating);

// Protected routes - User's own reviews
router.get("/received", protect, getMyReceivedReviews);
router.get("/written", protect, getMyWrittenReviews);

// Protected routes - Create review (worker or institution)
router.post("/", protect, workerOrInstitution, validateRequest(createReviewSchema), createReview);

// Admin routes
router.get("/", protect, adminOnly, validateRequest(reviewFilterSchema), getReviews);
router.delete("/:id", protect, adminOnly, validateRequest(deleteReviewSchema), deleteReview);

export default router;
