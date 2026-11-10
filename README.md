::: {align="center"}
# 🍕 PizzaHut --- MERN Stack Pizza Ordering Platform

**A full-stack pizza ordering application powered by MongoDB,
Express.js, React, and Node.js.**

[![React](https://img.shields.io/badge/React-Frontend-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express.js-API-000000?logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Authentication-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)

[🌐 Live Website](https://pizzahut-mern.vercel.app/) · [⚙️
Backend](https://pizzahut-backend-gq8c.onrender.com/) · [🩺 Health
Check](https://pizzahut-backend-gq8c.onrender.com/api/health)
:::

------------------------------------------------------------------------

## 📖 About the Project

PizzaHut is a full-stack pizza ordering web application built with the
MERN stack. The React frontend communicates with a Node.js and Express
REST API, while MongoDB stores application data. Firebase Authentication
supports email/password and Google sign-in.

The backend is organized into dedicated route modules for pizzas, users,
administration, orders, inventory, customers, analytics, settings, and
payments.

**Deployment status:** The frontend is hosted on Vercel and the backend
on Render. Email/password login, Google login, logout, the pizza API,
and the public settings API have been tested successfully. Remaining
customer, payment, and administration workflows should be tested before
production release.

## ✨ Features

### Customer application

-   Browse pizza items retrieved from the backend.
-   View pizza details and images.
-   Search, filter, and sort the pizza collection where implemented.
-   Add pizzas to the cart.
-   Change item quantities and remove cart items.
-   Sign in with email/password or Google using Firebase Authentication.
-   Responsive interface for desktop and mobile.

### Backend

-   REST API built with Express.js.
-   MongoDB database integration.
-   Firebase authentication integration.
-   Dedicated route groups for pizzas, users, admin, orders, inventory,
    customers, analytics, settings, and payments.
-   Health-check and public settings endpoints.
-   CORS configured for the frontend deployment and local development.

## 🧰 Tech Stack

  Layer             Technologies
  ----------------- -------------------------------------
  Frontend          React, Vite
  Styling           Tailwind CSS / project styles
  Backend           Node.js, Express.js
  Database          MongoDB, Mongoose
  Authentication    Firebase Authentication
  HTTP              Fetch API, Axios
  Hosting           Vercel (frontend), Render (backend)
  Version control   Git, GitHub

*Refer to the package files in the repository for exact dependency
versions.*

## 📁 Project Structure

``` text
WebDev-L3-PizzaDelivery/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── firebase/
│   │   ├── pages/
│   │   └── ...
│   ├── package.json
│   └── .env                 # create locally; do not commit
│
├── server/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   │   ├── pizzaRoutes.js
│   │   ├── userRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── inventoryRoutes.js
│   │   ├── customerRoutes.js
│   │   ├── analyticsRoutes.js
│   │   ├── settingsRoutes.js
│   │   └── paymentRoutes.js
│   ├── server.js
│   └── package.json
│
└── README.md
```

*This is a representative structure based on the project files
discussed; folder names may differ slightly in your current checkout.*

## 🚀 Getting Started

### Prerequisites

-   Node.js and npm
-   MongoDB Atlas account or local MongoDB
-   Firebase project with a registered Web App
-   Git

### 1. Clone the repository

``` bash
git clone https://github.com/mukeshmannai14/OIBSIP.git
cd OIBSIP/WebDev-L3-PizzaDelivery
```

### 2. Install dependencies

``` bash
cd server
npm install

cd ../client
npm install
```

### 3. Configure backend environment

Create `server/.env`:

``` env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
CLIENT_URL=http://localhost:5173

# Configure these if required by your backend implementation:
# FIREBASE_PROJECT_ID=your_firebase_project_id
# FIREBASE_SERVICE_ACCOUNT_JSON=your_server_side_service_account_json
# RAZORPAY_KEY_ID=your_razorpay_key_id
# RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### 4. Configure frontend environment

Create `client/.env`:

``` env
VITE_API_URL=http://localhost:5000/api

VITE_FIREBASE_API_KEY=your_firebase_web_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

Replace placeholders with values from your own Firebase and service
dashboards.

**Environment variable security** - `VITE_API_URL` is the backend API
base URL and should include `/api`. - `CLIENT_URL` is the frontend
origin only; do not append `/api`. - Vite variables prefixed with
`VITE_` are included in browser-side builds. Never put private keys,
Firebase Admin credentials, service-account JSON, or payment secrets in
frontend variables. - Do not commit `.env` files or service-account JSON
files. - Enable Google sign-in in Firebase Authentication and add the
deployed frontend hostname to Firebase Authentication's authorized
domains.

### 5. Start the backend

From the `server/` directory, run the script defined in
`server/package.json`. Common commands are:

``` bash
npm start
```

If no `start` script exists, use the command configured by the project,
such as:

``` bash
node server.js
```

### 6. Start the frontend

In a second terminal:

``` bash
cd client
npm run dev
```

Vite commonly serves the local frontend at `http://localhost:5173`.

## 🔌 API Overview

The Express application mounts these route groups:

  Base path          Purpose
  ------------------ ----------------------
  `/api/health`      Backend health check
  `/api/pizzas`      Pizza resources
  `/api/users`       User operations
  `/api/admin`       Admin operations
  `/api/orders`      Order operations
  `/api/inventory`   Inventory operations
  `/api/customers`   Customer operations
  `/api/analytics`   Analytics operations
  `/api/settings`    Application settings
  `/api/payments`    Payment operations

### Known public endpoints

**Health check**

``` http
GET /api/health
```

Example response:

``` json
{
  "success": true,
  "message": "Server is healthy"
}
```

**Pizza list**

``` http
GET /api/pizzas
```

This deployed endpoint was tested and returned a successful JSON
response containing pizza records.

**Public settings**

``` http
GET /api/settings/public
```

For exact request bodies, authorization requirements, and additional
endpoints, see the corresponding route and controller files in
`server/routes/` and `server/controllers/`.

## ☁️ Deployment

### Frontend --- Vercel

Live URL: https://pizzahut-mern.vercel.app/

In Vercel → Project → Settings → Environment Variables, configure the
frontend variables above. Set the deployed API base URL to:

``` env
VITE_API_URL=https://pizzahut-backend-gq8c.onrender.com/api
```

Add the Firebase Web App configuration values. Redeploy after changing
environment variables because Vite reads them during the build.

### Backend --- Render

Backend URL: https://pizzahut-backend-gq8c.onrender.com/

In Render → Service → Environment, configure the MongoDB connection
string and:

``` env
CLIENT_URL=https://pizzahut-mern.vercel.app
```

Also add the server-side Firebase and payment credentials required by
the features enabled in your implementation. Keep these values private.

### CORS

Allow the exact deployed frontend origin and the local development
origin in the backend CORS configuration. If using a Vercel preview URL
or custom domain, authorize that hostname explicitly.

## 🧪 Testing Checklist

-   [ ] Frontend loads on desktop and mobile.
-   [ ] Pizza list and images load.
-   [ ] Search, filters, and sorting work.
-   [ ] Add-to-cart, quantity update, and remove actions work.
-   [x] Email/password authentication tested.
-   [x] Google authentication tested.
-   [x] Logout tested.
-   [ ] Checkout form validation works.
-   [ ] Payment success and failure flows are tested.
-   [ ] Orders are saved and can be retrieved.
-   [ ] Admin-only operations are protected by backend authorization.
-   [ ] Settings and other API requests work without CORS errors.
-   [ ] No credentials or secrets are committed to Git.

The checked authentication items reflect tests reported during
deployment troubleshooting. Unchecked items still require verification;
they are not claims that those features are broken.

## 🔐 Security Notes

-   Keep `.env` files out of version control.
-   Never commit Firebase Admin service-account JSON.
-   Never expose payment secret keys in frontend code.
-   Enforce authentication and role authorization on the backend for
    protected operations.
-   Restrict CORS to trusted frontend origins.
-   If a credential was exposed or committed, revoke or rotate it.
    Deleting the file in a later commit does not invalidate the
    credential.
-   Use payment test mode and test accounts while validating checkout.

## 🧯 Troubleshooting

  -----------------------------------------------------------------------
  Problem                             What to check
  ----------------------------------- -----------------------------------
  Frontend cannot reach API           Verify `VITE_API_URL`, Render
                                      service status, and the browser
                                      Network tab

  CORS error                          Check `CLIENT_URL` and the exact
                                      frontend origin allowed by the
                                      backend

  Firebase `auth/unauthorized-domain` Add the current frontend hostname
                                      in Firebase Authentication →
                                      Settings → Authorized domains

  Firebase auth-domain configuration  Verify `VITE_FIREBASE_AUTH_DOMAIN`
  error                               and redeploy Vercel

  MongoDB connection failure          Check `MONGODB_URI`, database
                                      credentials, and network access
                                      rules

  Environment changes do not appear   Redeploy the frontend or restart
                                      the backend after changing
                                      variables
  -----------------------------------------------------------------------

## 👨‍💻 Author

**Mukesh Kanna** --- Full Stack Developer (MERN Stack)

-   GitHub: [mukeshmannai14](https://github.com/mukeshmannai14)
-   Portfolio:
    [portfolio-mern-snowy.vercel.app](https://portfolio-mern-snowy.vercel.app/)
-   LinkedIn: [Mukesh Kanna](https://www.linkedin.com/)

## 📄 License

No license has been specified in the project details available for this
README. Add a `LICENSE` file to the repository if you intend to
distribute the project as open source.

------------------------------------------------------------------------

::: {align="center"}
**Built with ❤️ using the MERN stack**

⭐ If you find this project useful, consider giving the repository a
star.
:::
