import { pgTable, serial, text, varchar, integer } from "drizzle-orm/pg-core";
// @ts-expect-error drizzle self-reference inference issue
export const orgNodesTable = pgTable("org_nodes", {
  id: serial("id").primaryKey(),
  tabName: varchar("tab_name", { length: 50 }).notNull(),
  name: text("name").notNull(),
  type: varchar("type", { length: 50 }).$type<"category" | "task">().notNull(),
  details: text("details"),
  // @ts-expect-error drizzle self-reference inference issue
  parentId: integer("parent_id").references(() => orgNodesTable.id, {
    onDelete: "cascade",
  }),
});
