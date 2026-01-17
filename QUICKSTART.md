# AutoExam Pro - Quick Start Guide

Get up and running with AutoExam Pro in 5 minutes!

## Prerequisites

✅ Node.js (v16+)  
✅ PostgreSQL (v12+)  
✅ npm or yarn

## Step 1: Database Setup

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE autoexam_pro;

# Exit psql
\q
```

## Step 2: Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your database credentials
# nano .env  # or use your preferred editor
```

**Important:** Update these values in `.env`:
```env
DB_PASSWORD=your_actual_postgres_password
JWT_SECRET=your_random_secret_key_here
```

```bash
# Run database migrations
npm run migrate

# (Optional) Seed demo data
npm run seed

# Start backend server
npm run dev
```

✅ Backend should be running at `http://localhost:5000`

## Step 3: Frontend Setup

Open a **new terminal** window:

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start frontend server
npm run dev
```

✅ Frontend should be running at `http://localhost:3000`

## Step 4: Verify Everything Works

1. **Backend Health Check**  
   Visit: http://localhost:5000/api/health  
   Should return: `{"status":"ok","message":"AutoExam Pro API is running"}`

2. **Database Connection**  
   Visit: http://localhost:5000/api/health/db  
   Should return database connection status with timestamp

3. **Frontend App**  
   Visit: http://localhost:3000  
   Should display the AutoExam Pro welcome page with API status

## Demo Credentials (if you ran seed)

- **Professor Account**  
  Email: `professor@example.com`  
  Password: `professor123`

- **Admin Account**  
  Email: `admin@example.com`  
  Password: `admin123`

## Common Commands

### Backend
```bash
npm run dev      # Development server with auto-reload
npm start        # Production server
npm run migrate  # Run database migrations
npm run seed     # Seed demo data
```

### Frontend
```bash
npm run dev      # Development server
npm run build    # Build for production
npm run preview  # Preview production build
```

## Troubleshooting

### "Database connection failed"
- Check PostgreSQL is running: `sudo systemctl status postgresql`
- Verify database exists: `psql -U postgres -l`
- Check credentials in `backend/.env`

### "Port 5000 already in use"
- Change PORT in `backend/.env`
- Update VITE_API_BASE_URL in `frontend/.env`

### "Module not found" errors
- Run `npm install` in both backend and frontend directories

### Tailwind styles not working
- Make sure you're using Tailwind v4 syntax (`@import "tailwindcss"`)
- Clear Vite cache: `rm -rf node_modules/.vite`
- Restart dev server

## Next Steps

1. **Phase 2 Development:**
   - Implement authentication endpoints
   - Create course management API
   - Build question bank CRUD operations
   - Develop paper generation algorithm

2. **Learn the Schema:**
   - Read `backend/DATABASE.md` for full schema documentation
   - Explore seed data in `backend/database/seed.js`

3. **API Development:**
   - Add routes in `backend/src/routes/`
   - Create controllers in `backend/src/controllers/`
   - Add middleware in `backend/src/middleware/`

## Resources

- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vite.dev/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Tailwind CSS v4](https://tailwindcss.com/)

---

Need help? Check the main README.md or contact the development team.
