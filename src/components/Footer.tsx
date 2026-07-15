export default function Footer() {
  return (
    <footer id="suporte" className="border-t border-white/[0.06] py-12">
      <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-8 px-5 md:flex-row md:items-center md:justify-between md:px-8">
        <div className="flex items-center gap-3">
          <img
            src="/brand/exportech-mark.png"
            alt="Exportech"
            className="h-9 w-auto object-contain"
          />
          <span className="ml-3 text-[12px] text-zinc-500">
            Tecnologia e importação com atendimento especializado.
          </span>
        </div>

        <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-zinc-400">
          <li>
            <a href="#loja" className="transition-colors hover:text-zinc-100">
              Catálogo
            </a>
          </li>
          <li>
            <a href="#beneficios" className="transition-colors hover:text-zinc-100">
              Benefícios
            </a>
          </li>
          <li>
            <a href="#escolha" className="transition-colors hover:text-zinc-100">
              Como escolher
            </a>
          </li>
          <li>
            <a href="#suporte" className="transition-colors hover:text-zinc-100">
              Atendimento
            </a>
          </li>
        </ul>

        <p className="text-[12px] text-zinc-500">Atendimento sob consulta</p>
      </div>

      <p className="mt-10 text-center text-[11px] text-zinc-600">
        © {new Date().getFullYear()} Exportech. Apple e iPhone são marcas da
        Apple Inc. Exportech é uma loja independente.
      </p>
    </footer>
  );
}
