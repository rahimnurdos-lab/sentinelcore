import { useState, useEffect, useCallback } from 'react';

export type SecurityState = 'safe' | 'caution' | 'danger';

export interface SecurityData {
  readonly state: SecurityState;
  readonly title: string;
  readonly subtitle: string;
  readonly description: string;
  readonly icon: string;
  readonly actionLabel?: string;
  readonly score: number;
}

const securityStates: Record<SecurityState, SecurityData> = {
  safe: {
    state: 'safe',
    title: 'Қорғалған',
    subtitle: 'ЖИ ТҮЙІНІ БЕЛСЕНДІ',
    description: 'Барлық жүйелер қалыпты. Қауіп анықталмады.',
    icon: 'verified_user',
    score: 98,
  },
  caution: {
    state: 'caution',
    title: 'Сақ болыңыз',
    subtitle: 'Қоғамдық Wi-Fi',
    description: 'Қазіргі қосылым шифрланбаған. Жергілікті трафик көрінуі мүмкін.',
    icon: 'wifi_lock',
    actionLabel: 'VPN қосу',
    score: 62,
  },
  danger: {
    state: 'danger',
    title: 'Қауіп!',
    subtitle: 'Зиянды код табылды',
    description: 'Жүйеде зиянды белсенділік анықталды. Бірден сканерлеу қажет.',
    icon: 'gpp_bad',
    actionLabel: 'Қазір сканерлеу',
    score: 12,
  },
};

export function useSecurity() {
  const [state, setStateInternal] = useState<SecurityState>('safe');

  useEffect(() => {
    const saved = localStorage.getItem('sentinel_security_state') as SecurityState;
    if (saved && securityStates[saved]) {
      setStateInternal(saved);
    }

    const handleStorage = () => {
      const updated = localStorage.getItem('sentinel_security_state') as SecurityState;
      if (updated && securityStates[updated]) {
        setStateInternal(updated);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const setState = useCallback((newState: SecurityState) => {
    setStateInternal(newState);
    localStorage.setItem('sentinel_security_state', newState);
    window.dispatchEvent(new Event('storage'));
  }, []);

  const data = securityStates[state];

  return { data, setState, allStates: securityStates };
}
