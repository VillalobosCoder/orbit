DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "issues" WHERE length("title") > 50) THEN
    RAISE EXCEPTION 'Hay issues con título de más de 50 caracteres; acórtalos antes de migrar.';
  END IF;
END $$;--> statement-breakpoint
ALTER TABLE "issues" ALTER COLUMN "title" SET DATA TYPE varchar(50) USING "title"::varchar(50);