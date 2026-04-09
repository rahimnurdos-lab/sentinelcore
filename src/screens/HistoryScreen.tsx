import React from 'react';
import Header from '../components/Header';
import type { NavVariant } from '../components/BottomNav';
import { useHistory } from '../hooks/useHistory';

interface HistoryScreenProps {
  readonly onNavigate: (screen: NavVariant) => void;
  readonly onOpenMenu: () => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = (props) => {
  const { entries, clearHistory } = useHistory();

  const handleExport = () => {
    if (entries.length === 0) return;
    const csv = [
      'Date,Type,Target,Threat,Status',
      ...entries.map(e => `"${e.date}","${e.type}","${e.target}","${e.threat}","${e.status}"`)
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sentinel_history_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-transparent text-[#e2e2e5] font-['Manrope'] pb-6">
      <div className="md:hidden">
        <Header onOpenMenu={props.onOpenMenu} />
      </div>

      <main className="pt-24 md:pt-10 px-6 flex justify-center w-full">
        <div className="w-full max-w-5xl flex flex-col">

          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-['Space_Grotesk'] text-3xl font-black text-white uppercase tracking-tight">Операциялар Тарихы</h2>
              <p className="text-[#8d909d] text-sm mt-1">{entries.length} жазба сақталған / {entries.length} records saved</p>
            </div>
            <div className="flex gap-3">
              {entries.length > 0 && (
                <>
                  <button
                    onClick={handleExport}
                    className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl transition-colors text-sm font-bold uppercase tracking-widest text-white border border-white/10"
                  >
                    <span className="material-symbols-outlined text-[18px]">download</span>
                    CSV
                  </button>
                  <button
                    onClick={clearHistory}
                    className="flex items-center gap-2 bg-[#ef4444]/10 hover:bg-[#ef4444]/20 px-4 py-2 rounded-xl transition-colors text-sm font-bold uppercase tracking-widest text-[#ef4444] border border-[#ef4444]/20"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete_sweep</span>
                    Тазарту
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="w-full bg-[#0c1020] border border-white/5 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            {entries.length === 0 ? (
              <div className="p-16 text-center flex flex-col items-center gap-4">
                <span className="material-symbols-outlined text-5xl text-[#8d909d]/30">manage_search</span>
                <p className="text-[#8d909d] text-sm">Тарих бос. Сканерлеуді бастаңыз!</p>
                <p className="text-[#8d909d]/50 text-xs">/ History is empty. Start scanning!</p>
              </div>
            ) : (
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/5 text-[#8d909d] text-[10px] uppercase tracking-widest font-bold">
                      <th className="p-5 border-b border-white/5">Уақыты</th>
                      <th className="p-5 border-b border-white/5">Түрі</th>
                      <th className="p-5 border-b border-white/5">Нысан (Target)</th>
                      <th className="p-5 border-b border-white/5">Қауіп</th>
                      <th className="p-5 border-b border-white/5">Күйі</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm font-mono">
                    {entries.map((item) => (
                      <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-5 text-[#8d909d] whitespace-nowrap">{item.date}</td>
                        <td className="p-5 text-white whitespace-nowrap">{item.type}</td>
                        <td className="p-5 text-[#3b82f6] break-all min-w-[200px] max-w-[300px]">
                          <span className="line-clamp-1">{item.target}</span>
                        </td>
                        <td className="p-5">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${
                              item.threat === 'High' ? 'bg-[#ef4444]' :
                              item.threat === 'Medium' ? 'bg-[#eab308]' : 'bg-[#10b981]'
                            }`} />
                            <span className="text-white">{item.threat}</span>
                          </div>
                        </td>
                        <td className="p-5">
                          <span className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold ${
                            item.status === 'Clean' ? 'bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/30' :
                            item.status === 'Blocked' ? 'bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/30' :
                            'bg-[#eab308]/10 text-[#eab308] border border-[#eab308]/30'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};
export default HistoryScreen;
