# Recipe Commons

Public recipe discovery and shared recipe storage, with signed-in personal collections, private folders and notes, recipe customization, revision history, moderation, and AI-assisted importing.

## Runtime

Vinext + React on Sites/Cloudflare Workers; D1 structured data with Drizzle schema/migrations. Sites supplies public routing and ChatGPT sign-in. Runtime keys: OPENAI_API_KEY (secret), OPENAI_MODEL (defaults to gpt-5-mini), ADMIN_EMAIL (configured privately by the owner).

The launch database is intentionally empty. Uploads are processed for extraction, then only the reviewed recipe and source label are stored. Raw PDFs/photos are not stored in this app's database or public catalog. AI requests use store:false; this is not a claim about the provider's separate retention policies.

## Imports

Website import prefers Schema.org Recipe JSON-LD, then readable page text. YouTube import tries accessible description text and linked recipe pages. Unavailable/blocked sources use pasted-text or transcript fallback. PDF (10 MB maximum) and JPG/PNG/WebP (5 MB maximum) are supported via file input. A target title/page helps select a recipe from multi-recipe PDFs. Unclear handwriting and ambiguous data require review. The owner-configured OpenAI API powers interpretation. Each signed-in account has a 20-import daily allowance; manual entry remains available.

## Recipe correctness

Ingredient amounts are canonical original values. Steps store ingredient references and amount allocations. Rendered steps and lists derive from the same selected serving count. Consistency checks reject missing values, unlinked ingredients, or allocation totals that differ from the ingredient list. Human review is required before publication. Conversion references are included in AGENTS.md and displayed for approximate density conversions.

## Local development

Use the Sites skill for dependency installation, builds, packaging, and publishing. The starter helpers require Node >=22.13 and npm on PATH. `npm run dev` starts local Vinext. The starter's loopback-only mock sign-in is omitted from production. Build, then apply pending SQL migrations locally using `node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/<pending>.sql`.

See AGENTS.md for maintenance requirements and verification commands. Never point integration.mjs at the public Site; it creates disposable local test records.

## Ratings, privacy, and safeguards

Recipes use 1–5 stars with signed-in, self-reported cooking confirmation and one active rating per account. Ratings survive edits; prior-revision cooking detail changes trigger a notice. Current collector counts exclude the contributor and count unique saved references. Highest-rated sorting puts five-or-more-rating recipes first. Customized recipes default to private and require explicit publication. Public variations with prior external saves/ratings are protected from contributor visibility reversal/deletion.

Administrators may edit any entry and recoverably delete it, retaining history/references and restoring its original visibility. Admins do not publish another creator's private recipe. Rating removals require a reason and retain an audit event. Removed users may submit a rating again; removal is not a ban.

Server-side offensive-language and link screening runs on imports and every recipe save, including private drafts. It combines lexical/obfuscation checks with a custom OpenAI structured classifier. Unchecked content is rejected if screening fails. A short-lived cache stores only approved content hashes. Import receipts bind provenance to the importing account and prevent normal save requests from stripping or swapping original attribution; matching content can recover a stripped receipt reference. Recipe text links must match attributed source hostnames, with www aliases normalized; other subdomains are not automatically trusted. Imported original URLs appear at the recipe bottom. Automated moderation is a safeguard, not proof that all offensive meaning is detectable.

## Public source backup

This repository contains the source snapshot of Recipe Commons. Credentials, local runtime state, database contents, uploads, build output, and Sites Git credential history are excluded. Supply OPENAI_API_KEY through ignored local environment files or Sites runtime secrets; never commit its value. The live Site remains https://recipe-commons.mdearmon.chatgpt.site/.
