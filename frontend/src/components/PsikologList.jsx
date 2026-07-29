import React from "react";

const PsikologList = ({ psikologlar, secilenPsikolog, onPsikologSec }) => {
  // Eğer veritabanında hiç psikolog yoksa ekranda uyarı gösterelim
  if (!psikologlar || psikologlar.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <h2 className="text-xl text-slate-500 font-medium">Şu an sistemde kayıtlı psikolog bulunmamaktadır.</h2>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto mt-12 p-6">
      <h1 className="text-3xl font-bold text-center text-slate-800 mb-10">Uzman Kadromuz</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {psikologlar.map((psikolog) => {
          // MongoDB'nin özel ID'si '_id' olarak gelir. Eski sistemden kalan varsa diye ikisini de kontrol ediyoruz.
          const id = psikolog._id || psikolog.id; 
          const seciliMi = secilenPsikolog === id;

          return (
            <div 
              key={id}
              onClick={() => onPsikologSec(id)}
              className={`p-8 rounded-3xl cursor-pointer transition-all duration-300 border-2 ${
                seciliMi 
                  ? "border-blue-500 bg-blue-50 shadow-xl scale-105" 
                  : "border-slate-100 bg-white shadow-md hover:shadow-lg hover:border-blue-300"
              }`}
            >
              <div className="flex flex-col items-center text-center">
                {/* Profil resmi yerine isim ve soyismin baş harflerini gösteren şık bir balon */}
                <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl font-bold mb-5 shadow-inner">
                  {psikolog.isim?.charAt(0)}{psikolog.soyad?.charAt(0)}
                </div>
                
                <h2 className="text-2xl font-bold text-slate-800">
                  {psikolog.isim} {psikolog.soyad}
                </h2>
                <p className="text-blue-600 font-medium mt-2 text-lg">{psikolog.unvan}</p>
                
                <button 
                  className={`mt-6 w-full py-3 rounded-xl font-bold transition-colors ${
                    seciliMi 
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/30" 
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {seciliMi ? "Seçildi (Formu Doldurun)" : "Randevu Al"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PsikologList;