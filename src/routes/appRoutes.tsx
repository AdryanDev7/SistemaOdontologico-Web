import { Routes, Route } from 'react-router-dom';
import DashboardPage from '../pages/DashboardPage';
import PacientesPage from '../pages/PacientesPage';
import NovoPacientePage from '../pages/NovoPacientePage';
import FinanceiroPage from '../pages/FinanceiroPage';
import EditarPacientePage from '../pages/EditarPacientePage';
import FichaPacientePage from '../pages/FichaPacientePage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/pacientes" element={<PacientesPage />} />
      <Route path="/pacientes/novo" element={<NovoPacientePage />} />
      <Route path="/financeiro" element={<FinanceiroPage />} />
      <Route path="/pacientes/:id/editar" element={<EditarPacientePage />} />
      <Route path="/pacientes/:id" element={<FichaPacientePage />} />
    </Routes>
  );
}