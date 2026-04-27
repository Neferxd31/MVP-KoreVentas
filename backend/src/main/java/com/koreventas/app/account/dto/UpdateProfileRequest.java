package com.koreventas.app.account.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
    @Size(min = 2, max = 150) String fullName,
    @Email @Size(max = 180) String email,
    String avatarUrl
) {}
