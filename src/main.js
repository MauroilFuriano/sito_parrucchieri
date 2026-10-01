// Initialize Lucide Icons
lucide.createIcons();

// Mobile Menu Toggle
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

mobileMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
});

// Close mobile menu on link click
document.querySelectorAll('#mobile-menu a').forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
    });
});

// Navbar background on scroll
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('shadow-sm');
    } else {
        navbar.classList.remove('shadow-sm');
    }
});

// --- Scroll Reveal Animation (esteso con varianti 2026) ---
// Seleziona tutti gli elementi con qualsiasi variante di reveal
const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            revealObserver.unobserve(entry.target); // Anima solo una volta
        }
    });
}, {
    root: null,
    threshold: 0.1, // Trigger al 10% di visibilità
    rootMargin: "0px 0px -50px 0px"
});

// --- Smart Chatbot Logic ---
const chatToggle = document.getElementById('chat-toggle');
const chatWindow = document.getElementById('chat-window');
const closeChat = document.getElementById('close-chat');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const chatMessages = document.getElementById('chat-messages');

let isChatOpen = false;
let welcomeMessageSent = false;

// Pricing Data
const pricingData = {
    donna: {
        piega: "La piega parte da 20€, include lavaggio specifico e styling.",
        taglio: "Il taglio donna parte da 35€, include consulenza d'immagine.",
        colore: "Il colore completo senza ammoniaca parte da 45€.",
        balayage: "Il balayage con schiariture personalizzate parte da 80€."
    },
    uomo: {
        taglio: "Il taglio uomo classico parte da 25€, mentre il taglio sfumato (skin fade) parte da 30€.",
        barba: "La regolazione barba con panno caldo parte da 15€."
    },
    generale: {
        prezzo: "I nostri prezzi variano in base al servizio. Taglio uomo da 25€, taglio donna da 35€, piega da 20€, colore da 45€. Quale servizio ti interessa in particolare?",
        orari: "Siamo aperti dal Martedì al Sabato, dalle 09:00 alle 19:00. Domenica e Lunedì siamo chiusi.",
        prenotare: "Puoi prenotare compilando il form nella sezione 'Contatti' oppure chiamandoci allo 06 12345678.",
        promozioni: "Attualmente abbiamo 3 promozioni attive: 1) 'Martedì Studenti' con il -20% su taglio e piega. 2) 'Pacchetto Sposa' a partire da 250€. 3) 'Porta un Amico' per avere un trattamento omaggio. Ti interessa una di queste?"
    }
};

// Toggle Chat
function toggleChat() {
    isChatOpen = !isChatOpen;
    if (isChatOpen) {
        chatWindow.classList.remove('hidden');
        // Stop pulse animation when open
        chatToggle.classList.remove('animate-[pulse_3s_ease-in-out_infinite]');

        // Small delay for animation
        setTimeout(() => {
            chatWindow.classList.remove('scale-95', 'opacity-0', 'translate-y-4');
            chatWindow.classList.add('scale-100', 'opacity-100', 'translate-y-0');
        }, 10);

        // Remove notification dot
        const dot = chatToggle.querySelector('.bg-red-500');
        if (dot) dot.remove();

        if (!welcomeMessageSent) {
            setTimeout(() => {
                addMessage("Ciao! 👋 Benvenuto ad Aura Style Studio. Come posso aiutarti oggi? Chiedimi pure informazioni su prezzi, servizi, orari o promozioni attive.", 'bot');
                welcomeMessageSent = true;
            }, 500);
        }
        chatInput.focus();
    } else {
        chatWindow.classList.remove('scale-100', 'opacity-100', 'translate-y-0');
        chatWindow.classList.add('scale-95', 'opacity-0', 'translate-y-4');

        // Resume pulse animation when closed
        setTimeout(() => {
            chatToggle.classList.add('animate-[pulse_3s_ease-in-out_infinite]');
        }, 300);

        setTimeout(() => {
            chatWindow.classList.add('hidden');
        }, 300);
    }
}

chatToggle.addEventListener('click', toggleChat);
closeChat.addEventListener('click', toggleChat);

