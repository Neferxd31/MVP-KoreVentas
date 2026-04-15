export interface RegisterRequest {
  businessName: string
  businessType: string
  fullName: string
  email: string
  password: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface AuthResponse {
  accessToken: string
  userId: string
  tenantId: string
}
