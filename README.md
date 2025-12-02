
# 🍽️ Restaurant OS — PC's Kitchen

[![Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://restaurant-os-eosin.vercel.app/) [![Vercel](https://img.shields.io/badge/deploy-vercel-black?logo=vercel)](https://vercel.com/) [![React](https://img.shields.io/badge/react-^18.0-blue?logo=react)](https://reactjs.org/) [![Tailwind](https://img.shields.io/badge/tailwind-css-teal?logo=tailwind-css)](https://tailwindcss.com/) [![Firebase](https://img.shields.io/badge/firebase-firestore-yellow?logo=firebase)](https://firebase.google.com/) [![License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

> Production-grade Restaurant POS & Kitchen Display System (KDS) tailored for **PC's Kitchen** — lightweight, serverless, and fast. Replace expensive SaaS subscriptions (Petpooja/DotPe) with a custom solution that handles QR self-ordering → kitchen workflow → billing.

---

## 🔗 Live Demo
**Production URL:** https://restaurant-os-eosin.vercel.app/

**How to test**
- Customer (Table 1): `https://restaurant-os-eosin.vercel.app/?table=1`  
- Parcel/Takeaway: `https://restaurant-os-eosin.vercel.app/?table=PARCEL`  
- Kitchen/Staff: Open the main link and enter **PIN: `1234`**

---

## 📋 Table of Contents
1. [Key Features](#-key-features)
2. [Screenshots](#-screenshots)
3. [Tech Stack](#-tech-stack)
4. [Local Development](#-local-development)
5. [Environment Variables](#-environment-variables)
6. [Firestore Security Rules (example)](#-firestore-security-rules-example)
7. [Deployment](#-deployment)
8. [Roadmap](#-roadmap)
9. [Contributing](#-contributing)
10. [License & Credits](#-license--credits)

---

## ✨ Key Features

### Customer Interface (Self-Ordering)
- ✅ Smart QR / URL logic: `?table=<ID>` assigns table automatically  
- ✅ Takeaway/Parcel mode with visible PARCEL badge  
- ✅ AVIF-optimized assets for super-fast menu loading  
- ✅ Portion variants (Half / Full) + dynamic pricing

### Kitchen Display System (KDS)
- ⚡ Real-time sync with **Firestore** (sub-100ms updates)  
- 🔔 Automatic audio alert (service bell) on new tickets  
- 🎯 Color-coded/differentiated view for Dine-in vs Parcel  
- ✔ Ticket lifecycle: `Pending -> Preparing -> Ready/Served`

### Staff Dashboard
- 🧾 Waiter Mode for manual orders (phone/illiterate customers)  
- 🧮 Live bill grouping (combine initial + extra orders into single table bill)  
- 🔒 PIN-protected admin (default `1234`)

---

---

## 🛠️ Tech Stack

- **Frontend:** React.js + Vite  
- **Styling:** Tailwind CSS (mobile-first)  
- **Backend / Realtime DB:** Firebase Firestore  
- **Hosting / CI:** Vercel  
- **Icons:** Lucide React  
- **Assets:** AVIF images for performance

---

## ⚙️ Local Development

### 1. Clone
```bash
git clone https://github.com/your-username/restaurant-os.git
cd restaurant-os
````

### 2. Install

```bash
npm install
```

### 3. Setup environment

Create `.env` in the project root (Vite requires `VITE_` prefix):

```
VITE_API_KEY=your_api_key
VITE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_PROJECT_ID=your_project_id
VITE_STORAGE_BUCKET=your_bucket
VITE_MESSAGING_SENDER_ID=your_sender_id
VITE_APP_ID=your_app_id
```

> ⚠️ **Do not commit** `.env` — add it to `.gitignore`.

### 4. Run local dev server

```bash
npm run dev
# open http://localhost:5173 (or printed dev url)
```

---

## 🔐 Firestore Security Rules (example)

> These sample rules illustrate basic protections — adapt to your Firestore data model before deploying.

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Orders collection
    match /orders/{orderId} {
      allow read: if true; // Public read for kitchen/customer UI (limit fields in client)
      allow create: if request.auth == null || request.auth != null; // allow anonymous ordering
      allow update: if
        // Only allow allowed status transitions
        request.resource.data.keys().hasOnly(['status','items','table','createdAt','updatedAt']) &&
        isValidStatusTransition(resource.data.status, request.resource.data.status);
      allow delete: if false; // prevent deletion to maintain audit trail
    }

    // A helper function (pseudo, replace with explicit checks)
    function isValidStatusTransition(oldStatus, newStatus) {
      return (oldStatus == "PENDING" && (newStatus in ["PREPARING","CANCELLED"])) ||
             (oldStatus == "PREPARING" && (newStatus in ["READY","CANCELLED"])) ||
             (oldStatus == "READY" && (newStatus == "SERVED"));
    }
  }
}
```

---

## 📦 Deployment

* Uses Vercel for deployment (automatic from `main` branch).
* Ensure Vercel environment variables mirror `.env` keys (prefixed w/ `VITE_`).
* Firebase rules & indexes should be pushed using Firebase CLI:

```bash
npm install -g firebase-tools
firebase deploy --only firestore,hosting
```

---

## 🔮 Roadmap

* [ ] Razorpay integration for online payments
* [ ] Daily sales PDF report export
* [ ] Inventory management (auto stock deduction)
* [ ] Multi-terminal support (individual chef stations)
* [ ] Offline-first queue handling & reconciliation

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/<feature-name>`
3. Commit your changes: `git commit -m "feat: add ..."`
4. Push and create a Pull Request

Please open issues for bugs or feature requests. Add descriptive titles and steps to reproduce.

---

## 🧪 Testing Notes / QA Checklist

* [ ] Verify `?table=<id>` maps correctly to table UI and bills group correctly.
* [ ] Test Parcel flow: UI shows PARCEL badge & KDS displays packing priority.
* [ ] Firestore rules: try invalid status transitions — they should fail.
* [ ] Confirm audio alerts fire on new ticket arrival across devices.

---

## 📄 License & Credits

**License:** MIT — see `LICENSE` file.

**Credits & Thanks**

* Built with ❤️ using React, Tailwind, Firebase, and Vercel.
* Icons: Lucide React
* Thanks to PC's Kitchen for the real-world product inspiration.

---

## 📬 Contact

If you want enhancements, help with deployment, or feature collaboration — open an issue or reach me at:

* GitHub: `https://github.com/TilakCSE`
* Project: `https://restaurant-os-eosin.vercel.app/`

---

## 📌 Example `package.json` scripts (suggested)

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
  "format": "prettier --write ."
}
