export function RulesPage() {
  const rules = [
    'Every fortress has an evidence level: verified, partially verified, oral testimony, or needs research.',
    'Historical claims should be linked to sources when possible.',
    'Oral testimony from locals is allowed but must be labeled explicitly.',
    'Coordinates must include accuracy: exact, approximate, or unverified.',
    'User submissions require admin review before publication.',
    'Photos must include author/rights holder metadata.',
    'The site does not guarantee safe access to remote or border-area locations.',
  ]

  return (
    <article className="max-w-3xl space-y-4 rounded-2xl border border-stone-200 bg-white p-8">
      <h2 className="text-3xl font-bold">Moderation rules</h2>
      <ul className="list-disc space-y-2 pl-6 text-stone-700">
        {rules.map((rule) => (
          <li key={rule}>{rule}</li>
        ))}
      </ul>
    </article>
  )
}
