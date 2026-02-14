import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import Release from '@/models/Release';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await connectDB();

        // Find all releases for this device, sorted by newest first
        const releases = await Release.find({ deviceId: params.id })
            .sort({ createdAt: -1 });

        return NextResponse.json(releases);
    } catch (error: any) {
        console.error('Failed to fetch releases:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
