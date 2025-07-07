-- Add 'user' role to Role table
INSERT INTO "Role" (id, name, description, "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'user', 'Regular user with limited permissions', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (name) DO NOTHING;

-- Get the ID of the newly created 'user' role
WITH user_role AS (
  SELECT id FROM "Role" WHERE name = 'user' LIMIT 1
)
-- Update the users to have the 'user' role
UPDATE "User"
SET "roleId" = (SELECT id FROM user_role)
WHERE email IN ('editor@example.com', 'viewer@example.com', 'developer@example.com');
