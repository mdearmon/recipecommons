DROP INDEX `recipe_content_status_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `recipe_published_content_unique` ON `recipes` (`fingerprint`) WHERE "recipes"."status" = 'published';