# LinkTrackr - Full-Stack URL Shortening Service

A full-stack web application built with the MERN stack that allows users to shorten long URLs, manage their links, and track detailed click analytics.

## Features

- **Secure User Authentication:** Users can register and log in securely, with session management handled by JWT.
- **URL Shortening:** Create short, unique links for any long URL, with the option to create custom aliases.
- **Link Management Dashboard:** View, manage, and delete all your created links in a clean, paginated table.
- **Detailed Analytics:** Track the total number of clicks, see click history over time, and view a breakdown of clicks by device (Desktop, Mobile, etc.).
- **QR Code Generation:** Instantly generate and download a QR code for any short link.
- **Custom Modals:** A professional and user-friendly experience for confirmations and displaying QR codes.

## Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Recharts
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (with Mongoose)
- **Authentication:** JWT (JSON Web Tokens), bcrypt
