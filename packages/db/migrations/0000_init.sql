CREATE TABLE IF NOT EXISTS "contributions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"member_id" uuid NOT NULL,
	"stokvel_id" uuid NOT NULL,
	"amount_cents" integer NOT NULL,
	"month" text NOT NULL,
	"status" text NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "members" (
	"id" uuid PRIMARY KEY NOT NULL,
	"stokvel_id" uuid NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"joined_at" text NOT NULL,
	CONSTRAINT "members_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" bigint NOT NULL,
	"last_seen_at" bigint NOT NULL,
	"ua_fingerprint" text NOT NULL,
	"session_key" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "stokvels" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"rules" text NOT NULL,
	"monthly_target_cents" integer NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "contributions" ADD CONSTRAINT "contributions_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "contributions" ADD CONSTRAINT "contributions_stokvel_id_stokvels_id_fk" FOREIGN KEY ("stokvel_id") REFERENCES "public"."stokvels"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "members" ADD CONSTRAINT "members_stokvel_id_stokvels_id_fk" FOREIGN KEY ("stokvel_id") REFERENCES "public"."stokvels"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
