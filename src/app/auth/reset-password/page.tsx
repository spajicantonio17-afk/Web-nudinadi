'use client'

import { useState } from 'react'
import { getSupabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = getSupabase()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Lozinka mora imati najmanje 6 znakova')
      return
    }

    if (password !== confirmPassword) {
      setError('Lozinke se ne podudaraju')
      return
    }

    setIsLoading(true)

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    })

    if (updateError) {
      setError(updateError.message)
      setIsLoading(false)
      return
    }

    setSuccess(true)
    setTimeout(() => router.push('/'), 2000)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-[var(--c-card)] rounded-2xl p-8 max-w-md w-full text-center">
          <div className="text-4xl mb-4">
            <i className="fa-solid fa-circle-check text-green-500" />
          </div>
          <h1 className="text-xl font-bold mb-2">Lozinka promijenjena!</h1>
          <p className="text-[var(--c-text2)]">Preusmjeravanje...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-[var(--c-card)] rounded-2xl p-8 max-w-md w-full">
        <h1 className="text-xl font-bold mb-6 text-center">Nova lozinka</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-[var(--c-text2)] mb-1">Nova lozinka</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[var(--c-card-alt)] border border-[var(--c-border)] rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
              placeholder="Najmanje 6 znakova"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-[var(--c-text2)] mb-1">Potvrdi lozinku</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-[var(--c-card-alt)] border border-[var(--c-border)] rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
              placeholder="Ponovi lozinku"
              required
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full blue-gradient text-white font-semibold py-3 rounded-xl disabled:opacity-50"
          >
            {isLoading ? 'Spremanje...' : 'Spremi novu lozinku'}
          </button>
        </form>
      </div>
    </div>
  )
}
