const SLACK_API_KEYS = Object.keys(process.env)
  .filter(key => key.startsWith('SLACK_API_KEY_'))
  .map(key => process.env[key])
  .filter(Boolean) as string[];

let currentKeyIndex = 0;

export function getNextSlackToken(): string {
  if (SLACK_API_KEYS.length === 0) {
    return ''; 
  }
  const token = SLACK_API_KEYS[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % SLACK_API_KEYS.length;
  return token;
}

export function getAllSlackTokens(): string[] {
  return SLACK_API_KEYS;
}
