package com.ssafy.ttomanito.global.security.utils;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;

public final class CookieUtils {
    private CookieUtils() {}

    public static void addCookie(HttpServletRequest req, HttpServletResponse res,
                                 String name, String value, long maxAgeSeconds) {
        boolean secure = isSecure(req);
        String domain = cookieDomain(req);
        String sameSite = secure ? "None" : "Lax";

        ResponseCookie.ResponseCookieBuilder builder = ResponseCookie.from(name, value)
                .httpOnly(true)
                .secure(secure)
                .sameSite(sameSite)
                .path("/")
                .maxAge(maxAgeSeconds);

        if (domain != null && !domain.isBlank()) {
            builder.domain(domain);
        }

        ResponseCookie cookie = builder.build();
        res.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    public static void deleteCookie(HttpServletRequest req, HttpServletResponse res, String name) {
        boolean secure = isSecure(req);
        String domain = cookieDomain(req);
        String sameSite = secure ? "None" : "Lax";

        // 표준(현재 전략)
        sendDelete(res, name, secure, domain, "/", sameSite);

        // 과거 변형까지 소거(선택): host-only vs domain, / vs /api
        sendDelete(res, name, secure, null,   "/",  sameSite);
        sendDelete(res, name, secure, domain, "/api", sameSite);
        sendDelete(res, name, secure, null,   "/api", sameSite);
    }

    private static void sendDelete(HttpServletResponse res, String name,
                                   boolean secure, String domain, String path, String sameSite) {
        ResponseCookie.ResponseCookieBuilder builder = ResponseCookie.from(name, "")
                .httpOnly(true)
                .secure(secure)
                .sameSite(sameSite)
                .path(path)
                .maxAge(0);

        if (domain != null && !domain.isBlank()) {
            builder.domain(domain);
        }

        ResponseCookie cookie = builder.build();
        res.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private static boolean isSecure(HttpServletRequest req) {
        String xfProto = req.getHeader("X-Forwarded-Proto");
        return "https".equalsIgnoreCase(xfProto) || req.isSecure();
    }

    private static String cookieDomain(HttpServletRequest req) {
        String host = req.getHeader("X-Forwarded-Host");
        if (host == null || host.isBlank()) host = req.getServerName();
        int colon = host.indexOf(':');
        if (colon > -1) host = host.substring(0, colon);
        return host;
    }
}
