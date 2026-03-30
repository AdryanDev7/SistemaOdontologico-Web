import { useState } from 'react';
import {
  Box, Typography, Button, TextField, Paper, Grid,
  Divider, FormControlLabel, Checkbox, Alert,
  CircularProgress, Snackbar, MenuItem, InputAdornment,
  Stepper, Step, StepLabel
} from '@mui/material';
import {
  PersonOutlined as PersonIcon,
  MedicalInformationOutlined as MedicalIcon,
  ArrowBackOutlined as BackIcon,
  SaveOutlined as SaveIcon,
  CheckCircleOutlined as CheckIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

import { api } from '../services/api';

// Payload esperado pelo Controller no Spring Boot
interface PacientePayload {
  nome: string;
  cpf: string;
  rg?: string;
  dataNascimento?: string;
  sexo?: string;
  telefone: string;
  email?: string;
  endereco?: string;
  // Ficha de Anamnese
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

// Helpers de máscara (UI)
const maskCPF = (v: string) =>
  v.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2').substring(0, 14);

const maskTelefone = (v: string) =>
  v.replace(/\D/g, '').replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2').substring(0, 15);

export default function NovoPacientePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // 0: pessoais, 1: anamnese
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erroSalvar, setErroSalvar] = useState<string | null>(null);

  // Initial state do formulário
  const [dados, setDados] = useState<PacientePayload>({
    nome: '',
    cpf: '',
    rg: '',
    dataNascimento: '',
    sexo: '',
    telefone: '',
    email: '',
    endereco: '',
    queixaPrincipal: '',
    alergias: '',
    medicamentosEmUso: '',
    doencasSistemicas: '',
    pressaoArterial: '',
    fumante: false,
    diabetico: false,
    hipertenso: false,
    cardiopatia: false,
    gravidez: false,
    observacoes: ''
  });

  // Erros de validação em tempo real
  const [erros, setErros] = useState<Partial<Record<keyof PacientePayload, string>>>({});

  const atualizar = (campo: keyof PacientePayload, valor: string | boolean) => {
    setDados((prev) => ({ ...prev, [campo]: valor }));
    if (erros[campo]) setErros((prev) => ({ ...prev, [campo]: undefined }));
  };

  // Validação básica do primeiro step
  const validarStep0 = (): boolean => {
    const novosErros: typeof erros = {};
    if (!dados.nome.trim()) novosErros.nome = 'Nome é obrigatório';
    if (!dados.cpf || dados.cpf.replace(/\D/g, '').length !== 11) novosErros.cpf = 'CPF inválido';
    if (!dados.telefone || dados.telefone.replace(/\D/g, '').length < 10) novosErros.telefone = 'Telefone inválido';
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const avancar = () => {
    if (validarStep0()) setStep(1);
  };

  // Envio pro back-end (limpa máscaras antes de enviar)
  const salvar = async () => {
    if (!validarStep0()) { setStep(0); return; }
    try {
      setSalvando(true);
      setErroSalvar(null);
      await api.post('/pacientes', {
        ...dados,
        cpf: dados.cpf.replace(/\D/g, ''),
        telefone: dados.telefone.replace(/\D/g, '')
      });
      setSucesso(true);
      setTimeout(() => navigate('/pacientes'), 1500);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Erro ao salvar. Verifique a conexão.';
      setErroSalvar(msg);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Box>
      {/* Breadcrumb simples */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <Button startIcon={<BackIcon />} onClick={() => navigate('/pacientes')} sx={{ color: 'text.secondary', textTransform: 'none' }}>
          Pacientes
        </Button>
        <Typography color="text.disabled">/</Typography>
        <Typography color="text.primary" fontWeight={500}>Novo Paciente</Typography>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={600}>Cadastro de Paciente</Typography>
          <Typography variant="body2" color="text.secondary">Dados pessoais e histórico clínico</Typography>
        </Box>

        <Stepper activeStep={step} sx={{ minWidth: 260 }}>
          <Step><StepLabel><Typography variant="caption">Dados Pessoais</Typography></StepLabel></Step>
          <Step><StepLabel><Typography variant="caption">Anamnese</Typography></StepLabel></Step>
        </Stepper>
      </Box>

      {erroSalvar && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{erroSalvar}</Alert>}

      {/* STEP 0: Pessoais */}
      {step === 0 && (
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <PersonIcon sx={{ color: 'primary.main' }} />
            <Typography variant="subtitle1" fontWeight={600}>Dados Pessoais</Typography>
          </Box>

          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, md: 8 }}>
              <TextField fullWidth required label="Nome completo" value={dados.nome} onChange={(e) => atualizar('nome', e.target.value)} error={!!erros.nome} helperText={erros.nome} size="small" sx={fieldStyle} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField fullWidth select label="Sexo" value={dados.sexo} onChange={(e) => atualizar('sexo', e.target.value)} size="small" sx={fieldStyle}>
                <MenuItem value="">Não informado</MenuItem>
                <MenuItem value="FEMININO">Feminino</MenuItem>
                <MenuItem value="MASCULINO">Masculino</MenuItem>
                <MenuItem value="OUTRO">Outro</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField fullWidth required label="CPF" value={dados.cpf} onChange={(e) => atualizar('cpf', maskCPF(e.target.value))} error={!!erros.cpf} helperText={erros.cpf} placeholder="000.000.000-00" inputProps={{ maxLength: 14 }} size="small" sx={fieldStyle} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField fullWidth label="RG" value={dados.rg} onChange={(e) => atualizar('rg', e.target.value)} size="small" sx={fieldStyle} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField fullWidth label="Data de Nascimento" type="date" value={dados.dataNascimento} onChange={(e) => atualizar('dataNascimento', e.target.value)} InputLabelProps={{ shrink: true }} size="small" sx={fieldStyle} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField fullWidth required label="Telefone / WhatsApp" value={dados.telefone} onChange={(e) => atualizar('telefone', maskTelefone(e.target.value))} error={!!erros.telefone} helperText={erros.telefone} placeholder="(21) 99999-0000" inputProps={{ maxLength: 15 }} size="small" sx={fieldStyle} />
            </Grid>
            <Grid size={{ xs: 12, md: 8 }}>
              <TextField fullWidth label="E-mail" type="email" value={dados.email} onChange={(e) => atualizar('email', e.target.value)} size="small" sx={fieldStyle} />
            </Grid>
            <Grid size={12}>
              <TextField fullWidth label="Endereço completo" value={dados.endereco} onChange={(e) => atualizar('endereco', e.target.value)} size="small" sx={fieldStyle} />
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
            <Button variant="outlined" onClick={() => navigate('/pacientes')} sx={{ textTransform: 'none', borderRadius: 2 }}>Cancelar</Button>
            <Button variant="contained" onClick={avancar} sx={btnPrimaryStyle}>Avançar para Anamnese →</Button>
          </Box>
        </Paper>
      )}

      {/* STEP 1: Saúde (Anamnese) */}
      {step === 1 && (
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <MedicalIcon sx={{ color: 'primary.main' }} />
            <Typography variant="subtitle1" fontWeight={600}>Anamnese</Typography>
          </Box>

          <Grid container spacing={2.5}>
            <Grid size={12}>
              <TextField fullWidth label="Queixa principal" value={dados.queixaPrincipal} onChange={(e) => atualizar('queixaPrincipal', e.target.value)} multiline rows={2} size="small" sx={fieldStyle} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label="Alergias" value={dados.alergias} onChange={(e) => atualizar('alergias', e.target.value)} size="small" sx={fieldStyle} />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField fullWidth label="Pressão Arterial" value={dados.pressaoArterial} onChange={(e) => atualizar('pressaoArterial', e.target.value)} InputProps={{ endAdornment: <InputAdornment position="end"><Typography variant="caption">mmHg</Typography></InputAdornment> }} size="small" sx={fieldStyle} />
            </Grid>
            <Grid size={{ xs: 12, md: 9 }}>
              <TextField fullWidth label="Medicamentos em uso" value={dados.medicamentosEmUso} onChange={(e) => atualizar('medicamentosEmUso', e.target.value)} size="small" sx={fieldStyle} />
            </Grid>
            <Grid size={12}>
              <TextField fullWidth label="Doenças sistêmicas" value={dados.doencasSistemicas} onChange={(e) => atualizar('doencasSistemicas', e.target.value)} size="small" sx={fieldStyle} />
            </Grid>

            {/* Checkboxes interativos */}
            <Grid size={12}>
              <Divider sx={{ mb: 2 }}><Typography variant="caption" color="text.secondary">Condições Atuais</Typography></Divider>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {[
                  { campo: 'fumante' as const, label: 'Fumante' },
                  { campo: 'diabetico' as const, label: 'Diabético(a)' },
                  { campo: 'hipertenso' as const, label: 'Hipertenso(a)' },
                  { campo: 'cardiopatia' as const, label: 'Cardiopatia' },
                  { campo: 'gravidez' as const, label: 'Gravidez / Suspeita' },
                ].map(({ campo, label }) => (
                  <FormControlLabel
                    key={campo}
                    control={<Checkbox checked={!!dados[campo]} onChange={(e) => atualizar(campo, e.target.checked)} size="small" />}
                    label={<Typography variant="body2">{label}</Typography>}
                    sx={{
                      border: '1px solid',
                      borderColor: dados[campo] ? 'primary.light' : 'divider',
                      borderRadius: 2, px: 1.5,
                      bgcolor: dados[campo] ? '#fdf4ff' : 'transparent',
                    }}
                  />
                ))}
              </Box>
            </Grid>

            <Grid size={12}>
              <TextField fullWidth label="Observações adicionais" value={dados.observacoes} onChange={(e) => atualizar('observacoes', e.target.value)} multiline rows={3} size="small" sx={fieldStyle} />
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3, gap: 2 }}>
            <Button variant="outlined" startIcon={<BackIcon />} onClick={() => setStep(0)} sx={{ textTransform: 'none', borderRadius: 2 }}>Voltar</Button>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="outlined" onClick={() => navigate('/pacientes')} sx={{ textTransform: 'none', borderRadius: 2 }}>Cancelar</Button>
              <Button variant="contained" startIcon={salvando ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />} onClick={salvar} disabled={salvando} sx={btnPrimaryStyle}>
                {salvando ? 'Salvando...' : 'Salvar Paciente'}
              </Button>
            </Box>
          </Box>
        </Paper>
      )}

      <Snackbar open={sucesso} autoHideDuration={3000}>
        <Alert icon={<CheckIcon />} severity="success" sx={{ borderRadius: 2 }}>Paciente cadastrado! Redirecionando...</Alert>
      </Snackbar>
    </Box>
  );
}

// Estilos globais do componente (MUI sx)
const fieldStyle = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    bgcolor: 'background.paper',
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#9c27b0' },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#9c27b0' }
  },
  '& .MuiInputLabel-root.Mui-focused': { color: '#9c27b0' }
};

const btnPrimaryStyle = {
  bgcolor: 'primary.main',
  textTransform: 'none',
  fontWeight: 600,
  borderRadius: 2,
  px: 3,
  '&:hover': { bgcolor: 'primary.dark' }
};