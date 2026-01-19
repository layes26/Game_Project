# Gaming Store - Full Stack E-commerce Platform

A modern gaming digital goods e-commerce platform built with Next.js, Node.js, MongoDB, and Firebase.

## 🚀 Features

- **Authentication**: Firebase Auth with email/password
- **Product Catalog**: Games, gift cards, and digital goods
- **Shopping Cart**: Persistent cart with Firebase integration
- **Order Management**: Complete order flow with status tracking
- **Payment Gateway**: bKash, Nagad, and Card payment support
- **Admin Dashboard**: Full admin controls for managing store
- **Real-time Updates**: Optimistic UI updates
- **Responsive Design**: Mobile-first design with gaming aesthetic

## 🏗️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: Firebase Admin SDK
- **API Documentation**: Swagger-ready

## 📁 Project Structure

```
Game_Project/
├── frontend/                 # Next.js frontend
│   ├── app/                  # App Router pages
│   │   ├── products/         # Products listing
│   │   ├── product/[id]/     # Product details
│   │   ├── cart/             # Shopping cart
│   │   ├── checkout/         # Checkout flow
│   │   ├── orders/           # Order history
│   │   ├── login/            # Login page
│   │   └── admin/            # Admin dashboard
│   ├── components/           # React components
│   ├── stores/               # Zustand stores
│   ├── lib/                  # Utility functions
│   └── types/                # TypeScript types
│
├── backend_node/             # Node.js backend
│   ├── src/
│   │   ├── config/           # Database & Firebase config
│   │   ├── middleware/       # Auth middleware
│   │   ├── models/           # Mongoose models
│   │   ├── routes/           # API routes
│   │   ├── types/            # TypeScript types
│   │   └── index.ts          # Entry point
│   └── package.json
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Firebase project with Auth enabled
- bKash/Nagad merchant accounts (for payments)

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env.local
```

4. Configure environment variables:
```env
# API
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

5. Run development server:
```bash
npm run dev
```

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend_node
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure environment variables:
```env
# Server
PORT=3001
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/gaming_store

# Firebase Admin
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

5. Run the server:
```bash
npm run dev
```

### Seed Database

Populate the database with sample products:
```bash
cd backend_node
npm run seed
```

## 🔐 Authentication Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication with Email/Password provider
3. Download service account key for admin SDK
4. Add web app config to frontend `.env.local`
5. Add admin credentials to backend `.env`

## 📱 Available Routes

### Public Routes
- `/` - Home page
- `/products` - Product listing
- `/product/[id]` - Product details
- `/login` - Login page
- `/register` - Registration page

### Protected Routes
- `/cart` - Shopping cart
- `/checkout` - Checkout flow
- `/orders` - Order history
- `/profile` - User profile

### Admin Routes
- `/admin` - Dashboard
- `/admin/products` - Manage products
- `/admin/orders` - Manage orders
- `/admin/users` - Manage users

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user
- `PATCH /api/auth/me` - Update profile

### Products
- `GET /api/products` - List products
- `GET /api/products/featured` - Featured products
- `GET /api/products/:id` - Get product
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Categories
- `GET /api/categories` - List categories
- `POST /api/categories` - Create category (admin)
- `PUT /api/categories/:id` - Update category (admin)
- `DELETE /api/categories/:id` - Delete category (admin)

### Cart
- `GET /api/cart` - Get cart
- `POST /api/cart` - Add item
- `PUT /api/cart/:id` - Update item
- `DELETE /api/cart/:id` - Remove item
- `DELETE /api/cart` - Clear cart

### Orders
- `POST /api/orders` - Create order
- `POST /api/orders/guest` - Create guest order
- `GET /api/orders` - User orders
- `GET /api/orders/:id` - Get order
- `GET /api/orders/number/:number` - Get by order number

### Payments
- `POST /api/payments/manual` - Submit bKash/Nagad payment
- `POST /api/payments/card` - Initiate card payment
- `GET /api/payments/order/:orderId` - Payment status

### Admin
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/orders` - All orders
- `PATCH /api/admin/orders/:id` - Update order
- `GET /api/admin/users` - All users
- `PATCH /api/admin/users/:id` - Update user role

## 🎨 Design System

### Colors
- Primary: Gaming Cyan (#06b6d4)
- Secondary: Purple (#8b5cf6)
- Accent: Orange (#f97316)
- Background: Dark (#0f172a)
- Surface: Card (#1e293b)

### Typography
- Headings: Orbitron (Google Fonts)
- Body: Inter (Google Fonts)

### Components
- Glassmorphism cards
- Animated buttons
- Responsive grid layouts
- Loading skeletons
- Toast notifications

## 🔧 Scripts

### Frontend
```bash
npm run dev        # Start dev server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
```

### Backend
```bash
npm run dev        # Start dev server with nodemon
npm run build      # Compile TypeScript
npm run start      # Start production server
npm run seed       # Seed database
```

## 📦 Deployment

### Frontend (Vercel)
1. Push to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy

### Backend (Railway/Render)
1. Push to GitHub
2. Create new service
3. Connect MongoDB Atlas
4. Configure environment variables
5. Deploy

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

MIT License - feel free to use this project for learning and development.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Firebase](https://firebase.google.com/)
- [MongoDB](https://www.mongodb.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)

