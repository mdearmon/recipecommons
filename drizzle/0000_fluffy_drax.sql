CREATE TABLE `collections` (
	`user` text NOT NULL,
	`recipe` text NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`servings` integer DEFAULT 4 NOT NULL,
	`seen` integer DEFAULT 1 NOT NULL,
	PRIMARY KEY(`user`, `recipe`)
);
--> statement-breakpoint
CREATE TABLE `folder_items` (
	`folder` text NOT NULL,
	`recipe` text NOT NULL,
	PRIMARY KEY(`folder`, `recipe`)
);
--> statement-breakpoint
CREATE TABLE `folders` (
	`id` text PRIMARY KEY NOT NULL,
	`user` text NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `recipes` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`contributor` text NOT NULL,
	`name` text NOT NULL,
	`name_key` text NOT NULL,
	`source` text,
	`source_key` text,
	`fingerprint` text NOT NULL,
	`parent` text,
	`parent_revision` integer,
	`status` text NOT NULL,
	`revision` integer DEFAULT 1 NOT NULL,
	`data` text NOT NULL,
	`created` text NOT NULL,
	`updated` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `recipe_name_unique` ON `recipes` (`name_key`);--> statement-breakpoint
CREATE TABLE `reports` (
	`id` text PRIMARY KEY NOT NULL,
	`user` text NOT NULL,
	`recipe` text NOT NULL,
	`reason` text NOT NULL,
	`details` text NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `revisions` (
	`id` text PRIMARY KEY NOT NULL,
	`recipe` text NOT NULL,
	`version` integer NOT NULL,
	`data` text NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `usage` (
	`user` text NOT NULL,
	`day` text NOT NULL,
	`count` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`user`, `day`)
);
