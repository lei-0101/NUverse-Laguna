package com.nuverse_laguna.shared.profile;

import java.util.Collection;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

// DIP boundary: modules that need to display user identity inject this interface,
// not the profile module's repository. The profile module provides the implementation.
public interface UserProfileReader {
    Optional<ProfileSummary> findProfileSummary(UUID userId);
    Map<UUID, ProfileSummary> findProfileSummaries(Collection<UUID> userIds);
}
