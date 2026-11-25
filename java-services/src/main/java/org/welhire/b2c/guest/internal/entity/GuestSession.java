package org.welhire.b2c.guest.internal.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.welhire.b2c.guest.internal.domain.GuestStatus;
import org.welhire.b2c.guest.exceptions.InvalidGuestCredentialException;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "guest_sessions")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class GuestSession {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 16)
    private GuestStatus status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "expires_at", nullable = false, updatable = false)
    private Instant expiresAt;

    @Version
    @Column(name = "version", nullable = false)
    private Long version;

    public static GuestSession create(
            UUID guestId,
            Instant createdAt,
            Instant expiresAt
    ) {
        Objects.requireNonNull(guestId, "guestId is required");
        Objects.requireNonNull(createdAt, "createdAt is required");
        Objects.requireNonNull(expiresAt, "expiresAt is required");

        if (!expiresAt.isAfter(createdAt)) {
            throw new IllegalArgumentException(
                    "Guest expiry must be after creation time"
            );
        }

        GuestSession guest = new GuestSession();
        guest.id = guestId;
        guest.status = GuestStatus.ACTIVE;
        guest.createdAt = createdAt;
        guest.expiresAt = expiresAt;

        return guest;
    }

    public boolean isActiveAt(Instant now) {
        Objects.requireNonNull(now, "now is required");

        return status == GuestStatus.ACTIVE
                && now.isBefore(expiresAt);
    }

    public void requireActiveAt(Instant now) {
        if (!isActiveAt(now)) {
            throw new InvalidGuestCredentialException();
        }
    }

    public void markClaimed(Instant now) {
        requireActiveAt(now);
        status = GuestStatus.CLAIMED;
    }

    public void markExpired(Instant now) {
        Objects.requireNonNull(now, "now is required");

        if (status == GuestStatus.ACTIVE
                && !now.isBefore(expiresAt)) {
            status = GuestStatus.EXPIRED;
        }
    }

    public void revoke() {
        if (status == GuestStatus.ACTIVE) {
            status = GuestStatus.REVOKED;
        }
    }
}
