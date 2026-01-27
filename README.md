# 🐾 Pet Carry — Full Stack Trip Booking App

![Project Status](https://img.shields.io/badge/status-in%20progress-yellow) Two errors need amending and then initial development will finalise. 

This project is a comprehensive **Pet Carry** mobile app built during the [JavaScript Mastery](https://jsmastery.pro/) course. It uses the latest features of **React Native**, **Expo**, **TypeScript**, and a lightning-fast **edge-ready Postgres database (NeonDB)**.

Designed and taught by Adrian Hajdin of JavaScript Mastery, this build demonstrates how to architect a **scalable**, **responsive**, and **production-grade** application with advanced features like authentication, geolocation, payments, and state management.

![React Native](https://img.shields.io/badge/-React_Native-61DAFB?style=flat-square&logo=react&logoColor=black)
![Expo](https://img.shields.io/badge/-Expo-000020?style=flat-square&logo=expo&logoColor=white)
![Stripe](https://img.shields.io/badge/-Stripe-626CD9?style=flat-square&logo=stripe&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/-PostgreSQL-336791?style=flat-square&logo=postgresql&logoColor=white)
![Google Maps](https://img.shields.io/badge/-Google_Maps-4285F4?style=flat-square&logo=google-maps&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/-TailwindCSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)
![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Clerk](https://img.shields.io/badge/-Clerk-5A67D8?style=flat-square&logo=clerk&logoColor=white)
![Zustand](https://img.shields.io/badge/-Zustand-000000?style=flat-square)

---

## 🐛 Bugs

- **Splash Screen Issues**  
  The splash screen may not render correctly on certain devices or emulators. This is currently being investigated.

- **API Parsing Errors**  
  Some API calls may fail due to misconfiguration in the environment or server settings (I believe), resulting in data parsing errors. Placeholder data is currently used, but the underlying functionality is implemented and requires final testing after configuration adjustments.

---

## ⚙️ Tech Stack

- **React Native (Expo)** – Frontend mobile development
- **TypeScript** – Typed JavaScript for better maintainability
- **NeonDB (PostgreSQL)** – Edge-ready serverless relational database
- **Stripe** – Payment integration
- **Tailwind CSS** – Utility-first styling
- **Zustand** – Lightweight state management
- **Google Maps API** – Location services and routing
- **Google Places API** – Location autocomplete
- **Clerk** – Authentication and user management

---

## 🔋 Features

👉 **Onboarding Flow**  
👉 **Email & Password Authentication with Verification**  
👉 **OAuth Using Google**   
👉 **Home Screen with Live Location & Google Map**  
👉 **Recent Trips Overview**  
👉 **Find Trips by Location**  
👉 **Select Trips from Nearby Cars on Map**  
👉 **Confirm Trip with Time and Price Details**  
👉 **Pay for Trip Using Stripe**  
👉 **Trip Created After Successful Payment**  
👉 **User Profile Management**  
👉 **View Trip History**

---

## 🤸 Quick Start

### ✅ Prerequisites

Make sure you have the following installed:

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)

### 📦 Install Dependencies

npm install

### 🔐 Set Up Environment Variables

Create a .env file in the root of your project and add:

- EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=
- EXPO_PUBLIC_PLACES_API_KEY=
- EXPO_PUBLIC_DIRECTIONS_API_KEY=
- DATABASE_URL=
- EXPO_PUBLIC_SERVER_URL=https://petcarry.dev/
- EXPO_PUBLIC_GEOAPIFY_API_KEY=
- EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=
- STRIPE_SECRET_KEY=

### Start the App

- npx expo start

---

## 📺 Course Link

This project was built using the [JavaScript Mastery Trip Booking Course](https://jsm.dev/uber-kit).  
Watch the full tutorial on YouTube:  
🔗 [Build a Full Stack Trip Booking App (YouTube)](https://www.youtube.com/watch?v=1xHqHNX6B6I)

---

## 📄 License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).

---

## ⭐ Support

If you found this project helpful, consider giving it a ⭐ on GitHub and joining the JSMastery community:

- [JS Mastery Discord](https://discord.gg/jsmastery)
- [JS Mastery Pro](https://jsm.dev/uber-jsmpro)
- [More Projects](https://jsm.dev/uber-kit)
