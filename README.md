<div align="center">

<img src="frontend/images/logo.svg" alt="Bondly Logo" width="90" />

# Bondly

**Connect, share, and bond with people.**

A full-stack mini social media platform built from scratch with HTML, CSS, JavaScript, Node.js, Express, and MongoDB.

🔗 **Live App:** [codealpha-bondly.netlify.app](https://codealpha-bondly.netlify.app)
🔗 **API:** [codealpha-mini-social-media-wjp2.onrender.com](https://codealpha-mini-social-media-wjp2.onrender.com)

</div>

---

## 📖 About

Bondly is a mini social media platform built as part of the **CodeAlpha Web Development Internship**. It supports user authentication, posts with images, likes, comments, a follow system, real-time-ish notifications, and more — built entirely with vanilla JavaScript on the frontend (no frameworks) and a custom REST API on the backend.

The app is fully deployed and installable as a **Progressive Web App (PWA)** on both desktop and mobile.

---

## ✨ Features

### Authentication
- Secure signup & login with **JWT** authentication
- Passwords encrypted with **bcrypt**
- Protected routes via auth middleware

### Profiles
- Editable name, bio, and profile photo (image upload)
- Followers / Following counts with a clickable list modal
- Mutual followers shown on other users' profiles
- Shareable profile link

### Posts
- Create posts with captions and optional images
- Edit or delete your own posts
- Clickable **#hashtags** linking to filtered results
- Double-click to like (Instagram-style), with a heart burst animation
- Full-screen image lightbox

### Social
- Like & comment on posts, with commenter avatars
- Follow / unfollow users
- Search users in real time
- "People you may know" suggestions
- **Explore page** — a photo grid of all posts, filterable by hashtag
- **Latest / Trending** feed toggle (sorted by likes)

### Notifications
- In-app notification bell with unread badge
- Notifications for likes, comments, and new followers
- Auto-refreshes every 15 seconds

### UX & Design
- Fully responsive, mobile-friendly layout
- **Dark mode** toggle (persisted across sessions)
- Toast notifications, loading skeletons, and smooth animations
- Installable as a native-feeling app (PWA)
- Custom gradient branding and design system

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB with Mongoose |
| **Authentication** | JWT (jsonwebtoken), bcryptjs |
| **File Uploads** | Multer |
| **Deployment** | Netlify (frontend), Render (backend), MongoDB Atlas (database) |
| **Dev Tools** | VS Code, Thunder Client, Git & GitHub |

---

## 📂 Project Structure

```
Bondly/
├── frontend/
│   ├── css/
│   │   └── style.css          # Complete design system & theming
│   ├── js/
│   │   ├── utils.js           # Shared helpers (auth, toasts, API config)
│   │   ├── navbar.js          # Navbar, search, notifications, dark mode
│   │   ├── feed.js            # Feed rendering, likes, comments, posting
│   │   ├── profile.js         # Own profile logic
│   │   ├── view-profile.js    # Other users' profile logic
│   │   ├── explore.js         # Explore/discover grid page
│   │   ├── login.js / signup.js
│   ├── images/                 # Uploaded post & profile images
│   ├── feed.html, profile.html, login.html, signup.html,
│   │   view-profile.html, explore.html, 404.html, index.html
│   └── manifest.json           # PWA configuration
│
├── backend/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── controllers/            # Business logic per resource
│   ├── models/                 # Mongoose schemas (User, Post, Comment, Notification)
│   ├── routes/                 # Express route definitions
│   ├── middleware/              # Auth & file upload middleware
│   └── server.js               # App entry point
│
└── README.md
```

---

## 🚀 Getting Started Locally

### Prerequisites
- [Node.js](https://nodejs.org/) installed
- A MongoDB database (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))

### 1. Clone the repository
```bash
git clone https://github.com/SayaliMisal24/CodeAlpha_mini_social_media.git
cd CodeAlpha_mini_social_media
```

### 2. Set up the backend
```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:
```
PORT=5000
MONGO_URI=mongodb+srv://misalsayali24_db_user:NymvgBMw1z9t7o7a@cluster0.osc9adp.mongodb.net/mini_social_media?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=bondly2026supersecretkey
```

Start the server:
```bash
npx nodemon server.js
```

### 3. Run the frontend
Open the `frontend` folder in VS Code and launch `login.html` with the **Live Server** extension, or serve it with any static file server.

---

## 🔌 API Overview

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/signup` | Register a new user |
| `POST` | `/api/auth/login` | Log in and receive a JWT |
| `GET` | `/api/auth/profile` | Get logged-in user's profile |
| `PUT` | `/api/auth/profile` | Update profile info |
| `PUT` | `/api/auth/profile/photo` | Upload profile photo |
| `GET` | `/api/posts` | Get all posts |
| `POST` | `/api/posts` | Create a post |
| `PUT` | `/api/posts/:id` | Edit a post's caption |
| `DELETE` | `/api/posts/:id` | Delete a post |
| `POST` | `/api/posts/:id/like` | Like / unlike a post |
| `POST` | `/api/posts/:id/comment` | Comment on a post |
| `POST` | `/api/follow/:id` | Follow a user |
| `POST` | `/api/follow/:id/unfollow` | Unfollow a user |
| `GET` | `/api/users/search?q=` | Search users |
| `GET` | `/api/users/suggestions` | Get suggested users to follow |
| `GET` | `/api/notifications` | Get notifications |
| `GET` | `/api/notifications/unread-count` | Get unread notification count |

All routes except signup/login require a `Bearer <token>` in the `Authorization` header.

---

## 📸 Screenshots

*(Add a few screenshots or a demo GIF of the feed, profile, and dark mode here.)*

---

## 🙋 Author

**Sayali Misal**
Built as part of the CodeAlpha Web Development Internship.

---

## 📄 License

This project is open source and available for learning purposes.