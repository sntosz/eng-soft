import { z } from "zod";

// Autenticação
export const loginSchema = z.object({
  email: z
    .string({ required_error: "E-mail é obrigatório" })
    .email("Formato de e-mail inválido")
    .transform((val) => val.trim().toLowerCase()),
  password: z
    .string({ required_error: "Senha é obrigatória" })
    .min(1, "Senha não pode estar vazia"),
});

export const registerSchema = z.object({
  name: z
    .string({ required_error: "Nome é obrigatório" })
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .transform((val) => val.trim()),
  email: z
    .string({ required_error: "E-mail é obrigatório" })
    .email("Formato de e-mail inválido")
    .transform((val) => val.trim().toLowerCase()),
  password: z
    .string({ required_error: "Senha é obrigatória" })
    .min(6, "Senha deve ter pelo menos 6 caracteres"),
  curso: z
    .string({ required_error: "Curso é obrigatório" })
    .min(2, "Informe um curso válido")
    .transform((val) => val.trim()),
  ano_curso: z
    .string({ required_error: "Ano ou turma é obrigatório" })
    .min(1, "Informe seu ano ou turma")
    .transform((val) => val.trim()),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string({ required_error: "E-mail é obrigatório" })
    .email("Por favor, forneça um endereço de e-mail válido.")
    .transform((val) => val.trim().toLowerCase()),
});

export const resetPasswordSchema = z.object({
  email: z
    .string({ required_error: "E-mail é obrigatório" })
    .email("E-mail inválido")
    .transform((val) => val.trim().toLowerCase()),
  code: z
    .string({ required_error: "Código de verificação é obrigatório" })
    .length(6, "O código de verificação deve ter exatamente 6 dígitos"),
  newPassword: z
    .string({ required_error: "Nova senha é obrigatória" })
    .min(6, "A nova senha deve ter pelo menos 6 caracteres"),
  resetToken: z
    .string({ required_error: "Token de recuperação é obrigatório" })
    .min(1, "Token de recuperação ausente"),
});

// Pedidos
export const createOrderSchema = z.object({
  produto_id: z.string({ required_error: "ID do produto é obrigatório" }).uuid("ID do produto inválido"),
  quantidade: z.coerce.number().int("Quantidade deve ser um inteiro").positive("Quantidade deve ser maior que zero").default(1),
});

export const updateOrderStatusSchema = z.object({
  pedido_id: z.string({ required_error: "ID do pedido é obrigatório" }).uuid("ID do pedido inválido"),
  status_pedido: z.string({ required_error: "Novo status é obrigatório" }).min(1, "Status não pode ser vazio"),
});

// Partidas
export const matchSchema = z.object({
  id: z.string().uuid("ID inválido").optional(),
  time_casa: z.string().min(1, "Time da casa é obrigatório").transform((v) => v.trim()),
  time_visitante: z.string().min(1, "Time visitante é obrigatório").transform((v) => v.trim()),
  data_partida: z.string().datetime({ offset: true, message: "Data da partida inválida" }).or(z.string().min(1)),
  local_partida: z.string().optional().default("Arena Principal"),
  vitoria_atletica: z.boolean().optional().default(false),
  foto_casa: z.string().optional().default(""),
  foto_visitante: z.string().optional().default(""),
  tipo_confronto: z.string().optional().default("Melhor de 3"),
  tag_partida: z.string().optional().default("Amistoso"),
  concluida: z.boolean().optional().default(false),
});

// Eventos
export const eventSchema = z.object({
  id: z.string().uuid("ID inválido").optional(),
  nome: z.string().min(1, "Nome do evento é obrigatório").transform((v) => v.trim()),
  descricao: z.string().optional().default(""),
  data_evento: z.string().datetime({ offset: true, message: "Data do evento inválida" }).or(z.string().min(1)),
  local: z.string().optional().default("Local a definir"),
  imagem_url: z.string().optional().default(""),
  preco: z.coerce.number().min(0, "O preço não pode ser negativo").default(0),
});
