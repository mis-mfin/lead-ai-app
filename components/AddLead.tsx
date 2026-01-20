
import React, { useState, useRef, useEffect } from 'react';
import { Lead } from '../types';
import { Upload, Save, ArrowLeft, Camera, Loader2, X, Check, RefreshCw, AlertCircle } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface Props {
  onAdd: (lead: Omit<Lead, 'id' | 'status' | 'createdAt'>) => void;
  onCancel: () => void;
}

const AddLead: React.FC<Props> = ({ onAdd, onCancel }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    mobile: '',
    brokerName: '',
    guarName: '',
  });
  
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [files, setFiles] = useState<{ [key: string]: string }>({});
  const [ocrData, setOcrData] = useState<Partial<Lead>>({});
  const [activeCamera, setActiveCamera] = useState<string | null>(null);
  const [camError, setCamError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const initCamera = async (id: string) => {
    setActiveCamera(id);
    setCamError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err: any) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCamError("Camera permission denied. Please check settings.");
      } else {
        setCamError("Camera error: " + err.message);
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setActiveCamera(null);
    setCamError(null);
  };

  const capturePhoto = (id: string) => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const base64 = canvas.toDataURL('image/jpeg', 0.8);
        handleImageUpdate(id, base64);
        stopCamera();
      }
    }
  };

  const handleImageUpdate = async (id: string, base64: string) => {
    setFiles(prev => ({ ...prev, [id]: base64 }));
    if (id === 'custAadhaarFront') await extractData(base64, 'aadhaar');
    if (id === 'rcFront') await extractData(base64, 'rc');
    if (id === 'insurance') await extractData(base64, 'insurance');
  };

  const extractData = async (base64: string, type: 'aadhaar' | 'rc' | 'insurance') => {
    setIsProcessing(type);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const base64Data = base64.split(',')[1];
      let prompt = '';
      
      if (type === 'aadhaar') {
        prompt = `Analyze Aadhaar: {"name": "Full name", "aadhaarNo": "12 digits", "pincode": "6 digits", "address": "Full address"}`;
      } else if (type === 'rc') {
        prompt = `Analyze RC: {"regNo": "Vehicle no", "ownerName": "Owner", "make": "Brand", "makeClass": "Model", "regDate": "DD-MM-YYYY"}`;
      } else if (type === 'insurance') {
        prompt = `Analyze Insurance Policy: {"company": "Company Name", "policyNo": "Policy Number", "expiryDate": "DD-MM-YYYY", "premium": "Amount"}`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ parts: [{ inlineData: { mimeType: 'image/jpeg', data: base64Data } }, { text: prompt + " Only JSON output." }] }],
        config: { responseMimeType: "application/json" }
      });

      const result = JSON.parse(response.text.trim());
      if (type === 'aadhaar') {
        setOcrData(prev => ({ ...prev, aadhaarData: result }));
        if (result.name) setFormData(prev => ({ ...prev, customerName: result.name }));
      } else if (type === 'rc') {
        setOcrData(prev => ({ ...prev, rcData: result }));
      } else if (type === 'insurance') {
        setOcrData(prev => ({ ...prev, insuranceData: result }));
      }
    } catch (error) { 
      console.error(error); 
    } finally { 
      setIsProcessing(null); 
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => handleImageUpdate(key, reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleMobileChange = (val: string) => {
    const numeric = val.replace(/\D/g, '').slice(0, 10);
    setFormData({ ...formData, mobile: numeric });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.mobile.length !== 10) {
      alert("Mobile number must be 10 digits.");
      return;
    }
    onAdd({
      ...formData,
      ...ocrData,
      custAadhaarFront: files.custAadhaarFront,
      custAadhaarBack: files.custAadhaarBack,
      custPan: files.custPan,
      custPhoto: files.custPhoto,
      custPhoto2: files.custPhoto2,
      guarAadhaarFront: files.guarAadhaarFront,
      guarAadhaarBack: files.guarAadhaarBack,
      guarPan: files.guarPan,
      guarPhoto: files.guarPhoto,
      guar2Photo: files.guar2Photo,
      rcFront: files.rcFront,
      rcBack: files.rcBack,
      insuranceFile: files.insurance,
      vehFront: files.vehFront,
      vehBack: files.vehBack,
      vehLeft: files.vehLeft,
      vehRight: files.vehRight,
      vehInterior: files.vehInterior,
      vehEngine: files.vehEngine,
      vehChassis: files.vehChassis,
      vehTyres: files.vehTyres,
      vehOdo: files.vehOdo,
      agreementPhoto: files.agreement,
      hisabChittiPhoto: files.hisab,
    });
  };

  return (
    <div className="max-w-5xl mx-auto pb-20 px-4">
      {activeCamera && (
        <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center p-4">
          <div className="relative w-full max-w-2xl aspect-[3/4] md:aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10 flex items-center justify-center">
            {camError ? (
              <div className="p-8 text-center space-y-6">
                <AlertCircle size={40} className="text-rose-500 mx-auto" />
                <p className="text-white text-sm">{camError}</p>
                <button onClick={() => initCamera(activeCamera)} className="px-8 py-3 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase">Retry</button>
                <button onClick={stopCamera} className="block w-full text-slate-500 text-xs font-bold uppercase">Cancel</button>
              </div>
            ) : (
              <>
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none">
                  <div className="w-full h-full border-2 border-dashed border-white/40 rounded-lg" />
                </div>
                <div className="absolute bottom-6 inset-x-0 px-10 flex justify-between items-center z-10">
                  <button type="button" onClick={stopCamera} className="p-4 bg-white/10 rounded-full text-white backdrop-blur-xl"><X size={24} /></button>
                  <button type="button" onClick={() => capturePhoto(activeCamera)} className="w-20 h-20 bg-white rounded-full flex items-center justify-center border-8 border-white/20 active:scale-90 transition-transform"><div className="w-12 h-12 rounded-full border-4 border-slate-900" /></button>
                  <div className="w-12" />
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center gap-6 mb-10 no-print">
        <button onClick={onCancel} className="p-4 bg-white hover:bg-slate-100 rounded-2xl transition-all shadow-xl"><ArrowLeft size={24} className="text-slate-600" /></button>
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">New Entry / नया केस</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl border border-slate-100/50">
            <h3 className="flex items-center gap-4 font-black text-indigo-950 mb-8 text-xl uppercase tracking-tighter">
              <span className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-sm">01</span>
              Applicant Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Customer Name</label>
                <input required className="w-full px-6 py-5 border-2 border-slate-50 rounded-[1.5rem] bg-slate-50/50 font-bold text-slate-800 text-lg" value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} />
              </div>
              <div className="space-y-3">
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Mobile Number (10 Digit Only)</label>
                <input required type="tel" className="w-full px-6 py-5 border-2 border-slate-50 rounded-[1.5rem] bg-slate-50/50 font-bold text-slate-800 text-lg" value={formData.mobile} onChange={e => handleMobileChange(e.target.value)} placeholder="00000 00000" />
              </div>
            </div>

            <div className="mt-12 space-y-12">
              <div>
                <LabelSeparator text="Applicant KYC" />
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <FileUploadBox label="Cust. Photo 1" id="custPhoto" onCamera={initCamera} onFile={handleFileChange} onClear={() => setFiles({...files, custPhoto: ''})} preview={files.custPhoto} />
                  <FileUploadBox label="Cust. Photo 2" id="custPhoto2" onCamera={initCamera} onFile={handleFileChange} onClear={() => setFiles({...files, custPhoto2: ''})} preview={files.custPhoto2} />
                  <FileUploadBox label="Adhar Front" id="custAadhaarFront" onCamera={initCamera} onFile={handleFileChange} onClear={() => setFiles({...files, custAadhaarFront: ''})} preview={files.custAadhaarFront} loading={isProcessing === 'aadhaar'} />
                  <FileUploadBox label="Adhar Back" id="custAadhaarBack" onCamera={initCamera} onFile={handleFileChange} onClear={() => setFiles({...files, custAadhaarBack: ''})} preview={files.custAadhaarBack} />
                  <FileUploadBox label="PAN Card" id="custPan" onCamera={initCamera} onFile={handleFileChange} onClear={() => setFiles({...files, custPan: ''})} preview={files.custPan} />
                </div>
              </div>

              <div>
                <LabelSeparator text="Guarantor Details" />
                <div className="mb-6 space-y-3">
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Guarantor Name</label>
                  <input className="w-full px-6 py-5 border-2 border-slate-50 rounded-[1.5rem] bg-slate-50/50 font-bold text-slate-800 text-lg" value={formData.guarName} onChange={e => setFormData({...formData, guarName: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <FileUploadBox label="Guar. Photo 1" id="guarPhoto" onCamera={initCamera} onFile={handleFileChange} onClear={() => setFiles({...files, guarPhoto: ''})} preview={files.guarPhoto} />
                  <FileUploadBox label="Guar. Photo 2" id="guar2Photo" onCamera={initCamera} onFile={handleFileChange} onClear={() => setFiles({...files, guar2Photo: ''})} preview={files.guar2Photo} />
                  <FileUploadBox label="G. Adhar F" id="guarAadhaarFront" onCamera={initCamera} onFile={handleFileChange} onClear={() => setFiles({...files, guarAadhaarFront: ''})} preview={files.guarAadhaarFront} />
                  <FileUploadBox label="G. Adhar B" id="guarAadhaarBack" onCamera={initCamera} onFile={handleFileChange} onClear={() => setFiles({...files, guarAadhaarBack: ''})} preview={files.guarAadhaarBack} />
                </div>
              </div>

              <div>
                <LabelSeparator text="Vehicle Documentation" />
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  <FileUploadBox label="RC Front" id="rcFront" onCamera={initCamera} onFile={handleFileChange} onClear={() => setFiles({...files, rcFront: ''})} preview={files.rcFront} loading={isProcessing === 'rc'} />
                  <FileUploadBox label="RC Back" id="rcBack" onCamera={initCamera} onFile={handleFileChange} onClear={() => setFiles({...files, rcBack: ''})} preview={files.rcBack} />
                  <FileUploadBox label="Insurance" id="insurance" onCamera={initCamera} onFile={handleFileChange} onClear={() => setFiles({...files, insurance: ''})} preview={files.insurance} loading={isProcessing === 'insurance'} />
                </div>
                <LabelSeparator text="Vehicle Photos" />
                <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                  <FileUploadBox label="Front" id="vehFront" onCamera={initCamera} onFile={handleFileChange} onClear={() => setFiles({...files, vehFront: ''})} preview={files.vehFront} />
                  <FileUploadBox label="Back" id="vehBack" onCamera={initCamera} onFile={handleFileChange} onClear={() => setFiles({...files, vehBack: ''})} preview={files.vehBack} />
                  <FileUploadBox label="Left" id="vehLeft" onCamera={initCamera} onFile={handleFileChange} onClear={() => setFiles({...files, vehLeft: ''})} preview={files.vehLeft} />
                  <FileUploadBox label="Right" id="vehRight" onCamera={initCamera} onFile={handleFileChange} onClear={() => setFiles({...files, vehRight: ''})} preview={files.vehRight} />
                  <FileUploadBox label="Interior" id="vehInterior" onCamera={initCamera} onFile={handleFileChange} onClear={() => setFiles({...files, vehInterior: ''})} preview={files.vehInterior} />
                  <FileUploadBox label="Engine" id="vehEngine" onCamera={initCamera} onFile={handleFileChange} onClear={() => setFiles({...files, vehEngine: ''})} preview={files.vehEngine} />
                  <FileUploadBox label="Chassis" id="vehChassis" onCamera={initCamera} onFile={handleFileChange} onClear={() => setFiles({...files, vehChassis: ''})} preview={files.vehChassis} />
                  <FileUploadBox label="Tyres" id="vehTyres" onCamera={initCamera} onFile={handleFileChange} onClear={() => setFiles({...files, vehTyres: ''})} preview={files.vehTyres} />
                  <FileUploadBox label="Odometer" id="vehOdo" onCamera={initCamera} onFile={handleFileChange} onClear={() => setFiles({...files, vehOdo: ''})} preview={files.vehOdo} />
                </div>
              </div>

              <div>
                <LabelSeparator text="Agreement & Accounts" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FileUploadBox label="Agreement Photo" id="agreement" onCamera={initCamera} onFile={handleFileChange} onClear={() => setFiles({...files, agreement: ''})} preview={files.agreement} />
                  <FileUploadBox label="Hisab Chitti Photo" id="hisab" onCamera={initCamera} onFile={handleFileChange} onClear={() => setFiles({...files, hisab: ''})} preview={files.hisab} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-indigo-950 text-white rounded-[2.5rem] p-10 shadow-3xl sticky top-10 border border-indigo-900">
            <h4 className="font-black text-xl mb-6 tracking-tighter uppercase">Submission</h4>
            <div className="space-y-4 mb-10">
              <StatusItem label="Mobile: 10 Digits" done={formData.mobile.length === 10} />
              <StatusItem label="RC Front/Back" done={!!files.rcFront && !!files.rcBack} />
              <StatusItem label="9-Point Vehicle Pics" done={!!files.vehFront && !!files.vehBack && !!files.vehEngine && !!files.vehChassis} />
              <StatusItem label="Agreement & Hisab" done={!!files.agreement && !!files.hisab} />
            </div>
            <button type="submit" disabled={!!isProcessing} className="w-full bg-emerald-500 text-white py-6 rounded-3xl font-black text-xl flex items-center justify-center gap-3 shadow-2xl disabled:opacity-50">
              {isProcessing ? <Loader2 className="animate-spin" /> : <Save />}
              SUBMIT CASE
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

const LabelSeparator = ({ text }: { text: string }) => (
  <div className="flex items-center gap-4 mb-6">
    <div className="h-px bg-slate-100 flex-1" />
    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{text}</span>
    <div className="h-px bg-slate-100 flex-1" />
  </div>
);

const FileUploadBox = ({ label, id, onCamera, onFile, onClear, preview, loading }: any) => (
  <div className="space-y-2">
    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block text-center truncate">{label}</label>
    <div className={`relative aspect-square md:aspect-[4/3] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center overflow-hidden transition-all ${preview ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-100 bg-slate-50 hover:border-indigo-400'}`}>
      {loading ? (
        <Loader2 className="text-indigo-600 animate-spin" size={24} />
      ) : preview ? (
        <>
          <img src={preview} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
            <button type="button" onClick={() => onCamera(id)} className="p-2 bg-white rounded-lg text-indigo-600"><Camera size={16} /></button>
            <button type="button" onClick={onClear} className="p-2 bg-rose-500 rounded-lg text-white"><X size={16} /></button>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => onCamera(id)}>
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-slate-300"><Camera size={20} /></div>
          <span className="text-[8px] font-black text-slate-400 uppercase">Capture</span>
        </div>
      )}
      {!preview && !loading && (
        <div className="absolute bottom-2 right-2">
          <label className="p-1.5 bg-white text-slate-500 rounded-md cursor-pointer shadow-sm border border-slate-100"><Upload size={12} /><input type="file" className="hidden" accept="image/*" onChange={e => onFile(e, id)} /></label>
        </div>
      )}
    </div>
  </div>
);

const StatusItem = ({ label, done }: { label: string, done: boolean }) => (
  <div className={`flex items-center justify-between p-3 rounded-xl border ${done ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-indigo-900/50 border-indigo-800'}`}>
    <span className={`text-[10px] font-black uppercase tracking-widest ${done ? "text-emerald-400" : "text-indigo-600"}`}>{label}</span>
    {done ? <Check size={14} className="text-emerald-400" /> : <div className="w-3 h-3 rounded-full border-2 border-indigo-800" />}
  </div>
);

export default AddLead;
