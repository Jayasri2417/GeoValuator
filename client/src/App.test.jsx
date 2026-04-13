import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Simple test component
function TestPage() {
  return (
    <div style={{ padding: '40px', fontFamily: 'Arial', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ color: '#1e40af', fontSize: '32px', marginBottom: '20px' }}>✅ GeoValuator is Loading!</h1>
      <p style={{ fontSize: '18px', lineHeight: '1.6' }}>
        If you can see this message, the React application is working correctly.
      </p>
      
      <div style={{ marginTop: '30px', padding: '20px', background: '#f0f9ff', borderRadius: '8px', border: '2px solid #3b82f6' }}>
        <h2 style={{ color: '#1e3a8a', fontSize: '24px', marginBottom: '15px' }}>Quick Links:</h2>
        <ul style={{ fontSize: '16px', lineHeight: '2' }}>
          <li><a href="/land-intelligence" style={{ color: '#2563eb', textDecoration: 'underline' }}>🗺️ Land Intelligence (Main Dashboard)</a></li>
          <li><a href="/login" style={{ color: '#2563eb', textDecoration: 'underline' }}>🔐 Login</a></li>
          <li><a href="/register" style={{ color: '#2563eb', textDecoration: 'underline' }}>📝 Register</a></li>
          <li><a href="/test-api.html" style={{ color: '#2563eb', textDecoration: 'underline' }}>🧪 API Test Page</a></li>
        </ul>
      </div>

      <div style={{ marginTop: '30px', padding: '20px', background: '#fef3c7', borderRadius: '8px', border: '2px solid #f59e0b' }}>
        <h3 style={{ color: '#92400e', fontSize: '20px', marginBottom: '10px' }}>⚡ Features Available:</h3>
        <ol style={{ fontSize: '16px', lineHeight: '1.8' }}>
          <li><strong>Search Location:</strong> Find and geocode any location in India</li>
          <li><strong>My Properties:</strong> Manage your land registry (requires login)</li>
          <li><strong>AI Agent:</strong> Get intelligent property analysis and insights</li>
        </ol>
      </div>
    </div>
  );
}

function App() {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Routes>
        <Route path="/" element={<TestPage />} />
        <Route path="*" element={<TestPage />} />
      </Routes>
    </div>
  );
}

export default App;
