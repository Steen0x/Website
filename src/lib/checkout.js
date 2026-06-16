// Shopify checkout binding.
// ----------------------------------------------------------------------------
// The buy flow is account-first: the user must be logged in, and we attach
// note_attributes.profile_id = their Supabase user id to the cart so the
// shopify-webhook binds the purchase to the right account deterministically
// (no email guessing). See agent-tasks-2026-06-15 §1.6 / §0.5.9.
//
// Branded checkout lives on the custom domain shop.tradenet.org (Shopify is the
// merchant of record; PCI stays on Shopify). The cart permalink carries the
// variant id and the attribute:
//   https://shop.tradenet.org/cart/{VARIANT_ID}:1?attributes[profile_id]={uid}
//
// VARIANT IDS pend Shopify Payments approval + Subscriptions setup. Until they
// are filled in, isCheckoutConfigured() is false and the UI keeps the waitlist
// behavior. Product ids (already known) live in the webhook allowlist; the
// website only needs the *variant* id for the cart permalink.
// ----------------------------------------------------------------------------

const CHECKOUT_DOMAIN = 'https://shop.tradenet.org'

// Fill these once the Subscriptions app is configured (one test checkout each
// surfaces the variant id). Product ids for reference:
//   monthly product 9349798396162, annual product 9349799018754.
export const PLANS = {
  monthly: { label: 'Pro — Monthly', variantId: null /* TODO */ },
  annual:  { label: 'Pro — Annual',  variantId: null /* TODO */ },
}

export function isCheckoutConfigured(plan = 'monthly') {
  return Boolean(PLANS[plan]?.variantId)
}

// Build the branded checkout URL with the profile_id binding.
export function buildCheckoutUrl(plan, profileId) {
  const variantId = PLANS[plan]?.variantId
  if (!variantId || !profileId) return null
  const attr = encodeURIComponent('attributes[profile_id]')
  return `${CHECKOUT_DOMAIN}/cart/${variantId}:1?${attr}=${encodeURIComponent(profileId)}`
}

// Manage-subscription portal (Shopify customer account). Filled when live.
export const MANAGE_SUBSCRIPTION_URL = `${CHECKOUT_DOMAIN}/account`

// Terminal download (filled when the desktop build ships a public URL).
export const TERMINAL_DOWNLOAD_URL = null
