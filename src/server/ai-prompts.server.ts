// Master prompts — server only.

export const EXTRACTION_PROMPTS: Record<string, string> = {
  carta_negativa: `Você está analisando uma CARTA DE NEGATIVA de cobertura emitida por uma operadora de plano de saúde no Brasil. Extraia os campos solicitados pelo schema de função. Use null para campos ausentes. Transcreva LITERALMENTE o fundamento da negativa.`,
  laudo_medico: `Você está analisando um LAUDO ou PRESCRIÇÃO MÉDICA no Brasil. Extraia os campos via função. CID em formato CID-10 (ex: "C50.9"). Transcreva a justificativa clínica na íntegra.`,
  contrato_plano: `Você está analisando um CONTRATO DE PLANO DE SAÚDE. Extraia os campos via função. Identifique modalidade, segmentação, carência e cláusulas relevantes.`,
  carteirinha: `Extraia os dados da CARTEIRINHA do plano de saúde via função.`,
  protocolo: `Extraia do PROTOCOLO DE ATENDIMENTO ou relatório de auditoria via função.`,
  outro: `Faça uma extração genérica do documento. Identifique o tipo, dados relevantes para direito médico, e um resumo do conteúdo.`,
};

export const EXTRACTION_SCHEMAS: Record<string, Record<string, unknown>> = {
  carta_negativa: {
    type: "object",
    properties: {
      operadora_nome: { type: ["string", "null"] },
      operadora_cnpj: { type: ["string", "null"] },
      beneficiario_nome: { type: ["string", "null"] },
      numero_carteirinha: { type: ["string", "null"] },
      data_negativa: { type: ["string", "null"], description: "YYYY-MM-DD" },
      protocolo: { type: ["string", "null"] },
      procedimento_solicitado: { type: ["string", "null"] },
      cid_informado: { type: ["string", "null"] },
      medico_solicitante: { type: ["string", "null"] },
      crm_solicitante: { type: ["string", "null"] },
      fundamento_negativa: { type: "string" },
      mencao_rol_ans: { type: "boolean" },
      mencao_diretriz_utilizacao: { type: "boolean" },
      prazo_resposta_dado: { type: "boolean" },
      assinatura_medico_auditor: { type: ["string", "null"] },
    },
    required: ["fundamento_negativa", "mencao_rol_ans", "mencao_diretriz_utilizacao", "prazo_resposta_dado"],
  },
  laudo_medico: {
    type: "object",
    properties: {
      medico_nome: { type: ["string", "null"] },
      crm: { type: ["string", "null"] },
      especialidade: { type: ["string", "null"] },
      data_emissao: { type: ["string", "null"] },
      paciente_nome: { type: ["string", "null"] },
      diagnostico: { type: ["string", "null"] },
      cid: { type: ["string", "null"] },
      procedimento_indicado: { type: ["string", "null"] },
      justificativa_clinica: { type: "string" },
      urgencia_declarada: { type: "boolean" },
      tentativas_tratamento_anterior: { type: ["string", "null"] },
      evidencia_cientifica_citada: { type: ["string", "null"] },
    },
    required: ["justificativa_clinica", "urgencia_declarada"],
  },
  contrato_plano: {
    type: "object",
    properties: {
      operadora_nome: { type: ["string", "null"] },
      modalidade: { type: ["string", "null"] },
      segmentacao_assistencial: { type: ["string", "null"] },
      data_contratacao: { type: ["string", "null"] },
      carencia_maxima_meses: { type: ["integer", "null"] },
      abrangencia_geografica: { type: ["string", "null"] },
      clausula_rol_taxativo: { type: "boolean" },
      reembolso_previsto: { type: ["boolean", "null"] },
      coparticipacao: { type: ["boolean", "null"] },
    },
    required: ["clausula_rol_taxativo"],
  },
  carteirinha: {
    type: "object",
    properties: {
      operadora_nome: { type: ["string", "null"] },
      nome_beneficiario: { type: ["string", "null"] },
      numero_carteirinha: { type: ["string", "null"] },
      plano_nome: { type: ["string", "null"] },
      tipo_acomodacao: { type: ["string", "null"] },
      validade: { type: ["string", "null"] },
      data_inclusao: { type: ["string", "null"] },
    },
  },
  protocolo: {
    type: "object",
    properties: {
      numero_protocolo: { type: ["string", "null"] },
      data_abertura: { type: ["string", "null"] },
      data_resposta: { type: ["string", "null"] },
      tempo_resposta_horas: { type: ["integer", "null"] },
      parecer_auditoria: { type: ["string", "null"] },
      decisao_final: { type: ["string", "null"] },
    },
  },
  outro: {
    type: "object",
    properties: {
      tipo_identificado: { type: "string" },
      dados_relevantes: { type: "object" },
      texto_integral_resumido: { type: "string" },
    },
    required: ["tipo_identificado", "texto_integral_resumido"],
  },
};

