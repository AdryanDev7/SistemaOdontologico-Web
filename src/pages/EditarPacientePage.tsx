import { useEffect, useState } from 'react';
import {
  Box, Typography, Button, TextField, Paper,
  Divider, FormControlLabel, Checkbox, Alert,
  CircularProgress, Snackbar, MenuItem, InputAdornment,
  Skeleton
} from '@mui/material';
import { GridLegacy as Grid } from '@mui/material';
import {
  ArrowBackOutlined as BackIcon,
  SaveOutlined as SaveIcon,
  PersonOutlined as PersonIcon,
  MedicalInformationOutlined as MedicalIcon,
  CheckCircleOutlined as CheckIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';
import { maskCPF, maskTelefone } from '../utils/formatters';

interface PacienteForm {
  nome: string;
  cpf: string;
  rg: string;
  dataNascimento: string;
  sexo: string;
  telefone: string;
  email: string;
  endereco: string;
  queixaPrincipal: string;
  alergias: string;
  medicamentosEmUso: string;
  doencasSistemicas: string;
  pressaoArterial: string;
  fumante: boolean;
  diabetico: boolean;
  hipertenso: boolean;
  cardiopatia: boolean;
  gravidez: boolean;
  observacoes: string;
}

type CampoBooleano = 'fumante' | 'diabetico' | 'hipertenso' | 'cardiopatia' | 'gravidez';

interface OpcaoCondicao {
  campo: CampoBooleano;
  label: string;
}

const CONDICOES: OpcaoCondicao[] = [
  { campo: 'fumante',     label: 'Fumante' },
  { campo: 'diabetico',   label: 'Diabético(a)' },
  { campo: 'hipertenso',  label: 'Hipertenso(a)' },
  { campo: 'cardiopatia', label: 'Cardiopatia' },
  { campo: 'gravidez',    label: 'Gravidez / Suspeita' },
];

const ESTADO_INICIAL: PacienteForm = {
  nome: '', cpf: '', rg: '', dataNascimento: '', sexo: '',
  telefone: '', email: '', endereco: '',
  queixaPrincipal: '', alergias: '', medicamentosEmUso: '',
  doencasSistemicas: '', pressaoArterial: '',
  fumante: false, diabetico: false, hipertenso: false,
  cardiopatia: false, gravidez: false, observacoes: ''
};

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

  // GET — pré-preenche formulário
  useEffect(() => {
    const carregarPaciente = async () => {
      try {
        setLoadingDados(true);
        const { data: p } = await api.get(`/pacientes/${id}`);
        setDados({
          nome:              p.nome              ?? '',
          cpf:               maskCPF(p.cpf       ?? ''),
          rg:                p.rg                ?? '',
          dataNascimento:    p.dataNascimento     ?? '',
          sexo:              p.sexo              ?? '',
          telefone:          maskTelefone(p.telefone ?? ''),
          email:             p.email             ?? '',
          endereco:          p.endereco          ?? '',
          queixaPrincipal:   p.queixaPrincipal   ?? '',
          alergias:          p.alergias          ?? '',
          medicamentosEmUso: p.medicamentosEmUso ?? '',
          doencasSistemicas: p.doencasSistemicas ?? '',
          pressaoArterial:   p.pressaoArterial   ?? '',
          fumante:           p.fumante    ?? false,
          diabetico:         p.diabetico  ?? false,
          hipertenso:        p.hipertenso ?? false,
          cardiopatia:       p.cardiopatia ?? false,
          gravidez:          p.gravidez   ?? false,
          observacoes:       p.observacoes ?? ''
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

  const validar = (): boolean => {
    const novosErros: Partial<Record<keyof PacienteForm, string>> = {};
    if (!dados.nome.trim())                             novosErros.nome = 'Nome é obrigatório';
    if (dados.cpf.replace(/\D/g, '').length !== 11)    novosErros.cpf = 'CPF inválido';
    if (dados.telefone.replace(/\D/g, '').length < 10) novosErros.telefone = 'Telefone inválido';
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  // PUT — salva edição
  const salvar = async () => {
    if (!validar()) return;
    try {
      setSalvando(true);
      setErroSalvar(null);
      await api.put(`/pacientes/${id}`, {
        ...dados,
        cpf:      dados.cpf.replace(/\D/g, ''),
        telefone: dados.telefone.replace(/\D/g, '')
      });
      setSucesso(true);
      setTimeout(() => navigate(`/pacientes/${id}`), 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar. Tente novamente.';
      setErroSalvar(msg);
    } finally {
      setSalvando(false);
    }
  };

  if (loadingDados) return <EditarLoading />;

  if (erroCarregar) return (
    <Alert severity="error" sx={{ borderRadius: 2 }}>
      {erroCarregar}{' '}
      <Button size="small" onClick={() => navigate('/pacientes')}>Voltar</Button>
    </Alert>
  );

  return (
    <Box>
      {/* Breadcrumb */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <Button startIcon={<BackIcon />} onClick={() => navigate(`/pacientes/${id}`)}
          sx={{ color: 'text.secondary', textTransform: 'none' }}>
          Ficha do Paciente
        </Button>
        <Typography color="text.disabled">/</Typography>
        <Typography color="text.primary" fontWeight={500}>Editar</Typography>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={600}>Editar Paciente</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Atualize os dados pessoais e a anamnese
        </Typography>
      </Box>

      {erroSalvar && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setErroSalvar(null)}>
          {erroSalvar}
        </Alert>
      )}

      {/* ── Dados Pessoais ── */}
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <PersonIcon sx={{ color: 'primary.main' }} />
          <Typography variant="subtitle1" fontWeight={600}>Dados Pessoais</Typography>
        </Box>

        <Grid container spacing={2.5}>
          <Grid item xs={12} md={8}>
            <TextField fullWidth required label="Nome completo"
              value={dados.nome} onChange={e => atualizar('nome', e.target.value)}
              error={!!erros.nome} helperText={erros.nome}
              size="small" sx={fieldStyle} />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField fullWidth select label="Sexo"
              value={dados.sexo} onChange={e => atualizar('sexo', e.target.value)}
              size="small" sx={fieldStyle}>
              <MenuItem value="">Não informado</MenuItem>
              <MenuItem value="FEMININO">Feminino</MenuItem>
              <MenuItem value="MASCULINO">Masculino</MenuItem>
              <MenuItem value="OUTRO">Outro</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <TextField fullWidth required label="CPF"
              value={dados.cpf} onChange={e => atualizar('cpf', maskCPF(e.target.value))}
              error={!!erros.cpf} helperText={erros.cpf}
              size="small" sx={fieldStyle} />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <TextField fullWidth label="RG"
              value={dados.rg} onChange={e => atualizar('rg', e.target.value)}
              size="small" sx={fieldStyle} />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <TextField fullWidth label="Data de Nascimento" type="date"
              value={dados.dataNascimento} onChange={e => atualizar('dataNascimento', e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small" sx={fieldStyle} />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <TextField fullWidth required label="Telefone / WhatsApp"
              value={dados.telefone} onChange={e => atualizar('telefone', maskTelefone(e.target.value))}
              error={!!erros.telefone} helperText={erros.telefone}
              size="small" sx={fieldStyle} />
          </Grid>

          <Grid item xs={12} md={8}>
            <TextField fullWidth label="E-mail" type="email"
              value={dados.email} onChange={e => atualizar('email', e.target.value)}
              size="small" sx={fieldStyle} />
          </Grid>

          <Grid item xs={12}>
            <TextField fullWidth label="Endereço completo"
              value={dados.endereco} onChange={e => atualizar('endereco', e.target.value)}
              placeholder="Rua, número, bairro, cidade - UF"
              size="small" sx={fieldStyle} />
          </Grid>
        </Grid>
      </Paper>

      {/* ── Anamnese ── */}
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <MedicalIcon sx={{ color: 'primary.main' }} />
          <Typography variant="subtitle1" fontWeight={600}>Anamnese</Typography>
        </Box>

        <Grid container spacing={2.5}>
          <Grid item xs={12}>
            <TextField fullWidth label="Queixa principal"
              value={dados.queixaPrincipal} onChange={e => atualizar('queixaPrincipal', e.target.value)}
              multiline rows={2} size="small" sx={fieldStyle} />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Alergias"
              value={dados.alergias} onChange={e => atualizar('alergias', e.target.value)}
              placeholder="Penicilina, látex, anti-inflamatório..."
              size="small" sx={fieldStyle} />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField fullWidth label="Pressão Arterial"
              value={dados.pressaoArterial} onChange={e => atualizar('pressaoArterial', e.target.value)}
              placeholder="120/80" size="small" sx={fieldStyle}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Typography variant="caption" color="text.secondary">mmHg</Typography>
                  </InputAdornment>
                )
              }} />
          </Grid>

          <Grid item xs={12} md={9}>
            <TextField fullWidth label="Medicamentos em uso"
              value={dados.medicamentosEmUso} onChange={e => atualizar('medicamentosEmUso', e.target.value)}
              size="small" sx={fieldStyle} />
          </Grid>

          <Grid item xs={12}>
            <TextField fullWidth label="Doenças sistêmicas"
              value={dados.doencasSistemicas} onChange={e => atualizar('doencasSistemicas', e.target.value)}
              size="small" sx={fieldStyle} />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>Condições de Saúde</Typography>
            </Divider>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {CONDICOES.map(({ campo, label }) => (
                <FormControlLabel
                  key={campo}
                  control={
                    <Checkbox
                      checked={dados[campo]}
                      onChange={e => atualizar(campo, e.target.checked)}
                      size="small"
                      sx={{ '&.Mui-checked': { color: 'primary.main' } }}
                    />
                  }
                  label={<Typography variant="body2">{label}</Typography>}
                  sx={{
                    border: '1px solid',
                    borderColor: dados[campo] ? 'primary.light' : 'divider',
                    borderRadius: 2, px: 1.5, py: 0.5,
                    bgcolor: dados[campo] ? '#fdf4ff' : 'transparent',
                    transition: 'all 0.15s',
                  }}
                />
              ))}
            </Box>
          </Grid>

          <Grid item xs={12}>
            <TextField fullWidth label="Observações adicionais"
              value={dados.observacoes} onChange={e => atualizar('observacoes', e.target.value)}
              multiline rows={3} size="small" sx={fieldStyle} />
          </Grid>
        </Grid>
      </Paper>

      {/* Ações */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button variant="outlined" onClick={() => navigate(`/pacientes/${id}`)}
          sx={{ textTransform: 'none', borderRadius: 2 }}>
          Cancelar
        </Button>
        <Button variant="contained" onClick={salvar} disabled={salvando}
          startIcon={salvando ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
          sx={btnPrimaryStyle}>
          {salvando ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </Box>

      <Snackbar open={sucesso} autoHideDuration={3000}>
        <Alert icon={<CheckIcon />} severity="success" sx={{ borderRadius: 2, boxShadow: 3 }}>
          Paciente atualizado com sucesso!
        </Alert>
      </Snackbar>
    </Box>
  );
}

function EditarLoading() {
  return (
    <Box>
      <Skeleton width={220} height={36} sx={{ mb: 3 }} />
      <Skeleton width={280} height={40} sx={{ mb: 1 }} />
      <Skeleton width={340} height={24} sx={{ mb: 3 }} />
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 3, mb: 3 }}>
        <Grid container spacing={2.5}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}><Skeleton height={40} /></Grid>
          ))}
        </Grid>
      </Paper>
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 3 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} height={40} sx={{ mb: 1 }} />
        ))}
      </Paper>
    </Box>
  );
}

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
  boxShadow: '0 2px 8px rgba(156,39,176,0.35)',
  '&:hover': { bgcolor: 'primary.dark', boxShadow: '0 4px 12px rgba(156,39,176,0.45)' }
};