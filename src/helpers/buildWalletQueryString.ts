import { Transaction } from "@multiversx/sdk-core/out";
import qs from "qs";

export const buildWalletQueryString = (options: { params?: any }): string => {
  const callbackUrl = window.location.href;
  const partialQueryString = qs.stringify(options.params || {});
  const fullQueryString = partialQueryString
    ? `${partialQueryString}&callbackUrl=${callbackUrl}`
    : `callbackUrl=${callbackUrl}`;

  return fullQueryString;
};




