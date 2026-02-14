# ESP8266 Web Firmware Flasher

A production-ready web application to flash ESP8266 firmware directly from your browser using Web Serial and `esptool-js`. Built with Next.js 14, TypeScript, and Tailwind CSS.

## Features
- **Web Serial Interfacing**: No local drivers or tools (like esptool.py) required besides the browser.
- **Device Catalog**: Easy management of different device models via JSON.
- **Real-time Logs**: Industrial-grade console log with timestamps.
- **Progress Tracking**: Visual progress bar for the flashing process.
- **Premium UI**: Modern dark-mode interface with Tailwind CSS.

## Getting Started

### Prerequisites
- Desktop browser with Web Serial API support:
  - **Google Chrome** (v89+)
  - **Microsoft Edge** (v89+)
  - **Opera** (v75+)
- A USB-to-Serial converter (CH340, CP2102, FTDI, etc.) connected to an ESP8266.

### Installation
1. Clone or download the project.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## How to use
1. Connect your ESP8266 via USB.
2. Select your device from the catalog home page.
3. Click **Connect Device** and select the appropriate serial port.
4. Once connected, click **Flash Firmware**.
5. Monitor the progress bar and log console.

## Adding New Devices

### Option 1: Using the Web UI (Recommended)
You can now add new devices directly through the application:
1. Click the **"New Device?"** card on the home page.
2. Fill in the device metadata (Name, Version, Description).
3. Drag & drop or select your `.bin` firmware file. This will use **UploadThing** to host the binary securely.
4. Click **Save to Catalog**. The device will now appear on the home page.

### Option 2: Manual Entry (For local development)
1. Create a new folder under `public/firmware/<device-id>/`.
2. Place your `firmware.bin` file inside that folder.
3. Update `public/devices.json` with the new entry:
   ```json
   {
     "id": "my-new-device",
     "name": "My New Device Name",
     "chip": "esp8266",
     "version": "1.0.0",
     "baud": 460800,
     "description": "Short description of the device.",
     "files": [{ "path": "/firmware/my-new-device/firmware.bin", "address": "0x00000" }]
   }
   ```

## Troubleshooting
- **Connection Failed**: Hold the `FLASH/GPIO0` button on your ESP8266, tap `RESET`, then release `FLASH`. This puts the chip in UART Download Mode.
- **Port Busy**: Ensure no other software (Arduino IDE, Serial Monitor, etc.) is currently using the COM port.
- **Permission Denied**: On Linux, you may need to add your user to the `dialout` group or use `sudo`.

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Flasher Engine**: esptool-js
- **Icons**: Lucide React
