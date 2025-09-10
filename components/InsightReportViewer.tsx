import React from 'react';
import { InsightReportData } from '../types';
import { BriefcaseIcon } from './icons/BriefcaseIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface InsightReportViewerProps {
  data: InsightReportData;
}

const InsightReportViewer: React.FC<InsightReportViewerProps> = ({ data }) => {
  return (
    <div className="space-y-8 font-sans">
      
      {/* Header */}
      <div className="p-6 bg-slate-900/50 rounded-lg border border-slate-700">
        <div className="flex items-center space-x-4">
            <div className="bg-indigo-500/20 p-3 rounded-lg ring-1 ring-indigo-500/30">
                <DocumentTextIcon className="h-8 w-8 text-indigo-300" />
            </div>
            <div>
                 <h2 className="text-2xl font-bold text-slate-100">AI Insight Report</h2>
                 <p className="text-slate-400 mt-1">{data.careerFocus}</p>
            </div>
        </div>
      </div>

      {/* Executive Summary */}
      <div>
        <h3 className="text-lg font-semibold text-slate-200 border-b border-slate-700 pb-2 mb-3">Executive Summary</h3>
        <p className="text-slate-300 leading-relaxed">{data.executiveSummary}</p>
      </div>

      {/* KPIs */}
      <div>
        <h3 className="text-lg font-semibold text-slate-200 mb-4">Key Performance Indicators</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.kpis.map((kpi, index) => (
            <div key={index} className="bg-slate-800/70 p-4 rounded-lg border border-slate-700">
              <p className="text-sm font-medium text-slate-400">{kpi.title}</p>
              <p className="text-3xl font-bold text-indigo-400 mt-1">{kpi.value}</p>
              <p className="text-xs text-slate-500 mt-2">{kpi.explanation}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Core Strengths */}
      <div>
        <h3 className="text-lg font-semibold text-slate-200 mb-4">Core Strengths</h3>
        <div className="flex flex-wrap gap-3">
          {data.coreStrengths.map((strength, index) => (
            <div key={index} className="flex items-center bg-sky-500/10 text-sky-300 text-sm font-medium px-3 py-1.5 rounded-full">
                <SparklesIcon className="h-4 w-4 mr-2 text-sky-400"/>
                {strength}
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
};

export default InsightReportViewer;