// Add Message to Chat
function addMessage(text, sender, isHtml = false) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `max-w-[80%] rounded-2xl px-4 py-2 text-sm ${sender === 'user' ? 'bg-carbone text-panna self-end rounded-br-sm' : 'bg-white border text-gray-800 self-start rounded-bl-sm shadow-sm border-white/20 dark:border-white/10 dark:bg-carbone/70 backdrop-blur-md'}`;
    // Applying some glassmorphism classes tentatively directly to chat bubbles for premium feel
    if (sender !== 'user') {
        msgDiv.className = `max-w-[80%] rounded-2xl px-4 py-2 text-sm text-gray-800 self-start rounded-bl-sm shadow-sm bg-white border border-gray-100`;
    }

    if (isHtml) {
        msgDiv.innerHTML = text;
    } else {
        msgDiv.textContent = text;
    }

    // Add typing animation for bot
    if (sender === 'bot') {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'bg-white border border-gray-100 self-start rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex space-x-1 mb-2';
        typingDiv.innerHTML = '<div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div><div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div><div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>';
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        setTimeout(() => {
            typingDiv.remove();
            chatMessages.appendChild(msgDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 1000);
    } else {
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

// Bot Logic
async function getBotResponse(input) {
    const text = input.toLowerCase();

    const bookBtn = (serviceValue) => `<br><button onclick="prefillBooking('${serviceValue}')" class="mt-3 text-xs bg-oro text-carbone px-4 py-2 rounded-full font-medium hover:scale-105 active:scale-95 transition-all shadow-md shadow-oro/20">Prenota questo servizio</button>`;
    const checkAvailBtn = () => `<br><button onclick="goToCalendar()" class="mt-3 text-xs border border-oro text-oro px-4 py-2 rounded-full font-medium hover:bg-oro hover:text-carbone hover:scale-105 active:scale-95 transition-all shadow-sm">Controlla Calendario</button>`;

    if (text.includes('disponibilit') || text.includes('liber') || text.includes('posto')) {
        let dateToCheck = null;
        const today = new Date();
        if (text.includes('oggi')) {
            dateToCheck = today.toISOString().split('T')[0];
        } else if (text.includes('domani')) {
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            dateToCheck = tomorrow.toISOString().split('T')[0];
        }

        if (dateToCheck) {
            try {
                const allAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
                const bookedTimes = allAppointments.filter(app => app.date === dateToCheck).map(app => app.time);
                const allSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
                const availableSlots = allSlots.filter(s => !bookedTimes.includes(s));
                
                if (availableSlots.length > 0) {
                    const slots = availableSlots.slice(0, 3).join(', ');
                    const more = availableSlots.length > 3 ? ' e altri...' : '';
                    return `Sì, per ${text.includes('oggi') ? 'oggi' : 'domani'} abbiamo disponibilità! Alcuni orari liberi: <b>${slots}${more}</b>.<br>Vuoi prenotare?` + bookBtn('');
                } else {
                    return `Mi dispiace, per ${text.includes('oggi') ? 'oggi' : 'domani'} siamo al completo. Vuoi controllare un'altra data?` + checkAvailBtn();
                }
            } catch (e) {
                return "Puoi verificare gli orari liberi selezionando una data nel nostro modulo di prenotazione." + checkAvailBtn();
            }
        }

        return "Per quale data desideri controllare la disponibilità? Puoi visualizzare tutti gli orari liberi aprendo il nostro calendario." + checkAvailBtn();
    }

    if (text.includes('taglio') && text.includes('uomo')) return pricingData.uomo.taglio + bookBtn('taglio_uomo');
    if (text.includes('taglio') && text.includes('donna')) return pricingData.donna.taglio + bookBtn('taglio_donna');
    if (text.includes('taglio')) return "Il taglio uomo parte da 25€, mentre il taglio donna da 35€. Per chi è il taglio?";

    if (text.includes('piega')) return pricingData.donna.piega + bookBtn('piega_donna');
    if (text.includes('colore') || text.includes('tinta')) return pricingData.donna.colore + bookBtn('colore_donna');
    if (text.includes('balayage') || text.includes('schiariture')) return pricingData.donna.balayage + bookBtn('balayage_donna');
    if (text.includes('barba')) return pricingData.uomo.barba + bookBtn('barba_uomo');

    if (text.includes('promo') || text.includes('scont') || text.includes('offert')) return pricingData.generale.promozioni;

    if (text.includes('prezzo') || text.includes('prezzi') || text.includes('costo') || text.includes('quanto costa')) return pricingData.generale.prezzo;
    if (text.includes('orari') || text.includes('aperti') || text.includes('chiusura')) return pricingData.generale.orari;
    if (text.includes('prenota') || text.includes('appuntamento')) return pricingData.generale.prenotare + bookBtn('');
    if (text.includes('ciao') || text.includes('salve') || text.includes('buongiorno')) return "Ciao! Come posso esserti utile oggi?";

    return "Mi dispiace, non ho capito bene. Puoi chiedermi i prezzi di tagli, piega, colore, promozioni attive o informazioni su disponibilità e prenotazioni.";
}

window.prefillBooking = function (serviceValue) {
    // Close chat
    toggleChat();

    // Scroll to booking section
    document.getElementById('prenota').scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Select service
    const serviceSelect = document.getElementById('booking-service');
    if (serviceValue) {
        serviceSelect.value = serviceValue;
    }

    // Focus on name input
    setTimeout(() => {
        document.getElementById('booking-name').focus();
        // Add a highlight effect to the form
        const form = document.getElementById('booking-form');
        form.classList.add('ring-2', 'ring-oro', 'rounded-2xl', 'p-4', 'transition-all', 'duration-500', 'bg-white/50');
        setTimeout(() => {
            form.classList.remove('ring-2', 'ring-oro', 'rounded-2xl', 'p-4', 'bg-white/50');
        }, 2000);
    }, 800);
};

window.goToCalendar = function () {
    toggleChat();
    document.getElementById('prenota').scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => {
        const dateInput = document.getElementById('booking-date');
        dateInput.focus();
        dateInput.showPicker && dateInput.showPicker(); // Try to open the native date picker if supported

        const form = document.getElementById('booking-form');
        form.classList.add('ring-2', 'ring-oro', 'rounded-2xl', 'p-4', 'transition-all', 'duration-500', 'bg-white/50');
        setTimeout(() => {
            form.classList.remove('ring-2', 'ring-oro', 'rounded-2xl', 'p-4', 'bg-white/50');
        }, 2000);
    }, 800);
};

// Handle Form Submit
chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;

    // Add user message
    addMessage(text, 'user', false);
    chatInput.value = '';

    // Get and add bot response
    const response = await getBotResponse(text);
    addMessage(response, 'bot', true);
});

