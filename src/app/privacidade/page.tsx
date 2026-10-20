import { Logo } from "@/components/branding/logo";

export const metadata = {
  title: "Política de Privacidade — Stockmann CRM",
};

export default function PoliticaPrivacidadePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-6 py-14">
      <div className="flex items-center gap-3">
        <Logo className="h-9 w-9 text-sm font-bold" />
        <div>
          <h1 className="font-heading text-xl font-bold tracking-tight">Stockmann CRM</h1>
          <p className="text-sm text-muted-foreground">Política de Privacidade</p>
        </div>
      </div>

      <div className="flex flex-col gap-5 text-sm leading-relaxed text-foreground">
        <p className="text-xs text-muted-foreground">Última atualização: outubro de 2026.</p>

        <p>
          O Stockmann CRM é um sistema interno de gestão de leads e relacionamento com clientes,
          operado pela Stockmann Company para uso próprio e de seus clientes contratantes. Esta
          página explica quais dados coletamos, como usamos e como entrar em contato sobre eles.
        </p>

        <section className="flex flex-col gap-2">
          <h2 className="font-heading text-base font-bold">Quais dados coletamos</h2>
          <p>
            Quando um cliente da Stockmann Company roda um anúncio de geração de leads (Meta Ads —
            Facebook/Instagram), os dados preenchidos voluntariamente pela pessoa no formulário do
            anúncio (como nome, telefone e/ou e-mail) são recebidos automaticamente pelo CRM e
            armazenados para fins de atendimento comercial. Também armazenamos os dados que a
            própria equipe da agência ou do cliente insere manualmente no sistema (notas,
            tarefas, estágio do funil de vendas).
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-heading text-base font-bold">Como usamos esses dados</h2>
          <p>
            Os dados são usados exclusivamente para contato comercial e acompanhamento do
            relacionamento entre o cliente contratante da Stockmann Company e as pessoas
            interessadas em seus produtos ou serviços. Não vendemos, alugamos nem compartilhamos
            esses dados com terceiros fora dessa finalidade.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-heading text-base font-bold">Quem tem acesso</h2>
          <p>
            O acesso ao CRM é restrito por login e senha. Cada cliente contratante só enxerga os
            próprios leads; a equipe da Stockmann Company, como administradora do sistema, tem
            acesso a todos os workspaces para fins de suporte e operação.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-heading text-base font-bold">Retenção e exclusão</h2>
          <p>
            Os dados ficam armazenados enquanto durar o relacionamento comercial. Qualquer pessoa
            pode solicitar a exclusão dos seus dados de contato entrando em contato pelo e-mail
            abaixo.
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-heading text-base font-bold">Contato</h2>
          <p>
            Dúvidas, solicitações de acesso ou exclusão de dados podem ser enviadas para{" "}
            <a href="mailto:rubensstockmann.oli@gmail.com" className="text-primary underline">
              rubensstockmann.oli@gmail.com
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
