CREATE TABLE "modules" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "modules_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"parent_id" integer,
	"key" varchar(25) NOT NULL CONSTRAINT "modules_key_unique" UNIQUE,
	"name" varchar(100) NOT NULL,
	"icon" varchar(50),
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by_user_id" integer,
	"updated_by_user_id" integer
);
--> statement-breakpoint
CREATE TABLE "user_permissions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "user_permissions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" integer NOT NULL,
	"module_id" integer NOT NULL,
	"can_read" boolean DEFAULT false NOT NULL,
	"can_write" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by_user_id" integer,
	"updated_by_user_id" integer,
	CONSTRAINT "user_permissions_user_module_unique" UNIQUE("user_id","module_id")
);
--> statement-breakpoint
ALTER TABLE "issues" DROP CONSTRAINT "issues_status_fk";--> statement-breakpoint
ALTER TABLE "projects" DROP CONSTRAINT "projects_status_fk";--> statement-breakpoint
ALTER TABLE "teams" DROP CONSTRAINT "teams_status_fk";--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_status_fk";--> statement-breakpoint
ALTER TABLE "issues" ADD COLUMN "status_id" integer;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "status_id" integer;--> statement-breakpoint
ALTER TABLE "statuses" ADD COLUMN "id" integer GENERATED ALWAYS AS IDENTITY (sequence name "statuses_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1);--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "status_id" integer;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "status_id" integer;--> statement-breakpoint
UPDATE "issues" AS entity
SET "status_id" = status.id
FROM "statuses" AS status
WHERE status.key = entity.status_key
  AND status.status_type_key = entity.status_type_key;--> statement-breakpoint
UPDATE "projects" AS entity
SET "status_id" = status.id
FROM "statuses" AS status
WHERE status.key = entity.status_key
  AND status.status_type_key = entity.status_type_key;--> statement-breakpoint
UPDATE "teams" AS entity
SET "status_id" = status.id
FROM "statuses" AS status
WHERE status.key = entity.status_key
  AND status.status_type_key = entity.status_type_key;--> statement-breakpoint
UPDATE "users" AS entity
SET "status_id" = status.id
FROM "statuses" AS status
WHERE status.key = entity.status_key
  AND status.status_type_key = entity.status_type_key;--> statement-breakpoint
ALTER TABLE "issues" ALTER COLUMN "status_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "status_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "teams" ALTER COLUMN "status_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "status_id" SET NOT NULL;--> statement-breakpoint
INSERT INTO "modules" ("key", "name", "icon", "sort_order")
VALUES
  ('home', 'Home', 'House', 0),
  ('users', 'Users', 'Users', 10)
ON CONFLICT ("key") DO NOTHING;--> statement-breakpoint
ALTER TABLE "issues" DROP COLUMN "status_type_key";--> statement-breakpoint
ALTER TABLE "issues" DROP COLUMN "status_key";--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN "status_type_key";--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN "status_key";--> statement-breakpoint
ALTER TABLE "teams" DROP COLUMN "status_type_key";--> statement-breakpoint
ALTER TABLE "teams" DROP COLUMN "status_key";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "status_type_key";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "status_key";--> statement-breakpoint
ALTER TABLE "statuses" DROP CONSTRAINT "statuses_pkey";--> statement-breakpoint
ALTER TABLE "statuses" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "statuses" ADD CONSTRAINT "statuses_key_key" UNIQUE("key");--> statement-breakpoint
ALTER TABLE "issues" ADD CONSTRAINT "issues_status_id_statuses_id_fkey" FOREIGN KEY ("status_id") REFERENCES "statuses"("id");--> statement-breakpoint
ALTER TABLE "modules" ADD CONSTRAINT "modules_parent_id_modules_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "modules"("id");--> statement-breakpoint
ALTER TABLE "modules" ADD CONSTRAINT "modules_created_by_user_id_users_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "modules" ADD CONSTRAINT "modules_updated_by_user_id_users_id_fkey" FOREIGN KEY ("updated_by_user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_status_id_statuses_id_fkey" FOREIGN KEY ("status_id") REFERENCES "statuses"("id");--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_status_id_statuses_id_fkey" FOREIGN KEY ("status_id") REFERENCES "statuses"("id");--> statement-breakpoint
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_created_by_user_id_users_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_updated_by_user_id_users_id_fkey" FOREIGN KEY ("updated_by_user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_user_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_module_fk" FOREIGN KEY ("module_id") REFERENCES "modules"("id");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_status_id_statuses_id_fkey" FOREIGN KEY ("status_id") REFERENCES "statuses"("id");