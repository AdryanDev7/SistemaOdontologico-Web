import { useState } from 'react';
import {
  Box, Typography, Paper, Grid, Button, 
  Chip, Divider, IconButton, List, ListItem, 
  ListItemAvatar, ListItemText
} from '@mui/material';
import {
  AddCircleOutline as AddIcon,
  ChevronLeft,
  ChevronRight,
  AccessTime as TimeIcon,
  MoreVert as MoreIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom'; // 1. Importar o hook de navegação

interface Agendamento {
  id: number;
  hora: string;
  paciente: string;
  procedimento: string;
  status: 'Confirmado' | 'Pendente' | 'Finalizado';
}

export default function AgendaPage() {
  const navigate = useNavigate(); // 2. Inicializar o navigate
  const [dataSelecionada] = useState(new Date());

  const agendamentos: Agendamento[] = [
    { id: 1, hora: '09:00', paciente: 'Adryan Lima', procedimento: 'Avaliação', status: 'Finalizado' },
    { id: 2, hora: '10:30', paciente: 'Elisa Santos', procedimento: 'Manutenção Aparelho', status: 'Confirmado' },
    { id: 3, hora: '14:00', paciente: 'Luan Miguel', procedimento: 'Limpeza', status: 'Pendente' },
    { id: 4, hora: '16:00', paciente: 'Hugo Silva', procedimento: 'Extração', status: 'Confirmado' },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} color="primary">Agenda</Typography>
          <Typography variant="body1" color="text.secondary">Gerencie os horários de hoje.</Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          sx={{ bgcolor: '#9c27b0', '&:hover': { bgcolor: '#7b1fa2' }, borderRadius: 2, textTransform: 'none' }}
          onClick={() => navigate('/pacientes/novo')} // 3. Redirecionar ao clicar
        >
          Novo Agendamento
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e0e0e0', textAlign: 'center' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <IconButton size="small"><ChevronLeft /></IconButton>
              <Typography fontWeight={700}>Março 2026</Typography>
              <IconButton size="small"><ChevronRight /></IconButton>
            </Box>
            <Typography variant="h2" fontWeight={800} color="primary">31</Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>Terça-feira</Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body2" color="text.secondary">Você tem {agendamentos.length} atendimentos para hoje.</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #e0e0e0', overflow: 'hidden' }}>
            <Box sx={{ p: 2, bgcolor: '#fafafa', borderBottom: '1px solid #eee' }}>
              <Typography variant="subtitle1" fontWeight={700}>Próximos Pacientes</Typography>
            </Box>
            <List sx={{ p: 0 }}>
              {agendamentos.map((item, index) => (
                <Box key={item.id}>
                  {/* 4. Usar a prop secondaryAction em vez do componente separado */}
                  <ListItem 
                    sx={{ py: 2 }}
                    secondaryAction={
                      <IconButton edge="end"><MoreIcon /></IconButton>
                    }
                  >
                    <ListItemAvatar>
                      <Box sx={{ 
                        display: 'flex', flexDirection: 'column', alignItems: 'center', 
                        mr: 2, minWidth: 60, borderRight: '2px solid #9c27b0' 
                      }}>
                        <Typography variant="h6" fontWeight={700}>{item.hora}</Typography>
                        <TimeIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                      </Box>
                    </ListItemAvatar>
                    <ListItemText 
                      primary={<Typography fontWeight={600}>{item.paciente}</Typography>}
                      secondary={item.procedimento}
                    />
                    <Box sx={{ mr: 4 }}>
                      <Chip 
                        label={item.status} 
                        size="small" 
                        color={item.status === 'Confirmado' ? 'info' : item.status === 'Finalizado' ? 'success' : 'warning'}
                        sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                      />
                    </Box>
                  </ListItem>
                  {index < agendamentos.length - 1 && <Divider component="li" />}
                </Box>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}