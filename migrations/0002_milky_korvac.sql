ALTER TABLE "mentor_profile" ADD COLUMN "username" text;--> statement-breakpoint
ALTER TABLE "mentor_profile" ADD CONSTRAINT "mentor_profile_user_id_unique" UNIQUE("user_id");--> statement-breakpoint
-- Generate unique usernames from existing names (convert to snake_case and add random suffix if needed)
DO $$
DECLARE
    profile_record RECORD;
    base_username text;
    final_username text;
    counter integer;
BEGIN
    FOR profile_record IN SELECT id, name FROM "mentor_profile" WHERE username IS NULL LOOP
        base_username := lower(trim(regexp_replace(profile_record.name, '[^a-zA-Z0-9\s]', '', 'g')));
        base_username := regexp_replace(base_username, '\s+', '_', 'g');
        final_username := base_username;
        counter := 1;

        -- Ensure uniqueness by adding a suffix if needed
        WHILE EXISTS (SELECT 1 FROM "mentor_profile" WHERE username = final_username) LOOP
            final_username := base_username || '_' || counter;
            counter := counter + 1;
        END LOOP;

        UPDATE "mentor_profile" SET username = final_username WHERE id = profile_record.id;
    END LOOP;
END $$;
--> statement-breakpoint
ALTER TABLE "mentor_profile" ALTER COLUMN "username" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "mentor_profile" ADD CONSTRAINT "mentor_profile_username_unique" UNIQUE("username");