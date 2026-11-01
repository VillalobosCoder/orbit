DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "projects" WHERE length("name") > 25)
    OR EXISTS (SELECT 1 FROM "projects" WHERE length("description") > 255) THEN
    RAISE EXCEPTION 'Hay proyectos con nombre de más de 25 caracteres o descripción de más de 255; acórtalos antes de migrar.';
  END IF;
END $$;--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "name" SET DATA TYPE varchar(25) USING "name"::varchar(25);--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "description" SET DATA TYPE varchar(255) USING "description"::varchar(255);