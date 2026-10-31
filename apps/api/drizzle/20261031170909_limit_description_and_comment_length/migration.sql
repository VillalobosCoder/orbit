DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "comments" WHERE length("body") > 255)
    OR EXISTS (SELECT 1 FROM "issues" WHERE length("description") > 255) THEN
    RAISE EXCEPTION 'Hay comentarios o descripciones de más de 255 caracteres; acórtalos antes de migrar.';
  END IF;
END $$;--> statement-breakpoint
ALTER TABLE "comments" ALTER COLUMN "body" SET DATA TYPE varchar(255) USING "body"::varchar(255);--> statement-breakpoint
ALTER TABLE "issues" ALTER COLUMN "description" SET DATA TYPE varchar(255) USING "description"::varchar(255);