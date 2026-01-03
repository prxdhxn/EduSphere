import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { QuizResult } from '../types';

interface ProgressChartProps {
  results: QuizResult[];
  title?: string;
  height?: number;
}

const ProgressChart: React.FC<ProgressChartProps> = ({ results, title = 'Your Progress Over Time', height = 400 }) => {
  // Transform results into chart data with date labels
  const chartData = results
    .sort((a, b) => new Date(a.completedAt || a.date).getTime() - new Date(b.completedAt || b.date).getTime())
    .map((result, index) => {
      const date = new Date(result.completedAt || result.date);
      const score = Math.round((result.score / result.totalQuestions) * 100);
      return {
        time: `Quiz ${index + 1}`, // Use quiz number instead of date for same-day quizzes
        score: score,
        quizNumber: index + 1,
        fullDate: date.toISOString(),
        rawScore: result.score,
        totalQuestions: result.totalQuestions,
        dateTime: date.toLocaleString('en-US', { 
          month: 'short', 
          day: '2-digit', 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      };
    });

  // Debug log to see what data we're working with
  console.log('ProgressChart data:', chartData);

  // Handle empty data
  if (chartData.length === 0) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center" style={{ height }}>
        <p className="text-slate-400 text-center">
          No quiz results yet. Complete a quiz to see your progress chart!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
      <h3 className="text-xl font-bold text-slate-800 mb-6">{title}</h3>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart 
            data={chartData} 
            margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
          >
            <defs>
              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.9} />
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="time" 
              tick={{ fill: '#9ca3af', fontSize: 12 }} 
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              label={{ value: 'Score (%)', angle: -90, position: 'insideLeft' }}
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              domain={[0, 100]}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip 
              formatter={(value: number, name: string, props: any) => {
                console.log('Tooltip data:', { value, name, props });
                return [`${value}%`, 'Quiz Score'];
              }}
              labelFormatter={(label, payload) => {
                console.log('Tooltip label:', { label, payload });
                if (payload && payload[0]) {
                  const data = payload[0].payload;
                  return `${label} - ${data.dateTime} (${data.rawScore}/${data.totalQuestions})`;
                }
                return label;
              }}
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '12px'
              }}
            />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="score" 
              stroke="#4f46e5" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorScore)"
              name="Quiz Score"
              dot={{ fill: '#4f46e5', r: 6, strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 8, strokeWidth: 2, stroke: '#fff' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="text-center p-4 bg-indigo-50 rounded-lg">
          <p className="text-sm text-slate-600 font-medium">Highest Score</p>
          <p className="text-2xl font-bold text-indigo-600">
            {Math.max(...chartData.map(d => d.score))}%
          </p>
        </div>
        <div className="text-center p-4 bg-emerald-50 rounded-lg">
          <p className="text-sm text-slate-600 font-medium">Average Score</p>
          <p className="text-2xl font-bold text-emerald-600">
            {Math.round(chartData.reduce((a, b) => a + b.score, 0) / chartData.length)}%
          </p>
        </div>
        <div className="text-center p-4 bg-violet-50 rounded-lg">
          <p className="text-sm text-slate-600 font-medium">Quizzes Done</p>
          <p className="text-2xl font-bold text-violet-600">{chartData.length}</p>
        </div>
      </div>
    </div>
  );
};

export default ProgressChart;
