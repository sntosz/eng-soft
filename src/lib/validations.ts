import { z } from "zod";

const trimmedRequiredText = (message: string) =>
  z.string({ required_error: message }).trim().min(1, message);

const localDateTimeSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?$/, "Data e hora inválidas")
  .refine((value) => {
    const [datePart, timePart] = value.split("T");
    const [year, month, day] = datePart.split("-").map(Number);
    const [hour, minute, seconds = "0"] = timePart.split(":");
    const second = Number(seconds.split(".")[0]);
    const millisecond = Number((seconds.split(".")[1] || "").padEnd(3, "0"));
    const date = new Date(0);
    date.setUTCFullYear(year, month - 1, day);
    date.setUTCHours(Number(hour), Number(minute), second, millisecond);

    return (
      date.getUTCFullYear() === year &&
      date.getUTCMonth() === month - 1 &&
      date.getUTCDate() === day &&
      date.getUTCHours() === Number(hour) &&
      date.getUTCMinutes() === Number(minute) &&
      date.getUTCSeconds() === second
    );
  });

const dateTimeSchema = z.union([
  z.string().trim().datetime({ offset: true, message: "Data e hora inválidas" }),
  localDateTimeSchema,
]);

const imageUrlSchema = z.union([
  z.string().trim().url("URL da imagem inválida"),
  z.literal(""),
  z.null(),
]).optional().default("");

// Autenticação
export const loginSchema = z.object({
  email: z
    .string({ required_error: "E-mail é obrigatório" })
    .trim()
    .min(1, "E-mail é obrigatório")
    .email("Formato de e-mail inválido")
    .transform((val) => val.toLowerCase()),
  password: z
    .string({ required_error: "Senha é obrigatória" })
    .min(1, "Senha não pode estar vazia"),
});

export const registerSchema = z.object({
  name: z
    .string({ required_error: "Nome é obrigatório" })
    .trim()
    .min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z
    .string({ required_error: "E-mail é obrigatório" })
    .trim()
    .min(1, "E-mail é obrigatório")
    .email("Formato de e-mail inválido")
    .transform((val) => val.toLowerCase()),
  password: z
    .string({ required_error: "Senha é obrigatória" })
    .min(6, "Senha deve ter pelo menos 6 caracteres"),
  curso: z
    .string({ required_error: "Curso é obrigatório" })
    .trim()
    .min(2, "Informe um curso válido"),
  ano_curso: z
    .string({ required_error: "Ano ou turma é obrigatório" })
    .trim()
    .min(1, "Informe seu ano ou turma"),
});

const normalizedEmailSchema = z
  .string({ required_error: "E-mail é obrigatório" })
  .trim()
  .min(1, "E-mail é obrigatório")
  .email("Formato de e-mail inválido")
  .transform((value) => value.toLowerCase());

const memberProfileFields = {
  nome: trimmedRequiredText("Nome é obrigatório").min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: normalizedEmailSchema,
  curso: trimmedRequiredText("Curso é obrigatório").min(2, "Informe um curso válido"),
  ano_curso: trimmedRequiredText("Ano ou turma é obrigatório"),
};

export const adminMemberCreateSchema = z.object({
  ...memberProfileFields,
  password: z.string({ required_error: "Senha é obrigatória" }).min(6, "Senha deve ter pelo menos 6 caracteres"),
});

export const adminMemberUpdateSchema = z.object({
  id: z.string().uuid("ID inválido"),
  ...memberProfileFields,
  password: z.union([z.literal(""), z.string().min(6, "Senha deve ter pelo menos 6 caracteres")]).optional(),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string({ required_error: "E-mail é obrigatório" })
    .trim()
    .min(1, "E-mail é obrigatório")
    .email("Por favor, forneça um endereço de e-mail válido.")
    .transform((val) => val.toLowerCase()),
});

export const resetPasswordSchema = z.object({
  email: z
    .string({ required_error: "E-mail é obrigatório" })
    .trim()
    .min(1, "E-mail é obrigatório")
    .email("E-mail inválido")
    .transform((val) => val.toLowerCase()),
  code: z
    .string({ required_error: "Código de verificação é obrigatório" })
    .trim()
    .regex(/^\d{6}$/, "O código de verificação deve ter exatamente 6 dígitos"),
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
  status_pedido: z.enum(
    ["Processando...", "Pago / Aguardando Retirada", "Entregue", "Cancelado"],
    { required_error: "Novo status é obrigatório", invalid_type_error: "Status do pedido inválido" }
  ),
});

// Partidas
export const matchSchema = z.object({
  id: z.string().uuid("ID inválido").optional(),
  time_casa: trimmedRequiredText("Time da casa é obrigatório"),
  time_visitante: trimmedRequiredText("Time visitante é obrigatório"),
  data_partida: dateTimeSchema,
  local_partida: z.string().trim().optional().default("Arena Principal"),
  vitoria_atletica: z.boolean().optional().default(false),
  foto_casa: imageUrlSchema,
  foto_visitante: imageUrlSchema,
  tipo_confronto: z.string().trim().optional().default("Melhor de 3"),
  tag_partida: z.string().trim().optional().default("Amistoso"),
  concluida: z.boolean().optional().default(false),
});
export const matchUpdateSchema = matchSchema.omit({ id: true }).partial().extend({
  id: z.string().uuid("ID inválido"),
});

// Eventos
export const eventSchema = z.object({
  id: z.string().uuid("ID inválido").optional(),
  nome: trimmedRequiredText("Nome do evento é obrigatório"),
  descricao: z.string().trim().optional().default(""),
  data_evento: dateTimeSchema,
  local: z.string().trim().optional().default("Local a definir"),
  imagem_url: imageUrlSchema,
  preco: z.coerce.number().min(0, "O preço não pode ser negativo").default(0),
});
export const eventUpdateSchema = eventSchema.omit({ id: true }).partial().extend({
  id: z.string().uuid("ID inválido"),
});

export const productPayloadSchema = z.object({
  nome: trimmedRequiredText("Nome é obrigatório"),
  descricao: z.string().trim().nullable().optional().transform((value) => value || null),
  preco: z.coerce.number().finite("Preço inválido").min(0, "Preço deve ser maior ou igual a zero"),
  estoque: z.coerce.number().int("Estoque deve ser um número inteiro").min(0, "Estoque deve ser maior ou igual a zero").default(0),
  imagem_url: imageUrlSchema.transform((value) => value || null),
  destaque: z.boolean().default(false),
});
export const productUpdateSchema = productPayloadSchema.extend({
  id: z.string().uuid("ID inválido"),
});

export const uuidSchema = z.string().uuid("ID inválido");
