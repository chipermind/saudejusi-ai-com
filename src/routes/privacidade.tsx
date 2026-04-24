import { createFileRoute } from "@tanstack/react-router";
import { LegalPageLayout, type TocItem } from "@/components/legal/LegalPageLayout";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Política de Privacidade — SaudeJusia" },
      { name: "description", content: "Política de Privacidade da plataforma SaudeJusia (versão preliminar 1.0)." },
    ],
  }),
  component: PrivacidadePage,
});

const TOC: TocItem[] = [
  { id: "resumo", label: "Resumo em 30 segundos" },
  { id: "controlador", label: "Quem é o controlador dos seus dados" },
  { id: "dados-coletados", label: "Quais dados coletamos" },
  { id: "base-legal", label: "Por que coletamos (base legal)" },
  { id: "protecao", label: "Como protegemos" },
  { id: "compartilhamento", label: "Quem pode acessar seus dados" },
  { id: "retencao", label: "Por quanto tempo guardamos" },
  { id: "transferencia", label: "Transferência internacional" },
  { id: "cookies", label: "Cookies e tecnologias similares" },
  { id: "direitos", label: "Seus direitos (art. 18 LGPD)" },
  { id: "menores", label: "Menores de idade" },
  { id: "alteracoes", label: "Alterações nesta Política" },
  { id: "contato", label: "Contato" },
];

