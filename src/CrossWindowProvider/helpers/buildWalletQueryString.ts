import qs from 'qs';
import { safeWindow } from '../../constants';

export const buildWalletQueryString = (options: { params?: any }): string => {
  const callbackUrl = safeWindow.location?.href;
  const partialQueryString = qs.stringify(options.params || {});
  const fullQueryString = partialQueryString
    ? `${partialQueryString}&callbackUrl=${callbackUrl}`
    : `callbackUrl=${callbackUrl}`;

  return fullQueryString;
};
