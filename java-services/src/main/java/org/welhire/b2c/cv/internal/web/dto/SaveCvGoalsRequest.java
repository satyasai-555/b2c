package org.welhire.b2c.cv.internal.web.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record SaveCvGoalsRequest(
        @NotBlank
        @Size(max = 200)
        String targetRole,

        @NotNull
        @PositiveOrZero
        Integer minExperience,

        @PositiveOrZero
        Integer maxExperience,

        @NotBlank
        @Size(max = 200)
        String preferredLocation
) {
        @AssertTrue(
                message = "maxExperience must be greater than or equal to minExperience"
        )
        public boolean isExperienceRangeValid() {
                if (minExperience == null) {
                        // @NotNull reports the missing minimum.
                        return true;
                }

                if (maxExperience == null) {
                        // An open-ended range, such as 8+ years, is valid.
                        return true;
                }

                return maxExperience >= minExperience;
        }
}