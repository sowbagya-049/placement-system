import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./components/Auth/Login";
import StudentDashboard from "./pages/StudentDashboard";
import CoordinatorDashboard from "./pages/CoordinatorDashboard";
import StaffDashboard from "./pages/StaffDashboard";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/student" element={<StudentDashboard />} />
      <Route path="/coordinator" element={<CoordinatorDashboard />} />
      <Route path="/staff" element={<StaffDashboard />} />
    </Routes>
  );
};

export default App;
