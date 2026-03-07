import { getSupabase } from '@/lib/supabase'
import type { Profile } from '@/lib/database.types'

const supabase = getSupabase()

// ─── Verification Steps ──────────────────────────────────
// 1/5: Account created (automatic on registration)
// 2/5: Email verified
// 3/5: Phone verified
// 4/5: Location added to profile
// 5/5: Bio written → FULLY VERIFIED (+500 XP)

export interface VerificationStatus {
  currentStep: number
  totalSteps: 5
  steps: VerificationStep[]
  isFullyVerified: boolean
}

export interface VerificationStep {
  step: number
  label: string
  description: string
  completed: boolean
  icon: string
}

// ─── Calculate Verification Progress ─────────────────────

export function getVerificationStatus(profile: Profile): VerificationStatus {
  const steps: VerificationStep[] = [
    {
      step: 1,
      label: 'Registracija',
      description: 'Kreiraj racun',
      completed: true, // Always true if profile exists
      icon: 'fa-user-plus',
    },
    {
      step: 2,
      label: 'Email',
      description: 'Potvrdi email adresu',
      completed: !!profile.email_verified,
      icon: 'fa-envelope',
    },
    {
      step: 3,
      label: 'Telefon',
      description: 'Potvrdi broj telefona',
      completed: !!profile.phone_verified,
      icon: 'fa-phone',
    },
    {
      step: 4,
      label: 'Lokacija',
      description: 'Dodaj lokaciju u profil',
      completed: !!profile.location && profile.location.trim().length > 0,
      icon: 'fa-location-dot',
    },
    {
      step: 5,
      label: 'Bio',
      description: 'Napisi bio',
      completed: !!profile.bio && profile.bio.trim().length > 0,
      icon: 'fa-pen',
    },
  ]

  const currentStep = steps.filter(s => s.completed).length
  const isFullyVerified = currentStep === 5

  return {
    currentStep,
    totalSteps: 5,
    steps,
    isFullyVerified,
  }
}

// ─── Send Verification Step Notification ─────────────────

export async function sendVerificationStepNotification(
  userId: string,
  step: number
): Promise<void> {
  const messages: Record<number, { title: string; body: string }> = {
    2: { title: 'Email potvrdjen!', body: 'Email potvrdjen! Verifikacija 2/5' },
    3: { title: 'Telefon potvrdjen!', body: 'Telefon potvrdjen! Verifikacija 3/5' },
    4: { title: 'Lokacija dodana!', body: 'Lokacija dodana! Verifikacija 4/5' },
    5: { title: 'Bio dodan!', body: 'Bio dodan! Verifikacija 5/5' },
  }

  const msg = messages[step]
  if (!msg) return

  await supabase.from('notifications').insert({
    user_id: userId,
    type: 'verification_step',
    title: msg.title,
    body: msg.body,
    data: { step, total: 5 },
  })
}

// ─── Send Fully Verified Notification + XP ───────────────

export async function sendFullyVerifiedNotification(
  userId: string
): Promise<void> {
  await supabase.from('notifications').insert({
    user_id: userId,
    type: 'fully_verified',
    title: 'Potpuno verificiran!',
    body: 'Cestitamo! Tvoj racun je potpuno verificiran! +500 XP',
    data: { xp_earned: 500 },
  })
}

// ─── Check and Update Verification Progress ──────────────
// Call this after any profile update that might affect verification

export async function checkAndUpdateVerification(
  userId: string,
  previousProfile: Profile,
  updatedProfile: Profile
): Promise<void> {
  const prevStatus = getVerificationStatus(previousProfile)
  const newStatus = getVerificationStatus(updatedProfile)

  // Check each step that was just completed
  for (const step of newStatus.steps) {
    const prevStep = prevStatus.steps.find(s => s.step === step.step)
    if (step.completed && prevStep && !prevStep.completed && step.step >= 2) {
      await sendVerificationStepNotification(userId, step.step)
    }
  }

  // Check if just became fully verified
  if (newStatus.isFullyVerified && !prevStatus.isFullyVerified) {
    await sendFullyVerifiedNotification(userId)

    // Award 500 XP via user_activities
    const { data: existingXp } = await supabase
      .from('user_activities')
      .select('id')
      .eq('user_id', userId)
      .eq('activity_type', 'verification')
      .maybeSingle()

    if (!existingXp) {
      await supabase.from('user_activities').insert({
        user_id: userId,
        activity_type: 'verification',
        xp_earned: 500,
      })
    }
  }
}
