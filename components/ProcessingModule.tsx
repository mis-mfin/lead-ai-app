
import React, { useState } from 'react';
import { Lead, VerificationData, ApprovalData, Status } from '../types';
import { CheckCircle, XCircle, Save, ArrowLeft, Info, DollarSign } from 'lucide-react';

interface Props {
  lead: Lead;
  onSave: (updates: Partial<Lead>) => void;
  onCancel: () => void;
}

const ProcessingModule: React.FC<Props> = ({ lead, onSave, onCancel }) => {
  const [verification, setVerification] = useState<VerificationData>(
    lead.verification || { fieldVerified: false, creditVerified: false, remarks: '' }
  );
  const [approval, setApproval] = useState<ApprovalData>(
    lead.approval || { status: '', loanAmount: '', tenure: '', interestRate: '' }
  );

  const handleSave = () => {
    let finalStatus: Status = lead.status;
    
    if (approval.status === 'Approve') finalStatus = 'Approved';
    else if (approval.status === 'Reject') finalStatus = 'Rejected';
    else if (verification.fieldVerified || verification.creditVerified) finalStatus = 'Verified';

    onSave({
      verification,
      approval,
      status: finalStatus
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={onCancel} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Process Application / प्रोसेसिंग मॉड्यूल</h2>
          <p className="text-slate-500">Case ID: <span className="text-indigo-600 font-bold">{lead.id}</span> | Customer: {lead.customerName}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Verification Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <CheckCircle className="text-indigo-500" />
            Verification / सत्यापन
          </h3>
          
          <div className="space-y-6">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="checkbox" 
                className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                checked={verification.fieldVerified}
                onChange={e => setVerification({ ...verification, fieldVerified: e.target.checked })}
              />
              <span className="text-slate-700 font-medium group-hover:text-indigo-600">Field Verification / फील्ड सत्यापन</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="checkbox" 
                className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                checked={verification.creditVerified}
                onChange={e => setVerification({ ...verification, creditVerified: e.target.checked })}
              />
              <span className="text-slate-700 font-medium group-hover:text-indigo-600">Credit Verification / क्रेडिट सत्यापन</span>
            </label>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Remarks / टिप्पणी</label>
              <textarea 
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
                placeholder="Enter verification notes..."
                value={verification.remarks}
                onChange={e => setVerification({ ...verification, remarks: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Approval Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <DollarSign className="text-emerald-500" />
            Approval / अनुमोदन
          </h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Action / कार्रवाई</label>
              <select 
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                value={approval.status}
                onChange={e => setApproval({ ...approval, status: e.target.value as any })}
              >
                <option value="">Select Option</option>
                <option value="Approve">Approve / स्वीकृत</option>
                <option value="Reject">Reject / अस्वीकृत</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Loan Amount / ऋण राशि</label>
              <input 
                type="number" 
                className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                placeholder="₹ 0.00"
                value={approval.loanAmount}
                onChange={e => setApproval({ ...approval, loanAmount: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Tenure (Months) / अवधि</label>
                <input 
                  type="number" 
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                  placeholder="24"
                  value={approval.tenure}
                  onChange={e => setApproval({ ...approval, tenure: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Interest Rate (%) / ब्याज</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                  placeholder="12%"
                  value={approval.interestRate}
                  onChange={e => setApproval({ ...approval, interestRate: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 p-6 bg-slate-100 rounded-xl">
        <button 
          onClick={onCancel}
          className="px-6 py-2 rounded-lg text-slate-600 hover:bg-slate-200 transition-colors font-semibold"
        >
          Discard Changes / छोड़ें
        </button>
        <button 
          onClick={handleSave}
          className="px-8 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-md flex items-center gap-2 font-semibold"
        >
          <Save size={18} />
          Complete Process / पूर्ण करें
        </button>
      </div>
    </div>
  );
};

export default ProcessingModule;
