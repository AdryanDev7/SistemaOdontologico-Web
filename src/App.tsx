import { Box } from '@mui/material';
import { Sidebar } from './components/Layout/Sidebar';
import { AppRoutes } from './routes/appRoutes'; 

function App() {
  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box 
        component="main" 
        sx={{ flexGrow: 1, p: 3, backgroundColor: '#f4f7f6', minHeight: '100vh' }}
      >
        <AppRoutes />
      </Box>
    </Box>
  );
}

export default App;