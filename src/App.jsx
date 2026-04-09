import React from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./components/login.jsx";
import MainApp from "./components/MainApp.jsx";

// 1. Guard Component: Checks if user is logged in
const ProtectedRoute = ({ children }) => {
  // Check for the token we saved in Login.jsx
  const isAuthenticated = localStorage.getItem("token"); // or localStorage.getItem("admin")

  if (!isAuthenticated) {
    // If no token, kick them back to Login
    return <Navigate to="/" replace />;
  }

  return children;
};

const App = () => {
  return (
    <Router>
      <Routes>
        {/* 2. Root Path = Login Page */}
        <Route path="/" element={<Login />} />

        {/* 3. Main Path = Protected Dashboard */}
        {/* The '/*' allows MainApp to have its own sub-routes like /main/events */}
        <Route
          path="/main/*"
          element={
            <ProtectedRoute>
              <MainApp />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
