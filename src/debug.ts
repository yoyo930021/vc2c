let debugMode = false;

export function setDebugMode(value: boolean): void {
  debugMode = value;
}

export function log(message: string): void {
  if (!debugMode) return;
  console.log(`${new Date().toLocaleString()}: ${message}`);
}
