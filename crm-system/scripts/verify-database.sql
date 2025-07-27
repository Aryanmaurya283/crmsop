-- CRM Database Verification Script
-- Run this in Supabase SQL Editor to verify your database setup

-- 1. Check all tables exist
SELECT 'TABLES CHECK' as check_type, 
       COUNT(*) as count,
       CASE 
         WHEN COUNT(*) >= 20 THEN '✅ PASS' 
         ELSE '❌ FAIL - Missing tables' 
       END as status
FROM information_schema.tables 
WHERE table_schema = 'public';

-- 2. List all tables
SELECT 'TABLE LIST' as info, table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 3. Check default roles
SELECT 'ROLES CHECK' as check_type,
       COUNT(*) as count,
       CASE 
         WHEN COUNT(*) >= 6 THEN '✅ PASS' 
         ELSE '❌ FAIL - Missing roles' 
       END as status
FROM roles;

-- 4. List all roles
SELECT 'ROLE LIST' as info, name, description 
FROM roles 
ORDER BY name;

-- 5. Check lead sources
SELECT 'LEAD SOURCES CHECK' as check_type,
       COUNT(*) as count,
       CASE 
         WHEN COUNT(*) >= 10 THEN '✅ PASS' 
         ELSE '❌ FAIL - Missing lead sources' 
       END as status
FROM lead_sources;

-- 6. List lead sources
SELECT 'LEAD SOURCE LIST' as info, name, category 
FROM lead_sources 
ORDER BY name;

-- 7. Check database functions
SELECT 'FUNCTIONS CHECK' as check_type,
       COUNT(*) as count,
       CASE 
         WHEN COUNT(*) >= 13 THEN '✅ PASS' 
         ELSE '❌ FAIL - Missing functions' 
       END as status
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_type = 'FUNCTION';

-- 8. List all functions
SELECT 'FUNCTION LIST' as info, routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_type = 'FUNCTION'
ORDER BY routine_name;

-- 9. Check RLS is enabled
SELECT 'RLS CHECK' as check_type,
       COUNT(*) as tables_with_rls,
       CASE 
         WHEN COUNT(*) >= 15 THEN '✅ PASS' 
         ELSE '❌ FAIL - RLS not enabled on all tables' 
       END as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true;

-- 10. List tables with RLS
SELECT 'RLS STATUS' as info, tablename, 
       CASE WHEN rowsecurity THEN '✅ Enabled' ELSE '❌ Disabled' END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- 11. Test basic queries
SELECT 'BASIC QUERIES TEST' as test_type, '✅ Database is accessible' as status;

-- 12. Check lead scoring rules
SELECT 'SCORING RULES CHECK' as check_type,
       COUNT(*) as count,
       CASE 
         WHEN COUNT(*) >= 10 THEN '✅ PASS' 
         ELSE '❌ FAIL - Missing scoring rules' 
       END as status
FROM lead_scoring_rules;

-- 13. Summary
SELECT 'SETUP SUMMARY' as summary,
       'Database verification complete. Check all items above for ✅ PASS status.' as message;

-- If you see any ❌ FAIL status above, you need to run the corresponding migrations.