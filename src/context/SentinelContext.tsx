import React, { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';

export type LogType = 'url' | 'email' | 'qr' | 'malware' | 'system' | 'simulator';
export type LogStatus = 'clean' | 'suspicious' | 'blocked' | 'info';

export interface ThreatLog {
  id: string;
  type: LogType;
  status: LogStatus;
  message: string;
  timestamp: string;
}

export interface Stats {
  total: number;
  clean: number;
  suspicious: number;
  blocked: number;
}

export interface Course {
  id: number;
  title: string;
  category: string;
  description: string;
  progress: number;
  isLocked: boolean;
  duration: string;
  icon: string;
}

const INITIAL_COURSES: Course[] = [
  { id: 1, title: 'Фишингті ажырату өнері', category: 'Негізгі', description: 'Алаяқ хаттарды тануды, жалған сілтемелерді байқауды және әрекет етпей тұрып тексеруді үйреніңіз.', progress: 10, isLocked: false, duration: '15 мин', icon: 'phishing' },
  { id: 2, title: 'Құпия сөз қауіпсіздігі', category: 'Маңызды', description: 'Мықты пароль құру, пароль менеджерін пайдалану және екі факторлы қорғауды қосу қағидаларын меңгеріңіз.', progress: 0, isLocked: false, duration: '20 мин', icon: 'password' },
  { id: 3, title: 'Әлеуметтік инженерия', category: 'Психология', description: 'Киберқылмыскерлердің кодтан бұрын адамға әсер ететінін түсініп, манипуляция тәсілдерін ажыратыңыз.', progress: 0, isLocked: true, duration: '25 мин', icon: 'psychology' },
  { id: 4, title: 'Деректердің ағып кетуі', category: 'Про', description: 'Жеке мәліметтер таралып кеткен жағдайда не істеу керегін, тәуекелді азайту мен әрекет жоспарын үйреніңіз.', progress: 0, isLocked: true, duration: '30 мин', icon: 'data_loss_prevention' },
  { id: 5, title: 'Ашық Wi-Fi қауіптері', category: 'Жолда', description: 'Қоғамдық желілерді қауіпсіз қолдану, MITM шабуылдарын түсіну және VPN қолдану негіздерін біліңіз.', progress: 0, isLocked: true, duration: '10 мин', icon: 'wifi_tethering_error' }
];

const STORAGE_KEY = 'sentinel-state-v2';

interface PersistedState {
  stats: Stats;
  threatLogs: ThreatLog[];
  courses: Course[];
  userScore: number;
  selectedCourseId: number;
}

export interface SentinelContextType {
  stats: Stats;
  threatLogs: ThreatLog[];
  courses: Course[];
  userScore: number;
  selectedCourseId: number;
  addThreatLog: (log: Omit<ThreatLog, 'id' | 'timestamp'>) => void;
  unlockCourse: (courseId: number) => void;
  selectCourse: (courseId: number) => void;
  updateCourseProgress: (courseId: number, progress: number) => void;
  updateUserScore: (scoreDelta: number) => void;
}

const SentinelContext = createContext<SentinelContextType | undefined>(undefined);

const createTimeLabel = () => new Date().toLocaleTimeString('kk-KZ', { hour: '2-digit', minute: '2-digit' });
const createId = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`);

const getInitialState = (): PersistedState => {
  if (typeof window !== 'undefined') {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved) as PersistedState;
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
  }

  return {
    stats: { total: 8, clean: 5, suspicious: 2, blocked: 1 },
    threatLogs: [{ id: 'start-1', type: 'system', status: 'info', message: 'Sentinel жүйесі іске қосылды', timestamp: createTimeLabel() }],
    courses: INITIAL_COURSES,
    userScore: 0,
    selectedCourseId: 1
  };
};

export const SentinelProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const initialState = getInitialState();
  const [stats, setStats] = useState<Stats>(initialState.stats);
  const [threatLogs, setThreatLogs] = useState<ThreatLog[]>(initialState.threatLogs);
  const [courses, setCourses] = useState<Course[]>(initialState.courses);
  const [userScore, setUserScore] = useState<number>(initialState.userScore);
  const [selectedCourseId, setSelectedCourseId] = useState<number>(initialState.selectedCourseId);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ stats, threatLogs, courses, userScore, selectedCourseId } satisfies PersistedState));
  }, [stats, threatLogs, courses, userScore, selectedCourseId]);

  const addThreatLog = useCallback((log: Omit<ThreatLog, 'id' | 'timestamp'>) => {
    const newLog: ThreatLog = { ...log, id: createId(), timestamp: createTimeLabel() };
    setThreatLogs((prev) => [newLog, ...prev].slice(0, 50));
    setStats((prev) => ({
      total: prev.total + 1,
      clean: prev.clean + (log.status === 'clean' ? 1 : 0),
      suspicious: prev.suspicious + (log.status === 'suspicious' ? 1 : 0),
      blocked: prev.blocked + (log.status === 'blocked' ? 1 : 0)
    }));
  }, []);

  const unlockCourse = useCallback((courseId: number) => {
    setCourses((prev) => prev.map((course) => (course.id === courseId ? { ...course, isLocked: false } : course)));
  }, []);

  const selectCourse = useCallback((courseId: number) => {
    setSelectedCourseId(courseId);
  }, []);

  const updateCourseProgress = useCallback((courseId: number, progress: number) => {
    setCourses((prev) => prev.map((course) => (course.id === courseId ? { ...course, progress: Math.max(course.progress, Math.min(progress, 100)) } : course)));
  }, []);

  const updateUserScore = useCallback((scoreDelta: number) => {
    setUserScore((prev) => Math.max(0, prev + scoreDelta));
  }, []);

  return (
    <SentinelContext.Provider value={{ stats, threatLogs, courses, userScore, selectedCourseId, addThreatLog, unlockCourse, selectCourse, updateCourseProgress, updateUserScore }}>
      {children}
    </SentinelContext.Provider>
  );
};

export const useSentinel = () => {
  const context = useContext(SentinelContext);
  if (context === undefined) {
    throw new Error('useSentinel must be used within a SentinelProvider');
  }
  return context;
};
