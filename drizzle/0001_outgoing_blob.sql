CREATE UNIQUE INDEX `recipe_content_status_unique` ON `recipes` (`fingerprint`,`status`);--> statement-breakpoint
CREATE UNIQUE INDEX `recipe_revision_unique` ON `revisions` (`recipe`,`version`);