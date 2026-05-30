package com.nuverse_laguna.shared.storage;

import com.nuverse_laguna.shared.exception.AppException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

/**
 * Validates uploaded image files: presence, size ceiling, and real format
 * (via magic bytes). Never trusts the client-declared content type or filename.
 */
@Component
public class FileValidator {

    private final long maxImageBytes;

    public FileValidator(@Value("${app.storage.max-image-bytes:2097152}") long maxImageBytes) {
        this.maxImageBytes = maxImageBytes;
    }

    /**
     * Validates the file and returns its detected {@link ImageType}.
     * Throws {@link AppException} (400) on any violation.
     */
    public ImageType validateImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "No file was uploaded");
        }
        if (file.getSize() > maxImageBytes) {
            throw new AppException(HttpStatus.BAD_REQUEST,
                    "Image exceeds the maximum size of " + (maxImageBytes / 1024 / 1024) + " MB");
        }

        ImageType type = ImageType.detect(readHeader(file));
        if (type == null) {
            throw new AppException(HttpStatus.BAD_REQUEST,
                    "Unsupported image format. Allowed: JPG, PNG, WEBP");
        }
        return type;
    }

    private byte[] readHeader(MultipartFile file) {
        try {
            byte[] content = file.getBytes();
            int length = Math.min(content.length, 16);
            byte[] header = new byte[length];
            System.arraycopy(content, 0, header, 0, length);
            return header;
        } catch (IOException e) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Could not read the uploaded file");
        }
    }
}
