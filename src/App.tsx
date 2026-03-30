import { Box, Typography } from '@mui/material';
import { Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Layout/Sidebar';

// Imports das páginas (Nomes batendo com os arquivos na pasta)
import PacientesPage from './pages/PacientesPage';
import NovoPacientePage from './pages/NovoPacientePage';
import FichaPacientePage from './pages/FichaPacientePage';
import EditarPacientePage from './pages/EditarPacientePage'; 

const Dashboard = () => (
  <Box>
    <Typography variant="h4" fontWeight={700} color="primary" sx={{ mb: 2 }}>
      Bem-vinda, Dra. Elisa! 🩺
    </Typography>
    <Typography variant="body1" color="text.secondary">
      Seu sistema de gestão odontológica está pronto para uso.
    </Typography>
  </Box>
);

const AgendaPage = () => (
  <Box>
    <Typography variant="h4" fontWeight={700} color="primary" sx={{ mb: 2 }}>
      Agenda
    </Typography>
    <Typography variant="body1" color="text.secondary">
      Em desenvolvimento.
    </Typography>
  </Box>
);

const FinanceiroPage = () => (
  <Box>
    <Typography variant="h4" fontWeight={700} color="primary" sx={{ mb: 2 }}>
      Financeiro
    </Typography>
    <Typography variant="body1" color="text.secondary">
      Em desenvolvimento.
    </Typography>
  </Box>
);

function App() {
  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          backgroundColor: '#f4f7f6', 
          minHeight: '100vh' 
        }}
      >
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/pacientes" element={<PacientesPage />} />
          <Route path="/pacientes/novo" element={<NovoPacientePage />} />
          <Route path="/agenda" element={<AgendaPage />} />
          <Route path="/financeiro" element={<FinanceiroPage />} />
          
          {/* Rota de Edição */}
          <Route path="/pacientes/:id/editar" element={<EditarPacientePage />} />
          
          {/* Rota do Prontuário */}
          <Route path="/pacientes/:id" element={<FichaPacientePage />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default App;