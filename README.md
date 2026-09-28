# Week 3 – Full Stack Integration (Connecting Frontend & Backend)
### Skill Nexus Full Stack Web Development (MERN) Internship

---

## 🌟 Executive Summary

This repository contains the complete production-grade source code for **Skill Nexus Internship Week 3**, demonstrating end-to-end integration between modern **React (Vite) Frontends** and **Express.js / MongoDB Backends**, complete with **JWT Authentication**, **Axios Interceptors**, **Protected Routes**, **State Management via React Context API**, and **Multer File & Image Uploads**.

---

## 📑 Repository Structure

```
skill-nexus-week3-fullstack/
├── assignment-1-fullstack-todo/       # Assignment 1: Full Stack To-Do Application
│   ├── backend/                      # Express REST API with JWT Auth & To-Do CRUD
│   │   ├── src/
│   │   │   ├── config/db.js          # MongoDB connection with resilient fallback
│   │   │   ├── models/User.js        # User model with bcrypt encryption
│   │   │   ├── models/Todo.js        # Todo model with priority and due dates
│   │   │   ├── middleware/authMiddleware.js # JWT Bearer authorization guard
│   │   │   ├── controllers/          # Business logic (authController, todoController)
│   │   │   └── routes/               # API endpoints (/api/auth, /api/todos)
│   │   ├── package.json
│   │   └── .env
│   └── frontend/                     # React 18 + Vite Frontend
│       ├── src/
│       │   ├── api/axios.js          # Axios client with request & response interceptors
│       │   ├── context/AuthContext.jsx # Global Authentication Context & Session
│       │   ├── components/           # Navbar, ProtectedRoute, TodoForm, TodoItem
│       │   └── pages/                # Login, Register, Dashboard
│       └── package.json
│
├── assignment-2-image-upload/         # Assignment 2: Multer Image Upload & Preview Feature
│   ├── backend/                      # Express + Multer Disk Storage Server
│   │   ├── src/
│   │   │   ├── middleware/uploadMiddleware.js # Multer fileFilter & storage config
│   │   │   ├── controllers/uploadController.js # Single/Multi upload & gallery listing
│   │   │   └── routes/uploadRoutes.js # /api/upload endpoints
│   │   ├── uploads/                  # Static directory for uploaded image assets
│   │   └── package.json
│   └── frontend/                     # React + Live Client Image Preview & Gallery
│       ├── src/
│       │   ├── App.jsx               # Drag-and-drop zone, URL.createObjectURL preview, progress bar
│       │   └── index.css             # Responsive image gallery layout
│       └── package.json
│
├── mini-project-task-manager/         # Mini Project: Task Manager Application
│   ├── backend/                      # Complete MERN Backend with Multer attachments & Auth
│   │   ├── src/
│   │   │   ├── config/db.js          # MongoDB database driver
│   │   │   ├── models/User.js        # User model with avatar & role
│   │   │   ├── models/Task.js        # Task schema (status, priority, categories, attachment)
│   │   │   ├── middleware/           # authMiddleware & Multer uploadMiddleware
│   │   │   ├── controllers/          # authController & taskController (with filtering & stats)
│   │   │   └── routes/               # Auth & Task API routes
│   │   └── package.json
│   └── frontend/                     # React Dashboard with Filter Controls & File Uploads
│       ├── src/
│       │   ├── api/axiosInstance.js  # Configured Axios with Bearer token header
│       │   ├── context/AuthContext.jsx # Context provider with profile avatar updates
│       │   └── pages/                # Login, Register, Task Analytics Dashboard
│       └── package.json
│
├── SUBMISSION_GUIDE.md               # Step-by-step submission steps & instructions
└── package.json                      # Unified monorepo scripts
```

---

## 🚀 Quick Start Guide

### 1. Assignment 1: Full Stack To-Do Application
- **Backend**:
  ```bash
  cd assignment-1-fullstack-todo/backend
  npm install
  npm start
  ```
  Backend starts on `http://localhost:5001`.

- **Frontend**:
  ```bash
  cd assignment-1-fullstack-todo/frontend
  npm install
  npm run dev
  ```
  Frontend opens on `http://localhost:3001`.

---

### 2. Assignment 2: Image Upload Feature (Multer)
- **Backend**:
  ```bash
  cd assignment-2-image-upload/backend
  npm install
  npm start
  ```
  Backend runs on `http://localhost:5002` and serves `/uploads`.

- **Frontend**:
  ```bash
  cd assignment-2-image-upload/frontend
  npm install
  npm run dev
  ```
  Frontend opens on `http://localhost:3002`.

---

### 3. Mini Project: Task Manager Application
- **Backend**:
  ```bash
  cd mini-project-task-manager/backend
  npm install
  npm start
  ```
  Backend starts on `http://localhost:5003`.

- **Frontend**:
  ```bash
  cd mini-project-task-manager/frontend
  npm install
  npm run dev
  ```
  Frontend opens on `http://localhost:3000`.

---

## 🎯 Key Learning Objectives Demonstrated

1. **Connecting React Frontend with Express Backend**:
   - Axios instance configuration with base URLs and default headers.
   - Clean API abstraction layer separating UI components from network requests.
2. **Stateless JWT Authentication & Protected Routes**:
   - Storing JWT tokens in `localStorage` and sending `Bearer <token>` via Axios request interceptors.
   - React Router v6 protected layout route (`<ProtectedRoute />`) guarding sensitive pages.
   - Auto logout and redirection on `401 Unauthorized` responses.
3. **State Management with React Context API**:
   - `AuthContext` managing user login state, registration, token persistence, and profile avatars.
4. **File & Image Uploading with Multer**:
   - Multi-part form data (`multipart/form-data`) handling in Express.
   - Disk storage configuration with unique file naming and extensions.
   - File type validation (MIME-type and extension filtering for JPG, PNG, WEBP, GIF, SVG).
   - File size limits (5MB - 10MB) with custom error handling.
   - Instant client-side preview via `URL.createObjectURL` before uploading.
   - Serving uploaded files statically through `express.static`.
5. **Advanced Filtering & Task Management**:
   - Filtering by status (`all`, `pending`, `in-progress`, `completed`).
   - Priority filtering (`low`, `medium`, `high`, `urgent`).
   - Category filtering and real-time keyword search.
