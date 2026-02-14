import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import Device from '@/models/Device';
import Release from '@/models/Release';

export async function POST(request: Request) {
    try {
        await connectDB();
        const body = await request.json();

        // Check if ID exists
        const existingDevice = await Device.findOne({ id: body.id });
        if (existingDevice) {
            return NextResponse.json({ error: 'Device ID already exists' }, { status: 400 });
        }

        // 1. Create new device in registry
        const newDevice = await Device.create(body);

        // 2. Create the initial release entry for distribution history
        await Release.create({
            deviceId: newDevice.id,
            version: newDevice.version,
            chip: newDevice.chip,
            files: newDevice.files,
            status: 'stable',
            changelog: 'Initial Release'
        });

        return NextResponse.json({ success: true, device: newDevice });
    } catch (error: any) {
        console.error('Database Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET() {
    try {
        await connectDB();
        const devices = await Device.find({}).sort({ createdAt: -1 });
        return NextResponse.json(devices);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
