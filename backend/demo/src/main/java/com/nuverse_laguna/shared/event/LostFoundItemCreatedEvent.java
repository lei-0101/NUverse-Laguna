package com.nuverse_laguna.shared.event;

import java.util.UUID;

public record LostFoundItemCreatedEvent(UUID reporterId, UUID itemId, String title) {}
