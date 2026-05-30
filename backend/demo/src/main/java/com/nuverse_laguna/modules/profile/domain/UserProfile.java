package com.nuverse_laguna.modules.profile.domain;

import com.nuverse_laguna.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "user_profiles")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserProfile extends BaseEntity {

    @Column(name = "user_id", nullable = false, unique = true)
    private UUID userId;

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column(name = "avatar_url", length = 512)
    private String avatarUrl;

    @Column(name = "bio", length = 500)
    private String bio;

    @Column(name = "course", length = 100)
    private String course;

    @Enumerated(EnumType.STRING)
    @Column(name = "year_level", length = 20)
    private YearLevel yearLevel;

    @Column(name = "interests", length = 255)
    private String interests;

    @Enumerated(EnumType.STRING)
    @Column(name = "visibility", nullable = false, length = 20)
    private ProfileVisibility visibility;

    @Column(name = "hide_marketplace_activity", nullable = false)
    private boolean hideMarketplaceActivity;

    @Column(name = "hide_chibi_showcase", nullable = false)
    private boolean hideChibiShowcase;

    public static UserProfile createFor(UUID userId, String fullName) {
        UserProfile profile = new UserProfile();
        profile.userId = userId;
        profile.fullName = fullName;
        profile.visibility = ProfileVisibility.PUBLIC;
        profile.hideMarketplaceActivity = false;
        profile.hideChibiShowcase = false;
        return profile;
    }

    public void updateDetails(String fullName, String bio, String course, YearLevel yearLevel, String interests) {
        if (fullName != null && !fullName.isBlank()) this.fullName = fullName;
        this.bio = bio;
        this.course = course;
        this.yearLevel = yearLevel;
        this.interests = interests;
    }

    public void changeVisibility(ProfileVisibility visibility) {
        this.visibility = visibility;
    }

    public void updateAvatar(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public void updatePrivacy(boolean hideMarketplaceActivity, boolean hideChibiShowcase) {
        this.hideMarketplaceActivity = hideMarketplaceActivity;
        this.hideChibiShowcase = hideChibiShowcase;
    }

    public boolean isPublic() {
        return this.visibility == ProfileVisibility.PUBLIC;
    }
}
