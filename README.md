{align="center"}
# 🍕 PizzaHut

### MERN Stack Pizza Ordering Application

A full-stack pizza ordering platform with Firebase authentication, a
React frontend, and an Express/MongoDB backend.

[![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express.js-000000?logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)

[🌐 Live Demo](https://pizzahut-mern.vercel.app/) · [🔌 Backend
API](https://pizzahut-backend-gq8c.onrender.com/) · [💻 GitHub
Repository](https://github.com/mukeshmannai14/OIBSIP)
:::

------------------------------------------------------------------------

## ✨ Features

-   Browse pizza items from the backend API.
-   Search, filter, and sort pizzas (as implemented in the UI).
-   Add pizzas to cart, update quantities, and remove items.
-   Firebase authentication with email/password and Google sign-in.
-   Separate backend routes for pizzas, users, admin, orders, inventory,
    customers, analytics, settings, and payments.
-   MongoDB database integration.
-   Responsive React frontend.

## 🛠️ Tech Stack

  Frontend                        Backend               Database & Services
  ------------------------------- --------------------- -------------------------
  React, Vite                     Node.js, Express.js   MongoDB, Mongoose
  Tailwind CSS / project styles   REST API              Firebase Authentication
  Fetch API, Axios                CORS                  Vercel, Render

## 📂 Project Structure

``` text
WebDev-L3-PizzaDelivery/
├── client/          # React + Vite frontend
└── server/          # Express API and MongoDB integration
    ├── config/
    ├── controllers/
    ├── middleware/
    ├── models/
    ├── routes/
    └── server.js
```

## 🚀 Run Locally

**1. Clone the repository**

``` bash
git clone https://github.com/mukeshmannai14/OIBSIP.git
cd OIBSIP/WebDev-L3-PizzaDelivery
```

**2. Install dependencies**

``` bash
cd server && npm install
cd ../client && npm install
```

**3. Configure environment variables**

Create `server/.env`:

``` env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
CLIENT_URL=http://localhost:5173
```

Create `client/.env`:

``` env
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

Add any additional backend-only Firebase or payment secrets required by
your implementation to `server/.env`.

**4. Start the application**

Run the backend in one terminal:

``` bash
cd server
npm start
```

Run the frontend in another terminal:

``` bash
cd client
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`).

## 🔗 Deployment & API

  ----------------------------------------------------------------------------------------------------
  Service                             URL
  ----------------------------------- ----------------------------------------------------------------
  Frontend                            https://pizzahut-mern.vercel.app/

  Backend                             https://pizzahut-backend-gq8c.onrender.com/

  Health check                        https://pizzahut-backend-gq8c.onrender.com/api/health

  Pizza API                           https://pizzahut-backend-gq8c.onrender.com/api/pizzas

  Public settings                     https://pizzahut-backend-gq8c.onrender.com/api/settings/public
  ----------------------------------------------------------------------------------------------------

Backend route groups are mounted under `/api`: `pizzas`, `users`,
`admin`, `orders`, `inventory`, `customers`, `analytics`, `settings`,
and `payments`.

## 🔐 Environment & Security

-   Set `VITE_API_URL` to the deployed API base URL in Vercel.
-   Set `CLIENT_URL` to the frontend origin in Render (no `/api`
    suffix).
-   Add your frontend domain to Firebase Authentication → Authorized
    domains.
-   Never commit `.env` files, Firebase service-account JSON, or payment
    secrets.
-   Keep private credentials on the backend only. Redeploy after
    changing Vercel environment variables.

## ✅ Project Status

**Verified:** Email/password login, Google login, logout, pizza API, and
public settings API were tested successfully during deployment.

**Still to test:** Complete checkout, payment success/failure, order
persistence, admin permissions, and mobile interactions.

## 👨‍💻 Author

**Mukesh Kanna** · Full Stack Developer

-   GitHub: [mukeshmannai14](https://github.com/mukeshmannai14)
-   Portfolio:
    [portfolio-mern-snowy.vercel.app](https://portfolio-mern-snowy.vercel.app/)

------------------------------------------------------------------------

::: {align="center"}
**Built with ❤️ using the MERN stack**
:::
