let debugMode = false

export function setDebugMode (value: boolean) {
  debugMode = value
}

export function log (message: string) {
  if (debugMode) {
    // eslint-disable-next-line no-console
    console.log(`${new Date().toLocaleString()}: ${message}`)
  }
}
