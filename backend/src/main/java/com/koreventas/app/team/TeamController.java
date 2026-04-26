package com.koreventas.app.team;

import com.koreventas.app.account.dto.AccountResponse;
import com.koreventas.app.team.dto.InviteMemberRequest;
import com.koreventas.app.team.dto.InviteResponse;
import com.koreventas.app.team.dto.UpdateMemberRequest;
import com.koreventas.app.tenant.TenantContext;
import com.koreventas.app.user.User;
import com.koreventas.app.user.UserRepository;
import com.koreventas.app.user.UserRole;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.util.List;
import java.util.UUID;

/**
 * Gestión del equipo del negocio. Solo accesible para ADMINs.
 */
@RestController
@RequestMapping("/team")
public class TeamController {

  private final TeamService service;

  public TeamController(TeamService service) {
    this.service = service;
  }

  @GetMapping
  public List<AccountResponse> list() {
    return service.list().stream().map(AccountResponse::from).toList();
  }

  @PostMapping("/invite")
  @ResponseStatus(HttpStatus.CREATED)
  public InviteResponse invite(@Valid @RequestBody InviteMemberRequest req) {
    return service.invite(req);
  }

  @PatchMapping("/{id}")
  public AccountResponse update(@PathVariable UUID id,
                                @Valid @RequestBody UpdateMemberRequest req) {
    return AccountResponse.from(service.update(id, req));
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void deactivate(@PathVariable UUID id) {
    service.deactivate(id);
  }
}

@Service
class TeamService {

  private static final String ALPHA = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  private final SecureRandom random = new SecureRandom();

  private final UserRepository users;
  private final PasswordEncoder encoder;

  TeamService(UserRepository users, PasswordEncoder encoder) {
    this.users = users;
    this.encoder = encoder;
  }

  private User requireAdmin() {
    Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    UUID id;
    if (principal instanceof UUID u) id = u;
    else if (principal instanceof String s) id = UUID.fromString(s);
    else throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "No autenticado");
    User me = users.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no encontrado"));
    if (me.getRole() != UserRole.ADMIN) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Solo administradores");
    }
    return me;
  }

  @Transactional(readOnly = true)
  public List<User> list() {
    requireAdmin();
    UUID tenantId = TenantContext.get();
    return users.findByTenantIdOrderByCreatedAtAsc(tenantId);
  }

  @Transactional
  public InviteResponse invite(InviteMemberRequest req) {
    requireAdmin();
    UUID tenantId = TenantContext.get();

    users.findByEmail(req.email()).ifPresent(u -> {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Ese correo ya está en uso");
    });

    String tempPassword = randomPassword(10);
    User newUser = new User(
        UUID.randomUUID(), tenantId, req.email(),
        encoder.encode(tempPassword), req.fullName(),
        UserRole.valueOf(req.role())
    );
    users.save(newUser);
    return InviteResponse.of(newUser, tempPassword);
  }

  @Transactional
  public User update(UUID id, UpdateMemberRequest req) {
    User me = requireAdmin();
    User target = users.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

    // No permitir editar usuarios de otros tenants (RLS también lo previene pero defensa en profundidad)
    if (!target.getTenantId().equals(me.getTenantId())) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No autorizado");
    }

    // Evitar que el ADMIN se autodegrade si es el único ADMIN del tenant
    if (target.getId().equals(me.getId()) && req.role() != null && !"ADMIN".equals(req.role())) {
      long admins = users.findByTenantIdOrderByCreatedAtAsc(me.getTenantId()).stream()
          .filter(u -> u.getRole() == UserRole.ADMIN && u.isEnabled())
          .count();
      if (admins <= 1) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
            "No puedes degradar al único administrador");
      }
    }

    if (req.role() != null) target.setRole(UserRole.valueOf(req.role()));
    if (req.enabled() != null) target.setEnabled(req.enabled());
    return users.save(target);
  }

  @Transactional
  public void deactivate(UUID id) {
    User me = requireAdmin();
    if (me.getId().equals(id)) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No puedes desactivarte a ti mismo");
    }
    User target = users.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
    if (!target.getTenantId().equals(me.getTenantId())) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No autorizado");
    }
    target.setEnabled(false);
    users.save(target);
  }

  private String randomPassword(int len) {
    StringBuilder sb = new StringBuilder(len);
    for (int i = 0; i < len; i++) {
      sb.append(ALPHA.charAt(random.nextInt(ALPHA.length())));
    }
    return sb.toString();
  }
}
