package com.nuverse_laguna.shared.event;

import java.util.UUID;

// Published by AuthServiceImpl after successful registration.
// Consumed by ProfileEventListener to auto-create the user's profile.
public record UserRegisteredEvent(UUID userId, String email, String fullName) {}
