import React from 'react';
import { MoreVertical } from 'lucide-react';
interface StatInfo {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: string;
}
interface DashboardCardProps {
  title: string;
  subtitle?: string;
  description?: string;
  bgImage?: string;
  bgColor?: string;
  bgGradient?: string;
  actionButton?: React.ReactNode;
  darkOverlay?: boolean;
  stat?: StatInfo;
  compact?: boolean;
}
const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  subtitle,
  description,
  bgImage,
  bgColor = 'bg-gray-800',
  bgGradient,
  actionButton,
  darkOverlay = false,
  stat,
  compact = false
}) => {
  const cardStyle = bgImage ?
  {
    backgroundImage: `url(${bgImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  } :
  {};
  const heightClass = compact ?
  'h-[160px] sm:h-[180px]' :
  stat ?
  'h-[220px] sm:h-[240px] md:h-[260px]' :
  'h-[180px] sm:h-[200px] md:h-[220px]';
  return (
    <div
      className={`${bgColor} ${bgGradient || ''} rounded-xl overflow-hidden relative ${heightClass} w-full group transition-all duration-300 hover:shadow-xl hover:shadow-blue-900/20 hover:translate-y-[-2px]`}
      style={cardStyle}>

      {darkOverlay &&
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      }
      <div className="p-4 sm:p-5 h-full flex flex-col justify-between relative z-10">
        <div className="flex justify-between items-start">
          <div>
            {subtitle &&
            <div className="text-xs text-gray-300 mb-1 flex items-center opacity-80">
                <span className="w-1.5 h-1.5 bg-gray-300 rounded-full mr-2"></span>
                {subtitle}
              </div>
            }
            <h2
              className={`${compact ? 'text-base sm:text-lg' : 'text-lg sm:text-xl md:text-2xl'} font-medium tracking-tight group-hover:text-white transition-colors`}>

              {title}
            </h2>
          </div>
          <button className="text-gray-400 hover:text-white p-1.5 rounded-full hover:bg-gray-800/50 transition-all duration-200 hover:rotate-12">
            <MoreVertical size={16} />
          </button>
        </div>
        {description &&
        <div className="mt-2 text-sm text-gray-300 max-w-md line-clamp-3 opacity-90 group-hover:opacity-100 transition-opacity">
            {description}
          </div>
        }
        {stat &&
        <div className="mt-auto mb-3 bg-black/30 backdrop-blur-sm rounded-lg p-3 border border-white/10 group-hover:border-white/20 transition-all duration-300 group-hover:bg-black/40">
            <div className="flex items-start">
              <div className="mr-3 mt-0.5 p-1.5 rounded-full bg-white/10 group-hover:bg-white/20 transition-colors">
                {stat.icon}
              </div>
              <div>
                <div className="text-xs text-gray-400">{stat.label}</div>
                <div className="text-sm font-medium group-hover:text-white transition-colors">
                  {stat.value}
                </div>
                <div className="text-xs text-blue-400 group-hover:text-blue-300 transition-colors">
                  {stat.trend}
                </div>
              </div>
            </div>
          </div>
        }
        <div className="mt-auto flex justify-start">{actionButton}</div>
      </div>
      {/* Subtle hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      {/* Animated border on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
      </div>
    </div>);

};
export default DashboardCard;