
import React from 'react';
import { Lead } from '../types';
import { Printer, ArrowLeft } from 'lucide-react';

interface Props {
  lead: Lead;
  onBack: () => void;
}

const AgreementView: React.FC<Props> = ({ lead, onBack }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between no-print p-4 bg-white rounded-xl shadow-sm border">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-xl font-bold text-slate-800">Print Agreement View</h2>
        </div>
        <button 
          onClick={handlePrint}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2 hover:bg-indigo-700 shadow-md font-semibold"
        >
          <Printer size={18} />
          Print / प्रिंट करें
        </button>
      </div>

      <div id="printable-area" className="bg-white p-6 md:p-10 shadow-2xl border border-slate-200 rounded-xl min-h-[11in]">
        {/* Header */}
        <div className="text-center border-b-2 border-slate-900 pb-6 mb-8 flex justify-between items-end">
          <div className="text-left">
             <h1 className="text-2xl font-black uppercase text-slate-900 leading-none">Vehicle Finance</h1>
             <p className="text-xs font-bold text-slate-500">LEAD MANAGEMENT SYSTEM</p>
          </div>
          <div className="text-right">
            <p className="text-slate-900 font-black text-xl">CASE: {lead.id}</p>
            <p className="text-xs font-bold text-slate-400">DATE: {new Date(lead.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
          {/* Customer Info */}
          <section className="col-span-1 space-y-2">
            <h3 className="text-xs font-black border-b border-slate-300 pb-1 text-indigo-800 uppercase">Customer Details</h3>
            <p className="text-sm"><span className="font-bold text-slate-400 uppercase text-[9px]">Name:</span> {lead.customerName}</p>
            <p className="text-sm"><span className="font-bold text-slate-400 uppercase text-[9px]">Mobile:</span> {lead.mobile}</p>
            <p className="text-sm"><span className="font-bold text-slate-400 uppercase text-[9px]">Broker:</span> {lead.brokerName}</p>
          </section>

          {/* Guarantor Info */}
          <section className="col-span-1 space-y-2">
            <h3 className="text-xs font-black border-b border-slate-300 pb-1 text-indigo-800 uppercase">Guarantor Info</h3>
            <p className="text-sm"><span className="font-bold text-slate-400 uppercase text-[9px]">Name:</span> {lead.guarName || 'N/A'}</p>
          </section>

          {/* Document Grid - More Compact */}
          <section className="col-span-2 pt-4">
            <h3 className="text-xs font-black border-b border-slate-300 pb-1 text-indigo-800 uppercase mb-3">KYC & Asset Proofs</h3>
            <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
               {lead.custPhoto && <DocBox label="Cust. P1" src={lead.custPhoto} />}
               {lead.custPhoto2 && <DocBox label="Cust. P2" src={lead.custPhoto2} />}
               {lead.guarPhoto && <DocBox label="Guar. P1" src={lead.guarPhoto} />}
               {lead.guar2Photo && <DocBox label="Guar. P2" src={lead.guar2Photo} />}
               {lead.rcFront && <DocBox label="RC Front" src={lead.rcFront} />}
               {lead.rcBack && <DocBox label="RC Back" src={lead.rcBack} />}
               {lead.vehFront && <DocBox label="Veh Front" src={lead.vehFront} />}
               {lead.vehEngine && <DocBox label="Engine" src={lead.vehEngine} />}
               {lead.vehChassis && <DocBox label="Chassis" src={lead.vehChassis} />}
               {lead.vehOdo && <DocBox label="Odo" src={lead.vehOdo} />}
            </div>
          </section>

          {/* Agreement Section */}
          <section className="col-span-2 pt-4">
            <h3 className="text-xs font-black border-b border-slate-300 pb-1 text-indigo-800 uppercase mb-3">Agreement & Hisab</h3>
            <div className="grid grid-cols-2 gap-4">
               <div className="border rounded bg-white">
                 <p className="bg-slate-50 p-1 text-[8px] font-black text-slate-500 uppercase text-center border-b">Agreement Copy</p>
                 {lead.agreementPhoto ? (
                   <img src={lead.agreementPhoto} className="w-full h-32 object-contain p-1" alt="Agreement" />
                 ) : (
                   <div className="h-32 flex items-center justify-center text-slate-300 italic text-xs">Missing</div>
                 )}
               </div>
               
               <div className="border rounded bg-white">
                 <p className="bg-slate-50 p-1 text-[8px] font-black text-slate-500 uppercase text-center border-b">Hisab Chitti</p>
                 {lead.hisabChittiPhoto ? (
                   <img src={lead.hisabChittiPhoto} className="w-full h-32 object-contain p-1" alt="Hisab Chitti" />
                 ) : (
                   <div className="h-32 flex items-center justify-center text-slate-300 italic text-xs">Missing</div>
                 )}
               </div>
            </div>
          </section>
        </div>

        {/* Footer Signature */}
        <div className="mt-12 flex justify-between px-6">
          <div className="text-center">
            <div className="w-24 border-b border-slate-900 mb-1"></div>
            <p className="text-[8px] font-bold uppercase">Authorized</p>
          </div>
          <div className="text-center">
            <div className="w-24 border-b border-slate-900 mb-1"></div>
            <p className="text-[8px] font-bold uppercase">Customer</p>
          </div>
          <div className="text-center">
            <div className="w-24 border-b border-slate-900 mb-1"></div>
            <p className="text-[8px] font-bold uppercase">Guarantor</p>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-area, #printable-area * { visibility: visible; }
          #printable-area {
            position: absolute; left: 0; top: 0; width: 100%;
            margin: 0; padding: 0.1in; box-shadow: none; border: none;
          }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
};

const DocBox = ({ label, src }: any) => (
  <div className="border p-0.5 rounded bg-white">
    <p className="text-[6px] font-bold text-slate-400 uppercase text-center mb-0.5">{label}</p>
    <img src={src} className="w-full h-12 object-cover rounded shadow-inner" alt={label} />
  </div>
);

export default AgreementView;
