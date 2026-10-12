CREATE TABLE `content_checks` (
	`id` text PRIMARY KEY NOT NULL,
	`checked` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `import_receipts` (
	`id` text PRIMARY KEY NOT NULL,
	`user` text NOT NULL,
	`sources` text NOT NULL,
	`created` text NOT NULL
);
