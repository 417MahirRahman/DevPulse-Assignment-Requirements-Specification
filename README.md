# DevPulse API

A RESTful backend API for managing bug reports and feature requests, built with Node.js, TypeScript, Express, and NeonDB (PostgreSQL).

**Live URL:** [Live Server](https://dev-pulse-assignment-requirements-s.vercel.app/)

---

## Features

- User registration and login with JWT authentication
- Role-based access control (contributor / maintainer)
- Create, read, update, and delete issues
- Filter issues by type and status
- Sort issues by newest or oldest
- Reporter details attached to each issue response
- Contributors can only update their own open issues
- Only maintainers can delete issues

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Language | TypeScript |
| Framework | Express.js |
| Database | NeonDB (PostgreSQL) |
| Auth | JSON Web Token (JWT) |
| Password Hashing | bcryptjs |

---

## Getting Started

### Prerequisites

- Node.js v18+
- A NeonDB account and project

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/417MahirRahman/DevPulse-Assignment-Requirements-Specification.git

# 2. Install dependencies
npm install

```

### Run the Server

```bash
# Development
npm run dev

# Production
npm start
```
---

## Database Schema

### Table: `users`

| Column | Type | Constraints |
|---|---|---|
| id | SERIAL | PRIMARY KEY |
| name | TEXT | NOT NULL |
| email | TEXT | NOT NULL, UNIQUE |
| password | TEXT | NOT NULL |
| role | TEXT | DEFAULT `contributor`, CHECK (`contributor` or `maintainer`) |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

### Table: `issues`

| Column | Type | Constraints |
|---|---|---|
| id | SERIAL | PRIMARY KEY |
| title | VARCHAR(150) | NOT NULL |
| description | TEXT | NOT NULL, min 20 characters |
| type | TEXT | NOT NULL, CHECK (`bug` or `feature_request`) |
| status | TEXT | DEFAULT `open`, CHECK (`open`, `in_progress`, `resolved`) |
| reporter_id | INTEGER | NOT NULL |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

---

## API Endpoints

### Authentication

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | Public | Register a new user |
| POST | `/api/auth/login` | Public | Login and receive JWT token |

### Issues

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/issues` | Private | Create a new issue |
| GET | `/api/issues` | Public | Get all issues (with filters) |
| GET | `/api/issues/:id` | Public | Get a single issue |
| PUT | `/api/issues/:id` | Private | Update an issue |
| DELETE | `/api/issues/:id` | Maintainer only | Delete an issue |

### Query Parameters for GET `/api/issues`

| Param | Values | Default |
|---|---|---|
| sort | `newest`, `oldest` | `newest` |
| type | `bug`, `feature_request` | none |
| status | `open`, `in_progress`, `resolved` | none |

---

## Folder Structure

```
src/
├── app.ts
├── server.ts
├── config/
│   └── index.ts
├── database/
│   └── index.ts
├── middleware/
│   └── auth.ts
├── modules/
│   ├── auth/
│   │   ├── auth.route.ts
│   │   ├── auth.controller.ts
│   │   └── auth.service.ts
|   ├── users/
│   |   ├── users.route.ts
│   |   ├── users.controller.ts
│   |   ├── users.service.ts
│   |   └── users.interface.ts
│   └── issue/
│       ├── issue.route.ts
│       ├── issue.controller.ts
│       ├── issue.service.ts
│       └── issue.interface.ts
└── utility/
    └── sendResponse.ts
```
---
