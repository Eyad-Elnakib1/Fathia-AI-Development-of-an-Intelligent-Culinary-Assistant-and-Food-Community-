<div align="center">

<img src="docs/assets/logo.png" alt="Fridge Fusion Logo" width="120" />

# 🍽️ Fridge Fusion

**The Global Food Community Platform & AI Chef Assistant**

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Groq Llama-3.3](https://img.shields.io/badge/AI-Llama_3.3_70B-orange?style=for-the-badge)](https://groq.com/)

</div>

---

## 🎯 Executive Summary

**Fridge Fusion** is an all-in-one digital platform created for the **global food community**. It brings together everything related to food under one roof: global community recipe discovery, smart ingredient-based AI cooking assistance, personal cookbook management, health and calorie calculations, and recipe creation.

### The Problem It Solves
1. **Daily Meal Dilemmas**: People frequently ask *"What should I cook with the ingredients left in my fridge?"*
2. **Food Waste**: Billions of tons of fresh ingredients are thrown away annually due to lack of recipe inspiration for leftovers.
3. **Fragmented Tools**: Food lovers currently have to use separate apps for recipes, AI help, macro tracking, and personal cookbooks.

---

## 📸 Interactive Feature Showcase

| 🌍 World Recipe Library (Light) | 🌙 World Recipe Library (Dark) |
| :---: | :---: |
| <img src="docs/assets/world-library.png" alt="World Recipe Library" width="550" /> | <img src="docs/assets/world-library-dark.png" alt="Dark Mode Support" width="550" /> |
| **Real-time filtering & Multi-Criteria Search** | **Native CSS Variable Theme Switching** |

| 📝 Recipe Card Generator | 🃏 Interactive 3D Recipe Cards |
| :---: | :---: |
| <img src="docs/assets/create-recipe.png" alt="Create Custom Recipe" width="550" /> | <img src="docs/assets/card-show.png" alt="3D Card Flip" width="550" /> |
| **HTML5 FileReader Image Processing** | **CSS Grid Layouts & 3D Flip Animations** |

| 🔐 Secure JWT Login System | 📖 Personal Cookbook (My Recipes) |
| :---: | :---: |
| <img src="docs/assets/login.png" alt="JWT Login" width="550" /> | <img src="docs/assets/my-created-recipes.png" alt="Created Recipes" width="550" /> |
| **Stateless Authentication with Bcrypt Hashing** | **Manage & Delete User-Generated Recipes** |

| ❤️ Favorites Collection | 👤 User Profile Dashboard |
| :---: | :---: |
| <img src="docs/assets/favorite-page.png" alt="Favorite Recipes" width="550" /> | <img src="docs/assets/profile-page.png" alt="User Profile" width="550" /> |
| **Client-Synced Saved Recipes Hub** | **Avatar Uploads & Bio Management via Multer** |

| 👩‍🍳 Fatheia AI Chef Assistant |
| :---: |
| <img src="docs/assets/fatheia-ai.png" alt="Fatheia AI Chat" width="1000" /> |
| **Powered by Groq Llama-3.3-70B** |

---

## 🏗️ System Architecture

Fridge Fusion is architected as a robust MERN-stack monorepo integrating seamless AI orchestration. 

<details>
<summary><b>View Detailed Architecture Breakdown</b></summary>

### 1. Client Layer (React.js)
* **Single Page Application**: React 18 & React Router v6.
* **Styling**: Vanilla CSS3 Custom Design System (CSS Variables for Dark/Light Theme Switching, Glassmorphic overlays, 3D Card Flips).
* **State & Sync**: Axios HTTP Client for robust API communication.

### 2. Async API Gateway (Node.js & Express)
* **Security & Auth**: JSON Web Tokens (JWT) for stateless authentication and Bcrypt.js for salt-based password hashing.
* **File Uploads**: Multer middleware processing profile avatars and recipe images (`/uploads`).
* **AI Orchestration**: Groq API integration using `llama-3.3-70b-versatile` optimized for sub-2-second latency.

### 3. Database Layer (MongoDB)
* **Mongoose ODM**: Strongly typed data schemas for Users and Recipes.
* **Fallback Strategy**: Automatic fallback to an embedded `MongoMemoryServer` if local MongoDB is unavailable.

</details>

---

## 🧩 Module-by-Module Feature Breakdown

<details>
<summary><b>1. Authentication & Navigation</b></summary>

* **Landing Hub (`/`)**: Welcomes users with a showcase banner, dark/light toggle, and global navigation.
* **Auth System (`/login`, `/signup`)**: JWT-based registration, login, and a development mock email reset system.
</details>

<details>
<summary><b>2. Community & Private Recipes</b></summary>

* **World Library (`/home`)**: Real-time filtering by country, preparation time, and main ingredient. Click any 3D card to preview or view full instructions.
* **Personal Cookbook (`/my-recipes`)**: Private management of user-created recipes with CRUD operations.
* **Recipe Generator (`/recipe`)**: Interactive studio to create and publish custom recipe cards.
* **Favorites (`/favorite`)**: Saved recipes hub synced across client views.
</details>

<details>
<summary><b>3. AI & Health Utilities</b></summary>

* **Fatheia AI Chef (`/ai`)**: A strict food-only conversational AI assistant powered by Groq, providing step-by-step instructions.
* **Calorie & BMR Calculator (`/calories`)**: Uses the Mifflin-St Jeor Equation for BMR, TDEE, fitness goal targets, and macro ratios.
</details>

---

## ⚙️ Developer Setup & Environment Guide

### 1. Prerequisites
| Requirement | Minimum | Notes |
|---|---|---|
| **Node.js** | v16+ / v18+ | JavaScript runtime |
| **npm** | v8+ | Package manager |
| **MongoDB** | local or atlas | (Falls back to Memory Server if unavailable) |

### 2. Environment Configuration
Create a `.env` file in `backend/.env` based on `.env.example`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/fridge-fusion
JWT_SECRET=your_jwt_secret_key_here
GROQ_API_KEY=gsk_your_groq_api_key
```

### 3. Quick Start (Monorepo)
```bash
# Install dependencies for both frontend and backend
npm run install:all

# Start both servers concurrently
npm start
```
* **Backend**: `http://localhost:5000`
* **Frontend**: `http://localhost:3000`

---
*Architected and engineered for the global food community.*
