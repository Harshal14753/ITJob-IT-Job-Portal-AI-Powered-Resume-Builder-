<div align="center">

# 🚀 IT Job Portal

### AI-Powered Job Portal Connecting Talent with Opportunity

![Java](https://img.shields.io/badge/Java-17-E76F00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-4.1.0-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Gemini AI](https://img.shields.io/badge/Google_Gemini-Flash-FF6F00?style=for-the-badge&logo=googlegemini&logoColor=white)

---

**[Setup Guide](#-getting-started)** • **[Features](#-features)** • **[Architecture](#-architecture)** • **[API Reference](#-api-architecture)**

---

A full-stack, AI-powered job portal featuring **resume parsing**, **automatic profile creation**, **intelligent job matching**, and **real-time messaging** — built with clean architecture and production-ready patterns.

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Screenshots](#-screenshots)
- [Key Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [API Architecture](#-api-architecture)
- [Database Schema](#-database-schema)
- [AI Features Deep Dive](#-ai-features-deep-dive)
- [Future Roadmap](#-future-roadmap)

---

## 🌟 Overview

**IT Job Portal** is a full-featured recruitment platform that leverages **Google Gemini AI** to bridge the gap between candidates and recruiters. Candidates can upload their resumes and let AI automatically extract and populate their profiles, while recruiters can search, filter, and connect with talent through an intuitive dashboard.

### Why This Project Stands Out

| Feature | What It Does |
|---------|-------------|
| 🤖 **AI Resume Parsing** | Upload a PDF/DOC resume → Gemini extracts skills, experience, education, projects, and certificates → Profile auto-fills |
| 🎯 **AI Auto-Apply** | AI analyzes candidate profiles against job descriptions and automatically applies to matching positions |
| 💬 **Real-time Messaging** | Direct candidate-recruiter communication with unread counts and conversation threads |
| 📊 **Recruiter Analytics** | Dashboard with job performance metrics, application stats, and talent insights |
| 🔐 **Role-Based Access** | Separate experiences for Candidates, Recruiters, and Admins with JWT authentication |

---

## 📸 Screenshots

> **⚠️ Placeholder:** Replace the images below with actual screenshots from the running application.
> See [`screenshots/README.md`](screenshots/README.md) for capture instructions.

### AI Resume Parsing — Full Flow

| Step 1: Upload Resume | Step 2: AI Analyzing | Step 3: Parsed Successfully |
|:---:|:---:|:---:|
| ![Upload Resume](screenshots/ai-upload-step.png) | ![AI Parsing](screenshots/ai-parsing-loading.png) | ![Parse Success](screenshots/ai-parse-success.png) |
| *Click to upload PDF/DOC/DOCX* | *Gemini AI extracts structured data* | *Profile auto-filled with extracted data* |

### AI Review & Edit — Pre-filled Profile

<div align="center">

![AI Review Step](screenshots/ai-review-filled.png)

*All fields auto-populated: personal info, skills (auto-matched to database), experience, education, projects, and certificates*

</div>

### Profile Setup — Choose Your Path

<div align="center">

![Profile Setup Choice](screenshots/profile-setup-choice.png)

*Choose between Manual Setup or AI-Powered Setup*

</div>

### Application Demo

<div align="center">

![AI Resume Parsing Demo](screenshots/ai-resume-parsing-demo.gif)

*Watch AI parse a resume and auto-fill the profile in real-time*

</div>

### More Screenshots

| Candidate Dashboard | Recruiter Analytics | Real-time Messaging |
|:---:|:---:|:---:|
| ![Candidate Dashboard](screenshots/candidate-dashboard.png) | ![Recruiter Analytics](screenshots/recruiter-dashboard.png) | ![Messaging](screenshots/messaging.png) |
| *Browse & apply to jobs* | *Track job performance & applicants* | *Direct candidate-recruiter chat* |

---

## ✨ Features

### 👨‍💼 For Candidates

| Feature | Description |
|---------|-------------|
| 📄 **AI Profile Setup** | Upload resume → AI auto-fills profile (skills, experience, education, projects, certificates) |
| 🔍 **Job Discovery** | Browse and search jobs with filters (location, type, skills, salary) |
| 🤖 **AI Auto-Apply** | Let AI match your profile against jobs and apply automatically |
| 📝 **One-Click Apply** | Apply to jobs with a single click |
| 📊 **Application Tracker** | Track application status (Pending, Accepted, Rejected) |
| 💬 **Messaging** | Chat directly with recruiters |
| 📅 **Interview Schedule** | View upcoming interviews and details |
| 📁 **Resume Management** | Upload, download, and manage resume on Cloudinary |

### 🏢 For Recruiters

| Feature | Description |
|---------|-------------|
| 📢 **Post Jobs** | Create job postings with detailed requirements, skills, and benefits |
| 👥 **Find Talent** | Search and filter candidates by skills, experience, and location |
| 📋 **Applicant Management** | Review applicants per job with status updates |
| 💾 **Save Candidates** | Bookmark promising candidates for later review |
| 💬 **Messaging** | Direct communication with candidates |
| 📅 **Interview Scheduling** | Schedule and manage interviews with candidates |
| 📊 **Analytics Dashboard** | Job views, application rates, and performance metrics |
| 🏢 **Company Profile** | Manage company information displayed on job postings |

### 🛡️ For Admins

| Feature | Description |
|---------|-------------|
| 📊 **Dashboard** | System-wide metrics and overview |
| 👥 **User Management** | View and manage all users |
| 📢 **Job Moderation** | Review and approve/reject job postings |
| 🏷️ **Skills Management** | Manage the global skills database |
| 📂 **Category Management** | Organize jobs into categories |
| ⚙️ **System Configuration** | Manage portal settings |

---

## 🛠️ Tech Stack

### Backend

| Technology | Purpose |
|------------|---------|
| **Java 17** | Core language |
| **Spring Boot 4.1.0** | Application framework |
| **Spring Security** | Authentication & authorization |
| **JWT (jjwt 0.12.6)** | Stateless token-based auth |
| **Spring Data JPA** | ORM & database access |
| **PostgreSQL** | Primary database |
| **Google GenAI SDK** | Gemini AI integration |
| **Apache Tika** | Resume text extraction (PDF/DOC/DOCX) |
| **Cloudinary** | Cloud file storage for resumes |
| **Lombok** | Boilerplate reduction |

### Frontend

| Technology | Purpose |
|------------|---------|
| **React 19** | UI library |
| **Vite 8** | Build tool & dev server |
| **Tailwind CSS 4** | Utility-first styling |
| **React Router 7** | Client-side routing |
| **Axios** | HTTP client |
| **React Icons** | Icon library |

### Infrastructure

| Technology | Purpose |
|------------|---------|
| **PostgreSQL 16** | Relational database |
| **Cloudinary** | Cloud media storage |
| **Google Gemini Flash** | AI resume parsing & job matching |

---

## 🏗️ Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (React)                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │Candidate │  │Recruiter │  │  Admin   │  │  Public      │   │
│  │  Portal  │  │  Portal  │  │  Panel   │  │  Pages       │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬───────┘   │
│       └──────────────┴──────────────┴───────────────┘           │
│                          │ Axios                                │
└──────────────────────────┼──────────────────────────────────────┘
                           │ REST API
┌──────────────────────────┼──────────────────────────────────────┐
│                    SERVER (Spring Boot)                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  Security Layer                          │   │
│  │         JWT Filter → Role-Based Access Control           │   │
│  └──────────────────────────┬───────────────────────────────┘   │
│                              │                                   │
│  ┌──────────┐  ┌──────────┐ │ ┌──────────┐  ┌──────────────┐   │
│  │  Auth    │  │   Job    │ │ │ Profile  │  │  Messaging   │   │
│  │Controller│  │Controller│ │ │Controller│  │  Controller  │   │
│  └────┬─────┘  └────┬─────┘ │ └────┬─────┘  └──────┬───────┘   │
│       │              │       │      │               │           │
│  ┌────┴──────────────┴───────┴──────┴───────────────┴───────┐   │
│  │                    Service Layer                         │   │
│  │  AuthService │ JobService │ ProfileService │ AIService   │   │
│  └──────────────────────────┬───────────────────────────────┘   │
│                              │                                   │
│  ┌──────────────────────────┴───────────────────────────────┐   │
│  │                  Repository Layer (JPA)                   │   │
│  └──────────────────────────┬───────────────────────────────┘   │
└──────────────────────────────┼──────────────────────────────────┘
                               │
┌──────────────────────────────┼──────────────────────────────────┐
│                               │                                  │
│  ┌────────────┐  ┌───────────┴──────┐  ┌────────────────────┐   │
│  │ PostgreSQL │  │    Cloudinary    │  │   Google Gemini    │   │
│  │  Database  │  │   (File Store)   │  │   (AI Services)    │   │
│  └────────────┘  └──────────────────┘  └────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Clean Architecture Pattern

```
Controller → Service Interface → Service Implementation → Repository → Entity
     ↓              ↓
    DTOs         External APIs (Gemini, Cloudinary)
```

---

## 📁 Project Structure

```
IT Job Portal Project/
├── backend/
│   └── itjob/
│       ├── src/main/java/com/itjob/
│       │   ├── config/              # Security, JWT, Cloudinary, DataSeeder
│       │   ├── controller/          # REST Controllers (14 controllers)
│       │   ├── dto/                 # Data Transfer Objects
│       │   ├── entities/            # JPA Entities & Enums
│       │   │   └── Enums/          # Role, JobType, WorkLocation, ApplicationStatus
│       │   ├── exception/           # Global Exception Handler
│       │   ├── mapper/              # Entity ↔ DTO Mappers
│       │   ├── repository/          # Spring Data JPA Repositories
│       │   └── services/            # Business Logic
│       │       └── impl/            # Service Implementations
│       └── src/main/resources/
│           ├── application.properties
│           ├── application-dev.properties
│           └── application-prod.properties
│
├── frontend/
│   └── src/
│       ├── components/              # Reusable UI Components
│       │   ├── ChatWindow.jsx       # Real-time messaging
│       │   ├── Navbar.jsx           # Navigation with role-based menu
│       │   ├── SkillPicker.jsx      # Multi-select skills component
│       │   └── ...
│       ├── config/
│       │   └── AxiosHelper.js       # HTTP client configuration
│       ├── context/
│       │   ├── UserContext.jsx       # User state management
│       │   └── SiteConfigContext.jsx # Site configuration
│       ├── pages/
│       │   ├── candidate/           # 12 candidate pages
│       │   ├── recruiter/           # 15 recruiter pages
│       │   ├── admin/               # 8 admin pages
│       │   └── Login.jsx
│       ├── routes/
│       │   ├── CandidateRoute.jsx   # Protected candidate routes
│       │   ├── RecruiterRoute.jsx   # Protected recruiter routes
│       │   └── AdminRoute.jsx       # Protected admin routes
│       └── services/                # API service layer
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

| Requirement | Version |
|-------------|---------|
| Java | 17+ |
| Node.js | 18+ |
| PostgreSQL | 14+ |
| Maven | 3.8+ |

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/harshal-jambhale/IT-Job-Portal-Project.git
cd IT-Job-Portal-Project
```

### 2️⃣ Database Setup

```sql
-- Create the database
CREATE DATABASE itjob;
```

### 3️⃣ Backend Setup

```bash
cd backend/itjob

# Configure environment variables in application-dev.properties
# or set them in your environment:
# export GEMINI_API_KEY=your_api_key
# export CLOUDINARY_CLOUD_NAME=your_cloud_name
# export CLOUDINARY_API_KEY=your_api_key
# export CLOUDINARY_API_SECRET=your_api_secret

# Run the application
./mvnw spring-boot:run
```

The backend will start on `http://localhost:8080`

### 4️⃣ Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will start on `http://localhost:5173`

### 5️⃣ Environment Variables

Create `application-dev.properties` with:

```properties
# Database
spring.datasource.url=jdbc:postgresql://localhost:5433/itjob
spring.datasource.username=postgres
spring.datasource.password=your_password

# Gemini AI
app.gemini.api-key=YOUR_GEMINI_API_KEY

# Cloudinary (for resume storage)
app.cloudinary.cloud-name=YOUR_CLOUD_NAME
app.cloudinary.api-key=YOUR_API_KEY
app.cloudinary.api-secret=YOUR_API_SECRET
```

---

## 🔌 API Architecture

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/send-otp` | Send OTP to email |
| `POST` | `/api/auth/verify-otp` | Verify OTP and get JWT |
| `POST` | `/api/auth/refresh` | Refresh access token |

### Job Endpoints

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| `GET` | `/api/jobs` | Public | List all jobs with filters |
| `GET` | `/api/jobs/{id}` | Public | Get job details |
| `POST` | `/api/recruiter/jobs` | Recruiter | Create a job |
| `PUT` | `/api/recruiter/jobs/{id}` | Recruiter | Update a job |
| `DELETE` | `/api/recruiter/jobs/{id}` | Recruiter | Delete a job |
| `GET` | `/api/recruiter/jobs/{id}/applicants` | Recruiter | View applicants |

### Candidate Endpoints

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| `GET` | `/api/candidate/profile` | Candidate | Get profile |
| `PUT` | `/api/candidate/profile` | Candidate | Update profile |
| `POST` | `/api/candidate/resume/upload` | Candidate | Upload resume |
| `POST` | `/api/candidate/apply/{jobId}` | Candidate | Apply to job |
| `GET` | `/api/candidate/applications` | Candidate | View applications |

### AI Endpoints

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| `POST` | `/api/ai/parse-resume` | Candidate | Parse resume with Gemini |
| `POST` | `/api/ai/apply/auto` | Candidate | AI auto-apply to jobs |

### Messaging Endpoints

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| `GET` | `/api/messages/conversations` | Both | List conversations |
| `POST` | `/api/messages/send` | Both | Send message |
| `GET` | `/api/messages/{conversationId}` | Both | Get messages |

---

## 🗄️ Database Schema

### Entity Relationship

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│    User      │────<│  Candidate   │────<│ Experience  │
│  (Base)     │     │  (Extends)   │     └─────────────┘
└──────┬──────┘     └──────┬───────┘
       │                    │
       │              ┌─────┴──────┐
       │              │            │
       │        ┌─────┴───┐  ┌────┴──────┐
       │        │Education│  │ Project   │
       │        └─────────┘  └───────────┘
       │
       ├────<┌──────────────┐
       │     │  Recruiter   │
       │     │  (Extends)   │
       │     └──────┬───────┘
       │            │
       │     ┌──────┴───────┐
       │     │     Job      │
       │     └──────┬───────┘
       │            │
       │     ┌──────┴───────┐     ┌─────────────┐
       └────<│ Application  │     │    Skills   │
             └──────────────┘     └──────┬──────┘
                                         │
                              ┌──────────┴──────────┐
                              │  candidate_skills   │
                              │     job_skills      │
                              └─────────────────────┘
```

### Core Entities

| Entity | Description |
|--------|-------------|
| `User` | Base user with email, OTP auth, role |
| `Candidate` | Extended user with skills, experience, education |
| `Recruiter` | Extended user with company info |
| `Job` | Job posting with requirements and benefits |
| `Application` | Candidate job application with status |
| `Skills` | Global skills database |
| `Experience` | Work experience entries |
| `Education` | Education entries |
| `Project` | Project entries |
| `Certificate` | Certificate entries |
| `Message` | Chat messages |
| `Conversation` | Chat threads |
| `Interview` | Scheduled interviews |
| `Notification` | User notifications |

---

## 🤖 AI Features Deep Dive

### Resume Parsing Pipeline

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐    ┌──────────────┐
│  Upload     │───>│ Apache Tika  │───>│   Gemini    │───>│  Structured  │
│  Resume     │    │ Extract Text │    │  Flash API  │    │  JSON → DTO  │
└─────────────┘    └──────────────┘    └─────────────┘    └──────────────┘
   PDF/DOC           Text Extraction      AI Parsing         Profile Data
```

**How it works:**

1. Candidate uploads a PDF/DOC/DOCX resume
2. **Apache Tika** extracts raw text from the document
3. Text is sent to **Google Gemini Flash** with a structured prompt
4. Gemini returns JSON with: fullName, skills, experience, education, projects, certificates
5. Backend converts JSON → `ResumeData` DTO
6. Frontend auto-fills the profile form with extracted data

### AI Auto-Apply

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  Candidate   │───>│  Gemini AI   │───>│  Auto-Apply  │
│  Profile     │    │  Match Score │    │  to Matching │
│  + Job List  │    │  Calculation │    │  Jobs        │
└──────────────┘    └──────────────┘    └──────────────┘
```

1. System fetches all active jobs
2. For each job, Gemini compares candidate profile vs job requirements
3. AI returns a match score and reasoning
4. If score > threshold, system auto-submits application

---

## 🎨 Design System

### Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Primary Blue | `#2557A7` | Brand color, buttons, links |
| Dark Blue | `#1f4fbf` | Recruiter theme |
| Success Green | `#10B981` | Success states |
| Warning Amber | `#F59E0B` | Warning states |
| Error Red | `#EF4444` | Error states, delete actions |

### Custom CSS Features

- **Card-level focus highlighting** — Parent card border turns blue when any input inside is focused
- **Glass morphism** — `glass` and `glass-dark` utility classes
- **Stagger animations** — Sequential child element animations
- **Gradient text** — `gradient-text` class for branded headings
- **Custom scrollbar** — Styled scrollbar matching the design system

---

## 📊 Key Metrics

| Metric | Value |
|--------|-------|
| Backend Controllers | 14 |
| Frontend Pages | 35+ |
| React Components | 15+ |
| API Endpoints | 50+ |
| Database Tables | 14 |
| User Roles | 3 (Candidate, Recruiter, Admin) |

---

## 🔐 Security

- **JWT Authentication** — Stateless token-based auth with refresh tokens
- **OTP Verification** — Email-based OTP for secure login
- **Role-Based Access Control** — Separate route protection for each role
- **CORS Configuration** — Configured for development and production
- **Input Validation** — Backend validation with Jakarta Bean Validation
- **Secure File Upload** — File type and size validation for resumes

---

## 🛣️ Future Roadmap

- [ ] **Email Notifications** — Application status updates via email
- [ ] **Job Recommendations** — AI-powered job suggestions for candidates
- [ ] **Video Interviews** — Integrated video call functionality
- [ ] **Payment System** — Premium job postings and candidate search
- [ ] **Analytics Dashboard** — Advanced hiring analytics for recruiters
- [ ] **Mobile App** — React Native mobile application
- [ ] **Multi-language Support** — Internationalization (i18n)
- [ ] **LinkedIn Integration** — Import profile data from LinkedIn

---

## 👨‍💻 Author

**Harshal Jambhale**

- LinkedIn: [Harshal Jambhale](https://linkedin.com/in/harshal-jambhale)
- GitHub: [harshal-jambhale](https://github.com/harshal-jambhale)

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

### ⭐ Star this repository if you find it impressive!

**Built with passion for connecting talent with opportunity**

</div>
