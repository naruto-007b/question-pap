# AutoExam Pro

An intelligent question paper generation system that automates the creation of exam papers based on customizable blueprints, course outcomes (COs), and question banks.

## 🚀 Project Overview

AutoExam Pro helps professors generate exam papers automatically by:
- Managing course-specific question banks
- Organizing questions by units and COs
- Using customizable blueprints for paper structure
- Tracking question difficulty and marks distribution
- Generating balanced exam papers based on institutional requirements

## 📋 Tech Stack

### Backend
- **Node.js** with **Express.js** - REST API server
- **PostgreSQL** - Relational database
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Frontend
- **React** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling

## 🏗️ Project Structure

```
autoexam-pro/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js      # PostgreSQL connection
│   │   ├── controllers/         # Route controllers (Phase 2)
│   │   ├── routes/             # API routes (Phase 2)
│   │   ├── middleware/         # Auth & validation (Phase 2)
│   │   ├── models/             # Database models (Phase 2)
│   │   └── server.js           # Express server entry point
│   ├── database/
│   │   ├── migrations/
│   │   │   └── 001_initial_schema.sql
│   │   └── setup.js            # Migration runner
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── public/
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── .env.example
│   └── package.json
├── .gitignore
└── README.md
```

## 📊 Database Schema

### Core Tables

1. **users** - Professor and admin accounts
2. **courses** - Course information (code, name)
3. **units** - Course units (1-4 per course)
4. **cos** - Course outcomes (1-6 per course)
5. **questions** - Question bank with metadata
6. **question_co_mapping** - Many-to-many relationship
7. **blueprints** - Exam paper templates
8. **generated_papers** - Generated exam metadata
9. **paper_questions** - Questions used in each paper

### Key Relationships

- Courses belong to professors
- Units and COs belong to courses
- Questions belong to courses and units
- Questions map to multiple COs
- Papers use blueprints and contain multiple questions

## 🛠️ Setup Instructions

### Prerequisites

- **Node.js** (v16 or higher)
- **PostgreSQL** (v12 or higher)
- **npm** or **yarn**

### 1. Clone the Repository

```bash
git clone <repository-url>
cd autoexam-pro
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file from example
cp .env.example .env

# Edit .env and configure your database credentials
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=autoexam_pro
# DB_USER=postgres
# DB_PASSWORD=your_password
# JWT_SECRET=your_secret_key
```

### 3. Database Setup

```bash
# Create the database (in PostgreSQL)
psql -U postgres
CREATE DATABASE autoexam_pro;
\q

# Run migrations to create tables
npm run migrate

# Start the backend server
npm run dev
```

The backend will run on `http://localhost:5000`

**Health Check Endpoints:**
- `GET /api/health` - API status
- `GET /api/health/db` - Database connection status

### 4. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env file from example
cp .env.example .env

# Edit .env if needed (default is http://localhost:5000)
# VITE_API_BASE_URL=http://localhost:5000

# Start the development server
npm run dev
```

The frontend will run on `http://localhost:3000`

## 🧪 Verify Installation

1. **Backend API**: Visit `http://localhost:5000/api/health`
   - Should return: `{"status": "ok", "message": "AutoExam Pro API is running"}`

2. **Database Connection**: Visit `http://localhost:5000/api/health/db`
   - Should return database connection status with timestamp

3. **Frontend**: Visit `http://localhost:3000`
   - Should display the AutoExam Pro welcome page
   - API status should show "Connected" or "AutoExam Pro API is running"

## 📝 Available Scripts

### Backend

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run migrate` - Run database migrations

### Frontend

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🔐 Environment Variables

### Backend (.env)

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=autoexam_pro
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
```

### Frontend (.env)

```env
VITE_API_BASE_URL=http://localhost:5000
```

## 🚦 Development Workflow

1. Start PostgreSQL database
2. Run backend: `cd backend && npm run dev`
3. Run frontend: `cd frontend && npm run dev`
4. Access the application at `http://localhost:3000`

## 📈 Next Steps (Phase 2)

- [ ] Implement authentication (register, login, JWT)
- [ ] Create API routes for courses, units, COs
- [ ] Build question bank management endpoints
- [ ] Implement paper generation algorithm
- [ ] Create frontend UI for all features
- [ ] Add PDF generation for exam papers

## 🤝 Contributing

This is an institutional project. Please follow the established code structure and conventions.

## 📄 License

ISC

---

**Phase 1 Status**: ✅ Complete
- Backend infrastructure set up
- Database schema implemented
- Frontend foundation established
- Ready for Phase 2 development
