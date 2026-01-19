# TestSprite Execution Guide
**Complete Testing & Validation Protocol for Gaming Store**

**Generated:** January 19, 2026  
**Status:** Ready for Execution  
**Estimated Time:** 1-2 hours (depending on environment setup)

---

## Overview

This guide walks you through executing the **TestSprite AI Testing Protocol** on your Gaming Store application. TestSprite is an autonomous testing methodology that verifies, fixes, and validates your entire software stack.

### What This Testing Covers

✅ **Environment Validation** - Node.js, npm, databases  
✅ **Dependency Integrity** - Package versions and compatibility  
✅ **API Contracts** - Frontend-Backend communication agreements  
✅ **Authentication Flows** - User registration, login, token management  
✅ **Database Connectivity** - MongoDB and Firebase integration  
✅ **End-to-End Journeys** - Complete user workflows  
✅ **Security Checklist** - Vulnerability scanning  

---

## Phase 1: Pre-Test Setup (20-30 minutes)

### Step 1.1: Verify Node.js Environment

```powershell
# Check versions
node --version    # Should be v16+, you have v24.13.0 ✅
npm --version     # Should be v7+, you have v11.6.2 ✅

# Install/Update npm packages
cd backend_node
npm install

cd ../frontend
npm install

cd ..
```

### Step 1.2: Configure Backend Environment

```powershell
# Navigate to backend
cd backend_node

# Copy example to actual .env (if not exists)
# On Windows, use:
type .env.example > .env

# Edit .env with your actual credentials
# Open with: notepad .env
```

**Required configurations in `backend_node/.env`:**

```env
# Database (choose one option)
# Option 1: Local MongoDB
MONGODB_URI=mongodb://localhost:27017/gaming-store

# Option 2: MongoDB Atlas (cloud)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/gaming-store

# Firebase Admin SDK (get from Firebase Console)
FIREBASE_PROJECT_ID=your-project-id-here
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nYourKeyHere\n-----END PRIVATE KEY-----\n
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxx@your-project.iam.gserviceaccount.com

# Server
NODE_ENV=development
PORT=3001

# CORS
CORS_ORIGIN=http://localhost:3000
```

**How to get Firebase credentials:**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Click ⚙️ Settings → Service Accounts
4. Click "Generate New Private Key"
5. Download JSON file
6. Copy the values to .env

### Step 1.3: Configure Frontend Environment

```powershell
# Navigate to frontend
cd frontend

# Check if .env.local exists
# If not, copy from example:
type .env.local.example > .env.local
```

**Required configurations in `frontend/.env.local`:**

```env
# API Backend
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Firebase (get from Firebase Console)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

**How to get Firebase Web Config:**
1. Firebase Console → Project Settings → General
2. Scroll to "Your apps" section
3. Click on your web app
4. Copy the firebaseConfig

### Step 1.4: Verify Database Setup

**Option A: MongoDB Local**
```powershell
# Install MongoDB Community Edition
# From: https://www.mongodb.com/try/download/community

# Start MongoDB
mongod

# In another terminal, verify connection
mongo
> show dbs
# Should see list of databases
```

**Option B: MongoDB Atlas (Cloud)**
```
1. Create free account at https://www.mongodb.com/cloud/atlas
2. Create cluster
3. Create database user
4. Get connection string
5. Add to .env as MONGODB_URI
```

### Step 1.5: Start Services

**Terminal 1 - Backend:**
```powershell
cd backend_node
npm run dev

# Expected output:
# ✓ Express server running on port 3001
# ✓ MongoDB connected
# ✓ Firebase initialized
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm run dev

# Expected output:
# ✓ Next.js app running on http://localhost:3000
# ✓ Ready to accept connections
```

**Terminal 3 - TestSprite Validation:**
```powershell
cd (Game_Project folder)
node scripts/testsprite-validation.js
```

---

## Phase 2: Run Automated Validation Tests

### Step 2.1: Execute TestSprite Validation Script

```powershell
node scripts/testsprite-validation.js
```

**Expected Output:**

```
🚀 TestSprite Validation Suite Starting...
🎯 Testing Backend: http://localhost:3001/api

📋 TEST SUITE 1: Environment & Configuration
✅ PASS: Backend .env file exists
✅ PASS: Frontend .env.local file exists
✅ PASS: Node.js version compatible: v24.13.0

🔧 TEST SUITE 2: Backend API Contract
✅ PASS: Backend server running and responding
✅ PASS: Products API endpoint functional
✅ PASS: Categories API endpoint functional
✅ PASS: Register endpoint accepts POST with Bearer token

... [more tests] ...

