export type UserRole = 'ADMIN' | 'SELLER'

export interface Account {
  id: string
  email: string
  fullName: string
  role: UserRole
  avatarUrl: string | null
  enabled: boolean
  createdAt: string
}

export interface UpdateProfileRequest {
  fullName?: string
  email?: string
  avatarUrl?: string | null
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

// Equipo (gestión de usuarios del tenant)
export interface InviteMemberRequest {
  fullName: string
  email: string
  role: UserRole
}

export interface InviteResponse {
  user: Account
  temporaryPassword: string
}

export interface UpdateMemberRequest {
  role?: UserRole
  enabled?: boolean
}
