// src/drizzle/types.ts
import type { InferSelectModel } from "drizzle-orm";
import { orgNodesTable } from "./schema";
export type OrgNodeRow = InferSelectModel<typeof orgNodesTable>;
