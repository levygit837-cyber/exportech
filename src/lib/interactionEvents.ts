export const EXPORTTECH_INTERACTION_EVENT = "exportech:interaction";

export type InteractionEventName =
  | "hero_skip"
  | "hero_product_open"
  | "hero_catalog_open"
  | "featured_product_open"
  | "featured_catalog_open"
  | "guide_profile_select"
  | "guide_product_open";

export type InteractionEventDetail = {
  name: InteractionEventName;
  surface: "home";
  productId?: string;
  profileId?: string;
  destination?: string;
};

export function emitInteraction(
  detail: Omit<InteractionEventDetail, "surface">,
) {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent<InteractionEventDetail>(EXPORTTECH_INTERACTION_EVENT, {
      detail: { ...detail, surface: "home" },
    }),
  );
}
