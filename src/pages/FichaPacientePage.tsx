import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Paper, Chip, Avatar,
  Tab, Tabs, Divider, Skeleton, Alert
} from '@mui/material';
import { GridLegacy as Grid } from '@mui/material';
import {
  Timeline, TimelineItem, TimelineSeparator, TimelineConnector,
  TimelineContent, TimelineDot
} from '@mui/lab';
import {
  ArrowBackOutlined as BackIcon,
  EditOutlined as EditIcon,
  PersonOutlined as PersonIcon,
  MedicalInformationOutlined as MedicalIcon,
  HistoryOutlined as HistoryIcon,
  PhoneOutlined as PhoneIcon,
  EmailOutlined as EmailIcon,
  BadgeOutlined as BadgeIcon,
  HomeOutlined as HomeIcon,
  CheckCircleOutline as CheckIcon,
  CancelOutlined as CancelIcon,
  EventNoteOutlined as EventIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api'; 
import {
  formatarCPF, formatarTelefone, formatarData, calcularIdade
} from '../utils/formatters';

interface Paciente {
  id: number;
  nome: string;
  cpf: string;
  rg?: string;
  dataNascimento?: string;
  sexo?: string;
  telefone: string;
  email?: string;
  endereco?: string;
  ativo?: boolean;
  queixaPrincipal?: string;
  alergias?: string;
  medicamentosEmUso?: string;
  doencasSistemicas?: string;
  pressaoArterial?: string;
  fumante?: boolean;
  diabetico?: boolean;
  hipertenso?: boolean;
  cardiopatia?: boolean;
  gravidez?: boolean;
  observacoes?: string;
}

const CONSULTAS_MOCK = [
  { id: 1, data: '2024-11-20T14:00:00', procedimento: 'Limpeza e profilaxia', dentista: 'Dra. Elisa', observacao: 'Higiene bucal reforçada.' },
  { id: 2, data: '2024-09-05T09:30:00', procedimento: 'Restauração dente 36', dentista: 'Dra. Elisa', observacao: 'Resina fotopolimerizável.' }
];

export default function FichaPacientePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const { data } = await api.get<Paciente>(`/pacientes/${id}`);
        setPaciente(data);
      } catch (err) {
        setErro('Erro ao carregar prontuário.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) return <Box sx={{ p: 3 }}><Skeleton variant="rectangular" height={200} sx={{ borderRadius: 3 }} /></Box>;
  if (erro || !paciente) return <Alert severity="error" sx={{ m: 2 }}>{erro || 'Não encontrado.'}</Alert>;

  const idade = calcularIdade(paciente.dataNascimento);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <Button startIcon={<BackIcon />} onClick={() => navigate('/pacientes')} sx={{ color: 'text.secondary', textTransform: 'none' }}>
          Pacientes
        </Button>
        <Typography color="text.disabled">/</Typography>
        <Typography color="text.primary" fontWeight={500}>{paciente.nome}</Typography>
      </Box>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
          <Avatar sx={{ width: 72, height: 72, bgcolor: '#9c27b0', fontSize: '1.5rem', fontWeight: 700 }}>
            {paciente.nome.substring(0, 2).toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography variant="h5" fontWeight={700}>{paciente.nome}</Typography>
              <Chip label="Ativo" size="small" color="success" variant="outlined" />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {idade} anos · CPF: {formatarCPF(paciente.cpf)} · {formatarTelefone(paciente.telefone)}
            </Typography>
          </Box>
          <Button variant="outlined" startIcon={<EditIcon />} onClick={() => navigate(`/pacientes/${id}/editar`)}>
            Editar
          </Button>
        </Box>
      </Paper>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab icon={<PersonIcon fontSize="small" />} iconPosition="start" label="Pessoais" />
        <Tab icon={<MedicalIcon fontSize="small" />} iconPosition="start" label="Anamnese" />
        <Tab icon={<HistoryIcon fontSize="small" />} iconPosition="start" label="Histórico" />
      </Tabs>

      {tab === 0 && (
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <LabelValue icon={<PhoneIcon />} label="Telefone" value={formatarTelefone(paciente.telefone)} />
              <LabelValue icon={<EmailIcon />} label="E-mail" value={paciente.email} />
              <LabelValue icon={<HomeIcon />} label="Endereço" value={paciente.endereco} />
            </Grid>
            <Grid item xs={12} md={6}>
              <LabelValue icon={<BadgeIcon />} label="RG" value={paciente.rg} />
              <LabelValue icon={<PersonIcon />} label="Sexo" value={paciente.sexo} />
            </Grid>
          </Grid>
        </Paper>
      )}

      {tab === 1 && (
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 3 }}>
          <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
            <ConditionChip label="Fumante" val={paciente.fumante} />
            <ConditionChip label="Diabético" val={paciente.diabetico} />
            <ConditionChip label="Hipertenso" val={paciente.hipertenso} />
            <ConditionChip label="Cardiopata" val={paciente.cardiopatia} />
          </Box>
          <Divider sx={{ mb: 3 }} />
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <InfoBox label="Queixa Principal" value={paciente.queixaPrincipal} />
              <InfoBox label="Alergias" value={paciente.alergias} alert />
            </Grid>
            <Grid item xs={12} md={6}>
              <InfoBox label="Medicamentos" value={paciente.medicamentosEmUso} />
              <InfoBox label="Observações" value={paciente.observacoes} />
            </Grid>
          </Grid>
        </Paper>
      )}

      {tab === 2 && (
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 3 }}>
          <Timeline position="right">
            {CONSULTAS_MOCK.map((c, i) => (
              <TimelineItem key={c.id} sx={{ '&::before': { flex: 0, p: 0 } }}>
                <TimelineSeparator>
                  <TimelineDot color="primary"><EventIcon sx={{ fontSize: 16 }} /></TimelineDot>
                  {i < CONSULTAS_MOCK.length - 1 && <TimelineConnector />}
                </TimelineSeparator>
                <TimelineContent sx={{ pb: 3 }}>
                  <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                    <Typography variant="body2" fontWeight={600}>{c.procedimento}</Typography>
                    <Typography variant="caption" color="text.secondary">{formatarData(c.data, true)}</Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>{c.observacao}</Typography>
                  </Box>
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        </Paper>
      )}
    </Box>
  );
}

// Sub-componentes auxiliares (precisam estar fora ou dentro do arquivo)
const LabelValue = ({ icon, label, value }: any) => (
  <Box sx={{ display: 'flex', gap: 1.5, py: 1 }}>
    <Box sx={{ color: 'primary.main', mt: 0.5 }}>{React.cloneElement(icon, { fontSize: 'small' })}</Box>
    <Box>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="body2" fontWeight={500}>{value || '—'}</Typography>
    </Box>
  </Box>
);

const ConditionChip = ({ label, val }: any) => (
  <Chip 
    label={label} 
    size="small" 
    icon={val ? <CheckIcon fontSize="small" /> : <CancelIcon fontSize="small" />}
    sx={{ bgcolor: val ? '#f0fdf4' : '#f9fafb', color: val ? '#15803d' : '#6b7280', fontWeight: 600, mr: 1 }}
  />
);

const InfoBox = ({ label, value, alert }: any) => (
  <Box sx={{ mb: 2 }}>
    <Typography variant="caption" fontWeight={600} color="text.secondary">{label}</Typography>
    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alert ? '#fff1f2' : '#f8f9fa', border: '1px solid', borderColor: alert ? '#fecaca' : 'divider' }}>
      <Typography variant="body2" color={alert ? '#e11d48' : 'text.primary'}>{value || 'Nenhuma informação.'}</Typography>
    </Box>
  </Box>
);