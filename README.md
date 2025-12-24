Z-Bridges PMS (Zero-Cost Property Management System)

A full-stack, open-source Property Management System architected for Zero-Cost Scaling.

Built with Vanilla JS, Tailwind CSS, and Firebase, designed to run entirely on GitHub Pages without a dedicated backend server.

🏗️ Architecture: The "Dual-Mode" Engine

This application features a unique Adaptive Architecture that allows it to run in two modes depending on the environment:

Mode

Trigger

Storage

Use Case

Local Prototype

Default (No config.js found)

localStorage

Demos, testing, development without internet.

Cloud Production

js/config.js is present

Firebase Firestore

Live deployment, multi-user data sync.

🚀 Deployment Guide

1. Zero-Cost Hosting (GitHub Pages)

This repository is optimized for GitHub Pages.

Fork this repo.

Go to Settings > Pages.

Set the source to main branch (or /root).

Your site is live! It will run in Local Prototype Mode by default.

2. Enabling Production Mode (Firebase)

To enable real-time database features, you must inject your credentials securely.

⚠️ SECURITY WARNING: NEVER commit js/config.js to the repository.

Create a project at Firebase Console.

Enable Firestore Database and Authentication.

Create a file named js/config.js locally (this file is .gitignored).

Copy the contents of js/config.example.js into it.

Replace the placeholder values with your keys from the Firebase Console.

// js/config.js
export const FIREBASE_CONFIG = {
  apiKey: "YOUR_ACTUAL_KEY",
  authDomain: "...",
  // ...
};


3. Manager Console

The manager.html dashboard provides an admin view of the system.

Default Login: In Local Mode, any login works.

Production Login: Requires Firebase Auth (Email/Password) set up in the console.

🛠️ Development

Folder Structure

js/app.js: The central logic engine. Handles state and Firebase initialization.

js/admin-ui.js: UI logic for the Manager Dashboard.

js/config.example.js: Template for credentials.

*.html: Views (Portal, Manager, Login).

"Zero-Cost" Constraints

No Node.js Server: All logic runs client-side or via Serverless Functions (future).

No Build Step: Uses ES Modules (<script type="module">) and CDN-hosted Tailwind CSS.

🤝 Contributing

Fork the repository.

Create a feature branch (git checkout -b feature/AmazingFeature).

Commit your changes.

Push to the branch.

Open a Pull Request.

📄 License

Distributed under the MIT License. See LICENSE for more information.
