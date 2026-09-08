export interface Member {
  id: string;
  nome: string;
  email: string;
  curso: string;
  ano_turma?: string;
  ano_curso?: string; // Algumas telas usam ano_curso
  e_admin: boolean;
  senha_hash?: string;
  created_at?: string;
}

export interface Product {
  id: string;
  nome: string;
  descricao: string | null;
  preco: number;
  estoque: number;
  imagem_url: string | null;
  destaque: boolean;
  created_at?: string;
}

export interface Event {
  id: string;
  nome: string;
  descricao: string;
  data_evento: string;
  local: string;
  imagem_url: string;
  preco: number;
  created_at?: string;
}

export interface Team {
  short: string;
  name: string;
}

export interface Match {
  id: string;
  time_casa: string;
  time_visitante: string;
  data_partida: string;
  local_partida?: string;
  created_at?: string;
  vitoria_atletica: boolean;
  foto_casa: string;
  foto_visitante: string;
}

export interface OrderItem {
  id?: string;
  pedido_id?: string;
  produto_id?: string;
  quantidade: number;
  preco_unitario: number;
  produtos?: {
    nome: string;
  } | { nome: string }[] | null;
}

export interface Order {
  id: string;
  membro_id?: string;
  status_pedido?: string;
  total?: number;
  criado_em?: string;
  nome?: string;
  status?: string;
  pronto?: boolean;
  created_at?: string;
  itens_pedido?: OrderItem[];
}

