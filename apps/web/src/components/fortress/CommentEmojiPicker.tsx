import { useTranslation } from 'react-i18next'
import {
  COMMENT_EMOJI_CATEGORIES,
  type CommentEmojiCategoryId,
} from '../../data/commentEmojiCategories'
import { emojiToTwemojiSrc, isFlagEmoji } from '../../lib/twemoji'

function EmojiGlyph({ emoji, className }: { emoji: string; className?: string }) {
  if (!isFlagEmoji(emoji)) return <>{emoji}</>
  return (
    <img
      src={emojiToTwemojiSrc(emoji)}
      alt={emoji}
      className={className ?? 'h-[1.25em] w-[1.25em] object-contain'}
      draggable={false}
    />
  )
}

type CommentEmojiPickerProps = {
  activeCategory: CommentEmojiCategoryId
  onCategoryChange: (id: CommentEmojiCategoryId) => void
  onPick: (emoji: string) => void
}

export function CommentEmojiPicker({
  activeCategory,
  onCategoryChange,
  onPick,
}: CommentEmojiPickerProps) {
  const { t } = useTranslation()
  const category = COMMENT_EMOJI_CATEGORIES.find((c) => c.id === activeCategory) ?? COMMENT_EMOJI_CATEGORIES[0]

  return (
    <div className="flex w-[20rem] flex-col overflow-hidden rounded-xl border border-stone-200 bg-white shadow-lg shadow-stone-900/20">
      <div
        className="flex gap-0.5 overflow-x-auto border-b border-stone-100 px-1.5 py-1.5"
        role="tablist"
        aria-label={t('fortressPage.formatEmoji')}
      >
        {COMMENT_EMOJI_CATEGORIES.map((cat) => {
          const active = cat.id === activeCategory
          return (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={active}
              aria-label={t(cat.labelKey)}
              title={t(cat.labelKey)}
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-lg leading-none transition ${
                active ? 'bg-terracotta/15 ring-1 ring-terracotta/35' : 'hover:bg-stone-100'
              }`}
              onClick={() => onCategoryChange(cat.id)}
            >
              <EmojiGlyph emoji={cat.icon} />
            </button>
          )
        })}
      </div>
      <div
        className="comment-emoji-picker__grid"
        role="tabpanel"
        aria-label={t(category.labelKey)}
      >
        {category.emojis.map((emoji, index) => (
          <button
            key={`${category.id}-${index}-${emoji}`}
            type="button"
            role="option"
            onClick={() => onPick(emoji)}
          >
            <EmojiGlyph emoji={emoji} />
          </button>
        ))}
      </div>
    </div>
  )
}
