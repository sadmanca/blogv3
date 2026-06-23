/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare module '@barba/core' {
  interface ISchemaPage {
    container: HTMLElement
    html: string
    namespace: string
    url: { href: string; path: string; port: number | null; hash: string; query: Record<string, string> }
  }

  export interface ITransitionData {
    current: ISchemaPage
    next: ISchemaPage
    trigger: HTMLElement | string
  }

  interface ITransitionPage {
    name?: string
    from?: { namespace?: string | string[] }
    to?: { namespace?: string | string[] }
    leave?(data: ITransitionData): any
    enter?(data: ITransitionData): any
    afterLeave?(data: ITransitionData): void
    beforeLeave?(data: ITransitionData): void
    beforeEnter?(data: ITransitionData): void
    afterEnter?(data: ITransitionData): void
    after?(data: ITransitionData): void
  }

  interface IView {
    namespace: string
    afterEnter?(): void
  }

  interface IBarbaOptions {
    transitions?: ITransitionPage[]
    views?: IView[]
    preventRunning?: boolean
  }

  const barba: {
    init(options: IBarbaOptions): void
  }

  export default barba
}
