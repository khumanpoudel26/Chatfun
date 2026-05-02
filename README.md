<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=32&duration=3000&pause=1000&color=00D4FF&center=true&vCenter=true&width=600&lines=Chatfun+%F0%9F%92%AC;Real-time+Chat+Backend+API;Built+with+TypeScript+%2B+Express" alt="Typing SVG" />

<br/>

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)

<br/>

> 💬 A **RESTful + Real-time API** for a full-featured chat platform — built with TypeScript, Express 5, Prisma ORM, PostgreSQL, Redis & Socket.io.

</div>

---

## ✨ Features

<table>
<tr>
<td>

### 👤 User System
- Register & Login with JWT auth
- Cookie-based session (12-day expiry)
- Email verification flow
- Forgot / Reset password via OTP
- Update profile info & bio
- Upload & manage profile picture (Cloudinary)
- Online / Offline active status tracking
- Find users by username or email
- Change password

</td>
<td>

### 💬 Chat System
- Create direct message (DM) chats
- Create group chats with custom names
- Send messages with text and/or file attachments
- Edit & delete messages (soft delete)
- Reply to specific messages
- Read receipts — per-user message reads
- Mark messages as read
- View full conversation history
- View all chat list

</td>
</tr>
<tr>
<td>

### 👥 Group Chat System
- Create groups with multiple members
- Role-based membership (ADMIN / MEMBER)
- Add members to a group
- Remove members (admin only)
- Leave a group chat
- View all group members

</td>
<td>

### ⚡ Real-time Engine
- Live messaging via Socket.io
- Room-based architecture (per chat_id)
- Users join chat rooms on connect
- Online/offline status support
- Auto-disconnect handling

</td>
</tr>
</table>

---

## 🛡️ Security & Infrastructure

| Feature | Details |
|---|---|
| 🔐 Authentication | JWT (HttpOnly Cookie, 12-day session) |
| 🔑 Password Hashing | bcrypt |
| 🚦 Rate Limiting | Per-route (e.g. 10 req/160min on sensitive routes) |
| ✅ Input Validation | Zod schema validators |
| 📧 Email Service | Resend (verification & password reset OTP) |
| 🖼️ Media Storage | Cloudinary (profile pics + message attachments) |
| 🗄️ ORM | Prisma 7 + PostgreSQL via `pg` adapter |
| ⚡ Real-time | Socket.io WebSocket server |
| 🧠 Caching | Redis via ioredis |
| 📁 File Uploads | Multer |

---

## 🗂️ Project Structure

```
Chatfun/
├── prisma/
│   ├── schema.prisma              # DB models
│   └── migrations/                # Migration history
├── src/
│   ├── configs/
│   │   ├── client.ts              # Prisma client
│   │   ├── cloudinary.ts          # Cloudinary config
│   │   └── redis.ts               # Redis (ioredis) client
│   ├── controllers/
│   │   ├── user.controllers.ts
│   │   └── chat.controllers.ts
│   ├── middlewares/
│   │   ├── isAuthenticated.ts     # JWT guard
│   │   ├── errorHandler.ts        # Global error handler
│   │   ├── multer.ts              # File upload handler
│   │   ├── emptyBody.ts           # Empty body guard
│   │   └── rateLimiter.ts         # Per-route rate limiting
│   ├── routes/
│   │   ├── user.routes.ts
│   │   └── chat.routes.ts
│   ├── services/
│   │   ├── user.services.ts       # User business logic
│   │   └── chat.services.ts       # Chat business logic
│   ├── types/
│   │   ├── express.d.ts           # Express type extensions
│   │   └── user.types.ts
│   ├── utils/
│   │   ├── apiError.ts            # Custom error class
│   │   ├── apiResponse.ts         # Standard response wrapper
│   │   ├── asyncHandler.ts        # Async route wrapper
│   │   ├── hash.ts                # bcrypt helpers
│   │   ├── jwtToken.ts            # JWT sign/verify
│   │   └── uploadCloud.ts         # Cloudinary upload helper
│   ├── validators/
│   │   └── user.validators.ts
│   └── server.ts                  # App entry point + Socket.io setup
├── prisma.config.ts
├── tsconfig.json
└── package.json
```

