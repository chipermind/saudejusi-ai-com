import { createFileRoute } from "@tanstack/react-router";
import { LegalPageLayout, type TocItem } from "@/components/legal/LegalPageLayout";

export const Route = createFileRoute("/termos")({
  head: () => ({
    meta: [
      { title: "Termos de Uso — SaudeJusia" },
      { name: "description", content: "Termos de uso da plataforma SaudeJusia (versão preliminar 1.0)." },
    ],
  }),
  component: TermosPage,
});

const TOC: TocItem[] = [
  { id: "quem-somos", label: "Quem somos" },
  { id: "o-que-fazemos", label: "O que a SaudeJusia faz" },
  { id: "o-que-nao-fazemos", label: "O que a SaudeJusia NÃO faz" },
  { id: "quem-pode-usar", label: "Quem pode usar" },
  { id: "conta-cadastro", label: "Conta e cadastro" },
  { id: "planos-cobranca", label: "Planos e cobrança" },
  { id: "uso-aceitavel", label: "Uso aceitável" },
  { id: "propriedade-intelectual", label: "Propriedade intelectual" },
  { id: "conteudo-do-usuario", label: "Conteúdo do usuário" },
  { id: "limitacao-responsabilidade", label: "Limitação de responsabilidade" },
  { id: "comunicacoes", label: "Comunicações" },
  { id: "modificacao", label: "Modificação destes Termos" },
  { id: "encerramento", label: "Encerramento" },
  { id: "lei-foro", label: "Lei aplicável e foro" },
  { id: "contato", label: "Contato" },
];

