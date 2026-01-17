# Authentication Flow Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    │
│  │  LoginPage   │    │  SignupPage  │    │  Dashboard   │    │
│  │   /login     │    │   /signup    │    │  /dashboard  │    │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘    │
│         │                   │                    │             │
│         └───────────────────┴────────────────────┘             │
│                            │                                   │
│                  ┌─────────▼──────────┐                        │
│                  │   AuthContext      │                        │
│                  │   (useReducer)     │                        │
│                  │                    │                        │
│                  │  State:            │                        │
│                  │  - user            │                        │
│                  │  - token           │                        │
│                  │  - loading         │                        │
│                  │  - error           │                        │
│                  │                    │                        │
│                  │  Methods:          │                        │
│                  │  - signup()        │                        │
│                  │  - login()         │                        │
│                  │  - logout()        │                        │
│                  │  - validateToken() │                        │
│                  └─────────┬──────────┘                        │
│                            │                                   │
│                  ┌─────────▼──────────┐                        │
│                  │   API Client       │                        │
│                  │   (Axios)          │                        │
│                  │                    │                        │
│                  │  Interceptors:     │                        │
│                  │  - Add Auth Header │                        │
│                  │  - Handle 401      │                        │
│                  └─────────┬──────────┘                        │
│                            │                                   │
└────────────────────────────┼───────────────────────────────────┘
                             │
                    HTTP Requests
                             │
┌────────────────────────────▼───────────────────────────────────┐
│                    Backend (Express + PostgreSQL)              │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  POST /api/auth/signup      ┌──────────────────┐              │
│  POST /api/auth/login   ───▶│  authController  │──────┐       │
│  POST /api/auth/validate    └──────────────────┘      │       │
│  POST /api/auth/logout                                │       │
│                                              ┌────────▼─────┐  │
│  ┌──────────────────┐                       │  PostgreSQL  │  │
│  │  JWT Middleware  │                       │              │  │
│  │  (verifyToken)   │                       │  users table │  │
│  └──────────────────┘                       └──────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## User Flow: Signup

```
┌──────────┐
│  User    │
│  visits  │
│    /     │
└────┬─────┘
     │
     ▼
┌────────────┐
│ Redirect   │
│ to /login  │
└────┬───────┘
     │
     ▼
┌──────────────┐
│ User clicks  │
│  "Sign up"   │
└────┬─────────┘
     │
     ▼
┌──────────────────────────┐
│ SignupPage (/signup)     │
│                          │
│ ┌──────────────────────┐ │
│ │ Email: [________]    │ │
│ │ Password: [______]   │ │
│ │ Confirm: [_______]   │ │
│ │ Role: [professor ▼]  │ │
│ │                      │ │
│ │  [   Sign Up   ]     │ │
│ └──────────────────────┘ │
└────┬─────────────────────┘
     │
     ▼
┌──────────────────────┐
│ Client-side          │
│ Validation           │
│ - Email format       │
│ - Password >= 8 chars│
│ - Passwords match    │
└────┬─────────────────┘
     │ (if valid)
     ▼
┌──────────────────────┐
│ POST /api/auth/signup│
│ {                    │
│   email: "...",      │
│   password: "...",   │
│   role: "professor"  │
│ }                    │
└────┬─────────────────┘
     │
     ▼
┌──────────────────────┐
│ Backend validates    │
│ - Email unique       │
│ - Password length    │
│ - Hash password      │
│ - Insert to DB       │
└────┬─────────────────┘
     │
     ▼
┌──────────────────────┐
│ Response:            │
│ {                    │
│   token: "JWT...",   │
│   user: {            │
│     id: "uuid",      │
│     email: "...",    │
│     role: "..."      │
│   }                  │
│ }                    │
└────┬─────────────────┘
     │
     ▼
┌──────────────────────┐
│ AuthContext updates: │
│ - dispatch(LOGIN)    │
│ - Save to localStorage│
│   * token            │
│   * user JSON        │
└────┬─────────────────┘
     │
     ▼
┌──────────────────────┐
│ Redirect to          │
│   /dashboard         │
└──────────────────────┘
```

## User Flow: Login

```
┌──────────┐
│  User    │
│  visits  │
│  /login  │
└────┬─────┘
     │
     ▼
┌──────────────────────────┐
│ LoginPage (/login)       │
│                          │
│ ┌──────────────────────┐ │
│ │ Email: [________]    │ │
│ │ Password: [______]   │ │
│ │                      │ │
│ │  [     Login     ]   │ │
│ └──────────────────────┘ │
└────┬─────────────────────┘
     │
     ▼
┌──────────────────────┐
│ Client-side          │
│ Validation           │
│ - Email format       │
│ - Non-empty fields   │
└────┬─────────────────┘
     │ (if valid)
     ▼
┌──────────────────────┐
│ POST /api/auth/login │
│ {                    │
│   email: "...",      │
│   password: "..."    │
│ }                    │
└────┬─────────────────┘
     │
     ▼
┌──────────────────────┐
│ Backend validates    │
│ - User exists        │
│ - Password matches   │
│ - Generate JWT       │
└────┬─────────────────┘
     │
     ▼
┌──────────────────────┐
│ Response:            │
│ {                    │
│   token: "JWT...",   │
│   user: {...}        │
│ }                    │
└────┬─────────────────┘
     │
     ▼
┌──────────────────────┐
│ AuthContext updates: │
│ - dispatch(LOGIN)    │
│ - Save to localStorage│
└────┬─────────────────┘
     │
     ▼
┌──────────────────────┐
│ Redirect to          │
│   /dashboard         │
└──────────────────────┘
```

