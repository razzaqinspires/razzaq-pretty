# Razzaq Pretty ✨

[![npm version](https://img.shields.io/npm/v/razzaq-pretty.svg)](https://www.npmjs.com/package/razzaq-pretty)
[![Build Status](https://img.shields.io/travis/com/your-username/razzaq-pretty.svg)](https://travis-ci.com/your-username/razzaq-pretty)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

*An uncompromising, AST-based code formatter designed for superior consistency and extensibility.*

**Razzaq Pretty** bukan sekadar pemformat kode. Ini adalah *enforcer* standar yang memastikan setiap baris kode di seluruh proyek Anda mematuhi doktrin kejelasan dan presisi yang absolut. Dibangun di atas Abstract Syntax Tree (AST), ia memahami kode Anda pada tingkat struktural, memungkinkan manipulasi yang cerdas dan aman yang tidak mungkin dicapai oleh alat berbasis regex.

## Fitur Unggulan

* **Mesin Berbasis AST:** Memanipulasi kode dengan pemahaman sintaksis penuh, bukan sekadar teks.
* **Performa Superior:** Menggunakan *worker threads* untuk pemrosesan paralel dan *cache* berbasis hash cerdas untuk hanya memformat file yang berubah.
* **Sangat Dapat Dikonfigurasi:** Kontrol setiap aspek pemformatan, mulai dari indentasi hingga plugin kustom, melalui file `.razzaqrc` yang sederhana.
* **Sistem Plugin:** Perluas fungsionalitas inti dengan plugin bawaan untuk aturan yang lebih kompleks, seperti melarang `console.log` atau mengelola baris kosong secara cerdas.
* **Inisialisasi Otomatis:** Hasilkan file konfigurasi yang sempurna secara otomatis, menghilangkan kemungkinan *human error*.

## Instalasi

### Untuk Penggunaan CLI
Instalasi paket secara global untuk mengakses perintah `razzaq-pretty` dari mana saja.
```bash
npm install -g razzaq-pretty
```

### Untuk Penggunaan Pustaka (Programmatic)
Tambahkan sebagai dependensi ke proyek Anda.
```bash
npm install razzaq-pretty
```

## Penggunaan

### 1. Command-Line Interface (CLI)

Setelah instalasi global, Anda dapat langsung menggunakannya.

**Langkah 1: Inisialisasi (Satu Kali per Proyek)**
Navigasi ke root direktori proyek Anda dan jalankan:
```bash
razzaq-pretty --init
```
Perintah ini akan membuat file `.razzaqrc` dengan konfigurasi default yang disarankan.

**Langkah 2: Eksekusi**
Jalankan pemformat pada file atau direktori target Anda.
```bash
# Lakukan dry-run (periksa file yang akan diubah tanpa menyimpannya)
razzaq-pretty "src/**/*.js"

# Tulis perubahan ke file
razzaq-pretty --write "src/**/*.js"

# Paksa pemformatan ulang semua file (abaikan cache)
razzaq-pretty --write --no-cache "src/**/*.js"
```

### 2. Pustaka (Programmatic)

Impor dan gunakan fungsi `formatCode` di dalam proyek Node.js Anda.

```javascript
import { formatCode } from 'razzaq-pretty';

const sourceCode = 'const x = 1;;';

async function run() {
  const formattedCode = await formatCode(sourceCode, {
    semi: true,
    lineWidth: 80,
  });
  console.log(formattedCode);
}

run();
```

## Konfigurasi (`.razzaqrc`)

Atur perilaku pemformat melalui file `.razzaqrc` di root proyek Anda. Gunakan `razzaq-pretty --init` untuk menghasilkan file ini secara otomatis.

Berikut adalah contoh konfigurasi lengkap:
```json
{
  "indent": 2,
  "quote": "'",
  "lineWidth": 100,
  "semi": true,
  "watermark": true,
  "stripComments": false,
  "workers": 4,
  "plugins": [
    "removeExtraBlankLines",
    "disallowConsoleLog"
  ]
}
```

| Kunci             | Tipe      | Deskripsi                                                                 |
| ----------------- | --------- | ------------------------------------------------------------------------- |
| `indent`          | `Number`  | Jumlah spasi per indentasi.                                               |
| `quote`           | `String`  | Jenis kutip yang digunakan (`'` atau `"`).                                   |
| `lineWidth`       | `Number`  | Panjang baris maksimum.                                                   |
| `semi`            | `Boolean` | `true` untuk menambahkan titik koma.                                        |
| `watermark`       | `Boolean` | `true` untuk menambahkan watermark `Formatted by Razzaq-Formatter`.         |
| `stripComments`   | `Boolean` | `true` untuk menghapus semua komentar.                                      |
| `workers`         | `Number`  | Jumlah *thread* paralel yang akan digunakan.                                |
| `plugins`         | `Array`   | Daftar plugin AST bawaan yang akan diaktifkan.                              |

## Lisensi

Didistribusikan di bawah Lisensi MIT. Lihat `LICENSE` untuk informasi lebih lanjut.
