import React from "react";

const PsikologList = ({ psikologlar, secilenPsikolog, onPsikologSec }) => {
  return (
    <ul className="flex flex-wrap justify-center gap-6 p-6">
      {psikologlar.map((psikolog) => (
        <li
          key={psikolog.id}
          className={`relative w-72 p-6 rounded-3xl border transition-all duration-300 ease-in-out transform hover:-translate-y-2 hover:shadow-2xl 
            ${secilenPsikolog === psikolog.id 
              ? "bg-blue-600 border-blue-400 text-white shadow-blue-500/20" 
              : "bg-white border-slate-100 text-slate-800 shadow-slate-200"}`}
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-[10px] tracking-widest uppercase font-bold opacity-60">PSİKOLOG</span>
            <h2 className="text-xl font-semibold">
              {psikolog.name} {psikolog.surname}
            </h2>
          </div>

          <div className="flex justify-center mt-8">
            <button
              className={`px-6 py-2 rounded-full font-medium transition-all duration-200 cursor-pointer
                ${secilenPsikolog === psikolog.id 
                  ? "bg-white text-blue-600 hover:bg-blue-50" 
                  : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/30"}`}
              onClick={() => onPsikologSec(psikolog.id)}
            >
              {secilenPsikolog === psikolog.id ? "Seçildi" : "Randevu Al"}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default PsikologList;