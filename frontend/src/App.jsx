import { useState, useEffect } from "react";
import "./App.css";
import PsikologList from "./components/PsikologList";
import RandevuForm from "./components/RandevuForm";

function App() {
  const [data, setData] = useState([]);
  const [secilenPsikologId, setSecilenPsikologId] = useState(null);
  const [doluRandevular, setDoluRandevular] = useState([]);

  // Dolu randevuları çeken fonksiyonu dışarı çıkardık
  const doluRandevulariGetir = async () => {
    try {
      const response = await fetch("http://localhost:3000/randevular");
      const data = await response.json();
      setDoluRandevular(data);
    } catch (error) {
      console.error("Randevular çekilirken hata oluştu:", error);
    }
  };

  useEffect(() => {
    doluRandevulariGetir();
  }, []);

  useEffect(() => {
    const verileriGetir = async () => {
      const response = await fetch("http://localhost:3000/psikologlar");
      const data = await response.json();
      setData(data);
    };
    verileriGetir();
  }, []);
  
  const handleRandevuOlustur = async (randevuVerisi) => {
     try {
        const response = await fetch("http://localhost:3000/randevu",{
          method: "POST",
          headers: {"Content-Type" : "application/json"},
          body: JSON.stringify(randevuVerisi),
        });

        const veri = await response.json();

        if(response.ok){
          alert(`Randevunuz Başarıyla Alındı!\nSıra Numaranız: ${veri.siraNo}`);
          
          // 🔥 KRİTİK NOKTA: Yeni randevu başarıyla alınınca listeyi anında güncelle!
          doluRandevulariGetir();
          
          // Formu kapatmak istersen buraya ekleyebilirsin:
          setSecilenPsikologId(null); 
        } else {
          alert(`Hata: ${veri.message || "Bir sorun oluştu."}`);
        }
        } catch (error) {
          console.error("İstek hatası:", error);
          alert("Sunucuya bağlanırken bir hata oluştu.");
        }
  };

  return (
    <>
      <PsikologList
        psikologlar={data}
        secilenPsikolog={secilenPsikologId}
        onPsikologSec={setSecilenPsikologId}
      />

      {secilenPsikologId > 0 && (
          <RandevuForm 
            secilenPsikolog={secilenPsikologId}
            onRandevuOlustur={handleRandevuOlustur}
            onKapat={()=>{setSecilenPsikologId(null)}}
            doluRandevular={doluRandevular} // 🔥 Listeyi prop olarak form bileşenine gönderiyoruz
          />
        )
      } 
    </>
  );
}

export default App;