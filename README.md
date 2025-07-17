# RecipePal

RecipePal is a social application for sharing recipes between users. It enables users to create, edit, and share their favorite recipes, connect with friends, join groups, and interact through comments, media, and messaging.

## Features

- **User Accounts**: Register, login, manage personal profiles, and connect with friends.
- **Social Sharing**: Share recipes publicly or within groups, comment, and interact.
- **Recipe Posts**: Recipes can include text, images, or videos. Media can be edited with custom filters and annotations.
- **Groups**: Create and join groups to share and discover recipes within a community.
- **Real-time Messaging**: Built-in chat functionality using Socket.IO for instant communication.
- **Photo Editor**: Edit recipe images with layers, filters (brightness, contrast, saturation, blur, sepia, grayscale), custom text, shapes, and more.
- **Advanced Search**: Search recipes and users with advanced filters and options.
- **User Chat**: Chat directly with other users in real-time.
- **Responsive UI**: Modern, mobile-friendly design.

## Tech Stack

- **Frontend**: React (bootstrapped with Create React App), JavaScript, CSS
  - Custom components (e.g., PhotoEditor) for rich media editing
  - Uses [lucide-react](https://lucide.dev/) for icons
- **Backend**: Node.js, Express
  - Real-time features via Socket.IO
  - MongoDB (with Mongoose) for data storage (users, posts, groups, etc.)
- **Other Libraries**:
  - [Create React App](https://create-react-app.dev/)
  - [Socket.IO](https://socket.io/)
  - [Mongoose](https://mongoosejs.com/) for MongoDB ORM

## Getting Started

### Prerequisites

- Node.js & npm
- MongoDB instance (local or remote)

### Setup

#### 1. Clone the repository

```bash
git clone https://github.com/ShakedN/RecipePal.git
cd RecipePal
```

#### 2. Install dependencies

```bash
# For frontend
cd client
npm install

# For backend
cd ../server
npm install
```

#### 3. Configure environment variables

Create a `.env` file in the `server` directory for your MongoDB URI and other secrets.

#### 4. Run the application

```bash
# Start backend server
cd server
npm start

# Start frontend development server
cd ../client
npm start
```

Frontend runs on [http://localhost:3000](http://localhost:3000) by default.

## Usage

- Register/login to create your profile.
- Share recipes with text, images, or videos.
- Edit media before posting using the integrated Photo Editor.
- Join groups and make friends to expand your recipe-sharing network.
- Chat with users in real time.
- Use the advanced search to find recipes, users, or groups.

