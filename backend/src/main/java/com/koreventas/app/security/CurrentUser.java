package com.koreventas.app.security;

import com.koreventas.app.user.User;
import com.koreventas.app.user.UserRepository;
import com.koreventas.app.user.UserRole;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

/**
 * Helper único para obtener el usuario actual y validar su rol.
 * Usar siempre esto en vez de leer SecurityContextHolder en cada controller.
 */
@Component
public class CurrentUser {

  private final UserRepository users;

  public CurrentUser(UserRepository users) {
    this.users = users;
  }

  public User get() {
    Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    UUID id;
    if (principal instanceof UUID u) id = u;
    else if (principal instanceof String s) {
      try { id = UUID.fromString(s); }
      catch (Exception e) { throw unauthorized(); }
    } else throw unauthorized();
    return users.findById(id).orElseThrow(this::unauthorized);
  }

  /** Lanza 403 si el usuario actual no es ADMIN. */
  public User requireAdmin() {
    User u = get();
    if (u.getRole() != UserRole.ADMIN) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN,
          "Esta acción requiere rol de administrador");
    }
    return u;
  }

  public boolean isAdmin() {
    try {
      return get().getRole() == UserRole.ADMIN;
    } catch (Exception e) {
      return false;
    }
  }

  private ResponseStatusException unauthorized() {
    return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "No autenticado");
  }
}
