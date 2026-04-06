-- ─── Row Level Security — User Data Isolation ────────────────────────────────
--
-- Purpose: Defense-in-depth. The application layer already scopes all queries
-- by userId. These policies ensure that even if the application layer is
-- bypassed (e.g. direct DB access with an anon key), users can only read and
-- write their own rows.
--
-- How it works:
--   auth.uid() returns the Supabase Auth UUID for the current session.
--   The "User" table maps supabaseId → internal id.
--   We join through "User" to match the auth context to the app's userId.
--
-- Note: ADMIN users bypass RLS for support purposes via service_role key only.
-- The app never uses the service_role key in runtime requests.
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── Enable RLS on all user-owned tables ─────────────────────────────────────

ALTER TABLE "Item"           ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Sale"           ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AdditionalCost" ENABLE ROW LEVEL SECURITY;

-- ─── Helper: resolve current Supabase user → internal userId ─────────────────

CREATE OR REPLACE FUNCTION current_user_id()
RETURNS TEXT
LANGUAGE sql
STABLE
AS $$
  SELECT id FROM "User" WHERE "supabaseId" = auth.uid()::text LIMIT 1;
$$;

-- ─── Item policies ────────────────────────────────────────────────────────────

CREATE POLICY "Users can view their own items"
  ON "Item" FOR SELECT
  USING ("userId" = current_user_id());

CREATE POLICY "Users can insert their own items"
  ON "Item" FOR INSERT
  WITH CHECK ("userId" = current_user_id());

CREATE POLICY "Users can update their own items"
  ON "Item" FOR UPDATE
  USING ("userId" = current_user_id());

CREATE POLICY "Users can delete their own items"
  ON "Item" FOR DELETE
  USING ("userId" = current_user_id());

-- ─── Sale policies ────────────────────────────────────────────────────────────
-- Sales are linked to items, which are linked to users. We join through Item.

CREATE POLICY "Users can view sales on their own items"
  ON "Sale" FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "Item"
      WHERE "Item"."id" = "Sale"."itemId"
        AND "Item"."userId" = current_user_id()
    )
  );

CREATE POLICY "Users can insert sales on their own items"
  ON "Sale" FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "Item"
      WHERE "Item"."id" = "Sale"."itemId"
        AND "Item"."userId" = current_user_id()
    )
  );

-- ─── AdditionalCost policies ──────────────────────────────────────────────────

CREATE POLICY "Users can view costs on their own items"
  ON "AdditionalCost" FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "Item"
      WHERE "Item"."id" = "AdditionalCost"."itemId"
        AND "Item"."userId" = current_user_id()
    )
  );

CREATE POLICY "Users can insert costs on their own items"
  ON "AdditionalCost" FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "Item"
      WHERE "Item"."id" = "AdditionalCost"."itemId"
        AND "Item"."userId" = current_user_id()
    )
  );

CREATE POLICY "Users can update costs on their own items"
  ON "AdditionalCost" FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM "Item"
      WHERE "Item"."id" = "AdditionalCost"."itemId"
        AND "Item"."userId" = current_user_id()
    )
  );

CREATE POLICY "Users can delete costs on their own items"
  ON "AdditionalCost" FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM "Item"
      WHERE "Item"."id" = "AdditionalCost"."itemId"
        AND "Item"."userId" = current_user_id()
    )
  );
