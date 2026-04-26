package com.koreventas.app.account;

import com.koreventas.app.account.dto.AccountResponse;
import com.koreventas.app.account.dto.ChangePasswordRequest;
import com.koreventas.app.account.dto.UpdateProfileRequest;
import com.koreventas.app.user.User;
import com.koreventas.app.user.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@RestController
@RequestMapping("/me")
public class MeController {

  private final MeService service;

  public MeController(MeService service) {
    this.service = service;
  }

  @GetMapping
  public AccountResponse get() {
    return AccountResponse.from(service.current());
  }

  @PatchMapping
  public AccountResponse update(@Valid @RequestBody UpdateProfileRequest req) {
    return AccountResponse.from(service.updateProfile(req));
  }

  @PostMapping("/password")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void changePassword(@Valid @RequestBody ChangePasswordRequest req) {
    service.changePassword(req);
  }
}

@Service
class MeService {

  private final UserRepository users;
  private final PasswordEncoder encoder;

  MeService(UserRepository users, PasswordEncoder encoder) {
    this.users = users;
    this.encoder = encoder;
  }

  /** Resuelve el usuario actual a partir del principal del JWT. */
  User current() {
    Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    UUID id;
    if (principal instanceof UUID u) id = u;
    else if (principal instanceof String s) id = UUID.fromString(s);
    else throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "No autenticado");
    return users.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no encontrado"));
  }

  @Transactional
  User updateProfile(UpdateProfileRequest req) {
    User u = current();
    // Si cambia email, validar que no esté tomado por otro usuario
    if (req.email() != null && !req.email().equalsIgnoreCase(u.getEmail())) {
      users.findByEmail(req.email()).ifPresent(other -> {
        if (!other.getId().equals(u.getId())) {
          throw new ResponseStatusException(HttpStatus.CONFLICT, "Ese correo ya está en uso");
        }
      });
    }
    u.updateProfile(req.fullName(), req.email(), req.avatarUrl());
    return users.save(u);
  }

  @Transactional
  void changePassword(ChangePasswordRequest req) {
    User u = current();
    if (!encoder.matches(req.currentPassword(), u.getPasswordHash())) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Contraseña actual incorrecta");
    }
    u.changePassword(encoder.encode(req.newPassword()));
    users.save(u);
  }
}
