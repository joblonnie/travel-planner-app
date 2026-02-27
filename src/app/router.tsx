import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import { RootLayout } from "./RootLayout.tsx";
import { LoginScreen } from "@/features/auth/components/LoginScreen.tsx";
import { AuthLayout } from "./AuthLayout.tsx";
import { AppLayout } from "./AppLayout.tsx";
import { DayContent } from "@/features/planner/components/DayContent.tsx";
import { LoadingSpinner } from "@/components/LoadingSpinner.tsx";

const BudgetDashboard = lazy(() =>
  import("@/features/budget/components/BudgetDashboard.tsx").then((m) => ({
    default: m.BudgetDashboard,
  })),
);
const TripList = lazy(() =>
  import("@/features/trips/components/TripList.tsx").then((m) => ({
    default: m.TripList,
  })),
);
const GuideEditor = lazy(() =>
  import("@/features/guide/components/GuideEditor.tsx").then((m) => ({
    default: m.GuideEditor,
  })),
);
const InviteAcceptFlow = lazy(() =>
  import("@/features/sharing/components/InviteAcceptFlow.tsx").then((m) => ({
    default: m.InviteAcceptFlow,
  })),
);

function LazyBudgetDashboard() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <BudgetDashboard />
    </Suspense>
  );
}

function LazyTripList() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <TripList />
    </Suspense>
  );
}

function LazyGuideEditor() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <GuideEditor />
    </Suspense>
  );
}

function LazyInviteAcceptFlow() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <InviteAcceptFlow />
    </Suspense>
  );
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/login", element: <LoginScreen /> },
      { path: "/invite/:invitationId", element: <LazyInviteAcceptFlow /> },
      {
        element: <AuthLayout />,
        children: [
          {
            element: <AppLayout />,
            children: [
              { index: true, element: <DayContent /> },
              { path: "budget", element: <LazyBudgetDashboard /> },
              { path: "guide", element: <LazyGuideEditor /> },
              { path: "trips", element: <LazyTripList /> },
            ],
          },
        ],
      },
    ],
  },
]);
