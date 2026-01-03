CREATE TABLE "mentor_availability" (
	"id" text PRIMARY KEY NOT NULL,
	"mentor_id" text NOT NULL,
	"day_of_week" integer NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL,
	"duration" integer NOT NULL,
	"time_break" integer DEFAULT 5 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "mentor_availability" ADD CONSTRAINT "mentor_availability_mentor_id_mentor_profile_id_fk" FOREIGN KEY ("mentor_id") REFERENCES "public"."mentor_profile"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "mentorAvailability_mentorId_idx" ON "mentor_availability" USING btree ("mentor_id");--> statement-breakpoint
CREATE INDEX "mentorAvailability_day_idx" ON "mentor_availability" USING btree ("day_of_week");