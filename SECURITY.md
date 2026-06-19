# EcoTrack Security Policy & Controls

This document details the security principles, input sanitization routines, threat modeling, and network hardening measures implemented in the EcoTrack application to ensure a highly resilient platform.

---

## 1. Network & HTTP Hardening

All network and HTTP-level boundaries are reinforced in Next.js configuration (`next.config.mjs`) to block malicious attacks. The following response headers are active across all endpoints:

1. **Content Security Policy (CSP)**:
   A strict whitelist of sources is defined:
   - `default-src 'self'` prevents loading unauthorized external assets.
   - `script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdnjs.cloudflare.com` limits executable scripts.
   - `connect-src 'self' https://api.open-meteo.com https://generativelanguage.googleapis.com` limits network queries.
   - `frame-ancestors 'none'` blocks clickjacking.

2. **X-Frame-Options**: Set to `DENY` to prevent clickjacking attacks by blocking the page from being rendered inside standard iframe containers.

3. **X-Content-Type-Options**: Set to `nosniff` to prevent browsers from MIME-sniffing responses away from their declared Content-Type.

4. **Strict-Transport-Security (HSTS)**:
   Configured as `max-age=63072000; includeSubDomains; preload` to force HTTPS connections across all modern browsers.

5. **Referrer-Policy**: Set to `strict-origin-when-cross-origin` to prevent data leakage during navigation.

6. **Permissions-Policy**: Set to `camera=(), microphone=(), geolocation=(self)` to disable hardware sensor permissions except local origin tracking.

---

## 2. Threat Modeling & Protections

### 2.1 Cross-Site Scripting (XSS)
- **React Escaping**: React automatically escapes text values rendered in the DOM, preventing basic XSS.
- **Input Validation**: All form components apply bounds checking on input fields (e.g. username lengths, boundary constraints on numbers, and sanitizing custom journal entry descriptions).
- **No `dangerouslySetInnerHTML`**: No raw, un-sanitized HTML is output using raw injection patterns.

### 2.2 Insecure API Calls & Key Exposure
- **Local Key Storage**: API keys (such as the Gemini API Key) are stored exclusively in the user's browser context (`localStorage` settings). They are never saved, transmitted, or logged on a central server.
- **Secure Requests**: All API calls are executed over HTTPS (`https://generativelanguage.googleapis.com`).

### 2.3 Data Isolation & Privacy
- **Client-Side Storage**: User metrics, calculators, logs, and journals are stored locally in the user's browser (`localStorage`).
- **Privacy Compliance**: No Personally Identifiable Information (PII) is transmitted to the Gemini LLM. Suggestions prompts only send high-level emission numbers and aggregate quantities.

---

## 3. Secure Development Guidelines

1. **Do Not Commit Secrets**: Never commit raw API keys or environment configs to Git.
2. **Review Dependencies**: Always run `npm audit` periodically to identify and patch vulnerable libraries.
3. **Strict Validation**: Always validate user-provided parameters using strict sanitizers before storing them or feeding them to helper logic.
