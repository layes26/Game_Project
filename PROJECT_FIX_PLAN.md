# Project Structure Fix Plan

## Issue Analysis
- **Inconsistent Auth Store Usage**: `header.tsx` imports from `auth-mock` while `login/page.tsx` and `auth-provider.tsx` import from `auth` (real Firebase)

## Plan for Fixing Project Structure

### Step 1: Fix Header Auth Import
- Update `frontend/components/layout/header.tsx` to import `useAuthStore` from `@/stores/auth` instead of `auth-mock`

### Step 2: Remove/Delete Mock Auth Store  
- Delete `frontend/stores/auth-mock.ts` since we're using real Firebase auth

### Step 3: Run the Project
- Start the backend Node.js server
- Start the frontend Next.js development server
- Verify the project runs correctly

## Files to Edit
1. `frontend/components/layout/header.tsx` - Change import from `auth-mock` to `auth`

## Files to Delete
1. `frontend/stores/auth-mock.ts` - Mock auth implementation (no longer needed)

## After Fix
The project will have:
- Consistent auth store usage throughout (`auth.ts` with real Firebase)
- Proper Firebase authentication integration
- Working frontend and backend communication

