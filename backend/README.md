# Reporting System - Backend

Backend API for the Lecture Reporting System built with Node.js, Express, and PostgreSQL.

## Features

- JWT Authentication
- Role-based Authorization
- RESTful API Design
- PostgreSQL Database
- File Export (Excel)
- Input Validation
- Error Handling

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Reports
- `POST /api/reports` - Create lecture report
- `GET /api/reports/my-reports` - Get user's reports
- `GET /api/reports` - Get all reports (PRL/PL/FMG)
- `PATCH /api/reports/:id/status` - Update report status

### Complaints
- `POST /api/complaints` - Submit complaint
- `GET /api/complaints/my-complaints` - Get user's complaints
- `GET /api/complaints/for-review` - Get complaints for review
- `POST /api/complaints/:id/response` - Add complaint response

### Courses & Classes
- `GET /api/courses` - Get all courses
- `POST /api/courses` - Create course (PL only)
- `POST /api/courses/assign` - Assign course to lecturer
- `GET /api/classes` - Get all classes

### Download
- `GET /api/download/reports` - Download reports as Excel
- `GET /api/download/complaints` - Download complaints as Excel
- `GET /api/download/my-data` - Download user's personal data

## Environment Variables

Create a `.env` file with:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=reporting_system
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development