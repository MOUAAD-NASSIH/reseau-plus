/**
 * @swagger
 * /api/health:
 *   get:
 *     tags: [Health]
 *     summary: Health check endpoint
 *     description: Check if the server is running
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Server is running
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: healthy
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 */

// ============================================
// AUTH ROUTES
// ============================================

/**
 * @swagger
 * /api/auth/register/worker:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new worker
 *     description: Register a new worker account with profile information and optional documents
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *               - specialityId
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               specialityId:
 *                 type: integer
 *               phone:
 *                 type: string
 *               documents:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Worker registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Email already exists
 */

/**
 * @swagger
 * /api/auth/register/institution:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new institution
 *     description: Register a new institution account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterInstitutionRequest'
 *     responses:
 *       201:
 *         description: Institution registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email already exists
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: User login
 *     description: Authenticate user and receive JWT token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid credentials
 */

/**
 * @swagger
 * /api/auth/verify-email:
 *   get:
 *     tags: [Auth]
 *     summary: Verify email address
 *     description: Verify user email with token sent via email
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Email verification token
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or expired token
 */

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     tags: [Auth]
 *     summary: Request password reset
 *     description: Send password reset email to user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Reset email sent (if email exists)
 */

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     tags: [Auth]
 *     summary: Reset password
 *     description: Reset password using token from email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *             properties:
 *               token:
 *                 type: string
 *               password:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid or expired token
 */

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get current user
 *     description: Get authenticated user's profile information
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Not authenticated
 */

// ============================================
// WORKER ROUTES
// ============================================

/**
 * @swagger
 * /api/workers:
 *   get:
 *     tags: [Workers]
 *     summary: List all workers (Admin only)
 *     description: Get paginated list of all workers with optional filters
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, VERIFIED, REJECTED]
 *       - in: query
 *         name: specialityId
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of workers
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (admin only)
 */

/**
 * @swagger
 * /api/workers/me:
 *   get:
 *     tags: [Workers]
 *     summary: Get current worker profile
 *     description: Get authenticated worker's profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Worker profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Worker'
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not a worker
 *   put:
 *     tags: [Workers]
 *     summary: Update current worker profile
 *     description: Update authenticated worker's profile information
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateWorkerRequest'
 *     responses:
 *       200:
 *         description: Profile updated
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authenticated
 */

/**
 * @swagger
 * /api/workers/{id}:
 *   get:
 *     tags: [Workers]
 *     summary: Get worker by ID
 *     description: Get public worker profile by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Worker profile
 *       404:
 *         description: Worker not found
 */

/**
 * @swagger
 * /api/workers/documents:
 *   get:
 *     tags: [Workers]
 *     summary: Get worker's documents
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of documents
 *   post:
 *     tags: [Workers]
 *     summary: Upload a document
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               document:
 *                 type: string
 *                 format: binary
 *               type:
 *                 type: string
 *     responses:
 *       201:
 *         description: Document uploaded
 */

/**
 * @swagger
 * /api/workers/experiences:
 *   get:
 *     tags: [Workers]
 *     summary: Get worker's experiences
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of experiences
 *   post:
 *     tags: [Workers]
 *     summary: Add experience
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WorkerExperience'
 *     responses:
 *       201:
 *         description: Experience added
 */

/**
 * @swagger
 * /api/workers/experiences/{id}:
 *   put:
 *     tags: [Workers]
 *     summary: Update experience
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WorkerExperience'
 *     responses:
 *       200:
 *         description: Experience updated
 *   delete:
 *     tags: [Workers]
 *     summary: Delete experience
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Experience deleted
 */

/**
 * @swagger
 * /api/workers/availabilities:
 *   get:
 *     tags: [Workers]
 *     summary: Get worker's availabilities
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of availabilities
 *   post:
 *     tags: [Workers]
 *     summary: Add availability
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WorkerAvailability'
 *     responses:
 *       201:
 *         description: Availability added
 */

/**
 * @swagger
 * /api/workers/availabilities/{id}:
 *   put:
 *     tags: [Workers]
 *     summary: Update availability
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WorkerAvailability'
 *     responses:
 *       200:
 *         description: Availability updated
 *   delete:
 *     tags: [Workers]
 *     summary: Delete availability
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Availability deleted
 */

/**
 * @swagger
 * /api/workers/domains:
 *   post:
 *     tags: [Workers]
 *     summary: Add domain to worker
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - domainId
 *             properties:
 *               domainId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Domain added
 */

/**
 * @swagger
 * /api/workers/domains/{id}:
 *   delete:
 *     tags: [Workers]
 *     summary: Remove domain from worker
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Domain removed
 */


