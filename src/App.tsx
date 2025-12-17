import { useState } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SuratPengantarPermohonan from './pages/SuratPengantarPermohonan'; // Modul 4
import SuratTugas from './pages/SuratTugas'; // Modul 1
import SuratUndangan from './pages/SuratUndangan'; // Modul 2

// Define available application views/routes
type Page = 'login' | 'register' | 'dashboard' | 'surat_pengantar' | 'surat_undangan' | 'surat_tugas';

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

  const handleBackToDashboard = () => setCurrentPage('dashboard');

  // Module Navigation Handlers
  const handleOpenSuratPengantar = () => setCurrentPage('surat_pengantar');
  const handleOpenSuratTugas = () => setCurrentPage('surat_tugas');
  const handleOpenSuratUndangan = () => setCurrentPage('surat_undangan');

  // --- View Rendering Logic ---

  // Render: Module 4 (Letter Generation) with Custom Layout
  if (currentPage === 'surat_pengantar') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b px-6 py-3 shadow-sm sticky top-0 z-50">
          <button onClick={handleBackToDashboard} className="text-sm font-semibold text-gray-600 hover:text-black flex items-center gap-2 transition-colors">
            ← Kembali ke Dashboard
          </button>
        </div>
        <SuratPengantarPermohonan />
      </div>
    );
  }

  // Render: Module 1 (Surat Tugas) with Custom Layout
  if (currentPage === 'surat_tugas') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b px-6 py-3 shadow-sm sticky top-0 z-50">
          <button onClick={handleBackToDashboard} className="text-sm font-semibold text-gray-600 hover:text-black flex items-center gap-2 transition-colors">
            ← Kembali ke Dashboard
          </button>
        </div>
        <SuratTugas />
      </div>
    );
  }

  // Render: Module 2 (Surat Undangan) with Custom Layout
  if (currentPage === 'surat_undangan') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b px-6 py-3 shadow-sm sticky top-0 z-50">
          <button onClick={handleBackToDashboard} className="text-sm font-semibold text-gray-600 hover:text-black flex items-center gap-2 transition-colors">
            ← Kembali ke Dashboard
          </button>
        </div>
        <SuratUndangan />
      </div>
    );
  }

  // Render: Main Dashboard
  if (currentPage === 'dashboard') {
    return <Dashboard onLogout={handleLogout} onOpenSuratPengantar={handleOpenSuratPengantar} onOpenSuratTugas={handleOpenSuratTugas} onOpenSuratUndangan={handleOpenSuratUndangan} />;
  }

  return <Login onLoginSuccess={handleLoginSuccess} onNavigateToRegister={handleNavigateToRegister} />;
}

export default App;
