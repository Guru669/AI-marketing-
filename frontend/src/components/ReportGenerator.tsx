import { Download, FileText, Printer } from 'lucide-react';
import type { Business, Analytics, Post } from '@/lib/types';

interface ReportGeneratorProps {
  business: Business;
  analytics?: Analytics[];
  posts?: Post[];
}

export default function ReportGenerator({ business, analytics = [], posts = [] }: ReportGeneratorProps) {
  const exportCSV = () => {
    const headers = ['Platform', 'Impressions', 'Reach', 'Likes', 'Comments', 'Shares', 'Date'];
    const rows = analytics.map((a) => [
      a.platform,
      a.impressions,
      a.reach,
      a.likes,
      a.comments,
      a.shares,
      a.recorded_date,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${business.name.replace(/\s+/g, '_')}_Marketing_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={exportCSV}
        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold transition-colors shadow-sm"
      >
        <Download className="w-3.5 h-3.5 text-stone-500" /> Export CSV
      </button>
      <button
        onClick={handlePrintPDF}
        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold transition-colors shadow-sm"
      >
        <Printer className="w-3.5 h-3.5 text-stone-300" /> Executive PDF Report
      </button>
    </div>
  );
}