// ============================================
// INSTITUTION ROUTES
// ============================================

/**
 * @swagger
 * /api/institutions:
 *   get:
 *     tags: [Institutions]
 *     summary: List all institutions (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of institutions
 *       403:
 *         description: Admin only
 */

/**
 * @swagger
 * /api/institutions/me:
 *   get:
 *     tags: [Institutions]
 *     summary: Get current institution profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Institution profile
 *   put:
 *     tags: [Institutions]
 *     summary: Update current institution profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               zipCode:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated
 */

/**
 * @swagger
 * /api/institutions/{id}:
 *   get:
 *     tags: [Institutions]
 *     summary: Get institution by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Institution profile
 *       404:
 *         description: Institution not found
 */

// ============================================
// MISSION ROUTES
// ============================================

/**
 * @swagger
 * /api/missions:
 *   get:
 *     tags: [Missions]
 *     summary: List all missions (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [OPEN, IN_PROGRESS, COMPLETED, CANCELLED]
 *       - in: query
 *         name: urgency
 *         schema:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH, URGENT]
 *       - in: query
 *         name: specialityId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: domainId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: List of missions
 *   post:
 *     tags: [Missions]
 *     summary: Create a new mission (Institution only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateMissionRequest'
 *     responses:
 *       201:
 *         description: Mission created
 *       400:
 *         description: Validation error
 *       403:
 *         description: Institution only
 */

/**
 * @swagger
 * /api/missions/available:
 *   get:
 *     tags: [Missions]
 *     summary: List available missions (Verified workers only)
 *     description: Get missions available for application by verified workers
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: specialityId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: domainId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: urgency
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of available missions
 *       403:
 *         description: Verified workers only
 */

/**
 * @swagger
 * /api/missions/recommended:
 *   get:
 *     tags: [Missions]
 *     summary: Get recommended missions (Verified workers only)
 *     description: Get missions recommended based on worker's profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of recommended missions
 */

/**
 * @swagger
 * /api/missions/my:
 *   get:
 *     tags: [Missions]
 *     summary: Get institution's missions
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of institution's missions
 */

/**
 * @swagger
 * /api/missions/stats:
 *   get:
 *     tags: [Missions]
 *     summary: Get mission statistics (Institution only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Mission status counts
 */

/**
 * @swagger
 * /api/missions/{id}:
 *   get:
 *     tags: [Missions]
 *     summary: Get mission by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Mission details
 *       404:
 *         description: Mission not found
 *   put:
 *     tags: [Missions]
 *     summary: Update mission (Institution only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateMissionRequest'
 *     responses:
 *       200:
 *         description: Mission updated
 *       403:
 *         description: Not mission owner
 *   delete:
 *     tags: [Missions]
 *     summary: Delete mission (Institution only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Mission deleted
 *       403:
 *         description: Not mission owner
 */

// ============================================
// APPLICATION ROUTES
// ============================================

/**
 * @swagger
 * /api/applications:
 *   post:
 *     tags: [Applications]
 *     summary: Apply to a mission (Verified workers only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - missionId
 *             properties:
 *               missionId:
 *                 type: integer
 *               coverLetter:
 *                 type: string
 *     responses:
 *       201:
 *         description: Application submitted
 *       403:
 *         description: Verified workers only
 *       409:
 *         description: Already applied
 */

/**
 * @swagger
 * /api/applications/my:
 *   get:
 *     tags: [Applications]
 *     summary: Get worker's applications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [SUBMITTED, ACCEPTED, REJECTED, WITHDRAWN]
 *     responses:
 *       200:
 *         description: List of applications
 */

/**
 * @swagger
 * /api/applications/mission/{missionId}:
 *   get:
 *     tags: [Applications]
 *     summary: Get applications for a mission (Institution only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: missionId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of applications
 *       403:
 *         description: Not mission owner
 */

/**
 * @swagger
 * /api/applications/{id}:
 *   get:
 *     tags: [Applications]
 *     summary: Get application by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Application details
 *   delete:
 *     tags: [Applications]
 *     summary: Withdraw application (Workers only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Application withdrawn
 */

/**
 * @swagger
 * /api/applications/{id}/accept:
 *   put:
 *     tags: [Applications]
 *     summary: Accept application (Institution only)
 *     description: Accept application and create assignment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Application accepted, assignment created
 *       403:
 *         description: Not mission owner
 */

/**
 * @swagger
 * /api/applications/{id}/reject:
 *   put:
 *     tags: [Applications]
 *     summary: Reject application (Institution only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Application rejected
 */


