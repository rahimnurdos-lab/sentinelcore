import { useState } from 'react';

export interface VaultFile {
  readonly id: string;
  readonly name: string;
  readonly size: string;
  readonly type: string;
  readonly icon: string;
  readonly iconBg: string;
}

const initialFiles: VaultFile[] = [
  { id: '1', name: 'Паспорт (скан)', size: '2.4 MB • PDF', type: 'passport', icon: 'identity_platform', iconBg: 'bg-[#004c8f]' },
  { id: '2', name: 'Құпия сөздер (14)', size: 'Соңғы өзгеріс: кеше', type: 'password', icon: 'password', iconBg: 'bg-[#333537]' },
];

export function useVault() {
  const [files] = useState<VaultFile[]>(initialFiles);
  const [locked, setLocked] = useState(false);

  const unlock = () => setLocked(false);
  const lock = () => setLocked(true);

  return { files, locked, unlock, lock };
}
