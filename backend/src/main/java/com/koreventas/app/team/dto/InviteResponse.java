package com.koreventas.app.team.dto;

import com.koreventas.app.account.dto.AccountResponse;
import com.koreventas.app.user.User;

/**
 * Respuesta de invitación: incluye los datos del nuevo usuario y la
 * contraseña temporal en texto plano. El frontend la muestra UNA VEZ
 * para que el admin se la entregue al colaborador. Tras esto, el sistema
 * no la guarda — solo el hash queda en BD.
 */
public record InviteResponse(
    AccountResponse user,
    String temporaryPassword
) {
  public static InviteResponse of(User u, String tempPassword) {
    return new InviteResponse(AccountResponse.from(u), tempPassword);
  }
}
