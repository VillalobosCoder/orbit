CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(50) NOT NULL,
	"email" varchar(30) NOT NULL UNIQUE,
	"password" varchar(255) NOT NULL,
	"statusId" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"userCreated" integer,
	"modified_at" timestamp DEFAULT now() NOT NULL,
	"userModified" integer
);
