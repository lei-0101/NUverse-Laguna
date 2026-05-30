package com.nuverse_laguna.modules.marketplace.dto;

// Returned after a listing image is uploaded; the URL is then submitted in
// CreateListingRequest / UpdateListingRequest.imageUrls.
public record UploadImageResponse(String url) {}
