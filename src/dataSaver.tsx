// Data saver (low-bandwidth mode). On: no web font download (system fonts instead),
// and live feeds (news, labour force) are not fetched until the person asks; the
// bundled snapshot is shown. Starts on when the device asks to save data
// (navigator.connection.saveData, e.g. Android "Data Saver" / Chrome "Lite"),
// otherwise off; the person's choice is remembered in this browser.
// Screens other than the first are always loaded on demand (React.lazy in main.tsx).
import { createContext, useContext } from 'react';

const KEY = 'tw-data-saver';

/** The starting value: the saved choice, else the device's save-data hint. */
export function initialDataSaver(): boolean {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === 'on' || saved === 'off') return saved === 'on';
  } catch { /* storage unavailable */ }
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return Boolean(conn?.saveData);
}

export function saveDataSaver(on: boolean) {
  try { localStorage.setItem(KEY, on ? 'on' : 'off'); } catch { /* storage unavailable */ }
}

/** Load the web font only when data saver is off (once; turning it on later keeps what is already downloaded). */
export function applyFonts(on: boolean) {
  document.documentElement.classList.toggle('data-saver', on);
  if (on) return;
  void Promise.all([import('@fontsource/carlito/400.css'), import('@fontsource/carlito/700.css')]);
}

const DataSaverContext = createContext(false);
export const DataSaverProvider = DataSaverContext.Provider;
export const useDataSaver = () => useContext(DataSaverContext);
