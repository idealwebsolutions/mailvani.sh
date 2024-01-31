export default interface SharedEnvironment {
  readonly DOMAINS: string,
  readonly EXPIRATION: string,
  readonly STORAGE_LIMIT_QUOTA: string,
  readonly QUERY_CLIENT_ACCESS_SECRET: string,
  readonly GLOBAL_SALT: string
}