## User Flow: Auto-Login on App Mount

```
┌──────────┐
│  User    │
│ refreshes│
│   page   │
└────┬─────┘
     │
     ▼
┌──────────────────────┐
│ App.jsx mounts       │
│ AuthProvider init    │
└────┬─────────────────┘
     │
     ▼
┌──────────────────────┐
│ Check localStorage   │
│ - token exists?      │
│ - user exists?       │
└────┬─────────────────┘
     │
     ├─ No ──▶ Set loading = false ──▶ Show login page
     │
     └─ Yes
        │
        ▼
┌──────────────────────┐
│ POST /api/auth/      │
│      validate        │
│ Header: Bearer token │
└────┬─────────────────┘
     │
     ▼
┌──────────────────────┐
│ Backend verifies JWT │
│ - Valid?             │
│ - Not expired?       │
└────┬─────────────────┘
     │
     ├─ Invalid ──▶ Clear localStorage ──▶ Show login page
     │
     └─ Valid
        │
        ▼
┌──────────────────────┐
│ Response:            │
│ {                    │
│   valid: true,       │
│   user: {...}        │
│ }                    │
└────┬─────────────────┘
     │
     ▼
┌──────────────────────┐
│ dispatch(LOGIN)      │
│ User stays logged in │
└────┬─────────────────┘
     │
     ▼
┌──────────────────────┐
│ Show Dashboard       │
└──────────────────────┘
```

## User Flow: Logout

```
┌──────────┐
│  User    │
│  clicks  │
│  Logout  │
└────┬─────┘
     │
     ▼
┌──────────────────────┐
│ POST /api/auth/logout│
│ Header: Bearer token │
└────┬─────────────────┘
     │
     ▼
┌──────────────────────┐
│ Clear localStorage   │
│ - Remove token       │
│ - Remove user        │
└────┬─────────────────┘
     │
     ▼
┌──────────────────────┐
│ dispatch(LOGOUT)     │
│ Clear auth context   │
└────┬─────────────────┘
     │
     ▼
┌──────────────────────┐
│ Redirect to /login   │
└──────────────────────┘
```

## User Flow: Protected Route Access

```
┌──────────┐
│  User    │
│ navigates│
│   to     │
│/dashboard│
└────┬─────┘
     │
     ▼
┌──────────────────────┐
│ ProtectedRoute checks│
│ - loading?           │
│ - user exists?       │
└────┬─────────────────┘
     │
     ├─ Loading ──▶ Show spinner
     │
     ├─ No user ──▶ Redirect to /login
     │
     └─ Has user
        │
        ▼
┌──────────────────────┐
│ Render Dashboard     │
│ with Navigation      │
└──────────────────────┘
```

## API Request Flow with Token

```
┌──────────────────────┐
│  Frontend makes      │
│  API request         │
└────┬─────────────────┘
     │
     ▼
┌──────────────────────┐
│ Axios interceptor    │
│ - Get token from     │
│   localStorage       │
│ - Add to header:     │
│   Authorization:     │
│   Bearer <token>     │
└────┬─────────────────┘
     │
     ▼
┌──────────────────────┐
│ Send to backend      │
└────┬─────────────────┘
     │
     ▼
┌──────────────────────┐
│ Backend middleware   │
│ - Verify JWT         │
│ - Check expiration   │
│ - Attach user to req │
└────┬─────────────────┘
     │
     ├─ Invalid ──▶ 401 Unauthorized
     │                    │
     │                    ▼
     │              ┌──────────────────────┐
     │              │ Axios interceptor    │
     │              │ - Catch 401          │
     │              │ - Clear localStorage │
     │              │ - Dispatch event     │
     │              └────┬─────────────────┘
     │                   │
     │                   ▼
     │              ┌──────────────────────┐
     │              │ AuthContext listener │
     │              │ - dispatch(LOGOUT)   │
     │              │ - Redirect to login  │
     │              └──────────────────────┘
     │
     └─ Valid
        │
        ▼
┌──────────────────────┐
│ Process request      │
│ Return response      │
└──────────────────────┘
```

## State Management (AuthContext)

```
AuthContext State:
{
  user: {
    id: "uuid",
    email: "user@example.com",
    role: "professor"
  } | null,
  
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." | null,
  
  loading: true | false,
  
  error: "Error message" | null
}

Actions:
- LOGIN → Set user + token, clear error, stop loading
- LOGOUT → Clear user + token, stop loading
- SET_ERROR → Set error message, stop loading
- CLEAR_ERROR → Clear error message
- SET_LOADING → Set loading state
```

## LocalStorage Structure

```
localStorage:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  
  "user": "{\"id\":\"uuid\",\"email\":\"user@example.com\",\"role\":\"professor\"}"
}
```

## Component Hierarchy

```
App.jsx
├── AuthProvider (Context)
│   └── Router
│       ├── / (RedirectRoute)
│       │   └── Checks auth → /dashboard or /login
│       │
│       ├── /login (LoginPage)
│       │   └── Uses useAuth()
│       │       ├── Email input
│       │       ├── Password input
│       │       └── Submit → login()
│       │
│       ├── /signup (SignupPage)
│       │   └── Uses useAuth()
│       │       ├── Email input
│       │       ├── Password input
│       │       ├── Confirm password input
│       │       ├── Role select
│       │       └── Submit → signup()
│       │
│       └── /dashboard (ProtectedRoute)
│           └── DashboardPage
│               ├── Navigation
│               │   ├── User avatar
│               │   ├── User email
│               │   └── Logout button → logout()
│               │
│               └── Dashboard content
```