function TermosPage() {
  return (
    <LegalPageLayout
      current="termos"
      title="Termos de Uso"
      lastUpdated="[DATA DE PUBLICAÇÃO]"
      toc={TOC}
    >
      <h2 id="quem-somos">1. Quem somos</h2>
      <p>
        A SaudeJusia é uma plataforma digital que ajuda beneficiários de planos de saúde a
        entender seus direitos e a preparar documentos administrativos — como recursos à
        operadora, Notificações de Intermediação Preliminar (NIP) à ANS e notificações
        extrajudiciais — para que o próprio beneficiário envie, sem intermediação de advogado
        na maioria dos casos.
      </p>
      <p>
        Estes Termos são um contrato entre você (usuário) e a SaudeJusia, representada neste
        momento por <strong>[NOME COMPLETO DO RESPONSÁVEL]</strong>, CPF{" "}
        <strong>[XXX.XXX.XXX-XX]</strong>, com endereço em <strong>[CIDADE/UF]</strong>,
        responsável legal enquanto o registro da pessoa jurídica (SaudeJusia Tecnologia Ltda.)
        é concluído. Quando a pessoa jurídica for registrada, estes Termos serão atualizados
        com o CNPJ e a nova razão social assumirá a posição de controladora de dados e parte
        deste contrato.
      </p>
      <p>Canais de contato:</p>
      <ul>
        <li>Geral: <a href="mailto:contato@saudejusia.com.br">contato@saudejusia.com.br</a></li>
        <li>Privacidade e dados pessoais: <a href="mailto:privacidade@saudejusia.com.br">privacidade@saudejusia.com.br</a></li>
      </ul>

      <h2 id="o-que-fazemos">2. O que a SaudeJusia faz</h2>
      <ul>
        <li>Explica, em linguagem clara, direitos de beneficiários de planos de saúde com base na Lei 9.656/1998, normativas da Agência Nacional de Saúde Suplementar (ANS), Código de Defesa do Consumidor e jurisprudência pública.</li>
        <li>Analisa o caso descrito por você e gera minutas de documentos administrativos prontos para sua assinatura e envio por você.</li>
        <li>Orienta sobre prazos, canais oficiais e próximos passos na via administrativa.</li>
      </ul>

      <h2 id="o-que-nao-fazemos">3. O que a SaudeJusia NÃO faz</h2>
      <ul>
        <li><strong>Não presta serviços jurídicos.</strong> Não somos escritório de advocacia, não representamos você em juízo, não intermediamos contratação de advogado.</li>
        <li><strong>Não promete resultado.</strong> Nossas análises são informativas e baseadas em dados. Não garantem êxito em negociação com operadora, em NIP à ANS ou em eventual ação judicial.</li>
        <li><strong>Não substitui consulta médica.</strong> Não damos diagnóstico, prescrição nem opinião médica.</li>
        <li><strong>Não se substitui a advogado para ação judicial.</strong> Se a via administrativa falhar e for necessário judicializar, você deve procurar advogado de sua confiança.</li>
      </ul>

      <h2 id="quem-pode-usar">4. Quem pode usar</h2>
      <p>
        Você deve ter 18 anos ou mais e capacidade civil para contratar. Se estiver agindo em
        nome de outra pessoa (dependente, idoso sob seus cuidados, filho menor de idade),
        declara ter autorização legal para tratar dos dados dessa pessoa.
      </p>
      <p>
        A SaudeJusia é destinada a beneficiários de planos de saúde no Brasil. Se você está
        fora do Brasil, a plataforma pode não funcionar adequadamente e não assumimos
        responsabilidade por isso.
      </p>

      <h2 id="conta-cadastro">5. Conta e cadastro</h2>
      <p>
        Para usar funcionalidades além da landing pública, você precisa criar uma conta com
        e-mail, nome e senha. Você é responsável por manter a confidencialidade da senha e por
        tudo o que for feito através da sua conta.
      </p>
      <p>Nunca pediremos sua senha por e-mail, WhatsApp ou telefone. Se alguém pedir, é fraude.</p>

      <h2 id="planos-cobranca">6. Planos e cobrança</h2>
      <p>A SaudeJusia oferece os seguintes planos:</p>
      <ul>
        <li><strong>Livre</strong> — grátis, com limites de uso diários.</li>
        <li><strong>Essencial</strong> — <strong>[R$ 29/mês]</strong>, uso estendido.</li>
        <li><strong>Família</strong> — <strong>[R$ 49/mês]</strong>, cobertura para até 4 beneficiários.</li>
      </ul>
      <p>
        Valores podem ser atualizados com aviso prévio de 30 dias para usuários ativos.
        Cobrança mensal, sem fidelidade. Você pode cancelar a qualquer momento, com efeito no
        fim do ciclo corrente (Código de Defesa do Consumidor, Lei 8.078/1990).
      </p>
      <p>
        Trial de 14 dias em planos pagos: você não é cobrado durante o período; se não
        cancelar até o fim do trial, a cobrança começa automaticamente.
      </p>
      <p>
        Pagamentos são processados pela <strong>[NOME DO GATEWAY — ex: Stripe]</strong>, que
        tem sua própria política de privacidade e termos. A SaudeJusia não armazena dados de
        cartão de crédito.
      </p>

      <h2 id="uso-aceitavel">7. Uso aceitável</h2>
      <p>Ao usar a SaudeJusia, você se compromete a:</p>
      <ul>
        <li>Fornecer informações verdadeiras e completas sobre o seu caso.</li>
        <li>Usar a plataforma apenas para fins pessoais e legítimos, relacionados ao seu direito como beneficiário de plano de saúde.</li>
        <li>Não tentar burlar limites técnicos (rate limit, segurança, autenticação).</li>
        <li>Não usar a plataforma para atividade ilícita, fraude, simulação de caso falso, assédio ou qualquer prática contrária à lei ou à boa-fé.</li>
      </ul>
      <p>
        Podemos suspender ou encerrar sua conta se identificarmos violação destes Termos,
        fraude, tentativa de comprometer a segurança da plataforma ou uso abusivo dos
        recursos de IA.
      </p>

      <h2 id="propriedade-intelectual">8. Propriedade intelectual</h2>
      <p>
        A plataforma, o código, o design, as marcas, os textos e a base de conhecimento são
        de propriedade da SaudeJusia (ou de seus licenciadores). Você tem uma licença
        limitada, pessoal e não transferível para usar a plataforma de acordo com estes
        Termos.
      </p>
      <p>
        Os documentos que você gerar (reconsideração, NIP, notificação) são seus — você pode
        usar, imprimir, enviar e modificar como quiser, para seu próprio caso.
      </p>

      <h2 id="conteudo-do-usuario">9. Conteúdo do usuário</h2>
      <p>
        Você mantém a titularidade dos dados e documentos que enviar. Ao enviar, você nos
        concede licença limitada para processar esses dados, <strong>exclusivamente</strong>{" "}
        para:
      </p>
      <ul>
        <li>gerar a análise e o documento solicitado por você;</li>
        <li>armazenar de forma criptografada pelo prazo definido na Política de Privacidade;</li>
        <li>melhorar a qualidade do serviço de forma agregada e anonimizada.</li>
      </ul>
      <p>
        <strong>Nunca</strong> usamos seus dados para treinar modelos de IA de terceiros, nem
        vendemos para anunciantes, operadoras de plano de saúde, corretoras ou qualquer outro
        terceiro.
      </p>

      <h2 id="limitacao-responsabilidade">10. Limitação de responsabilidade</h2>
      <p>
        A SaudeJusia fornece informação e ferramenta de geração de documentos. Você é
        responsável por:
      </p>
      <ul>
        <li>revisar cada documento antes de enviá-lo;</li>
        <li>confirmar prazos e canais oficiais vigentes (ANS e operadoras podem alterar procedimentos);</li>
        <li>decidir se o caminho administrativo é suficiente ou se precisa de advogado.</li>
      </ul>
      <p><strong>Não nos responsabilizamos por:</strong></p>
      <ul>
        <li>decisão da operadora de saúde em negar ou conceder cobertura;</li>
        <li>decisão da ANS em acolher ou não a NIP;</li>
        <li>resultado de eventual ação judicial;</li>
        <li>prejuízos decorrentes de informação incompleta ou incorreta fornecida por você;</li>
        <li>indisponibilidade temporária da plataforma por manutenção, caso fortuito ou força maior.</li>
      </ul>
      <p>
        A responsabilidade total da SaudeJusia, se houver, fica limitada ao valor pago por
        você nos 12 meses anteriores ao evento que gerou o pedido, ou a R$ 500, o que for
        maior — ressalvadas as hipóteses em que a lei não admita limitação.
      </p>
      <p>
        Nada nestes Termos afasta direitos indisponíveis previstos no Código de Defesa do
        Consumidor.
      </p>

      <h2 id="comunicacoes">11. Comunicações</h2>
      <p>
        Podemos enviar e-mails operacionais (confirmação de cadastro, alertas de prazo,
        lembretes de documentos gerados) enquanto você tiver conta ativa. Você pode cancelar
        comunicações de marketing a qualquer momento pelo link de descadastro ou pelo canal{" "}
        <a href="mailto:privacidade@saudejusia.com.br">privacidade@saudejusia.com.br</a>.
      </p>

      <h2 id="modificacao">12. Modificação destes Termos</h2>
      <p>
        Podemos alterar estes Termos. Quando fizermos mudança material, avisaremos com pelo
        menos 30 dias de antecedência por e-mail e banner na plataforma. Se você continuar
        usando após a data de vigência da nova versão, estará aceitando. Se não concordar,
        pode encerrar a conta.
      </p>

      <h2 id="encerramento">13. Encerramento</h2>
      <p>
        Você pode encerrar sua conta a qualquer momento em <code>/minha-conta</code> ou
        escrevendo para{" "}
        <a href="mailto:privacidade@saudejusia.com.br">privacidade@saudejusia.com.br</a>. Após
        o encerramento, seus dados serão excluídos conforme a Política de Privacidade.
      </p>
      <p>Podemos encerrar sua conta se:</p>
      <ul>
        <li>você violar estes Termos;</li>
        <li>identificarmos atividade fraudulenta ou abusiva;</li>
        <li>formos obrigados por decisão judicial ou ordem administrativa;</li>
        <li>decidirmos descontinuar a plataforma — nesse caso, avisaremos com 60 dias de antecedência e forneceremos exportação dos seus documentos.</li>
      </ul>

      <h2 id="lei-foro">14. Lei aplicável e foro</h2>
      <p>
        Estes Termos são regidos pela lei brasileira. Fica eleito o foro da comarca de{" "}
        <strong>[CIDADE/UF]</strong>, salvo quando a lei determinar foro diverso (por exemplo,
        foro do domicílio do consumidor, nos termos do CDC).
      </p>

      <h2 id="contato">15. Contato</h2>
      <ul>
        <li>Dúvidas gerais: <a href="mailto:contato@saudejusia.com.br">contato@saudejusia.com.br</a></li>
        <li>Privacidade e dados: <a href="mailto:privacidade@saudejusia.com.br">privacidade@saudejusia.com.br</a></li>
        <li>Exercício de direitos do titular (LGPD): <a href="mailto:privacidade@saudejusia.com.br">privacidade@saudejusia.com.br</a></li>
      </ul>
    </LegalPageLayout>
  );
}
