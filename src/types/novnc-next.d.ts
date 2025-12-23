declare module "novnc-next" {
  export interface RFBOptions {
    credentials?: {
      password?: string
      username?: string
      target?: string
      [key: string]: unknown
    }
    shared?: boolean
    repeaterID?: string
    wsProtocols?: string[]
    [key: string]: unknown
  }

  export interface RFBCapabilities {
    /**
     * Machine power control is available
     */
    power: boolean
    [key: string]: unknown
  }

  export interface CapabilitiesEvent extends CustomEvent {
    detail: { capabilities: RFBCapabilities }
  }

  export interface ClippingViewportEvent extends CustomEvent {
    detail: boolean
  }

  export interface ClipboardEvent extends CustomEvent {
    detail: { text: string }
  }

  export interface CredentialsRequiredEvent extends CustomEvent {
    detail: { types: string[] }
  }

  export interface DesktopNameEvent extends CustomEvent {
    detail: { name: string }
  }

  export interface DisconnectEvent extends CustomEvent {
    detail: { clean: boolean }
  }

  export interface SecurityFailureEvent extends CustomEvent {
    detail: { status: number; reason?: string }
  }

  export interface ServerVerificationEvent extends CustomEvent {
    detail: { type: string; publickey?: Uint8Array; [key: string]: unknown }
  }

  class RFB extends EventTarget {
    constructor(
      target: Element | HTMLElement | string,
      url: string,
      options?: RFBOptions,
    )

    /**
     * Is a valid CSS background style value indicating which background style should be
     * applied to the element containing the remote session screen.
     *
     * @example
     * ```js
     * rfb.background = "black"
     * rfb.background = "#ff0000"
     * rfb.background = "url('background.png') no-repeat center center / cover"
     * ```
     *
     * @default rgb(40,40,40)
     */
    background: string

    /**
     * **Read only**
     *
     * Is an Object indicating which optional extensions are available on the server. Some
     * methods may only be called if the corresponding capability is set.
     */
    capabilities: RFBCapabilities

    /**
     * **Read only**
     *
     * Is a boolean indicating if the remote session is currently being clipped to its
     * container. Only relevant if clipViewport is enabled.
     */
    clippingViewport: boolean

    /**
     * Is a boolean indicating if the remote session should be clipped to its container.
     * When disabled scrollbars will be shown to handle the resulting overflow.
     *
     * @default false
     */
    clipViewport: boolean

    /**
     * Is an int in range [0-9] controlling the desired compression level. Value 0 means no
     * compression. Level 1 uses a minimum of CPU resources and achieves weak compression
     * ratios, while level 9 offers best compression but is slow in terms of CPU consumption
     * on the server side. Use high levels with very slow network connections.
     *
     * @default 2
     */
    compressionLevel: number

    /**
     * Is a boolean indicating if mouse events should control the relative position of a
     * clipped remote session. Only relevant if clipViewport is enabled.
     *
     * @default false
     */
    dragViewport: boolean

    /**
     * Is a boolean indicating if keyboard focus should automatically be moved to the remote
     * session when a mousedown or touchstart event is received.
     *
     * @default true
     */
    focusOnClick: boolean

    /**
     * Is an int in range [0-9] controlling the desired JPEG quality. Value 0 implies low
     * quality and 9 implies high quality.
     *
     * @default 6
     */
    qualityLevel: number

    /**
     * Is a boolean indicating if a request to resize the remote session should be sent
     * whenever the container changes dimensions.
     *
     * @default false
     */
    resizeSession: boolean

    /**
     * Is a boolean indicating if the remote session should be scaled locally so it fits its
     * container. When disabled it will be centered if the remote session is smaller than
     * its container, or handled according to clipViewport if it is larger.
     *
     * @default false
     */
    scaleViewport: boolean

    /**
     * Is a boolean indicating whether a dot cursor should be shown instead of a zero-sized
     * or fully-transparent cursor if the server sets such invisible cursor.
     *
     * @default false
     */
    showDotCursor: boolean

    /**
     * Is a boolean indicating if any events (e.g. key presses or mouse movement) should be
     * prevented from being sent to the server.
     *
     * @default false
     */
    viewOnly: boolean

    approveServer(): void
    blur(): void
    clipboardPasteFrom(text: string): void
    disconnect(): void
    focus(options?: FocusOptions): void
    getImageData(): ImageData
    machineReboot(): void
    machineReset(): void
    machineShutdown(): void
    sendCredentials(credentials: {
      username?: string
      password?: string
      target?: string
    }): void
    sendCtrlAltDel(): void
    sendKey(keysym: number, code: string, down?: boolean): void
    toBlob(
      callback: (blob: Blob) => void,
      type?: string,
      quality?: number,
    ): void
    toDataURL(type?: string, encoderOptions?: number): string

    addEventListener(
      type: "bell",
      listener: (evt: Event) => void,
      options?: boolean | AddEventListenerOptions,
    ): void
    addEventListener(
      type: "capabilities",
      listener: (evt: CapabilitiesEvent) => void,
      options?: boolean | AddEventListenerOptions,
    ): void
    addEventListener(
      type: "clipboard",
      listener: (evt: ClipboardEvent) => void,
      options?: boolean | AddEventListenerOptions,
    ): void
    addEventListener(
      type: "clippingviewport",
      listener: (evt: ClippingViewportEvent) => void,
      options?: boolean | AddEventListenerOptions,
    ): void
    addEventListener(
      type: "connect",
      listener: (evt: Event) => void,
      options?: boolean | AddEventListenerOptions,
    ): void
    addEventListener(
      type: "credentialsrequired",
      listener: (evt: CredentialsRequiredEvent) => void,
      options?: boolean | AddEventListenerOptions,
    ): void
    addEventListener(
      type: "desktopname",
      listener: (evt: DesktopNameEvent) => void,
      options?: boolean | AddEventListenerOptions,
    ): void
    addEventListener(
      type: "disconnect",
      listener: (evt: DisconnectEvent) => void,
      options?: boolean | AddEventListenerOptions,
    ): void
    addEventListener(
      type: "securityfailure",
      listener: (evt: SecurityFailureEvent) => void,
      options?: boolean | AddEventListenerOptions,
    ): void
    addEventListener(
      type: "serververification",
      listener: (evt: ServerVerificationEvent) => void,
      options?: boolean | AddEventListenerOptions,
    ): void
    addEventListener(
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions,
    ): void

    removeEventListener(
      type: "bell",
      listener: (evt: Event) => void,
      options?: boolean | EventListenerOptions,
    ): void
    removeEventListener(
      type: "capabilities",
      listener: (evt: CapabilitiesEvent) => void,
      options?: boolean | EventListenerOptions,
    ): void
    removeEventListener(
      type: "clipboard",
      listener: (evt: ClipboardEvent) => void,
      options?: boolean | EventListenerOptions,
    ): void
    removeEventListener(
      type: "clippingviewport",
      listener: (evt: ClippingViewportEvent) => void,
      options?: boolean | EventListenerOptions,
    ): void
    removeEventListener(
      type: "connect",
      listener: (evt: Event) => void,
      options?: boolean | EventListenerOptions,
    ): void
    removeEventListener(
      type: "credentialsrequired",
      listener: (evt: CredentialsRequiredEvent) => void,
      options?: boolean | EventListenerOptions,
    ): void
    removeEventListener(
      type: "desktopname",
      listener: (evt: DesktopNameEvent) => void,
      options?: boolean | EventListenerOptions,
    ): void
    removeEventListener(
      type: "disconnect",
      listener: (evt: DisconnectEvent) => void,
      options?: boolean | EventListenerOptions,
    ): void
    removeEventListener(
      type: "securityfailure",
      listener: (evt: SecurityFailureEvent) => void,
      options?: boolean | EventListenerOptions,
    ): void
    removeEventListener(
      type: "serververification",
      listener: (evt: ServerVerificationEvent) => void,
      options?: boolean | EventListenerOptions,
    ): void
    removeEventListener(
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | EventListenerOptions,
    ): void
  }

  export default RFB
}
