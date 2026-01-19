
import React, { useState } from 'react';
import { Lead, Status } from '../types';
import { Search, ExternalLink, Settings, Eye, Database } from 'lucide-react';

interface Props {
  leads: Lead[];
  onProcess: (id: string) => void;
  onView: (id: string) => void;
  googleFormUrl: string;
}

const Dashboard: React.FC<Props> = ({ leads, onProcess, onView, googleFormUrl }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLeads = leads.filter(l => 
    l.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.mobile.includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Leads Dashboard / डैशबोर्ड</h2>
          <p className="text-slate-500">Manage all finance applications / प्रबंधन करें</p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search ID, Name..."
              className="pl-10 pr-4 py-2 border rounded-xl w-full md:w-64 focus:ring-2 focus:ring-indigo-500 focus:outline-none border-slate-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 uppercase tracking-wider">Case ID</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 uppercase tracking-wider">Customer / ग्राहक</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 uppercase tracking-wider">Mobile / मोबाइल</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 uppercase tracking-wider">Status / स्थिति</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 uppercase tracking-wider text-center">Actions / क्रियाएँ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeads.length > 0 ? filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-indigo-600">{lead.id}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-800">{lead.customerName}</div>
                    <div className="text-xs text-slate-400">{new Date(lead.createdAt).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{lead.mobile}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={lead.status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => onProcess(lead.id)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Process"
                      >
                        <Settings size={18} />
                      </button>
                      <button 
                        onClick={() => onView(lead.id)}
                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="View"
                      >
                        <Eye size={18} />
                      </button>
                      <a 
                        href={`${googleFormUrl}?entry.123456789=${lead.id}`} // Example pre-fill logic
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        title="Open Google Form"
                      >
                        <ExternalLink size={18} />
                      </a>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                    No leads found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }: { status: Status }) => {
  const styles = {
    'New': 'bg-blue-100 text-blue-700',
    'Verified': 'bg-amber-100 text-amber-700',
    'Approved': 'bg-emerald-100 text-emerald-700',
    'Rejected': 'bg-rose-100 text-rose-700'
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${styles[status]}`}>
      {status}
    </span>
  );
};

export default Dashboard;
