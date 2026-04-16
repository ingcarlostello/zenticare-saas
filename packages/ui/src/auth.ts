export const AUTH_ROUTES = {
  REGISTER: 'register',
  LOGIN: 'login',
} as const;

export type AuthRouteKey = keyof typeof AUTH_ROUTES;

export const getAuthPath = (lang: string, route: AuthRouteKey) => {
  const path = AUTH_ROUTES[route];
  return `/${lang}/${path}`;
};