// ============================================
// ASSIGNMENT ROUTES
// ============================================

/**
 * @swagger
 * /api/assignments:
 *   get:
 *     tags: [Assignments]
 *     summary: Get assignments (filtered by role)
 *     description: Workers see their own, institutions see theirs, admins see all
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, ONGOING, COMPLETED, CANCELLED]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of assignments
 */

/**
 * @swagger
 * /api/assignments/my:
 *   get:
 *     tags: [Assignments]
 *     summary: Get worker's assignments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of worker's assignments
 */

/**
 * @swagger
 * /api/assignments/institution:
 *   get:
 *     tags: [Assignments]
 *     summary: Get institution's assignments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of institution's assignments
 */

/**
 * @swagger
 * /api/assignments/{id}:
 *   get:
 *     tags: [Assignments]
 *     summary: Get assignment by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Assignment details
 *       404:
 *         description: Assignment not found
 */

/**
 * @swagger
 * /api/assignments/{id}/status:
 *   put:
 *     tags: [Assignments]
 *     summary: Update assignment status
 *     description: Update status (ACTIVE → ONGOING → COMPLETED/CANCELLED)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [ONGOING, COMPLETED, CANCELLED]
 *     responses:
 *       200:
 *         description: Status updated
 *       400:
 *         description: Invalid status transition
 */

// ============================================
// PAYMENT ROUTES
// ============================================

/**
 * @swagger
 * /api/payments:
 *   get:
 *     tags: [Payments]
 *     summary: Get payments (filtered by role)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, COMPLETED, FAILED]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of payments
 */

/**
 * @swagger
 * /api/payments/summary:
 *   get:
 *     tags: [Payments]
 *     summary: Get payment summary (Admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment summary statistics
 */

/**
 * @swagger
 * /api/payments/calculate-fees:
 *   post:
 *     tags: [Payments]
 *     summary: Calculate payment fees
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Fee calculation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 platformFee:
 *                   type: number
 *                 workerAmount:
 *                   type: number
 */

/**
 * @swagger
 * /api/payments/create-intent:
 *   post:
 *     tags: [Payments]
 *     summary: Create Stripe PaymentIntent (Institution only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - assignmentId
 *               - amount
 *             properties:
 *               assignmentId:
 *                 type: integer
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: PaymentIntent created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 clientSecret:
 *                   type: string
 */

/**
 * @swagger
 * /api/payments/webhook:
 *   post:
 *     tags: [Payments]
 *     summary: Stripe webhook handler
 *     description: Handles Stripe payment events (called by Stripe)
 *     responses:
 *       200:
 *         description: Webhook processed
 */

/**
 * @swagger
 * /api/payments/{id}:
 *   get:
 *     tags: [Payments]
 *     summary: Get payment by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Payment details
 *       404:
 *         description: Payment not found
 */

// ============================================
// REVIEW ROUTES
// ============================================

/**
 * @swagger
 * /api/reviews:
 *   get:
 *     tags: [Reviews]
 *     summary: Get all reviews (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of reviews
 *   post:
 *     tags: [Reviews]
 *     summary: Create a review
 *     description: Create review for completed assignment (worker or institution)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateReviewRequest'
 *     responses:
 *       201:
 *         description: Review created
 *       400:
 *         description: Assignment not completed
 *       409:
 *         description: Already reviewed
 */

/**
 * @swagger
 * /api/reviews/worker/{workerId}:
 *   get:
 *     tags: [Reviews]
 *     summary: Get reviews for a worker
 *     parameters:
 *       - in: path
 *         name: workerId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of worker reviews
 */

/**
 * @swagger
 * /api/reviews/worker/{workerId}/rating:
 *   get:
 *     tags: [Reviews]
 *     summary: Get worker's average rating
 *     parameters:
 *       - in: path
 *         name: workerId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Average rating
 */

/**
 * @swagger
 * /api/reviews/institution/{id}:
 *   get:
 *     tags: [Reviews]
 *     summary: Get reviews for an institution
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of institution reviews
 */

/**
 * @swagger
 * /api/reviews/institution/{id}/rating:
 *   get:
 *     tags: [Reviews]
 *     summary: Get institution's average rating
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Average rating
 */

/**
 * @swagger
 * /api/reviews/received:
 *   get:
 *     tags: [Reviews]
 *     summary: Get reviews received by current user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of received reviews
 */

/**
 * @swagger
 * /api/reviews/written:
 *   get:
 *     tags: [Reviews]
 *     summary: Get reviews written by current user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of written reviews
 */

