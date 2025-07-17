# RecipePal 🍳

**RecipePal** is a comprehensive social platform for food enthusiasts to share, discover, and connect through recipes. Built with modern web technologies, it provides a seamless experience for recipe sharing, social interaction, and community building.
## 📁 Project Structure

```
RecipePal/
├── client/                          # React frontend application
│   ├── public/
│   │   ├── images/
│   │   │   └── default-profile.png  # Default user avatar
│   │   ├── index.html
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/              # Reusable React components
│   │   │   ├── ChatWindow.jsx       # Real-time chat interface
│   │   │   ├── GroupCard.jsx        # Group display component
│   │   │   ├── JoinGroupPopup.jsx   # Group join modal
│   │   │   ├── Layout.jsx           # Main app layout wrapper
│   │   │   ├── NewPostForm.jsx      # Post creation form
│   │   │   ├── PhotoEditor.jsx      # Image editing component
│   │   │   ├── PostCard.jsx         # Individual post display
│   │   │   ├── SearchResults.jsx    # Search results dropdown
│   │   │   ├── VideoEditor.jsx      # Video editing component
│   │   │   └── *.css               # Component-specific styles
│   │   ├── context/                 # React Context providers
│   │   │   └── AuthContext.js       # Authentication state management
│   │   ├── pages/                   # Main application pages
│   │   │   ├── FeedPage.jsx         # Main feed/timeline
│   │   │   ├── LoginPage.jsx        # User login
│   │   │   ├── RegisterPage.jsx     # User registration
│   │   │   ├── ProfilePage.jsx      # User profile management
│   │   │   ├── GroupsPage.jsx       # Groups listing and management
│   │   │   ├── ChatPage.jsx         # Chat interface
│   │   │   ├── SearchPage.jsx       # Search functionality
│   │   │   ├── VerificationPage.jsx # Email verification
│   │   │   └── *.css               # Page-specific styles
│   │   ├── App.js                   # Main React app component
│   │   ├── App.css                  # Global styles
│   │   ├── index.js                 # React app entry point
│   │   └── index.css                # Base CSS styles
│   ├── package.json                 # Frontend dependencies
│   └── package-lock.json
├── server/                          # Node.js backend application
│   ├── config/
│   │   └── db.js                   # Database connection configuration
│   ├── controllers/                # Business logic controllers
│   │   ├── authController.js       # Authentication logic
│   │   ├── postController.js       # Post management
│   │   ├── groupController.js      # Group operations
│   │   └── searchController.js     # Search functionality
│   ├── middleware/                 # Express middleware
│   │   └── authMiddleware.js       # JWT authentication middleware
│   ├── models/                     # MongoDB schemas
│   │   ├── User.js                 # User data model
│   │   ├── Post.js                 # Post data model
│   │   ├── Group.js                # Group data model
│   │   ├── Comment.js              # Comment data model
│   │   └── Message.js              # Chat message model
│   ├── routes/                     # API route definitions
│   │   ├── auth.js                 # Authentication routes
│   │   ├── posts.js                # Post-related routes
│   │   ├── groups.js               # Group management routes
│   │   ├── search.js               # Search API routes
│   │   └── upload.js               # File upload routes
│   ├── services/                   # External service integrations
│   │   ├── emailService.js         # Email verification service
│   │   └── cloudinaryService.js    # Media upload service
│   ├── utils/                      # Utility functions
│   │   ├── generateToken.js        # JWT token generation
│   │   └── validators.js           # Input validation helpers
│   ├── app.js                      # Express app configuration
│   ├── server.js                   # Server entry point
│   ├── package.json                # Backend dependencies
│   └── package-lock.json
├── .env                            # Environment variables (not in repo)
├── .gitignore                      # Git ignore rules
├── README.md                       # Project documentation
└── package.json                    # Root package.json (optional)
```

### 🗂️ Key Directories Explained

#### Frontend (`/client`)
- **`components/`** - Reusable UI components with individual styling
- **`pages/`** - Main application screens and routing endpoints
- **`context/`** - React Context for global state management
- **`public/`** - Static assets served directly

#### Backend (`/server`)
- **`models/`** - MongoDB schemas defining data structure
- **`routes/`** - API endpoint definitions and routing
- **`controllers/`** - Business logic separated from routes
- **`middleware/`** - Express middleware for authentication, validation, etc.
- **`services/`** - External service integrations (email, cloud storage)
- **`config/`** - Database and app configuration
- **`utils/`** - Helper functions and utilities

## ✨ Features

### 🔐 User Authentication & Profiles
- **Secure Registration**: Email-based registration with verification
- **Email Verification**: Automated email verification system using Nodemailer
- **Profile Management**: Customizable profiles with cooking roles and personal information
- **Password Security**: Bcrypt-hashed passwords for enhanced security

