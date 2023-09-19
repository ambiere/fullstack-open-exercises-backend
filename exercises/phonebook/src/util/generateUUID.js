export function generateUUID() {
  let int = parseInt(Math.random() * 100000)
  return Date.now().toString(36) + int
}
