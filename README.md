# 🌐 Social Vibe App

> A modern, full-stack social media platform built for connecting people through posts, reels, stories, and real-time chat.

![Status](https://img.shields.io/badge/Status-Active-success)
![License](https://img.shields.io/badge/License-MIT-blue)

## 🌐 Live Demo

👉 **[vibeshare-h892.onrender.com](https://vibeshare-h892.onrender.com)**

## ✨ Features

- **📱 Dynamic Feed**: Browse through photos and videos in an Instagram-like feed.
- **🎥 Reels**: Watch and interact with short-form video content with auto-play and scroll snapping.
- **⚡ Stories**: Share temporary updates that disappear after 24 hours.
- **💬 Real-time Chat**: Instant messaging powered by WebSockets for seamless communication.
- **🔔 Notifications**: Real-time alerts for likes, comments, and messages.
- **👤 User Profiles**: Customize your profile, manage posts, and track followers/following.
- **❤️ Interactions**: Like, comment, save posts, and follow your favorite creators.

## 🛠️ Tech Stack

### Frontend

- **Framework**: React (TypeScript) + Vite
- **Styling**: TailwindCSS + Shadcn UI
- **State Management**: Zustand
- **Networking**: Axios + TanStack Query
- **Real-time**: SockJS + STOMP client

### Backend

- **Framework**: Spring Boot (Java)
- **Database**: MySQL / PostgreSQL (JPA/Hibernate)
- **Security**: Spring Security + JWT Authentication
- **Real-time**: Spring WebSocket
- **Storage**: Cloudinary (for media uploads)

## 🚀 Getting Started

### Prerequisites

- Node.js & npm
- Java JDK 17+
- MySQL (or configured database)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/shivamsahu0108/social-vibe-app.git
   cd social-vibe-app
   ```

2. **Frontend Setup**

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Backend Setup**
   ```bash
   cd vibeShare
   # Update application.properties with your DB credentials
   ./mvnw spring-boot:run
   ```

## 📸 Screenshots

_(Add screenshots of your application here)_

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📄 License

This project is licensed under the MIT License.
