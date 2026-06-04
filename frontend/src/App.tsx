import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";

// Layouts
import {
  WorkerLayout,
  InstitutionLayout,
  AdminLayout,
  PublicLayout,
} from "@/layouts";

// Middleware/Guards
import ProtectedRoute from "@/middleware/ProtectedRoute";
import RoleGuard from "@/middleware/RoleGuard";
import WorkerVerifiedGuard from "@/middleware/WorkerVerifiedGuard";
import GuestGuard from "@/middleware/GuestGuard";

// Auth Pages
const Login = lazy(() => import("@/pages/auth/Login"));
const ForgotPasswordPage = lazy(() => import("@/pages/auth/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("@/pages/auth/ResetPasswordPage"));
const VerifyEmailPage = lazy(() => import("@/pages/auth/VerifyEmailPage"));

// Registration Pages
const WorkerRegisterPage = lazy(() => import("@/components/worker/Register/WorkerRegisterPage"));
const InstitutionRegisterPage = lazy(() => import("@/components/institution/register/InstitutionRegisterPage"));

// Worker Pages
const WorkerDashboard = lazy(() => import("@/pages/worker/WorkerDashboard"));
const WorkerProfile = lazy(() => import("@/pages/worker/WorkerProfile"));
const WorkerDocuments = lazy(() => import("@/pages/worker/WorkerDocuments"));
const WorkerAvailability = lazy(() => import("@/pages/worker/WorkerAvailability"));
const AvailableMissions = lazy(() => import("@/pages/worker/AvailableMissions"));
const MissionDetails = lazy(() => import("@/pages/worker/MissionDetails"));
const MyApplications = lazy(() => import("@/pages/worker/MyApplications"));
const AssignedMissions = lazy(() => import("@/pages/worker/AssignedMissions"));
const AssignmentDetails = lazy(() => import("@/pages/worker/AssignmentDetails"));
const WorkerReviews = lazy(() => import("@/pages/worker/WorkerReviews"));
const WorkerNotifications = lazy(() => import("@/pages/worker/WorkerNotifications"));
const PendingApproval = lazy(() => import("@/pages/worker/PendingApproval"));
const Messages = lazy(() => import("@/pages/worker/Messages"));

// Institution Pages
const InstitutionDashboard = lazy(() => import("@/pages/institution/InstitutionDashboard"));
const InstitutionProfile = lazy(() => import("@/pages/institution/InstitutionProfile"));
const CreateMission = lazy(() => import("@/pages/institution/CreateMission"));
const EditMission = lazy(() => import("@/pages/institution/EditMission"));
const MyMissions = lazy(() => import("@/pages/institution/MyMissions"));
const InstitutionMissionDetails = lazy(() => import("@/pages/institution/MissionDetails"));
const MissionApplicants = lazy(() => import("@/pages/institution/MissionApplicants"));
const InstitutionAssignments = lazy(() => import("@/pages/institution/InstitutionAssignments"));
const AssignedMissionView = lazy(() => import("@/pages/institution/AssignedMissionView"));
const PaymentPage = lazy(() => import("@/pages/institution/PaymentPage"));
const PaymentHistory = lazy(() => import("@/pages/institution/PaymentHistory"));
const InstitutionReviews = lazy(() => import("@/pages/institution/InstitutionReviews"));
const InstitutionNotifications = lazy(() => import("@/pages/institution/InstitutionNotifications"));
const InstitutionMessages = lazy(() => import("@/pages/institution/InstitutionMessages"));

// Admin Pages
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const AdminProfile = lazy(() => import("@/pages/admin/AdminProfile"));
const WorkersValidation = lazy(() => import("@/pages/admin/WorkersValidation"));
const DocumentsValidation = lazy(() => import("@/pages/admin/DocumentsValidation"));
const DomainsManagement = lazy(() => import("@/pages/admin/DomainsManagement"));
const SpecialitiesManagement = lazy(() => import("@/pages/admin/SpecialitiesManagement"));
const MissionsOverview = lazy(() => import("@/pages/admin/MissionsOverview"));
const AssignmentsOverview = lazy(() => import("@/pages/admin/AssignmentsOverview"));
const PaymentsOverview = lazy(() => import("@/pages/admin/PaymentsOverview"));
const ReviewsOverview = lazy(() => import("@/pages/admin/ReviewsOverview"));
const AdminLogs = lazy(() => import("@/pages/admin/AdminLogs"));

// Shared Pages
import { NotFound, Unauthorized } from "@/pages/shared";

// Global Loader
import { GlobalLoader } from "@/components/ui/GlobalLoader";

// Landing Page
const Landing = lazy(() => import("@/pages/Landing"));
const QualityStandards = lazy(() => import("@/pages/QualityStandards"));

const App = () => {


  return (
    <BrowserRouter>
      <Suspense fallback={<GlobalLoader />}>
        <Routes>
          {/* Public Routes - Wrapped in PublicLayout */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Landing />} />
            <Route path="/quality-standards" element={<QualityStandards />} />

            {/* Auth Routes - Wrapped in GuestGuard (for unauthenticated logic) */}
            <Route
              path="/login"
              element={
                <GuestGuard>
                  <Login />
                </GuestGuard>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <GuestGuard>
                  <ForgotPasswordPage />
                </GuestGuard>
              }
            />
            <Route
              path="/reset-password"
              element={
                <GuestGuard>
                  <ResetPasswordPage />
                </GuestGuard>
              }
            />
            <Route
              path="/verify-email"
              element={
                <GuestGuard>
                  <VerifyEmailPage />
                </GuestGuard>
              }
            />

            {/* Registration Routes */}
            <Route
              path="/register/worker"
              element={
                <GuestGuard>
                  <WorkerRegisterPage />
                </GuestGuard>
              }
            />
            <Route
              path="/register/institution"
              element={
                <GuestGuard>
                  <InstitutionRegisterPage />
                </GuestGuard>
              }
            />
          </Route>

          {/* Worker Routes */}
          <Route
            path="/worker"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={["worker"]} fallbackPath="/unauthorized">
                  <WorkerLayout
                    title="HEADER_TITLES.DASHBOARD"
                    description="HEADER_TITLES.DASHBOARD_DESC"
                  >
                    <WorkerDashboard />
                  </WorkerLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/worker/profile"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={["worker"]} fallbackPath="/unauthorized">
                  <WorkerLayout
                    title="HEADER_TITLES.PROFILE"
                    description="HEADER_TITLES.PROFILE_DESC"
                  >
                    <WorkerProfile />
                  </WorkerLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/worker/documents"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={["worker"]} fallbackPath="/unauthorized">
                  <WorkerLayout
                    title="HEADER_TITLES.DOCUMENTS"
                    description="HEADER_TITLES.DOCUMENTS_DESC"
                  >
                    <WorkerDocuments />
                  </WorkerLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/worker/availability"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={["worker"]} fallbackPath="/unauthorized">
                  <WorkerVerifiedGuard>
                    <WorkerLayout
                      title="HEADER_TITLES.AVAILABILITY"
                      description="HEADER_TITLES.AVAILABILITY_DESC"
                    >
                      <WorkerAvailability />
                    </WorkerLayout>
                  </WorkerVerifiedGuard>
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/worker/missions"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={["worker"]} fallbackPath="/unauthorized">
                  <WorkerVerifiedGuard>
                    <WorkerLayout
                      title="HEADER_TITLES.AVAILABLE_MISSIONS"
                      description="HEADER_TITLES.AVAILABLE_MISSIONS_DESC"
                    >
                      <AvailableMissions />
                    </WorkerLayout>
                  </WorkerVerifiedGuard>
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/worker/missions/:id"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={["worker"]} fallbackPath="/unauthorized">
                  <WorkerVerifiedGuard>
                    <WorkerLayout
                      title="HEADER_TITLES.MISSION_DETAILS"
                      description="HEADER_TITLES.MISSION_DETAILS_DESC"
                    >
                      <MissionDetails />
                    </WorkerLayout>
                  </WorkerVerifiedGuard>
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/worker/applications"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={["worker"]} fallbackPath="/unauthorized">
                  <WorkerVerifiedGuard>
                    <WorkerLayout
                      title="HEADER_TITLES.MY_APPLICATIONS"
                      description="HEADER_TITLES.MY_APPLICATIONS_DESC"
                    >
                      <MyApplications />
                    </WorkerLayout>
                  </WorkerVerifiedGuard>
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/worker/assignments"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={["worker"]} fallbackPath="/unauthorized">
                  <WorkerVerifiedGuard>
                    <WorkerLayout
                      title="HEADER_TITLES.ASSIGNED_MISSIONS"
                      description="HEADER_TITLES.ASSIGNED_MISSIONS_DESC"
                    >
                      <AssignedMissions />
                    </WorkerLayout>
                  </WorkerVerifiedGuard>
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/worker/assignments/:id"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={["worker"]} fallbackPath="/unauthorized">
                  <WorkerVerifiedGuard>
                    <WorkerLayout title="HEADER_TITLES.ASSIGNMENT_DETAILS" description="HEADER_TITLES.ASSIGNMENT_DETAILS_DESC">
                      <AssignmentDetails />
                    </WorkerLayout>
                  </WorkerVerifiedGuard>
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/worker/reviews"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={["worker"]} fallbackPath="/unauthorized">
                  <WorkerVerifiedGuard>
                    <WorkerLayout
                      title="HEADER_TITLES.REVIEWS"
                      description="HEADER_TITLES.REVIEWS_DESC"
                    >
                      <WorkerReviews />
                    </WorkerLayout>
                  </WorkerVerifiedGuard>
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/worker/messages"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={["worker"]} fallbackPath="/unauthorized">
                  <WorkerVerifiedGuard>
                    <WorkerLayout title="HEADER_TITLES.MESSAGES" description="HEADER_TITLES.MESSAGES_DESC">
                      <Messages />
                    </WorkerLayout>
                  </WorkerVerifiedGuard>
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/worker/notifications"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={["worker"]} fallbackPath="/unauthorized">
                  <WorkerLayout
                    title="HEADER_TITLES.NOTIFICATIONS"
                    description="HEADER_TITLES.NOTIFICATIONS_DESC"
                  >
                    <WorkerNotifications />
                  </WorkerLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/worker/pending-approval"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={["worker"]} fallbackPath="/unauthorized">
                  <WorkerLayout
                    title="HEADER_TITLES.PENDING_APPROVAL"
                    description="HEADER_TITLES.PENDING_APPROVAL_DESC"
                  >
                    <PendingApproval />
                  </WorkerLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          {/* Institution Routes */}
          <Route
            path="/institution"
            element={
              <ProtectedRoute>
                <RoleGuard
                  allowedRoles={["institution"]}
                  fallbackPath="/unauthorized"
                >
                  <InstitutionLayout
                    title="HEADER_TITLES.DASHBOARD"
                    description="HEADER_TITLES.DASHBOARD_DESC"
                  >
                    <InstitutionDashboard />
                  </InstitutionLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/institution/profile"
            element={
              <ProtectedRoute>
                <RoleGuard
                  allowedRoles={["institution"]}
                  fallbackPath="/unauthorized"
                >
                  <InstitutionLayout
                    title="HEADER_TITLES.PROFILE"
                    description="HEADER_TITLES.PROFILE_DESC"
                  >
                    <InstitutionProfile />
                  </InstitutionLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/institution/missions/create"
            element={
              <ProtectedRoute>
                <RoleGuard
                  allowedRoles={["institution"]}
                  fallbackPath="/unauthorized"
                >
                  <InstitutionLayout
                    title="HEADER_TITLES.CREATE_MISSION"
                    description="HEADER_TITLES.CREATE_MISSION_DESC"
                  >
                    <CreateMission />
                  </InstitutionLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/institution/missions/:id/edit"
            element={
              <ProtectedRoute>
                <RoleGuard
                  allowedRoles={["institution"]}
                  fallbackPath="/unauthorized"
                >
                  <InstitutionLayout
                    title="HEADER_TITLES.EDIT_MISSION"
                    description="HEADER_TITLES.EDIT_MISSION_DESC"
                  >
                    <EditMission />
                  </InstitutionLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/institution/missions"
            element={
              <ProtectedRoute>
                <RoleGuard
                  allowedRoles={["institution"]}
                  fallbackPath="/unauthorized"
                >
                  <InstitutionLayout
                    title="HEADER_TITLES.MY_MISSIONS"
                    description="HEADER_TITLES.MY_MISSIONS_DESC"
                  >
                    <MyMissions />
                  </InstitutionLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/institution/missions/:id"
            element={
              <ProtectedRoute>
                <RoleGuard
                  allowedRoles={["institution"]}
                  fallbackPath="/unauthorized"
                >
                  <InstitutionLayout
                    title="HEADER_TITLES.MISSION_DETAILS"
                    description="HEADER_TITLES.MISSION_DETAILS_DESC"
                  >
                    <InstitutionMissionDetails />
                  </InstitutionLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/institution/missions/:id/applicants"
            element={
              <ProtectedRoute>
                <RoleGuard
                  allowedRoles={["institution"]}
                  fallbackPath="/unauthorized"
                >
                  <InstitutionLayout
                    title="HEADER_TITLES.MISSION_APPLICANTS"
                    description="HEADER_TITLES.MISSION_APPLICANTS_DESC"
                  >
                    <MissionApplicants />
                  </InstitutionLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/institution/assignments"
            element={
              <ProtectedRoute>
                <RoleGuard
                  allowedRoles={["institution"]}
                  fallbackPath="/unauthorized"
                >
                  <InstitutionLayout
                    title="HEADER_TITLES.ASSIGNMENTS"
                    description="HEADER_TITLES.ASSIGNMENTS_DESC"
                  >
                    <InstitutionAssignments />
                  </InstitutionLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/institution/assignments/:id"
            element={
              <ProtectedRoute>
                <RoleGuard
                  allowedRoles={["institution"]}
                  fallbackPath="/unauthorized"
                >
                  <InstitutionLayout
                    title="HEADER_TITLES.ASSIGNMENT_DETAILS"
                    description="HEADER_TITLES.ASSIGNMENT_DETAILS_DESC"
                  >
                    <AssignedMissionView />
                  </InstitutionLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/institution/payments/:id"
            element={
              <ProtectedRoute>
                <RoleGuard
                  allowedRoles={["institution"]}
                  fallbackPath="/unauthorized"
                >
                  <InstitutionLayout
                    title="HEADER_TITLES.PAYMENT"
                    description="HEADER_TITLES.PAYMENT_DESC"
                  >
                    <PaymentPage />
                  </InstitutionLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/institution/payments"
            element={<Navigate to="/institution/payments/history" replace />}
          />
          <Route
            path="/institution/payments/history"
            element={
              <ProtectedRoute>
                <RoleGuard
                  allowedRoles={["institution"]}
                  fallbackPath="/unauthorized"
                >
                  <InstitutionLayout
                    title="HEADER_TITLES.PAYMENT_HISTORY"
                    description="HEADER_TITLES.PAYMENT_HISTORY_DESC"
                  >
                    <PaymentHistory />
                  </InstitutionLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/institution/reviews"
            element={
              <ProtectedRoute>
                <RoleGuard
                  allowedRoles={["institution"]}
                  fallbackPath="/unauthorized"
                >
                  <InstitutionLayout
                    title="HEADER_TITLES.REVIEWS"
                    description="HEADER_TITLES.REVIEWS_DESC"
                  >
                    <InstitutionReviews />
                  </InstitutionLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/institution/messages"
            element={
              <ProtectedRoute>
                <RoleGuard
                  allowedRoles={["institution"]}
                  fallbackPath="/unauthorized"
                >
                  <InstitutionLayout title="HEADER_TITLES.MESSAGES" description="HEADER_TITLES.MESSAGES_DESC">
                    <InstitutionMessages />
                  </InstitutionLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/institution/notifications"
            element={
              <ProtectedRoute>
                <RoleGuard
                  allowedRoles={["institution"]}
                  fallbackPath="/unauthorized"
                >
                  <InstitutionLayout
                    title="HEADER_TITLES.NOTIFICATIONS"
                    description="HEADER_TITLES.NOTIFICATIONS_DESC"
                  >
                    <InstitutionNotifications />
                  </InstitutionLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={["admin"]} fallbackPath="/unauthorized">
                  <AdminLayout
                    title="HEADER_TITLES.DASHBOARD"
                    description="HEADER_TITLES.DASHBOARD_DESC"
                  >
                    <AdminDashboard />
                  </AdminLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/profile"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={["admin"]} fallbackPath="/unauthorized">
                  <AdminLayout
                    title="HEADER_TITLES.PROFILE"
                    description="HEADER_TITLES.PROFILE_DESC"
                  >
                    <AdminProfile />
                  </AdminLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/workers"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={["admin"]} fallbackPath="/unauthorized">
                  <AdminLayout
                    title="Workers Validation"
                    description="Review and verify worker accounts"
                  >
                    <WorkersValidation />
                  </AdminLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/documents"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={["admin"]} fallbackPath="/unauthorized">
                  <AdminLayout
                    title="Documents Validation"
                    description="Review and approve worker documents"
                  >
                    <DocumentsValidation />
                  </AdminLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/domains"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={["admin"]} fallbackPath="/unauthorized">
                  <AdminLayout
                    title="Domains Management"
                    description="Manage work domains and categories"
                  >
                    <DomainsManagement />
                  </AdminLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/specialities"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={["admin"]} fallbackPath="/unauthorized">
                  <AdminLayout
                    title="Specialities Management"
                    description="Manage worker specialities"
                  >
                    <SpecialitiesManagement />
                  </AdminLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/missions"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={["admin"]} fallbackPath="/unauthorized">
                  <AdminLayout
                    title="Missions Overview"
                    description="View all platform missions"
                  >
                    <MissionsOverview />
                  </AdminLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/assignments"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={["admin"]} fallbackPath="/unauthorized">
                  <AdminLayout
                    title="Assignments Overview"
                    description="View all mission assignments"
                  >
                    <AssignmentsOverview />
                  </AdminLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/payments"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={["admin"]} fallbackPath="/unauthorized">
                  <AdminLayout
                    title="Payments Overview"
                    description="View all payment transactions"
                  >
                    <PaymentsOverview />
                  </AdminLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reviews"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={["admin"]} fallbackPath="/unauthorized">
                  <AdminLayout
                    title="Reviews Overview"
                    description="View all platform reviews"
                  >
                    <ReviewsOverview />
                  </AdminLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/logs"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={["admin"]} fallbackPath="/unauthorized">
                  <AdminLayout
                    title="Admin Logs"
                    description="View admin activity history"
                  >
                    <AdminLogs />
                  </AdminLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          {/* Error Routes */}
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;