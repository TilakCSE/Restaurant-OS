🍽️ Restaurant OS (PC's Kitchen)

A full-stack, real-time Restaurant Operating System built to eliminate SaaS fees and streamline operations for "PC's Kitchen".

Live Demo: https://restaurant-os-eosin.vercel.app/

(Note: To test ordering, append /?table=1 to the URL)

🚀 The Problem

Most restaurants pay heavy monthly subscriptions for POS software (Petpooja, DotPe) that is often clunky and requires expensive hardware.
The Goal: Build a custom, lightweight PWA (Progressive Web App) that runs on existing smartphones and handles the entire "Order -> Kitchen -> Bill" flow with zero latency.

💡 The Solution

Restaurant OS is a serverless application where:

Customers scan a QR code to order (No app download required).

Kitchen Staff receive orders instantly on a tablet/phone (KDS).

Waiters can add items manually for illiterate customers.

** Owners** get real-time sales data and bill totals.

✨ Key Features

📱 Customer Interface

Smart QR Logic: Automatically detects Table No. (e.g., ?table=5) or Parcel Mode.

Optimized Menu: Uses next-gen .avif images for lightning-fast loading.

Variant Logic: Handles Half/Full portion sizing seamlessly.

Cart System: Local state management for a snappy experience.

👨‍🍳 Kitchen Display System (KDS)

Real-time Sync: Uses Firebase Firestore listeners to flash new orders instantly (<100ms latency).

Audio Alerts: Plays a "Service Bell" sound when a new ticket arrives.

Visual Tags: Distinct UI for Dining vs. Takeaway/Parcel orders to prevent packing errors.

Security: PIN-protected access (Default: 1234) to prevent unauthorized access.

💼 Staff Dashboard

Waiter Mode: Manual order entry for walk-ins or phone orders.

Live Bills: Automatically groups multiple "KOTs" (Kitchen Order Tickets) into a single Table Bill.

Status Tracking: Mark items as "Served" or "Paid" to clear the queue.

🛠️ Tech Stack

Frontend: React.js (Vite)

Styling: Tailwind CSS (Mobile-first design)

Backend (Serverless): Google Firebase (Firestore Database)

Icons: Lucide React

Deployment: Vercel (CI/CD)

Asset Optimization: AVIF image compression

🏗️ Local Setup

Clone the repository

git clone [https://github.com/yourusername/restaurant-os.git](https://github.com/yourusername/restaurant-os.git)
cd restaurant-os


Install Dependencies

npm install


Configure Environment Variables
Create a .env file in the root directory and add your Firebase credentials:

VITE_API_KEY=your_api_key
VITE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_PROJECT_ID=your_project_id
# ... add other firebase config keys


Run Locally

npm run dev


Open http://localhost:5173/?table=1 to test.

🔒 Security

Environment Variables: API keys are injected at build time via Vercel, kept out of the codebase.

Firestore Rules: Database is locked down to prevent deletion of order history and validate incoming data structure.

Staff Auth: Simple PIN-based entry for kitchen operations.

📸 Usage

Customer View

Kitchen View

Scan QR -> Select Items -> Place Order

Hear Bell -> View Ticket -> Cook -> Serve

Built with ❤️ for PC's Kitchen.