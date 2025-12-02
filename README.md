🍽️ Restaurant OS (PC's Kitchen)

Production-grade Restaurant POS & Kitchen Display System (KDS) built specifically for PC's Kitchen.

This project replaces expensive SaaS subscriptions (like Petpooja/DotPe) with a custom, high-performance Serverless solution. It handles the complete lifecycle of a restaurant order: from QR scan to Kitchen notification to Bill generation.

🌐 Live Demo

Production URL: https://restaurant-os-eosin.vercel.app/

How to Test:

Customer Mode (Table 1): Add /?table=1 to the URL.

Parcel Mode: Add /?table=PARCEL to the URL.

Kitchen/Staff Mode: Open the main link and enter PIN 1234.

✨ Key Features

📱 Customer Interface (Self-Ordering)

Smart QR Logic: The app reads the URL (?table=5) to automatically assign orders to the correct table.

Takeaway Mode: Dedicated UI for Parcel orders (Yellow "Takeaway" badge) to ensure correct packing by the kitchen.

Performance: Uses next-gen .AVIF image formats for instant menu loading even on slow 4G networks.

Variants: Supports Half/Full portion sizing with dynamic price calculation.

👨‍🍳 Kitchen Display System (KDS)

Real-time Sync: Powered by Firebase Firestore. Orders appear instantly (<100ms) without refreshing the page.

Audio Alerts: Plays a Service Bell sound automatically when a new ticket arrives.

Visual Priority: Distinct visual styles for Dine-in vs Parcel orders.

Workflow: Chefs can mark tickets as "Served/Ready" to remove them from the queue.

💼 Staff Dashboard

Waiter Mode: Allows staff to take orders manually for illiterate customers or phone orders.

Live Bills: Automatically groups multiple tickets (e.g., initial order + extra roti) into a single Table Total.

Security: PIN-protected (Default: 1234) interface to prevent customers from accessing admin tools.

🛠️ Tech Stack

Frontend: React.js + Vite

Styling: Tailwind CSS (Mobile-First Architecture)

Backend: Google Firebase (Firestore NoSQL Database)

Hosting: Vercel (CI/CD)

Icons: Lucide React

Assets: Optimized AVIF images

⚙️ Local Development Setup

If you want to run this project on your own machine:

Clone the repository

git clone [https://github.com/your-username/restaurant-os.git](https://github.com/your-username/restaurant-os.git)
cd restaurant-os


Install Dependencies

npm install


Setup Environment Variables
Create a .env file in the root directory and add your Firebase keys (The project uses Vite, so keys must start with VITE_):

VITE_API_KEY=your_api_key
VITE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_PROJECT_ID=your_project_id
VITE_STORAGE_BUCKET=your_bucket
VITE_MESSAGING_SENDER_ID=your_sender_id
VITE_APP_ID=your_app_id


Run Locally

npm run dev


🔒 Security Implementation

Client-Side: API keys are injected at build time via environment variables.

Database: Firestore Security Rules are configured to:

Validate data types (prevent garbage data injection).

Prevent deletion of order history (audit trail).

Allow only valid status updates (Pending -> Completed).

🔮 Future Roadmap

[ ] Integration with Razorpay for Online Payments.

[ ] Daily Sales Report generation (PDF Download).

[ ] Inventory Management (Auto-deduct stock).

Built with ❤️ for PC's Kitchen