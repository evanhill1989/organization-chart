// app/routes.ts
import {
  type RouteConfig,
  route,
  index,
  layout,
} from "@react-router/dev/routes";

export default [
  index("./routes/_index.tsx"),
  route("journal", "./routes/journal/_index.tsx"),
  route("journal/new", "./routes/journal/new.tsx"),
  route("journal/entry/:entryId", "./routes/journal/entry.$entryId.tsx"),
  route("org-chart", "./routes/org-chart/_index.tsx"),
  route("org-chart/:tabName", "./routes/org-chart/$tabName.tsx"),
] satisfies RouteConfig;