📊 Summary:
  ✅ Passed:   45
  ❌ Failed:   0
  ⚠️  Warnings: 5
  ⏭️  Skipped:  0

📈 Pass Rate: 90.0% (45/50)

🎉 Status: READY FOR LOCAL TESTING
```

---

## Phase 3: Manual Integration Testing

### Test 3.1: User Registration Flow

```
1. Open http://localhost:3000 in browser
2. Click "Register" or "Sign Up"
3. Enter:
   - Email: test@example.com
   - Username: testuser
   - First Name: Test
   - Last Name: User
   - Password: Password123
4. Click Submit

Expected:
✅ Account created
✅ Redirected to login or dashboard
✅ User profile in MongoDB
✅ Firebase Auth user created
```

### Test 3.2: User Login Flow

```
1. Go to http://localhost:3000/login
2. Enter registered email & password
3. Click Login

Expected:
✅ Authenticated successfully
✅ Token stored in localStorage
✅ Redirected to home page
✅ User menu shows in header
```

### Test 3.3: Browse Products Flow

```
1. Navigate to /products
2. Browse product list
3. Click on a product

Expected:
✅ Products load from API
✅ Product details display
✅ "Add to Cart" button visible
✅ Ratings and reviews show
```

### Test 3.4: Shopping Cart Flow

```
1. From product page, click "Add to Cart"
2. Select quantity and options
3. Click "Add"

Expected:
✅ Item added to cart
✅ Cart count updates in header
✅ Cart persists (refresh page, item still there)
✅ Cart total recalculates
```

### Test 3.5: Checkout Flow

```
1. Go to /cart
2. Review items
3. Click "Proceed to Checkout"
4. Enter billing info (or skip for guest)
5. Select payment method
6. Click "Place Order"

Expected:
✅ Order created in database
✅ Order number generated
✅ Payment page loads (or error if payment not configured)
✅ Order visible in /orders (if authenticated)
```

### Test 3.6: Guest Checkout Flow

```
1. Without logging in, add items to cart
2. Go to checkout
3. Fill in billing info as guest
4. Select payment method
5. Submit

Expected:
✅ Guest order created (no user ID required)
✅ Order confirmation
✅ No need to create account
```

---

## Phase 4: API Testing (cURL Commands)

### Test 4.1: Test Health Check

```powershell
curl http://localhost:3001/health

Expected Response:
{ "status": "ok", "timestamp": "2026-01-19T10:30:00Z" }
```

### Test 4.2: Test Products API

```powershell
curl http://localhost:3001/api/products

Expected Response:
{
  "success": true,
  "data": {
    "products": [...],
    "pagination": {...}
  }
}
```

### Test 4.3: Test Categories API

```powershell
curl http://localhost:3001/api/categories

Expected Response:
{
  "success": true,
  "data": {
    "categories": [...]
  }
}
```

### Test 4.4: Test Authentication Register

```powershell
# First get ID token from Firebase (in browser console):
# firebase.auth().currentUser.getIdToken()

# Then call:
curl -X POST http://localhost:3001/api/auth/register `
  -H "Authorization: Bearer YOUR_ID_TOKEN" `
  -H "Content-Type: application/json" `
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "firstName": "Test",
    "lastName": "User"
  }'

Expected Response:
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": { ... },
    "token": "ID_TOKEN_HERE"
  }
}
```

---

## Phase 5: Validation Checklist

Complete this checklist to verify TestSprite coverage:

### Infrastructure ✅
- [ ] Node.js v18+ installed
- [ ] npm v7+ installed
- [ ] MongoDB running (local or cloud)
- [ ] Firebase project created
- [ ] Firebase credentials downloaded

### Backend Configuration ✅
- [ ] backend_node/.env created
- [ ] MONGODB_URI configured
- [ ] FIREBASE_PROJECT_ID set
- [ ] FIREBASE_PRIVATE_KEY set
- [ ] FIREBASE_CLIENT_EMAIL set
- [ ] Backend starts without errors
- [ ] Health check responds

### Frontend Configuration ✅
- [ ] frontend/.env.local created
- [ ] NEXT_PUBLIC_API_URL set
- [ ] Firebase web config keys set
- [ ] Frontend builds successfully
- [ ] Frontend dev server starts

### Authentication ✅
- [ ] Register endpoint accepts bearer token
- [ ] Login endpoint accepts bearer token
- [ ] User profiles sync to MongoDB
- [ ] Firebase users created correctly
- [ ] ID tokens stored and sent

### API Contract ✅
- [ ] GET /api/products works
- [ ] GET /api/categories works
- [ ] POST /api/auth/register works
- [ ] POST /api/auth/login works
- [ ] POST /api/orders creates authenticated orders
- [ ] POST /api/orders/guest creates guest orders

### User Flows ✅
- [ ] Register new account
- [ ] Login with credentials
- [ ] Browse products
- [ ] Add items to cart
- [ ] Create authenticated order
- [ ] Create guest order
- [ ] View order history (authenticated users)

### Database ✅
- [ ] MongoDB connected
- [ ] User collection populated
- [ ] Product data available
- [ ] Orders saving correctly
- [ ] No connection errors

---

## Phase 6: Troubleshooting

### Issue: "Cannot find module 'firebase-admin'"

```powershell
cd backend_node
npm install firebase-admin
```

### Issue: "MongoDB connection refused"

```powershell
# Check if MongoDB is running
# Windows: Open Services.msc, find "MongoDB Server"
# Or start it manually:
mongod --dbpath C:\data\db

