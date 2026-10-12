CREATE TABLE `rating_events` (
	`id` text PRIMARY KEY NOT NULL,
	`user` text NOT NULL,
	`recipe` text NOT NULL,
	`actor` text NOT NULL,
	`action` text NOT NULL,
	`score` integer,
	`revision` integer NOT NULL,
	`reason` text NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `ratings` (
	`user` text NOT NULL,
	`recipe` text NOT NULL,
	`score` integer NOT NULL,
	`revision` integer NOT NULL,
	`fingerprint` text NOT NULL,
	`removed` integer DEFAULT 0 NOT NULL,
	`created` text NOT NULL,
	`updated` text NOT NULL,
	PRIMARY KEY(`user`, `recipe`)
);
--> statement-breakpoint
ALTER TABLE `recipes` ADD `public_dependencies` integer DEFAULT 0 NOT NULL;