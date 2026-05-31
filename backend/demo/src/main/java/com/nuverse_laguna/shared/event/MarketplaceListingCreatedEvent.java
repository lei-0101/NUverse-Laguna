package com.nuverse_laguna.shared.event;

import java.util.UUID;

public record MarketplaceListingCreatedEvent(UUID sellerId, UUID listingId, String title) {}
