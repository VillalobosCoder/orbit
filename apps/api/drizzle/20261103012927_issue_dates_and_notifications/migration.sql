ALTER TABLE "issues" RENAME COLUMN "start_at" TO "start_date";--> statement-breakpoint
ALTER TABLE "issues" RENAME COLUMN "due_at" TO "due_date";--> statement-breakpoint
ALTER TABLE "issues" ALTER COLUMN "start_date" SET DATA TYPE date USING "start_date"::date;--> statement-breakpoint
ALTER TABLE "issues" ALTER COLUMN "due_date" SET DATA TYPE date USING "due_date"::date;--> statement-breakpoint
ALTER TABLE "issues" ADD CONSTRAINT "issues_dates_order_check" CHECK ("start_date" is null or "due_date" is null or "start_date" <= "due_date");--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "notifications_enabled" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipient_type_entity_unique" UNIQUE("recipient_id","type","entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "notifications_recipient_created_idx" ON "notifications" ("recipient_id","created_at");
