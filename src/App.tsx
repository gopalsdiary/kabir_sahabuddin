import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Portfolio from './pages/Portfolio';
import Home from './pages/Home';
import PostFeed from './pages/PostFeed';
import HtmlSitemap from './pages/HtmlSitemap';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminAddItem from './pages/AdminAddItem';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Portfolio />} />
        <Route path="/gallery" element={<Home />} />
        <Route path="/post" element={<PostFeed />} />
        <Route path="/sitemap" element={<HtmlSitemap />} />
        <Route path="/settings" element={<PostFeed initialOpenSettings={true} />} />
        <Route path="/account" element={<PostFeed initialOpenSettings={true} />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/add" element={<AdminAddItem />} />
      </Routes>
    </Router>
  );
}
