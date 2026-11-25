package org.welhire.b2c.cv.internal.repository;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.welhire.b2c.cv.internal.entity.CvUpload;

import java.util.Optional;
import java.util.UUID;

public interface CvUploadRepository
        extends JpaRepository<CvUpload, UUID> {

    Optional<CvUpload> findByIdAndGuestId(
            UUID cvId,
            UUID guestId
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        select upload
        from CvUpload upload
        where upload.id = :cvId
          and upload.guestId = :guestId
        """)
    Optional<CvUpload> findOwnedUploadForUpdate(
            @Param("cvId") UUID cvId,
            @Param("guestId") UUID guestId
    );
}