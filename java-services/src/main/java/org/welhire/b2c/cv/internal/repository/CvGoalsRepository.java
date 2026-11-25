package org.welhire.b2c.cv.internal.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.welhire.b2c.cv.internal.entity.CvGoals;

import java.util.UUID;

public interface CvGoalsRepository extends JpaRepository<CvGoals, UUID> {
}