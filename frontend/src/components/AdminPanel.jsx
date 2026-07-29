import { useState } from "react";

function AdminPanel() {
  // Giriş State'leri
  const [girisBasarili, setGirisBasarili] = useState(false);
  const [kullaniciAdi, setKullaniciAdi] = useState("");
  const [sifre, setSifre] = useState("");

  // Veri State'leri
  const [randevular, setRandevular] = useState([]);
  const [psikologlar, setPsikologlar] = useState([]);

  // Yeni Psikolog Ekleme Formu State'leri
  const [yeniIsim, setYeniIsim] = useState("");
  const [yeniSoyad, setYeniSoyad] = useState("");
  const [yeniUnvan, setYeniUnvan] = useState("Psikolog");

  // 1. GİRİŞ YAPMA FONKSİYONU
  const girisYap = (e) => {
    e.preventDefault();
    if (kullaniciAdi === "admin" && sifre === "12345") {
      setGirisBasarili(true);
      verileriCek(); // Giriş başarılıysa hem randevuları hem psikologları getir
    } else {
      alert("Hatalı kullanıcı adı veya şifre!");
    }
  };

  // 2. VERİLERİ ÇEKME FONKSİYONLARI
  const verileriCek = () => {
    randevulariCek();
    psikologlariCek();
  };

  const randevulariCek = async () => {
    try {
      const response = await fetch("http://localhost:3000/admin/randevular");
      const data = await response.json();
      setRandevular(data);
    } catch (error) {
      console.error("Randevu çekme hatası:", error);
    }
  };

  const psikologlariCek = async () => {
    try {
      const response = await fetch("http://localhost:3000/psikologlar");
      const data = await response.json();
      setPsikologlar(data);
    } catch (error) {
      console.error("Psikolog çekme hatası:", error);
    }
  };

  // 3. SİLME FONKSİYONLARI
  const randevuSil = async (id) => {
    const onay = window.confirm("Bu randevuyu silmek istediğine emin misin?");
    if (!onay) return;
    try {
      const response = await fetch(`http://localhost:3000/admin/randevu/${id}`, { method: "DELETE" });
      if (response.ok) {
        alert("Randevu silindi!");
        randevulariCek();
      }
    } catch (error) {
      console.error("Silme hatası:", error);
    }
  };

  const psikologSil = async (id) => {
    const onay = window.confirm("Bu psikoloğu silmek istediğine emin misin?");
    if (!onay) return;
    try {
      const response = await fetch(`http://localhost:3000/admin/psikolog/${id}`, { method: "DELETE" });
      if (response.ok) {
        alert("Psikolog silindi!");
        psikologlariCek();
      }
    } catch (error) {
      console.error("Psikolog silme hatası:", error);
    }
  };

  // 4. PSİKOLOG EKLEME FONKSİYONU
  const psikologEkle = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3000/admin/psikolog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isim: yeniIsim, soyad: yeniSoyad, unvan: yeniUnvan }),
      });
      if (response.ok) {
        alert("Yeni psikolog başarıyla eklendi!");
        setYeniIsim(""); setYeniSoyad(""); setYeniUnvan("Psikolog");
        psikologlariCek(); // Listeyi güncelle
      }
    } catch (error) {
      console.error("Psikolog ekleme hatası:", error);
    }
  };

  // 5. YARDIMCI ZEKÂ: Randevudaki ID'ye bakıp Psikoloğun Adını bulur
  const psikologAdiniBul = (id) => {
    const p = psikologlar.find(psi => psi._id === id || String(psi.id) === String(id));
    return p ? `${p.unvan} ${p.isim} ${p.soyad}` : "Bilinmeyen/Silinmiş Psikolog";
  };

  // EKRAN 1: GİRİŞ YAPILMADIYSA
  if (!girisBasarili) {
    return (
      <div style={{ padding: "50px", textAlign: "center" }}>
        <h2>🔒 Yönetici Girişi</h2>
        <form onSubmit={girisYap}>
          <input type="text" placeholder="Kullanıcı Adı" value={kullaniciAdi} onChange={(e) => setKullaniciAdi(e.target.value)} required />
          <br/><br/>
          <input type="password" placeholder="Şifre" value={sifre} onChange={(e) => setSifre(e.target.value)} required />
          <br/><br/>
          <button type="submit" style={{ cursor: "pointer", padding: "5px 15px" }}>Giriş Yap</button>
        </form>
      </div>
    );
  }

  // EKRAN 2: GİRİŞ BAŞARILIYSA
  return (
    <div style={{ padding: "30px", maxWidth: "1200px", margin: "0 auto", fontFamily: "sans-serif" }}>
      <h1 style={{ textAlign: "center", marginBottom: "40px" }}>⚙️ Yönetici Kontrol Paneli</h1>

      {/* --- PSİKOLOG YÖNETİMİ BÖLÜMÜ --- */}
      <div style={{ marginBottom: "50px", padding: "20px", border: "1px solid #ccc", borderRadius: "8px", backgroundColor: "#f9f9f9" }}>
        <h2>👩‍⚕️ Psikolog Yönetimi</h2>
        
        {/* Psikolog Ekleme Formu */}
        <form onSubmit={psikologEkle} style={{ marginBottom: "20px", display: "flex", gap: "10px", alignItems: "center" }}>
          <input type="text" placeholder="İsim" value={yeniIsim} onChange={(e) => setYeniIsim(e.target.value)} required style={{ padding: "8px" }} />
          <input type="text" placeholder="Soyad" value={yeniSoyad} onChange={(e) => setYeniSoyad(e.target.value)} required style={{ padding: "8px" }} />
          <select value={yeniUnvan} onChange={(e) => setYeniUnvan(e.target.value)} style={{ padding: "8px" }}>
            <option value="Psikolog">Psikolog</option>
            <option value="Klinik Psikolog">Klinik Psikolog</option>
            <option value="Psikiyatrist">Psikiyatrist</option>
          </select>
          <button type="submit" style={{ padding: "8px 15px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>+ Yeni Psikolog Ekle</button>
        </form>

        {/* Psikolog Listesi Tablosu */}
        <table border="1" cellPadding="10" style={{ width: "100%", textAlign: "left", borderCollapse: "collapse", backgroundColor: "white" }}>
          <thead>
            <tr style={{ backgroundColor: "#e9ecef" }}>
              <th>Ünvan</th>
              <th>İsim Soyisim</th>
              <th>İşlem</th>
            </tr>
          </thead>
          <tbody>
            {psikologlar.map((psikolog) => (
              <tr key={psikolog._id || psikolog.id}>
                <td>{psikolog.unvan}</td>
                <td>{psikolog.isim} {psikolog.soyad}</td>
                <td style={{ width: "100px" }}>
                  <button onClick={() => psikologSil(psikolog._id)} style={{ color: "white", backgroundColor: "#dc3545", border: "none", padding: "5px 10px", cursor: "pointer", borderRadius: "3px" }}>Sil</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- RANDEVU YÖNETİMİ BÖLÜMÜ --- */}
      <div style={{ padding: "20px", border: "1px solid #ccc", borderRadius: "8px", backgroundColor: "#f9f9f9" }}>
        <h2>📋 Randevu Kayıtları</h2>
        <table border="1" cellPadding="10" style={{ width: "100%", textAlign: "left", borderCollapse: "collapse", backgroundColor: "white" }}>
          <thead>
            <tr style={{ backgroundColor: "#e9ecef" }}>
              <th>Sıra No</th>
              <th>Doktoru</th>
              <th>Hasta Ad Soyad</th>
              <th>Tarih</th>
              <th>Saat</th>
              <th>İşlem</th>
            </tr>
          </thead>
          <tbody>
            {randevular.map((randevu) => (
              <tr key={randevu._id}>
                <td>{randevu.siraNo}</td>
                {/* ID yerine eşleşen doktorun adını yazdırdığımız yer */}
                <td><strong>{psikologAdiniBul(randevu.psikologId || randevu.psikolog_id)}</strong></td>
                <td>{randevu.name} {randevu.surname}</td>
                <td>{randevu.date}</td>
                <td>{randevu.time}</td>
                <td style={{ width: "100px" }}>
                  <button onClick={() => randevuSil(randevu._id)} style={{ color: "white", backgroundColor: "#dc3545", border: "none", padding: "5px 10px", cursor: "pointer", borderRadius: "3px" }}>İptal Et</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}

export default AdminPanel;