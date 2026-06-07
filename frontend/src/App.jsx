import React from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./component/ProtectedRoute";

import Navbar from "./component/public_pages/shared/navbar";

import Home from "./component/public_pages/pages/home";
import About from "./component/public_pages/pages/aboutus";
import Contact from "./component/public_pages/pages/contactus";
import Services from "./component/public_pages/pages/services";

import Login from "./component/public_pages/auth_pages/Login";
import AuthPage from "./component/public_pages/auth_pages/AuthPage";
import RoleSelector from "./component/public_pages/auth_pages/RoleSelector";
import ForgotPassword from "./component/public_pages/auth_pages/ForgetPassword";
import ResetPassword from "./component/public_pages/auth_pages/ResetPassword";
import EditProfile from "./component/public_pages/auth_pages/EditProfile";

import Forum from "./component/public_pages/services/Forum";
import ResumeBuilder from "./component/public_pages/services/ResumeBuilder";
import ArticleWriter from "./component/public_pages/services/ArticleWriter";
import Assistant from "./component/public_pages/services/Assistant";

import StudentDashboard from "./component/student/StudentDashboard";
import MentorshipMatching from "./component/student/MentorshipMatching";
import ConversationHub from "./component/shared/ConversationHub";

import AlumniDashboard from "./component/alumini/AlumniDashboard";
import JobPortal from "./component/alumini/AlumniJobPortal";
import Communication from "./component/alumini/alumni_components/alumniCommunication/AluminiCommunication";
import AlumniProfile from "./component/alumini/alumni_components/alumniProfile/AlumniProfile";
import StudentProfilesPage from "./component/alumini/alumni_components/studentCart/StudentProfilesPage";

import AdminDashboard from "./component/admin/AdminDashboard";

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/services" element={<Services />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RoleSelector />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route
          path="/edit-profile"
          element={
            <ProtectedRoute allowedRoles={["student", "alumni", "admin"]}>
              <EditProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/jobs"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <JobPortal userRole="student" />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/linkedin-jobs"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <JobPortal userRole="student" initialBoard="linkedin" />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/resume-builder"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <ResumeBuilder />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/forums"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <Forum />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/mentorship"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <MentorshipMatching />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/conversations"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <ConversationHub />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/article-writer"
          element={
            <ProtectedRoute allowedRoles={["student", "alumni"]}>
              <ArticleWriter />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/assistant"
          element={
            <ProtectedRoute allowedRoles={["student", "alumni", "admin"]}>
              <Assistant />
            </ProtectedRoute>
          }
        />

        <Route
          path="/alumni/dashboard"
          element={
            <ProtectedRoute allowedRoles={["alumni"]}>
              <AlumniDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/alumni/jobs"
          element={
            <ProtectedRoute allowedRoles={["alumni"]}>
              <JobPortal userRole="alumni" />
            </ProtectedRoute>
          }
        />

        <Route
          path="/alumni/linkedin-jobs"
          element={
            <ProtectedRoute allowedRoles={["alumni"]}>
              <JobPortal userRole="alumni" initialBoard="linkedin" />
            </ProtectedRoute>
          }
        />

        <Route
          path="/alumni/communication"
          element={
            <ProtectedRoute allowedRoles={["alumni"]}>
              <Communication />
            </ProtectedRoute>
          }
        />

        <Route
          path="/alumni/profile"
          element={
            <ProtectedRoute allowedRoles={["alumni"]}>
              <AlumniProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/alumni/students"
          element={
            <ProtectedRoute allowedRoles={["alumni"]}>
              <StudentProfilesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/jobs"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <JobPortal userRole="admin" />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/linkedin-jobs"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <JobPortal userRole="admin" initialBoard="linkedin" />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Home />} />
      </Routes>
    </div>
  );
}

export default App;
