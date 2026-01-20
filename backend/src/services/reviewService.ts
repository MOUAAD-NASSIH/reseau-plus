/**
 * Review Service
 */

import { prisma } from "../lib/prisma";
import { ReviewFilters, RATING_MIN, RATING_MAX } from "../types/review.types";
import { createAdminLog } from "./adminService";
import * as notificationService from "./notificationService";

/**
 * Custom error class for review operations
 */
export class ReviewError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.name = "ReviewError";
    this.statusCode = statusCode;
  }
}

/**
 * Create a review for a completed assignment
 */
export const createReview = async (
  reviewerId: number,
  missionAssignmentId: number,
  rating: number,
  comment?: string
) => {
  // Validate rating bounds
  if (rating < RATING_MIN || rating > RATING_MAX) {
    throw new ReviewError(
      `Rating must be between ${RATING_MIN} and ${RATING_MAX}`,
      400
    );
  }

  // Get assignment with related data
  const assignment = await prisma.missionAssignment.findUnique({
    where: { id: missionAssignmentId },
    include: {
      mission: true,
      worker: { include: { user: true } },
      institution: { include: { user: true } }
    }
  });

  if (!assignment) {
    throw new ReviewError("Assignment not found", 404);
  }

  // Check if assignment is completed
  if (assignment.status !== "COMPLETED") {
    throw new ReviewError(
      "Reviews can only be created for completed assignments",
      400
    );
  }

  // Determine reviewer role and reviewee
  const workerUserId = assignment.worker.userId;
  const institutionUserId = assignment.institution.userId;
  let revieweeId: number;

  if (reviewerId === workerUserId) {
    // Worker is reviewing Institution
    revieweeId = institutionUserId;
  } else if (reviewerId === institutionUserId) {
    // Institution is reviewing Worker
    revieweeId = workerUserId;
  } else {
    throw new ReviewError(
      "You are not authorized to review this assignment",
      403
    );
  }

  // Check for existing review
  const existingReview = await prisma.review.findFirst({
    where: {
      missionAssignmentId,
      reviewerId
    }
  });

  if (existingReview) {
    throw new ReviewError(
      "You have already reviewed this assignment",
      409
    );
  }

  // Create the review
  const review = await prisma.review.create({
    data: {
      missionAssignmentId,
      reviewerId,
      revieweeId,
      rating,
      comment
    },
    include: {
      reviewer: {
        select: {
          id: true,
          email: true,
          worker: { select: { firstName: true, lastName: true } },
          institution: { select: { institutionName: true } }
        }
      },
      reviewee: {
        select: {
          id: true,
          email: true,
          worker: { select: { firstName: true, lastName: true } },
          institution: { select: { institutionName: true } }
        }
      },
      missionAssignment: {
        include: {
          mission: { select: { id: true, title: true } }
        }
      }
    }
  });



  // Notify the reviewee
  try {
    await notificationService.notifyReviewReceived(
      revieweeId,
      rating,
      assignment.mission.title
    );
  } catch (error) {
    console.error('Failed to send review notification:', error);
  }

  return review;
};

/**
 * Get reviews received by a user
 */
