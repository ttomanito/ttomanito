package com.ssafy.ttomanito.global.security.utils;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseCookie;

public final class CookieUtils {
    private CookieUtils() {}

    public static void addCookie(HttpServletRequest req, HttpServletResponse res,
                                 String name, String value, long maxAgeSeconds) {
        boolean isLocal = "localhost".equalsIgnoreCase(req.getServerName())
                || "127.0.0.1".equals(req.getServerName());
        ResponseCookie cookie = ResponseCookie.from(name, value)
                .httpOnly(true)
                .secure(!isLocal)
                .sameSite(isLocal ? "Lax" : "None")
                .path("/")
                .maxAge(maxAgeSeconds)
                .build();
        res.addHeader(org.springframework.http.HttpHeaders.SET_COOKIE, cookie.toString());
    }

    public static void deleteCookie(HttpServletRequest req, HttpServletResponse res, String name) {
        boolean isLocal = "localhost".equalsIgnoreCase(req.getServerName())
                || "127.0.0.1".equals(req.getServerName());
        ResponseCookie cookie = ResponseCookie.from(name, "")
                .httpOnly(true)
                .secure(!isLocal)
                .sameSite(isLocal ? "Lax" : "None")
                .path("/")
                .maxAge(0)
                .build();
        res.addHeader(org.springframework.http.HttpHeaders.SET_COOKIE, cookie.toString());
    }
}
