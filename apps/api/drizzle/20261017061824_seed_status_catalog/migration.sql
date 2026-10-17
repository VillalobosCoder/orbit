INSERT INTO "status_types" ("key", "name")
VALUES
  ('USER', 'User'),
  ('TEAM', 'Team'),
  ('PROJECT', 'Project'),
  ('ISSUE', 'Issue')
ON CONFLICT ("key") DO NOTHING;
--> statement-breakpoint
INSERT INTO "statuses" ("key", "status_type_key", "name")
VALUES
  ('USER_ACTIVE', 'USER', 'Active'),
  ('USER_PENDING', 'USER', 'Pending'),
  ('USER_SUSPENDED', 'USER', 'Suspended'),
  ('USER_DELETED', 'USER', 'Deleted'),
  ('TEAM_ACTIVE', 'TEAM', 'Active'),
  ('TEAM_ARCHIVED', 'TEAM', 'Archived'),
  ('TEAM_DELETED', 'TEAM', 'Deleted'),
  ('PROJECT_ACTIVE', 'PROJECT', 'Active'),
  ('PROJECT_ARCHIVED', 'PROJECT', 'Archived'),
  ('PROJECT_DELETED', 'PROJECT', 'Deleted'),
  ('ISSUE_ACTIVE', 'ISSUE', 'Active'),
  ('ISSUE_DELETED', 'ISSUE', 'Deleted')
ON CONFLICT ("key") DO NOTHING;