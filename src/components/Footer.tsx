export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] py-12">
      <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-8 px-5 md:flex-row md:items-center md:justify-between md:px-8">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-white/5">
            <svg width="14" height="14" viewBox="0 0 22 22" fill="none" aria-hidden>
              <rect width="22" height="22" rx="6" fill="rgba(255,255,255,0.04)" />
              <path
                d="M6 7.2C6 6.5373 6.5373 6 7.2 6H14.8C15.4627 6 16 6.5373 16 7.2V14.8C16 15.4627 15.4627 16 14.8 16H7.2C6.5373 16 6 15.4627 6 14.8V7.2Z"
                stroke="white"
                strokeWidth="1.4"
              />
              <circle cx="11" cy="11" r="1.6" fill="white" />
            </svg>
          </span>
          <span className="text-[14px] font-medium text-zinc-200">Exportech</span>
          <span className="ml-3 text-[12px] text-zinc-500">
            iPhone original no Brasil.
          </span>
        </div>

        <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-zinc-400">
          <li>
            <a href="#suporte" className="transition-colors hover:text-zinc-100">
              Suporte
            </a>
          </li>
          <li>
            <a href="#trocas" className="transition-colors hover:text-zinc-100">
              Trocas e devoluções
            </a>
          </li>
          <li>
            <a href="#garantia" className="transition-colors hover:text-zinc-100">
              Garantia
            </a>
          </li>
          <li>
            <a href="#privacidade" className="transition-colors hover:text-zinc-100">
              Privacidade
            </a>
          </li>
        </ul>

        <p className="text-[12px] text-zinc-500">
          São Paulo, Brasil · CNPJ 00.000.000/0001-00
        </p>
      </div>

      <p className="mt-10 text-center text-[11px] text-zinc-600">
        © {new Date().getFullYear()} Exportech. Apple, iPhone e AppleCare+ são
        marcas registradas da Apple Inc. Exportech é revenda independente
        autorizada.
      </p>
    </footer>
  );
}
