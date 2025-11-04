// app/routes/org-chart/_index.tsx - Debug version
import { Navigate } from "react-router";
import ProtectedRoute from "../../components/auth/ProtectedRoute";

export default function OrgChartIndex() {
  console.log("🏠 OrgChartIndex component rendered - redirecting to Household");

  return (
    <ProtectedRoute>
      <Navigate to="/org-chart/Household" replace />
    </ProtectedRoute>
  );
}
