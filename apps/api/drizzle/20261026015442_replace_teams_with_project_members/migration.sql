CREATE TABLE "project_members" (
	"project_id" integer,
	"user_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by_user_id" integer,
	"updated_by_user_id" integer,
	CONSTRAINT "project_members_project_id_user_id_pk" PRIMARY KEY("project_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "projects" DROP CONSTRAINT "projects_owner_team_fk";--> statement-breakpoint
DROP TABLE "teams";--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN "team_id";--> statement-breakpoint
CREATE INDEX "project_members_user_id_idx" ON "project_members" ("user_id");--> statement-breakpoint
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_project_id_projects_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id");--> statement-breakpoint
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_created_by_user_id_users_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_updated_by_user_id_users_id_fkey" FOREIGN KEY ("updated_by_user_id") REFERENCES "users"("id");--> statement-breakpoint
DELETE FROM "user_permissions"
WHERE "module_id" IN (SELECT "id" FROM "modules" WHERE "key" = 'teams');--> statement-breakpoint
DELETE FROM "modules" WHERE "key" = 'teams';--> statement-breakpoint
DELETE FROM "statuses" WHERE "status_type_key" = 'TEAM';--> statement-breakpoint
DELETE FROM "status_types" WHERE "key" = 'TEAM';
