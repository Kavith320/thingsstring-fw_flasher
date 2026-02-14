import mongoose, { Schema, Document } from 'mongoose';

export interface IDevice extends Document {
    id: string; // friendly id like 'aquarium-v1'
    name: string;
    chip: string;
    version: string;
    baud: number;
    description?: string;
    image?: string;
    files: {
        path: string;
        address: string;
    }[];
    createdAt: Date;
}

const DeviceSchema: Schema = new Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    chip: { type: String, required: true, default: 'esp8266' },
    version: { type: String, required: true },
    baud: { type: Number, required: true, default: 460800 },
    description: { type: String, required: false, default: '' },
    image: { type: String },
    files: [
        {
            path: { type: String, required: true },
            address: { type: String, required: true, default: '0x00000' },
        },
    ],
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Device || mongoose.model<IDevice>('Device', DeviceSchema);
