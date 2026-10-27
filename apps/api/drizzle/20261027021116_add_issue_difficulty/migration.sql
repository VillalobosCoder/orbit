CREATE TABLE "difficulties" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "difficulties_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(10) NOT NULL CONSTRAINT "difficulties_name_unique" UNIQUE,
	"level" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by_user_id" integer,
	"updated_by_user_id" integer
);
--> statement-breakpoint
ALTER TABLE "issues" ADD COLUMN "difficulty_id" integer;--> statement-breakpoint
ALTER TABLE "difficulties" ADD CONSTRAINT "difficulties_created_by_user_id_users_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "difficulties" ADD CONSTRAINT "difficulties_updated_by_user_id_users_id_fkey" FOREIGN KEY ("updated_by_user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "issues" ADD CONSTRAINT "issues_difficulty_id_difficulties_id_fkey" FOREIGN KEY ("difficulty_id") REFERENCES "difficulties"("id");--> statement-breakpoint
INSERT INTO "difficulties" ("name", "level")
VALUES ('XS', 1), ('S', 2), ('MD', 3), ('LG', 4), ('XL', 5)
ON CONFLICT ("name") DO NOTHING;
