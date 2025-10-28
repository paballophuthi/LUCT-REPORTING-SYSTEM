# Reporting System

A comprehensive web-based reporting application for educational institutions built with React.js frontend and Node.js backend.

## Features

- **Role-based Access Control**: Student, Lecturer, PRL, PL, and FMG roles
- **Lecture Reporting**: Digital submission and approval workflow
- **Complaint System**: Secure complaint routing with privacy protection
- **Student Signatures**: Digital approval for class representatives
- **Course Management**: PL can assign courses and classes to lecturers
- **Multi-faculty Support**: FICT, FBMG, and FABE faculties
- **Excel Export**: Download reports in Excel format

## Tech Stack

- **Frontend**: React.js, Axios, CSS3
- **Backend**: Node.js, Express.js, PostgreSQL
- **Authentication**: JWT Tokens
- **File Export**: Excel.js

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run dev