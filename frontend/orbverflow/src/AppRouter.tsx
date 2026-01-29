import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { App } from './App';
import { OrbverflowApp } from './orbverflow/OrbverflowApp';
import { MissionsPage } from './pages/MissionsPage';
export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/orbverflow/*" element={<OrbverflowApp />} />
        <Route path="/missions" element={<MissionsPage />} />
      </Routes>
    </BrowserRouter>);

}