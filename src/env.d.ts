/// <reference types="astro/client" />
/// <reference types="../.astro/types" />

interface ImportMetaEnv {
  readonly PUBLIC_API_URL: string;
  readonly PUBLIC_SITE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace App {
  interface Locals {
    user: {
      id: string;
      email: string;
      name?: string;
    } | null;
    session: {
      token: string;
    } | null;
  }
}
