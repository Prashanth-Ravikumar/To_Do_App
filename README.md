# 📋 Todo Task Management App

A cross-platform Todo Task Management mobile application built with **Expo React Native** and **Firebase**. It enables users to authenticate via **Google** and manage personal tasks on the go with real-time sync and intuitive UI.

---

## 🚀 Features

### 🔐 Authentication

- Secure authentication using **Firebase Auth**
- Handles login errors with proper feedback to the user

### 📝 Task Management

- Full **CRUD** support:
  - Create, Read, Update, Delete tasks
  - Mark tasks as complete/incomplete
- Task fields:
  - `Title`
  - `Description`
  - `Due Date`
  - `Status` (Open / Complete)
  - `Priority`

### 🎨 UI & UX

- Intuitive UI with:
  - Tabs to view different categories (e.g., All, Completed, Pending)
  - Filters and search functionality
  - No-data illustrations for empty states
  - Floating Action Button (FAB) for adding tasks
- Smooth animations for:
  - Adding and deleting tasks
  - Marking tasks as complete
- Swipe-to-delete and pull-to-refresh supported

---

## 🗂 Tech Stack

| Layer    | Technology             |
| -------- | ---------------------- |
| Frontend | Expo React Native      |
| Backend  | Firebase Firestore     |
| Auth     | Firebase Auth (Google) |

---

## 🧠 Assumptions Made

- All tasks are stored in Firestore in real-time (no separate offline DB layer).
- App prioritizes responsiveness and minimalism in UI/UX.
- App is assumed to be used by a single user session per device at a time.
- Offline support is enabled via Firestore’s built-in offline persistence.

---

## 📁 Folder Structure

```
/src
  /components      # Reusable UI components (TaskCard, FAB, Header etc.)
  /screens         # Screen views (LoginScreen, HomeScreen, AddTaskScreen)
  /navigation      # React Navigation configs
  /services        # Firebase setup, Firestore, Auth logic
  /utils           # Helper functions, constants
App.js             # Entry point
firebaseConfig.js  # Firebase initialization
```

---

## 🎥 Demo Walkthrough

📽 [Watch Loom Demo]https://drive.google.com/file/d/1rrDz6TQOI0plGeNvGAEp7h03qVCyrp35/view?usp=drive_link

This video explains:

- The app’s core features
- Code structure
- Live demo of task creation, completion, deletion, and login flow

---

## 🧪 Getting Started Locally

1. **Clone the repo**

   ```bash
   git clone https://github.com/Prashanth-Ravikumar/To_Do_App.git
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Setup Firebase**

   Create a `firebaseConfig.js` file in the root:

   ```js
   // firebaseConfig.js
   export const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_AUTH_DOMAIN",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_STORAGE_BUCKET",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID",
   };
   ```

4. **Start the app**

   ```bash
   npx expo start
   ```

---

## 🧱 Design Pattern Used

- Modular Component Structure
- Separation of Concerns (Services, Screens, Components)
- Firebase service abstraction
- Firebase Offline support with built-in persistence
- Clean, scalable folder organization

---

## 💡 Enhancements (Future Scope)

- Add support for multiple users/tasks
- Enable priority tagging & color coding
- Add task reminders using local notifications
- Dark mode support
- Export tasks to CSV

---

## 🏁 Submission Note

This project is a part of a hackathon run by [https://www.katomaran.com](https://www.katomaran.com)