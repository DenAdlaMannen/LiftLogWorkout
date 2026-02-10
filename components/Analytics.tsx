
import React, { useState, useMemo } from 'react';
import { WorkoutSession, BodyWeightEntry } from '../types.ts';
import { ChevronLeft, Scale, Activity, TrendingUp, TrendingDown, MoveRight, Calendar as CalendarIcon, Plus, ChevronRight } from 'lucide-react';

interface AnalyticsProps {
  history: WorkoutSession[];
  bodyWeightHistory: BodyWeightEntry[];
  onAddWeight: (entry: BodyWeightEntry) => void;
  onBack: () => void;
}

const Chart: React.FC<{ data: number[], labels: string[], color?: string }> = ({ data, labels, color = "#10b981" }) => {
  if (data.length < 2) return (
    <div className="flex flex-col items-center justify-center h-40 bg-slate-900/50 rounded-2xl border border-dashed border-slate-800">
      <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">More data needed</p>
    </div>
  );

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = (max - min) || 10;
  const padding = 20;
  const width = 1000;
  const height = 300;

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - padding * 2) - padding;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="bg-slate-900/50 p-6 rounded-[2rem] border border-slate-800">
      <div className="h-[200px] w-full relative">
        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="overflow-visible">
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
            className="drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]"
          />
          {data.map((val, i) => {
            const x = (i / (data.length - 1)) * width;
            const y = height - ((val - min) / range) * (height - padding * 2) - padding;
            return (
              <circle key={i} cx={x} cy={y} r="6" fill={color} className="drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]" />
            );
          })}
        </svg>
      </div>
      <div className="flex justify-between mt-4 px-2">
        <span className="text-[10px] font-black text-slate-500 uppercase">{labels[0]}</span>
        <span className="text-[10px] font-black text-slate-500 uppercase">{labels[labels.length - 1]}</span>
      </div>
    </div>
  );
};

