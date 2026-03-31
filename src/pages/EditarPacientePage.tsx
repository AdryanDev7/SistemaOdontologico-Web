import { useEffect, useState } from 'react';
import {
  Box, Typography, Button, TextField, Paper, Grid,
  Divider, FormControlLabel, Checkbox, Alert,
  CircularProgress, Snackbar, MenuItem, Skeleton, 
  Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import {
  ArrowBackOutlined as BackIcon,
  SaveOutlined as SaveIcon,
  PersonOutlined as PersonIcon,
  MedicalInformationOutlined as MedicalIcon,
  CheckCircleOutlined as CheckIcon,
  AssignmentOutlined as ProcedureIcon,
  AddCircleOutline as AddIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';
import { maskCPF, maskTelefone } from '../utils/formatters';

interface PacienteForm {
  nome: string; cpf: string; rg: string; dataNascimento: string; sexo: string;
  telefone: string; email: string; endereco: string;
  queixaPrincipal: string; alergias: string; medicamentosEmUso: string;
  doencasSistemicas: string; pressaoArterial: string;
  fumante: boolean; diabetico: boolean; hipertenso: boolean;
  cardiopatia: boolean; gravidez: boolean; observacoes: string;
}

type CampoBooleano = 'fumante' | 'diabetico' | 'hipertenso' | 'cardiopatia' | 'gravidez';

const CONDICOES: { campo: CampoBooleano; label: string }[] = [
  { campo: 'fumante', label: 'Fumante' },
  { campo: 'diabetico', label: 'Diabético(a)' },
  { campo: 'hipertenso', label: 'Hipertenso(a)' },
  { campo: 'cardiopatia', label: 'Cardiopatia' },
  { campo: 'gravidez', label: 'Gravidez / Suspeita' },
];

const ESTADO_INICIAL: PacienteForm = {
  nome: '', cpf: '', rg: '', dataNascimento: '', sexo: '',
  telefone: '', email: '', endereco: '',
  queixaPrincipal: '', alergias: '', medicamentosEmUso: '',
  doencasSistemicas: '', pressaoArterial: '',
  fumante: false, diabetico: false, hipertenso: false,
  cardiopatia: false, gravidez: false, observacoes: ''
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function EditarPacientePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [dados, setDados] = useState<PacienteForm>(ESTADO_INICIAL);
  const [loadingDados, setLoadingDados] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erroCarregar, setErroCarregar] = useState<string | null>(null);
  const [erroSalvar, setErroSalvar] = useState<string | null>(null);
  const [erros, setErros] = useState<Partial<Record<keyof PacienteForm, string>>>({});
  
  const [abaAtiva, setAbaAtiva] = useState(0);

  // --- NOVOS ESTADOS PARA O PROCEDIMENTO ---
  const [openModal, setOpenModal] = useState(false);
  const [novoProcedimento, setNovoProcedimento] = useState({
    descricao: '',
    valor: '',
    status: 'AGENDADO'
  });

  useEffect(() => {
    const carregarPaciente = async () => {
      try {
        setLoadingDados(true);
        const { data: p } = await api.get(`/pacientes/${id}`);
        setDados({
          nome: p.nome ?? '',
          cpf: maskCPF(p.cpf ?? ''),
          rg: p.rg ?? '',
          dataNascimento: p.dataNascimento ?? '',
          sexo: p.sexo ?? '',
          telefone: maskTelefone(p.telefone ?? ''),
          email: p.email ?? '',
          endereco: p.endereco ?? '',
          queixaPrincipal: p.queixaPrincipal ?? '',
          alergias: p.alergias ?? '',
          medicamentosEmUso: p.medicamentosEmUso ?? '',
          doencasSistemicas: p.doencasSistemicas ?? '',
          pressaoArterial: p.pressaoArterial ?? '',
          fumante: p.fumante ?? false,
          diabetico: p.diabetico ?? false,
          hipertenso: p.hipertenso ?? false,
          cardiopatia: p.cardiopatia ?? false,
          gravidez: p.gravidez ?? false,
          observacoes: p.observacoes ?? ''
        });
      } catch {
        setErroCarregar('Não foi possível carregar os dados do paciente.');
      } finally {
        setLoadingDados(false);
      }
    };
    carregarPaciente();
  }, [id]);

  const atualizar = (campo: keyof PacienteForm, valor: string | boolean) => {
    setDados(prev => ({ ...prev, [campo]: valor }));
    if (erros[campo]) setErros(prev => ({ ...prev, [campo]: undefined }));
  };

  const salvar = async () => {
    if (!dados.nome.trim()) {
       setErros({ nome: 'Nome é obrigatório' });
       setAbaAtiva(0);
       return;
    }
    try {
      setSalvando(true);
      await api.put(`/pacientes/${id}`, {
        ...dados,
        cpf: dados.cpf.replace(/\D/g, ''),
        telefone: dados.telefone.replace(/\D/g, '')
      });
      setSucesso(true);
    } catch (err: any) {
      setErroSalvar(err.message || 'Erro ao salvar');
    } finally {
      setSalvando(false);
    }
  };

  // --- FUNÇÃO PARA SALVAR O PROCEDIMENTO ---
  const handleSalvarNovoProcedimento = async () => {
    try {
      setSalvando(true);
      await api.post('/procedimentos', {
        ...novoProcedimento,
        pacienteId: id,
        data: new Date().toISOString()
      });
      setSucesso(true);
      setOpenModal(false);
      setNovoProcedimento({ descricao: '', valor: '', status: 'AGENDADO' });
    } catch (err: any) {
      setErroSalvar("Erro ao salvar procedimento. Verifique a API.");
    } finally {
      setSalvando(false);
    }
  };

  if (loadingDados) return <EditarLoading />;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Button startIcon={<BackIcon />} onClick={() => navigate(`/pacientes/${id}`)} sx={{ color: 'text.secondary', textTransform: 'none' }}>
          Ficha do Paciente
        </Button>
        <Typography color="text.disabled">/</Typography>
        <Typography color="text.primary" fontWeight={500}>Editar</Typography>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={600}>Paciente: {dados.nome || 'Carregando...'}</Typography>
      </Box>

      <Paper elevation={0} sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'transparent' }}>
        <Tabs 
          value={abaAtiva} 
          onChange={(_, newValue) => setAbaAtiva(newValue)}
          textColor="primary"
          indicatorColor="primary"
          sx={{ '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '0.95rem' } }}
        >
          <Tab icon={<PersonIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Dados Pessoais" />
          <Tab icon={<MedicalIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Anamnese" />
          <Tab icon={<ProcedureIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Procedimentos" />
        </Tabs>
      </Paper>

      <CustomTabPanel value={abaAtiva} index={0}>
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 3 }}>
          <Grid container spacing={2.5}>
            <Grid item xs={12} md={8}>
              <TextField fullWidth required label="Nome completo" value={dados.nome} onChange={e => atualizar('nome', e.target.value)} error={!!erros.nome} helperText={erros.nome} size="small" sx={fieldStyle} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth select label="Sexo" value={dados.sexo} onChange={e => atualizar('sexo', e.target.value)} size="small" sx={fieldStyle}>
                <MenuItem value="FEMININO">Feminino</MenuItem>
                <MenuItem value="MASCULINO">Masculino</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField fullWidth label="CPF" value={dados.cpf} onChange={e => atualizar('cpf', maskCPF(e.target.value))} size="small" sx={fieldStyle} />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
               <TextField fullWidth label="Telefone" value={dados.telefone} onChange={e => atualizar('telefone', maskTelefone(e.target.value))} size="small" sx={fieldStyle} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Endereço" value={dados.endereco} onChange={e => atualizar('endereco', e.target.value)} size="small" sx={fieldStyle} />
            </Grid>
          </Grid>
        </Paper>
      </CustomTabPanel>

      <CustomTabPanel value={abaAtiva} index={1}>
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 3 }}>
          <Grid container spacing={2.5}>
            <Grid item xs={12}>
              <TextField fullWidth label="Queixa principal" value={dados.queixaPrincipal} onChange={e => atualizar('queixaPrincipal', e.target.value)} multiline rows={3} size="small" sx={fieldStyle} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Alergias" value={dados.alergias} onChange={e => atualizar('alergias', e.target.value)} size="small" sx={fieldStyle} />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>Condições de Saúde</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {CONDICOES.map(({ campo, label }) => (
                  <FormControlLabel key={campo} control={<Checkbox checked={dados[campo]} onChange={e => atualizar(campo, e.target.checked)} size="small" />} label={label} sx={checkboxCardStyle(dados[campo])} />
                ))}
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </CustomTabPanel>

      <CustomTabPanel value={abaAtiva} index={2}>
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 4, textAlign: 'center', bgcolor: '#fafafa' }}>
          <ProcedureIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>Nenhum procedimento registrado</Typography>
          <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>Lançar novo procedimento realizado.</Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            sx={btnPrimaryStyle}
            onClick={() => setOpenModal(true)}
          >
            Adicionar Procedimento
          </Button>
        </Paper>
      </CustomTabPanel>

      {abaAtiva !== 2 && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
          <Button variant="outlined" onClick={() => navigate(`/pacientes/${id}`)} sx={{ borderRadius: 2, textTransform: 'none' }}>Cancelar</Button>
          <Button variant="contained" onClick={salvar} disabled={salvando} startIcon={salvando ? <CircularProgress size={16} /> : <SaveIcon />} sx={btnPrimaryStyle}>
            {salvando ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </Box>
      )}

      {/* MODAL DE ADICIONAR PROCEDIMENTO */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 600 }}>Novo Procedimento</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={12}>
              <TextField 
                fullWidth label="Descrição do serviço" autoFocus
                value={novoProcedimento.descricao}
                onChange={e => setNovoProcedimento({...novoProcedimento, descricao: e.target.value})}
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField 
                fullWidth label="Valor (R$)" type="number"
                value={novoProcedimento.valor}
                onChange={e => setNovoProcedimento({...novoProcedimento, valor: e.target.value})}
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField 
                fullWidth select label="Status"
                value={novoProcedimento.status}
                onChange={e => setNovoProcedimento({...novoProcedimento, status: e.target.value})}
                size="small"
              >
                <MenuItem value="AGENDADO">Agendado</MenuItem>
                <MenuItem value="REALIZADO">Realizado</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenModal(false)} color="inherit">Cancelar</Button>
          <Button 
            variant="contained" 
            onClick={handleSalvarNovoProcedimento}
            disabled={!novoProcedimento.descricao || salvando}
            sx={btnPrimaryStyle}
          >
            Salvar Procedimento
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={sucesso} autoHideDuration={3000} onClose={() => setSucesso(false)}>
        <Alert severity="success" sx={{ borderRadius: 2 }}>Operação realizada com sucesso!</Alert>
      </Snackbar>
    </Box>
  );
}

const fieldStyle = {
  '& .MuiOutlinedInput-root': { borderRadius: 2, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#9c27b0' } },
  '& .MuiInputLabel-root.Mui-focused': { color: '#9c27b0' }
};

const btnPrimaryStyle = {
  bgcolor: '#9c27b0', textTransform: 'none', fontWeight: 600, borderRadius: 2,
  '&:hover': { bgcolor: '#7b1fa2' }
};

const checkboxCardStyle = (active: boolean) => ({
  border: '1px solid', borderColor: active ? '#9c27b0' : 'divider',
  borderRadius: 2, px: 1, mr: 1, mb: 1, bgcolor: active ? '#fdf4ff' : 'transparent',
  transition: '0.2s', '& .MuiTypography-root': { fontSize: '0.85rem' }
});

function EditarLoading() {
    return <Box sx={{ p: 4 }}><Skeleton variant="rectangular" height={400} sx={{ borderRadius: 3 }} /></Box>;
}