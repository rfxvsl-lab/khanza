# Khanza Repaint

Premium automotive painting, detailing, and restoration web application.

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS 4, Framer Motion
- **Backend**: Express.js with modular architecture
- **Database**: Turso (libSQL) / SQLite
- **Image Storage**: Cloudinary
- **Build Tool**: Vite 6

## Getting Started

### Prerequisites
- Node.js 18+

### Installation

```bash
npm install
```

### Environment Setup

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required variables:
- `TURSO_CONNECTION_URL` — Database connection URL
- `TURSO_AUTH_TOKEN` — Database auth token
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — Image hosting
- `JWT_SECRET` — Secret key for admin authentication
- `ADMIN_EMAIL`, `ADMIN_PASSWORD` — Initial admin credentials

### Development

```bash
npm run dev
```

Server runs at `http://localhost:3000`

### Production Build

```bash
npm run build
npm start
```

## Project Structure

```
├── server/                 # Backend (Express)
│   ├── index.ts           # Server entry point
│   ├── config/            # Database & Cloudinary config
│   ├── middleware/         # Auth (JWT), rate limiter, error handler
│   ├── routes/            # Public & admin API routes
│   └── seeders/           # Database seed data
├── src/                    # Frontend (React)
│   ├── api/               # API client layer
│   ├── components/        # Shared components & UI kit
│   ├── context/           # React contexts (Settings)
│   ├── hooks/             # Custom hooks (useFetch)
│   ├── pages/             # Public & admin pages
│   └── types/             # TypeScript interfaces
└── index.html             # Entry HTML
```

## Features

- 🎨 Premium dark UI with red accent palette
- 📱 Fully responsive design
- 🔐 JWT-based admin authentication
- 📋 Multi-step booking wizard
- 🚗 Garage inventory with detail modals
- ⭐ Customer testimonials
- ❓ Searchable FAQ
- 🎫 Voucher claim system
- ☁️ Cloudinary image uploads
- 🛡️ Security: bcrypt, helmet, CORS
