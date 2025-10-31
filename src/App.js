import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import HomePage from './components/HomePage';
import DistrictDashboard from './components/DistrictDashboard';
import JobApplicationForm from './components/JobApplicationForm';
import TrainingApplicationForm from './components/TrainingApplicationForm';
import JobOpportunities from './components/JobOpportunities';
import TrainingPrograms from './components/TrainingPrograms';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import AdminAddJob from './components/AdminAddJob';
import AdminAddTraining from './components/AdminAddTraining';
import AdminManageJobs from './components/AdminManageJobs';
import AdminManageTraining from './components/AdminManageTraining';
import AdminSuccessStories from './components/AdminSuccessStories';
import AdminComplaints from './components/AdminComplaints';
import SuccessStories from './components/SuccessStories';
import ComplaintForm from './components/ComplaintForm';
import Header from './components/Header';
import Footer from './components/Footer';
import FloatingTTS from './components/FloatingTTS';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import { LanguageProvider } from './context/LanguageContext';
import './App.css';

// Create a theme with accessible colors and larger text
const theme = createTheme({
  palette: {
    primary: {
      main: '#00897B',
      light: '#4DB6AC',
      dark: '#00695C',
    },
    secondary: {
      main: '#7E57C2',
      light: '#9575CD',
      dark: '#5E35B1',
    },
    success: {
      main: '#66BB6A',
    },
    warning: {
      main: '#FFA726',
    },
    background: {
      default: '#F1F8F6',
    },
  },
  typography: {
    fontFamily: '"Nunito", "Segoe UI", "Roboto", "Arial", sans-serif',
    fontSize: 16,
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
    button: {
      fontSize: '1.1rem',
      textTransform: 'none',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 20px',
        },
      },
    },
  },
});

function App() {
  return (
    <LanguageProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <div className="App">
            <Header />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/district/:stateName/:districtName" element={<DistrictDashboard />} />
                <Route path="/job-application" element={<JobApplicationForm />} />
                <Route path="/training-application" element={<TrainingApplicationForm />} />
                <Route path="/job-opportunities" element={<JobOpportunities />} />
                <Route path="/training-programs" element={<TrainingPrograms />} />
                <Route path="/login" element={<Login />} />
                <Route path="/admin-dashboard" element={<AdminDashboard />} />
                <Route path="/admin-add-job" element={<AdminAddJob />} />
                <Route path="/admin-add-training" element={<AdminAddTraining />} />
                <Route path="/admin-manage-jobs" element={<AdminManageJobs />} />
                <Route path="/admin-manage-training" element={<AdminManageTraining />} />
                <Route path="/admin-success-stories" element={<AdminSuccessStories />} />
                <Route path="/admin-complaints" element={<AdminComplaints />} />
                <Route path="/success-stories" element={<SuccessStories />} />
                <Route path="/complaint-form" element={<ComplaintForm />} />
              </Routes>
            </main>
            <Footer />
            <FloatingTTS />
            <PWAInstallPrompt />
          </div>
        </Router>
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;
