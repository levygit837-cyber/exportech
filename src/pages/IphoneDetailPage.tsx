import {
  ArrowLeft,
  ArrowRight,
  ArrowSquareOut,
  WhatsappLogo,
} from "@phosphor-icons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect } from "react";
import {
  Link,
  useParams,
  useSearchParams,
} from "react-router";
import { getProductDetail } from "../data/productDetails";
import {
  convertUSDToBRL,
  formatBRL,
  formatUSD,
  getProductBySlug,
  resolveProductConfiguration,
  type Product,
} from "../data/products";

function ProductNotFound() {
  return (
    <section className="flex min-h-[75dvh] items-center pb-20 pt-32">
      <div className="mx-auto w-full max-w-[1240px] px-5 md:px-8">
        <p className="font-mono text-[13px] text-[color:var(--color-accent-soft)]">
          Produto não encontrado
        </p>
        <h1 className="text-fluid-h2 mt-5 max-w-[15ch] text-zinc-50">
          Este iPhone não está no catálogo.
        </h1>
        <p className="mt-5 max-w-[48ch] text-[15px] leading-relaxed text-zinc-400">
          Confira os modelos publicados e escolha uma configuração disponível.
        </p>
        <Link
          to="/iphones"
          className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-full bg-zinc-50 px-5 py-3 text-[13px] font-medium text-zinc-950 transition hover:bg-white active:scale-[0.98]"
        >
          <ArrowLeft size={14} weight="bold" aria-hidden />
          Voltar aos iPhones
        </Link>
      </div>
    </section>
  );
}