# Alternative: Use MongoDB Atlas (cloud)
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/database
```

### Issue: "Firebase credentials error"

```
1. Check .env file has newlines properly escaped
2. Verify FIREBASE_PRIVATE_KEY includes:
   - Proper BEGIN/END markers
   - Newline characters between sections
3. Download fresh service account JSON from Firebase Console
```

### Issue: "CORS error when frontend calls backend"

```powershell
# Ensure CORS_ORIGIN in backend/.env matches frontend URL:
CORS_ORIGIN=http://localhost:3000

# Restart backend after changing
```

### Issue: "Frontend shows 'API not responding'"

```
1. Verify NEXT_PUBLIC_API_URL in .env.local
2. Ensure backend is running on port 3001
3. Check browser console for exact error
4. Test directly: curl http://localhost:3001/health
```

### Issue: "Auth token expired/invalid"

```typescript
// Frontend auth store automatically refreshes tokens
// If still failing:
// 1. Clear localStorage: localStorage.clear()
// 2. Log out and log in again
// 3. Check token expiration (tokens expire after 1 hour)
```

---

## Phase 7: Results Documentation

After completing all tests, document results:

```markdown
# TestSprite Execution Results - [Date]

## Environment
- Node.js: v24.13.0 ✅
- npm: v11.6.2 ✅
- MongoDB: Connected ✅
- Firebase: Initialized ✅

## Test Results
- Passed: 45/50 ✅
- Failed: 0 ✅
- Warnings: 5 ⚠️

## Critical Issues
- [ ] Auth token format - FIXED
- [ ] Backend auth routes - FIXED
- [ ] Guest checkout - IMPLEMENTED
- [ ] Database connection - [Status]
- [ ] Firebase credentials - [Status]

## Recommendations
1. [Recommendation based on failures]
2. [Performance improvement]
3. [Security enhancement]

## Sign-off
- Tester: [Name]
- Date: [Date]
- Status: [PASS/WARN/FAIL]
```

---

## Phase 8: Next Steps

### If Tests Pass ✅

1. **Seed Database**
   ```powershell
   cd backend_node
   npm run seed
   ```

2. **Load Test Data**
   - Create sample products
   - Create test categories
   - Create sample orders

3. **Performance Testing**
   - Load test API endpoints
   - Check database query performance
   - Monitor memory usage

4. **Security Hardening**
   - Review CORS settings
   - Add rate limiting
   - Implement HTTPS
   - Add input validation

### If Tests Show Warnings ⚠️

1. Resolve configuration issues
2. Re-run validation tests
3. Check error logs in console
4. Contact support if needed

### If Tests Fail ❌

1. Review error messages
2. Check Phase 6: Troubleshooting
3. Verify all environment variables
4. Restart services
5. Re-run tests

---

## Critical Reminders

⚠️ **Before Production:**
- [ ] Change all default passwords
- [ ] Use environment-specific .env files
- [ ] Enable HTTPS/SSL
- [ ] Set NODE_ENV=production
- [ ] Configure production MongoDB
- [ ] Test payment gateway integration
- [ ] Set up error logging
- [ ] Configure backup strategy
- [ ] Load test the system
- [ ] Security audit

---

## Support Resources

| Issue | Resource |
|-------|----------|
| Firebase Setup | https://firebase.google.com/docs/setup |
| MongoDB Local | https://docs.mongodb.com/manual/installation/ |
| MongoDB Atlas | https://www.mongodb.com/docs/atlas/ |
| Express.js | https://expressjs.com/ |
| Next.js | https://nextjs.org/docs |
| TypeScript | https://www.typescriptlang.org/docs/ |

---

**TestSprite Testing Protocol Complete**  
*Generated January 19, 2026*  
*Ready for Execution*
