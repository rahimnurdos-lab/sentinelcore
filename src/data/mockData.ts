export interface SecurityStatus {
  readonly status: 'safe' | 'caution' | 'danger';
  readonly title: string;
  readonly subtitle: string;
  readonly description: string;
  readonly icon: string;
  readonly actionLabel?: string;
}

export interface QuickAction {
  readonly id: string;
  readonly icon: string;
  readonly title: string;
  readonly subtitle: string;
  readonly variant: 'primary' | 'secondary' | 'default';
  readonly fullWidth?: boolean;
}

export interface VibeCheckItem {
  readonly id: string;
  readonly icon: string;
  readonly iconType?: 'single' | 'double';
  readonly secondIcon?: string;
  readonly title: string;
  readonly status: 'safe' | 'warning' | 'info';
}

export interface NavItem {
  readonly id: string;
  readonly icon: string;
  readonly label: string;
  readonly active?: boolean;
}

export interface BehaviorAnomaly {
  readonly id: string;
  readonly category: string;
  readonly title: string;
  readonly status: 'normal' | 'warning' | 'critical';
  readonly value: string;
  readonly icon: string;
}

export interface VaultItem {
  readonly id: string;
  readonly name: string;
  readonly type: 'photo' | 'video' | 'document';
  readonly size: string;
  readonly addedAt: string;
}

export interface ScanResult {
  readonly category: string;
  readonly title: string;
  readonly status: 'safe' | 'warning' | 'critical';
  readonly details: string;
  readonly icon: string;
}

export const homeSecurityStatus: SecurityStatus = {
  status: 'caution',
  title: 'Сақ болыңыз',
  subtitle: 'Қоғамдық Wi-Fi',
  description: 'Ағымдағы қосылым шифрланбаған. Жергілікті желідегі трафик көрінуі мүмкін.',
  icon: 'wifi_lock',
  actionLabel: 'VPN қосу'
};

export const homeSecurityStatusSafe: SecurityStatus = {
  status: 'safe',
  title: 'Қорғалған',
  subtitle: 'Барлығы қауіпсіз',
  description: 'Құрылғыңыз қорғалған. Ешқандай айқын қауіп анықталмады.',
  icon: 'verified_user'
};

export const quickActions: QuickAction[] = [
  {
    id: 'scan',
    icon: 'radar',
    title: 'Құрылғыны сканерлеу',
    subtitle: 'Терең эвристикалық талдау',
    variant: 'primary',
    fullWidth: true
  },
  {
    id: 'vpn',
    icon: 'vpn_key',
    title: 'VPN басқару',
    subtitle: 'Ажыратылған',
    variant: 'secondary'
  },
  {
    id: 'security-id',
    icon: 'fingerprint',
    title: 'Қауіпсіздік ID',
    subtitle: 'Расталған қойма',
    variant: 'default'
  }
];

export const vibeCheckItems: VibeCheckItem[] = [
  {
    id: 'app-permissions',
    icon: 'photo_camera',
    iconType: 'double',
    secondIcon: 'mic',
    title: '3 қолданба микрофонға және камераға рұқсат сұрап тұр',
    status: 'warning'
  },
  {
    id: 'network-traffic',
    icon: 'query_stats',
    title: 'Қалыпты трафик үлгілері анықталды',
    status: 'safe'
  }
];

export const bottomNavItems: NavItem[] = [
  { id: 'scan', icon: 'radar', label: 'Сканер', active: true },
  { id: 'threats', icon: 'security', label: 'Тексеру' },
  { id: 'vault', icon: 'lock', label: 'Қойма' },
  { id: 'settings', icon: 'settings', label: 'Параметрлер' }
];

export const behaviorAnomalies: BehaviorAnomaly[] = [
  {
    id: 'battery',
    category: 'Батарея',
    title: 'Батарея қолданылысы',
    status: 'normal',
    value: 'Қалыпты',
    icon: 'battery_full'
  },
  {
    id: 'network',
    category: 'Желі',
    title: 'Фондық желі белсенділігі',
    status: 'warning',
    value: '+15% өсім',
    icon: 'cell_tower'
  },
  {
    id: 'cpu',
    category: 'Процессор',
    title: 'CPU жүктемесі',
    status: 'normal',
    value: '23%',
    icon: 'memory'
  },
  {
    id: 'storage',
    category: 'Жады',
    title: 'Жады қолданылысы',
    status: 'normal',
    value: '45 GB / 128 GB',
    icon: 'storage'
  }
];

export const vaultItems: VaultItem[] = [
  { id: '1', name: 'Жеке куәлік.pdf', type: 'document', size: '2.3 MB', addedAt: '2026-03-15' },
  { id: '2', name: 'Банк картасы.jpg', type: 'photo', size: '1.1 MB', addedAt: '2026-03-10' },
  { id: '3', name: 'Құпия сөздер.txt', type: 'document', size: '12 KB', addedAt: '2026-03-01' }
];

export const scanResults: ScanResult[] = [
  {
    category: 'Қолданбалар',
    title: '47 қолданба тексерілді',
    status: 'safe',
    details: 'Зиянды код табылмады',
    icon: 'apps'
  },
  {
    category: 'Желі',
    title: 'Қосылым қауіпсіздігі',
    status: 'warning',
    details: 'Қоғамдық Wi-Fi анықталды',
    icon: 'wifi'
  },
  {
    category: 'Жүйе',
    title: 'Жүйе бүтіндігі',
    status: 'safe',
    details: 'Root/Jailbreak жоқ',
    icon: 'verified_user'
  },
  {
    category: 'Рұқсаттар',
    title: 'Қауіпті рұқсаттар',
    status: 'warning',
    details: '3 қолданба ескертуде',
    icon: 'admin_panel_settings'
  }
];

export const userProfile = {
  name: 'Арман',
  avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCd1OgFFLmPm6eSsPsiDtsuzGzHVbuL4py95G_amgpGphwdDI97iwa3Vz0n4sv80tekqwPLmTsb_k8FlVJUbpJsXdmlq8Wk_mUm1W98hj0VT7Ll8Y5d8LW4S0iY7aV5bk_ruC_X8ETC0Ibk3Y4cd9hWUppaskQFVP3GGH5b1WtlKuoynC7UWCR48-FJbs41vTT1kJTbeq8yox6_bbiZX9sB218QDtof2m-L24Prm6IxxWY9r2UhRJRxPBkarhcj5ak3zvkwK9K1DqM'
};
