package com.nuverse_laguna.shared.storage;

import java.util.Arrays;

/**
 * Image formats accepted for upload, identified by magic bytes rather than the
 * client-declared content type (which is trivially spoofable).
 */
public enum ImageType {

    JPEG("jpg", "image/jpeg", new byte[]{(byte) 0xFF, (byte) 0xD8, (byte) 0xFF}),
    PNG("png", "image/png", new byte[]{(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A}),
    WEBP("webp", "image/webp", null); // detected via the RIFF/WEBP container below

    private final String extension;
    private final String contentType;
    private final byte[] signature;

    ImageType(String extension, String contentType, byte[] signature) {
        this.extension = extension;
        this.contentType = contentType;
        this.signature = signature;
    }

    public String extension() {
        return extension;
    }

    public String contentType() {
        return contentType;
    }

    /**
     * Detects the image type from the leading bytes of the file content,
     * or {@code null} if the content matches none of the accepted formats.
     */
    public static ImageType detect(byte[] header) {
        if (header == null) {
            return null;
        }
        if (isWebp(header)) {
            return WEBP;
        }
        for (ImageType type : values()) {
            if (type.signature != null && startsWith(header, type.signature)) {
                return type;
            }
        }
        return null;
    }

    private static boolean isWebp(byte[] header) {
        // RIFF....WEBP container: "RIFF" at offset 0 and "WEBP" at offset 8.
        return header.length >= 12
                && startsWith(header, new byte[]{0x52, 0x49, 0x46, 0x46})
                && header[8] == 0x57 && header[9] == 0x45 && header[10] == 0x42 && header[11] == 0x50;
    }

    private static boolean startsWith(byte[] data, byte[] prefix) {
        if (data.length < prefix.length) {
            return false;
        }
        return Arrays.equals(Arrays.copyOfRange(data, 0, prefix.length), prefix);
    }
}
