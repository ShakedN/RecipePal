import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ProfilePage.css"; // Add a CSS file for stylingimport React, { useState } from "react";
import "./ProfilePage.css";

export default function ProfilePage() {
  const [user, setUser] = useState({
    name: "John Doe",
    birthday: "January 1, 1990",
    about: "Food lover, recipe creator, and cooking enthusiast. Sharing my passion for delicious meals!",
    profilePhoto: "/images/cake.jpg",
    backgroundPhoto: "/images/background_cake.jpg",
  });

  return (
    <div className="profile-page">
      {/* Background Photo */}
      <div className="background-photo">
        <img src={user.backgroundPhoto} alt="Background" />
      </div>

      {/* Profile Photo and Info */}
      <div className="profile-info">
        <div className="profile-photo">
          <img src={user.profilePhoto} alt="Profile" />
        </div>
        <h1 className="profile-name">{user.name}</h1>
        <p className="profile-birthday">🎂 Birthday: {user.birthday}</p>
        <p className="profile-about">{user.about}</p>
      </div>

      {/* Additional Sections */}
      <div className="profile-sections">
        <div className="friends-section">
          <h2>Friends</h2>
          <p>Coming soon...</p>
        </div>
        <div className="posts-section">
          <h2>Posts</h2>
          <p>Coming soon...</p>
        </div>
      </div>
    </div>
  );
}