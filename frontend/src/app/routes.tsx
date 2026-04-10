import { createBrowserRouter } from "react-router";
import { AppLayout } from "./components/layout/AppLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { GuestRoute } from "./components/GuestRoute";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { SignUpPage } from "./pages/SignUpPage";
import { DashboardPage } from "./pages/DashboardPage";
import { SubmitWastePage } from "./pages/SubmitWastePage";
import { LeaderboardPage } from "./pages/LeaderboardPage";
import { ActivityFeedPage } from "./pages/ActivityFeedPage";
import { ProfilePage } from "./pages/ProfilePage";
import { SettingsPage } from "./pages/SettingsPage";
import { RewardsPage } from "./pages/RewardsPage";
import { ModeratorPage } from "./pages/ModeratorPage";
import { AuditTrailPage } from "./pages/AuditTrailPage";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { NotFoundPage } from "./pages/NotFoundPage";

export const router = createBrowserRouter([
  {
    path: "/",
    errorElement: <NotFoundPage />,
    element: (
      <GuestRoute>
        <LandingPage />
      </GuestRoute>
    ),
  },
  {
    path: "/login",
    element: (
      <GuestRoute>
        <LoginPage />
      </GuestRoute>
    ),
  },
  {
    path: "/signup",
    element: (
      <GuestRoute>
        <SignUpPage />
      </GuestRoute>
    ),
  },
  {
    path: "/admin/dashboard",
    element: (
      <ProtectedRoute requiredRole="admin">
        <AdminDashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    // All /app/* routes require authentication at minimum
    path: "/app",
    errorElement: <NotFoundPage />,
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, Component: DashboardPage },
      { path: "submit",               Component: SubmitWastePage },
      { path: "leaderboard",          Component: LeaderboardPage },
      { path: "feed",                 Component: ActivityFeedPage },
      { path: "profile/:username",    Component: ProfilePage },
      { path: "profile",              Component: ProfilePage },
      { path: "settings",             Component: SettingsPage },
      { path: "rewards",              Component: RewardsPage },

      // Moderator route — requires role: moderator or admin
      {
        path: "moderator",
        element: (
          <ProtectedRoute requiredRole="moderator">
            <ModeratorPage />
          </ProtectedRoute>
        ),
      },

      // Admin-only routes — require role: admin
      {
        path: "admin",
        element: (
          <ProtectedRoute requiredRole="admin">
            <AdminDashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "audit",
        element: (
          <ProtectedRoute requiredRole="admin">
            <AuditTrailPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);
