const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

require("dotenv").config();

const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const PORT = process.env.PORT || 3000;

const mongoURI = process.env.MANGO_URI;

mongoose.connect(mongoURI)
    .then(() => console.log("MongoDB Atlas veritabanına başarıyla bağlandık! 🎉"))
    .catch((err) => console.error("Veritabanı bağlantı hatası:", err));

// 🔥 EXPRESS AYARLARI EN ÜSTTE OLMALI
const app = express();
app.use(cors());
app.use(express.json()); // Body içindeki verileri okumak için şart!

// --- ŞEMALAR (SCHEMAS) ---

const randevuSchema = new mongoose.Schema({
    // 🔥 MongoDB ID'leri sayı değil harf+rakam karışımı olduğu için String yaptık
    psikologId: { type: String, required: true }, 
    name: { type: String, required: true },
    surname: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    siraNo: { type: Number, required: true },
    ipAdress:{type: String, required: true}
});

const Randevu = mongoose.model("Randevu", randevuSchema);

const psikologSchema = new mongoose.Schema({
    isim: { type: String, required: true },
    soyad: { type: String, required: true },
    unvan: { type: String, default: "Psikolog" }
});

const Psikolog = mongoose.model("Psikolog", psikologSchema);

// --- PSİKOLOG ROTALARI ---

// 1. PSİKOLOG LİSTELEME (GET)
app.get("/psikologlar", async (req, res) => {
    try {
        const psikologlar = await Psikolog.find();
        res.status(200).json(psikologlar);
    } catch (error) {
        console.error("Psikologları getirme hatası:", error);
        res.status(500).json({ message: "Psikologlar alınamadı." });
    }
});

// 2. PSİKOLOG EKLEME (POST)
app.post("/admin/psikolog", async (req, res) => {
    try {
        const yeniPsikolog = new Psikolog({
            isim: req.body.isim,
            soyad: req.body.soyad,
            unvan: req.body.unvan
        });
        await yeniPsikolog.save();
        res.status(201).json({ message: "Psikolog başarıyla eklendi.", psikolog: yeniPsikolog });
    } catch (error) {
        console.error("Psikolog ekleme hatası:", error);
        res.status(500).json({ message: "Psikolog eklenirken bir hata oluştu." });
    }
});

// 3. PSİKOLOG SİLME (DELETE)
app.delete("/admin/psikolog/:id", async (req, res) => {
    try {
        const silinecekId = req.params.id;
        await Psikolog.findByIdAndDelete(silinecekId);
        res.status(200).json({ message: "Psikolog başarıyla silindi." });
    } catch (error) {
        console.error("Psikolog silme hatası:", error);
        res.status(500).json({ message: "Psikolog silinemedi." });
    }
});

// --- RANDEVU ROTALARI ---

// 1. RANDEVU SİLME (DELETE)
app.delete("/admin/randevu/:id", async (req, res) => {
    try {
        const silinecekId = req.params.id;
        await Randevu.findByIdAndDelete(silinecekId);
        res.status(200).json({ message: "Randevu başarıyla silindi." });
    } catch (error) {
        console.error("Silme hatası:", error);
        res.status(500).json({ message: "Silme işlemi başarısız oldu." });
    }
});

// 2. DOLU SAATLERİ GETİRME (GET)
app.get("/randevular", async (req, res) => {
    const doluR = await Randevu.find().select("date time psikologId");
    res.status(200).json(doluR);
});

// 3. ADMİN RANDEVU LİSTESİ (GET)
app.get("/admin/randevular", async(req,res)=>{
    const adminRandevu = await Randevu.find();
    res.status(200).json(adminRandevu);
});

// 4. RANDEVU OLUŞTURMA (POST)
app.post("/randevu", async (req, res) => {
    try {
        if (!req.body || !req.body.date || !req.body.time || !req.body.name || !req.body.psikolog_id || !req.body.surname) {
            return res.status(400).json({ message: "Tüm bilgileri doldurduğunuzdan emin olun." });
        }

        const { date, time, name, surname, psikolog_id } = req.body;
        const pId = String(psikolog_id); // 🔥 Number yerine String (Metin) yaptık

        // IP KONTROL SİSTEMİ
        const musteriIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const ipKontrol = await Randevu.findOne({ ipAdress: musteriIp });
        
        if (ipKontrol) {
            return res.status(400).json({ message: "Bu cihazdan zaten bir randevu alınmış!" });
        }

        // Sıra No Hesaplama
        const oGunkiRandevular = await Randevu.find({
            psikologId: pId,
            date: date
        });
        const yeniSiraNo = oGunkiRandevular.length + 1;

        // Çakışma Kontrolü
        const cakismaVarMi = await Randevu.findOne({
            psikologId: pId,
            date: date,
            time: time
        });
        
        if (cakismaVarMi) {
            return res.status(400).json({ message: "Randevu almayı düşündüğünüz saatler maalesef dolu." });
        }

        // Kayıt
        const yeniRandevu = new Randevu({
            psikologId: pId,
            name: name,
            surname: surname,
            date: date,
            time: time,
            siraNo: yeniSiraNo,
            ipAdress: musteriIp
        });

        await yeniRandevu.save(); 

        return res.status(201).json({
            message: "Randevunuz Başarılı",
            siraNo: yeniSiraNo,
            ...yeniRandevu._doc 
        });

    } catch (error) {
        console.error("Veritabanı kayıt hatası:", error);
        return res.status(500).json({ message: "Sunucu hatası, randevu oluşturulamadı." });
    }
});

app.listen(PORT, () => {
    console.log(`Server ${PORT} portu üzerinden çalışıyor`);
});