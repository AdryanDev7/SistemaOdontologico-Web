// Converte o valor (BigDecimal do Java) pra R$
export const formatarMoeda = (valor: number | string | null | undefined): string => {
  if (valor === null || valor === undefined || valor === '') return 'R$ 0,00';
  const numero = typeof valor === 'string' ? parseFloat(valor) : valor;
  if (isNaN(numero)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2
  }).format(numero);
};

// Formata CPF: 12345678901 -> 123.456.789-01
export const formatarCPF = (cpf: string): string => {
  const digits = cpf.replace(/\D/g, '');
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

// Formata Telefone: aceita fixo (10) ou celular (11)
export const formatarTelefone = (tel: string): string => {
  const digits = tel.replace(/\D/g, '');
  if (digits.length === 11) return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  if (digits.length === 10) return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  return tel;
};

// Converte data do banco (ISO) pro padrão BR (dd/mm/aaaa)
export const formatarData = (data: string | null | undefined, incluirHora = false): string => {
  if (!data) return '-';
  try {
    const date = new Date(data);
    if (incluirHora) {
      return date.toLocaleDateString('pt-BR') + ' às ' +
        date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('pt-BR');
  } catch {
    return data;
  }
};

// Calcula idade baseada na data de nascimento
export const calcularIdade = (dataNascimento: string | null | undefined): number | null => {
  if (!dataNascimento) return null;
  const nascimento = new Date(dataNascimento);
  const hoje = new Date();
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const m = hoje.getMonth() - nascimento.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) idade--;
  return idade;
};

// Máscara de CPF pra usar direto no onChange do input
export const maskCPF = (value: string): string =>
  value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    .substring(0, 14);

// Máscara de Telefone pra input (fixo ou celular)
export const maskTelefone = (value: string): string =>
  value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .substring(0, 15);

// Remove pontos e traços (pra mandar pro banco de dados)
export const unformatCPF = (cpf: string): string => cpf.replace(/\D/g, '');
export const unformatTelefone = (tel: string): string => tel.replace(/\D/g, '');

// Algoritmo oficial pra validar os dígitos do CPF
export const validarCPF = (cpf: string): boolean => {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(digits[i]) * (10 - i);
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(digits[9])) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(digits[i]) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  return resto === parseInt(digits[10]);
};