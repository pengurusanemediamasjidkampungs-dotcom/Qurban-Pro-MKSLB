// TUKAR URL GOOGLE SCRIPT & NO TELEFON DI BAWAH INI
const URL = "https://script.google.com/macros/s/AKfycbzEUBhdwQY4L7eRklbohtek8V_fx8xY4_YbeTeJe38AnlbuLRV0ozxp0Q8vB94T_D2Q/exec";
const TEL = "60133787248";

const sw = Swal.mixin({ background: '#0a1914', color: '#00ff88' });
let kb = document.getElementById('kb'),
    bi = document.getElementById('bi'),
    bw = document.getElementById('bw'),
    nw = document.getElementById('nw'),
    jb = document.getElementById('jb'),
    pi = document.querySelectorAll('.pi');

kb.onchange = () => bi.style.display = (kb.value === 'Online Transfer') ? 'block' : 'none';

document.querySelectorAll('[name="kehadiran"]').forEach(r => r.onchange = () => {
    bw.style.display = (r.value === 'Wakil') ? 'block' : 'none';
    nw.required = (r.value === 'Wakil');
});

const kira = () => {
    let c = 0;
    pi.forEach(i => {
        if (i.value.trim() !== '') c++;
    });
    jb.value = (c > 0) ? c * 900 : '';
};

pi.forEach(i => ['input', 'keyup', 'change'].forEach(e => i.addEventListener(e, kira)));

document.getElementById('btn').onclick = (e) => {
    e.preventDefault();
    let f = document.getElementById('qForm');

    if (!f.checkValidity()) {
        f.reportValidity();
        return sw.fire({ icon: 'warning', title: 'AMARAN', text: 'LENGKAPKAN BORANG', iconColor: '#fc0' })
    }

    sw.fire({ title: 'TRANSMISI DATA', text: 'MENGHANTAR MAKLUMAT...', didOpen: () => Swal.showLoading() });

    fetch(URL, { method: 'POST', body: new FormData(f) }).then(r => {
        if (kb.value === 'Online Transfer') {
            sw.fire({ icon: 'success', title: 'BERJAYA', text: 'SILA HANTAR RESIT KEPADA BENDAHARI', showCancelButton: true, confirmButtonText: 'HANTAR WHATSAPP', cancelButtonText: 'TUTUP' }).then(x => {
                if (x.isConfirmed) {
                    let wtxt = `Assalamualaikum Bendahari. Saya *${document.getElementById('nm').value}* mendaftar Qurban. Jumlah: *RM${jb.value}*. Ini resit saya.`;
                    window.open(`https://wa.me/${TEL}?text=${encodeURIComponent(wtxt)}`, '_blank')
                }
                f.reset();
                bi.style.display = bw.style.display = 'none';
            })
        } else if (kb.value === 'ToyyibPay') {
            sw.fire({ icon: 'success', title: 'BERJAYA', text: 'KE TOYYIBPAY SEBENTAR LAGI...', showConfirmButton: false, timer: 3000 }).then(() => {
                window.location.href = "https://toyyibpay.com/Bayaran-Qurban-2026";
                f.reset();
                bi.style.display = bw.style.display = 'none';
            })
        } else {
            sw.fire('BERJAYA', 'MAKLUMAT DIREKOD. SILA BUAT SERAHAN TUNAI.', 'success').then(() => {
                f.reset();
                bi.style.display = bw.style.display = 'none';
            })
        }
    }).catch(e => sw.fire('RALAT', 'GAGAL HANTAR', 'error'))
};
kira();
