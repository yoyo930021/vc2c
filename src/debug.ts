let debugMode = false

export function setDebugMode (value: boolean) {
  debugMode = value
}

export function log (message: string) {
  if (debugMode) {
    console.log(`${new Date().toLocaleString()}: ${message}`)
  }
}
