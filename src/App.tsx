import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminPage from './pages/AdminPage';
import SuratPengantarPermohonan from './pages/SuratPengantarPermohonan';
import SuratTugas from './pages/SuratTugas';
import SuratUndangan from './pages/SuratUndangan';
import SuratKeterangan from './pages/SuratKeterangan';
import ComingSoon from './pages/ComingSoon';
import ArsipSurat from './pages/ArsipSurat';
import Layout from './components/Layout';

// Define available application views/routes
type Page = 'login' | 'register' | 'dashboard' | 'admin' | 'surat_pengantar' | 'surat_undangan' | 'surat_tugas' | 'surat_keterangan' | 'surat_keputusan' | 'surat_prodi' | 'surat_laak' | 'arsip_surat';

/**
 * Component: App
 * Description: Root component handling client-side routing (state-based)
 * and global navigation logic between Auth, Dashboard, and specific Modules.
 */
function App() {
  // Initialize state from localStorage or default to login
  const getInitialPage = (): Page => {
    const token = localStorage.getItem('token');
    const savedPage = localStorage.getItem('currentPage') as Page | null;

    // If user is logged in, restore their last page or go to dashboard
    if (token && savedPage && savedPage !== 'login') {
      return savedPage;
    }

    // If user is logged in but no saved page, go to dashboard
    if (token) {
      return 'dashboard';
    }

    // Otherwise, go to login
    return 'login';
  };

  const [currentPage, setCurrentPage] = useState<Page>(getInitialPage);

  // Persist current page to localStorage whenever it changes
  useEffect(() => {
    if (currentPage !== 'login') {
      localStorage.setItem('currentPage', currentPage);
    }
  }, [currentPage]);

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && currentPage === 'login') {
      setCurrentPage('dashboard');
    } else if (!token && currentPage !== 'login') {
      setCurrentPage('login');
    }
  }, []);

  const handleLoginSuccess = () => {
    setCurrentPage('dashboard');
    localStorage.setItem('currentPage', 'dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('currentPage');
    setCurrentPage('login');
  };
  const handleBackToDashboard = () => setCurrentPage('dashboard');
  const handleOpenAdmin = () => setCurrentPage('admin');
  const handleOpenSuratPengantar = () => setCurrentPage('surat_pengantar');
  const handleOpenSuratTugas = () => setCurrentPage('surat_tugas');
  const handleOpenSuratUndangan = () => setCurrentPage('surat_undangan');
  const handleOpenSuratKeterangan = () => setCurrentPage('surat_keterangan');
  const handleOpenSuratKeputusan = () => setCurrentPage('surat_keputusan');
  const handleOpenSuratProdi = () => setCurrentPage('surat_prodi');
  const handleOpenSuratLaak = () => setCurrentPage('surat_laak');
  const handleOpenArsipSurat = () => setCurrentPage('arsip_surat');

  // Render Admin Page
  if (currentPage === 'admin') {
    return (
      <Layout
        onLogout={handleLogout}
        onBackToDashboard={handleBackToDashboard}
        onOpenSuratPengantar={handleOpenSuratPengantar}
        onOpenSuratTugas={handleOpenSuratTugas}
        onOpenSuratUndangan={handleOpenSuratUndangan}
        onOpenAdmin={handleOpenAdmin}
        onOpenSuratKeterangan={handleOpenSuratKeterangan}
        onOpenSuratKeputusan={handleOpenSuratKeputusan}
        onOpenSuratProdi={handleOpenSuratProdi}
        onOpenSuratLaak={handleOpenSuratLaak}
        onOpenArsipSurat={handleOpenArsipSurat}
        activeMenuItem="admin"
      >
        <AdminPage onBack={handleBackToDashboard} />
      </Layout>
    );
  }

  // Render: Module 4 (Letter Generation) with Custom Layout
  if (currentPage === 'surat_pengantar') {
    return (
      <Layout
        onLogout={handleLogout}
        onBackToDashboard={handleBackToDashboard}
        onOpenSuratPengantar={handleOpenSuratPengantar}
        onOpenSuratTugas={handleOpenSuratTugas}
        onOpenSuratUndangan={handleOpenSuratUndangan}
        onOpenAdmin={handleOpenAdmin}
        onOpenSuratKeterangan={handleOpenSuratKeterangan}
        onOpenSuratKeputusan={handleOpenSuratKeputusan}
        onOpenSuratProdi={handleOpenSuratProdi}
        onOpenSuratLaak={handleOpenSuratLaak}
        onOpenArsipSurat={handleOpenArsipSurat}
        activeMenuItem="surat_pengantar"
      >
        <SuratPengantarPermohonan />
      </Layout>
    );
  }

  // Render: Module 1 (Surat Tugas) with Custom Layout
  if (currentPage === 'surat_tugas') {
    return (
      <Layout
        onLogout={handleLogout}
        onBackToDashboard={handleBackToDashboard}
        onOpenSuratPengantar={handleOpenSuratPengantar}
        onOpenSuratTugas={handleOpenSuratTugas}
        onOpenSuratUndangan={handleOpenSuratUndangan}
        onOpenAdmin={handleOpenAdmin}
        onOpenSuratKeterangan={handleOpenSuratKeterangan}
        onOpenSuratKeputusan={handleOpenSuratKeputusan}
        onOpenSuratProdi={handleOpenSuratProdi}
        onOpenSuratLaak={handleOpenSuratLaak}
        onOpenArsipSurat={handleOpenArsipSurat}
        activeMenuItem="surat_tugas"
      >
        <SuratTugas />
      </Layout>
    );
  }

  // Render: Module 2 (Surat Undangan) with Custom Layout
  if (currentPage === 'surat_undangan') {
    return (
      <Layout
        onLogout={handleLogout}
        onBackToDashboard={handleBackToDashboard}
        onOpenSuratPengantar={handleOpenSuratPengantar}
        onOpenSuratTugas={handleOpenSuratTugas}
        onOpenSuratUndangan={handleOpenSuratUndangan}
        onOpenAdmin={handleOpenAdmin}
        onOpenSuratKeterangan={handleOpenSuratKeterangan}
        onOpenSuratKeputusan={handleOpenSuratKeputusan}
        onOpenSuratProdi={handleOpenSuratProdi}
        onOpenSuratLaak={handleOpenSuratLaak}
        onOpenArsipSurat={handleOpenArsipSurat}
        activeMenuItem="surat_undangan"
      >
        <SuratUndangan />
      </Layout>
    );
  }

  // Render: Module 3 (Surat Keterangan)
  if (currentPage === 'surat_keterangan') {
    return (
      <Layout
        onLogout={handleLogout}
        onBackToDashboard={handleBackToDashboard}
        onOpenSuratPengantar={handleOpenSuratPengantar}
        onOpenSuratTugas={handleOpenSuratTugas}
        onOpenSuratUndangan={handleOpenSuratUndangan}
        onOpenAdmin={handleOpenAdmin}
        onOpenSuratKeterangan={handleOpenSuratKeterangan}
        onOpenSuratKeputusan={handleOpenSuratKeputusan}
        onOpenSuratProdi={handleOpenSuratProdi}
        onOpenSuratLaak={handleOpenSuratLaak}
        onOpenArsipSurat={handleOpenArsipSurat}
        activeMenuItem="surat_keterangan"
      >
        <SuratKeterangan />
      </Layout>
    );
  }

  // Render: Module 5 (Surat Keputusan)
  if (currentPage === 'surat_keputusan') {
    return (
      <Layout
        onLogout={handleLogout}
        onBackToDashboard={handleBackToDashboard}
        onOpenSuratPengantar={handleOpenSuratPengantar}
        onOpenSuratTugas={handleOpenSuratTugas}
        onOpenSuratUndangan={handleOpenSuratUndangan}
        onOpenAdmin={handleOpenAdmin}
        onOpenSuratKeterangan={handleOpenSuratKeterangan}
        onOpenSuratKeputusan={handleOpenSuratKeputusan}
        onOpenSuratProdi={handleOpenSuratProdi}
        onOpenSuratLaak={handleOpenSuratLaak}
        onOpenArsipSurat={handleOpenArsipSurat}
        activeMenuItem="surat_keputusan"
      >
        <ComingSoon title="Surat Keputusan (SK) & Surat Edaran" description="Modul Surat Keputusan sedang dalam pengembangan" onBack={handleBackToDashboard} />
      </Layout>
    );
  }

  // Render: Module 6 (Surat Prodi)
  if (currentPage === 'surat_prodi') {
    return (
      <Layout
        onLogout={handleLogout}
        onBackToDashboard={handleBackToDashboard}
        onOpenSuratPengantar={handleOpenSuratPengantar}
        onOpenSuratTugas={handleOpenSuratTugas}
        onOpenSuratUndangan={handleOpenSuratUndangan}
        onOpenAdmin={handleOpenAdmin}
        onOpenSuratKeterangan={handleOpenSuratKeterangan}
        onOpenSuratKeputusan={handleOpenSuratKeputusan}
        onOpenSuratProdi={handleOpenSuratProdi}
        onOpenSuratLaak={handleOpenSuratLaak}
        onOpenArsipSurat={handleOpenArsipSurat}
        activeMenuItem="surat_prodi"
      >
        <ComingSoon title="Surat Program Studi" description="Modul Surat Program Studi sedang dalam pengembangan" onBack={handleBackToDashboard} />
      </Layout>
    );
  }

  // Render: Module 7 (Surat LAAK)
  if (currentPage === 'surat_laak') {
    return (
      <Layout
        onLogout={handleLogout}
        onBackToDashboard={handleBackToDashboard}
        onOpenSuratPengantar={handleOpenSuratPengantar}
        onOpenSuratTugas={handleOpenSuratTugas}
        onOpenSuratUndangan={handleOpenSuratUndangan}
        onOpenAdmin={handleOpenAdmin}
        onOpenSuratKeterangan={handleOpenSuratKeterangan}
        onOpenSuratKeputusan={handleOpenSuratKeputusan}
        onOpenSuratProdi={handleOpenSuratProdi}
        onOpenSuratLaak={handleOpenSuratLaak}
        onOpenArsipSurat={handleOpenArsipSurat}
        activeMenuItem="surat_laak"
      >
        <ComingSoon title="Surat LAAK (Akreditasi & Audit)" description="Modul Surat LAAK sedang dalam pengembangan" onBack={handleBackToDashboard} />
      </Layout>
    );
  }

  // Render: Arsip Surat
  if (currentPage === 'arsip_surat') {
    return (
      <Layout
        onLogout={handleLogout}
        onBackToDashboard={handleBackToDashboard}
        onOpenSuratPengantar={handleOpenSuratPengantar}
        onOpenSuratTugas={handleOpenSuratTugas}
        onOpenSuratUndangan={handleOpenSuratUndangan}
        onOpenAdmin={handleOpenAdmin}
        onOpenSuratKeterangan={handleOpenSuratKeterangan}
        onOpenSuratKeputusan={handleOpenSuratKeputusan}
        onOpenSuratProdi={handleOpenSuratProdi}
        onOpenSuratLaak={handleOpenSuratLaak}
        onOpenArsipSurat={handleOpenArsipSurat}
        activeMenuItem="arsip_surat"
      >
        <ArsipSurat />
      </Layout>
    );
  }

  // Render: Main Dashboard
  if (currentPage === 'dashboard') {
    return (
      <Dashboard
        onLogout={handleLogout}
        onOpenSuratPengantar={handleOpenSuratPengantar}
        onOpenSuratTugas={handleOpenSuratTugas}
        onOpenSuratUndangan={handleOpenSuratUndangan}
        onOpenAdmin={handleOpenAdmin}
        onOpenSuratKeterangan={handleOpenSuratKeterangan}
        onOpenSuratKeputusan={handleOpenSuratKeputusan}
        onOpenSuratProdi={handleOpenSuratProdi}
        onOpenSuratLaak={handleOpenSuratLaak}
        onOpenArsipSurat={handleOpenArsipSurat}
      />
    );
  }

  return <Login onLoginSuccess={handleLoginSuccess} />;
}

export default App;
