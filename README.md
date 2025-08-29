# M-Pesa Escrow Application

This project is a high-fidelity, interactive frontend prototype for a secure escrow application designed to integrate with M-Pesa through the Daraja API. It features complete, role-based UIs for Buyers, Sellers, and Administrators, simulating the entire escrow lifecycle from transaction creation to dispute resolution and platform revenue management.

## Key Features Implemented in the Prototype

This React-based prototype is fully interactive and manages its state in-memory to simulate a complete user experience.

-   **Role-Based Authentication:** Distinct login, signup, and dashboard experiences for regular users and administrators.
-   **Comprehensive Admin Dashboard:**
    -   **Analytics:** KPI cards (Total Volume, Disputes) and a transaction volume chart.
    -   **Management:** Centralized views for all transactions, disputes, and users.
    -   **Security:** User blacklisting, KYC verification queue, and a fraud detection system for flagging suspicious transactions.
    -   **Financials:** Platform revenue tracking from a 5% transaction fee and a secure withdrawal system.
    -   **Oversight:** A detailed, real-time audit log of all significant platform events.
-   **Interactive User Dashboard:**
    -   **Dual Roles:** Users can toggle between "Buyer" and "Seller" views.
    -   **Complete Escrow Flow:** Create transactions, accept/reject offers, chat in real-time, update delivery status, and perform dual confirmation to release funds.
    -   **Trust & Safety:** A robust dispute resolution system, a rating and review system, and visible KYC verification badges.
    -   **Personalization:** Users can manage their profiles, change avatars, and set granular (In-App, Email, SMS) notification preferences.
    -   **Seller Analytics:** A dedicated dashboard for sellers to track their earnings and sales performance.
-   **Mobile-First Responsive Design:** The entire application, including complex data tables and navigation, is optimized for a seamless experience on both desktop and mobile devices.

---

## Technical Architecture (Conceptual)

This frontend prototype is designed to connect to a backend built on the following stack:

-   **Backend:** Node.js with Express.js
-   **Database:** PostgreSQL
-   **Payment Gateway:** Safaricom M-Pesa Daraja API
-   **Authentication:** JSON Web Tokens (JWT)

The frontend would communicate with the backend via a RESTful API. The backend would handle all business logic, database interactions, and secure communication with the Daraja API.

---

## Guide to Building the Backend

This section outlines the necessary steps to build a backend that can power this frontend application.

### 1. Database Setup (PostgreSQL)

You will need a PostgreSQL database with the following tables. This schema is designed to support all features of the application.

```sql
-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE kyc_status AS ENUM ('Not Submitted', 'Pending Review', 'Verified', 'Rejected');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Store hashed passwords only!
    role user_role NOT NULL DEFAULT 'user',
    avatar_url VARCHAR(255),
    is_blacklisted BOOLEAN NOT NULL DEFAULT false,
    kyc_status kyc_status NOT NULL DEFAULT 'Not Submitted',
    -- JSONB is efficient for storing nested preference objects
    notification_preferences JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Transactions Table
CREATE TYPE transaction_status AS ENUM ('Awaiting Seller Acceptance', 'Pending', 'Completed', 'Disputed', 'Canceled', 'Released', 'Refunded', 'Rejected');
CREATE TYPE delivery_status AS ENUM ('Awaiting Shipment', 'Shipped', 'Delivered');
CREATE TYPE currency_type AS ENUM ('KES', 'USD');

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id UUID NOT NULL REFERENCES users(id),
    seller_id UUID NOT NULL REFERENCES users(id),
    product VARCHAR(255) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    fee NUMERIC(10, 2) NOT NULL,
    total_amount_charged NUMERIC(12, 2) NOT NULL,
    currency currency_type NOT NULL,
    terms TEXT,
    status transaction_status NOT NULL,
    delivery_status delivery_status NOT NULL DEFAULT 'Awaiting Shipment',
    buyer_confirmed BOOLEAN NOT NULL DEFAULT false,
    seller_confirmed BOOLEAN NOT NULL DEFAULT false,
    is_flagged BOOLEAN NOT NULL DEFAULT false,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Disputes Table
CREATE TYPE dispute_status AS ENUM ('Open', 'Resolved');

CREATE TABLE disputes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID NOT NULL REFERENCES transactions(id),
    raised_by_id UUID NOT NULL REFERENCES users(id),
    reason TEXT NOT NULL,
    status dispute_status NOT NULL DEFAULT 'Open',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- Messages Table (for both transactions and disputes)
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID REFERENCES transactions(id),
    dispute_id UUID REFERENCES disputes(id),
    sender_id UUID NOT NULL REFERENCES users(id),
    text TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Ensure a message belongs to either a transaction or a dispute, not both
    CONSTRAINT fk_context CHECK (transaction_id IS NOT NULL OR dispute_id IS NOT NULL)
);
```

### 2. Backend API Endpoints

Your Node.js/Express server should expose the following RESTful API endpoints. The frontend prototype's state logic can be mapped directly to these routes.

