import { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Chip, IconButton, Tooltip,
  TextField, InputAdornment, Avatar, Paper, Skeleton,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TablePagination, Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  EditOutlined as EditIcon,
  FolderOpenOutlined as FichaIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';


import { api } from '../services/api';

// Interface batendo com o JPA do Back-end
interface Paciente {
  id: number;
  nome: string;
  cpf: string;
  telefone: string;
  email?: string;
  dataNascimento?: string;
  ativo?: boolean;
}

// Helpers de formatação
const formatCPF = (cpf: string) => cpf.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');

const formatTelefone = (tel: string) => {
  const digits = tel.replace(/\D/g, '');
  if (digits.length === 11) return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
};

// Gera iniciais pro Avatar (Ex: Adryan Lima -> AL)
const getInitials = (nome: string) => {
  const partes = nome.trim().split(' ');
  return partes.length >= 2 
    ? `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase() 
    : nome.substring(0, 2).toUpperCase();
};

// Paleta fixa pra manter consistência visual nos Avatares
const AVATAR_COLORS = ['#9c27b0', '#7b1fa2', '#6a1b9a', '#ab47bc', '#8e24aa', '#ba68c8', '#ce93d8', '#7e57c2'];
const getAvatarColor = (nome: string) => {
  let hash = 0;
  for (let i = 0; i < nome.length; i++) hash = nome.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

export default function PacientesPage() {
  const navigate = useNavigate();
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [busca, setBusca] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Request inicial pro Back-end
  useEffect(() => {
    const fetchPacientes = async () => {
      try {
        setLoading(true);
        const { data } = await api.get<Paciente[]>('/pacientes');
        setPacientes(data);
      } catch (err) {
        setErro('Erro de conexão. O servidor está on-line?');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPacientes();
  }, []);

  // Lógica de filtro (ignora símbolos no CPF)
  const pacientesFiltrados = pacientes.filter((p) => {
    const termo = busca.toLowerCase().replace(/\D/g, '') || busca.toLowerCase();
    return p.nome.toLowerCase().includes(busca.toLowerCase()) || p.cpf.replace(/\D/g, '').includes(termo);
  });

  const pacientesPaginados = pacientesFiltrados.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box>
      {/* Título e CTA principal */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={600}>Pacientes</Typography>
          <Typography variant="body2" color="text.secondary">
            {!loading && `${pacientesFiltrados.length} registros encontrados`}
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/pacientes/novo')}
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
        >
          Novo Paciente
        </Button>
      </Box>

      {/* Filtro de texto */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Buscar por nome ou CPF..."
          value={busca}
          onChange={(e) => { setBusca(e.target.value); setPage(0); }}
          size="small"
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
          }}
          sx={{ maxWidth: 420, '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'background.paper' } }}
        />
      </Box>

      {erro && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{erro}</Alert>}

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8f5fa' }}>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem', pl: 3 }}>PACIENTE</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>CPF</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>TELEFONE</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>STATUS</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.75rem', pr: 3 }}>AÇÕES</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {/* Skeletons de Loading */}
              {loading && Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell sx={{ pl: 3 }}><Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}><Skeleton variant="circular" width={36} height={36} /><Skeleton width={160} /></Box></TableCell>
                  <TableCell><Skeleton width={130} /></TableCell>
                  <TableCell><Skeleton width={140} /></TableCell>
                  <TableCell><Skeleton width={70} height={28} /></TableCell>
                  <TableCell align="right" sx={{ pr: 3 }}><Skeleton width={80} /></TableCell>
                </TableRow>
              ))}

              {/* Empty State */}
              {!loading && pacientesFiltrados.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <Typography variant="body2" color="text.secondary">Nenhum paciente encontrado.</Typography>
                  </TableCell>
                </TableRow>
              )}

              {/* Mapeamento da lista */}
              {!loading && pacientesPaginados.map((paciente) => (
                <TableRow key={paciente.id} hover sx={{ '&:hover': { bgcolor: '#fdf8ff' }, '&:last-child td': { border: 0 } }}>
                  <TableCell sx={{ pl: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ width: 36, height: 36, bgcolor: getAvatarColor(paciente.nome), fontSize: '0.8rem', fontWeight: 700 }}>
                        {getInitials(paciente.nome)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>{paciente.nome}</Typography>
                        <Typography variant="caption" color="text.secondary">{paciente.email}</Typography>
                      </Box>
                    </Box>
                  </TableCell>

                  <TableCell><Typography variant="body2" fontFamily="monospace">{formatCPF(paciente.cpf)}</Typography></TableCell>
                  <TableCell><Typography variant="body2">{formatTelefone(paciente.telefone)}</Typography></TableCell>

                  <TableCell>
                    <Chip 
                      label={paciente.ativo !== false ? 'Ativo' : 'Inativo'} 
                      size="small" 
                      sx={{ 
                        bgcolor: paciente.ativo !== false ? '#f0faf5' : '#fef2f2', 
                        color: paciente.ativo !== false ? '#15803d' : '#dc2626',
                        fontWeight: 600, borderRadius: 1.5 
                      }} 
                    />
                  </TableCell>

                  <TableCell align="right" sx={{ pr: 3 }}>
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                      <Tooltip title="Ver ficha">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => navigate(`/pacientes/${paciente.id}`)}
                        >
                          <FichaIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/pacientes/${paciente.id}/editar`)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={pacientesFiltrados.length}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          labelRowsPerPage="Linhas:"
        />
      </Paper>
    </Box>
  );
}