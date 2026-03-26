import { Box } from '@mui/material';
import { Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Layout/Sidebar';
import PacientesPage from './pages/PacientesPage';
import NovoPacientePage from './pages/NovoPacientePage';

// Dashboard simples (pode virar um arquivo depois)
const Dashboard = () => <h1>Bem-vinda, Dra. Elisa! 🩺</h1>;

function App() {
  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: '#f4f7f6', minHeight: '100vh' }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/pacientes" element={<PacientesPage />} />
          <Route path="/pacientes/novo" element={<NovoPacientePage />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default App;