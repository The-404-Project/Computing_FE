import { useState } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

type Page = 'login' | 'register' | 'dashboard';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('login');

  const handleLoginSuccess = () => {
    setCurrentPage('dashboard');
  };

  const handleRegisterSuccess = () => {
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setCurrentPage('login');
  };

  const handleNavigateToRegister = () => {
    setCurrentPage('register');
  };

  const handleNavigateToLogin = () => {
    setCurrentPage('login');
  };

  if (currentPage === 'dashboard') {
    return <Dashboard onLogout={handleLogout} />;
  }

  if (currentPage === 'register') {
    return <Register onRegisterSuccess={handleRegisterSuccess} onNavigateToLogin={handleNavigateToLogin} />;
  }

  return <Login onLoginSuccess={handleLoginSuccess} onNavigateToRegister={handleNavigateToRegister} />;
}

export default App;
