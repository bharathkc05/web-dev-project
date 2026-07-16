# Velvet Bytes (EComSite)

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](#)
[![Version](https://img.shields.io/badge/version-1.0.0-blue)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Velvet Bytes is a comprehensive, highly scalable real-time food ordering and e-commerce platform. It is designed to manage complex multi-outlet restaurant businesses with a rich customer-facing application and a powerful administrative dashboard.

## Table of Contents
1. [Core Features](#core-features)
2. [Architecture Overview](#architecture-overview)
3. [Prerequisites & Technologies](#prerequisites--technologies)
4. [Project Structure](#project-structure)
5. [Installation & Setup](#installation--setup)
6. [Configuration & Environment](#configuration--environment)
7. [Running the Application](#running-the-application)
8. [API Documentation (Key Routes)](#api-documentation-key-routes)
9. [Event-Driven Workflows](#event-driven-workflows)
10. [Troubleshooting & FAQs](#troubleshooting--faqs)
11. [License & Credits](#license--credits)

---

## Core Features

- **Multi-Outlet Management**: Supports multiple restaurant locations. Products can be mapped to specific outlets or fetched from a global Master Catalogue.
- **Dynamic Menu Navigation**: Customers can navigate via Categories or QuickTabs.
- **Real-Time Order Tracking**: Powered by WebSockets, users receive live updates as their order moves from `PENDING` to `PREPARING`, `READY`, and `DELIVERED`.
- **Multiple Fulfillment Modes**: Supports Takeaway, Dine-in, and Delivery.
- **Event-Driven Processing**: Orders are handled asynchronously using Apache Kafka and BullMQ, ensuring high availability and fault tolerance during traffic spikes.
- **Role-Based Access Control**: Secure JWT authentication with strict roles (`ADMIN`, `OUTLET_MANAGER`, `CUSTOMER`).

---

## Architecture Overview

Velvet Bytes relies on a distributed architectural pattern to ensure scalability:
- **Client**: Built with React and Vite. It utilizes **Zustand** for global state and **React Query** for server-state caching and fetching. Features are decoupled into a Feature-Sliced Design.
- **API Server**: An Express.js backend handling REST APIs, input validation via Zod, and data persistence with MongoDB.
- **Message Broker (Kafka)**: Handles the `orders.events` topic. When a payment is successful, the order event is published to Kafka.
- **Background Workers (BullMQ)**: Processes order status updates, recalculates statistics, and handles heavy background tasks using Redis.
- **WebSockets (Socket.io)**: Connects the server directly to the client. Outlet Managers are placed in specific Socket rooms (e.g., `room=outletId`) to only receive notifications for their specific branch.

---

## Prerequisites & Technologies

### Client (Frontend)
- **Node.js**: v18+
- **Framework**: React 18 (Vite)
- **Styling**: Tailwind CSS, PostCSS, Framer Motion
- **State Management**: Zustand, @tanstack/react-query
- **Routing**: React Router DOM v6
- **Forms & Validation**: React Hook Form, Zod

### Server (Backend)
- **Node.js**: v18+
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose v8)
- **Caching & Queues**: Redis (ioredis), BullMQ
- **Message Broker**: Apache Kafka (kafkajs)
- **Real-Time**: Socket.io
- **Third-Party Integrations**: Razorpay (Payments), Cloudinary (Image uploads), Nodemailer (Emails)

---

## Project Structure

This project uses a strict feature-sliced architecture in the client, and modular, domain-driven isolation in the server.

```text
client/
├── public
├── src
│   ├── components
│   │   ├── data-display
│   │   ├── feedback
│   │   ├── forms
│   │   ├── layout
│   │   └── ui
│   ├── features
│   │   ├── admin
│   │   │   └── services
│   │   ├── auth
│   │   │   ├── components
│   │   │   ├── hooks
│   │   │   └── services
│   │   ├── cart
│   │   │   ├── components
│   │   │   ├── hooks
│   │   │   └── utils
│   │   ├── home
│   │   │   └── components
│   │   ├── orders
│   │   │   └── services
│   │   ├── outlets
│   │   │   └── services
│   │   ├── products
│   │   │   ├── components
│   │   │   ├── data
│   │   │   └── services
│   │   └── profile
│   ├── hooks
│   ├── pages
│   │   ├── Admin
│   │   │   ├── components
│   │   │   └── services
│   │   ├── Auth
│   │   ├── Cart
│   │   ├── Customer
│   │   ├── Home
│   │   ├── Manager
│   │   └── Menu
│   │       └── components
│   ├── router
│   ├── services
│   ├── store
│   ├── utils
│   └── main.jsx
├── .env
├── .env.example
├── index.html
├── package-lock.json
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── vite.config.js

server/
├── src
│   ├── config
│   │   └── index.js
│   ├── modules
│   │   ├── auth
│   │   ├── catalogue
│   │   ├── orders
│   │   ├── outlets
│   │   ├── products
│   │   └── users
│   ├── routes
│   │   └── index.js
│   ├── shared
│   │   ├── constants
│   │   ├── events
│   │   ├── kafka
│   │   ├── middleware
│   │   ├── models
│   │   └── utils
│   ├── app.js
│   └── server.js
├── .env
├── .env.example
├── .gitignore
├── docker-compose.yml
├── package-lock.json
├── package.json
└── velvet-bytes.postman_collection.json

```

---

## Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/EComSite.git
   cd EComSite
   ```

2. **Install Client Dependencies:**
   ```bash
   cd client
   npm install
   ```

3. **Install Server Dependencies:**
   ```bash
   cd ../server
   npm install
   ```

---

## Configuration & Environment

Create a `.env` file in both the `client` and `server` root folders.

### Server Environment Variables (`server/.env`)
```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/VelvetBytes
REDIS_URL=redis://localhost:6379            # Used for BullMQ, Rate Limiting, and API Caching
KAFKA_BROKERS=localhost:9092                # Comma separated list of Kafka brokers
JWT_SECRET=your_super_secret_key            # Must be a long, secure hash
JWT_EXPIRES_IN=7d
RAZORPAY_KEY_ID=your_razorpay_key_id        # From Razorpay Dashboard
RAZORPAY_KEY_SECRET=your_razorpay_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name       # For image hosting
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
SMTP_HOST=smtp.gmail.com                    # For password resets & invoices
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### Client Environment Variables (`client/.env`)
```env
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY=your_razorpay_key_id
```

---

## Running the Application

To run the project locally, open two terminal windows. Ensure your local or cloud Redis and Kafka instances are active.

**Terminal 1 (Backend):**
```bash
cd server
npm run dev
```
*The Express API will spin up on `http://localhost:5000`.*

**Terminal 2 (Frontend):**
```bash
cd client
npm run dev
```
*The Vite dev server will spin up on `http://localhost:5173`.*

---

## API Documentation (Key Routes)

All routes are prefixed with `/api`.

### Authentication
- `POST /auth/register` - Registers a new customer.
- `POST /auth/login` - Returns a JWT and user session metadata.
- `POST /auth/refresh` - Silent token refresh.

### Outlets
- `GET /outlets` - Retrieves all active, approved outlets.
- `GET /outlets/nearest?lat=-12.3&lng=45.6` - Retrieves the geographically nearest outlet.
- `GET /admin/outlets` (Admin Only) - Retrieves all outlets for dashboard review.

### Orders
- `POST /orders/checkout` - Initializes an order and returns a Razorpay order ID.
- `POST /orders/verify` - Verifies the Razorpay signature and publishes the order to Kafka.
- `GET /orders` (Protected) - Fetches the user's order history.
- `PATCH /orders/:id/status` (Outlet Manager Only) - Updates the status of an active order.

---

## Event-Driven Workflows

### The Checkout Flow
1. **Initiation**: The client hits `/orders/checkout`. The server calculates totals securely, avoiding client-side spoofing, and creates a Razorpay order.
2. **Payment**: The user completes payment on the client via Razorpay UI.
3. **Verification**: The client sends the payment signature to `/orders/verify`. The server validates the HMAC SHA256 signature.
4. **Kafka Publishing**: The server publishes an `ORDER_PLACED` event to the `orders.events` Kafka topic. The API immediately responds `200 OK` to the client without waiting for heavy database writes.
5. **Consumption & WebSockets**: The Kafka consumer picks up the event, updates the MongoDB document, and emits an `ORDER_NEW` event via WebSockets strictly to the room associated with the order's `outletId`.

---

## Troubleshooting & FAQs

**Q: I get a `getaddrinfo ENOTFOUND` error for Upstash/Redis.**
**A:** Your `REDIS_URL` is either invalid, or the connection timed out. Verify your internet connection or update your Upstash URL. The server is designed to fail gracefully if Redis goes down, but background jobs (BullMQ) will fail to execute.

**Q: My Kafka consumer is throwing `KafkaJSProtocolError`.**
**A:** Ensure your Kafka broker is running and accessible at `localhost:9092` (or the port defined in your env). Also ensure the topic `orders.events` exists or allow Kafka to auto-create topics.

**Q: Images are not uploading.**
**A:** Check your Cloudinary API keys. The `multer` and `cloudinary` middleware expects these to be exact.

---

## License & Credits

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).

Created and maintained by the Velvet Bytes team.
