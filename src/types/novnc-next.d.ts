declare module "novnc-next" {
  interface RFBOptions {
    credentials?: unknown
    shared?: boolean
    repeaterID?: string
    [key: string]: unknown
  }

  class RFB {
    constructor(
      target: Element | HTMLElement | string,
      url: string,
      options?: RFBOptions,
    )
    scaleViewport: boolean
    resizeSession: boolean
    showDotCursor: boolean
    disconnect(): void
    addEventListener(event: string, listener: (e?: unknown) => void): void
    removeEventListener(event: string, listener: (e?: unknown) => void): void
  }

  export default RFB
}