const WorkoutCalendar: React.FC<{ history: WorkoutSession[] }> = ({ history }) => {
  const [viewDate, setViewDate] = useState(new Date());
  const workoutDays = useMemo(() => {
    return new Set(history.map(s => new Date(s.date).toDateString()));
  }, [history]);
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);
  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));
  const monthName = viewDate.toLocaleString('default', { month: 'long' });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-black uppercase tracking-tighter text-lg">{monthName} <span className="text-slate-500">{year}</span></h3>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={nextMonth} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
          <div key={d} className="text-center text-[10px] font-black text-slate-600 mb-2">{d}</div>
        ))}
        {blanks.map(i => <div key={`blank-${i}`} />)}
        {days.map(day => {
          const date = new Date(year, month, day);
          const hasWorkout = workoutDays.has(date.toDateString());
          const isToday = date.toDateString() === new Date().toDateString();
          return (
            <div 
              key={day}
              className={`aspect-square flex items-center justify-center rounded-xl text-sm font-bold transition-all border ${
                hasWorkout 
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-900/40' 
                  : isToday
                  ? 'bg-slate-800 border-slate-700 text-emerald-400'
                  : 'bg-slate-950/50 border-slate-800/50 text-slate-600'
              }`}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Analytics: React.FC<AnalyticsProps> = ({ history, bodyWeightHistory, onAddWeight, onBack }) => {
  const [newWeight, setNewWeight] = useState('');
  const totalVolumeData = useMemo(() => {
    const sessionsByDate = [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(-10);
    return {
      values: sessionsByDate.map(s => s.exercises.reduce((acc, ex) => acc + (ex.weight * ex.reps * ex.sets), 0)),
      labels: sessionsByDate.map(s => new Date(s.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }))
    };
  }, [history]);

  const weightData = useMemo(() => {
    const sortedHistory = [...bodyWeightHistory].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(-10);
    return {
      values: sortedHistory.map(h => h.weight),
      labels: sortedHistory.map(h => new Date(h.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }))
    };
  }, [bodyWeightHistory]);

  const stats = useMemo(() => {
    const sessionVolumes = history.map(s => s.exercises.reduce((acc, ex) => acc + (ex.weight * ex.reps * ex.sets), 0));
    const totalVolume = sessionVolumes.reduce((acc, v) => acc + v, 0);
    const avgVolume = history.length ? Math.round(totalVolume / history.length) : 0;
    const latestWeight = bodyWeightHistory.length ? bodyWeightHistory[bodyWeightHistory.length - 1].weight : 0;
    let workoutsPerWeek = "0";
    if (history.length > 0) {
      const dates = history.map(h => new Date(h.date).getTime());
      const minDate = Math.min(...dates);
      const maxDate = new Date().getTime();
      const diffWeeks = Math.max(1, Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24 * 7)));
      workoutsPerWeek = (history.length / diffWeeks).toFixed(1);
    }
    let trend: 'up' | 'down' | 'neutral' = 'neutral';
    if (history.length >= 2) {
      const sortedVolumes = [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(s => s.exercises.reduce((acc, ex) => acc + (ex.weight * ex.reps * ex.sets), 0));
      const lastN = 3;
      const recent = sortedVolumes.slice(-lastN);
      const past = sortedVolumes.slice(-Math.min(sortedVolumes.length, lastN * 2), -lastN);
      if (past.length > 0) {
        const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
        const pastAvg = past.reduce((a, b) => a + b, 0) / past.length;
        const diff = (recentAvg - pastAvg) / (pastAvg || 1);
        if (diff > 0.05) trend = 'up';
        else if (diff < -0.05) trend = 'down';
        else trend = 'neutral';
      }
    }
    return { totalVolume, avgVolume, latestWeight, totalWorkouts: history.length, workoutsPerWeek, trend };
  }, [history, bodyWeightHistory]);

  const handleWeightSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeight || isNaN(parseFloat(newWeight))) return;
    onAddWeight({ date: new Date().toLocaleDateString(), weight: parseFloat(newWeight) });
    setNewWeight('');
  };

  const TrendIcon = () => {
    switch (stats.trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-emerald-500 mb-2" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-rose-500 mb-2" />;
      default: return <MoveRight className="w-4 h-4 text-amber-500 mb-2" />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 bg-slate-900 border border-slate-800 rounded-full text-slate-400 hover:text-white">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-black italic uppercase">Analytics <span className="text-emerald-500">& Insights</span></h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <Activity className="w-4 h-4 text-emerald-500 mb-2" />
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Workouts</span>
          <span className="text-xl font-bold">{stats.totalWorkouts}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <TrendIcon />
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Avg Volume</span>
          <span className="text-xl font-bold">{Math.round(stats.avgVolume / 1000)}k</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <Scale className="w-4 h-4 text-rose-500 mb-2" />
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Latest Weight</span>
          <span className="text-xl font-bold">{stats.latestWeight || '--'} <span className="text-xs text-slate-500">kg</span></span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <CalendarIcon className="w-4 h-4 text-amber-500 mb-2" />
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Workouts / Week</span>
          <span className="text-xl font-bold">{stats.workoutsPerWeek}</span>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WorkoutCalendar history={history} />
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Scale className="w-5 h-5 text-rose-500" /> Body Weight Trend
            </h3>
            <form onSubmit={handleWeightSubmit} className="flex gap-2">
              <input type="number" step="0.1" value={newWeight} onChange={e => setNewWeight(e.target.value)} placeholder="0.0" className="w-20 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-sm focus:ring-1 focus:ring-emerald-500 outline-none" />
              <button type="submit" className="p-1.5 bg-emerald-600 rounded-xl hover:bg-emerald-500"><Plus className="w-4 h-4" /></button>
            </form>
          </div>
          <Chart data={weightData.values} labels={weightData.labels} color="#f43f5e" />
        </div>
      </div>
      <div className="space-y-6 pt-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-500" /> Session Volume Trend
        </h3>
        <Chart data={totalVolumeData.values} labels={totalVolumeData.labels} color="#10b981" />
      </div>
    </div>
  );
};

export default Analytics;