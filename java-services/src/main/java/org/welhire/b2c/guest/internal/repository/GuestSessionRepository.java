package org.welhire.b2c.guest.internal.repository;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.welhire.b2c.guest.internal.entity.GuestSession;

import java.util.Optional;
import java.util.UUID;

public interface GuestSessionRepository
        extends JpaRepository<GuestSession, UUID> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select guest
            from GuestSession guest
            where guest.id = :guestId
            """)
    Optional<GuestSession> findByIdForUpdate(
            @Param("guestId") UUID guestId
    );
}
