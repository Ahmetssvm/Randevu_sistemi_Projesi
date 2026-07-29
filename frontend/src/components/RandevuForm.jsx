import React, { useState, useEffect } from "react";

const RandevuForm = ({ onRandevuOlustur, secilenPsikolog, onKapat }) => {
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  
  // 1. Veritabanından gelen dolu randevuları tutacağımız state
  const [doluRandevular, setDoluRandevular] = useState([]);
  
  const seansSaatleri = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", 
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", 
    "15:00", "15:30", "16:00", "16:30", "17:00"
  ];

  // 2. Sayfa açıldığında backend'den dolu randevuları çekiyoruz
  useEffect(() => {
    const doluRandevulariGetir = async () => {
      try {
        const response = await fetch("http://localhost:3000/randevular");
        const data = await response.json();
        setDoluRandevular(data);
      } catch (error) {
        console.error("Randevular çekilirken hata oluştu:", error);
      }
    };

    doluRandevulariGetir();
  }, []);

  // 3. Belirli bir saatin, seçilen psikolog ve tarihe göre dolu olup olmadığını kontrol eden fonksiyon
  const saatDoluMu = (saatStr) => {
    if (!date || !secilenPsikolog) return false;

    return doluRandevular.some((randevu) => {
      return (
        Number(randevu.psikologId) === Number(secilenPsikolog) &&
        randevu.date === date &&
        randevu.time === saatStr
      );
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!secilenPsikolog) {
      alert("Lütfen bir psikolog seçin!");
      return;
    }
    onRandevuOlustur({ psikolog_id: secilenPsikolog, name, surname, date, time });
    setName(""); setSurname(""); setDate(""); setTime("");
  };

  // 🔥 TARİH HESAPLAMALARI (BUGÜN VE 6 AY SONRASI)
  const bugunTarih = new Date();
  const bugun = bugunTarih.toISOString().split('T')[0]; // Bugünün tarihi (min)

  const altiAySonraTarih = new Date(bugunTarih);
  altiAySonraTarih.setMonth(altiAySonraTarih.getMonth() + 6); // Bugüne 6 ay ekle
  const altiAySiniri = altiAySonraTarih.toISOString().split('T')[0]; // 6 ay sonrasının tarihi (max)

  const inputClass = "w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200";

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-3xl shadow-2xl shadow-slate-200 mt-10 mb-10 border border-slate-100">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Randevu Oluştur</h1>
        <button 
          onClick={onKapat} 
          className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50 cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <input type="text" placeholder="Adınız" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} required />
          <input type="text" placeholder="Soyadınız" value={surname} onChange={(e) => setSurname(e.target.value)} className={inputClass} required />
        </div>

        {/* 🔥 min={bugun} VE max={altiAySiniri} EKLENDİ */}
        <input 
          type="date" 
          min={bugun} 
          max={altiAySiniri}
          value={date} 
          onChange={(e) => setDate(e.target.value)} 
          className={inputClass} 
          required 
        />

        <select value={time} onChange={(e) => setTime(e.target.value)} className={`${inputClass} bg-white appearance-none`} required>
          <option value="">Lütfen Bir Seans Saati Seçin</option>
          {seansSaatleri.map((saat) => {
            const dolu = saatDoluMu(saat);
            return (
              <option key={saat} value={saat} disabled={dolu}>
                {saat} {dolu ? "(Dolu)" : ""}
              </option>
            );
          })}
        </select>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] mt-2 shadow-lg shadow-blue-600/30"
        >
          Randevu Talebi Gönder
        </button>
      </form>
    </div>
  );
};

export default RandevuForm;