// --- Booking Logic ---
const bookingDate = document.getElementById('booking-date');
const bookingTime = document.getElementById('booking-time');
const bookingForm = document.getElementById('booking-form');
const bookingMessage = document.getElementById('booking-message');

// Set min date to today
const today = new Date().toISOString().split('T')[0];
if (bookingDate) bookingDate.setAttribute('min', today);

if (bookingDate) {
    bookingDate.addEventListener('change', async (e) => {
        const date = e.target.value;
        if (!date) {
            bookingTime.disabled = true;
            bookingTime.innerHTML = '<option value="">Seleziona prima una data</option>';
            return;
        }

        bookingTime.disabled = true;
        bookingTime.innerHTML = '<option value="">Caricamento orari...</option>';

        try {
            const allAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
            const bookedTimes = allAppointments.filter(app => app.date === date).map(app => app.time);

            const allSlots = [
                '09:00', '10:00', '11:00', '12:00',
                '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
            ];

            bookingTime.innerHTML = '<option value="">Seleziona Orario</option>';
            let availableCount = 0;

            allSlots.forEach(slot => {
                const isAvailable = !bookedTimes.includes(slot);
                const option = document.createElement('option');
                option.value = slot;

                if (isAvailable) {
                    option.textContent = slot;
                    availableCount++;
                } else {
                    option.textContent = `${slot} - Occupato`;
                    option.disabled = true;
                    option.className = 'text-gray-300 bg-gray-50 italic';
                }
                bookingTime.appendChild(option);
            });

            bookingTime.disabled = false;

            if (availableCount === 0) {
                bookingTime.options[0].textContent = 'Tutto occupato per questa data';
            }
        } catch (err) {
            console.error(err);
            bookingTime.innerHTML = '<option value="">Errore caricamento</option>';
        }
    });
}

