package com.nuverse_laguna.shared.event;

import java.util.UUID;

public record LostFoundItemResolvedEvent(UUID reporterId, UUID itemId) {}
