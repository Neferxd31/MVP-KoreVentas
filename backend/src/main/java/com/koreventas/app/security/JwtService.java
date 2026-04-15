package com.koreventas.app.security;

import com.koreventas.app.user.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.UUID;

@Service
public class JwtService {

  private final SecretKey key;
  private final long accessTtlMinutes;

  public JwtService(
      @Value("${koreventas.security.jwt.secret}") String secret,
      @Value("${koreventas.security.jwt.access-ttl-minutes}") long accessTtlMinutes) {
    this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    this.accessTtlMinutes = accessTtlMinutes;
  }

  public String issueAccessToken(User user) {
    Instant now = Instant.now();
    Instant exp = now.plus(accessTtlMinutes, ChronoUnit.MINUTES);
    return Jwts.builder()
        .subject(user.getId().toString())
        .claim("tenantId", user.getTenantId().toString())
        .claim("email", user.getEmail())
        .claim("role", user.getRole().name())
        .issuedAt(Date.from(now))
        .expiration(Date.from(exp))
        .signWith(key)
        .compact();
  }

  public Claims parse(String token) {
    return Jwts.parser()
        .verifyWith(key)
        .build()
        .parseSignedClaims(token)
        .getPayload();
  }

  public UUID extractUserId(Claims claims) {
    return UUID.fromString(claims.getSubject());
  }

  public UUID extractTenantId(Claims claims) {
    return UUID.fromString(claims.get("tenantId", String.class));
  }
}
