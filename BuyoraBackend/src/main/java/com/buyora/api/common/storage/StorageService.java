package com.buyora.api.common.storage;

public interface StorageService {
    String store(String key, byte[] content, String contentType);
    void delete(String key);
    String generatePresignedUploadUrl(String key, String contentType, int expirySeconds);
    String getPublicUrl(String key);
}
