import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
const UPLOAD_DIR = "uploads/forums";
// Ensure upload directory exists
const ensureUploadDir = async () => {
    try {
        await fs.access(UPLOAD_DIR);
    }
    catch {
        await fs.mkdir(UPLOAD_DIR, { recursive: true });
    }
};
export const uploadFile = async (file, allowedTypes = ["image/jpeg", "image/png", "application/pdf"], maxSize = 5 * 1024 * 1024 // 5MB
) => {
    await ensureUploadDir();
    // Validate type
    if (!allowedTypes.includes(file.type)) {
        throw new Error(`File type ${file.type} not allowed`);
    }
    // Validate size
    if (file.size > maxSize) {
        throw new Error(`File size too large. Max ${maxSize / 1024 / 1024}MB`);
    }
    const buffer = await file.arrayBuffer();
    const fileExtension = path.extname(file.name) || ".jpg";
    const randomName = crypto.randomBytes(16).toString("hex");
    const filename = `${randomName}${fileExtension}`;
    const filepath = path.join(UPLOAD_DIR, filename);
    await fs.writeFile(filepath, Buffer.from(buffer));
    // Construct URL (assuming static file serving is set up)
    const url = `/uploads/forums/${filename}`;
    return {
        url,
        filename,
        originalName: file.name,
    };
};
export const deleteFile = async (fileUrl) => {
    if (!fileUrl)
        return;
    const filename = path.basename(fileUrl);
    const filepath = path.join(UPLOAD_DIR, filename);
    try {
        await fs.unlink(filepath);
    }
    catch (error) {
        console.error(`Failed to delete file ${filepath}:`, error);
    }
};
