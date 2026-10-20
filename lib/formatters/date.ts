// Fixed locale and UTC so server and client render the same string (no hydration mismatch).
const shortDate = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })

export function formatDate(value: string | Date) {
  return shortDate.format(new Date(value))
}
