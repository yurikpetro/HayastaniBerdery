export type CommentEmojiCategoryId =
  | 'smileys'
  | 'gestures'
  | 'hearts'
  | 'nature'
  | 'travel'
  | 'food'
  | 'objects'
  | 'flags'

export type CommentEmojiCategory = {
  id: CommentEmojiCategoryId
  icon: string
  labelKey: `fortressPage.emojiCat.${CommentEmojiCategoryId}`
  emojis: string[]
}

export const COMMENT_EMOJI_CATEGORIES: CommentEmojiCategory[] = [
  {
    id: 'smileys',
    icon: '😀',
    labelKey: 'fortressPage.emojiCat.smileys',
    emojis: [
      '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍',
      '🤩', '😘', '😗', '☺️', '😚', '😙', '🥲', '😋', '😛', '😜', '🤪', '😝', '🤗', '🤭', '🤫',
      '🤔', '🫡', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '😌', '😔', '😪', '🤤', '😴', '😷',
      '🥳', '😎', '🤓', '🧐', '😕', '😟', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺', '😦', '😧',
      '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😩', '😫', '🥱', '😤', '😡', '🤬',
    ],
  },
  {
    id: 'gestures',
    icon: '👍',
    labelKey: 'fortressPage.emojiCat.gestures',
    emojis: [
      '👍', '👎', '👊', '✊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✌️', '🤞', '🤟',
      '🤘', '👌', '🤌', '🤏', '👈', '👉', '👆', '👇', '☝️', '✋', '🖐️', '👋', '🤚', '💪', '🦾',
      '🫶', '🤙', '🖖', '✍️', '💅',
    ],
  },
  {
    id: 'hearts',
    icon: '❤️',
    labelKey: 'fortressPage.emojiCat.hearts',
    emojis: [
      '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❤️‍🔥', '❤️‍🩹', '💕', '💞',
      '💓', '💗', '💖', '💘', '💝', '💟', '🫶', '😻', '💑', '💏',
    ],
  },
  {
    id: 'nature',
    icon: '🌿',
    labelKey: 'fortressPage.emojiCat.nature',
    emojis: [
      '🌸', '🌺', '🌻', '🌹', '🌷', '🌼', '🌿', '🍀', '🌱', '🌳', '🌲', '🍃', '🍂', '🍁', '⛰️',
      '🏔️', '🌄', '🌅', '🌇', '🌆', '🌃', '⭐', '🌟', '✨', '💫', '☀️', '🌤️', '⛅', '🌧️', '⛈️',
      '❄️', '🌨️', '🌈', '🔥', '💧', '🌊', '🌙', '🌛', '🌜', '🐦', '🦅', '🐿️',
    ],
  },
  {
    id: 'travel',
    icon: '🏰',
    labelKey: 'fortressPage.emojiCat.travel',
    emojis: [
      '🏰', '🏯', '🏛️', '⛪', '🕌', '🗿', '🗽', '🗼', '🌉', '🌁', '🗺️', '🧭', '📍', '📌', '🚩',
      '🎒', '🥾', '🧳', '⛺', '🏕️', '🚶', '🚶‍♂️', '🚶‍♀️', '🧗', '🧗‍♂️', '🧗‍♀️', '🚗', '🚙', '🚌',
      '🚂', '✈️', '🛫', '🛬', '🚁', '⛵', '🚢', '🌍', '🌎', '🌏', '📷', '📸', '🔭', '🕍',
    ],
  },
  {
    id: 'food',
    icon: '🍷',
    labelKey: 'fortressPage.emojiCat.food',
    emojis: [
      '☕', '🫖', '🍵', '🧃', '🥤', '🍷', '🍺', '🥂', '🍻', '🍞', '🥐', '🧀', '🥗', '🍲', '🥘',
      '🍎', '🍇', '🍑', '🍒', '🥝', '🍰', '🎂', '🍪', '🍫', '🍯', '🧂', '🥜',
    ],
  },
  {
    id: 'objects',
    icon: '📚',
    labelKey: 'fortressPage.emojiCat.objects',
    emojis: [
      '📚', '📖', '✏️', '📝', '📜', '💡', '🎉', '🎊', '🎁', '🏆', '🥇', '🎯', '🔔', '🔑', '🗝️',
      '⚔️', '🛡️', '🏹', '🔦', '🕯️', '📿', '🎵', '🎶', '🎤', '💎', '👑', '🪙', '⏳', '⌛', '🧿',
    ],
  },
  {
    id: 'flags',
    icon: '🇦🇲',
    labelKey: 'fortressPage.emojiCat.flags',
    emojis: [
      '🇦🇲', '🇷🇺', '🇺🇸', '🇬🇧', '🇫🇷', '🇩🇪', '🇮🇹', '🇪🇸', '🇬🇪', '🇮🇷', '🇧🇾',
      '🇺🇦', '🇵🇱', '🇬🇷', '🇨🇾', '🇮🇳', '🇨🇳', '🇯🇵', '🇰🇷', '🇦🇪', '🇮🇱', '🇪🇺', '🏳️', '🏴',
    ],
  },
]
