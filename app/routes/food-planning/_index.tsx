// app/routes/food-planning/_index.tsx
import { Navigate } from "react-router";
import ProtectedRoute from "../../components/auth/ProtectedRoute";

export default function FoodPlanningIndex() {
  return (
    <ProtectedRoute>
      <Navigate to="/food-planning/meal-plan" replace />
    </ProtectedRoute>
  );
}
