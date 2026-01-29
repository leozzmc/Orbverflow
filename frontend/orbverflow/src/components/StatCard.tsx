import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
interface StatCardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  animated?: boolean;
  delay?: string;
}
const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  isPositive,
  icon,
  color,
  bgColor,
  animated = false,
  delay = '0'
}) => {
  return (
    <div
      className={`bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-800/50 hover:border-gray-700/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-900/5 hover:translate-y-[-2px] ${animated ? 'animate-fade-in-up' : ''}`}
      style={{
        animationDelay: `${delay}ms`
      }}>

      <div className="flex items-center justify-between mb-3">
        <div className="text-sm text-gray-400">{title}</div>
        <div
          className={`${bgColor} p-2 rounded-lg group hover:scale-110 transition-transform duration-300`}>

          <div className="transform transition-transform duration-300 group-hover:rotate-12">
            {icon}
          </div>
        </div>
      </div>
      <div className="text-2xl font-bold tracking-tight mb-2 relative">
        <div
          className="opacity-0 absolute inset-0 animate-count-up"
          style={{
            animationDelay: `${parseInt(delay) + 300}ms`
          }}>

          {value}
        </div>
        <div>{value}</div>
      </div>
      <div
        className={`flex items-center text-xs ${isPositive ? 'text-green-400' : 'text-red-400'}`}>

        {isPositive ?
        <TrendingUp size={14} className="mr-1 animate-bounce-subtle" /> :

        <TrendingDown size={14} className="mr-1 animate-bounce-subtle" />
        }
        <span>{change} from last week</span>
      </div>
    </div>);

};
export default StatCard;