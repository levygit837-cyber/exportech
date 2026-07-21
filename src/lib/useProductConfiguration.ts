import { useState } from "react";
import {
  resolveProductConfiguration,
  type Product,
  type StorageId,
} from "../data/products";

type InitialConfiguration = {
  finishId?: string | null;
  storageId?: string | null;
};

export function useProductConfiguration(
  product: Product,
  initial: InitialConfiguration = {},
) {
  const [selection, setSelection] = useState(() => {
    const configuration = resolveProductConfiguration(
      product,
      initial.finishId,
      initial.storageId,
    );
    return {
      finishId: configuration.finishId,
      storageId: configuration.storageId,
    };
  });
  const configuration = resolveProductConfiguration(
    product,
    selection.finishId,
    selection.storageId,
  );

  const selectFinish = (nextFinishId: string) => {
    const next = resolveProductConfiguration(
      product,
      nextFinishId,
      selection.storageId,
    );
    setSelection({
      finishId: next.finishId,
      storageId: next.storageId,
    });
  };

  const selectStorage = (nextStorageId: StorageId) => {
    const next = resolveProductConfiguration(
      product,
      selection.finishId,
      nextStorageId,
    );
    setSelection({
      finishId: next.finishId,
      storageId: next.storageId,
    });
  };

  return {
    finish: configuration.finish,
    finishId: configuration.finishId,
    priceUSD: configuration.priceUSD,
    selectFinish,
    selectStorage,
    storageId: configuration.storageId,
  };
}
