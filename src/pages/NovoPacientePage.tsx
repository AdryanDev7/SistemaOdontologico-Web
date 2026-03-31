import { useState } from 'react';
import {
  Box, Typography, Button, TextField, Paper, Grid,
  FormControlLabel, Checkbox, Alert, CircularProgress, 
  Snackbar, MenuItem, Stepper, Step, StepLabel, Divider
} from '@mui/material';
import {
  SaveOutlined as SaveIcon,
  PersonOutlined as PersonIcon,
  MedicalInformationOutlined as MedicalIcon,
  CheckCircleOutlined as CheckIcon,
  AddCircleOutline as AddIcon,
  ArrowForward as NextIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { maskCPF, maskTelefone } from '../utils/formatters';

const PASSOS = ['Dados Pessoais', 'Anamnese', 'Procedimento'];

export default function NovoPacientePage() {
  const navigate = useNavigate();
  
  const [activeStep, setActiveStep] = useState(0);
  const [pacienteId, setPacienteId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  // --- ESTADOS DOS FORMULÁRIOS ---
  const [dados, setDados] = useState({
    nome: '', cpf: '', rg: '', dataNascimento: '', sexo: '',
    telefone: '', email: '', endereco: '',
    queixaPrincipal: '', alergias: '', medicamentosEmUso: '',
    doencasSistemicas: '', pressaoArterial: '',
    fumante: false, diabetico: false, hipertenso: false,
    cardiopatia: false, gravidez: false, observacoes: ''
  });

  const [procedimento, setProcedimento] = useState({
    descricao: '',
    valor: '',
    status: 'AGENDADO',
    // Inicia com a data/hora atual no formato que o input datetime-local aceita (YYYY-MM-DDTHH:mm)
    dataAgendada: new Date().toISOString().slice(0, 16) 
  });

  const atualizar = (campo: string, valor: any) => {
    setDados(prev => ({ ...prev, [campo]: valor }));
  };

  // --- LÓGICA DE SALVAMENTO ---

  const handleFinalizarAnamnese = async () => {
    try {
      setLoading(true);
      const response = await api.post('/pacientes', {
        ...dados,
        cpf: dados.cpf.replace(/\D/g, ''),
        telefone: dados.telefone.replace(/\D/g, '')
      });
      setPacienteId(response.data.id);
      setSucesso(true);
      setActiveStep(2); 
    } catch (err) {
      setErro("Erro ao cadastrar paciente.");
    } finally {
      setLoading(false);
    }
  };

  const handleSalvarProcedimento = async () => {
    try {
      setLoading(true);
      await api.post('/procedimentos', {
        descricao: procedimento.descricao,
        valor: procedimento.valor,
        status: procedimento.status,
        data: procedimento.dataAgendada, // Envia a data escolhida pelo dentista
        pacienteId: pacienteId,
      });
      
      setSucesso(true);
      navigate(`/pacientes/${pacienteId}`);
    } catch (err) {
      setErro("Erro ao salvar procedimento.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 900, margin: '0 auto', p: 2 }}>
      <Typography variant="h5" fontWeight={700} mb={3}>Novo Cadastro</Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {PASSOS.map((label) => (
          <Step key={label}><StepLabel>{label}</StepLabel></Step>
        ))}
      </Stepper>

      {erro && <Alert severity="error" sx={{ mb: 3 }}>{erro}</Alert>}

      {/* PASSO 0: DADOS PESSOAIS */}
      {activeStep === 0 && (
        <Paper elevation={0} sx={paperStyle}>
          <Typography variant="subtitle1" fontWeight={600} mb={3} display="flex" alignItems="center" gap={1}>
            <PersonIcon color="primary" /> Dados Pessoais
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <TextField fullWidth label="Nome completo" value={dados.nome} onChange={e => atualizar('nome', e.target.value)} size="small" sx={fieldStyle} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth select label="Sexo" value={dados.sexo} onChange={e => atualizar('sexo', e.target.value)} size="small" sx={fieldStyle}>
                <MenuItem value="MASCULINO">Masculino</MenuItem>
                <MenuItem value="FEMININO">Feminino</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="CPF" value={dados.cpf} onChange={e => atualizar('cpf', maskCPF(e.target.value))} size="small" sx={fieldStyle} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="E-mail" type="email" value={dados.email} onChange={e => atualizar('email', e.target.value)} size="small" sx={fieldStyle} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Telefone" value={dados.telefone} onChange={e => atualizar('telefone', maskTelefone(e.target.value))} size="small" sx={fieldStyle} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Endereço" value={dados.endereco} onChange={e => atualizar('endereco', e.target.value)} size="small" sx={fieldStyle} />
            </Grid>
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
            <Button variant="contained" onClick={() => setActiveStep(1)} endIcon={<NextIcon />} sx={btnPrimaryStyle}>
              Ir para Anamnese
            </Button>
          </Box>
        </Paper>
      )}

      {/* PASSO 1: ANAMNESE */}
      {activeStep === 1 && (
        <Paper elevation={0} sx={paperStyle}>
          <Typography variant="subtitle1" fontWeight={600} mb={3} display="flex" alignItems="center" gap={1}>
            <MedicalIcon color="primary" /> Anamnese
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField fullWidth multiline rows={2} label="Queixa principal" value={dados.queixaPrincipal} onChange={e => atualizar('queixaPrincipal', e.target.value)} size="small" sx={fieldStyle} />
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ mb: 2 }}><Typography variant="caption" color="text.secondary">Condições de Saúde</Typography></Divider>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {['fumante', 'diabetico', 'hipertenso', 'cardiopatia'].map((c) => (
                  <FormControlLabel 
                    key={c}
                    control={<Checkbox checked={(dados as any)[c]} onChange={e => atualizar(c, e.target.checked)} />} 
                    label={c.charAt(0).toUpperCase() + c.slice(1)} 
                    sx={checkboxStyle((dados as any)[c])}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button startIcon={<BackIcon />} onClick={() => setActiveStep(0)}>Voltar</Button>
            <Button 
              variant="contained" 
              onClick={handleFinalizarAnamnese} 
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
              sx={btnPrimaryStyle}
            >
              Salvar e Adicionar Procedimento
            </Button>
          </Box>
        </Paper>
      )}

      {/* PASSO 2: PROCEDIMENTO */}
      {activeStep === 2 && (
        <Paper elevation={0} sx={paperStyle}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
             <CheckIcon sx={{ fontSize: 40, color: 'success.main' }} />
             <Typography variant="h6">Paciente Cadastrado!</Typography>
             <Typography variant="body2" color="text.secondary">Agora, agende o procedimento para <strong>{dados.nome}</strong></Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} md={12}>
              <TextField 
                fullWidth 
                label="Descrição do Procedimento" 
                placeholder="Ex: Limpeza, Extração elemento 22"
                value={procedimento.descricao}
                onChange={e => setProcedimento({...procedimento, descricao: e.target.value})}
                size="small" 
                sx={fieldStyle} 
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField 
                fullWidth 
                label="Valor" 
                type="number"
                value={procedimento.valor}
                onChange={e => setProcedimento({...procedimento, valor: e.target.value})}
                InputProps={{ startAdornment: <Typography sx={{mr:1}}>R$</Typography> }}
                size="small" 
                sx={fieldStyle} 
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField 
                fullWidth select label="Status"
                value={procedimento.status}
                onChange={e => setProcedimento({...procedimento, status: e.target.value})}
                size="small" sx={fieldStyle}
              >
                <MenuItem value="AGENDADO">Agendado</MenuItem>
                <MenuItem value="REALIZADO">Realizado</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Data e Hora"
                type="datetime-local"
                value={procedimento.dataAgendada}
                onChange={e => setProcedimento({...procedimento, dataAgendada: e.target.value})}
                InputLabelProps={{ shrink: true }}
                size="small"
                sx={fieldStyle}
              />
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
            <Button 
              variant="contained" 
              onClick={handleSalvarProcedimento}
              disabled={loading || !procedimento.descricao}
              startIcon={<AddIcon />} 
              sx={btnPrimaryStyle}
            >
              Finalizar e Salvar Agendamento
            </Button>
            <Button variant="text" onClick={() => navigate(`/pacientes/${pacienteId}`)}>
              Pular e ir para Ficha
            </Button>
          </Box>
        </Paper>
      )}

      <Snackbar open={sucesso} autoHideDuration={3000} onClose={() => setSucesso(false)}>
        <Alert severity="success">Operação realizada!</Alert>
      </Snackbar>
    </Box>
  );
}

const paperStyle = { border: '1px solid #e0e0e0', borderRadius: 3, p: 4, bgcolor: '#fff' };
const btnPrimaryStyle = { bgcolor: '#9c27b0', '&:hover': { bgcolor: '#7b1fa2' }, textTransform: 'none', fontWeight: 600, borderRadius: 2 };
const fieldStyle = { '& .MuiOutlinedInput-root': { borderRadius: 2 } };
const checkboxStyle = (active: boolean) => ({
  border: '1px solid', borderColor: active ? '#9c27b0' : '#ddd',
  borderRadius: 2, px: 1, bgcolor: active ? '#fdf4ff' : 'transparent', mr: 1
});