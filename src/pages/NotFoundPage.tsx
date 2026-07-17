import { ArrowLeft, ArrowRight } from "@phosphor-icons/react";
import { Link } from "react-router";

export default function NotFoundPage() {
  return (
    <>
      <title>Página não encontrada | Exportech</title>
      <meta
        name="description"
        content="O endereço informado não corresponde a uma página publicada pela Exportech."
      />

      <section className="flex min-h-[75dvh] items-center pb-20 pt-32">
        <div className="mx-auto w-full max-w-[1240px] px-5 md:px-8">
          <p className="font-mono text-[13px] text-[color:var(--color-accent-soft)]">404</p>
          <h1 className="text-fluid-h2 mt-5 max-w-[14ch] text-zinc-50">
            Esta página não foi encontrada.
          </h1>
          <p className="mt-5 max-w-[48ch] text-[15px] leading-relaxed text-zinc-400">
            O endereço pode ter mudado ou ainda não faz parte das páginas publicadas.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-zinc-50 px-5 py-3 text-[13px] font-medium text-zinc-950 transition hover:bg-white active:scale-[0.98]"
            >
              <ArrowLeft size={14} weight="bold" aria-hidden />
              Voltar ao início
            </Link>
            <Link
              to="/iphones"
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-white/12 bg-white/[0.03] px-5 py-3 text-[13px] font-medium text-zinc-200 transition hover:bg-white/[0.07] active:scale-[0.98]"
            >
              Ver iPhones
              <ArrowRight size={14} weight="bold" aria-hidden />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
