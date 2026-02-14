import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import Device from '@/models/Device';
import Release from '@/models/Release';
import { UTApi } from 'uploadthing/server';

const utapi = new UTApi();

function getFileKey(url: string | undefined | null) {
    if (!url) return null;
    if (!url.includes('utfs.io') && !url.includes('uploadthing.com')) return null;

    try {
        const cleanUrl = url.split('?')[0];
        const parts = cleanUrl.split('/');
        const key = parts[parts.length - 1];

        if (key && key.length > 4) {
            return key;
        }
        return null;
    } catch {
        return null;
    }
}

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await connectDB();
        const device = await Device.findOne({ id: params.id });
        if (!device) {
            return NextResponse.json({ error: 'Device not found' }, { status: 404 });
        }
        return NextResponse.json(device);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await connectDB();
        const body = await request.json();

        // 1. Get current state
        const oldDevice = await Device.findOne({ id: params.id });
        if (!oldDevice) {
            return NextResponse.json({ error: 'Device not found' }, { status: 404 });
        }

        // 2. Check if we are updating the firmware version
        const versionChanged = oldDevice.version !== body.version;
        const filesChanged = JSON.stringify(oldDevice.files) !== JSON.stringify(body.files);

        // 3. Update the primary device registry
        const updatedDevice = await Device.findOneAndUpdate(
            { id: params.id },
            body,
            { new: true, runValidators: true }
        );

        if (!updatedDevice) {
            return NextResponse.json({ error: 'Failed to update registry' }, { status: 404 });
        }

        // 4. If firmware changed, record this as a new Release in history
        if (versionChanged || filesChanged) {
            console.log(`[Distributor] Archiving firmware version ${updatedDevice.version} for ${params.id}`);
            try {
                await Release.create({
                    deviceId: updatedDevice.id,
                    version: updatedDevice.version,
                    chip: updatedDevice.chip,
                    files: updatedDevice.files,
                    status: 'stable',
                    changelog: body.description || 'System Update'
                });
            } catch (relError) {
                // If version already exists in releases, we just update it (or ignore)
                console.log('[Distributor] Release entry already exists or failed to create:', relError);
            }
        }

        // 5. Asset Lifecycle Management (Differential Cleanup)
        const keysToDelete: string[] = [];

        // Image Cleanup: We still delete old images as they aren't part of firmware distribution history
        if (oldDevice.image && oldDevice.image !== updatedDevice.image) {
            const key = getFileKey(oldDevice.image);
            if (key) keysToDelete.push(key);
        }

        // Firmware Cleanup: DISABLED
        // We no longer delete old firmware binaries because we want to "maintain all firmware" 
        // for the distribution service.

        if (keysToDelete.length > 0) {
            console.log(`[Lifecycle] Purging ${keysToDelete.length} orphaned visual assets`);
            await utapi.deleteFiles(keysToDelete);
        }

        return NextResponse.json({ success: true, device: updatedDevice });
    } catch (error: any) {
        console.error('Registry Update Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await connectDB();

        // Retrieve device manifest before destruction
        const deviceToDelete = await Device.findOne({ id: params.id });

        if (!deviceToDelete) {
            return NextResponse.json({ error: 'Hardware instance not found in registry' }, { status: 404 });
        }

        // Identify all remote assets requiring decommissioning
        const keysToDelete: string[] = [];

        // Extract Visual Identity key
        const imageKey = getFileKey(deviceToDelete.image);
        if (imageKey) keysToDelete.push(imageKey);

        // Extract Logic Layer (Firmware) keys
        if (deviceToDelete.files && Array.isArray(deviceToDelete.files)) {
            deviceToDelete.files.forEach((f: any) => {
                const key = getFileKey(f.path);
                if (key) keysToDelete.push(key);
            });
        }

        // 1. Permanently delete from database
        await Device.findOneAndDelete({ id: params.id });

        // 2. Terminate all remote asset links if keys were identified
        if (keysToDelete.length > 0) {
            console.log(`[Decommission] Purging all associated assets from server: ${keysToDelete.length} files`);
            // We await this to ensure the server processes the request before we return success
            await utapi.deleteFiles(keysToDelete);
        }

        return NextResponse.json({
            success: true,
            message: `Decommission successful. Removed device and ${keysToDelete.length} associated files.`
        });
    } catch (error: any) {
        console.error('Decommission Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
