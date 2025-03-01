import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage";
import UserSpacePage from "../pages/UserSpacePage";
import MainChat from "../components/MainChat";

const AllRoutes = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/userspace" element={<UserSpacePage />} />
        <Route path="/chat/:roomId" element={<MainChat />} />
      </Routes>
    </div>
  );
};

export default AllRoutes;
