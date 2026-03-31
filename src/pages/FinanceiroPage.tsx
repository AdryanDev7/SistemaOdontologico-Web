import { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Paper, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow,
  Chip, Card, CardContent, Divider, Button, Tabs, Tab, 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  TextField, MenuItem, Fade, CircularProgress
} from '@mui/material';
import {
  TrendingUp, TrendingDown, AddCircleOutline, 
  AccountBalanceWallet, EventNote
} from '@mui/icons-material';
import { api } from '../services/api';

interface Transacao {
  id: number;
  descricao: string;
  categoria: string;
  valor: number;
  data: string;
  tipo: 'ENTRADA' | 'SAIDA';
}

export default function FinanceiroPage() {
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [novaDespesa, setNovaDespesa] = useState({ descricao: '', valor: '', categoria: 'MATERIAL' });

  const carregarDados = async () => {
    try {
      setLoading(true);
      const response = await api.get('/financeiro/fluxo-caixa');
      setTransacoes(response.data);
    } catch (error) {
      console.error("Erro ao buscar dados reais:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregarDados(); }, []);

  const handleSalvarDespesa = async () => {
    try {
      setSalvando(true);
      await api.post('/financeiro/despesas', novaDespesa);
      setOpenModal(false);
      setNovaDespesa({ descricao: '', valor: '', categoria: 'MATERIAL' });
      carregarDados();
    } catch (error) {
      console.error(error);
    } finally {
      setSalvando(false);
    }
  };

  const entradas = transacoes.filter(t => t.tipo === 'ENTRADA').reduce((acc, curr) => acc + curr.valor, 0);
  const saidas = transacoes.filter(t => t.tipo === 'SAIDA').reduce((acc, curr) => acc + curr.valor, 0);
  const saldo = entradas - saidas;

  return (
    <Fade in={true} timeout={800}>
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 5 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#1a202c' }}>Fluxo de Caixa</Typography>
            <Typography variant="body1" color="text.secondary">Dados reais do sistema Odonto Pro</Typography>
          </Box>
          <Button variant="contained" startIcon={<AddCircleOutline />} onClick={() => setOpenModal(true)} sx={premiumBtnStyle}>
            Registrar Saída
          </Button>
        </Box>

        <Grid container spacing={3} sx={{ mb: 6 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ ...cardBase, borderLeft: '6px solid #10b981' }}>
              <CardContent>
                <Typography variant="overline" fontWeight={700} color="text.secondary">ENTRADAS</Typography>
                <Typography variant="h4" fontWeight={800} color="#064e3b">R$ {entradas.toLocaleString('pt-BR')}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ ...cardBase, borderLeft: '6px solid #ef4444' }}>
              <CardContent>
                <Typography variant="overline" fontWeight={700} color="text.secondary">SAÍDAS</Typography>
                <Typography variant="h4" fontWeight={800} color="#7f1d1d">R$ {saidas.toLocaleString('pt-BR')}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={balanceCard}>
              <CardContent>
                <Typography variant="overline" fontWeight={700} color="rgba(255,255,255,0.8)">SALDO ATUAL</Typography>
                <Typography variant="h4" fontWeight={800}>R$ {saldo.toLocaleString('pt-BR')}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Paper elevation={0} sx={premiumTable}>
          <Tabs value={abaAtiva} onChange={(_, v) => setAbaAtiva(v)} sx={{ px: 3, pt: 1 }}>
            <Tab label="Receitas" sx={{ fontWeight: 700, textTransform: 'none' }} />
            <Tab label="Despesas" sx={{ fontWeight: 700, textTransform: 'none' }} />
          </Tabs>
          <Divider />
          {loading ? (
             <Box sx={{ p: 10, textAlign: 'center' }}><CircularProgress /></Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell sx={headerStyle}>DATA</TableCell>
                    <TableCell sx={headerStyle}>DESCRIÇÃO</TableCell>
                    <TableCell sx={headerStyle} align="right">VALOR</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transacoes.filter(t => (abaAtiva === 0 ? t.tipo === 'ENTRADA' : t.tipo === 'SAIDA')).map((t) => (
                    <TableRow key={t.id} hover>
                      <TableCell sx={{ color: 'text.secondary' }}>{new Date(t.data).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{t.descricao}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800, color: t.tipo === 'ENTRADA' ? '#10b981' : '#ef4444' }}>
                        {t.tipo === 'ENTRADA' ? '+' : '-'} R$ {t.valor.toLocaleString('pt-BR')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>

        <Dialog open={openModal} onClose={() => setOpenModal(false)} PaperProps={{ sx: { borderRadius: 4 } }}>
          <DialogTitle sx={{ fontWeight: 800 }}>Registrar Saída</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField fullWidth label="Descrição" variant="filled" value={novaDespesa.descricao} onChange={e => setNovaDespesa({...novaDespesa, descricao: e.target.value})} sx={inputStyle} />
            <TextField fullWidth label="Valor" type="number" variant="filled" value={novaDespesa.valor} onChange={e => setNovaDespesa({...novaDespesa, valor: e.target.value})} sx={inputStyle} />
            <TextField fullWidth select label="Categoria" variant="filled" value={novaDespesa.categoria} onChange={e => setNovaDespesa({...novaDespesa, categoria: e.target.value})} sx={inputStyle}>
              <MenuItem value="MATERIAL">Material</MenuItem>
              <MenuItem value="FIXO">Custo Fixo</MenuItem>
              <MenuItem value="PROLABORE">Pró-labore</MenuItem>
            </TextField>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpenModal(false)}>Cancelar</Button>
            <Button variant="contained" sx={premiumBtnStyle} onClick={handleSalvarDespesa} disabled={salvando}>
              {salvando ? <CircularProgress size={24} /> : 'Salvar'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Fade>
  );
}

const cardBase = { borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' };
const balanceCard = { borderRadius: '16px', background: 'linear-gradient(135deg, #6d28d9 0%, #4c1d95 100%)', color: '#fff', boxShadow: '0 10px 25px rgba(109, 40, 217, 0.3)' };
const premiumTable = { borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' };
const premiumBtnStyle = { bgcolor: '#6d28d9', fontWeight: 700, borderRadius: '12px', textTransform: 'none', '&:hover': { bgcolor: '#5b21b6' } };
const headerStyle = { fontWeight: 800, color: '#64748b', fontSize: '0.75rem' };
const inputStyle = { '& .MuiInputBase-root': { borderRadius: '12px' } };