---

## 🗃️ Database Schema

```prisma
User    → sentMessages, member (in chats), reads
Chat    → messages[], members[] (supports DM & group)
Member  → chat_id, user_id, role (MEMBER | ADMIN)
Message → text, attachment, reply_to, is_edited, is_deleted, reads[]
Read    → message_id ↔ user_id (per-user read tracking)
```

---

## ⚡ Real-time (Socket.io)

Chatfun uses Socket.io for live messaging. Clients connect and join chat rooms using the chat ID.

```js
// Client connects with their user_id as a query param
const socket = io(SERVER_URL, { query: { user_id: "123" } });

// Join a chat room to receive messages
socket.emit("join_chat", chatId);

// Listen for incoming messages
socket.on("message", (data) => { ... });
```

| Event | Direction | Description |
|---|---|---|
| `join_chat` | Client → Server | Join a chat room by chat ID |
| `message` | Server → Client | Live incoming direct or group message |
| `disconnect` | Client → Server | Auto-fired on tab close / connection drop |

---

## 🚀 API Routes

### 👤 User Routes — `/api/user`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/register` | ❌ | Register new user (with optional profile pic) |
| `POST` | `/login` | ❌ | Login & receive JWT cookie |
| `POST` | `/logout` | ❌ | Logout & clear session |
| `GET` | `/me` | ✅ | Get own profile |
| `GET` | `/find` | ✅ | Find user by username or email |
| `POST` | `/send-verification` | ❌ | Send email verification OTP |
| `POST` | `/verify-email` | ❌ | Verify email with OTP |
| `POST` | `/forgot-password` | ❌ | Send password reset OTP |
| `POST` | `/reset-password` | ❌ | Reset password with OTP |
| `PUT` | `/update-profile` | ✅ | Update profile info & picture |
| `PATCH` | `/change-password` | ✅ | Change password |

---

### 💬 Chat Routes — `/api/chat`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/create-chat` | ✅ | Create a direct message (DM) chat |
| `POST` | `/create-group` | ✅ | Create a group chat |
| `GET` | `/chatlist` | ✅ | Get all chats for current user |
| `POST` | `/send-message` | ✅ | Send a message (text and/or attachment) |
| `GET` | `/:id` | ✅ | Get full conversation by chat ID |
| `PATCH` | `/read-message/:id` | ✅ | Mark messages as read |
| `PATCH` | `/edit-message` | ✅ | Edit a sent message |
| `DELETE` | `/delete-message` | ✅ | Soft-delete a message |
| `POST` | `/group/add-member` | ✅ | Add a member to a group |
| `DELETE` | `/group/leave` | ✅ | Leave a group chat |
| `DELETE` | `/group/remove-member` | ✅ | Remove a member (admin only) |
| `GET` | `/group/members` | ✅ | Get all members of a group |

> ✅ = Auth Required

---

## ⚙️ Getting Started

### Prerequisites
- Node.js v18+
- PostgreSQL database
- Redis instance
- Cloudinary account
- Resend account (email)

### Environment Variables

```env
DATABASE_URL="postgresql://user:password@host:5432/chatfun"
JWT_SECRET="your_jwt_secret"
REDIS_URL="redis://127.0.0.1:6379"
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_cloudinary_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
RESEND_API_KEY="your_resend_api_key"
EMAIL="your_email@gmail.com"
DOMAIN="http://localhost:8081"
PORT=8081
NODE_ENV="dev"
```

### Running the App

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Push DB schema
npx prisma db push

# Development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| Language | TypeScript 5 |
| Framework | Express 5 |
| ORM | Prisma 7 |
| Database | PostgreSQL (via `pg` adapter) |
| Caching | Redis (ioredis) |
| Real-time | Socket.io |
| Auth | JWT + HttpOnly Cookies |
| Validation | Zod 4 |
| Media Storage | Cloudinary |
| Email | Resend |
| File Upload | Multer |
| Dev Tools | Nodemon, ts-node |
