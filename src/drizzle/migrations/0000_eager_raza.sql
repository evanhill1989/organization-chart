CREATE TABLE "org_nodes" (
	"id" serial PRIMARY KEY NOT NULL,
	"tab_name" varchar(50) NOT NULL,
	"name" text NOT NULL,
	"type" varchar(50) NOT NULL,
	"details" text,
	"parent_id" integer
);
--> statement-breakpoint
ALTER TABLE "org_nodes" ADD CONSTRAINT "org_nodes_parent_id_org_nodes_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."org_nodes"("id") ON DELETE cascade ON UPDATE no action;