import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import CandidateHome from './pages/candidate/CandidateHome'
import CandidateDashboard from './pages/candidate/CandidateDashboard'
import CandidateProfile from './pages/candidate/CandidateProfile'
import CandidateProfileSetup from './pages/candidate/CandidateProfileSetup'
import ProfileSetupChoice from './pages/candidate/ProfileSetupChoice'
import AIProfileSetup from './pages/candidate/AIProfileSetup'
import MyApplications from './pages/candidate/MyApplications'
import CandidateInterviews from './pages/candidate/CandidateInterviews'
import { ToastProvider } from './components/Toast'
import ScrollToTop from './components/ScrollToTop'
import { Routes, Route, useLocation } from "react-router";
import EmployeeHome from './pages/recruiter/EmployeeHome'
import CompanyReview from './pages/candidate/CompanyReciew'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import SalaryGuide from './pages/candidate/SalaryGuide'
import Login from './pages/Login'
import ContactUs from './pages/candidate/ContactUs'
import FindCV from './pages/recruiter/FindCV'
import SearchTalent from './pages/recruiter/SearchTalent'
import SavedCandidates from './pages/recruiter/SavedCandidates'
import RecruiterAnalytics from './pages/recruiter/RecruiterAnalytics'
import RecruiterInterviews from './pages/recruiter/RecruiterInterviews'
import Product from './pages/recruiter/Product'
import Pricing from './pages/recruiter/Pricing'
import RecruiterProfileSetup from './pages/recruiter/RecruiterProfileSetup'
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard'
import CreateJob from './pages/recruiter/CreateJob'
import RecruiterJobs from './pages/recruiter/RecruiterJobs'
import RecruiterProfile from './pages/recruiter/RecruiterProfile'
import EditJob from './pages/recruiter/EditJob'
import PublicRoute from './routes/PublicRoute'
import RecruiterRoute from './routes/RecruiterRoute'
import CandidateRoute from './routes/CandidateRoute'
import ViewJob from './pages/recruiter/ViewJob'
import JobApplicants from './pages/recruiter/JobApplicants'
import ApplicantDetail from './pages/recruiter/ApplicantDetail'
import Unauthorized from './pages/Unauthorized'
import AuthRedirect from './components/AuthRedirect'
import RecruiterMessages from './pages/recruiter/RecruiterMessages'
import AIAutoApply from './pages/candidate/AIAutoApply'
import CandidateMessages from './pages/candidate/CandidateMessages'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminJobs from './pages/admin/AdminJobs'
import AdminCategories from './pages/admin/AdminCategories'
import AdminSkills from './pages/admin/AdminSkills'
import AdminContacts from './pages/admin/AdminContacts'
import AdminConfig from './pages/admin/AdminConfig'
import AdminLogin from './pages/admin/AdminLogin'
import AdminRoute from './routes/AdminRoute'

function App() {
  const location = useLocation();

  const hideLayoutRoutes = [
    "/login",
    "/profile-setup",
    "/hire/login",
    "/hire/profile-setup",
    "/admin/login",
    "/unauthorized",
  ];

  const hideLayout = hideLayoutRoutes.includes(
    location.pathname
  );


  return (
    <ToastProvider>
    <div className="App">
      <ScrollToTop />
      {!hideLayout && <Navbar />}
      <AuthRedirect />
      <Routes>
        <Route path="/" >
          <Route index element={<PublicRoute><CandidateHome /></PublicRoute>} />
          <Route path="login" element={<Login />} />
          <Route path="profile-setup" element={<CandidateProfileSetup />} />
          <Route path="profile-setup-choice" element={<ProfileSetupChoice />} />
          <Route path="ai-profile-setup" element={<AIProfileSetup />} />
          <Route path="profile" element={<CandidateRoute><CandidateProfile /></CandidateRoute>} />
          <Route path="dashboard" element={<CandidateRoute><CandidateDashboard /></CandidateRoute>} />
          <Route path="applications" element={<CandidateRoute><MyApplications /></CandidateRoute>} />
          <Route path="interviews" element={<CandidateRoute><CandidateInterviews /></CandidateRoute>} />
          <Route path="company-reviews" element={<CompanyReview />} />
          <Route path="salary-guide" element={<SalaryGuide />} />
          <Route path="messages" element={<CandidateRoute><CandidateMessages /></CandidateRoute>} />
          <Route path="ai-auto-apply" element={<CandidateRoute><AIAutoApply /></CandidateRoute>} />
          <Route path="contact" element={<ContactUs />} />
        </Route>


        <Route path="/hire/" >
          <Route index element={<PublicRoute> <EmployeeHome /></PublicRoute>} />
          <Route path="login" element={<Login />} />
          <Route path="find-cvs" element={<FindCV />} />
          <Route path="search-talent" element={<SearchTalent />} />
          <Route path="candidates" element={<RecruiterRoute><SearchTalent /></RecruiterRoute>} />
          <Route path="interviews" element={<RecruiterRoute><RecruiterInterviews /></RecruiterRoute>} />
          <Route path="saved-candidates" element={<RecruiterRoute><SavedCandidates /></RecruiterRoute>} />
          <Route path="analytics" element={<RecruiterRoute><RecruiterAnalytics /></RecruiterRoute>} />
          <Route path="products" element={<Product />} />
          <Route path="pricing" element={<Pricing />} />
          <Route path="profile-setup" element={<RecruiterProfileSetup />} />
          <Route path="dashboard" element={<RecruiterRoute><RecruiterDashboard /></RecruiterRoute>} />
          <Route path="profile" element={<RecruiterRoute><RecruiterProfile /></RecruiterRoute>} />
          <Route path="post-job" element={<RecruiterRoute><CreateJob /></RecruiterRoute>} />
          
          <Route path="jobs" >
            <Route index element={<RecruiterRoute><RecruiterJobs /></RecruiterRoute>} />  
          </Route>
          <Route path="jobs/:jobId" element={<RecruiterRoute><ViewJob /></RecruiterRoute>} />
          <Route path="jobs/:jobId/applicants" element={<RecruiterRoute><JobApplicants /></RecruiterRoute>} />
          <Route path="jobs/:jobId/applicants/:applicationId" element={<RecruiterRoute><ApplicantDetail /></RecruiterRoute>} />
          <Route path="edit-job/:jobId" element={<RecruiterRoute><EditJob /></RecruiterRoute>} />
          <Route path="messages" element={<RecruiterRoute><RecruiterMessages /></RecruiterRoute>} />
        </Route>

        <Route path="/admin">
          <Route path="login" element={<AdminLogin />} />
          <Route index element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="jobs" element={<AdminRoute><AdminJobs /></AdminRoute>} />
          <Route path="categories" element={<AdminRoute><AdminCategories /></AdminRoute>} />
          <Route path="skills" element={<AdminRoute><AdminSkills /></AdminRoute>} />
          <Route path="contacts" element={<AdminRoute><AdminContacts /></AdminRoute>} />
          <Route path="config" element={<AdminRoute><AdminConfig /></AdminRoute>} />
        </Route>

        <Route path="/unauthorized" element={<Unauthorized />} />
      </Routes>
      {!hideLayout && <Footer />}
    </div>
    </ToastProvider>
  )
}

export default App