**Authentication**
-   `POST /api/auth/signup`: Create a new user.
-   `POST /api/auth/login`: Authenticate a user and return a JWT.

**User Actions**
-   `GET /api/user/transactions`: Get all transactions for the logged-in user.
-   `PUT /api/user/profile`: Update the user's profile details.
-   `PUT /api/user/avatar`: Update the user's avatar.
-   `PUT /api/user/notifications`: Update notification preferences.
-   `POST /api/user/kyc-submit`: User submits their KYC for review.

**Transaction Actions**
-   `POST /api/transactions`: Create a new transaction (initiates STK Push).
-   `GET /api/transactions/:id`: Get details for a single transaction.
-   `POST /api/transactions/:id/message`: Add a message to the transaction chat.
-   `PUT /api/transactions/:id/confirm`: Buyer or seller confirms a step.
-   `PUT /api/transactions/:id/delivery-status`: Seller updates delivery status.
-   `PUT /api/transactions/:id/respond`: Seller accepts or rejects a transaction.
-   `POST /api/transactions/:id/dispute`: Buyer raises a dispute.
-   `POST /api/transactions/:id/review`: Buyer leaves a rating and review.

**Admin Actions**
-   `GET /api/admin/dashboard-stats`: Get all statistics for the dashboard.
-   `GET /api/admin/transactions`: Get all platform transactions with filtering.
-   `GET /api/admin/users`: Get all users.
-   `PUT /api/admin/users/:id/blacklist`: Toggle a user's blacklist status.
-   `GET /api/admin/kyc-submissions`: Get all users with `Pending Review` status.
-   `PUT /api/admin/kyc-submissions/:id`: Approve or reject a KYC submission.
-   `POST /api/admin/disputes/:id/resolve`: Resolve a dispute (release or refund).
-   `PUT /api/admin/transactions/:id/flag`: Dismiss a flag or cancel a flagged transaction.
-   `GET /api/admin/settings`: Get platform financial settings.
-   `PUT /api/admin/settings`: Update platform financial settings.
-   `POST /api/admin/withdraw`: Initiate a withdrawal of platform fees.

### 3. M-Pesa Daraja API Integration

This is the most complex part of the backend. You will need a developer account on the [Safaricom Daraja Portal](https://developer.safaricom.co.ke/).

**Key Steps:**

1.  **Get Credentials:** Obtain your `Consumer Key` and `Consumer Secret` from the portal for the Sandbox (testing) and Production environments. Store these securely in a `.env` file.

2.  **Authentication:** Create a function to request an access token from the `/oauth/v1/generate?grant_type=client_credentials` endpoint. This token is required for all subsequent API calls and expires every hour.

3.  **STK Push (C2B - Customer to Business):**
    *   This is used when the buyer pays into the escrow wallet.
    *   You will make a `POST` request to the `/mpesa/stkpush/v1/processrequest` endpoint.
    *   **Body includes:** `BusinessShortCode`, `Timestamp`, `TransactionType`, `Amount`, `PartyA` (buyer's phone), `PartyB` (your shortcode), `PhoneNumber`, `CallBackURL`, `AccountReference`, `TransactionDesc`.
    *   **Callback:** The `CallBackURL` is crucial. It's an endpoint on your server that Daraja will call asynchronously to inform you if the payment was successful or failed. You must process this callback to confirm the funds are received before marking the transaction as `Pending`.

4.  **B2C (Business to Customer):**
    *   This is used to release funds from the escrow to the seller.
    *   You will make a `POST` request to the `/mpesa/b2c/v1/paymentrequest` endpoint.
    *   **Body includes:** `InitiatorName`, `SecurityCredential` (encrypted), `CommandID`, `Amount`, `PartyA` (your shortcode), `PartyB` (seller's phone), `Remarks`, `QueueTimeOutURL`, `ResultURL`.
    *   **Result URL:** Similar to the callback, this is an endpoint on your server where Daraja will post the result of the B2C transaction.

---

## Connecting the Frontend

To connect this React prototype to your new backend, you would replace all in-memory state manipulations in `App.tsx` with API calls.

**Example: User Login**

**Before (Current Prototype):**
```typescript
// In App.tsx
const handleLogin = (user: User) => {
    setCurrentUser(user);
};
```

**After (Connected to Backend):**
```typescript
// In App.tsx
const handleLogin = async (formData: Record<string, string>) => {
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });

        if (!response.ok) {
            // Handle login error (e.g., show message from server)
            return;
        }

        const { user, token } = await response.json();
        localStorage.setItem('authToken', token); // Store JWT
        setCurrentUser(user);

    } catch (error) {
        console.error('Login failed:', error);
    }
};
```

This pattern would be repeated for all state-changing actions (creating transactions, sending messages, resolving disputes, etc.).

---

## Running the Frontend Prototype

No build step is required for this prototype. Simply open the `index.html` file in a modern web browser. All dependencies are loaded from a CDN.
```

