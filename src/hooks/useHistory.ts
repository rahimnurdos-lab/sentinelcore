import { useState, useCallback } from 'react';

export type ScanType = 'URL Scan' | 'Email Intel' | 'QR Decode' | 'Media' | 'File Scan';
export type ThreatLevel = 'Low' | 'Medium' | 'High';
export type ScanStatus = 'Clean' | 'Suspicious' | 'Blocked';

export interface HistoryEntry {
  id: string;
  type: ScanType;
  target: string;
  status: ScanStatus;
  date: string;
  threat: ThreatLevel;
}

const STORAGE_KEY = 'sentinel_history';

function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(entries: HistoryEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function useHistory() {
  const [entries, setEntries] = useState<HistoryEntry[]>(loadHistory);

  const addEntry = useCallback((entry: Omit<HistoryEntry, 'id' | 'date'>) => {
    const newEntry: HistoryEntry = {
      ...entry,
      id: Date.now().toString(),
      date: new Date().toLocaleString('ru-RU', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
      }),
    };
    setEntries(prev => {
      const updated = [newEntry, ...prev].slice(0, 50); // max 50 entries
      saveHistory(updated);
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setEntries([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { entries, addEntry, clearHistory };
}
