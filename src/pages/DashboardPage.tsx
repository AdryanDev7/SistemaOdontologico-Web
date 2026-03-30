import { useEffect, useState } from 'react';
import { Alert, Box, Card, CardContent, Grid, Skeleton, Typography } from '@mui/material';
import { api } from '../services/api';

interface EstatisticasPacientes {
  totalPacientes: number;
}

interface EstatisticasConsultas {
  totalConsultasHoje: number;
}

interface EstatisticasFinanceiro {
  faturamentoMensal: number;
}

interface SummaryCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  loading?: boolean;
}

function SummaryCard({ title, value, subtitle, loading = false }: SummaryCardProps) {
  return (
    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, height: '100%' }}>
      <CardContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {title}
        </Typography>
        {loading ? (
          <Skeleton width={80} height={48} />
        ) : (
          <Typography variant="h4" fontWeight={700} color="primary.main">
            {value}
          </Typography>
        )}
        {subtitle ? (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        ) : null}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const [totalPacientes, setTotalPacientes] = useState<number>(0);
  const [totalConsultasHoje, setTotalConsultasHoje] = useState<number>(0);
  const [faturamentoMensal, setFaturamentoMensal] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const carregarEstatisticas = async () => {
      try {
        setLoading(true);
        const [pacientesRes, consultasRes, financeiroRes] = await Promise.all([
          api.get<EstatisticasPacientes>('/pacientes/estatisticas'),
          api.get<EstatisticasConsultas>('/consultas/estatisticas'),
          api.get<EstatisticasFinanceiro>('/financeiro/estatisticas'),
        ]);

        setTotalPacientes(pacientesRes.data.totalPacientes ?? 0);
        setTotalConsultasHoje(consultasRes.data.totalConsultasHoje ?? 0);
        setFaturamentoMensal(financeiroRes.data.faturamentoMensal ?? 0);
      } catch (error) {
        console.error(error);
        setErro('Nao foi possivel carregar as estatisticas do dashboard.');
      } finally {
        setLoading(false);
      }
    };

    carregarEstatisticas();
  }, []);

  const faturamentoMensalFormatado = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(faturamentoMensal);

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700} color="primary" sx={{ mb: 1 }}>
          Bem-vinda, Dra. Elisa! 🩺
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Visao geral do Odonto Pro com dados em tempo real.
        </Typography>
      </Box>

      {erro ? (
        <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
          {erro}
        </Alert>
      ) : null}

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 4 }}>
          <SummaryCard
            title="Total de Pacientes"
            value={totalPacientes}
            loading={loading}
            subtitle="Pacientes cadastrados no sistema"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <SummaryCard
            title="Consultas Hoje"
            value={totalConsultasHoje}
            loading={loading}
            subtitle="Consultas marcadas para hoje"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <SummaryCard
            title="Faturamento Mensal"
            value={faturamentoMensalFormatado}
            loading={loading}
            subtitle="Soma de faturamentos no mes atual"
          />
        </Grid>
      </Grid>
    </Box>
  );
}