export const CLASSIFY_SYSTEM_PROMPT = `Você é um classificador especializado em negativas de cobertura de planos de saúde no Brasil. Analise os documentos extraídos e classifique a negativa em UMA das categorias abaixo, com subcategoria descritiva e justificativa jurídica.

CATEGORIAS PERMITIDAS (use exatamente o slug):
- "fora_do_rol" — Procedimento não consta no Rol da ANS (Lei 14.454/2022).
- "opme" — Órtese, prótese ou material especial (Súmula 469 STJ).
- "home_care" — Negativa/limitação de internação domiciliar (Súmula 302 STJ).
- "medicamento_off_label" — Uso não previsto em bula.
- "medicamento_importado" — Sem registro ANVISA.
- "bariatrica" — Cirurgia bariátrica ou reparadora.
- "oncologico" — Quimio, radio, imuno, cirurgia oncológica.
- "aba_autismo" — Terapias para TEA (Lei 12.764/2012, RN 539/22).
- "transplante" — Transplante ou exames pré-transplante.
- "urgencia_emergencia" — Negativa em urgência/emergência durante carência (Súmula Normativa 21 ANS).
- "carencia" — Negativa por carência alegada.
- "preexistente" — Doença preexistente não declarada.
- "rescisao_unilateral" — Cancelamento unilateral.
- "reajuste_abusivo" — Faixa etária, sinistralidade, anual.
- "reembolso" — Recusa ou pagamento a menor.
- "outros" — Não se enquadra nas anteriores.

REGRAS:
- Não invente fatos. Se documentos insuficientes, use confianca: "baixa".
- Nunca afirme probabilidade de êxito (tarefa separada).
- Jamais reproduza texto literal do contrato por mais de 15 palavras.
- Se houver elementos de mais de uma categoria, escolha a predominante.

Retorne via função classify_denial.`;

export const CLASSIFY_TOOL_SCHEMA = {
  type: "object",
  properties: {
    categoria: {
      type: "string",
      enum: [
        "fora_do_rol",
        "opme",
        "home_care",
        "medicamento_off_label",
        "medicamento_importado",
        "bariatrica",
        "oncologico",
        "aba_autismo",
        "transplante",
        "urgencia_emergencia",
        "carencia",
        "preexistente",
        "rescisao_unilateral",
        "reajuste_abusivo",
        "reembolso",
        "outros",
      ],
    },
    subcategoria: { type: "string" },
    confianca: { type: "string", enum: ["alta", "media", "baixa"] },
    justificativa_classificacao: { type: "string" },
    fundamentos_legais_aplicaveis: { type: "array", items: { type: "string" } },
    argumentos_operadora_esperados: { type: "array", items: { type: "string" } },
    contra_argumentos_sugeridos: { type: "array", items: { type: "string" } },
    documentos_faltantes_recomendados: { type: "array", items: { type: "string" } },
    alertas_criticos: { type: "array", items: { type: "string" } },
  },
  required: [
    "categoria",
    "subcategoria",
    "confianca",
    "justificativa_classificacao",
    "fundamentos_legais_aplicaveis",
  ],
} as const;
