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
                  title="Dashboard"
                  description="Overview of your activity and quick actions"
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
                  title="Profile"
                  description="Manage your personal and professional information"
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
                  title="Documents"
                  description="Upload and manage your verification documents"
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
                    title="Availability"
                    description="Set your available dates for missions"
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
                    title="Available Missions"
                    description="Browse and apply for open missions"
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
                    title="Mission Details"
                    description="View mission information and apply"
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
                    title="My Applications"
                    description="Track your mission applications"
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
                    title="Assigned Missions"
                    description="View your current and past assignments"
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
                  <WorkerLayout title="Assignment Details" description="View assignment information">
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
                    title="Reviews"
                    description="View and write reviews for completed missions"
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
                  <WorkerLayout title="Messages" description="Chat with institutions about missions">
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
                  title="Notifications"
                  description="Stay updated with your activity"
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
                  title="Pending Approval"
                  description="Your account is awaiting verification"
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
                  title="Dashboard"
                  description="Overview of your missions and activity"
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
                  title="Profile"
                  description="Manage your institution information"
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
                  title="Create Mission"
                  description="Post a new mission for social workers"
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
                  title="Edit Mission"
                  description="Update mission details"
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
                  title="My Missions"
                  description="Manage your posted missions"
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
                  title="Mission Details"
                  description="View mission information"
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
                  title="Mission Applicants"
                  description="Review and manage applicants"
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
                  title="Assignments"
                  description="Manage your mission assignments"
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
                  title="Assignment Details"
                  description="View assignment information"
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
                  title="Payment"
                  description="Complete payment for assignment"
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
                  title="Payment History"
                  description="View your payment transactions"
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
                  title="Reviews"
                  description="View and write reviews"
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
                <InstitutionLayout title="Messages" description="Chat with workers about missions">
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
                  title="Notifications"
                  description="Stay updated with your activity"
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
                  title="Dashboard"
                  description="Platform overview and key metrics"
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
                  title="Profile"
                  description="Manage your admin account"
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