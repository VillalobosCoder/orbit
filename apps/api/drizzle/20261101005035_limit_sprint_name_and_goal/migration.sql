DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "sprints" WHERE length("name") > 25)
    OR EXISTS (SELECT 1 FROM "sprints" WHERE length("goal") > 255) THEN
    RAISE EXCEPTION 'Hay sprints con nombre de más de 25 caracteres u objetivo de más de 255; acórtalos antes de migrar.';
  END IF;
END $$;--> statement-breakpoint
ALTER TABLE "sprints" ALTER COLUMN "name" SET DATA TYPE varchar(25) USING "name"::varchar(25);--> statement-breakpoint
ALTER TABLE "sprints" ALTER COLUMN "goal" SET DATA TYPE varchar(255) USING "goal"::varchar(255);