/**
 * @swagger
 * /api/reviews/{id}:
 *   delete:
 *     tags: [Reviews]
 *     summary: Delete review (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Review deleted
 */


// ============================================
// NOTIFICATION ROUTES
// ============================================

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: Get user's notifications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: isRead
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: List of notifications (sorted by createdAt desc)
 */

/**
 * @swagger
 * /api/notifications/unread-count:
 *   get:
 *     tags: [Notifications]
 *     summary: Get unread notification count
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread count
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: integer
 */

/**
 * @swagger
 * /api/notifications/read-all:
 *   put:
 *     tags: [Notifications]
 *     summary: Mark all notifications as read
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 */

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   put:
 *     tags: [Notifications]
 *     summary: Mark notification as read
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Notification marked as read
 */

/**
 * @swagger
 * /api/notifications/{id}:
 *   delete:
 *     tags: [Notifications]
 *     summary: Delete notification
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Notification deleted
 */

// ============================================
// DOMAIN ROUTES
// ============================================

/**
 * @swagger
 * /api/domains:
 *   get:
 *     tags: [Domains]
 *     summary: Get all domains
 *     responses:
 *       200:
 *         description: List of domains
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Domain'
 *   post:
 *     tags: [Domains]
 *     summary: Create domain (Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Domain created
 */

/**
 * @swagger
 * /api/domains/{id}:
 *   get:
 *     tags: [Domains]
 *     summary: Get domain by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Domain details
 *   put:
 *     tags: [Domains]
 *     summary: Update domain (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Domain updated
 *   delete:
 *     tags: [Domains]
 *     summary: Delete domain (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Domain deleted
 */

// ============================================
// SPECIALITY ROUTES
// ============================================

/**
 * @swagger
 * /api/specialities:
 *   get:
 *     tags: [Specialities]
 *     summary: Get all specialities
 *     responses:
 *       200:
 *         description: List of specialities
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Speciality'
 *   post:
 *     tags: [Specialities]
 *     summary: Create speciality (Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Speciality created
 */

/**
 * @swagger
 * /api/specialities/{id}:
 *   get:
 *     tags: [Specialities]
 *     summary: Get speciality by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Speciality details
 *   put:
 *     tags: [Specialities]
 *     summary: Update speciality (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Speciality updated
 *   delete:
 *     tags: [Specialities]
 *     summary: Delete speciality (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Speciality deleted
 */

// ============================================
// ADMIN ROUTES
// ============================================

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     tags: [Admin]
 *     summary: Get admin dashboard statistics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/DashboardStats'
 */

/**
 * @swagger
 * /api/admin/workers/pending:
 *   get:
 *     tags: [Admin]
 *     summary: Get pending worker verifications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of pending workers
 */

/**
 * @swagger
 * /api/admin/workers/{id}/verify:
 *   put:
 *     tags: [Admin]
 *     summary: Verify or reject worker
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [VERIFIED, REJECTED]
 *               rejectionReason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Worker verification updated
 */

/**
 * @swagger
 * /api/admin/documents/pending:
 *   get:
 *     tags: [Admin]
 *     summary: Get pending document reviews
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of pending documents
 */

/**
 * @swagger
 * /api/admin/documents/{id}/review:
 *   put:
 *     tags: [Admin]
 *     summary: Review document
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [APPROVED, REJECTED]
 *               adminComment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Document reviewed
 */

/**
 * @swagger
 * /api/admin/users/{id}/status:
 *   put:
 *     tags: [Admin]
 *     summary: Update user status
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, SUSPENDED, BANNED]
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: User status updated
 */

/**
 * @swagger
 * /api/admin/logs:
 *   get:
 *     tags: [Admin]
 *     summary: Get admin action logs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: actionType
 *         schema:
 *           type: string
 *       - in: query
 *         name: adminId
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of admin logs
 */

/**
 * @swagger
 * /api/admin/payments/summary:
 *   get:
 *     tags: [Admin]
 *     summary: Get payment summary
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Payment summary statistics
 */

/**
 * @swagger
 * /api/admin/missions:
 *   get:
 *     tags: [Admin]
 *     summary: Get all missions (Admin view)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of all missions
 */

/**
 * @swagger
 * /api/admin/assignments:
 *   get:
 *     tags: [Admin]
 *     summary: Get all assignments (Admin view)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of all assignments
 */

/**
 * @swagger
 * /api/admin/reviews:
 *   get:
 *     tags: [Admin]
 *     summary: Get all reviews (Admin view)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of all reviews
 */

/**
 * @swagger
 * /api/admin/payments:
 *   get:
 *     tags: [Admin]
 *     summary: Get all payments (Admin view)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of all payments
 */
