// app/routes/org-chart/_index.tsx - Debug version
import { Navigate } from "react-router";

export default function OrgChartIndex() {
  console.log("🏠 OrgChartIndex component rendered - redirecting to Household");

  return <Navigate to="/org-chart/Household" replace />;
}