function IphoneDetailContent({ product }: { product: Product }) {
  const reduceMotion = useReducedMotion();
  const [searchParams, setSearchParams] = useSearchParams();
  const detail = getProductDetail(product.id);
  const configuration = resolveProductConfiguration(
    product,
    searchParams.get("finish"),
    searchParams.get("storage"),
  );
  const {
    finish,
    finishId,
    priceUSD,
    storageId,
  } = configuration;
  const priceBRL = convertUSDToBRL(priceUSD);

  useEffect(() => {
    if (
      searchParams.get("finish") !== finishId ||
      searchParams.get("storage") !== storageId
    ) {
      setSearchParams(
        { finish: finishId, storage: storageId },
        { replace: true },
      );
    }
  }, [finishId, searchParams, setSearchParams, storageId]);

  const selectFinish = (nextFinishId: string) => {
    const next = resolveProductConfiguration(
      product,
      nextFinishId,
      storageId,
    );
    setSearchParams(
      {
        finish: next.finishId,
        storage: next.storageId,
      },
      { replace: true },
    );
  };

  const selectStorage = (nextStorageId: typeof storageId) => {
    const next = resolveProductConfiguration(
      product,
      finishId,
      nextStorageId,
    );
    setSearchParams(
      {
        finish: next.finishId,
        storage: next.storageId,
      },
      { replace: true },
    );
  };

  const whatsappMessage = [
    `Olá, tenho interesse no ${product.name}.`,
    `Configuração: ${finish.name}, ${product.storages.find((item) => item.id === storageId)?.label}.`,
    `Estimativa: ${formatBRL(priceBRL)} (${formatUSD(priceUSD)} como referência).`,
  ].join(" ");
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;
  const relatedProducts = detail.relatedSlugs
    .map(getProductBySlug)
    .filter((item): item is Product => Boolean(item));

  return (
    <>
      <title>{product.name} | Exportech</title>
      <meta
        name="description"
        content={`${detail.positioning} Escolha acabamento e armazenamento e confira a estimativa da configuração.`}
      />

      <section className="pb-20 pt-32 md:pb-28 md:pt-40">
        <div className="mx-auto w-full max-w-[1240px] px-5 md:px-8">
          <nav
            aria-label="Navegação estrutural"
            className="text-[12px] text-zinc-500"
          >
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link to="/" className="transition-colors hover:text-zinc-200">
                  Início
                </Link>
              </li>
              <li aria-hidden className="text-zinc-700">
                /
              </li>
              <li>
                <Link
                  to="/iphones"
                  className="transition-colors hover:text-zinc-200"
                >
                  iPhones
                </Link>
              </li>
              <li aria-hidden className="text-zinc-700">
                /
              </li>
              <li aria-current="page" className="text-zinc-300">
                {product.name}
              </li>
            </ol>
          </nav>

          <div className="mt-9 lg:hidden">
            {product.label && (
              <p className="text-[12px] font-medium text-[color:var(--color-accent-soft)]">
                {product.label}
              </p>
            )}
            <h1 className="mt-3 text-[clamp(2.5rem,12vw,4rem)] font-semibold leading-[0.98] tracking-[-0.04em] text-zinc-50">
              {product.name}
            </h1>
            <p className="mt-5 max-w-[50ch] text-[15px] leading-relaxed text-zinc-400">
              {detail.positioning}
            </p>
          </div>

          <div className="mt-9 grid items-start gap-8 lg:grid-cols-[minmax(0,1.55fr)_minmax(340px,0.85fr)] lg:gap-12">
            <motion.figure
              data-detail-media
              className="product-detail-media relative aspect-[4/5] w-full min-w-0 overflow-hidden rounded-3xl border border-white/[0.08] sm:aspect-[5/4]"
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.55 }}
            >
              <AnimatePresence initial={false} mode="popLayout">
                <motion.img
                  key={finish.image}
                  src={finish.image}
                  alt={`${product.name} em ${finish.name}`}
                  loading="eager"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-contain p-6 sm:p-10"
                  initial={
                    reduceMotion
                      ? { opacity: 0 }
                      : { opacity: 0, scale: product.mediaScale * 0.975 }
                  }
                  animate={{
                    opacity: 1,
                    scale: product.mediaScale,
                  }}
                  exit={
                    reduceMotion
                      ? { opacity: 0 }
                      : { opacity: 0, scale: product.mediaScale * 1.015 }
                  }
                  transition={{
                    duration: reduceMotion ? 0 : 0.24,
                    ease: [0.32, 0.72, 0, 1],
                  }}
                />
              </AnimatePresence>
            </motion.figure>

            <div data-detail-summary className="min-w-0 lg:sticky lg:top-32">
              <div className="hidden lg:block">
                {product.label && (
                  <p className="text-[12px] font-medium text-[color:var(--color-accent-soft)]">
                    {product.label}
                  </p>
                )}
                <h1 className="mt-3 text-[clamp(2.5rem,5vw,4.75rem)] font-semibold leading-[0.98] tracking-[-0.04em] text-zinc-50">
                  {product.name}
                </h1>
                <p className="mt-5 max-w-[50ch] text-[15px] leading-relaxed text-zinc-400">
                  {detail.positioning}
                </p>
              </div>

              <div className="mt-8 grid gap-6 border-t border-white/[0.08] pt-7">
                <fieldset>
                  <legend className="mb-3 text-[12px] font-medium text-zinc-300">
                    Armazenamento
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    {product.storages.map((option) => {
                      const selected = option.id === storageId;
                      const available =
                        finish.pricesUSD[option.id] !== undefined;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          disabled={!available}
                          aria-pressed={selected}
                          onClick={() => selectStorage(option.id)}
                          className={
                            "min-h-11 rounded-full border px-4 py-2 text-[12px] font-medium transition duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-35 " +
                            (selected
                              ? "border-zinc-100 bg-zinc-100 text-zinc-950"
                              : "border-white/10 bg-white/[0.03] text-zinc-300 hover:border-white/20 hover:bg-white/[0.06]")
                          }
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>

                <fieldset>
                  <legend className="mb-3 text-[12px] font-medium text-zinc-400">
                    Cor: <span className="text-zinc-200">{finish.name}</span>
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    {product.finishes.map((option) => {
                      const selected = option.id === finishId;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          aria-label={`Selecionar ${option.name}`}
                          aria-pressed={selected}
                          title={option.name}
                          onClick={() => selectFinish(option.id)}
                          className={
                            "flex h-11 w-11 items-center justify-center rounded-full border transition duration-200 active:scale-[0.96] " +
                            (selected
                              ? "border-zinc-100 bg-white/10"
                              : "border-white/10 bg-transparent hover:border-white/30")
                          }
                        >
                          <span
                            className="h-4 w-4 rounded-full ring-1 ring-black/20"
                            style={{ backgroundColor: option.hex }}
                          />
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              </div>

              <div
                className="mt-8 border-t border-white/[0.08] pt-7"
                aria-live="polite"
              >
                <p className="text-[11px] text-zinc-500">Estimativa em BRL</p>
                <p className="mt-1 font-mono text-[28px] tracking-tight text-zinc-50">
                  {formatBRL(priceBRL)}
                </p>
                <p className="mt-1 text-[11px] text-zinc-500">
                  Referência original: {formatUSD(priceUSD)}. Valor sujeito a
                  confirmação.
                </p>
              </div>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-7 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-zinc-50 px-5 py-3 text-[13px] font-medium text-zinc-950 transition hover:bg-white active:scale-[0.98]"
              >
                <WhatsappLogo size={18} weight="fill" aria-hidden />
                Abrir no WhatsApp
              </a>
              <p className="mt-3 text-center text-[10px] leading-relaxed text-zinc-500">
                O WhatsApp abrirá com a configuração pronta. Você escolhe a
                conversa no aplicativo.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/[0.06] py-20 md:py-28">
        <div className="mx-auto w-full max-w-[1240px] px-5 md:px-8">
          <h2 className="text-fluid-h2 max-w-[14ch] text-zinc-50">
            O que este modelo entrega.
          </h2>
          <div className="mt-12 grid gap-px overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.08] md:grid-cols-[1.25fr_1fr_1fr]">
            {detail.benefits.map((benefit, index) => (
              <article
                key={benefit.title}
                className={
                  "bg-[#0d0e11] p-6 sm:p-8 " +
                  (index === 0 ? "md:py-12" : "")
                }
              >
                <h3 className="text-[20px] font-medium tracking-tight text-zinc-100">
                  {benefit.title}
                </h3>
                <p className="mt-3 text-[13px] leading-relaxed text-zinc-400">
                  {benefit.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/[0.06] py-20 md:py-28">
        <div className="mx-auto w-full max-w-[1240px] px-5 md:px-8">
          <h2 className="text-fluid-h2 max-w-[15ch] text-zinc-50">
            Especificações que mudam a experiência.
          </h2>
          <p className="mt-5 max-w-[58ch] text-[15px] leading-relaxed text-zinc-400">
            Um resumo das diferenças que afetam uso, fotografia, desempenho e
            autonomia.
          </p>

          <div className="mt-12 grid gap-12 lg:grid-cols-3 lg:gap-8">
            {detail.specGroups.map((group) => (
              <section
                key={group.title}
                className="border-t border-white/[0.12] pt-5"
              >
                <h3 className="text-[16px] font-medium text-zinc-100">
                  {group.title}
                </h3>
                <div className="mt-7 grid gap-8">
                  {group.items.map((item) => (
                    <div key={item.label}>
                      <p className="text-[11px] font-medium text-zinc-500">
                        {item.label}
                      </p>
                      <p className="mt-2 text-[14px] font-medium leading-relaxed text-zinc-200">
                        {item.value}
                      </p>
                      <p className="mt-2 text-[12px] leading-relaxed text-zinc-500">
                        {item.why}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <a
            href={detail.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-12 inline-flex min-h-11 items-center gap-2 text-[12px] font-medium text-zinc-300 transition-colors hover:text-white"
          >
            Ver especificações oficiais da Apple
            <ArrowSquareOut size={15} weight="bold" aria-hidden />
          </a>
        </div>
      </section>

      <section className="border-t border-white/[0.06] py-20 md:py-28">
        <div className="mx-auto w-full max-w-[1240px] px-5 md:px-8">
          <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-fluid-h2 text-zinc-50">
                Compare o próximo passo.
              </h2>
              <p className="mt-4 max-w-[50ch] text-[14px] leading-relaxed text-zinc-400">
                Veja alternativas próximas antes de decidir.
              </p>
            </div>
            <Link
              to="/iphones"
              className="inline-flex min-h-11 items-center gap-2 text-[12px] font-medium text-zinc-300 transition-colors hover:text-white"
            >
              Ver todos os iPhones
              <ArrowRight size={14} weight="bold" aria-hidden />
            </Link>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {relatedProducts.map((related) => {
              const relatedFinish =
                related.finishes.find(
                  (item) => item.id === related.defaultFinish,
                ) ?? related.finishes[0];
              return (
                <Link
                  key={related.id}
                  to={`/iphones/${related.id}`}
                  className="group grid min-h-[240px] grid-cols-[0.9fr_1.1fr] items-center overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0d0e11] transition-[transform,border-color] hover:-translate-y-0.5 hover:border-white/[0.16]"
                >
                  <div className="h-full min-h-[240px] bg-[radial-gradient(circle_at_50%_45%,rgba(122,164,207,0.14),transparent_50%)] p-4">
                    <img
                      src={relatedFinish.image}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-contain"
                      style={{ transform: `scale(${related.mediaScale})` }}
                    />
                  </div>
                  <div className="p-6">
                    <p className="text-[18px] font-medium tracking-tight text-zinc-100">
                      {related.name}
                    </p>
                    <p className="mt-2 text-[12px] leading-relaxed text-zinc-400">
                      {related.tagline}
                    </p>
                    <span className="mt-6 inline-flex items-center gap-2 text-[12px] font-medium text-zinc-300 group-hover:text-white">
                      Ver modelo
                      <ArrowRight size={14} weight="bold" aria-hidden />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}

export default function IphoneDetailPage() {
  const { slug } = useParams();
  const product = getProductBySlug(slug);

  if (!product || !getProductDetail(product.id)) {
    return <ProductNotFound />;
  }

  return <IphoneDetailContent product={product} />;
}
