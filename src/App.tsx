import { useState } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SuratPengantarPermohonan from './pages/SuratPengantarPermohonan';

// Define available application views/routes
type Page = 'login' | 'register' | 'dashboard' | 'surat_pengantar'; 

/**
 * Component: App
 * Description: Root component handling client-side routing (state-based) 
 * and global navigation logic between Auth, Dashboard, and specific Modules.
 */
function App() {
  // State to manage the active view
  const [currentPage, setCurrentPage] = useState<Page>('login');

  // --- Navigation Handlers ---

  const handleLoginSuccess = () => setCurrentPage('dashboard');
  const handleRegisterSuccess = () => setCurrentPage('dashboard');
  const handleLogout = () => setCurrentPage('login');
  const handleNavigateToRegister = () => setCurrentPage('register');
  const handleNavigateToLogin = () => setCurrentPage('login');

  // Module 4: Letter Generation Navigation
  const handleOpenSuratPengantar = () => {
    setCurrentPage('surat_pengantar');
  };

  const handleBackToDashboard = () => {
    setCurrentPage('dashboard');
  };

  // --- View Rendering Logic ---

  // Render: Module 4 (Letter Generation) with Custom Layout
  if (currentPage === 'surat_pengantar') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Sticky Header with Back Button */}
        <div className="bg-white border-b px-6 py-3 shadow-sm sticky top-0 z-50">
            <button 
                onClick={handleBackToDashboard}
                className="text-sm font-semibold text-gray-600 hover:text-black flex items-center gap-2 transition-colors"
            >
                ← Back to Dashboard
            </button>
        </div>
        <SuratPengantarPermohonan />
      </div>
    );
  }

  // Render: Main Dashboard
  if (currentPage === 'dashboard') {
    return (
        <Dashboard 
            onLogout={handleLogout} 
            onOpenSuratPengantar={handleOpenSuratPengantar} 
        />
    );
  }

  // Render: Authentication Pages
  if (currentPage === 'register') {
    return <Register onRegisterSuccess={handleRegisterSuccess} onNavigateToLogin={handleNavigateToLogin} />;
  }

  return <Login onLoginSuccess={handleLoginSuccess} onNavigateToRegister={handleNavigateToRegister} />;
}

export default App;