if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('booking-submit');
        const submitText = document.getElementById('booking-submit-text');
        const submitSpinner = document.getElementById('booking-submit-spinner');
        const submitCheck = document.getElementById('booking-submit-check');
        const messageContainer = document.getElementById('booking-message-container');
        const messageIcon = document.getElementById('booking-message-icon');

        // Reset state - assicurati che spunta e spinner siano nascosti
        submitBtn.disabled = true;
        submitText.style.opacity = '0';
        submitSpinner.style.display = 'block';
        submitCheck.style.display = 'none';
        messageContainer.classList.add('hidden', 'opacity-0', 'translate-y-2');
        messageContainer.classList.remove('bg-green-50', 'border-green-200', 'text-green-800', 'bg-red-50', 'border-red-200', 'text-red-800');

        let isSuccess = false; // Flag per tracciare se la prenotazione è riuscita

        const payload = {
            name: document.getElementById('booking-name').value,
            phone: document.getElementById('booking-phone').value,
            service: document.getElementById('booking-service').value,
            date: bookingDate.value,
            time: bookingTime.value
        };

        try {
            const allAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
            const isBooked = allAppointments.some(app => app.date === payload.date && app.time === payload.time);
            
            if (isBooked) throw new Error("Orario già prenotato");
            
            allAppointments.push({ ...payload, id: Date.now() });
            localStorage.setItem('appointments', JSON.stringify(allAppointments));

            await new Promise(r => setTimeout(r, 600)); // Simula caricamento

            submitSpinner.style.display = 'none';

            // Success state
            isSuccess = true;
            submitBtn.classList.add('bg-green-600', 'hover:bg-green-700');
            submitBtn.classList.remove('bg-carbone', 'hover:bg-oro');

            messageContainer.classList.add('bg-green-50', 'border-green-200', 'text-green-800');
            messageIcon.setAttribute('data-lucide', 'check-circle-2');
            messageIcon.classList.add('text-green-500');
            messageIcon.classList.remove('text-red-500');
            bookingMessage.innerHTML = '<b>Prenotazione confermata!</b><br>Ti aspettiamo in salone. Riceverai presto un promemoria.';

            bookingForm.reset();
            bookingTime.disabled = true;
            bookingTime.innerHTML = '<option value="">Seleziona prima una data</option>';

            // Reset button e messaggio dopo 4 secondi
            setTimeout(() => {
                const checkIcon = document.getElementById('booking-submit-check');
                const textSpan = document.getElementById('booking-submit-text');
                const btn = document.getElementById('booking-submit');

                if (checkIcon) checkIcon.style.display = 'none';
                if (textSpan) textSpan.style.opacity = '1';

                if (btn) {
                    btn.classList.remove('bg-green-600', 'hover:bg-green-700');
                    btn.style.backgroundColor = '';
                    btn.className = 'w-full bg-carbone text-panna py-3 uppercase tracking-widest text-sm hover:bg-oro transition-colors relative overflow-hidden flex items-center justify-center';
                    btn.disabled = false;
                }

                messageContainer.classList.add('opacity-0', 'translate-y-2');
                setTimeout(() => {
                    messageContainer.classList.add('hidden');
                    messageContainer.classList.remove('bg-green-50', 'border-green-200', 'text-green-800');
                    messageIcon.classList.remove('text-green-500');
                    bookingMessage.innerHTML = '';
                }, 400); 
            }, 4000);

        } catch (err) {
            submitSpinner.style.display = 'none';
            submitText.style.opacity = '1';
            submitBtn.disabled = false;

            messageContainer.classList.add('bg-red-50', 'border-red-200', 'text-red-800');
            messageIcon.setAttribute('data-lucide', 'alert-circle');
            messageIcon.classList.add('text-red-500');
            messageIcon.classList.remove('text-green-500');
            bookingMessage.innerHTML = `<b>Attenzione:</b><br>${err.message || 'Si è verificato un errore durante la prenotazione.'}`;
        } finally {
            // Show message container with animation
            lucide.createIcons(); // Re-render icons for dynamic changes

            // Mostra la spunta DOPO che Lucide ha ri-renderizzato le icone
            // Re-ottieni il riferimento perché Lucide potrebbe aver sostituito l'elemento
            if (isSuccess) {
                const checkIcon = document.getElementById('booking-submit-check');
                if (checkIcon) {
                    checkIcon.style.display = 'block';
                }
            }

            messageContainer.classList.remove('hidden');
            // Small delay to allow display:block to apply before animating opacity
            setTimeout(() => {
                messageContainer.classList.remove('opacity-0', 'translate-y-2');
            }, 10);
        }
    });
}

// --- Admin Logic ---
const adminModal = document.getElementById('admin-modal');
const openAdminBtn = document.getElementById('open-admin-btn');
const closeAdminBtn = document.getElementById('close-admin-btn');
const adminLoginForm = document.getElementById('admin-login-form');
const adminLoginView = document.getElementById('admin-login-view');
const adminDashboardView = document.getElementById('admin-dashboard-view');
const adminLogoutBtn = document.getElementById('admin-logout-btn');
const adminAppointmentsList = document.getElementById('admin-appointments-list');

