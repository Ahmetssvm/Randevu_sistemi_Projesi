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

    const randevuSchema = new mongoose.Schema({
    psikologId: { type: Number, required: true },
    name: { type: String, required: true },
    surname: { type: String, required: true },
    date: { type: String, required: true }, // "YYYY-MM-DD" formatında
    time: { type: String, required: true }, // "11:30" formatında
    siraNo: { type: Number, required: true }
    });

    const Randevu = mongoose.model("Randevu", randevuSchema);

    const psikologlardb = [
        {id: 1, name: "Ahmet", surname: "Sevim"},
        {id: 2, name: "Mehmet", surname: "Gülenç"}
    ];

    const app = express();
    app.use(cors());
    app.use(express.json());

    app.get("/psikologlar", (req, res) => {
        res.json(psikologlardb);
    });

    // Randevu Oluşturma (POST) Rotası
    app.post("/randevu", async (req, res) => {
        try {
            // Eksik bilgi kontrolü
            if (!req.body || !req.body.date || !req.body.time || !req.body.name || !req.body.psikolog_id || !req.body.surname) {
                return res.status(400).json({ message: "Tüm bilgileri doldurduğunuzdan emin olun." });
            }

            const { date, time, name, surname, psikolog_id } = req.body;
            const pId = Number(psikolog_id);

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

            // Yeni Randevuyu Veritabanına Kaydetme
            const yeniRandevu = new Randevu({
                psikologId: pId,
                name: name,
                surname: surname,
                date: date,
                time: time,
                siraNo: yeniSiraNo,
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

    app.get("/randevular", async (req, res) => {
    // Sadece date ve time değil, psikologId'yi de gönderiyoruz!
    const doluR = await Randevu.find().select("date time psikologId");
    res.status(200).json(doluR);
    });



    app.listen(PORT, () => {
        console.log(`Server ${PORT} portu üzerinden çalışıyor`);
    });