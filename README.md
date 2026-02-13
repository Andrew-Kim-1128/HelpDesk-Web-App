# HelpDesk Web Application

A full-stack Helpdesk / Ticket Management Web Application built with:

- React (Vite)
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- File Uploads (Multer)

---

## Overview

This application allows users to create and manage support tickets while providing role-based access control for administrators and a root account. 
This project is a result of me trying to learn automation in a full-stack dev environment.

It demonstrates:

- Full authentication flow (login / register / logout)
- Protected routes in React
- Role-based backend authorization
- File upload handling
- Due date urgency tracking
- Clean modular backend architecture

---

## Current & Future Features

- User & Admin authentication (completed)
- Role-based permissions (completed)
- Ticket creation & management (completed)
- File attachments with validation (completed)
- MongoDB data persistence (completed)
- Automated timestamping (completed)
- UI/UX design & CSS (WIP)
- Discussion board (WIP)
- Automated SLA escalation + notifications (WIP)
- Ticket assignment system (WIP)

---

## Authentication & Authorization

### JWT Authentication
- Users authenticate via `/login`
- Server returns a signed JWT
- Token is stored in cookies

### Roles
- `user`: can create and manage their own tickets
- `admin`: can manage all tickets
- `root`: can create additional admin accounts

---

## User Features

- Register new account
- Login / Logout
- Create new ticket
- Edit own ticket
- View ticket details
- Attach files (PNG, JPG, JPEG, PDF, DOC, DOCX)
- View live due-date countdown

---

## Admin Features

Admins can:

- View all tickets
- Change ticket status
- Modify due date
- Mark ticket as complete
- Delete completed tickets
- Redact ticket content
- View list of users

---

## Root Account

The root account can:

- Access the dashboard
- Create new admin accounts
- Promote users to admin
- Access user management

