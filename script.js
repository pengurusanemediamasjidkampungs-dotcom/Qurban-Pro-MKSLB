// Menunggu dokumen selesai dimuatkan
document.addEventListener('DOMContentLoaded', () => {
    console.log("Sistem Qurban 2026 sedia.");
    
    // Contoh paparan notifikasi mula
    /*
    Swal.fire({
        title: 'Selamat Datang!',
        text: 'Sistem Qurban 2026 telah diaktifkan.',
        icon: 'success',
        confirmButtonColor: '#00ff88'
    });
    */

    const app = document.getElementById('app');
    if(app) {
        app.innerHTML = '<p>Sila masukkan data peserta qurban.</p>';
    }
});
