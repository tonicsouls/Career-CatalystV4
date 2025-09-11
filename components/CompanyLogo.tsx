import React from 'react';

interface CompanyLogoProps {
  companyName: string;
}

const CompanyLogo: React.FC<CompanyLogoProps> = ({ companyName }) => {
  const getInitial = (name: string) => (name ? name.charAt(0).toUpperCase() : '?');
  
  // Simple hash function to get a color index
  const getColorIndex = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash % colors.length);
  };

  const colors = [
    'bg-red-100 text-red-800',
    'bg-orange-100 text-orange-800',
    'bg-amber-100 text-amber-800',
    'bg-yellow-100 text-yellow-800',
    'bg-lime-100 text-lime-800',
    'bg-green-100 text-green-800',
    'bg-emerald-100 text-emerald-800',
    'bg-teal-100 text-teal-800',
    'bg-cyan-100 text-cyan-800',
    'bg-sky-100 text-sky-800',
    'bg-blue-100 text-blue-800',
    'bg-indigo-100 text-indigo-800',
    'bg-violet-100 text-violet-800',
    'bg-purple-100 text-purple-800',
    'bg-fuchsia-100 text-fuchsia-800',
    'bg-pink-100 text-pink-800',
    'bg-rose-100 text-rose-800',
  ];

  const colorClass = colors[getColorIndex(companyName)];
  const initial = getInitial(companyName);

  return (
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xl ${colorClass}`}>
      {initial}
    </div>
  );
};

export default CompanyLogo;
