CREATE TABLE "booking" (
	"id" text PRIMARY KEY NOT NULL,
	"booking_session_id" text NOT NULL,
	"mentee_id" text NOT NULL,
	"mentor_id" text NOT NULL,
	"scheduled_at" timestamp NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"payment_tx_hash" text,
	"payment_amount" text,
	"token" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "booking_session" (
	"id" text PRIMARY KEY NOT NULL,
	"mentor_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"type" text NOT NULL,
	"token" text NOT NULL,
	"price" text,
	"duration" integer NOT NULL,
	"time_break" integer DEFAULT 5 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mentor_profile" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"bio" text,
	"professional_field" text NOT NULL,
	"timezone" text DEFAULT 'UTC' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_booking_session_id_booking_session_id_fk" FOREIGN KEY ("booking_session_id") REFERENCES "public"."booking_session"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_mentee_id_user_id_fk" FOREIGN KEY ("mentee_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_mentor_id_mentor_profile_id_fk" FOREIGN KEY ("mentor_id") REFERENCES "public"."mentor_profile"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_session" ADD CONSTRAINT "booking_session_mentor_id_mentor_profile_id_fk" FOREIGN KEY ("mentor_id") REFERENCES "public"."mentor_profile"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mentor_profile" ADD CONSTRAINT "mentor_profile_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "booking_menteeId_idx" ON "booking" USING btree ("mentee_id");--> statement-breakpoint
CREATE INDEX "booking_mentorId_idx" ON "booking" USING btree ("mentor_id");--> statement-breakpoint
CREATE INDEX "booking_sessionId_idx" ON "booking" USING btree ("booking_session_id");--> statement-breakpoint
CREATE INDEX "booking_status_idx" ON "booking" USING btree ("status");--> statement-breakpoint
CREATE INDEX "bookingSession_mentorId_idx" ON "booking_session" USING btree ("mentor_id");--> statement-breakpoint
CREATE INDEX "bookingSession_type_idx" ON "booking_session" USING btree ("type");--> statement-breakpoint
CREATE INDEX "mentorProfile_userId_idx" ON "mentor_profile" USING btree ("user_id");