package org.welhire.b2c.guest.internal.service;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Service;
import org.welhire.b2c.guest.exceptions.InvalidGuestCredentialException;

import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

@Service
public class GuestHttpSessionService {

    private static final String GUEST_ID_ATTRIBUTE =
            "welhire.b2c.guest.id";

    public Optional<UUID> findGuestId(HttpServletRequest request) {
        Objects.requireNonNull(request, "request is required");

        // Reading a guest identity must not create a session.
        HttpSession session = request.getSession(false);

        if (session == null) {
            return Optional.empty();
        }

        try {
            Object value = session.getAttribute(GUEST_ID_ATTRIBUTE);

            if (value == null) {
                return Optional.empty();
            }

            if (!(value instanceof UUID guestId)) {
                throw new InvalidGuestCredentialException();
            }

            return Optional.of(guestId);

        } catch (IllegalStateException exception) {
            // The session may have been invalidated concurrently.
            throw new InvalidGuestCredentialException();
        }
    }

    public UUID requireGuestId(HttpServletRequest request) {
        return findGuestId(request)
                .orElseThrow(InvalidGuestCredentialException::new);
    }

    public void attachGuest(
            HttpServletRequest request,
            UUID guestId
    ) {
        Objects.requireNonNull(request, "request is required");
        Objects.requireNonNull(guestId, "guestId is required");

        // Call only from the backend guest-creation workflow.
        HttpSession session = request.getSession(true);

        try {
            Object existing =
                    session.getAttribute(GUEST_ID_ATTRIBUTE);

            if (existing != null && !guestId.equals(existing)) {
                throw new InvalidGuestCredentialException();
            }

            session.setAttribute(GUEST_ID_ATTRIBUTE, guestId);

        } catch (IllegalStateException exception) {
            throw new InvalidGuestCredentialException();
        }
    }

    public void removeGuestAssociation(HttpServletRequest request) {
        Objects.requireNonNull(request, "request is required");

        HttpSession session = request.getSession(false);

        if (session == null) {
            return;
        }

        try {
            session.removeAttribute(GUEST_ID_ATTRIBUTE);
        } catch (IllegalStateException exception) {
            // An invalidated session already has no usable association.
        }
    }
}