// All dates serialized as ISO strings so server→client props work without Timestamp objects

export interface MedicalRecord {
  id: string
  visitDate: string        // YYYY-MM-DD
  vet: string
  reason: string
  weight?: number          // lbs
  diagnosis?: string
  treatment?: string
  followUp?: string
  notes?: string
  sourceArtifact?: string  // storage path
  sourceArtifactUrl?: string // signed URL, generated at read time
  linkedMedicationIds: string[]
  createdAt: string        // ISO
}

export interface Vaccination {
  id: string
  name: string
  type: string
  givenDate: string        // YYYY-MM-DD
  expiresDate: string      // YYYY-MM-DD
}

export interface Medication {
  id: string
  name: string
  dose: string
  frequency: string
  withFood: boolean
  fillDate?: string        // YYYY-MM-DD
  refillsRemaining?: number
  instructions?: string
  active: boolean
  sourceArtifact?: string
  sourceArtifactUrl?: string
  prescribedAtRecordId?: string
  createdAt: string        // ISO
}

export interface WeightEntry {
  id: string
  date: string             // YYYY-MM-DD
  weightLbs: number
}

export interface EmergencyContact {
  id: string
  name: string
  role: string
  phone: string
  priority: number
}

export interface CareInstructions {
  feeding: string
  walks: string
  quirks: string
  whereThingsAre: string
  notes: string
  updatedAt?: string       // ISO
}

export interface InsurancePolicy {
  id: string
  provider: string
  policyNumber: string
  coverage?: string
  documentRef?: string
  createdAt: string        // ISO
}

export interface Photo {
  id: string
  storageRef: string
  storageUrl?: string      // signed URL, generated at read time
  caption?: string
  isPublic: boolean
  source: 'manual' | 'instagram'
  addedAt: string          // ISO
}

export interface ActivityEntry {
  id: string
  authorEmail: string
  timestamp: string        // ISO
  type: string
  content: string
  attachmentRef?: string
}
