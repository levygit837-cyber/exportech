import { Link } from "react-router";

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] py-12">
      <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-8 px-5 md:flex-row md:items-center md:justify-between md:px-8">
        <div className="flex items-center gap-3">
          <img
            src="/brand/exportech-mark.png"
            alt="Exportech"
            className="h-9 w-auto object-contain"
          />
          <span className="ml-3 text-[12px] text-zinc-500">
            Catálogo de iPhones com valores de referência.
          </span>
        </div>

        <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-zinc-400">
          <li>
            <Link to="/iphones" className="transition-colors hover:text-zinc-100">
              iPhones
            </Link>
          </li>
          <li>
            <Link to="/#beneficios" className="transition-colors hover:text-zinc-100">
              Benefícios
            </Link>
          </li>
          <li>
            <Link to="/#escolha" className="transition-colors hover:text-zinc-100">
              Como escolher
            </Link>
          </li>
        </ul>

        <p className="text-[12px] text-zinc-500">Valores apresentados como estimativa</p>
      </div>

      <p className="mt-10 text-center text-[11px] text-zinc-600">
        © {new Date().getFullYear()} Exportech. Apple e iPhone são marcas da Apple Inc. Exportech é uma loja independente.
      </p>
    </footer>
  );
}
