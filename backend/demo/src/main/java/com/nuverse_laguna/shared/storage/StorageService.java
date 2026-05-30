package com.nuverse_laguna.shared.storage;

import org.springframework.web.multipart.MultipartFile;

/**
 * Abstraction over file persistence. The development implementation writes to
 * the local filesystem; a production implementation (Cloudinary / Supabase
 * Storage) can be swapped in without touching callers (OCP / DIP).
 */
public interface StorageService {

    /**
     * Validates and stores an uploaded image under the given logical category
     * (e.g. {@code "avatars"}) and returns the public URL used to serve it.
     * The stored filename is generated server-side; the client filename is never
     * trusted.
     */
    String store(MultipartFile file, String category);

    /**
     * Removes a previously stored file given the public URL returned by
     * {@link #store}. No-op when the URL is null/blank or not owned by this store.
     */
    void delete(String url);
}
