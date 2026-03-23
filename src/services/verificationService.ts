import { getSupabase } from '@/lib/supabase'
import type { Profile } from '@/lib/database.types'

const supabase = getSupabase()

// ─── Verification Steps ──────────────────────────────────
// 1/3: Account created (automatic on registration)
// 2/3: Email verified
// 3/3: Phone verified → FULLY VERIFIED (+500 XP)

export interface VerificationStatus {
  currentStep: number
  totalSteps: 3
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
  ]

  const currentStep = steps.filter(s => s.completed).length
  const isFullyVerified = currentStep === 3

  return {
    currentStep,
    totalSteps: 3,
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
    2: { title: 'Email potvrdjen!', body: 'Email potvrdjen! Verifikacija 2/3' },
    3: { title: 'Telefon potvrdjen!', body: 'Telefon potvrdjen! Verifikacija 3/3' },
  }

  const msg = messages[step]
  if (!msg) return

  await supabase.from('notifications').insert({
    user_id: userId,
    type: 'verification_step',
    title: msg.title,
    body: msg.body,
    data: { step, total: 3 },
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
