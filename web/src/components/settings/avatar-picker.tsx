import { useRef, useState, type ChangeEvent } from 'react'
import { Camera, Trash2, Loader2, type LucideIcon } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/language-context'

interface AvatarOption {
  id: string
  icon: LucideIcon
  label: string
}

interface AvatarPickerProps {
  options: AvatarOption[]
  selected: string
  onSelect: (id: string) => void
  image?: string | null
  onImageUpload: (dataUrl: string) => void | Promise<void>
  onImageRemove: () => void | Promise<void>
}

const MAX_DIMENSION = 320
const JPEG_QUALITY = 0.85
const MAX_SOURCE_BYTES = 8 * 1024 * 1024 // 8MB — plenty for a phone photo before we resize it down

function readFileAsImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Could not read file'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('Invalid image'))
      img.onload = () => resolve(img)
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  })
}

// Downscales + center-crops to a square JPEG data URL so we can store it
// directly on the user record without needing separate file storage.
function resizeToSquareDataUrl(img: HTMLImageElement): string {
  const size = Math.min(MAX_DIMENSION, img.width, img.height) || MAX_DIMENSION
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas not supported')

  const sourceSize = Math.min(img.width, img.height)
  const sx = (img.width - sourceSize) / 2
  const sy = (img.height - sourceSize) / 2
  ctx.drawImage(img, sx, sy, sourceSize, sourceSize, 0, 0, size, size)

  return canvas.toDataURL('image/jpeg', JPEG_QUALITY)
}

export function AvatarPicker({
  options,
  selected,
  onSelect,
  image,
  onImageUpload,
  onImageRemove,
}: AvatarPickerProps) {
  const { t } = useLanguage()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  const SelectedIcon = options.find((o) => o.id === selected)?.icon

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setError('')

    if (!file.type.startsWith('image/')) {
      setError(t('settingsPage.imageTypeError'))
      return
    }
    if (file.size > MAX_SOURCE_BYTES) {
      setError(t('settingsPage.imageSizeError'))
      return
    }

    setPending(true)
    try {
      const img = await readFileAsImage(file)
      const dataUrl = resizeToSquareDataUrl(img)
      await onImageUpload(dataUrl)
    } catch {
      setError(t('settingsPage.imageUploadError'))
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="mt-4">
      <div className="flex items-center gap-4">
        <div className="relative flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[var(--gold)] bg-[rgba(232,184,75,0.15)] text-[var(--gold)]">
          {pending ? (
            <Loader2 size={22} className="animate-spin" />
          ) : image ? (
            <img src={image} alt="" className="h-full w-full object-cover" />
          ) : (
            SelectedIcon && <SelectedIcon size={30} />
          )}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={pending}
              className="flex items-center gap-1.5 rounded-[10px] border border-white/[0.15] bg-white/[0.06] px-3.5 py-2 text-sm font-medium text-white transition-colors hover:border-[rgba(232,184,75,0.5)] hover:bg-white/[0.1] disabled:opacity-50"
            >
              <Camera size={15} /> {t('settingsPage.uploadPhoto')}
            </button>
            {image && (
              <button
                type="button"
                onClick={() => onImageRemove()}
                disabled={pending}
                className="flex items-center gap-1.5 rounded-[10px] border border-white/[0.12] px-3.5 py-2 text-sm font-medium text-[var(--text-muted)] transition-colors hover:border-red-600/40 hover:text-[#fc8181] disabled:opacity-50"
              >
                <Trash2 size={15} /> {t('settingsPage.removePhoto')}
              </button>
            )}
          </div>
          <p className="text-[0.78rem] text-[var(--text-muted)]">{t('settingsPage.photoHint')}</p>
          {error && <p className="text-[0.78rem] font-medium text-[#fc8181]">{error}</p>}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      <p className="mb-2 mt-5 text-[0.82rem] text-[var(--text-muted)]">
        {t('settingsPage.defaultPhotosLabel')}
      </p>
      <div
        role="radiogroup"
        aria-label={t('settingsPage.defaultPhotosLabel')}
        className="grid grid-cols-[repeat(auto-fill,minmax(52px,1fr))] gap-2"
      >
        {options.map((option) => {
          const isSelected = !image && option.id === selected
          const Icon = option.icon
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={option.label}
              title={option.label}
              onClick={() => onSelect(option.id)}
              className={`relative aspect-square rounded-2xl border-2 flex items-center justify-center transition-all hover:scale-105 ${
                isSelected
                  ? 'border-[var(--gold)] bg-[rgba(232,184,75,0.15)] text-[var(--gold)] shadow-[0_0_0_3px_rgba(232,184,75,0.2)]'
                  : 'border-white/10 bg-white/5 text-white/70 hover:border-[rgba(232,184,75,0.5)] hover:bg-[rgba(232,184,75,0.08)] hover:text-white'
              }`}
            >
              <Icon size={20} />
              {isSelected && (
                <span className="absolute top-0.5 right-1 text-[0.55rem] font-bold text-[var(--gold)]">
                  ✓
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
