import { ESPLoader, Transport } from 'esptool-js';

export interface DeviceFile {
    address: number;
    data: Uint8Array;
}

export interface FlasherCallbacks {
    onLog: (message: string) => void;
    onProgress: (step: number, percentage: number) => void;
    onStateChange: (state: 'idle' | 'connecting' | 'connected' | 'flashing' | 'done' | 'error') => void;
    onSerialData?: (data: string) => void;
}

export class ESPFlasher {
    private device: SerialPort | null = null;
    private transport: Transport | null = null;
    private esploader: ESPLoader | null = null;
    private callbacks: FlasherCallbacks;
    private reader: ReadableStreamDefaultReader | null = null;
    private isReadingSerial = false;

    constructor(callbacks: FlasherCallbacks) {
        this.callbacks = callbacks;
    }

    private log(msg: string) {
        const timestamp = new Date().toLocaleTimeString();
        this.callbacks.onLog(`[${timestamp}] ${msg}`);
    }

    async connect(baudRate: number, isMonitorOnly: boolean = false) {
        try {
            this.callbacks.onStateChange('connecting');
            this.log('Requesting serial port...');

            if (this.device) {
                await this.disconnect();
            }

            this.device = await navigator.serial.requestPort();

            // For standalone monitor, we don't want the ESPLoader handshake
            if (isMonitorOnly) {
                await this.device.open({ baudRate });
                this.callbacks.onStateChange('connected');
                this.log(`Serial link established at ${baudRate} bps`);
                return true;
            }

            this.transport = new Transport(this.device);

            this.log('Connecting to bootloader...');
            this.esploader = new ESPLoader({
                transport: this.transport,
                baudrate: baudRate,
                romBaudrate: 115200,
                terminal: {
                    clean: () => { },
                    writeLine: (data: string) => this.log(data),
                    write: (data: string) => this.log(data),
                },
            });

            await this.esploader.main();
            this.callbacks.onStateChange('connected');
            this.log('Bootloader Active: ' + this.esploader.chip.CHIP_NAME);

            return true;
        } catch (err: any) {
            this.log(`Error: ${err.message}`);
            this.callbacks.onStateChange('error');
            throw err;
        }
    }

    async startReading() {
        if (!this.device || !this.device.readable) return;
        if (this.isReadingSerial) return;

        try {
            this.isReadingSerial = true;
            this.log('Starting serial monitor...');

            const decoder = new TextDecoder();

            while (this.isReadingSerial && this.device.readable) {
                // Ensure the stream is not already locked before getting a reader
                if (this.device.readable.locked) {
                    await new Promise(r => setTimeout(r, 100));
                    continue;
                }

                this.reader = this.device.readable.getReader();
                try {
                    while (true) {
                        const { value, done } = await this.reader.read();
                        if (done) break;
                        if (value) {
                            const text = decoder.decode(value);
                            this.callbacks.onSerialData?.(text);
                        }
                    }
                } catch (err: any) {
                    if (err.name !== 'AbortError') {
                        console.error('Serial Read Error:', err);
                    }
                } finally {
                    this.reader.releaseLock();
                    this.reader = null;
                }

                if (!this.isReadingSerial) break;
                await new Promise(r => setTimeout(r, 100)); // Short pause before retry
            }
        } catch (err: any) {
            if (err.name !== 'AbortError') {
                this.log(`Monitor Error: ${err.message}`);
            }
        } finally {
            this.isReadingSerial = false;
        }
    }

    async stopReading() {
        this.isReadingSerial = false;
        if (this.reader) {
            try {
                await this.reader.cancel();
            } catch (e) { }
        }
    }

    async flash(files: DeviceFile[], baudRate: number) {
        if (!this.esploader) throw new Error('Not connected');

        try {
            await this.stopReading();
            this.callbacks.onStateChange('flashing');
            this.log('Starting flash process...');

            await this.esploader.writeFlash({
                fileArray: files.map(f => ({
                    address: f.address,
                    data: Buffer.from(f.data).toString('binary'),
                })),
                flashSize: 'keep',
                flashMode: 'keep',
                flashFreq: 'keep',
                eraseAll: false,
                compress: true,
                reportProgress: (fileIndex: number, written: number, total: number) => {
                    const progress = Math.round((written / total) * 100);
                    this.callbacks.onProgress(fileIndex, progress);
                },
            });

            this.log('Flash completed successfully!');
            this.callbacks.onStateChange('done');

            // Reset the device to run the new firmware
            this.log('Resetting hardware...');
            await this.reset();

            // Critical: Disconnect and reconnect in monitor mode to release bootloader locks
            const currentBaud = baudRate;
            await this.disconnect();

            this.log('Switching to Application Monitoring...');
            setTimeout(async () => {
                try {
                    await this.connect(currentBaud, true);
                    await this.startReading();
                } catch (e) {
                    this.log('Automatic monitoring handoff failed. Please connect manually.');
                }
            }, 500);

        } catch (err: any) {
            this.log(`Flash Error: ${err.message}`);
            this.callbacks.onStateChange('error');
            throw err;
        }
    }

    async reset() {
        if (!this.transport) return;
        // Standard ESP soft-reset via DTR/RTS
        await this.transport.setDTR(false);
        await this.transport.setRTS(true);
        await new Promise(r => setTimeout(r, 100));
        await this.transport.setDTR(true);
        await this.transport.setRTS(false);
        await new Promise(r => setTimeout(r, 100));
        await this.transport.setDTR(false);
    }

    async disconnect() {
        try {
            await this.stopReading();
            if (this.transport) {
                await this.transport.disconnect();
            }
            this.device = null;
            this.transport = null;
            this.esploader = null;
            this.callbacks.onStateChange('idle');
            this.log('Disconnected');
        } catch (err: any) {
            this.log(`Disconnect Error: ${err.message}`);
        }
    }

    async sendData(data: string) {
        if (!this.device || !this.device.writable) {
            throw new Error('Port not writable');
        }

        const writer = this.device.writable.getWriter();
        try {
            const encoder = new TextEncoder();
            await writer.write(encoder.encode(data));
        } finally {
            writer.releaseLock();
        }
    }

    async writeRaw(data: Uint8Array) {
        if (!this.device || !this.device.writable) {
            throw new Error('Port not writable');
        }

        const writer = this.device.writable.getWriter();
        try {
            await writer.write(data);
        } finally {
            writer.releaseLock();
        }
    }

    isSupported() {
        return typeof navigator !== 'undefined' && 'serial' in navigator;
    }
}

export function hexToNumber(hex: string): number {
    return parseInt(hex, 16);
}
