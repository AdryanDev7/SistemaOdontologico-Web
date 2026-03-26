import { Box } from '@mui/material';
import { Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Layout/Sidebar';

const Dashboard = () => <h1>Bem-vinda, Dra. Elisa! 🩺</h1>;
const Pacientes = () => <h1>Lista de Pacientes 👥</h1>;

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
          <Route path="/pacientes" element={<Pacientes />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default App;