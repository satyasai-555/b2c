package org.welhire.b2c.guest.internal.service;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.welhire.b2c.guest.GuestAccess;
import org.welhire.b2c.guest.internal.entity.GuestSession;
import org.welhire.b2c.guest.exceptions.InvalidGuestCredentialException;
import org.welhire.b2c.guest.internal.repository.GuestSessionRepository;

import java.time.Duration;
import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

@Service
@Slf4j
public class GuestService implements GuestAccess {

    private final GuestSessionRepository guestRepository;
    private final GuestHttpSessionService httpSessionService;
    private final Duration guestLifetime;

    public GuestService(
            GuestSessionRepository guestRepository,
            GuestHttpSessionService httpSessionService,
            @Value("${app.guest.lifetime}")
            Duration guestLifetime
    ) {
        if (guestLifetime == null
                || guestLifetime.isZero()
                || guestLifetime.isNegative()) {
            throw new IllegalArgumentException(
                    "Guest lifetime must be positive"
            );
        }

        this.guestRepository = guestRepository;
        this.httpSessionService = httpSessionService;
        this.guestLifetime = guestLifetime;
    }

    @Override
    public UUID getOrCreateGuest(HttpServletRequest request) {
        Objects.requireNonNull(request, "request is required");

        var existingGuestId = httpSessionService.findGuestId(request);

        if (existingGuestId.isPresent()) {
            UUID guestId = existingGuestId.get();

            validateActiveGuest(guestId);

            log.debug("Guest session reused guestId={}", guestId);

            return guestId;
        }

        Instant now = Instant.now();
        UUID guestId = UUID.randomUUID();

        GuestSession guest = GuestSession.create(
                guestId,
                now,
                now.plus(guestLifetime)
        );

        // Repository save uses its own transaction.
        // Persist the business record before associating it with the session.
        guestRepository.save(guest);

        httpSessionService.attachGuest(request, guestId);

        log.info(
                "Guest created and associated with browser session "
                        + "guestId={} expiresAt={}",
                guestId,
                guest.getExpiresAt()
        );

        return guestId;
    }

    @Override
    public UUID requireActiveGuest(HttpServletRequest request) {
        Objects.requireNonNull(request, "request is required");

        UUID guestId = httpSessionService.requireGuestId(request);

        validateActiveGuest(guestId);

        return guestId;
    }

    private void validateActiveGuest(UUID guestId) {
        GuestSession guest = guestRepository.findById(guestId)
                .orElseThrow(() -> {
                    log.warn(
                            "Guest access rejected: record not found guestId={}",
                            guestId
                    );

                    return new InvalidGuestCredentialException();
                });

        if (!guest.isActiveAt(Instant.now())) {
            log.warn(
                    "Guest access rejected: inactive or expired "
                            + "guestId={} status={}",
                    guestId,
                    guest.getStatus()
            );

            throw new InvalidGuestCredentialException();
        }
    }
}