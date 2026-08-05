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
  time_casa: Team;
  time_fora: Team;
  placar_casa?: number;
  placar_fora?: number;
  data_partida: string;
  local?: string;
  campeonato?: string;
  created_at?: string;
}

export interface Order {
  id: string;
  membro_id?: string;
  nome: string;
  status: string;
  pronto: boolean;
  created_at?: string;
}
