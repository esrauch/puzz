/**
 * Player settings, saved to localStorage (TECHNICAL.md §10). Storage can be
 * unavailable (private mode, cleared by the OS), so every access is guarded
 * and the game works with the defaults.
 */

const KEY = 'puzz.settings';
const VERSION = 1;

export interface Settings {
  /** Music and sound volume (0..1). */
  volume: number;
}

const DEFAULTS: Settings = { volume: 1 };

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw) as Partial<Settings> & { version?: number };
    if (parsed.version !== VERSION) return { ...DEFAULTS };
    return { volume: typeof parsed.volume === 'number' ? parsed.volume : DEFAULTS.volume };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveSettings(settings: Settings): void {
  cachedSettings = { ...settings };
  try {
    localStorage.setItem(KEY, JSON.stringify({ version: VERSION, ...settings }));
  } catch {
    // Storage unavailable: settings last for this session only.
  }
}

let cachedSettings: Settings | null = null;

export function isSoundEnabled(): boolean {
  cachedSettings ??= loadSettings();
  return cachedSettings.volume > 0;
}

export function setSoundEnabled(enabled: boolean): void {
  saveSettings({ volume: enabled ? 1 : 0 });
}
