# 🚀 Meetly – Real-Time Virtual Classroom & Meeting Platform

Meetly is a full-stack real-time web application that combines the functionality of **Google Meet** and **Google Classroom** into a single platform. It enables seamless interaction between teachers and students through live classes, chat, assignments, and meeting features.

---

## 📌 Overview

Meetly allows teachers to create virtual classrooms and students to join using a unique class code. The platform supports real-time communication, live meeting sessions, assignment management, and participant tracking — all without requiring page refresh.

---

## ✨ Features

### 👨‍🏫 Teacher (Host)

* Create and manage classes
* Generate unique class codes
* Start live meetings
* Send real-time messages and notices
* Create and manage assignments

### 👨‍🎓 Student (Participant)

* Join classes using class code
* Participate in live chat
* View notices instantly
* Join meetings when started by teacher
* Submit assignments

---

### 💬 Real-Time Chat

* Instant messaging using Socket.IO
* No refresh required
* Supports notices and pinned messages

---

### 📢 Notice System

* Teachers can broadcast important messages
* Visible to all participants in real-time

---

### 👥 Live Members Tracking

* Displays active participants
* Updates instantly when users join/leave

---

### 🎥 Meeting System

* Teacher controls meeting start
* Students can join dynamically
* Real-time synchronization across users

---

### 📝 Assignment Management

* Teachers can create assignments
* Students can submit responses
* Submission status visible to all

---

### 🔄 Persistent Data

* All data stored in MongoDB
* State restored on page refresh
* No loss of messages or assignments

---

## 🛠️ Tech Stack

### Frontend

* React.js
* Tailwind CSS
* Framer Motion

### Backend

* Node.js
* Express.js

### Database

* MongoDB (Mongoose)

### Real-Time Communication

* Socket.IO

---


## ⚙️ Installation & Setup

### 1. Clone the Repository

```
Go to this repo :- https://github.com/rohitpandit09/Frontend-by-Meetly.git
git clone https://github.com/rohitpandit09/Frontend-by-Meetly.git
npm install
npm run dev
```

---

### 2. Setup Backend

```
git clone https://github.com/rohitpandit09/Backend-by-MEETLY.git
npm install
```

Create a `.env` file in backend folder:

```
MONGO_URI=your_mongodb_connection_string
PORT=5000
```

Run backend server:

```
npx nodemon server.js
```

---

### 3. Setup Frontend

```
cd MEETLY-frontend
npm install
npm run dev
```

---

### 4. Run Application



## 🚀 Usage

### For Teachers

1. Sign up as Teacher
2. Create a class
3. Share class code with students
4. Start meeting
5. Manage chat, notices, and assignments

---

### For Students

1. Sign up as Student
2. Enter class code
3. Join class
4. Participate in chat and meeting
5. Submit assignments

---


## 📈 Future Scope

* WebRTC-based video/audio communication
* Screen sharing
* Active speaker detection
* File uploads with cloud storage
* Notifications system

---

## 🤝 Contributing

Contributions are welcome. Feel free to fork the repository and submit a pull request.

---


## ⭐ Support

If you found this project helpful, consider giving it a ⭐ on GitHub!
