package com.nuverse_laguna.modules.profile.application;

import com.nuverse_laguna.modules.profile.domain.UserProfile;
import com.nuverse_laguna.modules.profile.repository.UserProfileRepository;
import com.nuverse_laguna.shared.profile.ProfileSummary;
import com.nuverse_laguna.shared.profile.UserProfileReader;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserProfileReaderImpl implements UserProfileReader {

    private final UserProfileRepository userProfileRepository;

    @Override
    public Optional<ProfileSummary> findProfileSummary(UUID userId) {
        return userProfileRepository.findByUserId(userId)
                .map(this::toSummary);
    }

    @Override
    public Map<UUID, ProfileSummary> findProfileSummaries(Collection<UUID> userIds) {
        return userProfileRepository.findByUserIdIn(userIds).stream()
                .collect(Collectors.toMap(UserProfile::getUserId, this::toSummary));
    }

    private ProfileSummary toSummary(UserProfile profile) {
        return new ProfileSummary(profile.getUserId(), profile.getFullName(), profile.getAvatarUrl());
    }
}
