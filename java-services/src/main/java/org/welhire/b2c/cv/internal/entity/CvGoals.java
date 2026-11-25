package org.welhire.b2c.cv.internal.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "cv_goals")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CvGoals {

    @Id
    @Column(name = "cv_id", nullable = false, updatable = false)
    private UUID cvId;

    @Column(name = "target_role", nullable = false, length = 200)
    private String targetRole;

    @Column(name = "min_experience", nullable = false)
    private Integer minExperience;

    @Column(name = "max_experience")
    private Integer maxExperience;

    @Column(name = "preferred_location", nullable = false, length = 200)
    private String preferredLocation;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Version
    @Column(name = "version", nullable = false)
    private Long version;

    public static CvGoals create(UUID cvId) {
        var goals = new CvGoals();
        goals.cvId = Objects.requireNonNull(cvId, "cvId is required");
        return goals;
    }

    public void update(
            String targetRole,
            Integer minExperience,
            Integer maxExperience,
            String preferredLocation
    ) {
        String validatedRole = requireText(targetRole, "targetRole");
        String validatedLocation = requireText(
                preferredLocation,
                "preferredLocation"
        );

        if (minExperience == null || minExperience < 0) {
            throw new IllegalArgumentException(
                    "minExperience must be provided and cannot be negative."
            );
        }

        if (maxExperience != null && maxExperience < minExperience) {
            throw new IllegalArgumentException(
                    "maxExperience must be greater than or equal to minExperience."
            );
        }

        this.targetRole = validatedRole;
        this.minExperience = minExperience;
        this.maxExperience = maxExperience;
        this.preferredLocation = validatedLocation;
        this.updatedAt = Instant.now();
    }

    private static String requireText(String value, String field) {
        if (value == null || value.isBlank() || value.length() > 200) {
            throw new IllegalArgumentException(
                    field + " must contain 1 to 200 characters."
            );
        }

        return value.strip();
    }
}