export const getReviewsReceived = async (userId: number) => {
  return await prisma.review.findMany({
    where: { revieweeId: userId },
    include: {
      reviewer: {
        select: {
          id: true,
          email: true,
          worker: { select: { firstName: true, lastName: true } },
          institution: { select: { institutionName: true } }
        }
      },
      missionAssignment: {
        include: {
          mission: { select: { id: true, title: true } }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
};

/**
 * Get reviews written by a user
 */
export const getReviewsWritten = async (userId: number) => {
  return await prisma.review.findMany({
    where: { reviewerId: userId },
    include: {
      reviewee: {
        select: {
          id: true,
          email: true,
          worker: { select: { firstName: true, lastName: true } },
          institution: { select: { institutionName: true } }
        }
      },
      missionAssignment: {
        include: {
          mission: { select: { id: true, title: true } }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
};

/**
 * Get reviews for a specific worker
 */
export const getWorkerReviews = async (
  workerId: number,
  page = 1,
  limit = 10,
  filters?: { minRating?: number; maxRating?: number }
) => {
  // Get worker's user ID
  const worker = await prisma.worker.findUnique({
    where: { id: workerId },
    select: { userId: true }
  });

  if (!worker) {
    throw new ReviewError("Worker not found", 404);
  }

  const skip = (page - 1) * limit;
  const where: any = { revieweeId: worker.userId };

  if (filters?.minRating !== undefined) {
    where.rating = { ...where.rating, gte: filters.minRating };
  }
  if (filters?.maxRating !== undefined) {
    where.rating = { ...where.rating, lte: filters.maxRating };
  }

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      include: {
        reviewer: {
          select: {
            id: true,
            institution: { select: { institutionName: true } }
          }
        },
        missionAssignment: {
          include: {
            mission: { select: { id: true, title: true } }
          }
        }
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.review.count({ where })
  ]);

  return {
    reviews,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Get reviews for a specific institution
 */
export const getInstitutionReviews = async (
  institutionId: number,
  page = 1,
  limit = 10,
  filters?: { minRating?: number; maxRating?: number }
) => {
  // Get institution's user ID
  const institution = await prisma.institution.findUnique({
    where: { id: institutionId },
    select: { userId: true }
  });

  if (!institution) {
    throw new ReviewError("Institution not found", 404);
  }

  const skip = (page - 1) * limit;
  const where: any = { revieweeId: institution.userId };

  if (filters?.minRating !== undefined) {
    where.rating = { ...where.rating, gte: filters.minRating };
  }
  if (filters?.maxRating !== undefined) {
    where.rating = { ...where.rating, lte: filters.maxRating };
  }

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      include: {
        reviewer: {
          select: {
            id: true,
            worker: { select: { firstName: true, lastName: true } }
          }
        },
        missionAssignment: {
          include: {
            mission: { select: { id: true, title: true } }
          }
        }
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.review.count({ where })
  ]);

  return {
    reviews,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Get all reviews with filters (admin)
 */
export const getAllReviews = async (filters?: ReviewFilters, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const where: any = {};

  if (filters?.missionAssignmentId) {
    where.missionAssignmentId = filters.missionAssignmentId;
  }
  if (filters?.reviewerId) {
    where.reviewerId = filters.reviewerId;
  }
  if (filters?.revieweeId) {
    where.revieweeId = filters.revieweeId;
  }
  if (filters?.minRating !== undefined) {
    where.rating = { ...where.rating, gte: filters.minRating };
  }
  if (filters?.maxRating !== undefined) {
    where.rating = { ...where.rating, lte: filters.maxRating };
  }

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      include: {
        reviewer: {
          select: {
            id: true,
            email: true,
            worker: { select: { firstName: true, lastName: true } },
            institution: { select: { institutionName: true } }
          }
        },
        reviewee: {
          select: {
            id: true,
            email: true,
            worker: { select: { firstName: true, lastName: true } },
            institution: { select: { institutionName: true } }
          }
        },
        missionAssignment: {
          include: {
            mission: { select: { id: true, title: true } }
          }
        }
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.review.count({ where })
  ]);

  return {
    reviews,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Get review by ID
 */
export const getReviewById = async (id: number) => {
  const review = await prisma.review.findUnique({
    where: { id },
    include: {
      reviewer: {
        select: {
          id: true,
          email: true,
          worker: { select: { firstName: true, lastName: true } },
          institution: { select: { institutionName: true } }
        }
      },
      reviewee: {
        select: {
          id: true,
          email: true,
          worker: { select: { firstName: true, lastName: true } },
          institution: { select: { institutionName: true } }
        }
      },
      missionAssignment: {
        include: {
          mission: { select: { id: true, title: true } }
        }
      }
    }
  });

  if (!review) {
    throw new ReviewError("Review not found", 404);
  }

  return review;
};

/**
 * Delete review (admin moderation)
 */
export const deleteReview = async (
  reviewId: number,
  adminId: number,
  reason: string
) => {
  // Get review
  const review = await prisma.review.findUnique({
    where: { id: reviewId }
  });

  if (!review) {
    throw new ReviewError("Review not found", 404);
  }

  // Create admin log before deletion
  await createAdminLog(
    adminId,
    "REVIEW_DELETED",
    { targetReviewId: reviewId },
    reason
  );

  // Delete the review
  await prisma.review.delete({
    where: { id: reviewId }
  });

  return { message: "Review deleted successfully" };
};

/**
 * Calculate average rating for a user
 */
export const calculateAverageRating = async (userId: number): Promise<{
  averageRating: number;
  totalReviews: number;
}> => {
  const result = await prisma.review.aggregate({
    where: { revieweeId: userId },
    _avg: { rating: true },
    _count: { rating: true }
  });

  return {
    averageRating: result._avg.rating !== null
      ? Math.round(result._avg.rating * 100) / 100
      : 0,
    totalReviews: result._count.rating
  };
};

/**
 * Get average rating for a worker by worker ID
 */
export const getWorkerAverageRating = async (workerId: number): Promise<{
  averageRating: number;
  totalReviews: number;
}> => {
  const worker = await prisma.worker.findUnique({
    where: { id: workerId },
    select: { userId: true }
  });

  if (!worker) {
    throw new ReviewError("Worker not found", 404);
  }

  return calculateAverageRating(worker.userId);
};

/**
 * Get average rating for an institution by institution ID
 */
export const getInstitutionAverageRating = async (institutionId: number): Promise<{
  averageRating: number;
  totalReviews: number;
}> => {
  const institution = await prisma.institution.findUnique({
    where: { id: institutionId },
    select: { userId: true }
  });

  if (!institution) {
    throw new ReviewError("Institution not found", 404);
  }

  return calculateAverageRating(institution.userId);
};
