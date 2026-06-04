import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import type { CommentEmojiCategoryId } from '../../data/commentEmojiCategories'
import { applyQuoteLines, applyWrap, insertText, type SelectionRange } from '../../lib/commentEditor'
import { CommentEmojiPicker } from './CommentEmojiPicker'

const EMOJI_PICKER_ESTIMATE_HEIGHT = 280
const EMOJI_PICKER_ESTIMATE_WIDTH = 320

type CommentFormatToolbarProps = {
  value: string
  onChange: (value: string) => void
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
}

type PickerPosition = {
  top: number
  left: number
  transform: string
}

function readSelection(textarea: HTMLTextAreaElement): SelectionRange {
  return { start: textarea.selectionStart, end: textarea.selectionEnd }
}

function restoreSelection(textarea: HTMLTextAreaElement, range: SelectionRange) {
  textarea.focus()
  textarea.setSelectionRange(range.start, range.end)
}

function getPickerPosition(anchor: HTMLElement, panel?: HTMLElement | null): PickerPosition {
  const rect = anchor.getBoundingClientRect()
  const panelHeight = panel?.offsetHeight ?? EMOJI_PICKER_ESTIMATE_HEIGHT
  const panelWidth = panel?.offsetWidth ?? EMOJI_PICKER_ESTIMATE_WIDTH
  const openUp = rect.top >= panelHeight + 12

  const left = Math.max(8, Math.min(rect.right - panelWidth, window.innerWidth - panelWidth - 8))

  if (openUp) {
    return {
      top: rect.top,
      left,
      transform: 'translateY(calc(-100% - 8px))',
    }
  }

  return {
    top: rect.bottom,
    left,
    transform: 'translateY(8px)',
  }
}

export function CommentFormatToolbar({ value, onChange, textareaRef }: CommentFormatToolbarProps) {
  const { t } = useTranslation()
  const [emojiOpen, setEmojiOpen] = useState(false)
  const [emojiCategory, setEmojiCategory] = useState<CommentEmojiCategoryId>('smileys')
  const [pickerPos, setPickerPos] = useState<PickerPosition | null>(null)
  const emojiBtnRef = useRef<HTMLButtonElement>(null)
  const emojiPanelRef = useRef<HTMLDivElement>(null)

  const syncPickerPosition = () => {
    const btn = emojiBtnRef.current
    if (!btn) return
    setPickerPos(getPickerPosition(btn, emojiPanelRef.current))
  }

  useLayoutEffect(() => {
    if (!emojiOpen) {
      setPickerPos(null)
      return
    }
    syncPickerPosition()
    const raf = requestAnimationFrame(syncPickerPosition)
    window.addEventListener('scroll', syncPickerPosition, true)
    window.addEventListener('resize', syncPickerPosition)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', syncPickerPosition, true)
      window.removeEventListener('resize', syncPickerPosition)
    }
  }, [emojiOpen, emojiCategory])

  useEffect(() => {
    if (!emojiOpen) return
    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as Node
      if (emojiPanelRef.current?.contains(target)) return
      if (emojiBtnRef.current?.contains(target)) return
      setEmojiOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [emojiOpen])

  const apply = (fn: (value: string, sel: SelectionRange) => { value: string; selection: SelectionRange }) => {
    const textarea = textareaRef.current
    if (!textarea) return
    const sel = readSelection(textarea)
    const result = fn(value, sel)
    onChange(result.value)
    requestAnimationFrame(() => restoreSelection(textarea, result.selection))
  }

  const btnClass =
    'inline-flex h-8 min-w-8 items-center justify-center rounded-md px-1.5 text-sm text-stone-500 transition hover:bg-stone-100 hover:text-stone-800'

  const resolvedPickerPos =
    pickerPos ?? (emojiBtnRef.current ? getPickerPosition(emojiBtnRef.current) : null)

  const emojiPicker =
    emojiOpen && resolvedPickerPos
      ? createPortal(
          <div
            ref={emojiPanelRef}
            className="fixed z-[200]"
            style={{
              top: resolvedPickerPos.top,
              left: resolvedPickerPos.left,
              transform: resolvedPickerPos.transform,
            }}
          >
            <CommentEmojiPicker
              activeCategory={emojiCategory}
              onCategoryChange={setEmojiCategory}
              onPick={(emoji) => {
                apply((v, s) => insertText(v, s, emoji))
                setEmojiOpen(false)
              }}
            />
          </div>,
          document.body,
        )
      : null

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex flex-wrap items-center gap-0.5">
        <button
          type="button"
          className={btnClass}
          title={t('fortressPage.formatBold')}
          aria-label={t('fortressPage.formatBold')}
          onClick={() => apply((v, s) => applyWrap(v, s, '**', '**'))}
        >
          <span className="font-bold text-stone-600">B</span>
        </button>
        <button
          type="button"
          className={btnClass}
          title={t('fortressPage.formatItalic')}
          aria-label={t('fortressPage.formatItalic')}
          onClick={() => apply((v, s) => applyWrap(v, s, '*', '*'))}
        >
          <span className="italic">I</span>
        </button>
        <button
          type="button"
          className={btnClass}
          title={t('fortressPage.formatUnderline')}
          aria-label={t('fortressPage.formatUnderline')}
          onClick={() => apply((v, s) => applyWrap(v, s, '__', '__'))}
        >
          <span className="underline decoration-stone-400">U</span>
        </button>
        <button
          type="button"
          className={btnClass}
          title={t('fortressPage.formatQuote')}
          aria-label={t('fortressPage.formatQuote')}
          onClick={() => apply(applyQuoteLines)}
        >
          <span aria-hidden className="text-base leading-none">
            ❝
          </span>
        </button>
      </div>
      <div className="shrink-0">
        <button
          ref={emojiBtnRef}
          type="button"
          className={btnClass}
          title={t('fortressPage.formatEmoji')}
          aria-label={t('fortressPage.formatEmoji')}
          aria-expanded={emojiOpen}
          onClick={() => {
            setEmojiOpen((open) => {
              if (!open) setEmojiCategory('smileys')
              return !open
            })
          }}
        >
          <span aria-hidden className="text-lg leading-none">
            😀
          </span>
        </button>
        {emojiPicker}
      </div>
    </div>
  )
}
