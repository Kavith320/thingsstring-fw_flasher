import mongoose, { Schema, Document } from 'mongoose';

export interface IRelease extends Document {
    deviceId: string; // The friendly id of the device (e.g., 'aquarium-v1')
    version: string;  // e.g., '1.0.5'
    chip: string;     // e.g., 'esp8266'
    files: {
        path: string;
        address: string;
    }[];
    status: 'stable' | 'beta' | 'archived';
    changelog?: string;
    createdAt: Date;
}

const ReleaseSchema: Schema = new Schema({
    deviceId: { type: String, required: true, index: true },
    version: { type: String, required: true },
    chip: { type: String, required: true },
    files: [
        {
            path: { type: String, required: true },
            address: { type: String, required: true, default: '0x00000' },
        },
    ],
    status: {
        type: String,
        enum: ['stable', 'beta', 'archived'],
        default: 'stable'
    },
    changelog: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
});

// Compound index to ensure unique version per device
ReleaseSchema.index({ deviceId: 1, version: 1 }, { unique: true });

export default mongoose.models.Release || mongoose.model<IRelease>('Release', ReleaseSchema);
