package com.nuverse_laguna.shared.storage;

import com.nuverse_laguna.shared.exception.AppException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockMultipartFile;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DisplayName("FileValidator")
class FileValidatorTest {

    private static final long MAX_BYTES = 2_097_152L;
    private final FileValidator validator = new FileValidator(MAX_BYTES);

    private static final byte[] PNG = {(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0, 0};
    private static final byte[] JPEG = {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, 0, 0, 0};
    private static final byte[] WEBP = {0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50, 0};

    private MockMultipartFile file(byte[] content) {
        // The declared content type is intentionally a lie to prove detection
        // relies on magic bytes, not the client-supplied type.
        return new MockMultipartFile("file", "x.txt", "text/plain", content);
    }

    @Test
    @DisplayName("detects PNG, JPEG, and WEBP by magic bytes regardless of declared type")
    void validate_acceptsKnownFormats() {
        assertThat(validator.validateImage(file(PNG))).isEqualTo(ImageType.PNG);
        assertThat(validator.validateImage(file(JPEG))).isEqualTo(ImageType.JPEG);
        assertThat(validator.validateImage(file(WEBP))).isEqualTo(ImageType.WEBP);
    }

    @Test
    @DisplayName("rejects an empty file")
    void validate_rejectsEmpty() {
        assertThatThrownBy(() -> validator.validateImage(file(new byte[0])))
                .isInstanceOf(AppException.class)
                .extracting("status").isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    @DisplayName("rejects content whose bytes match no accepted image format")
    void validate_rejectsUnknownFormat() {
        byte[] notAnImage = {0x00, 0x01, 0x02, 0x03, 0x04, 0x05};
        assertThatThrownBy(() -> validator.validateImage(file(notAnImage)))
                .isInstanceOf(AppException.class)
                .hasMessageContaining("Unsupported");
    }

    @Test
    @DisplayName("rejects a file larger than the configured maximum")
    void validate_rejectsOversize() {
        FileValidator tinyLimit = new FileValidator(4L);
        assertThatThrownBy(() -> tinyLimit.validateImage(file(PNG)))
                .isInstanceOf(AppException.class)
                .hasMessageContaining("maximum size");
    }
}
