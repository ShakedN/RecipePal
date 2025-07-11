import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import FeedPage from "./pages/FeedPage";
import GroupPage from "./pages/GroupPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import Layout from "./components/Layout"; // Import the Layout component
import VerifyEmailPage from "./pages/VerifyEmailPage";
import FriendRequestsPage from "./pages/FriendRequestsPage";
import GraphsPage from "./pages/GraphsPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
        <Route element={<Layout />}>
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/groups/:id" element={<GroupPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/:userId" element={<ProfilePage />} />
          <Route path="/friend-requests" element={<FriendRequestsPage />} />
          <Route path="/graphs" element={<GraphsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
