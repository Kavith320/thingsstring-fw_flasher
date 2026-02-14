import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import Device from '@/models/Device';
import Release from '@/models/Release';

export const dynamic = 'force-dynamic';

/**
 * OTA Check Endpoint
 * Used by devices or external dashboards to check for the latest firmware.
 * 
 * Query Params:
 * - id: The device identifier (e.g., 'aquarium-v1')
 * - version: (Optional) Current firmware version of the device
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const deviceId = searchParams.get('id');
        const currentVersion = searchParams.get('version');

        if (!deviceId) {
            return NextResponse.json({ error: 'Device ID required' }, { status: 400 });
        }

        await connectDB();

        // 1. Get the device model from registry
        const device = await Device.findOne({ id: deviceId });
        if (!device) {
            return NextResponse.json({ error: 'Device not found' }, { status: 404 });
        }

        // 2. Fetch all releases for this device to maintain "all firmware" history if needed,
        // but for OTA check we usually just want the latest/stable.
        // We'll use the version stored in the Device model as the "Production Target".

        const isUpdateAvailable = currentVersion !== device.version;

        return NextResponse.json({
            deviceId: device.id,
            name: device.name,
            chip: device.chip,
            latestVersion: device.version,
            updateAvailable: isUpdateAvailable,
            // Return all files associated with the production version
            files: device.files.map((f: any) => ({
                url: f.path,
                address: f.address,
                name: f.path.split('/').pop()
            }))
        });

    } catch (error: any) {
        console.error('OTA Check Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
