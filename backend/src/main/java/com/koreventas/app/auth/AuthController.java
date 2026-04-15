package com.koreventas.app.auth;

import com.koreventas.app.security.JwtService;
import com.koreventas.app.tenant.Tenant;
import com.koreventas.app.tenant.TenantRepository;
import com.koreventas.app.user.User;
import com.koreventas.app.user.UserRepository;
import com.koreventas.app.user.UserRole;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/auth")
public class AuthController {

  private final TenantRepository tenants;
  private final UserRepository users;
  private final PasswordEncoder encoder;
  private final JwtService jwt;

  public AuthController(TenantRepository tenants,
                        UserRepository users,
                        PasswordEncoder encoder,
                        JwtService jwt) {
    this.tenants = tenants;
    this.users = users;
    this.encoder = encoder;
    this.jwt = jwt;
  }

  // -------------------------------------------------------------------
  // Registro: crea tenant + primer usuario admin atómicamente.
  // -------------------------------------------------------------------
  @PostMapping("/register")
  @Transactional
  public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest req) {
    if (users.findByEmail(req.email()).isPresent()) {
      return ResponseEntity.badRequest().build();
    }
    Tenant tenant = tenants.save(new Tenant(UUID.randomUUID(), req.businessName(), req.businessType()));
    User user = users.save(new User(
        UUID.randomUUID(),
        tenant.getId(),
        req.email(),
        encoder.encode(req.password()),
        req.fullName(),
        UserRole.ADMIN
    ));
    return ResponseEntity.ok(new AuthResponse(jwt.issueAccessToken(user), user.getId(), tenant.getId()));
  }

  // -------------------------------------------------------------------
  // Login: email + password globalmente único.
  // -------------------------------------------------------------------
  @PostMapping("/login")
  @Transactional
  public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
    return users.findByEmail(req.email())
        .filter(u -> u.isEnabled() && encoder.matches(req.password(), u.getPasswordHash()))
        .map(u -> ResponseEntity.ok(new AuthResponse(jwt.issueAccessToken(u), u.getId(), u.getTenantId())))
        .orElseGet(() -> ResponseEntity.status(401).build());
  }

  // -------------------------------------------------------------------
  // DTOs
  // -------------------------------------------------------------------
  public record RegisterRequest(
      @NotBlank @Size(max = 150) String businessName,
      @NotBlank @Size(max = 50)  String businessType,
      @NotBlank @Size(max = 150) String fullName,
      @NotBlank @Email @Size(max = 180) String email,
      @NotBlank @Size(min = 8, max = 100) String password
  ) {}

  public record LoginRequest(
      @NotBlank @Email String email,
      @NotBlank String password
  ) {}

  public record AuthResponse(
      String accessToken,
      UUID userId,
      UUID tenantId
  ) {}
}
