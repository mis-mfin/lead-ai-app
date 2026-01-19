
import React, { useState, useEffect } from 'react';
import { Layout, PlusCircle, Database, FileText, CheckCircle, Search, Menu, X, Printer, ExternalLink, Cloud, AlertCircle, RefreshCw } from 'lucide-react';
import { Lead, Status } from './types';
import Dashboard from './components/Dashboard';
import AddLead from './components/AddLead';
import ProcessingModule from './components/ProcessingModule';
import AgreementView from './components/AgreementView';

const STORAGE_KEY = 'vfm_leads_data_v2';
const GOOGLE_FORM_URL = "https://forms.gle/DFWBPg3r4YfZ6Wf39"; 

// YOUR DEPLOYED SCRIPT URL
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxVo1mwEgKc-zpfLB-PLwoXGKgo9e9IXVod9qNz9cyiWFfb0u3JaHXvZgWxbTXl0XHVmg/exec";

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'add' | 'process' | 'view'>('dashboard');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');

  useEffect(() => {
    const savedLeads = localStorage.getItem(STORAGE_KEY);
    if (savedLeads) setLeads(JSON.parse(savedLeads));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
  }, [leads]);

  const generateNextId = () => {
    if (leads.length === 0) return 'MF6001';
    const lastId = leads[leads.length - 1].id;
    const num = parseInt(lastId.replace('MF', ''));
    return `MF${num + 1}`;
  };

  const cleanNumeric = (val: string | number | undefined) => {
    if (!val) return '';
    return val.toString().replace(/,/g, '').replace(/\s/g, '');
  };

  const syncToCloud = async (lead: Lead) => {
    setSyncStatus('syncing');
    
    const mfgYearOnly = lead.rcData?.mfgYear ? (lead.rcData.mfgYear.match(/\d{4}/)?.[0] || lead.rcData.mfgYear) : '';

    const payload = {
      "caseId": lead.id,
      "customerName": lead.customerName,
      "status": lead.status,

      // Adhar Customer
      "Name - ": lead.customerName,
      "Date Of Birth - (Date of Birth/DOB): ": lead.aadhaarData?.dob || '',
      "AadarCard - (Your Adhar No):": lead.aadhaarData?.aadhaarNo || '',
      "PIN Code - As per Adhar card ": lead.aadhaarData?.pincode || '',
      "State - As per Adhar card ": lead.aadhaarData?.state || '',
      "City - As per Adhar card ": lead.aadhaarData?.city || '',
      "Area - As per Adhar card ": lead.aadhaarData?.area || '',
      "Address - (Address) :": lead.aadhaarData?.address || '',

      // Adhar Gurenter
      "Guar Name - ": lead.guarName || '',
      "Guar Mobile": lead.mobile || '', 

      // RC
      "Registration No - (Regn. No.) :": lead.rcData?.regNo || '',
      "Veh Owner's Name - (Regd. Owner) :": lead.rcData?.ownerName || '',
      "Vehicle Type - (Vehicle Class) :": lead.rcData?.vehicleType || '',
      "Mfg Year - (Manufacturing Dt.) :": mfgYearOnly,
      "Make - (Manufacturar):": lead.rcData?.make || '',
      "Make Class - (Model No.)": lead.rcData?.makeClass || '',
      "Reg Authority - (DY RTO ) :": lead.rcData?.regAuthority || '',
      "Engine Number - (Engine No.) :": lead.rcData?.engineNo || '',
      "Chassis Number - (Chassis No.) :": lead.rcData?.chassisNo || '',
      "Fuel Type - (Fuel) :": lead.rcData?.fuelType || '',
      "Vehicle Color - (Colour) :": lead.rcData?.color || '',
      "Date of Reg - (Regn. Date) :": lead.rcData?.regDate || '',
      "RC Expiry Date - (Regd. Validity) :": lead.rcData?.expiryDate || '',

      // Insurance
      "Insurance Company - (Insurance Company name )": lead.insuranceData?.company || '',
      "Insurance Type - (Policy Type) :": lead.insuranceData?.type || '',
      "Insurance No - (Policy Number) : ": lead.insuranceData?.policyNo || '',
      "Name Transfer - (Name of the Insured) :": lead.insuranceData?.nameTransfer || '',
      "Endorsement Date - (Hours on ) :": lead.insuranceData?.endorsementDate || '',
      "Insurance Expiry - ( To Midnight Of ke bad ki date ani chahiye) :": lead.insuranceData?.expiryDate || '',
      "IDV Value - (IDV Of Value) :": cleanNumeric(lead.insuranceData?.idvValue),
      "Insurance Premium - (Total Policy Premium) :": cleanNumeric(lead.insuranceData?.premium),

      // Photos
      "photo_cust_1": lead.custPhoto || '',
      "photo_cust_2": lead.custPhoto2 || '',
      "photo_aadhaar_f": lead.custAadhaarFront || '',
      "photo_aadhaar_b": lead.custAadhaarBack || '',
      "photo_pan": lead.custPan || '',
      "photo_rc_f": lead.rcFront || '',
      "photo_rc_b": lead.rcBack || '',
      "photo_ins": lead.insuranceFile || '',
      "photo_guar_1": lead.guarPhoto || '',
      "photo_guar_2": lead.guar2Photo || '',
      "photo_guar_aadhaar_f": lead.guarAadhaarFront || '',
      "photo_guar_aadhaar_b": lead.guarAadhaarBack || '',
      "photo_guar_pan": lead.guarPan || '',
      "photo_veh_f": lead.vehFront || '',
      "photo_veh_b": lead.vehBack || '',
      "photo_veh_l": lead.vehLeft || '',
      "photo_veh_r": lead.vehRight || '',
      "photo_veh_i": lead.vehInterior || '',
      "photo_veh_engine": lead.vehEngine || '',
      "photo_veh_chassis": lead.vehChassis || '',
      "photo_veh_tyres": lead.vehTyres || '',
      "photo_veh_odo": lead.vehOdo || '',
      "photo_agreement": lead.agreementPhoto || '',
      "photo_hisab": lead.hisabChittiPhoto || ''
    };

    try {
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify(payload)
      });

      setSyncStatus('success');
      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch (error) {
      console.error("Sync error:", error);
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  };

  const handleAddLead = async (newLead: Omit<Lead, 'id' | 'status' | 'createdAt'>) => {
    const lead: Lead = {
      ...newLead,
      id: generateNextId(),
      status: 'New',
      createdAt: new Date().toISOString(),
    };
    
    const updatedLeads = [...leads, lead];
    setLeads(updatedLeads);
    
    await syncToCloud(lead);
    setActiveTab('dashboard');
  };

  const handleUpdateLead = async (id: string, updates: Partial<Lead>) => {
    const updatedLeads = leads.map(l => l.id === id ? { ...l, ...updates } : l);
    setLeads(updatedLeads);
    
    const updatedLead = updatedLeads.find(l => l.id === id);
    if (updatedLead) {
      await syncToCloud(updatedLead);
    }
  };

  const openProcess = (id: string) => {
    setSelectedLeadId(id);
    setActiveTab('process');
  };

  const openView = (id: string) => {
    setSelectedLeadId(id);
    setActiveTab('view');
  };

  const currentLead = leads.find(l => l.id === selectedLeadId);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 text-slate-900">
      <div className="md:hidden bg-indigo-950 text-white p-4 flex justify-between items-center sticky top-0 z-50 shadow-lg">
        <div className="flex items-center gap-2">
          <Database size={20} className="text-indigo-400" />
          <span className="font-black tracking-tighter">MALOO FINANCE</span>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <nav className={`
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 fixed md:static inset-y-0 left-0 w-72 bg-indigo-950 text-indigo-100 transition-transform duration-300 z-40 flex flex-col shadow-2xl
      `}>
        <div className="p-8 hidden md:block border-b border-indigo-900/50">
          <div className="bg-indigo-600 w-12 h-12 rounded-xl flex items-center justify-center shadow-lg mb-4 mx-auto">
            <Database className="text-white" size={24} />
          </div>
          <h1 className="text-xl font-black text-white text-center tracking-tighter uppercase leading-none">MALOO FINANCE</h1>
          <p className="text-[10px] text-indigo-400 text-center font-bold tracking-widest mt-2 uppercase">Vehicle Lead Manager</p>
        </div>

        <div className="flex-1 px-6 space-y-2 mt-6">
          <NavItem active={activeTab === 'dashboard'} onClick={() => {setActiveTab('dashboard'); setSidebarOpen(false);}} icon={<Layout size={20} />} label="Dashboard" sublabel="डैशबोर्ड" />
          <NavItem active={activeTab === 'add'} onClick={() => {setActiveTab('add'); setSidebarOpen(false);}} icon={<PlusCircle size={20} />} label="New Entry" sublabel="नया केस" />

          <div className="pt-10">
            <div className={`p-5 rounded-2xl border transition-all duration-500 ${
              syncStatus === 'syncing' ? 'bg-indigo-900/40 border-indigo-700 animate-pulse' :
              syncStatus === 'success' ? 'bg-emerald-950/40 border-emerald-800' :
              syncStatus === 'error' ? 'bg-rose-950/40 border-rose-900' : 
              'bg-indigo-950/20 border-indigo-900/50'
            }`}>
              <div className="flex items-center gap-3">
                {syncStatus === 'syncing' && <RefreshCw size={18} className="animate-spin text-indigo-400" />}
                {syncStatus === 'success' && <CheckCircle size={18} className="text-emerald-400" />}
                {syncStatus === 'error' && <AlertCircle size={18} className="text-rose-400" />}
                {syncStatus === 'idle' && <Cloud size={18} className="text-indigo-700" />}
                <span className="text-xs font-black uppercase tracking-widest">
                  {syncStatus === 'syncing' ? 'Cloud Syncing...' : syncStatus === 'success' ? 'Data Verified' : syncStatus === 'error' ? 'Sync Error' : 'Cloud Status'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {sidebarOpen && <div className="fixed inset-0 bg-indigo-950/80 backdrop-blur-sm z-30 md:hidden" onClick={() => setSidebarOpen(false)} />}

      <main className="flex-1 p-4 md:p-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'dashboard' && <Dashboard leads={leads} onProcess={openProcess} onView={openView} googleFormUrl={GOOGLE_FORM_URL} />}
          {activeTab === 'add' && <AddLead onAdd={handleAddLead} onCancel={() => setActiveTab('dashboard')} />}
          {activeTab === 'process' && currentLead && <ProcessingModule lead={currentLead} onSave={(updates) => { handleUpdateLead(currentLead.id, updates); setActiveTab('dashboard'); }} onCancel={() => setActiveTab('dashboard')} />}
          {activeTab === 'view' && currentLead && <AgreementView lead={currentLead} onBack={() => setActiveTab('dashboard')} />}
        </div>
      </main>
    </div>
  );
}

function NavItem({ active, onClick, icon, label, sublabel }: any) {
  return (
    <button onClick={onClick} className={`w-full group flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 ${active ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 font-bold' : 'hover:bg-indigo-900/50 text-indigo-400'}`}>
      <span className={`${active ? 'text-white' : 'text-indigo-600 group-hover:text-indigo-400'}`}>{icon}</span>
      <div className="text-left">
        <div className="text-sm font-black tracking-tight">{label}</div>
        <div className={`text-[10px] font-bold uppercase tracking-widest ${active ? 'text-indigo-200' : 'text-indigo-500'}`}>{sublabel}</div>
      </div>
    </button>
  );
}