let adminToken = localStorage.getItem('adminToken');

function toggleAdminModal() {
    adminModal.classList.toggle('hidden');
    if (!adminModal.classList.contains('hidden')) {
        if (adminToken) {
            showDashboard();
        } else {
            showLogin();
        }
    }
}

if (openAdminBtn) openAdminBtn.addEventListener('click', toggleAdminModal);
if (closeAdminBtn) closeAdminBtn.addEventListener('click', toggleAdminModal);

function showLogin() {
    adminLoginView.classList.remove('hidden');
    adminDashboardView.classList.add('hidden');
}

function showDashboard() {
    adminLoginView.classList.add('hidden');
    adminDashboardView.classList.remove('hidden');
    loadAppointments();
}

if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const password = document.getElementById('admin-password').value;
        const errorEl = document.getElementById('admin-login-error');
        errorEl.classList.add('hidden');

        try {
            if (password === 'admin123') {
                adminToken = 'fake-jwt-token';
                localStorage.setItem('adminToken', adminToken);
                showDashboard();
            } else {
                errorEl.classList.remove('hidden');
            }
        } catch (err) {
            errorEl.textContent = 'Errore di sistema';
            errorEl.classList.remove('hidden');
        }
    });
}

if (adminLogoutBtn) {
    adminLogoutBtn.addEventListener('click', () => {
        adminToken = null;
        localStorage.removeItem('adminToken');
        showLogin();
    });
}

async function loadAppointments() {
    if (!adminAppointmentsList) return;
    adminAppointmentsList.innerHTML = '<tr><td colspan="6" class="p-4 text-center text-gray-500">Caricamento...</td></tr>';
    try {
        if (!adminToken) {
            adminLogoutBtn.click();
            return;
        }

        const allAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
        
        // Sort
        allAppointments.sort((a, b) => {
            if (a.date !== b.date) return a.date.localeCompare(b.date);
            return a.time.localeCompare(b.time);
        });

        if (allAppointments.length === 0) {
            adminAppointmentsList.innerHTML = '<tr><td colspan="6" class="p-4 text-center text-gray-500">Nessun appuntamento trovato.</td></tr>';
            return;
        }

        adminAppointmentsList.innerHTML = allAppointments.map(app => `
                    <tr class="hover:bg-gray-50">
                        <td class="p-4 text-sm">${app.date}</td>
                        <td class="p-4 text-sm font-medium">${app.time}</td>
                        <td class="p-4 text-sm">${app.name}</td>
                        <td class="p-4 text-sm">${app.phone}</td>
                        <td class="p-4 text-sm capitalize">${app.service}</td>
                        <td class="p-4 text-sm">
                            <button onclick="deleteAppointment(${app.id})" class="text-red-500 hover:text-red-700 underline">Cancella</button>
                        </td>
                    </tr>
                `).join('');

    } catch (err) {
        adminAppointmentsList.innerHTML = '<tr><td colspan="6" class="p-4 text-center text-red-500">Errore nel caricamento.</td></tr>';
    }
}

window.deleteAppointment = async function (id) {
    if (!confirm('Sei sicuro di voler cancellare questo appuntamento?')) return;
    try {
        let allAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
        allAppointments = allAppointments.filter(app => app.id !== id);
        localStorage.setItem('appointments', JSON.stringify(allAppointments));
        
        loadAppointments();
    } catch (err) {
        alert('Errore di sistema');
    }
};



// ============================================
// PARALLAX HERO (trend 2026)
// L'immagine di sfondo si muove a velocità
// ridotta rispetto allo scroll per effetto depth.
// ============================================
(function initParallax() {
    const hero = document.querySelector('.hero-bg');
    if (!hero) return;

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                const scrollY = window.scrollY;
                // Sposta il background-position-y mantenendo il centro come punto di partenza
                hero.style.backgroundPosition = `center calc(50% + ${scrollY * 0.4}px)`;
                ticking = false;
            });
            ticking = true;
        }
    });
})();

// ============================================
// INIZIALIZZAZIONE OBSERVER E DOM
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    if (revealElements.length > 0) {
        revealElements.forEach(el => revealObserver.observe(el));
    }
});