function PrivacidadePage() {
  return (
    <LegalPageLayout
      current="privacidade"
      title="Política de Privacidade"
      lastUpdated="[DATA DE PUBLICAÇÃO]"
      toc={TOC}
    >
      <h2 id="resumo">1. Resumo em 30 segundos</h2>
      <ul>
        <li>Coletamos o mínimo de dados para o serviço funcionar: e-mail, nome, e as informações do seu caso de plano de saúde.</li>
        <li>Dados de saúde são sensíveis e recebem proteção reforçada (criptografia em aplicação, além da criptografia em repouso).</li>
        <li>Nunca vendemos, nunca compartilhamos com operadoras de plano, nunca treinamos modelos de IA de terceiros com seus dados.</li>
        <li>Você tem direitos amplos sobre seus dados (ver seção 10) e pode exercê-los a qualquer momento em <a href="mailto:privacidade@saudejusia.com.br">privacidade@saudejusia.com.br</a>.</li>
        <li>Alguns prestadores de serviço que usamos estão fora do Brasil (EUA, União Europeia). Seção 8 detalha.</li>
      </ul>

      <h2 id="controlador">2. Quem é o controlador dos seus dados</h2>
      <p>
        Neste momento, o controlador é <strong>[NOME COMPLETO DO RESPONSÁVEL]</strong>, CPF{" "}
        <strong>[XXX.XXX.XXX-XX]</strong>, <strong>[CIDADE/UF]</strong>, responsável legal
        enquanto o registro da SaudeJusia Tecnologia Ltda. é concluído. Após o registro, a
        pessoa jurídica assumirá automaticamente a posição de controladora e esta Política
        será atualizada com CNPJ e endereço da Ltda.
      </p>
      <p>
        Encarregado pelo Tratamento de Dados (DPO / Encarregado, art. 41 LGPD):{" "}
        <strong>[NOME DO DPO — ou "o próprio responsável legal acima"]</strong>.
      </p>
      <p>
        Canal do Encarregado:{" "}
        <a href="mailto:privacidade@saudejusia.com.br">privacidade@saudejusia.com.br</a>
        <br />
        Prazo de resposta: até 15 dias corridos (art. 18 §5º LGPD).
      </p>

      <h2 id="dados-coletados">3. Quais dados coletamos</h2>
      <h3>3.1 Dados de cadastro</h3>
      <ul>
        <li>Nome completo</li>
        <li>E-mail</li>
        <li>Senha (armazenada apenas como hash, não em texto plano)</li>
        <li>Telefone (opcional, para alertas)</li>
      </ul>
      <h3>3.2 Dados do seu caso de plano de saúde (dados pessoais sensíveis, art. 11 LGPD)</h3>
      <ul>
        <li>Operadora do plano e tipo de plano</li>
        <li>Descrição da negativa ou situação</li>
        <li>Documentos que você enviar: carta de negativa, pedido médico, laudo, carteirinha, contrato</li>
        <li>Informações de saúde contidas nesses documentos (CID, procedimento, diagnóstico, histórico clínico quando presente)</li>
      </ul>
      <h3>3.3 Dados de uso</h3>
      <ul>
        <li>Endereço IP (apenas no momento do acesso, para segurança; não armazenamos em banco)</li>
        <li>Dispositivo, navegador, sistema operacional</li>
        <li>Páginas visitadas e ações na plataforma (via Plausible Analytics, sem cookies, sem identificação individual)</li>
      </ul>
      <h3>3.4 Dados de pagamento</h3>
      <p>
        Processados pelo gateway <strong>[NOME DO GATEWAY]</strong>. A SaudeJusia recebe
        apenas: status da cobrança, últimos 4 dígitos do cartão, bandeira.{" "}
        <strong>Não armazenamos número completo de cartão, CVV ou dados bancários.</strong>
      </p>

      <h2 id="base-legal">4. Por que coletamos (base legal)</h2>
      <table>
        <thead>
          <tr>
            <th>Finalidade</th>
            <th>Dado</th>
            <th>Base legal LGPD</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Criar e manter sua conta</td><td>Nome, e-mail, senha</td><td>Execução de contrato (art. 7º V)</td></tr>
          <tr><td>Analisar seu caso e gerar documentos</td><td>Dados do caso, documentos, dados de saúde</td><td>Consentimento específico (art. 11, I)</td></tr>
          <tr><td>Processar pagamento</td><td>Dados de pagamento</td><td>Execução de contrato (art. 7º V)</td></tr>
          <tr><td>Segurança, prevenção de fraude</td><td>IP, dispositivo, logs</td><td>Legítimo interesse (art. 7º IX)</td></tr>
          <tr><td>Cumprir obrigação legal ou judicial</td><td>Conforme aplicável</td><td>Obrigação legal (art. 7º II)</td></tr>
          <tr><td>Melhoria agregada do serviço</td><td>Dados agregados e anonimizados</td><td>Legítimo interesse (art. 7º IX)</td></tr>
          <tr><td>Comunicações de marketing</td><td>E-mail</td><td>Consentimento (opt-in separado)</td></tr>
        </tbody>
      </table>
      <p>
        Você pode revogar consentimento a qualquer momento. A revogação não afeta tratamento
        anterior baseado em consentimento válido.
      </p>

      <h2 id="protecao">5. Como protegemos</h2>
      <ul>
        <li><strong>Criptografia em trânsito:</strong> TLS 1.3 em todas as comunicações.</li>
        <li><strong>Criptografia em repouso:</strong> AES-256 no banco (Supabase/AWS) e nos backups.</li>
        <li><strong>Criptografia em camada de aplicação</strong> para documentos do seu caso: AES-256-GCM com chave derivada por HKDF-SHA256, chave mestra fora do banco. Isso significa que mesmo que alguém tenha acesso ao nosso banco, os conteúdos dos seus documentos continuam ilegíveis.</li>
        <li><strong>Segregação por usuário:</strong> você só enxerga seus próprios dados. Acesso interno da equipe é restrito e registrado.</li>
        <li><strong>Retenção mínima:</strong> dados do caso são apagados automaticamente após o prazo da seção 7.</li>
        <li><strong>Logs sem PII:</strong> logs de produção não registram o conteúdo dos seus dados; apenas metadados (qual operação foi feita, quando, com qual sucesso).</li>
      </ul>
      <p>
        Nenhum sistema é 100% seguro. Em caso de incidente de segurança que cause risco
        relevante aos seus direitos, notificaremos você e a ANPD no prazo legal (art. 48 LGPD).
      </p>

      <h2 id="compartilhamento">6. Quem pode acessar seus dados</h2>
      <p>Internamente:</p>
      <ul>
        <li><strong>[NOME DO RESPONSÁVEL LEGAL]</strong> — acesso completo como controlador.</li>
        <li>Equipe técnica autorizada, com acesso auditado e restrito ao necessário para a função.</li>
      </ul>
      <p>Externamente (operadores de dados, art. 5º VII LGPD):</p>
      <ul>
        <li><strong>Supabase</strong> (banco de dados e autenticação) — contrato com cláusulas de proteção de dados.</li>
        <li><strong>[NOME DO GATEWAY DE PAGAMENTO]</strong> — apenas dados de pagamento.</li>
        <li><strong>[OpenAI / Anthropic — escolher o provedor efetivo]</strong> — processa o texto do seu caso para gerar análise e documento. Dados <strong>não</strong> são usados para treinamento pelo provedor (verificamos contratualmente).</li>
        <li><strong>Plausible Analytics</strong> — dados de uso agregados, sem cookies, sem identificação individual.</li>
        <li><strong>[Cloudflare / Vercel — escolher hospedagem efetiva]</strong> — entrega de aplicação.</li>
        <li><strong>[Provedor de e-mail transacional — ex: Resend, SendGrid]</strong> — envio de e-mails operacionais.</li>
      </ul>
      <p>
        Todos os operadores são contratualmente obrigados a tratar seus dados apenas conforme
        nossas instruções e a cumprir a LGPD.
      </p>
      <p><strong>Não compartilhamos com:</strong></p>
      <ul>
        <li>operadoras de plano de saúde;</li>
        <li>corretoras de seguro;</li>
        <li>anunciantes;</li>
        <li>agregadores de dados;</li>
        <li>empresas de marketing fora dos operadores listados acima.</li>
      </ul>

      <h2 id="retencao">7. Por quanto tempo guardamos</h2>
      <table>
        <thead>
          <tr>
            <th>Tipo de dado</th>
            <th>Prazo de retenção</th>
            <th>O que acontece depois</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Dados de cadastro (conta ativa)</td><td>Enquanto a conta existir</td><td>Excluídos em até 30 dias após encerramento da conta</td></tr>
          <tr><td>Documentos e análises do seu caso (plano Livre)</td><td>30 dias após a geração</td><td>Apagados automaticamente</td></tr>
          <tr><td>Documentos e análises do seu caso (planos pagos)</td><td>180 dias após a geração</td><td>Apagados automaticamente</td></tr>
          <tr><td>Dados financeiros (nota fiscal, histórico de cobrança)</td><td>5 anos após a transação</td><td>Obrigação legal (Receita Federal)</td></tr>
          <tr><td>Logs de segurança</td><td>6 meses</td><td>Apagados automaticamente</td></tr>
          <tr><td>Dados de waitlist (pré-cadastro)</td><td>Até a abertura pública do beta ou 12 meses, o que ocorrer antes</td><td>Apagados automaticamente</td></tr>
        </tbody>
      </table>
      <p>
        Você pode solicitar exclusão antes desses prazos a qualquer momento, exceto quando a
        lei exigir retenção (ex: dados fiscais).
      </p>

      <h2 id="transferencia">8. Transferência internacional</h2>
      <p>Alguns operadores que usamos processam dados fora do Brasil:</p>
      <ul>
        <li><strong>[OpenAI / Anthropic]</strong> — Estados Unidos</li>
        <li><strong>Supabase</strong> — Estados Unidos (região AWS us-east-1 por padrão) ou conforme configuração</li>
        <li><strong>Plausible</strong> — União Europeia</li>
      </ul>
      <p>
        Essas transferências são feitas com base no art. 33, II da LGPD (cláusulas
        contratuais específicas) e nos mecanismos de proteção equivalentes. Ao consentir com
        o tratamento, você está ciente dessas transferências.
      </p>

      <h2 id="cookies">9. Cookies e tecnologias similares</h2>
      <p>Usamos o mínimo necessário:</p>
      <ul>
        <li><strong>Cookies estritamente necessários:</strong> para manter sua sessão logada. Sem esses, o site não funciona.</li>
        <li><strong>Sem cookies de publicidade.</strong></li>
        <li><strong>Sem cookies de rastreamento entre sites.</strong></li>
        <li><strong>Sem pixels de terceiros (Meta, Google Ads, etc.).</strong></li>
      </ul>
      <p>
        Analytics: usamos Plausible, que é cookieless. Nenhum cookie é colocado no seu
        navegador.
      </p>

      <h2 id="direitos">10. Seus direitos (art. 18 LGPD)</h2>
      <p>Você pode, a qualquer momento, solicitar:</p>
      <ol>
        <li><strong>Confirmação</strong> de que tratamos seus dados.</li>
        <li><strong>Acesso</strong> aos dados que temos sobre você.</li>
        <li><strong>Correção</strong> de dados incompletos, inexatos ou desatualizados.</li>
        <li><strong>Anonimização, bloqueio ou eliminação</strong> de dados desnecessários, excessivos ou tratados em desconformidade com a LGPD.</li>
        <li><strong>Portabilidade</strong> dos seus dados para outro fornecedor.</li>
        <li><strong>Eliminação</strong> dos dados tratados com base em consentimento.</li>
        <li><strong>Informação</strong> sobre com quem compartilhamos.</li>
        <li><strong>Informação</strong> sobre possibilidade de não fornecer consentimento e suas consequências.</li>
        <li><strong>Revogação</strong> do consentimento.</li>
        <li><strong>Oposição</strong> a tratamento baseado em outra hipótese legal que não consentimento.</li>
        <li><strong>Revisão</strong> de decisões tomadas exclusivamente por tratamento automatizado (nosso motor de IA) que afetem seus interesses.</li>
      </ol>
      <p>
        Para exercer qualquer direito: envie e-mail para{" "}
        <a href="mailto:privacidade@saudejusia.com.br">privacidade@saudejusia.com.br</a>,
        informando qual direito quer exercer. Responderemos em até 15 dias corridos.
      </p>
      <p>
        Se entender que não tratamos seus dados adequadamente, você pode reclamar à
        Autoridade Nacional de Proteção de Dados (ANPD) em{" "}
        <a href="https://www.gov.br/anpd" target="_blank" rel="noopener noreferrer">https://www.gov.br/anpd</a>.
      </p>

      <h2 id="menores">11. Menores de idade</h2>
      <p>
        A SaudeJusia é destinada a adultos (18+). Se você está usando em nome de um
        dependente menor de idade, declara ter autoridade legal (pai, mãe ou responsável).
        Não coletamos dados de menores diretamente.
      </p>

      <h2 id="alteracoes">12. Alterações nesta Política</h2>
      <p>
        Podemos atualizar esta Política. Quando a mudança for material (por exemplo, nova
        finalidade ou novo compartilhamento), avisaremos com 30 dias de antecedência por
        e-mail e banner. Mudanças apenas editoriais (correção de texto, clareza) podem
        ocorrer a qualquer momento, com a data de "última atualização" no topo refletindo.
      </p>

      <h2 id="contato">13. Contato</h2>
      <ul>
        <li>Privacidade e exercício de direitos: <a href="mailto:privacidade@saudejusia.com.br">privacidade@saudejusia.com.br</a></li>
        <li>Encarregado (DPO): <strong>[NOME]</strong>, acessível pelo mesmo e-mail acima</li>
        <li>ANPD: <a href="https://www.gov.br/anpd" target="_blank" rel="noopener noreferrer">https://www.gov.br/anpd</a></li>
      </ul>
    </LegalPageLayout>
  );
}
