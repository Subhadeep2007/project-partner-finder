# 🚀 Project Partner Finder

A full-stack platform designed to help students and developers find the right project partners, collaborate on projects, manage join requests, and build teams efficiently.

## 🌐 Live Demo

- **Frontend:** Coming Soon
- **Backend API:** https://project-partner-finder-1-3hfd.onrender.com

---

## ✨ Features

### 👤 Authentication & User Management

- User registration and login
- Secure password hashing using bcrypt
- JWT authentication
- Access token and refresh token system
- Secure logout
- User profile management
- Email verification using OTP
- Resend verification OTP
- Forgot password using OTP
- Password reset functionality
- Change password
- Account activation status checking

---

### 📁 Project Management

Users can create and manage projects.

Features include:

- Create a project
- View projects
- Update project details
- Delete projects
- Project team size management
- Track current members
- Project status management
- Automatic project closing when the team becomes full

---

### 🤝 Project Partner & Join Request System

Users can request to join projects.

The system supports:

- Send join requests
- Rejoin requests
- Accept join requests
- Reject join requests
- Remove team members
- Leave a project
- Prevent duplicate requests
- Prevent joining when the team is full
- Automatic member count updates
- Automatic project status updates

---

### 🔔 Notification System

The application includes an in-app notification system.

Notifications are generated for events such as:

- New join requests
- Join request acceptance
- Join request rejection
- Project member changes

---

### ⚡ Real-Time Features

Real-time communication is implemented using Socket.IO.

Examples include:

- Real-time project updates
- Member joined events
- Live project room events

---

### 📧 Email Notifications

The application sends email notifications for important events.

Examples include:

- Email verification OTP
- Resend verification OTP
- Password reset OTP
- New join request
- Rejoin request
- Join request accepted
- Join request rejected
- Team member removed
- Member left notifications

---

## 🛠️ Tech Stack

### Frontend

- React
- Vite
- JavaScript
- Socket.IO Client

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- Socket.IO

### Authentication & Security

- JSON Web Token (JWT)
- bcryptjs
- Cookie Parser
- Helmet
- Express Rate Limit
- Joi Validation

### Email

- Nodemailer
- Gmail SMTP

### Deployment

- Render — Main Backend + Socket.IO
- Render Static Site — Frontend
- Vercel — Email Service

---

# 🏗️ Project Architecture

```text
                         ┌─────────────────┐
                         │    Frontend     │
                         │   React + Vite  │
                         └────────┬────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
                    ▼                           ▼
           ┌────────────────┐          ┌─────────────────┐
           │ Render Backend │          │ Vercel Email API│
           │                │          │                 │
           │ Express        │          │ Nodemailer      │
           │ MongoDB        │          │ Gmail SMTP      │
           │ Socket.IO      │          └─────────────────┘
           └────────┬───────┘
                    │
                    ▼
              ┌───────────┐
              │  MongoDB  │
              │   Atlas   │
              └───────────┘
