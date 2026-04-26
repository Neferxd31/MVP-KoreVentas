package com.koreventas.app.team.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record InviteMemberRequest(
    @NotBlank @Size(min = 2, max = 150) String fullName,
    @NotBlank @Email @Size(max = 180) String email,
    @NotBlank @Pattern(regexp = "ADMIN|SELLER", message = "Rol inválido")
    String role
) {}
