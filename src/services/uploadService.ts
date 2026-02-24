import { getSupabase } from '@/lib/supabase'

const supabase = getSupabase()

// ─── Upload Product Image ─────────────────────────────

export async function uploadProductImage(userId: string, file: File): Promise<string> {
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}/${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`

  const { error } = await supabase.storage
    .from('product-images')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) throw error

  return getPublicUrl('product-images', fileName)
}

// ─── Upload Multiple Product Images ───────────────────

export async function uploadProductImages(userId: string, files: File[]): Promise<string[]> {
  const results = await Promise.allSettled(files.map(file => uploadProductImage(userId, file)))
  return results
    .filter((r): r is PromiseFulfilledResult<string> => r.status === 'fulfilled')
    .map(r => r.value)
}

// ─── Upload Profile Avatar ────────────────────────────

export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}/avatar.${fileExt}`

  const { error } = await supabase.storage
    .from('profile-avatars')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true, // Overwrite existing avatar
    })

  if (error) throw error

  return getPublicUrl('profile-avatars', fileName)
}

// ─── Upload Product Video ─────────────────────────────

export async function uploadProductVideo(userId: string, file: File): Promise<string> {
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}/${Date.now()}_video.${fileExt}`

  const { error } = await supabase.storage
    .from('product-videos')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) throw error

  return getPublicUrl('product-videos', fileName)
}

// ─── Delete File ──────────────────────────────────────

export async function deleteFile(bucket: string, path: string): Promise<void> {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path])

  if (error) throw error
}

// ─── Delete Product Image ─────────────────────────────

export async function deleteProductImage(imageUrl: string): Promise<void> {
  const path = extractPathFromUrl(imageUrl, 'product-images')
  if (path) await deleteFile('product-images', path)
}

// ─── Get Public URL ───────────────────────────────────

export function getPublicUrl(bucket: string, path: string): string {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)

  return data.publicUrl
}

// ─── Helper: Extract storage path from full URL ───────

function extractPathFromUrl(url: string, bucket: string): string | null {
  const marker = `/storage/v1/object/public/${bucket}/`
  const index = url.indexOf(marker)
  if (index === -1) return null
  return url.slice(index + marker.length)
}
