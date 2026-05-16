export type RuleSet = {
  minChars: number
  maxChars: number
  allowedPattern: string | null
  bannedTerms: string[]
  profanityFilter: boolean
}

export type ValidationResult = {
  valid: boolean
  errors: string[]
}

export function validatePlateText(
  text: string,
  rules: RuleSet[]
): ValidationResult {
  const errors: string[] = []

  if (rules.length === 0) return { valid: true, errors: [] }

  const rule = rules[0]
  const trimmed = text.trim()

  if (trimmed.length < rule.minChars) {
    errors.push(`Minimum ${rule.minChars} characters required`)
  }

  if (trimmed.length > rule.maxChars) {
    errors.push(`Maximum ${rule.maxChars} characters allowed`)
  }

  if (rule.allowedPattern && trimmed.length > 0) {
    const regex = new RegExp(rule.allowedPattern)
    if (!regex.test(trimmed)) {
      errors.push('Only letters, numbers, and spaces allowed')
    }
  }

  if (rule.bannedTerms && rule.bannedTerms.length > 0) {
    const upper = trimmed.toUpperCase()
    const found = rule.bannedTerms.find((term) =>
      upper.includes(term.toUpperCase())
    )
    if (found) {
      errors.push('This text is not permitted')
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
