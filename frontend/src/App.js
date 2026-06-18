import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar       from './components/Navbar';
import HomePage     from './pages/HomePage';
import AnalyzePage  from './pages/AnalyzePage';
import UrlAnalyzePage from './pages/UrlAnalyzePage';
import DashboardPage  from './pages/DashboardPage';
import LoginPage      from './pages/LoginPage';
import RegisterPage   from './pages/RegisterPage';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/"            element={<HomePage />} />
            <Route path="/analyze"     element={<AnalyzePage />} />
            <Route path="/analyze-url" element={<UrlAnalyzePage />} />
            <Route path="/dashboard"   element={<DashboardPage />} />
            <Route path="/login"       element={<LoginPage />} />
            <Route path="/register"    element={<RegisterPage />} />
          </Routes>
        </main>
      </Router>
    </AuthProvider>
  );
}
export default App;
