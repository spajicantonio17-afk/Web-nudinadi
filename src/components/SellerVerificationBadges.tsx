type SellerLike = Record<string, unknown> | null | undefined

interface Props {
  seller: SellerLike
  /** compact=true → smaller, inline-style (for product cards / tight spaces) */
  compact?: boolean
}

export default function SellerVerificationBadges({ seller, compact = false }: Props) {
  if (!seller) return null

  const emailVerified = !!seller.email_verified
  const phoneVerified = !!seller.phone_verified

  if (!emailVerified && !phoneVerified) return null

  if (compact) {
    return (
      <span className="inline-flex items-center gap-0.5">
        {emailVerified && (
          <i
            className="fa-solid fa-circle-check text-emerald-400 text-[10px]"
            title="Email verificiran"
            aria-label="Email verificiran"
          />
        )}
        {phoneVerified && (
          <i
            className="fa-solid fa-phone text-emerald-400 text-[10px]"
            title="Telefon verificiran"
            aria-label="Telefon verificiran"
          />
        )}
      </span>
    )
  }

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {emailVerified && (
        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-[5px] text-[9px] font-bold flex items-center gap-0.5">
          <i className="fa-solid fa-check text-[8px]" aria-hidden="true" />
          Email
        </span>
      )}
      {phoneVerified && (
        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-[5px] text-[9px] font-bold flex items-center gap-0.5">
          <i className="fa-solid fa-phone text-[8px]" aria-hidden="true" />
          Telefon
        </span>
      )}
    </div>
  )
}
