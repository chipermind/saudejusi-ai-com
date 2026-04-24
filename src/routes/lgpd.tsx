import { createFileRoute } from "@tanstack/react-router";
import { LegalPageLayout, type TocItem } from "@/components/legal/LegalPageLayout";

export const Route = createFileRoute("/lgpd")({
  head: () => ({
    meta: [
      { title: "LGPD — Seus direitos | SaudeJusia" },
      { name: "description", content: "Resumo amigável dos seus direitos sob a LGPD na plataforma SaudeJusia." },
    ],
  }),
  component: LgpdPage,
});

const TOC: TocItem[] = [
  { id: "o-que-e", label: "O que é esta página" },
  { id: "dado-de-saude", label: "Por que dado de saúde é especial" },
  { id: "o-que-pedir", label: "O que você pode pedir, a qualquer momento" },
  { id: "como-exercer", label: "Como exercer" },
  { id: "se-nao-ficarmos-na-linha", label: "Se não ficarmos na linha" },
  { id: "dpo", label: "Encarregado de Dados (DPO)" },
  { id: "atualizacoes", label: "Atualizações" },
  { id: "resumo-um-minuto", label: "Resumo de um minuto" },
];

function LgpdPage() {
  return (
    <LegalPageLayout
      current="lgpd"
      title="LGPD — Seus direitos, em resumo"
      lastUpdated="[DATA DE PUBLICAÇÃO]"
      toc={TOC}
    >
      <h2 id="o-que-e">1. O que é esta página</h2>
      <p>
        A Lei Geral de Proteção de Dados (LGPD, Lei 13.709/2018) garante direitos a você
        sobre seus dados pessoais. Aqui resumimos, em linguagem simples, como a SaudeJusia
        cumpre essa lei e como você exerce seus direitos.
      </p>
      <p>Para detalhes completos, leia a Política de Privacidade.</p>

      <h2 id="dado-de-saude">2. Por que dado de saúde é especial</h2>
      <p>
        Dado de saúde é classificado pela LGPD como{" "}
        <strong>dado pessoal sensível</strong> (art. 11). Isso significa proteção reforçada:
      </p>
      <ul>
        <li>só podemos tratar com consentimento específico seu (você clicou expressamente "concordo" para este fim);</li>
        <li>não podemos compartilhar livremente;</li>
        <li>precisamos de medidas de segurança mais fortes.</li>
      </ul>
      <p>
        Por isso, a SaudeJusia trata todos os seus documentos de saúde com criptografia em
        camada de aplicação — mesmo nosso banco de dados não consegue ler o conteúdo sem a
        chave.
      </p>

      <h2 id="o-que-pedir">3. O que você pode pedir, a qualquer momento</h2>
      <p><strong>1. Ver o que temos sobre você.</strong></p>
      <p>Manda um e-mail, respondemos em até 15 dias com tudo o que está no seu perfil.</p>
      <p><strong>2. Corrigir algo errado.</strong></p>
      <p>Dados desatualizados, incorretos, incompletos — avisa que corrigimos.</p>
      <p><strong>3. Apagar seus dados.</strong></p>
      <p>
        Fechou a conta? Dados do caso somem no prazo de retenção (30 dias no Livre, 180 dias
        nos pagos). Pode pedir exclusão antecipada.
      </p>
      <p><strong>4. Levar seus dados para outro lugar.</strong></p>
      <p>Se quiser migrar para outro serviço, te mandamos um arquivo com tudo (portabilidade).</p>
      <p><strong>5. Saber com quem compartilhamos.</strong></p>
      <p>
        Listamos todos os operadores na Política de Privacidade, seção 6. Se quiser a lista
        no momento da consulta, pedimos.
      </p>
      <p><strong>6. Revogar o consentimento.</strong></p>
      <p>Consentiu e mudou de ideia? Revoga. Paramos de tratar.</p>
      <p><strong>7. Opor-se a decisão 100% automatizada.</strong></p>
      <p>
        Nossa IA faz análises do seu caso. Você pode pedir revisão humana dessas análises se
        achar que te afetaram injustamente.
      </p>

      <h2 id="como-exercer">4. Como exercer</h2>
      <p>
        <strong>E-mail único:</strong>{" "}
        <a href="mailto:privacidade@saudejusia.com.br">privacidade@saudejusia.com.br</a>
      </p>
      <p>Diga qual direito quer exercer. Se puder, coloque:</p>
      <ul>
        <li>seu nome completo cadastrado;</li>
        <li>e-mail da conta;</li>
        <li>o que você quer (ex.: "pedido de exclusão dos dados do caso X").</li>
      </ul>
      <p>
        Respondemos em <strong>até 15 dias corridos</strong>. Se precisarmos de mais tempo
        por complexidade técnica, avisamos o motivo.
      </p>

      <h2 id="se-nao-ficarmos-na-linha">5. Se não ficarmos na linha</h2>
      <p>
        Você pode reclamar para a{" "}
        <strong>Autoridade Nacional de Proteção de Dados (ANPD)</strong>:
      </p>
      <ul>
        <li>Site: <a href="https://www.gov.br/anpd" target="_blank" rel="noopener noreferrer">https://www.gov.br/anpd</a></li>
        <li>E-mail: <a href="mailto:comunicacao@anpd.gov.br">comunicacao@anpd.gov.br</a></li>
      </ul>
      <p>Também pode procurar:</p>
      <ul>
        <li>Procon do seu estado</li>
        <li>Ministério Público</li>
        <li>Defensoria Pública</li>
      </ul>

      <h2 id="dpo">6. Encarregado de Dados (DPO)</h2>
      <p>
        Toda empresa que trata dados pessoais precisa ter um Encarregado, que é a ponte entre
        você, a empresa e a ANPD.
      </p>
      <p>
        <strong>Encarregado da SaudeJusia:</strong>{" "}
        <strong>[NOME DO DPO ou "o próprio responsável legal"]</strong>
        <br />
        <strong>Canal de contato:</strong>{" "}
        <a href="mailto:privacidade@saudejusia.com.br">privacidade@saudejusia.com.br</a>
      </p>

      <h2 id="atualizacoes">7. Atualizações</h2>
      <p>
        Esta página pode ser atualizada. A data no topo mostra a última versão. Mudanças
        materiais são avisadas por e-mail.
      </p>

      <h2 id="resumo-um-minuto">8. Resumo de um minuto</h2>
      <ul>
        <li>Coletamos o mínimo.</li>
        <li>Criptografamos tudo.</li>
        <li>Nunca vendemos, nunca compartilhamos com operadoras.</li>
        <li>Você manda em todos os seus dados.</li>
        <li>Pede por e-mail, respondemos em 15 dias.</li>
        <li>ANPD é sua aliada se a gente errar.</li>
      </ul>
    </LegalPageLayout>
  );
}
