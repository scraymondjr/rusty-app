export type AccessRole = 'owner' | 'family' | 'vet' | 'sitter'

export interface AccessRecord {
  role: AccessRole
  invitedAt: FirebaseFirestore.Timestamp
  lastSeenAt?: FirebaseFirestore.Timestamp
}

export interface SessionUser {
  email: string
  name?: string
  picture?: string
  role: AccessRole
}
