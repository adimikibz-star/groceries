# ADR-003: Use JWT for Authentication

## Status
**Accepted**

## Date
2026-06-11

## Context

The application requires a secure, scalable authentication mechanism that:
- Works across multiple household members
- Enables stateless API authentication
- Supports token refresh for security
- Integrates with potential Azure AD in future
- Allows for API-first architecture
- Provides secure session management

Several authentication approaches were considered.

## Decision

We have decided to use **JSON Web Tokens (JWT)** for authentication with the following approach:

### Key Decisions

1. **Access tokens** - Short-lived (24 hours) for API requests
2. **Refresh tokens** - Long-lived (7 days) for obtaining new access tokens
3. **HS256 algorithm** - HMAC with SHA-256 for token signing
4. **Bearer scheme** - Standard Authorization header format
5. **Token storage** - LocalStorage for frontend (with HTTP-only cookies as upgrade path)

## Consequences

### Positive

- **Stateless**: No need to store sessions on server, scales horizontally
- **API friendly**: Perfect for REST APIs and mobile apps
- **Standard**: Industry standard for API authentication
- **Decentralized**: Tokens can be validated without database lookup (after initial validation)
- **Flexible**: Easy to add claims and metadata to tokens
- **Scalability**: No session store needed, enables microservices
- **CORS friendly**: Works well with cross-origin requests
- **Future Azure AD**: Can be extended with Azure AD B2C integration

### Negative

- **Token revocation**: Hard to revoke tokens before expiry (partially mitigated with short expiry)
- **Token size**: Tokens are larger than session IDs (due to payload)
- **XSS vulnerability**: Vulnerable to XSS attacks if not stored securely
- **No real-time logout**: Users remain logged in until token expires
- **Complexity**: Slightly more complex than simple sessions

## Alternatives Considered

### Session-based Authentication
- **Pros**: Simpler to implement, server-side revocation possible
- **Cons**: Doesn't scale well, requires sticky sessions, not API-friendly

### OAuth2/OpenID Connect
- **Pros**: Secure, supports third-party providers, industry standard for complex auth
- **Cons**: Overkill for MVP, adds complexity, requires additional server

### API Keys
- **Pros**: Simple to implement, no expiry management
- **Cons**: Not secure for user authentication, no refresh mechanism, harder to rotate

### Azure AD B2C
- **Pros**: Enterprise grade, supports MFA, manages users centrally
- **Cons**: Overkill for MVP, adds vendor lock-in, complexity

### mTLS (Mutual TLS)
- **Pros**: Very secure, certificate-based
- **Cons**: Complex setup, not suitable for user-facing apps

## Related ADRs

- [ADR-001: Use React for Frontend](./0001-use-react-frontend.md)
- [ADR-007: Use Zustand for State Management](./0007-use-zustand-state-management.md)

## Implementation Details

### Token Structure

```json
{
  "id": "user-123",
  "email": "user@example.com",
  "name": "User Name",
  "iat": 1234567890,
  "exp": 1234571490
}
```

### Security Measures

1. **Short expiry**: Access tokens expire after 24 hours
2. **Refresh tokens**: 7-day refresh tokens for getting new access tokens
3. **HTTPS only**: All tokens transmitted over HTTPS
4. **Secure secret**: Long, random secret key for signing
5. **Rate limiting**: API endpoints rate-limited to prevent abuse

### Token Refresh Flow

1. User logs in → receives access token + refresh token
2. Access token expires → client uses refresh token to get new access token
3. Refresh token expires → user must log in again

## Future Considerations

- Upgrade to HTTP-only cookies for better XSS protection
- Implement token blacklist for immediate revocation
- Integrate with Azure AD B2C for enterprise features
- Add MFA support with TOTP/SMS
- Implement rate limiting per user

## References

- [JWT.io](https://jwt.io)
- [RFC 7519 - JSON Web Token](https://tools.ietf.org/html/rfc7519)
- [RFC 6749 - OAuth 2.0 Authorization Framework](https://tools.ietf.org/html/rfc6749)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
