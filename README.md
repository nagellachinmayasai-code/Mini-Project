# AI-Powered Applicant Tracking System (ATS)

## Overview

The AI-Powered Applicant Tracking System (ATS) is a web-based recruitment platform designed to streamline the hiring process. The system enables recruiters to create job descriptions, upload candidate resumes, perform automated resume screening, calculate ATS match scores, and manage applicants efficiently.

## Features

* Secure recruiter registration and login
* Job description creation and management
* Resume upload and parsing (PDF support)
* AI-powered candidate analysis
* ATS score calculation and skill matching
* Candidate tracking and status management
* Recruiter-specific dashboards and analytics
* Resume insights including skills, education, experience, and certifications
* Search and filtering of candidates

## Technology Stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS

### Backend

* Node.js
* Express.js

### AI Integration

* Google Gemini API

### Document Processing

* PDF Parser
* Mammoth (DOCX support)

## Installation

### Prerequisites

* Node.js (v18 or later)
* npm

### Setup

1. Clone the repository

```bash
git clone <repository-url>
cd Mini-Project
```

2. Install dependencies

```bash
npm install
```

3. Configure environment variables

Create a `.env` file and add:

```env
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

4. Start the development server

```bash
npm run dev
```

## Build for Production

```bash
npm run build
```

## Start Production Server

```bash
npm start
```

## Project Objectives

* Automate resume screening
* Improve recruiter productivity
* Reduce manual evaluation effort
* Provide accurate ATS-based candidate matching
* Enhance recruitment decision-making using AI

## Future Enhancements

* Email notifications
* Interview scheduling
* Advanced analytics dashboard
* Multi-role access management
* Cloud database integration

## License

This project is developed for educational and academic purposes.

