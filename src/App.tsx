// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';

// Context
import { LanguageProvider } from './components/LanguageContext';

// Public pages (named exports in this codebase)
import { LoginPage } from './components/LoginPage';
import { RegistrationPage } from './components/RegistrationPage';

// Main app pages (named)
import { HomePage } from './components/HomePage';
import { ProfilePage } from './components/ProfilePage';
import { AddFamilyMembersPage } from './components/AddFamilyMembersPage';
import { HealthcarePoliciesPage } from './components/HealthcarePoliciesPage';
import { SchemeDetailsPage } from './components/SchemeDetailsPage';
import { ChatbotPage } from './components/ChatbotPage';

// Health records flow (named)
import { ChooseProfileForRecords } from './components/ChooseProfileForRecords';
import { HealthRecordsPage } from './components/HealthRecordsPage';

// Legal pages
import { TermsPage } from './components/TermsPage';
import { PrivacyPage } from './components/PrivacyPage';
import { ConsentPage } from './components/ConsentPage';

function App() {
  return (
    <LanguageProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Default redirect to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Public */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegistrationPage />} />

            {/* Main */}
            <Route path="/home" element={<HomePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/family" element={<AddFamilyMembersPage />} />
            <Route path="/policies" element={<HealthcarePoliciesPage />} />
            <Route path="/schemes/:id" element={<SchemeDetailsPage />} />
            <Route path="/chatbot" element={<ChatbotPage />} />

            {/* Health records */}
            <Route path="/health-records/choose" element={<ChooseProfileForRecords />} />
            <Route path="/health-records" element={<HealthRecordsPage />} />

            {/* Legal */}
            <Route path="/legal/terms" element={<TermsPage />} />
            <Route path="/legal/privacy" element={<PrivacyPage />} />
            <Route path="/legal/consent" element={<ConsentPage />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>

          <Toaster position="top-center" style={{ zIndex: 9999 }} richColors />
        </div>
      </Router>
    </LanguageProvider>
  );
}

export default App;