### 📱 Social Features
- **Recipe Sharing**: Share recipes with rich text, images, and videos
- **Social Interactions**: Like, comment, and engage with community posts
- **Friend System**: Send/accept friend requests and build your network
- **Real-time Chat**: Instant messaging with friends using Socket.IO
- **Groups**: Create and join cooking groups for focused communities

### 🎨 Rich Media Experience
- **Photo Editor**: Built-in editor with filters, text overlays, and image manipulation
- **Video Editor**: Trim and edit videos before posting
- **Media Upload**: Cloudinary integration for optimized media storage

### 🔍 Advanced Features
- **Smart Search**: Find recipes, users, and groups with advanced filtering
- **Recipe Templates**: Pre-built templates for consistent recipe formatting
- **Dietary Preferences**: Tag recipes with dietary information
- **Group Management**: Admin controls for group moderation

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with Create React App
- **Styling**: Custom CSS with modern design principles
- **Icons**: Lucide React for consistent iconography
- **State Management**: React Hooks (useState, useEffect, useContext)
- **Routing**: React Router for navigation

### Backend
- **Runtime**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens with bcrypt password hashing
- **Email Service**: Nodemailer for email verification
- **Real-time**: Socket.IO for instant messaging
- **File Upload**: Cloudinary for media storage

### External Services
- **Cloudinary**: Image and video storage/optimization
- **MongoDB Atlas**: Cloud database hosting
- **Email Provider**: Gmail SMTP for verification emails

## 📋 Prerequisites

Before running RecipePal, ensure you have:

- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas account)
- **Gmail Account** (for email verification)
- **Cloudinary Account** (for media uploads)

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/ShakedN/RecipePal.git
cd RecipePal
```

### 2. Install Dependencies
```bash
# Install frontend dependencies
cd client
npm install

# Install backend dependencies
cd ../server
npm install
```

### 3. Environment Configuration

Create a `.env` file in the `server` directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/recipepal
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/recipepal

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_here

# Email Configuration (for verification)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Server Configuration
PORT=5000
NODE_ENV=development
```

### 4. Database Setup

#### Local MongoDB:
```bash
# Start MongoDB service
sudo systemctl start mongod  # Linux
brew services start mongodb  # macOS
```

#### MongoDB Atlas:
1. Create a cluster at [MongoDB Atlas](https://cloud.mongodb.com/)
2. Get your connection string
3. Update `MONGODB_URI` in your `.env` file

### 5. Email Service Setup

#### Gmail Setup:
1. Enable 2-factor authentication on your Gmail account
2. Generate an app-specific password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Use this password in `EMAIL_PASS`

### 6. Cloudinary Setup
1. Create account at [Cloudinary](https://cloudinary.com/)
2. Get your cloud name, API key, and API secret
3. Update environment variables

## 🏃‍♂️ Running the Application

### Development Mode
```bash
# Terminal 1: Start backend server
cd server
npm start
# Server runs on http://localhost:5000

# Terminal 2: Start frontend development server
cd client
npm start
# Frontend runs on http://localhost:3000
```

### Production Build
```bash
# Build frontend for production
cd client
npm run build

# Start backend in production mode
cd ../server
NODE_ENV=production npm start
```

## 📖 Usage Guide

### Getting Started
1. **Registration**: Create account with email verification
2. **Profile Setup**: Complete your cooking profile
3. **Explore**: Browse recipes and discover users

### Sharing Recipes
1. **Create Post**: Use the rich text editor with templates
2. **Add Media**: Upload and edit photos/videos
3. **Tag Recipe**: Add dietary preferences and categories
4. **Publish**: Share with community or specific groups

### Social Features
1. **Connect**: Send friend requests to other users
2. **Chat**: Start conversations with friends
3. **Groups**: Join cooking communities
4. **Interact**: Like, comment, and engage with posts

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/verify-email/:token` - Email verification

### User Management
- `GET /api/auth/profile/:userId` - Get user profile
- `PUT /api/auth/profile/:userId` - Update profile
- `POST /api/auth/friend-request` - Send friend request

### Posts & Recipes
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create new post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post

### Real-time Features
- `Socket.IO` events for chat and notifications


## 🙏 Acknowledgments

- [React](https://reactjs.org/) for the frontend framework
- [Express.js](https://expressjs.com/) for the backend framework
- [MongoDB](https://www.mongodb.com/) for database
- [Socket.IO](https://socket.io/) for real-time features
- [Cloudinary](https://cloudinary.com/) for media management
- [Lucide](https://lucide.dev/) for beautiful icons

---

**Made with ❤️ for food lovers everywhere**
