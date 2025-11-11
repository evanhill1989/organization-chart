// app/routes.ts
import { type RouteConfig, route, index } from "@react-router/dev/routes";

export default [
  index("./routes/_index.tsx"),

  // Auth routes
  route("login", "./routes/login/_index.tsx"),
  route("signup", "./routes/signup/_index.tsx"),
  route("forgot-password", "./routes/forgot-password/_index.tsx"),
  route("reset-password", "./routes/reset-password/_index.tsx"),
  route("auth/callback", "./routes/auth/callback.tsx"),

  // Journal routes
  route("journal", "./routes/journal/_index.tsx"),
  route("journal/new", "./routes/journal/new.tsx"),
  route("journal/entry/:entryId", "./routes/journal/entry.$entryId.tsx"),

  // Org chart routes
  route("org-chart", "./routes/org-chart/_index.tsx"),
  route("org-chart/:tabName", "./routes/org-chart/$tabName.tsx"),

  // Food planning routes
  route("food-planning", "./routes/food-planning/_index.tsx"),
  route("food-planning/meal-plan", "./routes/food-planning/meal-plan.tsx"),
  route("food-planning/grocery-list", "./routes/food-planning/grocery-list.tsx"),
] satisfies RouteConfig;
