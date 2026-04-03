// TUKAR URL GOOGLE SCRIPT & NO TELEFON DI BAWAH INI
const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbzEUBhdwQY4L7eRklbohtek8V_fx8xY4_YbeTeJe38AnlbuLRV0ozxp0Q8vB94T_D2Q/exec";
const WHATSAPP_TEL_NUMBER = "60133787248";

// Cache DOM elements for better performance and readability
const form = document.getElementById('qForm');
const paymentMethodSelect = document.getElementById('kb');
const bankInfoDiv = document.getElementById('bi');
const representativeInfoDiv = document.getElementById('bw');
const representativeNameInput = document.getElementById('nw');
const totalPaymentInput = document.getElementById('jb');
const participantNameInputs = document.querySelectorAll('.pi');
const submitButton = document.getElementById('btn');
const participantNameFullInput = document.getElementById('nm'); // Input untuk Nama Penuh Pewakil

// Initialize SweetAlert2 mixin with custom styles
const swalMixin = Swal.mixin({
    background: '#0a1914', // Dark background for the alert
    color: '#e2f1ec',     // Light text color
    confirmButtonColor: '#00ff88', // Green for confirm button
    cancelButtonColor: '#dc3545'  // Red for cancel button
});

// --- Event Listeners ---

// 1. Event Listener for Payment Method Selection
// Shows/hides bank account info based on 'Online Transfer' selection.
paymentMethodSelect.addEventListener('change', () => {
    bankInfoDiv.style.display = (paymentMethodSelect.value === 'Online Transfer') ? 'block' : 'none';
});

// 2. Event Listeners for Attendance (Kehadiran) Radio Buttons
// Shows/hides representative name input and sets its 'required' attribute.
document.querySelectorAll('[name="kehadiran"]').forEach(radio => {
    radio.addEventListener('change', () => {
        representativeInfoDiv.style.display = (radio.value === 'Wakil') ? 'block' : 'none';
        representativeNameInput.required = (radio.value === 'Wakil');

        // Clear the representative name if "Hadir" is selected
        if (radio.value === 'Hadir') {
            representativeNameInput.value = '';
        }
    });
});

// 3. Function to Calculate Total Payment based on active participants
const calculateTotalPayment = () => {
    let activeParticipantsCount = 0;
    participantNameInputs.forEach(input => {
        if (input.value.trim() !== '') { // Count only if the input has text
            activeParticipantsCount++;
        }
    });
    // Display total payment, formatted to 2 decimal places for currency.
    // If no participants, clear the total payment field.
    totalPaymentInput.value = (activeParticipantsCount > 0) ? (activeParticipantsCount * 900).toFixed(2) : '';
};

// 4. Add Event Listeners to participant name inputs for live calculation
// Any change (input, keyup, change) in participant names triggers recalculation.
participantNameInputs.forEach(input => {
    ['input', 'keyup', 'change'].forEach(event => input.addEventListener(event, calculateTotalPayment));
});

// 5. Event Listener for Form Submission
submitButton.addEventListener('click', async (event) => {
    event.preventDefault(); // Prevent the default form submission behavior

    // Validate the form before submission
    if (!form.checkValidity()) {
        form.reportValidity(); // Show native browser validation messages
        return swalMixin.fire({
            icon: 'warning',
            title: 'AMARAN',
            text: 'SILA LENGKAPKAN SEMUA RUANGAN YANG DIPERLUKAN.',
            iconColor: '#fc0' // Custom warning icon color
        });
    }

    // Show loading SweetAlert while data is being transmitted
    swalMixin.fire({
        title: 'TRANSMISI DATA',
        text: 'MENGHANTAR MAKLUMAT BORANG...',
        allowOutsideClick: false, // Prevent closing the alert by clicking outside
        didOpen: () => Swal.showLoading() // Show a loading spinner
    });

    try {
        // Send form data to Google Sheet using fetch API
        const response = await fetch(GOOGLE_SHEET_URL, {
            method: 'POST',
            body: new FormData(form) // Automatically constructs key-value pairs from form fields
        });

        // Check if the HTTP response indicates success (status 2xx)
        if (!response.ok) {
            // Throw an error if the server response was not OK
            throw new Error(`Ralat HTTP! Status: ${response.status}`);
        }

        // Handle different payment methods after successful form submission
        if (paymentMethodSelect.value === 'Online Transfer') {
            swalMixin.fire({
                icon: 'success',
                title: 'BERJAYA',
                text: 'BORANG TELAH DIHANTAR. SILA HANTAR RESIT PEMBAYARAN ONLINE KEPADA BENDAHARI UNTUK PENGESAHAN.',
                showCancelButton: true,
                confirmButtonText: 'HANTAR RESIT VIA WHATSAPP',
                cancelButtonText: 'TUTUP'
            }).then(result => {
                if (result.isConfirmed) {
                    // Construct WhatsApp message with participant's name and total payment
                    const whatsappMessage = `Assalamualaikum Bendahari. Saya *${participantNameFullInput.value.trim()}* telah mendaftar Qurban. Jumlah pembayaran: *RM${totalPaymentInput.value}*. Ini adalah notifikasi pendaftaran saya, dan resit akan dihantar secara berasingan. Terima kasih.`;
                    // Open WhatsApp chat in a new tab
                    window.open(`https://wa.me/${WHATSAPP_TEL_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`, '_blank');
                }
                resetFormState(); // Reset form and UI
            });
        } else if (paymentMethodSelect.value === 'ToyyibPay') {
            swalMixin.fire({
                icon: 'success',
                title: 'BERJAYA',
                text: 'BORANG TELAH DIHANTAR. ANDA AKAN DIHALAKAN KE LAMAN PEMBAYARAN TOYYIBPAY SEBENTAR LAGI...',
                showConfirmButton: false, // No confirm button, auto-redirect
                timer: 3000 // Redirect after 3 seconds
            }).then(() => {
                // Redirect to ToyyibPay payment gateway
                window.location.href = "https://toyyibpay.com/Bayaran-Qurban-2026";
                resetFormState(); // Reset form and UI
            });
        } else { // 'Tunai'
            swalMixin.fire({
                icon: 'success',
                title: 'BERJAYA',
                text: 'BORANG TELAH DIHANTAR. SILA BUAT SERAHAN TUNAI KEPADA AJK MASJID UNTUK PENGESAHAN.',
            }).then(() => {
                resetFormState(); // Reset form and UI
            });
        }
    } catch (error) {
        // Handle any errors during the fetch operation
        console.error("Ralat ketika menghantar borang:", error);
        swalMixin.fire({
            icon: 'error',
            title: 'RALAT',
            text: `Gagal menghantar borang. Sila semak sambungan internet anda atau cuba lagi. (${error.message})`
        });
    }
});

// --- Utility Functions ---

// Function to reset the form and relevant UI states
const resetFormState = () => {
    form.reset(); // Resets all form fields to their initial state
    bankInfoDiv.style.display = 'none'; // Hide bank info
    representativeInfoDiv.style.display = 'none'; // Hide representative info
    representativeNameInput.required = false; // Ensure representative name is not required after reset
    calculateTotalPayment(); // Recalculate to clear the total payment field
};

// --- Initial Setup ---

// Perform initial total payment calculation when the page loads
// This ensures the total payment field reflects any pre-filled data or is empty correctly.
calculateTotalPayment();

// You can request an image of the form by outputting
