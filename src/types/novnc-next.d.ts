declare module "novnc-next" {
  interface RFBOptions {
    credentials?: any
    shared?: boolean
    repeaterID?: string
    [key: string]: any
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
    addEventListener(event: string, listener: (e?: any) => void): void
    removeEventListener(event: string, listener: (e?: any) => void): void
  }

  export default RFB
}
