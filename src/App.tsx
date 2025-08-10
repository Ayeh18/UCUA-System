import { Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Reset_password from './pages/Reset_password';
import Form_visitor from './pages/Form_visitor';
import Dashboard from './pages/Dashboard';
import Sidebar from './components/Sidebar';
import Form_staff from './pages/Form_staff';
import Alert_staff from './pages/Alert_staff';
import Alert_visitor from './pages/Alert_visitor';
import { ReportProvider } from './context/ReportContext';
import Feedback from './pages/Feedback';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';


function App() {
  const location = useLocation();

  // Hide sidebar on certain routes
  const shouldShowSidebar = !['/', '/login', '/alert-staff', '/form-staff', '/register', '/form-visitor' , '/alert-visitor', '/edit-profile'].includes(location.pathname);

  return (
    <>
      {shouldShowSidebar && <Sidebar />}
      <ReportProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<Reset_password />} />
          <Route path="/form-visitor" element={<Form_visitor />} />
          <Route path="/form-staff" element={<Form_staff />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/alert-staff" element={<Alert_staff />} />
          <Route path="/alert-visitor" element={<Alert_visitor />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/edit-profile" element={<EditProfile />} />
        </Routes>
      </ReportProvider>
    </>
  );
}

export default App;
