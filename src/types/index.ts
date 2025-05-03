export interface Colaborador {
  id: string;
  matricula: string;
  nome: string;
  cpf: string;
  email: string;
  senha: string;
  foto?: string;
  codigoBarras?: string;
  digital?: string;
  filialId: string;
  cargo: string;
  jornadaTrabalho: JornadaTrabalho;
  ativo: boolean;
  dataAdmissao: Date;
  dataDemissao?: Date;
}

export interface JornadaTrabalho {
  tipo: 'fixa' | 'flexivel' | 'livre';
  horarios: {
    entrada: string;
    saida: string;
    intervalo?: {
      inicio: string;
      fim: string;
    };
  };
  toleranciaAtraso?: number; // em minutos
}

export interface RegistroPonto {
  id: string;
  colaboradorId: string;
  tipo: 'entrada' | 'saida' | 'intervalo' | 'retorno';
  dataHora: Date;
  latitude?: number;
  longitude?: number;
  foto?: string;
  metodoRegistro: 'codigo_barras' | 'biometria' | 'aplicativo';
  dispositivoId?: string;
  observacao?: string;
  status: 'normal' | 'atrasado' | 'adiantado' | 'justificado';
  justificativa?: string;
  aprovadoPor?: string;
  dataAprovacao?: Date;
}

export interface Filial {
  id: string;
  nome: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  ativo: boolean;
}

export interface Cargo {
  id: string;
  nome: string;
  descricao?: string;
  nivel: number;
  ativo: boolean;
}

export interface BancoHoras {
  id: string;
  colaboradorId: string;
  data: Date;
  saldo: number; // em minutos
  tipo: 'positivo' | 'negativo';
  motivo?: string;
  aprovadoPor?: string;
  dataAprovacao?: Date;
} 