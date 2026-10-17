CREATE TABLE "attachments" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "attachments_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"issue_id" integer NOT NULL,
	"comment_id" integer,
	"file_id" integer NOT NULL,
	"uploaded_by_user_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by_user_id" integer,
	"updated_by_user_id" integer,
	CONSTRAINT "attachments_issue_id_comment_id_file_id_unique" UNIQUE("issue_id","comment_id","file_id")
);
--> statement-breakpoint
CREATE TABLE "board_columns" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "board_columns_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"project_id" integer NOT NULL,
	"name" varchar(50) NOT NULL,
	"category" varchar(25) NOT NULL,
	"position" integer NOT NULL,
	"color" varchar(25),
	"wip_limit" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by_user_id" integer,
	"updated_by_user_id" integer,
	CONSTRAINT "board_columns_project_id_id_unique" UNIQUE("project_id","id"),
	CONSTRAINT "board_columns_project_id_name_unique" UNIQUE("project_id","name")
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "comments_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"issue_id" integer NOT NULL,
	"author_id" integer NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by_user_id" integer,
	"updated_by_user_id" integer,
	CONSTRAINT "comments_issue_id_id_unique" UNIQUE("issue_id","id")
);
--> statement-breakpoint
CREATE TABLE "files" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "files_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"uploaded_by_user_id" integer NOT NULL,
	"bucket" varchar(100) NOT NULL,
	"storage_key" varchar(1024) NOT NULL CONSTRAINT "files_storage_key_unique" UNIQUE,
	"original_name" varchar(255) NOT NULL,
	"mime_type" varchar(255) NOT NULL,
	"size_bytes" bigint NOT NULL,
	"checksum_sha256" varchar(64),
	"width" integer,
	"height" integer,
	"duration_seconds" integer,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by_user_id" integer,
	"updated_by_user_id" integer
);
--> statement-breakpoint
CREATE TABLE "issue_assignees" (
	"issue_id" integer,
	"user_id" integer,
	"assigned_by_user_id" integer,
	"assigned_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by_user_id" integer,
	"updated_by_user_id" integer,
	CONSTRAINT "issue_assignees_issue_id_user_id_pk" PRIMARY KEY("issue_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "issue_types" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "issue_types_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"project_id" integer NOT NULL,
	"name" varchar(50) NOT NULL,
	"is_subtask" boolean DEFAULT false NOT NULL,
	"icon" varchar(50),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by_user_id" integer,
	"updated_by_user_id" integer,
	CONSTRAINT "issue_types_project_id_name_unique" UNIQUE("project_id","name")
);
--> statement-breakpoint
CREATE TABLE "issues" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "issues_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"project_id" integer NOT NULL,
	"status_type_key" varchar(25) DEFAULT 'ISSUE' NOT NULL,
	"status_key" varchar(25) DEFAULT 'ISSUE_ACTIVE' NOT NULL,
	"issue_number" integer NOT NULL,
	"type_id" integer NOT NULL,
	"parent_id" integer,
	"column_id" integer NOT NULL,
	"sprint_id" integer,
	"priority_id" integer,
	"reporter_id" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"start_at" timestamp with time zone,
	"due_at" timestamp with time zone,
	"resolved_at" timestamp with time zone,
	"estimate_minutes" integer,
	"story_points" integer,
	"board_position" double precision DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by_user_id" integer,
	"updated_by_user_id" integer,
	CONSTRAINT "issues_project_id_issue_number_unique" UNIQUE("project_id","issue_number"),
	CONSTRAINT "issues_project_id_id_unique" UNIQUE("project_id","id")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "notifications_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"recipient_id" integer NOT NULL,
	"actor_id" integer,
	"type" varchar(50) NOT NULL,
	"entity_type" varchar(50) NOT NULL,
	"entity_id" integer NOT NULL,
	"payload" jsonb DEFAULT '{}' NOT NULL,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by_user_id" integer,
	"updated_by_user_id" integer
);
--> statement-breakpoint
CREATE TABLE "priorities" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "priorities_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"project_id" integer,
	"name" varchar(50) NOT NULL,
	"level" integer NOT NULL,
	"color" varchar(20),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by_user_id" integer,
	"updated_by_user_id" integer,
	CONSTRAINT "priorities_project_id_name_unique" UNIQUE("project_id","name")
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "projects_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"owner_user_id" integer NOT NULL,
	"status_type_key" varchar(25) DEFAULT 'PROJECT' NOT NULL,
	"status_key" varchar(25) DEFAULT 'PROJECT_ACTIVE' NOT NULL,
	"team_id" integer,
	"project_key" varchar(10) NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" varchar(1000),
	"issue_counter" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by_user_id" integer,
	"updated_by_user_id" integer,
	CONSTRAINT "projects_owner_user_id_project_key_unique" UNIQUE("owner_user_id","project_key")
);
--> statement-breakpoint
CREATE TABLE "sprints" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "sprints_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"project_id" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	"goal" varchar(1000),
	"start_date" date,
	"end_date" date,
	"status" varchar(20) DEFAULT 'planned' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by_user_id" integer,
	"updated_by_user_id" integer,
	CONSTRAINT "sprints_project_id_id_unique" UNIQUE("project_id","id"),
	CONSTRAINT "sprints_project_id_name_unique" UNIQUE("project_id","name")
);
--> statement-breakpoint
CREATE TABLE "status_types" (
	"key" varchar(25) PRIMARY KEY,
	"name" varchar(100) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by_user_id" integer,
	"updated_by_user_id" integer
);
--> statement-breakpoint
CREATE TABLE "statuses" (
	"key" varchar(25) PRIMARY KEY,
	"status_type_key" varchar(25) NOT NULL,
	"name" varchar(100) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by_user_id" integer,
	"updated_by_user_id" integer,
	CONSTRAINT "statuses_status_type_key_key_unique" UNIQUE("status_type_key","key")
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "teams_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"owner_user_id" integer NOT NULL,
	"status_type_key" varchar(25) DEFAULT 'TEAM' NOT NULL,
	"status_key" varchar(25) DEFAULT 'TEAM_ACTIVE' NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by_user_id" integer,
	"updated_by_user_id" integer,
	CONSTRAINT "teams_owner_user_id_name_unique" UNIQUE("owner_user_id","name"),
	CONSTRAINT "teams_owner_user_id_id_unique" UNIQUE("owner_user_id","id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(50) NOT NULL,
	"email" varchar(30) NOT NULL UNIQUE,
	"password_hash" varchar(255) NOT NULL,
	"status_type_key" varchar(25) DEFAULT 'USER' NOT NULL,
	"status_key" varchar(25) DEFAULT 'USER_ACTIVE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by_user_id" integer,
	"updated_by_user_id" integer
);
--> statement-breakpoint
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_issue_id_issues_id_fkey" FOREIGN KEY ("issue_id") REFERENCES "issues"("id");--> statement-breakpoint
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_comment_id_comments_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "comments"("id");--> statement-breakpoint
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_file_id_files_id_fkey" FOREIGN KEY ("file_id") REFERENCES "files"("id");--> statement-breakpoint
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_uploaded_by_user_id_users_id_fkey" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_created_by_user_id_users_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_updated_by_user_id_users_id_fkey" FOREIGN KEY ("updated_by_user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_comment_issue_fk" FOREIGN KEY ("issue_id","comment_id") REFERENCES "comments"("issue_id","id");--> statement-breakpoint
ALTER TABLE "board_columns" ADD CONSTRAINT "board_columns_project_id_projects_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id");--> statement-breakpoint
ALTER TABLE "board_columns" ADD CONSTRAINT "board_columns_created_by_user_id_users_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "board_columns" ADD CONSTRAINT "board_columns_updated_by_user_id_users_id_fkey" FOREIGN KEY ("updated_by_user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_issue_id_issues_id_fkey" FOREIGN KEY ("issue_id") REFERENCES "issues"("id");--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_author_id_users_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_created_by_user_id_users_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_updated_by_user_id_users_id_fkey" FOREIGN KEY ("updated_by_user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_uploaded_by_user_id_users_id_fkey" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_created_by_user_id_users_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_updated_by_user_id_users_id_fkey" FOREIGN KEY ("updated_by_user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "issue_assignees" ADD CONSTRAINT "issue_assignees_issue_id_issues_id_fkey" FOREIGN KEY ("issue_id") REFERENCES "issues"("id");--> statement-breakpoint
ALTER TABLE "issue_assignees" ADD CONSTRAINT "issue_assignees_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "issue_assignees" ADD CONSTRAINT "issue_assignees_assigned_by_user_id_users_id_fkey" FOREIGN KEY ("assigned_by_user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "issue_assignees" ADD CONSTRAINT "issue_assignees_created_by_user_id_users_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "issue_assignees" ADD CONSTRAINT "issue_assignees_updated_by_user_id_users_id_fkey" FOREIGN KEY ("updated_by_user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "issue_types" ADD CONSTRAINT "issue_types_project_id_projects_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id");--> statement-breakpoint
ALTER TABLE "issue_types" ADD CONSTRAINT "issue_types_created_by_user_id_users_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "issue_types" ADD CONSTRAINT "issue_types_updated_by_user_id_users_id_fkey" FOREIGN KEY ("updated_by_user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "issues" ADD CONSTRAINT "issues_project_id_projects_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id");--> statement-breakpoint
ALTER TABLE "issues" ADD CONSTRAINT "issues_type_id_issue_types_id_fkey" FOREIGN KEY ("type_id") REFERENCES "issue_types"("id");--> statement-breakpoint
ALTER TABLE "issues" ADD CONSTRAINT "issues_column_id_board_columns_id_fkey" FOREIGN KEY ("column_id") REFERENCES "board_columns"("id");--> statement-breakpoint
ALTER TABLE "issues" ADD CONSTRAINT "issues_sprint_id_sprints_id_fkey" FOREIGN KEY ("sprint_id") REFERENCES "sprints"("id");--> statement-breakpoint
ALTER TABLE "issues" ADD CONSTRAINT "issues_priority_id_priorities_id_fkey" FOREIGN KEY ("priority_id") REFERENCES "priorities"("id");--> statement-breakpoint
ALTER TABLE "issues" ADD CONSTRAINT "issues_reporter_id_users_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "issues" ADD CONSTRAINT "issues_created_by_user_id_users_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "issues" ADD CONSTRAINT "issues_updated_by_user_id_users_id_fkey" FOREIGN KEY ("updated_by_user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "issues" ADD CONSTRAINT "issues_project_parent_fk" FOREIGN KEY ("project_id","parent_id") REFERENCES "issues"("project_id","id");--> statement-breakpoint
ALTER TABLE "issues" ADD CONSTRAINT "issues_project_column_fk" FOREIGN KEY ("project_id","column_id") REFERENCES "board_columns"("project_id","id");--> statement-breakpoint
ALTER TABLE "issues" ADD CONSTRAINT "issues_project_sprint_fk" FOREIGN KEY ("project_id","sprint_id") REFERENCES "sprints"("project_id","id");--> statement-breakpoint
ALTER TABLE "issues" ADD CONSTRAINT "issues_status_fk" FOREIGN KEY ("status_type_key","status_key") REFERENCES "statuses"("status_type_key","key");--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipient_id_users_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_actor_id_users_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_created_by_user_id_users_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_updated_by_user_id_users_id_fkey" FOREIGN KEY ("updated_by_user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "priorities" ADD CONSTRAINT "priorities_project_id_projects_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id");--> statement-breakpoint
ALTER TABLE "priorities" ADD CONSTRAINT "priorities_created_by_user_id_users_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "priorities" ADD CONSTRAINT "priorities_updated_by_user_id_users_id_fkey" FOREIGN KEY ("updated_by_user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_owner_user_id_users_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_created_by_user_id_users_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_updated_by_user_id_users_id_fkey" FOREIGN KEY ("updated_by_user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_owner_team_fk" FOREIGN KEY ("owner_user_id","team_id") REFERENCES "teams"("owner_user_id","id");--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_status_fk" FOREIGN KEY ("status_type_key","status_key") REFERENCES "statuses"("status_type_key","key");--> statement-breakpoint
ALTER TABLE "sprints" ADD CONSTRAINT "sprints_project_id_projects_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id");--> statement-breakpoint
ALTER TABLE "sprints" ADD CONSTRAINT "sprints_created_by_user_id_users_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "sprints" ADD CONSTRAINT "sprints_updated_by_user_id_users_id_fkey" FOREIGN KEY ("updated_by_user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "status_types" ADD CONSTRAINT "status_types_created_by_user_id_users_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "status_types" ADD CONSTRAINT "status_types_updated_by_user_id_users_id_fkey" FOREIGN KEY ("updated_by_user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "statuses" ADD CONSTRAINT "statuses_status_type_key_status_types_key_fkey" FOREIGN KEY ("status_type_key") REFERENCES "status_types"("key");--> statement-breakpoint
ALTER TABLE "statuses" ADD CONSTRAINT "statuses_created_by_user_id_users_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "statuses" ADD CONSTRAINT "statuses_updated_by_user_id_users_id_fkey" FOREIGN KEY ("updated_by_user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_owner_user_id_users_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_created_by_user_id_users_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_updated_by_user_id_users_id_fkey" FOREIGN KEY ("updated_by_user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_status_fk" FOREIGN KEY ("status_type_key","status_key") REFERENCES "statuses"("status_type_key","key");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_created_by_user_id_users_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_updated_by_user_id_users_id_fkey" FOREIGN KEY ("updated_by_user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_status_fk" FOREIGN KEY ("status_type_key","status_key") REFERENCES "statuses"("status_type_key","key");