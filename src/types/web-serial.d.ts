// Web Serial types for TypeScript

interface SerialPort {
    requestPort(options?: SerialPortRequestOptions): Promise<SerialPort>;
    getPorts(): Promise<SerialPort[]>;
    open(options: SerialOptions): Promise<void>;
    close(): Promise<void>;
    readable: ReadableStream<Uint8Array>;
    writable: WritableStream<Uint8Array>;
    getInfo(): SerialPortInfo;
    setSignals(signals: SerialOutputSignals): Promise<void>;
    getSignals(): Promise<SerialInputSignals>;
}

interface Navigator {
    serial: {
        requestPort(options?: SerialPortRequestOptions): Promise<SerialPort>;
        getPorts(): Promise<SerialPort[]>;
        addEventListener(type: string, listener: EventListenerOrEventListenerObject): void;
        removeEventListener(type: string, listener: EventListenerOrEventListenerObject): void;
    };
}

interface SerialPortRequestOptions {
    filters?: SerialPortFilter[];
}

interface SerialPortFilter {
    usbVendorId?: number;
    usbProductId?: number;
}

interface SerialOptions {
    baudRate: number;
    dataBits?: number;
    stopBits?: number;
    parity?: string;
    bufferSize?: number;
    flowControl?: string;
}

interface SerialPortInfo {
    usbVendorId?: number;
    usbProductId?: number;
}

interface SerialOutputSignals {
    dataTerminalReady?: boolean;
    requestToSend?: boolean;
    break?: boolean;
}

interface SerialInputSignals {
    dataCarrierDetect: boolean;
    clearToSend: boolean;
    deviceReady: boolean;
    ringIndicator: boolean;
}
