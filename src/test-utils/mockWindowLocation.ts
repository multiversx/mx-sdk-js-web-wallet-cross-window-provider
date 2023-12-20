interface MockWindowLocationParamsType {
  search?: string;
  href?: string;
  pathname?: string;
}

export const mockWindowLocation = (value: MockWindowLocationParamsType) => {
  if (!window) {
    return;
  }

  const location = window.location;

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  delete window.location;

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  window.location = Object.defineProperties(
    {},
    {
      ...Object.getOwnPropertyDescriptors(location),
      pathname: {
        configurable: true,
        value: value.pathname ?? ''
      },
      href: {
        configurable: true,
        value: value.href ?? ''
      },
      search: {
        configurable: true,
        value: value.search ?? ''
      }
    }
  );
};
