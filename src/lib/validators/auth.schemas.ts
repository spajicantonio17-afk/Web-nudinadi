// ===========================================
// NudiNađi - Auth Validation Schemas
// ===========================================

import { z } from 'zod/v4'
import Mailchecker from 'mailchecker'

// Registration password policy: min. 8 chars, at least one uppercase,
// one lowercase and one digit. Special characters are welcome but not required.
export const registerPasswordSchema = z
  .string()
  .min(8, 'Lozinka mora imati najmanje 8 znakova.')
  .regex(/[A-Z]/, 'Lozinka mora sadržavati barem jedno veliko slovo.')
  .regex(/[a-z]/, 'Lozinka mora sadržavati barem jedno malo slovo.')
  .regex(/[0-9]/, 'Lozinka mora sadržavati barem jedan broj.')

export const registerEmailSchema = z
  .email('Neispravan email format.')
  .refine((email) => Mailchecker.isValid(email), {
    message: 'Ova email adresa nije dozvoljena. Koristi svoju stvarnu email adresu.',
  })

// Returns a checklist of which password rules currently pass — used to render
// live feedback under the password field as the user types.
export function getPasswordRuleStatus(password: string) {
  return {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasDigit: /[0-9]/.test(password),
  }
}

export function isPasswordValid(password: string): boolean {
  const status = getPasswordRuleStatus(password)
  return status.minLength && status.hasUppercase && status.hasLowercase && status.hasDigit
}

export function isDisposableEmail(email: string): boolean {
  return !Mailchecker.isValid(email)
}
