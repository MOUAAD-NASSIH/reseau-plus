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
import Login from "@/pages/auth/Login";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";
import VerifyEmailPage from "@/pages/auth/VerifyEmailPage";

// Registration Pages
import WorkerRegisterPage from "@/components/worker/Register/WorkerRegisterPage";
import InstitutionRegisterPage from "@/components/institution/register/InstitutionRegisterPage";

// Worker Pages
import WorkerDashboard from "@/pages/worker/WorkerDashboard";
import WorkerProfile from "@/pages/worker/WorkerProfile";
import WorkerDocuments from "@/pages/worker/WorkerDocuments";
import WorkerAvailability from "@/pages/worker/WorkerAvailability";
import AvailableMissions from "@/pages/worker/AvailableMissions";
import MissionDetails from "@/pages/worker/MissionDetails";
import MyApplications from "@/pages/worker/MyApplications";
import AssignedMissions from "@/pages/worker/AssignedMissions";
import AssignmentDetails from "@/pages/worker/AssignmentDetails";
import WorkerReviews from "@/pages/worker/WorkerReviews";
import WorkerNotifications from "@/pages/worker/WorkerNotifications";
import PendingApproval from "@/pages/worker/PendingApproval";
import Messages from "@/pages/worker/Messages";

// Institution Pages
import InstitutionDashboard from "@/pages/institution/InstitutionDashboard";
import InstitutionProfile from "@/pages/institution/InstitutionProfile";
import CreateMission from "@/pages/institution/CreateMission";
import EditMission from "@/pages/institution/EditMission";
import MyMissions from "@/pages/institution/MyMissions";
import InstitutionMissionDetails from "@/pages/institution/MissionDetails";
import MissionApplicants from "@/pages/institution/MissionApplicants";
import InstitutionAssignments from "@/pages/institution/InstitutionAssignments";
import AssignedMissionView from "@/pages/institution/AssignedMissionView";
import PaymentPage from "@/pages/institution/PaymentPage";
import PaymentHistory from "@/pages/institution/PaymentHistory";
import InstitutionReviews from "@/pages/institution/InstitutionReviews";
import InstitutionNotifications from "@/pages/institution/InstitutionNotifications";
import InstitutionMessages from "@/pages/institution/InstitutionMessages";

// Admin Pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminProfile from "@/pages/admin/AdminProfile";
import WorkersValidation from "@/pages/admin/WorkersValidation";
import DocumentsValidation from "@/pages/admin/DocumentsValidation";
import DomainsManagement from "@/pages/admin/DomainsManagement";
import SpecialitiesManagement from "@/pages/admin/SpecialitiesManagement";
import MissionsOverview from "@/pages/admin/MissionsOverview";
import AssignmentsOverview from "@/pages/admin/AssignmentsOverview";
import PaymentsOverview from "@/pages/admin/PaymentsOverview";
import ReviewsOverview from "@/pages/admin/ReviewsOverview";
import AdminLogs from "@/pages/admin/AdminLogs";

// Shared Pages
import { NotFound, Unauthorized } from "@/pages/shared";
// Landing Page
import Landing from "@/pages/Landing";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes - Wrapped in PublicLayout */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Landing />} />

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
    </BrowserRouter>
  );
};

export default App;