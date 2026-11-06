CREATE TABLE "revoked_sessions" (
	"id" varchar(36) PRIMARY KEY,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "sessions_valid_after" timestamp with time zone;--> statement-breakpoint
CREATE INDEX "revoked_sessions_expires_at_idx" ON "revoked_sessions" ("expires_at");