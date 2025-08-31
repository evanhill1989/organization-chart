// app/routes.ts
import {
  type RouteConfig,
  route,
  index,
  layout,
} from "@react-router/dev/routes";

export default [
  // Main dashboard/home route
  index("./routes/_index.tsx"),

  // Journal routes
  route("journal", "./routes/journal/_index.tsx", [
    route("new", "./routes/journal/new.tsx"),
    route("entry/:entryId", "./routes/journal/entry.$entryId.tsx"),
  ]),

  // Org chart routes
  route("org-chart", "./routes/org-chart/_index.tsx"), // This handles /org-chart only
  route("org-chart/:tabName", "./routes/org-chart/$tabName.tsx"),
] satisfies RouteConfig;
