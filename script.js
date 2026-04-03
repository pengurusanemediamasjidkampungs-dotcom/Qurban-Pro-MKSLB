/**
 * Sistem Qurban 2026 - Logic Script
 * Developed for MKSLB Digital Hub
 */

document.addEventListener('DOMContentLoaded', () => {
    const qurbanForm = document.getElementById('qurbanForm');
    const bahagianInput = document.getElementById('bilangan_bahagian');
    const totalDisplay = document.getElementById('total_bayaran');
    
    // Harga tetap satu bahagian (Contoh: RM 800.00)
    const HARGA_PER_BAHAGIAN = 800;

    // 1. Kemaskini jumlah bayaran secara real-time
    if (bahagianInput) {
        bahagianInput.addEventListener('input', (e) => {
            const bil = parseInt(e.target.value) || 0;
            const total = bil * HARGA_PER_BAHAGIAN;
            totalDisplay.textContent = `RM ${total.toLocaleString('ms-MY', { minimumFractionDigits: 2 })}`;
        });
    }

    // 2. Kendalikan penghantaran borang
    if (qurbanForm) {
        qurbanForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Ambil data borang
            const formData = new FormData(qurbanForm);
            const data = Object.fromEntries(formData.entries());

            // Validasi ringkas
            if (!data.nama_penuh || !data.no_telefon || data.bilangan_bahagian < 1) {
                Swal.fire({
                    icon: 'error',
                    title: 'Maklumat Tidak Lengkap',
                    text: 'Sila pastikan semua ruangan wajib diisi dengan betul.',
                    confirmButtonColor: '#00ff88'
                });
                return;
            }

            // Paparan Loading (Glassmorphism Style)
            Swal.fire({
                title: 'Memproses Pendaftaran...',
                html: 'Sila tunggu sebentar sementara sistem mengesahkan data anda.',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            try {
                // Simulasi penghantaran ke backend (API/Google Apps Script)
                const response = await simulateSubmit(data);

                if (response.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Pendaftaran Berjaya!',
                        html: `Terima kasih <b>${data.nama_penuh}</b>. <br> Sila semak aplikasi Telegram/WhatsApp untuk langkah pembayaran seterusnya.`,
                        confirmButtonText: 'Selesai',
                        confirmButtonColor: '#00ff88',
                        background: 'rgba(6, 20, 15, 0.95)',
                        color: '#e2f1ec'
                    }).then(() => {
                        qurbanForm.reset();
                        totalDisplay.textContent = 'RM 0.00';
                    });
                }
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Ralat Sistem',
                    text: 'Gagal menghubungi pelayan. Sila cuba sebentar lagi.',
                    confirmButtonColor: '#dc3741'
                });
            }
        });
    }
});

/**
 * Simulasi fungsi hantar data
 * Anda boleh gantikan ini dengan fetch() ke endpoint API anda
 */
function simulateSubmit(data) {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log("Data diterima:", data);
            resolve({ success: true });
        }, 2000);
    });
}

// Fungsi tambahan untuk utiliti UI
function formatRupiah(angka, prefix) {
    var number_string = angka.replace(/[^,\d]/g, '').toString(),
        split = number_string.split(','),
        sisa = split[0].length % 3,
        rupiah = split[0].substr(0, sisa),
        ribuan = split[0].substr(sisa).match(/\d{3}/gi);

    if (ribuan) {
        separator = sisa ? '.' : '';
        rupiah += separator + ribuan.join('.');
    }

    rupiah = split[1] != undefined ? rupiah + ',' + split[1] : rupiah;
    return prefix == undefined ? rupiah : (rupiah ? 'RM ' + rupiah : '');
}
