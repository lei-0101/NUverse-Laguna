package com.nuverse_laguna.shared.storage;

import com.nuverse_laguna.shared.exception.AppException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

/**
 * Development storage backend that writes uploads to the local filesystem and
 * serves them as static resources under the configured public path prefix.
 */
@Service
@Slf4j
public class LocalStorageService implements StorageService {

    private final Path rootDir;
    private final String publicPrefix;
    private final FileValidator fileValidator;

    public LocalStorageService(
            @Value("${app.storage.local-dir:uploads}") String localDir,
            @Value("${app.storage.public-prefix:/uploads}") String publicPrefix,
            FileValidator fileValidator
    ) {
        this.rootDir = Paths.get(localDir).toAbsolutePath().normalize();
        this.publicPrefix = publicPrefix;
        this.fileValidator = fileValidator;
    }

    @Override
    public String store(MultipartFile file, String category) {
        ImageType type = fileValidator.validateImage(file);

        String filename = UUID.randomUUID() + "." + type.extension();
        Path categoryDir = rootDir.resolve(category).normalize();
        Path target = categoryDir.resolve(filename).normalize();

        if (!target.startsWith(rootDir)) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Invalid upload target");
        }

        try {
            Files.createDirectories(categoryDir);
            file.transferTo(target);
        } catch (IOException e) {
            log.error("Failed to store upload in category {}", category, e);
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not store the uploaded file");
        }

        return publicPrefix + "/" + category + "/" + filename;
    }

    @Override
    public void delete(String url) {
        if (url == null || url.isBlank() || !url.startsWith(publicPrefix + "/")) {
            return;
        }
        String relative = url.substring((publicPrefix + "/").length());
        Path target = rootDir.resolve(relative).normalize();

        if (!target.startsWith(rootDir)) {
            return; // refuse to follow paths escaping the storage root
        }
        try {
            Files.deleteIfExists(target);
        } catch (IOException e) {
            log.warn("Failed to delete stored file {}", url, e);
        }
    }
}
