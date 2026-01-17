# Frontend Authentication Implementation

## Overview

This document describes the frontend authentication system for AutoExam Pro, built with React, React Router, and Tailwind CSS.

## Architecture

### 1. Auth Context (`/src/context/AuthContext.jsx`)

Central state management for authentication using React Context API and useReducer:

**State:**
- `user` - Current authenticated user object (id, email, role)
- `token` - JWT authentication token
- `loading` - Loading state for async operations
- `error` - Error messages from API calls

**Actions:**
- `LOGIN` - Set user and token after successful authentication
- `LOGOUT` - Clear user and token
- `SET_ERROR` - Set error message
- `CLEAR_ERROR` - Clear error message
- `SET_LOADING` - Set loading state

**Methods:**
- `signup(email, password, role)` - Register new user
- `login(email, password)` - Authenticate existing user
- `logout()` - Clear auth state and localStorage
- `validateToken()` - Verify token validity on app mount
- `clearError()` - Clear error messages

### 2. API Client (`/src/services/apiClient.js`)

Axios-based HTTP client with interceptors:

**Features:**
- Base URL from environment variable (VITE_API_BASE_URL)
- 10-second timeout
- Automatic Authorization header injection
- 401 error handling (clears token and dispatches unauthorized event)

**Methods:**
- `post(endpoint, data)`
- `get(endpoint)`
- `put(endpoint, data)`
- `del(endpoint)`

### 3. Pages

#### Login Page (`/src/pages/LoginPage.jsx`)
- Route: `/login`
- Fields: email, password
- Validation: email format, non-empty fields
- On success: Redirects to `/dashboard`
- Features: Loading spinner, inline error messages

#### Signup Page (`/src/pages/SignupPage.jsx`)
- Route: `/signup`
- Fields: email, password, confirmPassword, role
- Validation: email format, password length (min 8), password match
- Password strength indicator (Weak/Medium/Strong)
- On success: Auto-login and redirect to `/dashboard`

#### Dashboard Page (`/src/pages/DashboardPage.jsx`)
- Route: `/dashboard` (protected)
- Displays user info, stats, and getting started guide
- Shows navigation bar with logout button

### 4. Components

#### ProtectedRoute (`/src/components/ProtectedRoute.jsx`)
- Wraps protected routes
- Checks if user is authenticated
- Shows loading spinner during token validation
- Redirects to `/login` if not authenticated

#### Navigation (`/src/components/Navigation.jsx`)
- Top navigation bar
- Displays user email and avatar
- Logout button
- Only visible when authenticated

### 5. Routing (`/src/App.jsx`)

Routes:
- `/` - Redirects to `/dashboard` if authenticated, `/login` otherwise
- `/login` - Login page (public)
- `/signup` - Signup page (public)
- `/dashboard` - Dashboard (protected)

## Token Persistence

1. **Login/Signup Flow:**
   - API returns `{ token, user }` on successful authentication
   - Token saved to `localStorage.setItem('token', token)`
   - User saved to `localStorage.setItem('user', JSON.stringify(user))`
   - Auth context updated with user and token

2. **Auto-Login on App Mount:**
   - On app initialization, AuthContext checks localStorage for token
   - If token exists, calls `/api/auth/validate` endpoint
   - If valid: Sets user in context (user stays logged in)
   - If invalid: Clears localStorage and context

3. **Logout:**
   - Calls `/api/auth/logout` endpoint
   - Clears `localStorage` (token and user)
   - Clears auth context state
   - Redirects to `/login`

4. **Unauthorized Handling:**
   - API client intercepts 401 responses
   - Automatically clears localStorage
   - Dispatches `unauthorized` event
   - AuthContext listens for event and logs out user

## Styling

### Tailwind Configuration
Custom theme defined in `/src/index.css`:
- Primary: Navy blue (#1e3a8a)
- Secondary: Gray (#4b5563)
- Accent: Gold (#d97706)
- Error: Red (#dc2626)

### Fonts
- Headings: Georgia (serif)
- Body: Inter, system-ui (sans-serif)

### Design System
- Card-based layouts with shadows
- Blue gradient backgrounds
- Responsive design (mobile-first)
- Loading spinners for async operations
- Inline validation errors

## API Integration

### Backend Endpoints Used

1. **POST /api/auth/signup**
   - Request: `{ email, password, role }`
   - Response: `{ token, user: { id, email, role } }`

2. **POST /api/auth/login**
   - Request: `{ email, password }`
   - Response: `{ token, user: { id, email, role } }`

3. **POST /api/auth/validate**
   - Headers: `Authorization: Bearer <token>`
   - Response: `{ valid: true, user: { id, email, role } }`

4. **POST /api/auth/logout**
   - Headers: `Authorization: Bearer <token>`
   - Response: `{ message: "Logged out successfully" }`

## Error Handling

1. **Client-Side Validation:**
   - Email format validation
   - Password length validation (min 8 characters)
   - Password match validation (signup)
   - Inline error messages below fields

2. **API Error Handling:**
   - Displays user-friendly error messages
   - Examples:
     - "Email already in use" (409 Conflict)
     - "Invalid email or password" (401 Unauthorized)
     - "Email and password are required" (400 Validation Error)

3. **Network Errors:**
   - Generic "Login failed" or "Signup failed" message
   - Console logging for debugging

## Security Features

1. **Token Storage:** JWT stored in localStorage (accessible only by same-origin scripts)
2. **Automatic Token Attachment:** Authorization header added to all requests
3. **Token Validation:** Verified on app mount to prevent stale sessions
4. **401 Auto-Logout:** Automatically logs out user on token expiration
5. **Password Requirements:** Minimum 8 characters enforced

## Development

### Environment Variables
Create `/frontend/.env`:
```
VITE_API_BASE_URL=http://localhost:5000
```

### Running the Frontend
```bash
cd frontend
npm install
npm run dev
```

### Building for Production
```bash
npm run build
```

## Testing Checklist

- [x] Login with valid credentials redirects to dashboard
- [x] Login with invalid credentials shows error
- [x] Signup with valid data creates account and redirects
- [x] Signup with duplicate email shows error
- [x] Signup with weak password shows validation error
- [x] Signup with mismatched passwords shows error
- [x] Token persists after page refresh
- [x] Protected routes redirect to login when not authenticated
- [x] Logout clears token and redirects to login
- [x] Navigation shows user email
- [x] Forms are mobile-responsive
- [x] Loading spinners appear during async operations
- [x] Validation errors appear inline

## Future Enhancements

1. **Password Recovery:** Forgot password flow
2. **Email Verification:** Verify email after signup
3. **Session Timeout:** Auto-logout after inactivity
4. **Remember Me:** Optional persistent login
5. **2FA:** Two-factor authentication
6. **Social Login:** OAuth with Google, GitHub, etc.
