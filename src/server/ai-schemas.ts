// ─── Schemas Zod do motor de IA SaudeJusia (B2C) ──────────────────────────
//
// Contrato de I/O com o LLM. Toda saída do modelo é parseada por estes
// schemas no consumidor; falha no parse aciona retry com temperatura menor.
//
// Importante:
//  - `disclaimer_padrao` NÃO vem do modelo. É concatenado pelo consumidor
//    após validar a saída, garantindo que a frase nunca seja corrompida.
//  - `prompt_version` é injetado na instrução do modelo e devolvido para
//    rastreabilidade (ai_prompt_runs).
//
// Este módulo é seguro tanto para client quanto server (apenas tipos + Zod).

import { z } from "zod";

export const ConfiancaSchema = z.enum(["alta", "media", "baixa"]);
export type Confianca = z.infer<typeof ConfiancaSchema>;

export const TaskSchema = z.enum(["classify", "extract", "analyze", "generate"]);
export type AiTask = z.infer<typeof TaskSchema>;

// ─── Base ──────────────────────────────────────────────────────────────────

export const BaseOutputSchema = z.object({
  prompt_version: z.string().min(1).max(80),
  task: TaskSchema,
  fora_de_escopo: z.boolean(),
  confianca: ConfiancaSchema,
  riscos_limites: z.array(z.string().min(1).max(400)).min(0).max(5),
});

// ─── analyze ──────────────────────────────────────────────────────────────

export const ProximoPassoAcaoSchema = z.enum([
  "reconsideracao_operadora",
  "nip_ans",
  "notificacao_extrajudicial",
  "carta_urgencia_medica",
  "consultar_advogado",
  "aguardar_prazo_operadora",
  "outro",
]);

export const DocumentoIndicadoSchema = z.enum([
  "reconsideracao",
  "nip",
  "notificacao",
  "carta_urgencia",
  "nenhum",
]);

export const AnalyzeOutputSchema = BaseOutputSchema.extend({
  task: z.literal("analyze"),
  resumo_caso: z.string().min(1).max(400),
  ponto_mais_forte: z.string().min(1).max(280),
  falta_confirmar: z.array(z.string().min(1).max(200)).min(0).max(5),
  proximo_passo: z.object({
    acao: ProximoPassoAcaoSchema,
    descricao: z.string().min(1).max(300),
  }),
  prazo_relevante: z.object({
    tem_prazo: z.boolean(),
    descricao: z.string().max(200).optional(),
    base_normativa: z.string().max(200).optional(),
  }),
  documento_indicado: DocumentoIndicadoSchema,
});
export type AnalyzeOutput = z.infer<typeof AnalyzeOutputSchema>;

// ─── classify ─────────────────────────────────────────────────────────────

export const CategoriaSchema = z.enum([
  "opme",
  "oncologia",
  "home_care",
  "saude_mental",
  "urgencia_emergencia",
  "rol_ans",
  "carencia",
  "cpt",
  "descredenciamento",
  "reembolso",
  "outro",
]);
export type Categoria = z.infer<typeof CategoriaSchema>;

export const ClassifyOutputSchema = BaseOutputSchema.extend({
  task: z.literal("classify"),
  categoria: CategoriaSchema,
  justificativa_classificacao: z.string().min(1).max(300),
  evidencias_no_texto: z.array(z.string().min(1).max(300)).min(0).max(5),
});
export type ClassifyOutput = z.infer<typeof ClassifyOutputSchema>;

// ─── extract ──────────────────────────────────────────────────────────────

export const TipoDocumentoSchema = z.enum([
  "carta_negativa",
  "laudo_medico",
  "pedido_medico",
  "contrato_plano",
  "carteirinha",
  "outro",
  "nao_identificado",
]);

export const ExtractOutputSchema = BaseOutputSchema.extend({
  task: z.literal("extract"),
  tipo_documento: TipoDocumentoSchema,
  campos_extraidos: z.record(z.string(), z.string().nullable()),
  campos_faltantes: z.array(z.string().min(1).max(80)).min(0).max(20),
});
export type ExtractOutput = z.infer<typeof ExtractOutputSchema>;

// ─── generate ─────────────────────────────────────────────────────────────

export const TipoPecaSchema = z.enum([
  "reconsideracao",
  "nip",
  "notificacao",
  "carta_urgencia",
]);

export const GenerateOutputSchema = BaseOutputSchema.extend({
  task: z.literal("generate"),
  tipo_peca: TipoPecaSchema,
  corpo_documento: z.string().min(1).max(20_000),
  revisar_antes_enviar: z.array(z.string().min(1).max(300)).min(1).max(10),
  canal_de_envio: z.string().min(1).max(200),
});
export type GenerateOutput = z.infer<typeof GenerateOutputSchema>;

// ─── generate (Defere B2B — drafting para profissional habilitado) ────────
// Schema dedicado. NÃO reutiliza TipoPecaSchema (B2C): os tipos jurídicos
// "parecer" e "peticao_inicial" não têm equivalente no produto B2C.

export const DefereDeliverableTypeSchema = z.enum([
  "parecer",
  "recurso_ans",
  "notificacao_extrajudicial",
  "peticao_inicial",
]);
export type DefereDeliverableType = z.infer<typeof DefereDeliverableTypeSchema>;

export const DefereDeliverableOutputSchema = BaseOutputSchema.extend({
  task: z.literal("generate"),
  deliverable_type: DefereDeliverableTypeSchema,
  corpo_documento: z.string().min(1).max(20_000),
  revisar_antes_finalizar: z.array(z.string().min(1).max(300)).min(1).max(10),
});
export type DefereDeliverableOutput = z.infer<typeof DefereDeliverableOutputSchema>;

// ─── Disclaimer padrão ────────────────────────────────────────────────────
// Concatenado pelo consumidor APÓS o parse. Nunca vem do modelo.

export const DISCLAIMER_PADRAO =
  "Esta é uma análise informativa preliminar, baseada nos dados e fontes disponíveis neste momento. A SaudeJusia não presta serviços jurídicos e não substitui a avaliação de um advogado para casos que exijam ação judicial.";
