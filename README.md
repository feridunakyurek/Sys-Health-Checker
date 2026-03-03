# 🔍 Sys Health Checker

*[🇹🇷 Türkçe açıklama için aşağıya kaydırın / Scroll down for Turkish version]*

An automatic and intelligent health-check tool that analyzes the status of databases and infrastructure services in your projects within seconds.

## 🚀 Features
- **Zero Configuration:** No setup required, works out of the box.
- **Smart Discovery:** Automatically scans and parses `.env`, `package.json`, `docker-compose.yml`, and `Kubernetes` manifests.
- **Safe Ping:** Listens to ports via TCP. It doesn't ask for passwords or lock the system.
- **Developer-Friendly CLI:** Provides colorful, clear, and solution-oriented error outputs in your terminal.

## 📦 Installation & Usage

To test it instantly in your project without installing anything globally (Recommended):
```bash
npx sys-health-checker
```

Or to install it globally on your machine:
```bash
npm install -g sys-health-checker
```

## 🛠️ How It Works
It scans the directory where you run the command. It discovers your Redis, MongoDB, PostgreSQL, Docker engine, or custom microservices, sends a virtual TCP ping to them, and instantly reports unreachable services. It solves the *"Which service did I forget to start?"* crisis during the development process.

---

# 🇹🇷 Türkçe Açıklama

Projelerinizdeki veritabanı ve altyapı servislerinin durumunu saniyeler içinde analiz eden, otomatik ve akıllı bir sağlık kontrol (health-check) aracıdır.

## 🚀 Özellikler
- **Sıfır Konfigürasyon:** Herhangi bir ayar gerektirmez, doğrudan çalışır.
- **Akıllı Keşif:** `.env`, `package.json`, `docker-compose.yml` ve `Kubernetes` dosyalarını otomatik okur.
- **Güvenli Ping:** TCP üzerinden portları dinler. Şifre sormaz, hatalı giriş sebebiyle sistemi kilitlemez.
- **Kullanıcı Dostu CLI:** Terminalde renkli, anlaşılır ve çözüm odaklı hata çıktıları sunar.

## 📦 Kurulum ve Kullanım

Hiçbir şey indirmeden anında projenizde test etmek için (Önerilen):
```bash
npx sys-health-checker
```

Veya bilgisayarınıza kalıcı olarak kurmak için:
```bash
npm install -g sys-health-checker
```

## 🛠️ Nasıl Çalışır?
Terminalde komutu çalıştırdığınız dizini tarar. Bulduğu Redis, MongoDB, PostgreSQL, Docker veya özel mikroservislerinize sanal bir ping atarak anlık olarak ulaşılamayan servisleri size raporlar. Geliştirme sürecindeki "Acaba hangi servis kapalı kaldı?" krizlerini anında çözer.

---
