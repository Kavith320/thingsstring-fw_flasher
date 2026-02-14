import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

// FileRouter for our app, can contain multiple FileRoutes
export const ourFileRouter = {
    // Define as many FileRoutes as you like, each with a unique routeSlug
    firmwareUploader: f({
        "application/octet-stream": { maxFileSize: "32MB", maxFileCount: 10 },
        "blob": { maxFileSize: "32MB", maxFileCount: 10 }
    }).onUploadComplete(async ({ file }) => {
        // Use ufsUrl for better compatibility/future-proofing
        return { fileUrl: file.ufsUrl || file.url };
    }),

    imageUploader: f({
        "image/jpeg": { maxFileSize: "8MB", maxFileCount: 1 },
        "image/png": { maxFileSize: "8MB", maxFileCount: 1 },
        "image/webp": { maxFileSize: "8MB", maxFileCount: 1 },
    }).onUploadComplete(async ({ file }) => {
        return { fileUrl: file.ufsUrl || file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
