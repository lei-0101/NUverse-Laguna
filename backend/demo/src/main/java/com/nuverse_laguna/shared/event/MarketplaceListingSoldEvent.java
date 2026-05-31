package com.nuverse_laguna.shared.event;

import java.util.UUID;

public record MarketplaceListingSoldEvent(UUID sellerId, UUID listingId, String title) {}
