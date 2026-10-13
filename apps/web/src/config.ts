export interface Config {
  production: boolean
  baseUrl: string
}

export function config(): Config {
  return { production: import.meta.env.PROD, baseUrl: import.meta.env.BASE_URL }
}
