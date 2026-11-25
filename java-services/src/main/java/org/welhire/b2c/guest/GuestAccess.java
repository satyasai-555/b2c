package org.welhire.b2c.guest;

import jakarta.servlet.http.HttpServletRequest;

import java.util.UUID;

public interface GuestAccess {

    UUID getOrCreateGuest(HttpServletRequest request);

    UUID requireActiveGuest(HttpServletRequest request);
}