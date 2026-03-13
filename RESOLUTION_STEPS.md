# Fix for 500 Errors on activity_logs and posts Endpoints

## Root Cause
The recent security migration (`20260313000000_fix_security_vulnerabilities.sql`) created RLS policies that require authentication and admin role, but:
- The `admin_users` table is **empty** - no admin users are configured
- The admin dashboard is trying to fetch activity logs and all posts without proper admin setup

## Solution

### 1. Apply the RLS Policy Fix (NEW MIGRATION)
The new migration file `supabase/migrations/20260313110000_fix_rls_policies.sql` has been created with corrected RLS policy syntax. It will be applied automatically when you run:

```bash
npx supabase db push
```

Or in your Supabase dashboard, go to SQL Editor and run the contents of `supabase/migrations/20260313110000_fix_rls_policies.sql`.

### 2. Add Your User as an Admin (CRITICAL)

**You MUST do this or admin pages will still fail.**

#### Option A: Via Supabase Dashboard (Recommended)
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **SQL Editor** (side panel)
4. Run this query (**REPLACE** `YOUR_USER_ID` with your actual ID):

```sql
-- First, find your user ID by running this query:
SELECT id, email FROM auth.users LIMIT 10;

-- Then copy your UUID and run:
INSERT INTO public.admin_users (user_id) 
VALUES ('YOUR_USER_ID'::uuid)
ON CONFLICT(user_id) DO NOTHING;

-- Verify it worked:
SELECT * FROM public.admin_users;
```

#### Option B: Find Your User ID
1. In Supabase Dashboard, go to **Authentication** → **Users**
2. Find your user and click on it
3. Copy the UUID from the "ID" field
4. Replace `YOUR_USER_ID` in the SQL above

### 3. Test the Fix
After applying the migration and adding your user as admin:

1. Refresh your browser
2. Go to Admin Dashboard → Activity Logs
3. The 500 errors should be gone

## What Was Fixed

### RLS Policy Changes
- **Posts**: Now properly allows unauthenticated public reads of published posts
- **Activity Logs**: Only admins can read (after being added to admin_users table)
- **Admin Checks**: Using `EXISTS` subquery instead of `IN` for better performance

### Code Changes
- [src/lib/api.ts](src/lib/api.ts) - Added auth check in `fetchActivityLogs()` for clarity

## Database Relationships
```
auth.users (Supabase Auth)
    ↓ (references)
admin_users (tracks who is admin)
    ↓ (referenced by)
Activity Logs RLS Policy (only show to admins)
```

## Troubleshooting

If 500 errors persist:
1. Check that `admin_users` table has your user ID: `SELECT * FROM public.admin_users;`
2. Verify the migration ran: `SELECT * FROM pgsql_migrations;` (in Supabase)
3. Check Supabase logs for actual error messages
4. Try logging out and back in
5. Clear browser cache

## Files Changed
- ✅ `supabase/migrations/20260313110000_fix_rls_policies.sql` (new)
- ✅ `src/lib/api.ts` (updated fetchActivityLogs)
