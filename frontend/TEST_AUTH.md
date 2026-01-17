# Authentication Testing Guide

## Prerequisites

1. **Backend Server Running:**
   ```bash
   cd backend
   npm run dev
   ```
   Backend should be running on http://localhost:5000

2. **Database Setup:**
   - Ensure PostgreSQL is running
   - Database migrations have been run
   ```bash
   cd backend
   npm run migrate
   ```

3. **Frontend Server Running:**
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend should be running on http://localhost:5173 (or similar)

## Manual Testing Scenarios

### 1. Signup Flow

1. Navigate to http://localhost:5173
2. Should redirect to `/login`
3. Click "Sign up" link
4. Fill in the signup form:
   - Email: `test@example.com`
   - Password: `password123`
   - Confirm Password: `password123`
   - Role: `professor`
5. Click "Sign Up"
6. Should see loading spinner
7. Should redirect to `/dashboard`
8. Should see welcome message with email
9. Navigation bar should show email and logout button

### 2. Logout Flow

1. From dashboard, click "Logout" button
2. Should clear auth state
3. Should redirect to `/login`
4. Verify token is cleared from localStorage (DevTools → Application → Local Storage)

### 3. Login Flow

1. Navigate to `/login`
2. Fill in login form:
   - Email: `test@example.com`
   - Password: `password123`
3. Click "Login"
4. Should redirect to `/dashboard`
5. Should see user info

### 4. Auto-Login on Page Refresh

1. Login successfully
2. Refresh the page (F5)
3. Should remain logged in
4. Should see dashboard (not redirected to login)

### 5. Protected Route Access

1. Logout if logged in
2. Manually navigate to http://localhost:5173/dashboard
3. Should redirect to `/login`

### 6. Form Validation

#### Signup Validation:
1. Try to submit empty form → should show validation errors
2. Enter invalid email (e.g., "notanemail") → should show "Please enter a valid email address"
3. Enter password less than 8 chars → should show "Password must be at least 8 characters long"
4. Enter mismatched passwords → should show "Passwords do not match"
5. Password strength indicator should show:
   - "Weak" for passwords < 8 chars
   - "Medium" for 8-11 chars
   - "Strong" for 12+ chars

#### Login Validation:
1. Try to submit empty form → should show validation errors
2. Enter invalid email format → should show error
3. Enter wrong password → should show "Invalid email or password" from API

### 7. Duplicate Email Handling

1. Signup with email `test@example.com`
2. Logout
3. Try to signup again with same email
4. Should show error: "Email already in use"

### 8. Invalid Credentials

1. Try to login with non-existent email
2. Should show "Invalid email or password"
3. Try to login with wrong password
4. Should show "Invalid email or password"

### 9. Mobile Responsiveness

1. Open DevTools and toggle device toolbar
2. Test on mobile viewport (e.g., iPhone 12)
3. Forms should be fully responsive
4. Navigation should adapt to mobile
5. All buttons and inputs should be easily tappable

### 10. Token Expiration Simulation

1. Login successfully
2. Manually edit token in localStorage to an invalid value
3. Refresh the page
4. Should automatically logout and redirect to `/login`

## API Testing with curl

### Signup
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "curl-test@example.com",
    "password": "password123",
    "role": "professor"
  }'
```

Expected Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "curl-test@example.com",
    "role": "professor"
  }
}
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "curl-test@example.com",
    "password": "password123"
  }'
```

### Validate Token
```bash
TOKEN="your_token_here"
curl -X POST http://localhost:5000/api/auth/validate \
  -H "Authorization: Bearer $TOKEN"
```

### Logout
```bash
TOKEN="your_token_here"
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer $TOKEN"
```

## Browser DevTools Inspection

### Check localStorage
1. Open DevTools (F12)
2. Go to Application tab
3. Expand Local Storage
4. Click on http://localhost:5173
5. Should see:
   - `token`: JWT token string
   - `user`: JSON string with user object

### Check Network Requests
1. Open DevTools → Network tab
2. Login or signup
3. Inspect POST request to `/api/auth/login` or `/api/auth/signup`
4. Check request payload
5. Check response (should contain token and user)
6. Navigate to dashboard
7. Should see Authorization header with Bearer token in subsequent requests

### Check Console
1. Open Console tab
2. Should not see any errors
3. Any API errors should be caught and displayed in UI

## Common Issues & Troubleshooting

### Issue: "Unable to connect to API"
- **Solution:** Ensure backend server is running on port 5000
- Check backend terminal for errors
- Verify VITE_API_BASE_URL in frontend/.env

### Issue: "Database connection error"
- **Solution:** Ensure PostgreSQL is running
- Check backend/.env database credentials
- Run migrations: `cd backend && npm run migrate`

### Issue: "Email already in use" on first signup
- **Solution:** Email might exist from previous tests
- Use a different email or clear the database
- Or login with existing credentials

### Issue: Blank page after login
- **Solution:** Check browser console for errors
- Ensure all routes are properly configured
- Check that DashboardPage component is rendering

### Issue: Token not persisting
- **Solution:** Check browser localStorage in DevTools
- Ensure no browser extensions are blocking localStorage
- Try in incognito mode

### Issue: CORS errors
- **Solution:** Backend should have CORS enabled for http://localhost:5173
- Check backend server.js for CORS configuration

## Expected Results Summary

✅ Signup creates account and logs in user
✅ Login authenticates and redirects to dashboard  
✅ Logout clears token and redirects to login
✅ Protected routes redirect unauthenticated users
✅ Token persists across page refreshes
✅ Invalid credentials show appropriate errors
✅ Form validation prevents bad data
✅ Mobile responsive on all screen sizes
✅ Navigation shows user info when logged in
✅ Loading states appear during async operations
