import { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Paper, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow,
  Chip, Card, CardContent, LinearProgress, Divider,
  IconButton, Tooltip
} from '@mui/material';
import {
  TrendingUp as IncomeIcon,
  AccountBalanceWalletOutlined as WalletIcon,
  PendingActionsOutlined as PendingIcon,
  VisibilityOutlined as ViewIcon
} from '@mui/icons-material';
import { api } from '../services/api';

interface Lancamento {
  id: number;
  descricao: string;
  pacienteNome: string;
  valor: number;
  data: string;
  status: 'PAGO' | 'PENDENTE';
}

export default function FinanceiroPage() {
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [totais, setTotais] = useState({ recebido: 0, pendente: 0 });

  useEffect(() => {
    const carregarDadosFinanceiros = async () => {
      try {
        setLoading(true);
        
        const mockData: Lancamento[] = [
          { id: 1, descricao: 'Limpeza e Profilaxia', pacienteNome: 'Adryan Lima', valor: 250.00, data: '2026-03-31', status: 'PAGO' },
          { id: 2, descricao: 'Extração Siso', pacienteNome: 'Hugo Silva', valor: 450.00, data: '2026-03-30', status: 'PENDENTE' },
          { id: 3, descricao: 'Restauração Resina', pacienteNome: 'Elisa Santos', valor: 180.00, data: '2026-03-29', status: 'PAGO' },
          { id: 4, descricao: 'Avaliação Inicial', pacienteNome: 'Luan Miguel', valor: 100.00, data: '2026-03-28', status: 'PAGO' },
        ];

        setLancamentos(mockData);

        const recebido = mockData.filter(l => l.status === 'PAGO').reduce((acc, curr) => acc + curr.valor, 0);
        const pendente = mockData.filter(l => l.status === 'PENDENTE').reduce((acc, curr) => acc + curr.valor, 0);
        
        setTotais({ recebido, pendente });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    carregarDadosFinanceiros();
  }, []);

  return (
    <Box sx={{ p: 1 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} color="primary">
          Financeiro
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Visão geral de entradas e faturamento da clínica.
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={cardStyle}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ bgcolor: '#e8f5e9', p: 1.5, borderRadius: 2 }}>
                <IncomeIcon sx={{ color: '#2e7d32' }} />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>RECEBIDO (MÊS)</Typography>
                <Typography variant="h5" fontWeight={700} color="#2e7d32">
                  R$ {totais.recebido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={cardStyle}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ bgcolor: '#fff3e0', p: 1.5, borderRadius: 2 }}>
                <PendingIcon sx={{ color: '#ed6c02' }} />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>A RECEBER (PENDENTE)</Typography>
                <Typography variant="h5" fontWeight={700} color="#ed6c02">
                  R$ {totais.pendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ ...cardStyle, bgcolor: '#9c27b0', color: '#fff' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ bgcolor: 'rgba(255,255,255,0.2)', p: 1.5, borderRadius: 2 }}>
                <WalletIcon />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ opacity: 0.8, fontWeight: 600 }}>FATURAMENTO TOTAL</Typography>
                <Typography variant="h5" fontWeight={700}>
                  R$ {(totais.recebido + totais.pendente).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#fff' }}>
          <Typography variant="h6" fontWeight={700}>Fluxo de Entradas</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
             <Tooltip title="Gerar Relatório">
                <IconButton size="small"><ViewIcon /></IconButton>
             </Tooltip>
          </Box>
        </Box>
        <Divider />
        
        {loading ? <LinearProgress color="secondary" /> : (
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: '#f9fafb' }}>
                <TableRow>
                  <TableCell sx={headerTableCellStyle}>DATA</TableCell>
                  <TableCell sx={headerTableCellStyle}>PACIENTE</TableCell>
                  <TableCell sx={headerTableCellStyle}>SERVIÇO</TableCell>
                  <TableCell sx={headerTableCellStyle}>VALOR</TableCell>
                  <TableCell sx={headerTableCellStyle}>STATUS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {lancamentos.map((l) => (
                  <TableRow key={l.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell>{new Date(l.data).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#333' }}>{l.pacienteNome}</TableCell>
                    <TableCell color="text.secondary">{l.descricao}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>
                      R$ {l.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={l.status} 
                        size="small"
                        color={l.status === 'PAGO' ? 'success' : 'warning'}
                        variant="filled"
                        sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
}

const cardStyle = {
  borderRadius: 4,
  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
  border: '1px solid #f0f0f0'
};

const headerTableCellStyle = {
  fontWeight: 700,
  color: 'text.secondary',
  fontSize: '0.75rem',
  letterSpacing: '0.05em'
};