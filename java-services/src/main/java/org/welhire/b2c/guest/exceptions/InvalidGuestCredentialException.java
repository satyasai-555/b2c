package org.welhire.b2c.guest.exceptions;

public class InvalidGuestCredentialException extends RuntimeException {
    public InvalidGuestCredentialException() {
        super("Guest session is Invalid or Expired");
    }
}
