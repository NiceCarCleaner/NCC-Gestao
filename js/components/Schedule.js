class Schedule {
    constructor(container) {
        this.container = container;
        this.currentView = 'day'; // 'day' | 'week' | 'month' | 'list'
        this.selectedDate = new Date();
        this.listSearchTerm = '';
        this.listStatusFilter = 'all'; // 'all' | 'scheduled' | 'completed' | 'paid' | 'cancelled'
        this.currentSelectedServices = [];
        this.activeNotifyApptId = null;
        this.activeNotifyType = 'confirmation'; // 'confirmation' | 'ready'
        this.activeCompleteApptId = null;

        this.render();
    }

    // ==========================================
    // DATE & FORMATTING HELPERS
    // ==========================================
    toDateKey(dateInput) {
        const d = new Date(dateInput);
        if (isNaN(d.getTime())) return '';
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    }

    toLocalDateTimeInput(dateObj, timeStr = '09:00') {
        const key = this.toDateKey(dateObj);
        return `${key}T${timeStr}`;
    }

    isSameDay(d1, d2) {
        return this.toDateKey(d1) === this.toDateKey(d2);
    }

    getStartOfWeek(dateObj) {
        const d = new Date(dateObj);
        d.setHours(0, 0, 0, 0);
        const day = d.getDay(); // 0 (Sun) to 6 (Sat)
        const diff = (day === 0 ? -6 : 1) - day; // Monday as start of week
        d.setDate(d.getDate() + diff);
        return d;
    }

    formatFullDatePT(dateObj) {
        const formatted = dateObj.toLocaleDateString('pt-PT', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    }

    formatMonthYearPT(dateObj) {
        const formatted = dateObj.toLocaleDateString('pt-PT', {
            month: 'long',
            year: 'numeric'
        });
        return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    }

    formatShortDatePT(dateInput) {
        const d = new Date(dateInput);
        if (isNaN(d.getTime())) return '-';
        return d.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    formatTimePT(dateInput) {
        const d = new Date(dateInput);
        if (isNaN(d.getTime())) return '09:00';
        return d.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
    }

    formatCurrency(val) {
        const num = Number(val) || 0;
        return num.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
    }

    escapeHtml(str = '') {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    // ==========================================
    // PHONE & CLIENT NOTIFICATION HELPERS
    // ==========================================
    normalizePhone(rawPhone = '') {
        if (!rawPhone) return '';
        let cleaned = String(rawPhone).trim().replace(/[\s\-().]/g, '');
        if (!cleaned) return '';

        if (cleaned.startsWith('00')) {
            cleaned = '+' + cleaned.slice(2);
        }

        if (cleaned.startsWith('+')) {
            return '+' + cleaned.slice(1).replace(/\D/g, '');
        }

        const digits = cleaned.replace(/\D/g, '');
        if (!digits) return '';

        // Portuguese 9-digit mobile/landline
        if (digits.length === 9 && (digits.startsWith('9') || digits.startsWith('2') || digits.startsWith('3'))) {
            return '+351' + digits;
        }

        // Already starts with 351 + 9 digits
        if (digits.length === 12 && digits.startsWith('351')) {
            return '+' + digits;
        }

        // International fallback (e.g. Switzerland 41..., Luxembourg 352..., France 33...)
        return '+' + digits;
    }

    getWhatsAppPhone(rawPhone = '') {
        const norm = this.normalizePhone(rawPhone);
        return norm.replace(/\D/g, '');
    }

    getAppointmentEnriched(appt) {
        const clients = store.getClients();
        const services = store.getServices();

        const client = clients.find(c => c.id === appt.clientId) || {
            id: appt.clientId,
            name: 'Cliente Removido',
            phone: '',
            vehicles: []
        };

        let resolvedServices = [];
        if (Array.isArray(appt.serviceIds) && appt.serviceIds.length > 0) {
            resolvedServices = appt.serviceIds
                .map(id => services.find(srv => srv.id === id))
                .filter(Boolean);
        } else if (appt.serviceId) {
            const s = services.find(srv => srv.id === appt.serviceId);
            if (s) resolvedServices = [s];
        }

        const serviceNames = resolvedServices.length > 0
            ? resolvedServices.map(s => s.name).join(', ')
            : 'Serviço Personalizado';

        const basePrice = resolvedServices.reduce((acc, s) => acc + (parseFloat(s.price) || 0), 0);
        const effectivePrice = appt.finalPrice !== undefined && appt.finalPrice !== null && appt.finalPrice !== ''
            ? parseFloat(appt.finalPrice)
            : basePrice;

        const totalDuration = resolvedServices.reduce((acc, s) => acc + (parseInt(s.duration, 10) || 0), 0) || 60;

        const startDate = new Date(appt.date);
        const endDate = new Date(startDate.getTime() + totalDuration * 60000);
        const startTimeStr = this.formatTimePT(startDate);
        const endTimeStr = isNaN(endDate.getTime()) ? '' : this.formatTimePT(endDate);

        // Vehicle details
        let vehicleDisplay = appt.vehicle || '';
        let vehicleExtra = '';
        if (!vehicleDisplay && client.vehicles && client.vehicles.length > 0) {
            const v0 = client.vehicles[0];
            vehicleDisplay = `${v0.model || 'Veículo'}${v0.plate ? ` (${v0.plate})` : ''}`;
        }
        if (client.vehicles && client.vehicles.length > 0) {
            const matchedV = client.vehicles.find(v => {
                const label = `${v.model} (${v.plate || 'Sem Matrícula'})`;
                return label === appt.vehicle || (v.plate && appt.vehicle && appt.vehicle.includes(v.plate)) || (v.model && appt.vehicle && appt.vehicle.includes(v.model));
            }) || client.vehicles[0];

            if (matchedV) {
                const extras = [matchedV.color, matchedV.year].filter(Boolean);
                if (extras.length > 0) vehicleExtra = extras.join(' • ');
            }
        }
        if (!vehicleDisplay) vehicleDisplay = 'Veículo não especificado';

        const notifications = {
            confirmationSentAt: null,
            reminderSentAt: null,
            readySentAt: null,
            autoNotifyEnabled: true,
            ...(appt.notifications || {})
        };

        return {
            appt,
            client,
            resolvedServices,
            serviceNames,
            basePrice,
            effectivePrice,
            totalDuration,
            startDate,
            endDate,
            startTimeStr,
            endTimeStr,
            vehicleDisplay,
            vehicleExtra,
            notifications
        };
    }

    buildNotificationMessage(apptId, type = 'confirmation') {
        const appt = store.getAppointments().find(a => a.id === apptId);
        if (!appt) return '';
        const info = this.getAppointmentEnriched(appt);
        const firstName = (info.client.name || 'Cliente').trim().split(' ')[0];
        const vehicle = info.vehicleDisplay !== 'Veículo não especificado' ? info.vehicleDisplay : 'veículo';
        const dateStr = this.formatShortDatePT(appt.date);
        const timeStr = info.startTimeStr;
        const servicesStr = info.serviceNames;
        const priceVal = (info.effectivePrice || 0).toFixed(2).replace('.', ',');

        if (type === 'ready') {
            return `Olá ${firstName}! ✨ O seu ${vehicle} já se encontra pronto na NiceCarCleaner. Valor do serviço: ${priceVal}€. Ficamos a aguardar por si!`;
        }
        return `Olá ${firstName}! 👋 Confirmamos o agendamento do seu ${vehicle} na NiceCarCleaner para dia ${dateStr} às ${timeStr} (${servicesStr}). Qualquer alteração avise-nos. Até breve!`;
    }

    recordNotificationSent(apptId, type = 'confirmation') {
        const appt = store.getAppointments().find(a => a.id === apptId);
        if (!appt) return;
        const nowIso = new Date().toISOString();
        const existingNotif = appt.notifications || { autoNotifyEnabled: true };
        const updatedNotif = {
            ...existingNotif,
            autoNotifyEnabled: existingNotif.autoNotifyEnabled !== false
        };
        if (type === 'ready') {
            updatedNotif.readySentAt = nowIso;
        } else {
            updatedNotif.confirmationSentAt = nowIso;
        }
        store.updateAppointment({
            id: appt.id,
            notifications: updatedNotif
        });
    }

    // ==========================================
    // MAIN RENDER & STYLES
    // ==========================================
    render() {
        this.container.innerHTML = `
            <style>
                .planner-shell {
                    display: flex;
                    flex-direction: column;
                    gap: 18px;
                    width: 100%;
                    padding-bottom: 32px;
                }
                .planner-shell * {
                    box-sizing: border-box;
                }
                /* Fix global style.css input override inside modals/forms */
                .planner-shell .form-group input,
                .planner-shell .form-group select,
                .planner-shell .form-group textarea {
                    margin-top: 0 !important;
                    display: block;
                    width: 100%;
                }
                .planner-shell .form-group input[type="checkbox"] {
                    width: auto !important;
                    display: inline-block !important;
                }
                .planner-shell .form-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                    margin-top: 20px;
                }

                /* Luxury Top Header Bar */
                .planner-topbar {
                    background: linear-gradient(145deg, #1b1b1e 0%, #131316 100%);
                    border: 1px solid rgba(255, 255, 255, 0.09);
                    border-radius: 16px;
                    padding: 18px 22px;
                    box-shadow: 0 14px 34px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.06);
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    position: relative;
                    overflow: hidden;
                }
                .planner-topbar::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 3px;
                    background: linear-gradient(90deg, var(--accent-primary), #d4af37, var(--accent-primary));
                }
                .planner-topbar-row1 {
                    display: flex;
                    flex-wrap: wrap;
                    align-items: center;
                    justify-content: space-between;
                    gap: 14px;
                }
                .planner-brand-title {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .planner-leather-badge {
                    width: 44px;
                    height: 44px;
                    border-radius: 12px;
                    background: linear-gradient(135deg, rgba(255, 59, 48, 0.2), rgba(212, 175, 55, 0.15));
                    border: 1px solid rgba(212, 175, 55, 0.35);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.35rem;
                    box-shadow: inset 0 0 12px rgba(212, 175, 55, 0.15);
                }
                .planner-title-group h1 {
                    font-size: 1.35rem;
                    font-weight: 700;
                    letter-spacing: -0.3px;
                    color: #fff;
                    margin: 0;
                }
                .planner-subtitle {
                    font-size: 0.82rem;
                    color: #b8b2a6;
                    margin-top: 2px;
                }

                .planner-nav-controls {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: rgba(0, 0, 0, 0.35);
                    padding: 5px;
                    border-radius: 11px;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                }
                .planner-nav-btn {
                    background: rgba(255, 255, 255, 0.05);
                    color: #f0f0f0;
                    border: 1px solid rgba(255, 255, 255, 0.07);
                    padding: 7px 13px;
                    border-radius: 8px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    transition: all 0.18s ease;
                }
                .planner-nav-btn:hover {
                    background: rgba(255, 255, 255, 0.14);
                    border-color: rgba(212, 175, 55, 0.4);
                    transform: translateY(-1px);
                }
                .planner-nav-btn.today-btn {
                    background: rgba(212, 175, 55, 0.16);
                    color: #f5d77f;
                    border-color: rgba(212, 175, 55, 0.35);
                }
                .planner-period-label {
                    min-width: 230px;
                    text-align: center;
                    font-weight: 700;
                    font-size: 0.98rem;
                    color: #fff;
                    padding: 0 10px;
                }

                .planner-topbar-row2 {
                    display: flex;
                    flex-wrap: wrap;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    padding-top: 12px;
                    border-top: 1px dashed rgba(255, 255, 255, 0.1);
                }
                .planner-summary-pills {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                }
                .planner-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 7px;
                    padding: 6px 13px;
                    border-radius: 999px;
                    font-size: 0.84rem;
                    font-weight: 600;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.09);
                    color: #e5e5e5;
                }
                .planner-pill.pill-gold {
                    background: rgba(212, 175, 55, 0.12);
                    border-color: rgba(212, 175, 55, 0.35);
                    color: #f7df94;
                }
                .planner-pill.pill-green {
                    background: rgba(50, 215, 75, 0.12);
                    border-color: rgba(50, 215, 75, 0.3);
                    color: #6ee787;
                }
                .planner-pill.pill-blue {
                    background: rgba(10, 132, 255, 0.12);
                    border-color: rgba(10, 132, 255, 0.3);
                    color: #7cc0ff;
                }

                /* Physical Index Tabs */
                .planner-index-tabs {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 6px;
                }
                .planner-tab-btn {
                    padding: 9px 16px;
                    border-radius: 10px 10px 6px 6px;
                    background: #17171a;
                    color: #9e9e9e;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    font-weight: 600;
                    font-size: 0.88rem;
                    display: inline-flex;
                    align-items: center;
                    gap: 7px;
                    transition: all 0.2s ease;
                    position: relative;
                }
                .planner-tab-btn:hover {
                    color: #fff;
                    background: #222227;
                }
                .planner-tab-btn.active {
                    background: linear-gradient(135deg, var(--accent-primary), #c81e14);
                    color: #fff;
                    border-color: rgba(255, 255, 255, 0.25);
                    box-shadow: 0 4px 15px rgba(255, 59, 48, 0.35);
                }

                /* Physical Open Book Container (Day View) */
                .physical-book-container {
                    background: linear-gradient(145deg, #1b1a18 0%, #151412 100%);
                    border: 2px solid #2e2a24;
                    border-radius: 18px;
                    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.65), inset 0 0 0 1px rgba(212, 175, 55, 0.12);
                    display: grid;
                    grid-template-columns: 42px 1fr 330px;
                    min-height: 680px;
                    overflow: hidden;
                    position: relative;
                }
                @media (max-width: 1050px) {
                    .physical-book-container {
                        grid-template-columns: 32px 1fr;
                    }
                    .planner-side-column {
                        grid-column: 1 / -1;
                        border-left: none !important;
                        border-top: 1px solid rgba(255, 255, 255, 0.1);
                    }
                }

                /* Ring Binder Spine */
                .planner-binder-spine {
                    background: linear-gradient(90deg, #0d0c0b 0%, #221f1b 60%, #151311 100%);
                    border-right: 2px solid #332d25;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: space-evenly;
                    padding: 24px 0;
                    user-select: none;
                }
                .binder-ring {
                    width: 22px;
                    height: 14px;
                    border-radius: 7px;
                    background: linear-gradient(180deg, #8e8a83 0%, #d8d3c8 45%, #5b5750 100%);
                    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.7), inset 0 1px 1px rgba(255, 255, 255, 0.6);
                    position: relative;
                }
                .binder-ring::after {
                    content: '';
                    position: absolute;
                    right: -6px;
                    top: 2px;
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    background: #0a0908;
                    box-shadow: inset 0 1px 3px rgba(0,0,0,0.9);
                }

                /* Daily Ruled Page */
                .planner-daily-page {
                    padding: 20px 22px;
                    background:
                        linear-gradient(90deg, rgba(255, 59, 48, 0.18) 0px, rgba(255, 59, 48, 0.18) 2px, transparent 2px),
                        #18181b;
                    background-position: 68px 0, 0 0;
                    position: relative;
                }
                .daily-page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    padding-bottom: 14px;
                    margin-bottom: 14px;
                    border-bottom: 2px solid rgba(212, 175, 55, 0.28);
                }
                .daily-date-big {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                }
                .daily-day-number {
                    font-size: 2.5rem;
                    font-weight: 800;
                    line-height: 1;
                    color: #f5d77f;
                    background: rgba(212, 175, 55, 0.1);
                    border: 1px solid rgba(212, 175, 55, 0.35);
                    border-radius: 12px;
                    padding: 8px 14px;
                }
                .daily-day-meta h2 {
                    margin: 0;
                    font-size: 1.2rem;
                    color: #fff;
                }
                .daily-day-meta span {
                    font-size: 0.84rem;
                    color: #a6a096;
                }

                /* Ruled Time Slots */
                .time-slots-list {
                    display: flex;
                    flex-direction: column;
                    position: relative;
                }
                .time-slot-row {
                    display: grid;
                    grid-template-columns: 68px 1fr;
                    min-height: 54px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
                    transition: background 0.15s ease;
                    position: relative;
                }
                .time-slot-row.half-hour {
                    border-bottom: 1px dashed rgba(255, 255, 255, 0.04);
                    min-height: 44px;
                }
                .time-slot-row:hover {
                    background: rgba(212, 175, 55, 0.04);
                }
                .time-slot-label {
                    font-size: 0.78rem;
                    font-weight: 700;
                    color: #9a948a;
                    padding: 10px 10px 6px 4px;
                    text-align: right;
                    user-select: none;
                }
                .time-slot-row.half-hour .time-slot-label {
                    font-size: 0.72rem;
                    font-weight: 500;
                    color: #666159;
                }
                .time-slot-content {
                    padding: 6px 10px 6px 14px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    cursor: pointer;
                    position: relative;
                }
                .empty-slot-hint {
                    opacity: 0;
                    font-size: 0.78rem;
                    color: #d4af37;
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    padding: 4px 8px;
                    border-radius: 6px;
                    background: rgba(212, 175, 55, 0.1);
                    width: fit-content;
                    transition: opacity 0.15s ease;
                }
                .time-slot-row:hover .empty-slot-hint {
                    opacity: 1;
                }

                /* Current Time Red Indicator */
                .current-time-line {
                    position: relative;
                    height: 2px;
                    background: #ff3b30;
                    box-shadow: 0 0 10px #ff3b30;
                    margin: 2px 0;
                    z-index: 5;
                    display: flex;
                    align-items: center;
                }
                .current-time-badge {
                    background: #ff3b30;
                    color: #fff;
                    font-size: 0.7rem;
                    font-weight: 700;
                    padding: 2px 7px;
                    border-radius: 99px;
                    margin-left: 8px;
                }

                /* Rich Appointment Card inside Planner */
                .planner-appt-card {
                    background: linear-gradient(135deg, rgba(38, 38, 43, 0.96), rgba(27, 27, 31, 0.96));
                    border: 1px solid rgba(255, 255, 255, 0.11);
                    border-left: 4px solid #f5b700;
                    border-radius: 11px;
                    padding: 12px 14px;
                    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.35);
                    cursor: default;
                    transition: transform 0.15s ease, border-color 0.15s ease;
                }
                .planner-appt-card:hover {
                    transform: translateY(-1px);
                    border-color: rgba(255, 255, 255, 0.22);
                }
                .planner-appt-card.status-scheduled {
                    border-left-color: #f5b700;
                }
                .planner-appt-card.status-completed {
                    border-left-color: #0a84ff;
                }
                .planner-appt-card.status-paid {
                    border-left-color: #32d74b;
                }
                .planner-appt-card.status-cancelled {
                    border-left-color: #ff453a;
                    opacity: 0.75;
                }

                .appt-card-top {
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 8px;
                    margin-bottom: 8px;
                }
                .appt-time-pill {
                    font-size: 0.8rem;
                    font-weight: 700;
                    color: #f5d77f;
                    background: rgba(212, 175, 55, 0.14);
                    border: 1px solid rgba(212, 175, 55, 0.3);
                    padding: 3px 9px;
                    border-radius: 6px;
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                }
                .appt-badges-row {
                    display: flex;
                    flex-wrap: wrap;
                    align-items: center;
                    gap: 6px;
                }
                .status-chip {
                    font-size: 0.74rem;
                    font-weight: 700;
                    padding: 3px 9px;
                    border-radius: 99px;
                    text-transform: uppercase;
                    letter-spacing: 0.3px;
                }
                .status-chip.scheduled {
                    background: rgba(245, 183, 0, 0.15);
                    color: #ffd460;
                    border: 1px solid rgba(245, 183, 0, 0.35);
                }
                .status-chip.completed {
                    background: rgba(10, 132, 255, 0.16);
                    color: #7cc0ff;
                    border: 1px solid rgba(10, 132, 255, 0.35);
                }
                .status-chip.paid {
                    background: rgba(50, 215, 75, 0.16);
                    color: #6ee787;
                    border: 1px solid rgba(50, 215, 75, 0.35);
                }
                .status-chip.cancelled {
                    background: rgba(255, 69, 58, 0.16);
                    color: #ff8a84;
                    border: 1px solid rgba(255, 69, 58, 0.35);
                }
                .notify-chip {
                    font-size: 0.73rem;
                    font-weight: 600;
                    padding: 3px 8px;
                    border-radius: 99px;
                    background: rgba(37, 211, 102, 0.14);
                    color: #57e389;
                    border: 1px solid rgba(37, 211, 102, 0.32);
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                }

                .appt-card-body {
                    display: grid;
                    grid-template-columns: 1fr auto;
                    gap: 10px;
                    align-items: center;
                }
                @media (max-width: 680px) {
                    .appt-card-body {
                        grid-template-columns: 1fr;
                    }
                }
                .appt-client-line {
                    font-size: 1rem;
                    font-weight: 700;
                    color: #fff;
                    display: flex;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 8px;
                }
                .appt-phone-tag {
                    font-size: 0.8rem;
                    font-weight: 500;
                    color: #b0b0b8;
                    background: rgba(255, 255, 255, 0.06);
                    padding: 2px 8px;
                    border-radius: 6px;
                }
                .appt-vehicle-line {
                    font-size: 0.86rem;
                    color: #d6d6dc;
                    margin-top: 3px;
                }
                .appt-services-line {
                    font-size: 0.83rem;
                    color: #9e9ea8;
                    margin-top: 4px;
                }
                .appt-price-box {
                    text-align: right;
                    background: rgba(0, 0, 0, 0.3);
                    padding: 6px 11px;
                    border-radius: 8px;
                    border: 1px solid rgba(255, 255, 255, 0.07);
                }
                .appt-price-box .price-val {
                    font-size: 1.05rem;
                    font-weight: 800;
                    color: #f5d77f;
                }
                .appt-price-box .price-sub {
                    font-size: 0.7rem;
                    color: #8e8e98;
                    display: block;
                }

                .appt-card-actions {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 6px;
                    margin-top: 10px;
                    padding-top: 9px;
                    border-top: 1px solid rgba(255, 255, 255, 0.07);
                }
                .appt-action-btn {
                    padding: 5px 10px;
                    border-radius: 7px;
                    font-size: 0.78rem;
                    font-weight: 600;
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    background: rgba(255, 255, 255, 0.07);
                    color: #e5e5ea;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    transition: all 0.15s ease;
                }
                .appt-action-btn:hover {
                    background: rgba(255, 255, 255, 0.15);
                    transform: translateY(-1px);
                }
                .appt-action-btn.btn-complete {
                    background: rgba(50, 215, 75, 0.16);
                    color: #6ee787;
                    border-color: rgba(50, 215, 75, 0.38);
                }
                .appt-action-btn.btn-complete:hover {
                    background: rgba(50, 215, 75, 0.28);
                }
                .appt-action-btn.btn-whatsapp {
                    background: rgba(37, 211, 102, 0.16);
                    color: #57e389;
                    border-color: rgba(37, 211, 102, 0.38);
                }
                .appt-action-btn.btn-whatsapp:hover {
                    background: rgba(37, 211, 102, 0.28);
                }
                .appt-action-btn.btn-cancel-appt {
                    background: rgba(255, 69, 58, 0.13);
                    color: #ff8a84;
                    border-color: rgba(255, 69, 58, 0.3);
                }

                /* Side Notes / Overview Column in Day View */
                .planner-side-column {
                    background: #141417;
                    border-left: 1px solid rgba(212, 175, 55, 0.2);
                    padding: 20px 18px;
                    display: flex;
                    flex-direction: column;
                    gap: 18px;
                }
                .side-section-card {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.07);
                    border-radius: 12px;
                    padding: 14px;
                }
                .side-section-card h3 {
                    font-size: 0.88rem;
                    text-transform: uppercase;
                    letter-spacing: 0.6px;
                    color: #d4af37;
                    margin: 0 0 10px 0;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                /* Week View (7-Day Columns) */
                .week-grid-container {
                    display: grid;
                    grid-template-columns: repeat(7, minmax(175px, 1fr));
                    gap: 10px;
                    overflow-x: auto;
                    padding-bottom: 8px;
                }
                .week-day-col {
                    background: #18181c;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 14px;
                    display: flex;
                    flex-direction: column;
                    min-height: 520px;
                    overflow: hidden;
                }
                .week-day-col.is-today {
                    border-color: var(--accent-primary);
                    box-shadow: 0 0 20px rgba(255, 59, 48, 0.15);
                }
                .week-day-header {
                    padding: 12px;
                    background: rgba(255, 255, 255, 0.03);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .week-day-title {
                    cursor: pointer;
                }
                .week-day-title .wd-name {
                    font-size: 0.76rem;
                    text-transform: uppercase;
                    color: #9e9ea8;
                    font-weight: 700;
                    display: block;
                }
                .week-day-title .wd-num {
                    font-size: 1.2rem;
                    font-weight: 800;
                    color: #fff;
                }
                .week-day-col.is-today .wd-num {
                    color: var(--accent-primary);
                }
                .week-day-sub {
                    padding: 6px 12px;
                    background: rgba(0, 0, 0, 0.25);
                    font-size: 0.75rem;
                    color: #b8b2a6;
                    display: flex;
                    justify-content: space-between;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }
                .week-day-body {
                    padding: 10px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    flex: 1;
                }
                .week-mini-card {
                    background: #232329;
                    border: 1px solid rgba(255, 255, 255, 0.09);
                    border-left: 3px solid #f5b700;
                    border-radius: 9px;
                    padding: 8px 10px;
                    font-size: 0.8rem;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                .week-mini-card.status-completed { border-left-color: #0a84ff; }
                .week-mini-card.status-paid { border-left-color: #32d74b; }
                .week-mini-card.status-cancelled { border-left-color: #ff453a; opacity: 0.7; }

                /* Month View (Calendar Grid) */
                .month-calendar-card {
                    background: #17171b;
                    border: 1px solid rgba(255, 255, 255, 0.09);
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 14px 34px rgba(0, 0, 0, 0.45);
                }
                .month-weekdays-header {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    background: #1f1f25;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.09);
                }
                .month-weekday-cell {
                    padding: 10px;
                    text-align: center;
                    font-size: 0.78rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    color: #b8b2a6;
                    letter-spacing: 0.5px;
                }
                .month-days-grid {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                }
                .month-day-cell {
                    min-height: 122px;
                    border-right: 1px solid rgba(255, 255, 255, 0.06);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
                    padding: 8px;
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                    cursor: pointer;
                    transition: background 0.15s ease;
                    position: relative;
                }
                .month-day-cell:hover {
                    background: rgba(212, 175, 55, 0.06);
                }
                .month-day-cell.other-month {
                    opacity: 0.38;
                    background: rgba(0, 0, 0, 0.25);
                }
                .month-day-cell.is-today {
                    background: rgba(255, 59, 48, 0.07);
                    box-shadow: inset 0 0 0 1px var(--accent-primary);
                }
                .month-cell-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .month-day-num {
                    font-weight: 800;
                    font-size: 0.9rem;
                    color: #e5e5ea;
                    width: 26px;
                    height: 26px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                }
                .month-day-cell.is-today .month-day-num {
                    background: var(--accent-primary);
                    color: #fff;
                }
                .month-cell-revenue {
                    font-size: 0.72rem;
                    font-weight: 700;
                    color: #f5d77f;
                }
                .month-chip-item {
                    font-size: 0.72rem;
                    padding: 3px 6px;
                    border-radius: 5px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    background: rgba(255, 255, 255, 0.07);
                    color: #e5e5ea;
                    border-left: 3px solid #f5b700;
                }
                .month-chip-item.status-completed { border-left-color: #0a84ff; }
                .month-chip-item.status-paid { border-left-color: #32d74b; }
                .month-chip-item.status-cancelled { border-left-color: #ff453a; text-decoration: line-through; opacity: 0.65; }

                /* List / Search View */
                .list-filter-bar {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 12px;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 16px;
                }
                .list-search-box {
                    flex: 1;
                    min-width: 260px;
                    position: relative;
                }
                .list-status-pills {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 6px;
                }
                .status-filter-btn {
                    padding: 7px 13px;
                    border-radius: 99px;
                    font-size: 0.82rem;
                    font-weight: 600;
                    background: rgba(255, 255, 255, 0.06);
                    color: #b0b0b8;
                    border: 1px solid rgba(255, 255, 255, 0.09);
                }
                .status-filter-btn.active {
                    background: var(--accent-primary);
                    color: #fff;
                    border-color: var(--accent-primary);
                }

                /* Instant Checkout & Notification Modals */
                .checkout-method-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                    margin-top: 12px;
                }
                .checkout-btn-option {
                    padding: 13px 14px;
                    border-radius: 10px;
                    font-weight: 700;
                    font-size: 0.9rem;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 5px;
                    border: 1px solid rgba(255, 255, 255, 0.14);
                    background: rgba(255, 255, 255, 0.06);
                    color: #fff;
                    transition: all 0.18s ease;
                }
                .checkout-btn-option:hover {
                    transform: translateY(-2px);
                    border-color: #32d74b;
                    background: rgba(50, 215, 75, 0.15);
                }
                .checkout-btn-option.pending-only {
                    grid-column: 1 / -1;
                    background: rgba(10, 132, 255, 0.12);
                    border-color: rgba(10, 132, 255, 0.35);
                    color: #8cc8ff;
                }
                .checkout-btn-option.pending-only:hover {
                    background: rgba(10, 132, 255, 0.24);
                }
            </style>

            <div class="planner-shell schedule-wrapper">
                <!-- TOP LUXURY PLANNER BAR -->
                <div class="planner-topbar">
                    <div class="planner-topbar-row1">
                        <div class="planner-brand-title">
                            <div class="planner-leather-badge">📓</div>
                            <div class="planner-title-group">
                                <h1>Agenda Executiva & Planeamento</h1>
                                <div class="planner-subtitle">NiceCarCleaner • Livro de Marcações & Avisos Automáticos</div>
                            </div>
                        </div>

                        <div class="planner-nav-controls">
                            <button type="button" id="btn-nav-prev" class="planner-nav-btn">◀ Anterior</button>
                            <button type="button" id="btn-nav-today" class="planner-nav-btn today-btn">Hoje</button>
                            <div id="planner-period-title" class="planner-period-label">-</div>
                            <button type="button" id="btn-nav-next" class="planner-nav-btn">Seguinte ▶</button>
                            <input type="date" id="planner-quick-date" style="width:auto; padding:5px 9px; font-size:0.82rem; background:rgba(255,255,255,0.07); border-radius:7px;" title="Saltar para data">
                        </div>

                        <div style="display:flex; gap:10px; align-items:center;">
                            <button id="btn-add-appointment" class="btn btn-primary" style="padding:10px 18px; font-weight:700;">+ Novo Agendamento</button>
                        </div>
                    </div>

                    <div class="planner-topbar-row2">
                        <div id="planner-summary-pills" class="planner-summary-pills">
                            <!-- Filled dynamically -->
                        </div>

                        <div class="planner-index-tabs">
                            <button type="button" class="planner-tab-btn active" data-view="day">📖 Dia</button>
                            <button type="button" class="planner-tab-btn" data-view="week">🗓️ Semana</button>
                            <button type="button" class="planner-tab-btn" data-view="month">📆 Mês</button>
                            <button type="button" class="planner-tab-btn" data-view="list">📋 Lista / Pesquisa</button>
                        </div>
                    </div>
                </div>

                <!-- DYNAMIC VIEW CONTENT -->
                <div id="planner-view-stage"></div>

                <!-- ========================================== -->
                <!-- MODAL 1: NEW / EDIT APPOINTMENT            -->
                <!-- ========================================== -->
                <div id="modal-appointment" class="modal hidden">
                    <div class="modal-content" style="max-width: 560px; max-height: 92vh; overflow-y: auto;">
                        <div class="modal-header">
                            <h2 id="modal-appointment-title">Novo Agendamento</h2>
                            <span class="close-modal">&times;</span>
                        </div>
                        <form id="form-appointment">
                            <div class="form-group" style="position: relative;">
                                <label>Cliente</label>
                                <input type="text" id="search-client-input" placeholder="Pesquisar cliente (Nome, Telefone, Matrícula)..." autocomplete="off">
                                <input type="hidden" name="clientId" id="selected-client-id" required>
                                <div id="client-search-results" style="position: absolute; top: 100%; left: 0; right: 0; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 8px; max-height: 220px; overflow-y: auto; z-index: 120; display: none; box-shadow: 0 10px 25px rgba(0,0,0,0.6);"></div>
                            </div>

                            <div class="form-group">
                                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                                    <label style="margin-bottom:0;">Veículo</label>
                                    <button type="button" id="btn-toggle-custom-vehicle" style="background:none; border:none; color:#f5d77f; font-size:0.78rem; cursor:pointer; padding:0;">+ Digitar outro veículo</button>
                                </div>
                                <select name="vehicle" id="select-vehicle" required disabled>
                                    <option value="">Selecione um cliente primeiro...</option>
                                </select>
                                <input type="text" id="custom-vehicle-input" placeholder="Ex: BMW 320d (AA-00-BB)" style="display:none; margin-top:8px !important;">
                            </div>

                            <div class="form-group">
                                <label>Serviços a Realizar</label>
                                <div style="display:flex; gap:10px;">
                                    <select id="select-service" style="flex:1;">
                                        <option value="">Selecione um serviço...</option>
                                    </select>
                                    <button type="button" id="btn-add-service-to-list" class="btn btn-secondary" style="padding:0 16px; white-space:nowrap;">+ Adicionar</button>
                                </div>
                                <div id="selected-services-container" style="display:flex; flex-wrap:wrap; gap:6px; margin-top:10px; min-height:38px; padding:8px; background:var(--bg-input); border:1px solid var(--border-color); border-radius:8px; align-items:center;">
                                    <span class="placeholder-text" style="color:var(--text-muted); font-size:0.9em;">Nenhum serviço selecionado</span>
                                </div>
                                <div id="selected-services-summary" style="font-size:0.8rem; color:#f5d77f; margin-top:6px; text-align:right;"></div>
                                <input type="hidden" name="serviceIds" id="selected-service-ids">
                            </div>

                            <div class="form-group">
                                <label>Data e Hora da Marcação</label>
                                <input type="datetime-local" name="date" id="date" required>
                            </div>

                            <div class="form-group">
                                <label>Notas de Oficina / Observações</label>
                                <textarea name="notes" id="notes" rows="2" placeholder="Ex: Cliente pede atenção especial aos estofos, entrega às 17h..." style="width:100%; background:var(--bg-input); border:1px solid var(--border-color); color:var(--text-primary); padding:10px; border-radius:6px;"></textarea>
                            </div>

                            <div class="form-group" style="background:rgba(37, 211, 102, 0.08); border:1px solid rgba(37, 211, 102, 0.25); padding:10px 12px; border-radius:8px;">
                                <label style="display:flex; align-items:center; gap:10px; cursor:pointer; margin:0; color:#e5e5ea;">
                                    <input type="checkbox" id="chk-notify-on-save">
                                    <span>📲 Abrir confirmação por WhatsApp / SMS após guardar</span>
                                </label>
                            </div>

                            <div class="form-actions">
                                <button type="button" class="btn btn-secondary close-modal-btn">Cancelar</button>
                                <input type="hidden" name="editAppointmentId" id="edit-appointment-id">
                                <button type="submit" class="btn btn-primary">Guardar Agendamento</button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- ========================================== -->
                <!-- MODAL 2: CANCELLATION                      -->
                <!-- ========================================== -->
                <div id="modal-cancellation" class="modal hidden">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h2>Cancelar Agendamento</h2>
                            <span class="close-modal-cancellation" style="cursor:pointer; font-size:1.5rem;">&times;</span>
                        </div>
                        <form id="form-cancellation">
                            <input type="hidden" id="cancellation-appointment-id">
                            <div class="form-group">
                                <label>Motivo do Cancelamento</label>
                                <textarea name="reason" rows="3" required placeholder="Indique o motivo do cancelamento..." style="width:100%; background:var(--bg-input); border:1px solid var(--border-color); color:var(--text-primary); padding:10px; border-radius:6px;"></textarea>
                            </div>
                            <div class="form-group">
                                <label style="display:flex; align-items:center; gap:10px; cursor:pointer; color:#fff;">
                                    <input type="checkbox" name="isJustified">
                                    Cancelamento Justificado?
                                </label>
                                <small style="color:var(--text-muted);">Marque se o cliente avisou com antecedência ou teve um motivo válido.</small>
                            </div>
                            <div class="form-actions">
                                <button type="button" class="btn btn-secondary close-modal-cancellation-btn">Voltar</button>
                                <button type="submit" class="btn btn-danger" style="background:var(--accent-danger); color:#fff;">Confirmar Cancelamento</button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- ========================================== -->
                <!-- MODAL 3: INSTANT CHECKOUT / COMPLETE       -->
                <!-- ========================================== -->
                <div id="modal-complete-appointment" class="modal hidden">
                    <div class="modal-content" style="max-width: 520px;">
                        <div class="modal-header">
                            <h2>✅ Concluir Serviço & Faturação Rápida</h2>
                            <span class="close-modal-complete" style="cursor:pointer; font-size:1.5rem;">&times;</span>
                        </div>
                        <div id="complete-modal-details" style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:12px 14px; margin-bottom:16px;">
                            <!-- Filled dynamically -->
                        </div>

                        <div class="form-group">
                            <label>Valor Final a Cobrar (€)</label>
                            <input type="number" id="complete-final-price" step="0.01" min="0" style="font-size:1.25rem; font-weight:800; color:#f5d77f;">
                            <small style="color:var(--text-muted);">Pode ajustar o valor final caso tenha existido um extra ou desconto.</small>
                        </div>

                        <div class="form-group" style="background:rgba(37, 211, 102, 0.1); border:1px solid rgba(37, 211, 102, 0.3); padding:11px 13px; border-radius:9px;">
                            <label style="display:flex; align-items:center; gap:10px; cursor:pointer; margin:0; color:#fff; font-weight:600;">
                                <input type="checkbox" id="chk-complete-send-whatsapp" checked>
                                <span>✨ Avisar Cliente no WhatsApp que o carro está pronto a levantar</span>
                            </label>
                        </div>

                        <div style="margin-top:14px;">
                            <div style="font-size:0.82rem; color:var(--text-secondary); margin-bottom:6px; font-weight:600;">Escolha como pretende finalizar:</div>
                            <div class="checkout-method-grid">
                                <button type="button" class="checkout-btn-option" data-checkout-action="paid" data-method="Numerário">
                                    <span style="font-size:1.3rem;">💵</span>
                                    <span>Receber Já (Numerário)</span>
                                    <small style="color:#6ee787; font-weight:500;">Fica Pago na Hora</small>
                                </button>
                                <button type="button" class="checkout-btn-option" data-checkout-action="paid" data-method="MBWay">
                                    <span style="font-size:1.3rem;">📱</span>
                                    <span>Receber Já (MBWay)</span>
                                    <small style="color:#6ee787; font-weight:500;">Fica Pago na Hora</small>
                                </button>
                                <button type="button" class="checkout-btn-option" data-checkout-action="paid" data-method="Multibanco">
                                    <span style="font-size:1.3rem;">💳</span>
                                    <span>Receber Já (Multibanco)</span>
                                    <small style="color:#6ee787; font-weight:500;">Fica Pago na Hora</small>
                                </button>
                                <button type="button" class="checkout-btn-option" data-checkout-action="paid" data-method="Transferência">
                                    <span style="font-size:1.3rem;">🏦</span>
                                    <span>Receber Já (Transferência)</span>
                                    <small style="color:#6ee787; font-weight:500;">Fica Pago na Hora</small>
                                </button>
                                <button type="button" class="checkout-btn-option pending-only" data-checkout-action="completed" data-method="">
                                    <span>🕒 Apenas Concluir Serviço (Ficar Pendente na Faturação)</span>
                                </button>
                            </div>
                        </div>

                        <div class="form-actions" style="margin-top:16px;">
                            <button type="button" class="btn btn-secondary close-modal-complete-btn">Cancelar</button>
                        </div>
                    </div>
                </div>

                <!-- ========================================== -->
                <!-- MODAL 4: CLIENT NOTIFICATION (WA / SMS)    -->
                <!-- ========================================== -->
                <div id="modal-notify-client" class="modal hidden">
                    <div class="modal-content" style="max-width: 540px;">
                        <div class="modal-header">
                            <h2>📲 Avisar Cliente (WhatsApp / SMS)</h2>
                            <span class="close-modal-notify" style="cursor:pointer; font-size:1.5rem;">&times;</span>
                        </div>

                        <div id="notify-client-summary" style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:12px; margin-bottom:14px;"></div>

                        <div class="form-group">
                            <label>Tipo de Mensagem</label>
                            <div style="display:flex; gap:8px;">
                                <button type="button" id="btn-tpl-confirmation" class="btn btn-secondary" style="flex:1; font-size:0.84rem;">📅 Confirmação / Lembrete</button>
                                <button type="button" id="btn-tpl-ready" class="btn btn-secondary" style="flex:1; font-size:0.84rem;">✨ Carro Pronto a Levantar</button>
                            </div>
                        </div>

                        <div class="form-group">
                            <label>Telefone do Cliente (Normalizado)</label>
                            <input type="text" id="notify-phone-input" placeholder="+351912345678">
                        </div>

                        <div class="form-group">
                            <label>Mensagem a Enviar (pode personalizar antes de enviar)</label>
                            <textarea id="notify-message-textarea" rows="4" style="width:100%; background:var(--bg-input); border:1px solid var(--border-color); color:var(--text-primary); padding:10px; border-radius:8px;"></textarea>
                        </div>

                        <div style="display:flex; flex-wrap:wrap; gap:10px; justify-content:flex-end; margin-top:18px;">
                            <button type="button" class="btn btn-secondary close-modal-notify-btn">Fechar</button>
                            <button type="button" id="btn-send-sms-now" class="btn btn-secondary" style="background:rgba(10,132,255,0.18); color:#7cc0ff; border:1px solid rgba(10,132,255,0.4);">💬 Enviar por SMS</button>
                            <button type="button" id="btn-send-wa-now" class="btn btn-primary" style="background:#25D366; color:#0b2916; font-weight:700; box-shadow:none;">📲 Enviar por WhatsApp</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.loadOptions();
        this.attachEvents();
        this.loadAppointments();
    }

    loadOptions() {
        const services = store.getServices();
        const serviceSelect = document.getElementById('select-service');
        if (!serviceSelect) return;

        serviceSelect.innerHTML = '<option value="">Selecione um serviço...</option>';
        services.forEach(s => {
            const option = document.createElement('option');
            option.value = s.id;
            const dur = s.duration ? ` (${s.duration} min)` : '';
            option.textContent = `${s.name} - ${s.price}€${dur}`;
            serviceSelect.appendChild(option);
        });
    }

    // ==========================================
    // PERIOD NAVIGATION & SUMMARY PILLS
    // ==========================================
    getPeriodAppointments() {
        const all = store.getAppointments();
        if (this.currentView === 'day') {
            const targetKey = this.toDateKey(this.selectedDate);
            return all.filter(a => this.toDateKey(a.date) === targetKey);
        }
        if (this.currentView === 'week') {
            const start = this.getStartOfWeek(this.selectedDate);
            const end = new Date(start);
            end.setDate(end.getDate() + 7);
            return all.filter(a => {
                const d = new Date(a.date);
                return d >= start && d < end;
            });
        }
        if (this.currentView === 'month') {
            const y = this.selectedDate.getFullYear();
            const m = this.selectedDate.getMonth();
            return all.filter(a => {
                const d = new Date(a.date);
                return d.getFullYear() === y && d.getMonth() === m;
            });
        }
        // 'list' view
        return all;
    }

    updateTopHeaderAndPills() {
        const periodTitleEl = document.getElementById('planner-period-title');
        const quickDateEl = document.getElementById('planner-quick-date');
        const pillsEl = document.getElementById('planner-summary-pills');

        if (quickDateEl) {
            quickDateEl.value = this.toDateKey(this.selectedDate);
        }

        if (periodTitleEl) {
            if (this.currentView === 'day') {
                periodTitleEl.textContent = this.formatFullDatePT(this.selectedDate);
            } else if (this.currentView === 'week') {
                const start = this.getStartOfWeek(this.selectedDate);
                const end = new Date(start);
                end.setDate(end.getDate() + 6);
                periodTitleEl.textContent = `Semana ${start.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' })} — ${end.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' })}`;
            } else if (this.currentView === 'month') {
                periodTitleEl.textContent = this.formatMonthYearPT(this.selectedDate);
            } else {
                periodTitleEl.textContent = `Arquivo Completo (${store.getAppointments().length} registos)`;
            }
        }

        // Update active tab button
        this.container.querySelectorAll('.planner-tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === this.currentView);
        });

        // Calculate summary metrics for viewed period
        const periodAppts = this.getPeriodAppointments();
        const activeAppts = periodAppts.filter(a => a.status !== 'cancelled');
        const completedOrPaid = periodAppts.filter(a => a.status === 'completed' || a.status === 'paid');
        const scheduledCount = periodAppts.filter(a => !a.status || a.status === 'scheduled').length;

        let totalExpectedRevenue = 0;
        activeAppts.forEach(a => {
            const info = this.getAppointmentEnriched(a);
            totalExpectedRevenue += info.effectivePrice || 0;
        });

        if (pillsEl) {
            pillsEl.innerHTML = `
                <span class="planner-pill">🚗 <strong>${activeAppts.length}</strong> Marcações</span>
                <span class="planner-pill pill-blue">⏳ <strong>${scheduledCount}</strong> Agendados</span>
                <span class="planner-pill pill-green">✅ <strong>${completedOrPaid.length}</strong> Concluídos/Pagos</span>
                <span class="planner-pill pill-gold">💶 <strong>${this.formatCurrency(totalExpectedRevenue)}</strong> Previstos</span>
            `;
        }
    }

    // ==========================================
    // VIEW DISPATCHER
    // ==========================================
    loadAppointments() {
        this.updateTopHeaderAndPills();
        const stage = document.getElementById('planner-view-stage');
        if (!stage) return;

        if (this.currentView === 'day') {
            this.renderDayView(stage);
        } else if (this.currentView === 'week') {
            this.renderWeekView(stage);
        } else if (this.currentView === 'month') {
            this.renderMonthView(stage);
        } else {
            this.renderListView(stage);
        }
    }

    // ==========================================
    // 1. DAY VIEW (PHYSICAL PLANNER PAGE)
    // ==========================================
    renderDayView(stage) {
        const dayKey = this.toDateKey(this.selectedDate);
        const isToday = this.isSameDay(this.selectedDate, new Date());
        const dayAppts = store.getAppointments()
            .filter(a => this.toDateKey(a.date) === dayKey)
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        const enrichedList = dayAppts.map(a => this.getAppointmentEnriched(a));

        // Build half-hour slots from 08:00 to 20:00
        const slots = [];
        for (let h = 8; h <= 20; h++) {
            slots.push({ hour: h, min: 0, label: `${String(h).padStart(2, '0')}:00`, isHalf: false });
            if (h < 20) {
                slots.push({ hour: h, min: 30, label: `${String(h).padStart(2, '0')}:30`, isHalf: true });
            }
        }

        // Map each appointment to the closest slot (or out-of-hours bucket)
        const bySlot = new Map();
        slots.forEach(s => bySlot.set(s.label, []));
        const outOfHours = [];

        enrichedList.forEach(info => {
            const d = info.startDate;
            if (isNaN(d.getTime())) {
                outOfHours.push(info);
                return;
            }
            const h = d.getHours();
            const m = d.getMinutes();
            if (h < 8 || h > 20 || (h === 20 && m > 0)) {
                outOfHours.push(info);
                return;
            }
            const slotMin = m >= 30 ? '30' : '00';
            const key = `${String(h).padStart(2, '0')}:${slotMin}`;
            if (bySlot.has(key)) {
                bySlot.get(key).push(info);
            } else {
                outOfHours.push(info);
            }
        });

        const now = new Date();
        const nowHour = now.getHours();
        const nowMin = now.getMinutes();
        const nowLabel = this.formatTimePT(now);

        // Pending notifications on this day
        const pendingConfirmations = enrichedList.filter(i =>
            (!i.appt.status || i.appt.status === 'scheduled') && !i.notifications.confirmationSentAt
        );
        const pendingReady = enrichedList.filter(i =>
            i.appt.status === 'completed' && !i.notifications.readySentAt
        );

        const weekdayName = this.selectedDate.toLocaleDateString('pt-PT', { weekday: 'long' });
        const monthYearStr = this.selectedDate.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' });

        stage.innerHTML = `
            <div class="physical-book-container">
                <!-- Left Binder Rings -->
                <div class="planner-binder-spine">
                    ${Array.from({ length: 9 }).map(() => '<div class="binder-ring"></div>').join('')}
                </div>

                <!-- Center Ruled Planner Page -->
                <div class="planner-daily-page">
                    <div class="daily-page-header">
                        <div class="daily-date-big">
                            <div class="daily-day-number">${String(this.selectedDate.getDate()).padStart(2, '0')}</div>
                            <div class="daily-day-meta">
                                <h2>${weekdayName.charAt(0).toUpperCase() + weekdayName.slice(1)}</h2>
                                <span>${monthYearStr.charAt(0).toUpperCase() + monthYearStr.slice(1)} ${isToday ? '• <strong style="color:#ff3b30;">HOJE</strong>' : ''}</span>
                            </div>
                        </div>
                        <button type="button" class="btn btn-secondary" style="font-size:0.82rem; padding:8px 14px;" onclick="window.openNewAppointmentAt('${dayKey}', '09:00')">
                            + Marcar neste dia
                        </button>
                    </div>

                    ${outOfHours.length > 0 ? `
                        <div style="margin-bottom:14px; padding:10px 12px; background:rgba(212,175,55,0.08); border:1px dashed rgba(212,175,55,0.3); border-radius:10px;">
                            <div style="font-size:0.78rem; font-weight:700; color:#f5d77f; margin-bottom:8px;">🌙 Horário Extra (Fora das 08:00 - 20:00)</div>
                            <div style="display:flex; flex-direction:column; gap:8px;">
                                ${outOfHours.map(info => this.renderDayAppointmentCard(info)).join('')}
                            </div>
                        </div>
                    ` : ''}

                    <div class="time-slots-list">
                        ${slots.map(slot => {
                            const slotAppts = bySlot.get(slot.label) || [];
                            const showNowLine = isToday && nowHour === slot.hour && (
                                (!slot.isHalf && nowMin < 30) || (slot.isHalf && nowMin >= 30)
                            );
                            return `
                                ${showNowLine ? `
                                    <div class="current-time-line">
                                        <span class="current-time-badge">Agora ${nowLabel}</span>
                                    </div>
                                ` : ''}
                                <div class="time-slot-row ${slot.isHalf ? 'half-hour' : ''}">
                                    <div class="time-slot-label">${slot.label}</div>
                                    <div class="time-slot-content" data-slot-time="${slot.label}" onclick="if(event.target === this || event.target.classList.contains('empty-slot-hint')) window.openNewAppointmentAt('${dayKey}', '${slot.label}')">
                                        ${slotAppts.length > 0
                                            ? slotAppts.map(info => this.renderDayAppointmentCard(info)).join('')
                                            : `<span class="empty-slot-hint">+ Agendar às ${slot.label}</span>`
                                        }
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>

                <!-- Right Executive Summary & Notifications Column -->
                <div class="planner-side-column">
                    <div class="side-section-card">
                        <h3>📊 Resumo do Dia</h3>
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; font-size:0.84rem;">
                            <div style="background:rgba(0,0,0,0.25); padding:8px 10px; border-radius:8px;">
                                <div style="color:#9e9ea8; font-size:0.74rem;">Total Carros</div>
                                <div style="font-size:1.15rem; font-weight:800; color:#fff;">${enrichedList.filter(i => i.appt.status !== 'cancelled').length}</div>
                            </div>
                            <div style="background:rgba(0,0,0,0.25); padding:8px 10px; border-radius:8px;">
                                <div style="color:#9e9ea8; font-size:0.74rem;">Faturação Dia</div>
                                <div style="font-size:1.05rem; font-weight:800; color:#f5d77f;">
                                    ${this.formatCurrency(enrichedList.filter(i => i.appt.status !== 'cancelled').reduce((s, i) => s + i.effectivePrice, 0))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="side-section-card">
                        <h3>
                            <span>📲 Avisos Pendentes</span>
                            <span style="background:rgba(37,211,102,0.18); color:#57e389; padding:2px 7px; border-radius:99px; font-size:0.72rem;">
                                ${pendingConfirmations.length + pendingReady.length}
                            </span>
                        </h3>
                        ${(pendingConfirmations.length === 0 && pendingReady.length === 0) ? `
                            <div style="font-size:0.82rem; color:#8e8e98; text-align:center; padding:12px 4px;">
                                ✨ Todos os clientes deste dia já foram avisados!
                            </div>
                        ` : `
                            <div style="display:flex; flex-direction:column; gap:8px;">
                                ${pendingConfirmations.map(info => `
                                    <div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.07); padding:8px 10px; border-radius:8px; display:flex; justify-content:space-between; align-items:center; gap:8px;">
                                        <div style="overflow:hidden;">
                                            <div style="font-weight:700; font-size:0.82rem; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${this.escapeHtml(info.client.name)}</div>
                                            <div style="font-size:0.73rem; color:#b8b2a6;">${info.startTimeStr} • Confirmar marcação</div>
                                        </div>
                                        <button type="button" class="appt-action-btn btn-whatsapp" onclick="window.openClientNotificationModal('${info.appt.id}', 'confirmation')">
                                            📲 Avisar
                                        </button>
                                    </div>
                                `).join('')}
                                ${pendingReady.map(info => `
                                    <div style="background:rgba(10,132,255,0.08); border:1px solid rgba(10,132,255,0.25); padding:8px 10px; border-radius:8px; display:flex; justify-content:space-between; align-items:center; gap:8px;">
                                        <div style="overflow:hidden;">
                                            <div style="font-weight:700; font-size:0.82rem; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${this.escapeHtml(info.client.name)}</div>
                                            <div style="font-size:0.73rem; color:#7cc0ff;">Carro Pronto (${this.formatCurrency(info.effectivePrice)})</div>
                                        </div>
                                        <button type="button" class="appt-action-btn btn-whatsapp" onclick="window.openClientNotificationModal('${info.appt.id}', 'ready')">
                                            ✨ Pronto
                                        </button>
                                    </div>
                                `).join('')}
                            </div>
                        `}
                    </div>

                    <div class="side-section-card">
                        <h3>⚡ Dica de Oficina</h3>
                        <p style="font-size:0.8rem; color:#9e9ea8; margin:0; line-height:1.5;">
                            Clique em qualquer linha horária vazia (ex: <strong>10:00</strong> ou <strong>14:30</strong>) para abrir de imediato um novo agendamento nessa hora exata.
                        </p>
                    </div>
                </div>
            </div>
        `;
    }

    renderDayAppointmentCard(info) {
        const { appt, client, serviceNames, effectivePrice, totalDuration, startTimeStr, endTimeStr, vehicleDisplay, vehicleExtra, notifications } = info;
        const status = appt.status || 'scheduled';

        const statusLabels = {
            scheduled: 'Agendado',
            completed: 'Concluído',
            paid: `Pago${appt.paymentMethod ? ` (${appt.paymentMethod})` : ''}`,
            cancelled: `Cancelado (${appt.isJustified ? 'Justificado' : 'Não Just.'})`
        };

        return `
            <div class="planner-appt-card status-${status}">
                <div class="appt-card-top">
                    <span class="appt-time-pill">
                        🕒 ${startTimeStr}${endTimeStr ? ` - ${endTimeStr}` : ''} <span style="opacity:0.75; font-weight:500;">(${totalDuration} min)</span>
                    </span>
                    <div class="appt-badges-row">
                        ${notifications.confirmationSentAt ? `<span class="notify-chip" title="Confirmação enviada">📲 Confirmação enviada</span>` : ''}
                        ${notifications.readySentAt ? `<span class="notify-chip" title="Aviso de carro pronto enviado">✨ Aviso Pronto enviado</span>` : ''}
                        <span class="status-chip ${status}">${this.escapeHtml(statusLabels[status] || 'Agendado')}</span>
                    </div>
                </div>

                <div class="appt-card-body">
                    <div>
                        <div class="appt-client-line">
                            <span>👤 ${this.escapeHtml(client.name)}</span>
                            ${client.phone ? `<span class="appt-phone-tag">📞 ${this.escapeHtml(client.phone)}</span>` : ''}
                        </div>
                        <div class="appt-vehicle-line">
                            🚘 <strong>${this.escapeHtml(vehicleDisplay)}</strong>
                            ${vehicleExtra ? `<span style="color:#9e9ea8; font-size:0.8rem;"> (${this.escapeHtml(vehicleExtra)})</span>` : ''}
                        </div>
                        <div class="appt-services-line">
                            🧽 ${this.escapeHtml(serviceNames)}
                        </div>
                        ${appt.notes ? `<div style="margin-top:5px; font-size:0.78rem; color:#f5d77f; background:rgba(212,175,55,0.08); padding:4px 8px; border-radius:6px;">📝 ${this.escapeHtml(appt.notes)}</div>` : ''}
                        ${appt.cancellationReason ? `<div style="margin-top:5px; font-size:0.78rem; color:#ff8a84;">Motivo: ${this.escapeHtml(appt.cancellationReason)}</div>` : ''}
                    </div>

                    <div class="appt-price-box">
                        <span class="price-val">${this.formatCurrency(effectivePrice)}</span>
                        <span class="price-sub">${status === 'paid' ? 'Recebido' : 'Valor Serviço'}</span>
                    </div>
                </div>

                <div class="appt-card-actions">
                    ${status === 'scheduled' ? `
                        <button type="button" class="appt-action-btn btn-complete" onclick="window.completeAppointment('${appt.id}')">✅ Concluir & Cobrar</button>
                        <button type="button" class="appt-action-btn btn-whatsapp" onclick="window.openClientNotificationModal('${appt.id}', 'confirmation')">📲 Avisar Cliente</button>
                        <button type="button" class="appt-action-btn" onclick="window.openEditAppointment('${appt.id}')">✏️ Editar</button>
                        <button type="button" class="appt-action-btn btn-cancel-appt" onclick="window.cancelAppointment('${appt.id}')">✕ Cancelar</button>
                    ` : ''}
                    ${status === 'completed' ? `
                        <button type="button" class="appt-action-btn btn-complete" onclick="window.completeAppointment('${appt.id}')">💶 Receber Pagamento</button>
                        <button type="button" class="appt-action-btn btn-whatsapp" onclick="window.openClientNotificationModal('${appt.id}', 'ready')">✨ Avisar Carro Pronto</button>
                        <button type="button" class="appt-action-btn" onclick="window.openEditAppointment('${appt.id}')">✏️ Editar</button>
                        <button type="button" class="appt-action-btn btn-cancel-appt" onclick="window.deleteAppointment('${appt.id}')">🗑️ Eliminar</button>
                    ` : ''}
                    ${(status === 'paid' || status === 'cancelled') ? `
                        <button type="button" class="appt-action-btn btn-whatsapp" onclick="window.openClientNotificationModal('${appt.id}', '${status === 'paid' ? 'ready' : 'confirmation'}')">📲 Mensagem Cliente</button>
                        <button type="button" class="appt-action-btn" onclick="window.openEditAppointment('${appt.id}')">✏️ Editar</button>
                        <button type="button" class="appt-action-btn btn-cancel-appt" onclick="window.deleteAppointment('${appt.id}')">🗑️ Eliminar</button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    // ==========================================
    // 2. WEEK VIEW (7-DAY GOOGLE CALENDAR)
    // ==========================================
    renderWeekView(stage) {
        const startOfWeek = this.getStartOfWeek(this.selectedDate);
        const allAppts = store.getAppointments();
        const days = [];

        for (let i = 0; i < 7; i++) {
            const d = new Date(startOfWeek);
            d.setDate(d.getDate() + i);
            const key = this.toDateKey(d);
            const dayAppts = allAppts
                .filter(a => this.toDateKey(a.date) === key)
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .map(a => this.getAppointmentEnriched(a));

            const dayRevenue = dayAppts
                .filter(info => info.appt.status !== 'cancelled')
                .reduce((acc, info) => acc + info.effectivePrice, 0);

            days.push({ date: d, key, dayAppts, dayRevenue });
        }

        stage.innerHTML = `
            <div class="week-grid-container">
                ${days.map(dayObj => {
                    const isToday = this.isSameDay(dayObj.date, new Date());
                    const wdShort = dayObj.date.toLocaleDateString('pt-PT', { weekday: 'short' }).replace('.', '');
                    return `
                        <div class="week-day-col ${isToday ? 'is-today' : ''}">
                            <div class="week-day-header">
                                <div class="week-day-title" onclick="window.switchPlannerToDate('${dayObj.key}')" title="Abrir página diária">
                                    <span class="wd-name">${wdShort}</span>
                                    <span class="wd-num">${String(dayObj.date.getDate()).padStart(2, '0')}/${String(dayObj.date.getMonth() + 1).padStart(2, '0')}</span>
                                </div>
                                <button type="button" class="appt-action-btn" style="padding:4px 9px;" title="Novo agendamento neste dia" onclick="window.openNewAppointmentAt('${dayObj.key}', '09:00')">+</button>
                            </div>
                            <div class="week-day-sub">
                                <span>🚗 ${dayObj.dayAppts.filter(i => i.appt.status !== 'cancelled').length}</span>
                                <span style="color:#f5d77f; font-weight:700;">${this.formatCurrency(dayObj.dayRevenue)}</span>
                            </div>
                            <div class="week-day-body">
                                ${dayObj.dayAppts.length === 0 ? `
                                    <div style="margin:auto; text-align:center; color:#555; font-size:0.78rem; padding:20px 6px;">
                                        Sem marcações
                                    </div>
                                ` : dayObj.dayAppts.map(info => {
                                    const st = info.appt.status || 'scheduled';
                                    return `
                                        <div class="week-mini-card status-${st}">
                                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                                <strong style="color:#f5d77f;">${info.startTimeStr}</strong>
                                                <span style="font-size:0.72rem; font-weight:700; color:#d4d4d8;">${this.formatCurrency(info.effectivePrice)}</span>
                                            </div>
                                            <div style="font-weight:700; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${this.escapeHtml(info.client.name)}">
                                                ${this.escapeHtml(info.client.name)}
                                            </div>
                                            <div style="font-size:0.74rem; color:#a0a0ab; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                                                ${this.escapeHtml(info.vehicleDisplay)}
                                            </div>
                                            <div style="font-size:0.71rem; color:#888892; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                                                ${this.escapeHtml(info.serviceNames)}
                                            </div>
                                            <div style="display:flex; gap:4px; margin-top:4px; flex-wrap:wrap;">
                                                ${st === 'scheduled' ? `<button type="button" class="appt-action-btn btn-complete" style="padding:2px 6px; font-size:0.7rem;" onclick="window.completeAppointment('${info.appt.id}')">✅</button>` : ''}
                                                <button type="button" class="appt-action-btn btn-whatsapp" style="padding:2px 6px; font-size:0.7rem;" onclick="window.openClientNotificationModal('${info.appt.id}', '${st === 'completed' || st === 'paid' ? 'ready' : 'confirmation'}')">📲</button>
                                                <button type="button" class="appt-action-btn" style="padding:2px 6px; font-size:0.7rem;" onclick="window.openEditAppointment('${info.appt.id}')">✏️</button>
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    // ==========================================
    // 3. MONTH VIEW (FULL GOOGLE CALENDAR GRID)
    // ==========================================
    renderMonthView(stage) {
        const year = this.selectedDate.getFullYear();
        const month = this.selectedDate.getMonth();

        const firstDayOfMonth = new Date(year, month, 1);
        const startGridDate = this.getStartOfWeek(firstDayOfMonth);
        const allAppts = store.getAppointments();

        // Group appointments by YYYY-MM-DD
        const byDate = new Map();
        allAppts.forEach(a => {
            const k = this.toDateKey(a.date);
            if (!k) return;
            if (!byDate.has(k)) byDate.set(k, []);
            byDate.get(k).push(a);
        });

        const cells = [];
        for (let i = 0; i < 42; i++) {
            const cellDate = new Date(startGridDate);
            cellDate.setDate(cellDate.getDate() + i);
            const key = this.toDateKey(cellDate);
            const dayAppts = (byDate.get(key) || [])
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .map(a => this.getAppointmentEnriched(a));

            const isCurrentMonth = cellDate.getMonth() === month;
            const isToday = this.isSameDay(cellDate, new Date());
            const activeAppts = dayAppts.filter(info => info.appt.status !== 'cancelled');
            const totalEur = activeAppts.reduce((sum, info) => sum + info.effectivePrice, 0);

            cells.push({
                cellDate,
                key,
                dayAppts,
                activeCount: activeAppts.length,
                isCurrentMonth,
                isToday,
                totalEur
            });
        }

        const weekdays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

        stage.innerHTML = `
            <div class="month-calendar-card">
                <div class="month-weekdays-header">
                    ${weekdays.map(w => `<div class="month-weekday-cell">${w}</div>`).join('')}
                </div>
                <div class="month-days-grid">
                    ${cells.map(c => {
                        const visibleChips = c.dayAppts.slice(0, 3);
                        const extraCount = c.dayAppts.length - visibleChips.length;
                        return `
                            <div class="month-day-cell ${c.isCurrentMonth ? '' : 'other-month'} ${c.isToday ? 'is-today' : ''}" onclick="window.switchPlannerToDate('${c.key}')">
                                <div class="month-cell-top">
                                    <span class="month-day-num">${c.cellDate.getDate()}</span>
                                    ${c.totalEur > 0 ? `<span class="month-cell-revenue">${this.formatCurrency(c.totalEur)}</span>` : ''}
                                </div>
                                ${c.activeCount > 0 ? `<div style="font-size:0.68rem; color:#9e9ea8;">${c.activeCount} marcaç${c.activeCount === 1 ? 'ão' : 'ões'}</div>` : ''}
                                <div style="display:flex; flex-direction:column; gap:3px; margin-top:2px;">
                                    ${visibleChips.map(info => `
                                        <div class="month-chip-item status-${info.appt.status || 'scheduled'}">
                                            <strong>${info.startTimeStr}</strong> ${this.escapeHtml(info.client.name)}
                                        </div>
                                    `).join('')}
                                    ${extraCount > 0 ? `<div style="font-size:0.7rem; color:#f5d77f; font-weight:600; padding-left:4px;">+${extraCount} mais...</div>` : ''}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    // ==========================================
    // 4. LIST / SEARCH VIEW (ALL 1,036+ RECORDS)
    // ==========================================
    renderListView(stage) {
        const allAppts = [...store.getAppointments()].sort((a, b) => new Date(b.date) - new Date(a.date));
        const term = (this.listSearchTerm || '').trim().toLowerCase();

        const filtered = allAppts.map(a => this.getAppointmentEnriched(a)).filter(info => {
            const st = info.appt.status || 'scheduled';
            if (this.listStatusFilter !== 'all' && st !== this.listStatusFilter) return false;
            if (!term) return true;
            const hay = `${info.client.name} ${info.client.phone} ${info.vehicleDisplay} ${info.serviceNames} ${info.appt.notes || ''}`.toLowerCase();
            return hay.includes(term);
        });

        stage.innerHTML = `
            <div class="card">
                <div class="list-filter-bar">
                    <div class="list-search-box">
                        <input type="text" id="list-search-input" value="${this.escapeHtml(this.listSearchTerm)}" placeholder="🔍 Pesquisar por Cliente, Matrícula, Veículo, Telefone ou Serviço..." style="width:100%;">
                    </div>
                    <div class="list-status-pills">
                        ${[
                            { id: 'all', label: 'Todos' },
                            { id: 'scheduled', label: 'Agendados' },
                            { id: 'completed', label: 'Concluídos' },
                            { id: 'paid', label: 'Pagos' },
                            { id: 'cancelled', label: 'Cancelados' }
                        ].map(f => `
                            <button type="button" class="status-filter-btn ${this.listStatusFilter === f.id ? 'active' : ''}" data-status-filter="${f.id}">
                                ${f.label}
                            </button>
                        `).join('')}
                    </div>
                </div>

                <div style="font-size:0.82rem; color:var(--text-secondary); margin-bottom:10px;">
                    A mostrar <strong>${Math.min(filtered.length, 250)}</strong> de <strong>${filtered.length}</strong> agendamentos encontrados
                </div>

                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Data/Hora</th>
                                <th>Cliente & Veículo</th>
                                <th>Serviços & Valor</th>
                                <th>Estado & Avisos</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody id="appointments-list">
                            ${filtered.length === 0 ? `
                                <tr>
                                    <td colspan="5" style="text-align:center; padding:26px; color:var(--text-muted);">
                                        Nenhum agendamento encontrado para os filtros selecionados.
                                    </td>
                                </tr>
                            ` : filtered.slice(0, 250).map(info => {
                                const { appt, client, serviceNames, effectivePrice, vehicleDisplay, notifications } = info;
                                const st = appt.status || 'scheduled';
                                const dateFormatted = new Date(appt.date).toLocaleString('pt-PT', { dateStyle: 'short', timeStyle: 'short' });
                                const dayKey = this.toDateKey(appt.date);

                                const statusMap = {
                                    scheduled: '<span class="status-chip scheduled">Agendado</span>',
                                    completed: '<span class="status-chip completed">Concluído</span>',
                                    paid: `<span class="status-chip paid">Pago${appt.paymentMethod ? ` (${this.escapeHtml(appt.paymentMethod)})` : ''}</span>`,
                                    cancelled: `<span class="status-chip cancelled">Cancelado</span>`
                                };

                                return `
                                    <tr>
                                        <td>
                                            <div style="font-weight:700; color:#fff; cursor:pointer;" onclick="window.switchPlannerToDate('${dayKey}')" title="Ver no planeador diário">${dateFormatted}</div>
                                        </td>
                                        <td>
                                            <div style="font-weight:600; color:#fff;">${this.escapeHtml(client.name)}</div>
                                            <div style="font-size:0.83em; color:var(--text-secondary);">${this.escapeHtml(vehicleDisplay)} ${client.phone ? `• 📞 ${this.escapeHtml(client.phone)}` : ''}</div>
                                        </td>
                                        <td>
                                            <div>${this.escapeHtml(serviceNames)}</div>
                                            <div style="font-size:0.85em; font-weight:700; color:#f5d77f;">${this.formatCurrency(effectivePrice)}</div>
                                        </td>
                                        <td>
                                            <div style="display:flex; flex-direction:column; gap:4px; align-items:flex-start;">
                                                ${statusMap[st] || statusMap.scheduled}
                                                ${notifications.confirmationSentAt ? '<span class="notify-chip">📲 Confirmação enviada</span>' : ''}
                                                ${notifications.readySentAt ? '<span class="notify-chip">✨ Aviso Pronto enviado</span>' : ''}
                                            </div>
                                        </td>
                                        <td>
                                            <div style="display:flex; flex-wrap:wrap; gap:5px;">
                                                ${st === 'scheduled' ? `
                                                    <button class="appt-action-btn btn-complete" onclick="window.completeAppointment('${appt.id}')">✅ Concluir</button>
                                                    <button class="appt-action-btn btn-whatsapp" onclick="window.openClientNotificationModal('${appt.id}', 'confirmation')">📲 Avisar</button>
                                                    <button class="appt-action-btn" onclick="window.openEditAppointment('${appt.id}')">✏️ Editar</button>
                                                    <button class="appt-action-btn btn-cancel-appt" onclick="window.cancelAppointment('${appt.id}')">✕ Cancelar</button>
                                                ` : ''}
                                                ${st === 'completed' ? `
                                                    <button class="appt-action-btn btn-complete" onclick="window.completeAppointment('${appt.id}')">💶 Cobrar</button>
                                                    <button class="appt-action-btn btn-whatsapp" onclick="window.openClientNotificationModal('${appt.id}', 'ready')">✨ Pronto</button>
                                                    <button class="appt-action-btn" onclick="window.openEditAppointment('${appt.id}')">✏️</button>
                                                    <button class="appt-action-btn btn-cancel-appt" onclick="window.deleteAppointment('${appt.id}')">🗑️</button>
                                                ` : ''}
                                                ${(st === 'paid' || st === 'cancelled') ? `
                                                    <button class="appt-action-btn btn-whatsapp" onclick="window.openClientNotificationModal('${appt.id}', '${st === 'paid' ? 'ready' : 'confirmation'}')">📲</button>
                                                    <button class="appt-action-btn" onclick="window.openEditAppointment('${appt.id}')">✏️</button>
                                                    <button class="appt-action-btn btn-cancel-appt" onclick="window.deleteAppointment('${appt.id}')">🗑️</button>
                                                ` : ''}
                                            </div>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        // Attach search & filter events inside list view
        const searchEl = document.getElementById('list-search-input');
        if (searchEl) {
            searchEl.addEventListener('input', (e) => {
                const pos = e.target.selectionStart;
                this.listSearchTerm = e.target.value;
                this.renderListView(stage);
                const newSearchEl = document.getElementById('list-search-input');
                if (newSearchEl) {
                    newSearchEl.focus();
                    newSearchEl.setSelectionRange(pos, pos);
                }
            });
        }

        stage.querySelectorAll('.status-filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.listStatusFilter = btn.dataset.statusFilter;
                this.renderListView(stage);
            });
        });
    }

    // ==========================================
    // EVENTS & MODALS LOGIC
    // ==========================================
    attachEvents() {
        // Planner navigation buttons
        const btnPrev = document.getElementById('btn-nav-prev');
        const btnToday = document.getElementById('btn-nav-today');
        const btnNext = document.getElementById('btn-nav-next');
        const quickDate = document.getElementById('planner-quick-date');

        const shiftPeriod = (dir) => {
            const d = new Date(this.selectedDate);
            if (this.currentView === 'day' || this.currentView === 'list') {
                d.setDate(d.getDate() + dir);
            } else if (this.currentView === 'week') {
                d.setDate(d.getDate() + dir * 7);
            } else if (this.currentView === 'month') {
                d.setMonth(d.getMonth() + dir);
            }
            this.selectedDate = d;
            this.loadAppointments();
        };

        btnPrev.addEventListener('click', () => shiftPeriod(-1));
        btnNext.addEventListener('click', () => shiftPeriod(1));
        btnToday.addEventListener('click', () => {
            this.selectedDate = new Date();
            this.loadAppointments();
        });
        quickDate.addEventListener('change', (e) => {
            if (e.target.value) {
                this.selectedDate = new Date(e.target.value + 'T12:00:00');
                this.loadAppointments();
            }
        });

        // View tabs
        this.container.querySelectorAll('.planner-tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.currentView = btn.dataset.view;
                this.loadAppointments();
            });
        });

        // Global helper to switch directly to a Day page from Month/Week/List views
        window.switchPlannerToDate = (dateKey) => {
            if (!dateKey) return;
            this.selectedDate = new Date(dateKey + 'T12:00:00');
            this.currentView = 'day';
            this.loadAppointments();
        };

        // Appointment Form & Modal
        const modal = document.getElementById('modal-appointment');
        const btnAdd = document.getElementById('btn-add-appointment');
        const btnClose = document.querySelector('.close-modal');
        const btnCancel = document.querySelector('.close-modal-btn');
        const form = document.getElementById('form-appointment');
        const searchInput = document.getElementById('search-client-input');
        const searchResults = document.getElementById('client-search-results');
        const selectedClientIdInput = document.getElementById('selected-client-id');
        const vehicleSelect = document.getElementById('select-vehicle');
        const customVehicleInput = document.getElementById('custom-vehicle-input');
        const btnToggleCustomVehicle = document.getElementById('btn-toggle-custom-vehicle');

        const btnAddService = document.getElementById('btn-add-service-to-list');
        const selectedServicesContainer = document.getElementById('selected-services-container');
        const selectedServicesSummary = document.getElementById('selected-services-summary');

        const renderSelectedServices = () => {
            if (this.currentSelectedServices.length === 0) {
                selectedServicesContainer.innerHTML = '<span class="placeholder-text" style="color:var(--text-muted); font-size:0.9em; padding:4px;">Nenhum serviço selecionado</span>';
                if (selectedServicesSummary) selectedServicesSummary.textContent = '';
                return;
            }
            const services = store.getServices();
            let totalEur = 0;
            let totalMin = 0;

            selectedServicesContainer.innerHTML = this.currentSelectedServices.map((s, index) => {
                const fullSrv = services.find(item => item.id === s.id);
                if (fullSrv) {
                    totalEur += parseFloat(fullSrv.price) || 0;
                    totalMin += parseInt(fullSrv.duration, 10) || 0;
                }
                return `
                    <span style="background:var(--accent-primary); color:white; padding:4px 10px; border-radius:12px; font-size:0.85em; display:inline-flex; align-items:center; gap:6px;">
                        ${this.escapeHtml(s.name)}
                        <span class="remove-service-tag" data-index="${index}" style="cursor:pointer; font-weight:bold;">&times;</span>
                    </span>
                `;
            }).join('');

            if (selectedServicesSummary) {
                selectedServicesSummary.textContent = `Total Previsto: ${this.formatCurrency(totalEur)} • Duração estimada: ${totalMin || 60} min`;
            }

            selectedServicesContainer.querySelectorAll('.remove-service-tag').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const idx = parseInt(e.target.dataset.index, 10);
                    this.currentSelectedServices.splice(idx, 1);
                    renderSelectedServices();
                });
            });
        };

        btnAddService.addEventListener('click', () => {
            const serviceSelect = document.getElementById('select-service');
            const serviceId = serviceSelect.value;
            if (!serviceId) return;

            const services = store.getServices();
            const service = services.find(s => s.id === serviceId);

            if (this.currentSelectedServices.some(s => s.id === serviceId)) {
                alert('Este serviço já foi adicionado.');
                return;
            }

            if (service) {
                this.currentSelectedServices.push({ id: service.id, name: service.name });
                renderSelectedServices();
                serviceSelect.value = '';
            }
        });

        // Toggle custom vehicle input
        btnToggleCustomVehicle.addEventListener('click', () => {
            const isHidden = customVehicleInput.style.display === 'none';
            if (isHidden) {
                customVehicleInput.style.display = 'block';
                vehicleSelect.required = false;
                customVehicleInput.focus();
                btnToggleCustomVehicle.textContent = 'Usar veículo da lista';
            } else {
                customVehicleInput.style.display = 'none';
                customVehicleInput.value = '';
                vehicleSelect.required = true;
                btnToggleCustomVehicle.textContent = '+ Digitar outro veículo';
            }
        });

        const openModalWithDateTime = (dateKeyStr = null, timeStr = '09:00') => {
            document.getElementById('modal-appointment-title').textContent = 'Novo Agendamento';
            document.getElementById('edit-appointment-id').value = '';
            searchInput.value = '';
            selectedClientIdInput.value = '';
            this.currentSelectedServices = [];
            renderSelectedServices();

            vehicleSelect.innerHTML = '<option value="">Selecione um cliente primeiro...</option>';
            vehicleSelect.disabled = true;
            vehicleSelect.required = true;
            customVehicleInput.style.display = 'none';
            customVehicleInput.value = '';
            btnToggleCustomVehicle.textContent = '+ Digitar outro veículo';

            const dateInput = document.getElementById('date');
            if (dateKeyStr) {
                dateInput.value = `${dateKeyStr}T${timeStr}`;
            } else {
                dateInput.value = this.toLocalDateTimeInput(this.selectedDate, timeStr);
            }
            document.getElementById('notes').value = '';
            document.getElementById('chk-notify-on-save').checked = false;
            modal.classList.remove('hidden');
        };

        window.openNewAppointmentAt = (dateKeyStr, timeStr = '09:00') => {
            openModalWithDateTime(dateKeyStr, timeStr);
        };

        const closeModal = () => {
            modal.classList.add('hidden');
            searchResults.style.display = 'none';
        };

        btnAdd.addEventListener('click', () => openModalWithDateTime(this.toDateKey(this.selectedDate), '09:00'));
        btnClose.addEventListener('click', closeModal);
        btnCancel.addEventListener('click', closeModal);

        // Client autocomplete search
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            if (term.length < 1) {
                searchResults.style.display = 'none';
                return;
            }

            const clients = store.getClients();
            const filtered = clients.filter(c =>
                (c.name && c.name.toLowerCase().includes(term)) ||
                (c.phone && c.phone.includes(term)) ||
                (c.vehicles && c.vehicles.some(v =>
                    (v.plate && v.plate.toLowerCase().includes(term)) ||
                    (v.model && v.model.toLowerCase().includes(term))
                ))
            ).slice(0, 30);

            if (filtered.length > 0) {
                searchResults.innerHTML = filtered.map(c => {
                    const vList = (c.vehicles || []).map(v => `${v.model}${v.plate ? ` (${v.plate})` : ''}`).join(', ');
                    return `
                        <div class="search-result-item" data-id="${c.id}" style="padding: 10px 12px; cursor: pointer; border-bottom: 1px solid var(--border-color);">
                            <div style="font-weight: bold; color:#fff;">${this.escapeHtml(c.name)}</div>
                            <div style="font-size: 0.8em; color: var(--text-secondary);">📞 ${this.escapeHtml(c.phone || '-')} ${vList ? `• 🚘 ${this.escapeHtml(vList)}` : ''}</div>
                        </div>
                    `;
                }).join('');
                searchResults.style.display = 'block';

                searchResults.querySelectorAll('.search-result-item').forEach(item => {
                    item.addEventListener('click', () => {
                        const clientId = item.dataset.id;
                        const client = clients.find(c => c.id === clientId);
                        if (!client) return;

                        searchInput.value = client.name;
                        selectedClientIdInput.value = client.id;
                        searchResults.style.display = 'none';

                        this.loadClientVehicles(client);
                    });
                });
            } else {
                searchResults.innerHTML = '<div style="padding: 10px; color: var(--text-muted);">Nenhum cliente encontrado</div>';
                searchResults.style.display = 'block';
            }
        });

        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
                searchResults.style.display = 'none';
            }
        });

        // Submit New / Edit Appointment
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const editId = formData.get('editAppointmentId');

            if (!formData.get('clientId')) {
                alert('Por favor selecione um cliente da lista.');
                return;
            }

            if (this.currentSelectedServices.length === 0) {
                alert('Por favor adicione pelo menos um serviço.');
                return;
            }

            const chosenVehicle = (customVehicleInput.style.display !== 'none' && customVehicleInput.value.trim())
                ? customVehicleInput.value.trim()
                : formData.get('vehicle');

            if (!chosenVehicle) {
                alert('Por favor selecione ou digite o veículo do cliente.');
                return;
            }

            const notifyOnSave = document.getElementById('chk-notify-on-save').checked;

            const appointmentData = {
                clientId: formData.get('clientId'),
                serviceIds: this.currentSelectedServices.map(s => s.id),
                vehicle: chosenVehicle,
                date: formData.get('date'),
                notes: formData.get('notes')
            };

            let savedApptId = editId;
            if (editId) {
                appointmentData.id = editId;
                store.updateAppointment(appointmentData);
            } else {
                appointmentData.status = 'scheduled';
                appointmentData.notifications = {
                    confirmationSentAt: null,
                    reminderSentAt: null,
                    readySentAt: null,
                    autoNotifyEnabled: true
                };
                const created = store.addAppointment(appointmentData);
                savedApptId = created.id;
            }

            // Jump planner to the appointment's date so the user sees it immediately
            if (appointmentData.date) {
                this.selectedDate = new Date(appointmentData.date);
            }

            form.reset();
            closeModal();
            this.loadAppointments();

            if (notifyOnSave && savedApptId) {
                window.openClientNotificationModal(savedApptId, 'confirmation');
            }
        });

        // ==========================================
        // CANCELLATION MODAL
        // ==========================================
        const modalCancel = document.getElementById('modal-cancellation');
        const btnCloseCancel = document.querySelector('.close-modal-cancellation');
        const btnBackCancel = document.querySelector('.close-modal-cancellation-btn');
        const formCancel = document.getElementById('form-cancellation');

        const closeCancelModal = () => {
            modalCancel.classList.add('hidden');
            formCancel.reset();
        };
        btnCloseCancel.addEventListener('click', closeCancelModal);
        btnBackCancel.addEventListener('click', closeCancelModal);

        formCancel.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('cancellation-appointment-id').value;
            const reason = formCancel.elements['reason'].value;
            const isJustified = formCancel.elements['isJustified'].checked;
            store.cancelAppointment(id, reason, isJustified);
            closeCancelModal();
            this.loadAppointments();
        });

        // ==========================================
        // INSTANT CHECKOUT / COMPLETE MODAL
        // ==========================================
        const modalComplete = document.getElementById('modal-complete-appointment');
        const closeCompleteModal = () => {
            modalComplete.classList.add('hidden');
            this.activeCompleteApptId = null;
        };
        document.querySelector('.close-modal-complete').addEventListener('click', closeCompleteModal);
        document.querySelector('.close-modal-complete-btn').addEventListener('click', closeCompleteModal);

        modalComplete.querySelectorAll('.checkout-btn-option').forEach(btn => {
            btn.addEventListener('click', () => {
                if (!this.activeCompleteApptId) return;
                const actionStatus = btn.dataset.checkoutAction; // 'paid' | 'completed'
                const paymentMethod = btn.dataset.method || null;
                const finalPriceVal = parseFloat(document.getElementById('complete-final-price').value);
                const sendWaReady = document.getElementById('chk-complete-send-whatsapp').checked;

                const validPrice = isNaN(finalPriceVal) ? 0 : finalPriceVal;
                const apptId = this.activeCompleteApptId;

                store.updateAppointmentStatus(apptId, actionStatus, validPrice, paymentMethod);

                if (sendWaReady) {
                    const appt = store.getAppointments().find(a => a.id === apptId);
                    if (appt) {
                        const info = this.getAppointmentEnriched(appt);
                        const waPhone = this.getWhatsAppPhone(info.client.phone);
                        const msg = this.buildNotificationMessage(apptId, 'ready');
                        this.recordNotificationSent(apptId, 'ready');
                        if (waPhone) {
                            window.open(`https://wa.me/${waPhone}?text=${encodeURIComponent(msg)}`, '_blank');
                        } else {
                            alert('Serviço atualizado! Nota: Este cliente não tem número de telefone registado para abrir o WhatsApp.');
                        }
                    }
                }

                closeCompleteModal();
                this.loadAppointments();
            });
        });

        // ==========================================
        // CLIENT NOTIFICATION MODAL (WA / SMS)
        // ==========================================
        const modalNotify = document.getElementById('modal-notify-client');
        const closeNotifyModal = () => {
            modalNotify.classList.add('hidden');
            this.activeNotifyApptId = null;
        };
        document.querySelector('.close-modal-notify').addEventListener('click', closeNotifyModal);
        document.querySelector('.close-modal-notify-btn').addEventListener('click', closeNotifyModal);

        const setNotifyTemplate = (type) => {
            this.activeNotifyType = type;
            const btnConf = document.getElementById('btn-tpl-confirmation');
            const btnReady = document.getElementById('btn-tpl-ready');
            btnConf.style.borderColor = type === 'confirmation' ? 'var(--accent-primary)' : 'transparent';
            btnReady.style.borderColor = type === 'ready' ? 'var(--accent-primary)' : 'transparent';

            if (this.activeNotifyApptId) {
                document.getElementById('notify-message-textarea').value = this.buildNotificationMessage(this.activeNotifyApptId, type);
            }
        };

        document.getElementById('btn-tpl-confirmation').addEventListener('click', () => setNotifyTemplate('confirmation'));
        document.getElementById('btn-tpl-ready').addEventListener('click', () => setNotifyTemplate('ready'));

        document.getElementById('btn-send-wa-now').addEventListener('click', () => {
            if (!this.activeNotifyApptId) return;
            const phoneRaw = document.getElementById('notify-phone-input').value;
            const waDigits = this.getWhatsAppPhone(phoneRaw);
            const msg = document.getElementById('notify-message-textarea').value.trim();

            if (!waDigits) {
                alert('Por favor introduza um número de telemóvel válido.');
                return;
            }
            this.recordNotificationSent(this.activeNotifyApptId, this.activeNotifyType);
            window.open(`https://wa.me/${waDigits}?text=${encodeURIComponent(msg)}`, '_blank');
            closeNotifyModal();
            this.loadAppointments();
        });

        document.getElementById('btn-send-sms-now').addEventListener('click', () => {
            if (!this.activeNotifyApptId) return;
            const phoneNorm = this.normalizePhone(document.getElementById('notify-phone-input').value);
            const msg = document.getElementById('notify-message-textarea').value.trim();

            if (!phoneNorm) {
                alert('Por favor introduza um número de telemóvel válido.');
                return;
            }
            this.recordNotificationSent(this.activeNotifyApptId, this.activeNotifyType);
            window.open(`sms:${phoneNorm}?body=${encodeURIComponent(msg)}`, '_self');
            closeNotifyModal();
            this.loadAppointments();
        });

        // ==========================================
        // GLOBAL ACTIONS EXPOSED ON WINDOW
        // ==========================================
        window.completeAppointment = (id) => {
            const appt = store.getAppointments().find(a => a.id === id);
            if (!appt) return;
            const info = this.getAppointmentEnriched(appt);
            this.activeCompleteApptId = id;

            document.getElementById('complete-modal-details').innerHTML = `
                <div style="font-weight:700; font-size:1rem; color:#fff;">👤 ${this.escapeHtml(info.client.name)}</div>
                <div style="font-size:0.86rem; color:#d4d4d8; margin-top:2px;">🚘 ${this.escapeHtml(info.vehicleDisplay)}</div>
                <div style="font-size:0.82rem; color:#9e9ea8; margin-top:4px;">🧽 ${this.escapeHtml(info.serviceNames)}</div>
                <div style="font-size:0.78rem; color:#f5d77f; margin-top:4px;">Valor Tabelado: ${this.formatCurrency(info.basePrice)}</div>
            `;

            document.getElementById('complete-final-price').value = (info.effectivePrice || 0).toFixed(2);
            document.getElementById('chk-complete-send-whatsapp').checked = !info.notifications.readySentAt;
            modalComplete.classList.remove('hidden');
        };

        window.openClientNotificationModal = (id, defaultType = 'confirmation') => {
            const appt = store.getAppointments().find(a => a.id === id);
            if (!appt) return;
            const info = this.getAppointmentEnriched(appt);
            this.activeNotifyApptId = id;

            document.getElementById('notify-client-summary').innerHTML = `
                <div style="font-weight:700; color:#fff;">👤 ${this.escapeHtml(info.client.name)}</div>
                <div style="font-size:0.84rem; color:#d4d4d8;">🚘 ${this.escapeHtml(info.vehicleDisplay)} • 🕒 ${this.formatShortDatePT(appt.date)} às ${info.startTimeStr}</div>
                <div style="font-size:0.8rem; color:#f5d77f; margin-top:3px;">🧽 ${this.escapeHtml(info.serviceNames)} (${this.formatCurrency(info.effectivePrice)})</div>
            `;

            document.getElementById('notify-phone-input').value = this.normalizePhone(info.client.phone || '');
            setNotifyTemplate(defaultType);
            modalNotify.classList.remove('hidden');
        };

        window.cancelAppointment = (id) => {
            document.getElementById('cancellation-appointment-id').value = id;
            modalCancel.classList.remove('hidden');
        };

        window.openEditAppointment = (id) => {
            const appt = store.getAppointments().find(a => a.id === id);
            if (!appt) return;

            document.getElementById('modal-appointment-title').textContent = 'Editar Agendamento';
            document.getElementById('edit-appointment-id').value = id;

            const client = store.getClients().find(c => c.id === appt.clientId);
            if (client) {
                document.getElementById('search-client-input').value = client.name;
                document.getElementById('selected-client-id').value = client.id;
                this.loadClientVehicles(client, appt.vehicle);
            }

            this.currentSelectedServices = [];
            const services = store.getServices();
            if (appt.serviceIds && appt.serviceIds.length > 0) {
                appt.serviceIds.forEach(sId => {
                    const s = services.find(srv => srv.id === sId);
                    if (s) this.currentSelectedServices.push({ id: s.id, name: s.name });
                });
            } else if (appt.serviceId) {
                const s = services.find(srv => srv.id === appt.serviceId);
                if (s) this.currentSelectedServices.push({ id: s.id, name: s.name });
            }
            renderSelectedServices();

            document.getElementById('select-service').value = '';
            if (appt.date) {
                const d = new Date(appt.date);
                if (!isNaN(d.getTime())) {
                    const pad = n => String(n).padStart(2, '0');
                    document.getElementById('date').value = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
                } else {
                    document.getElementById('date').value = String(appt.date).slice(0, 16);
                }
            } else {
                document.getElementById('date').value = '';
            }
            document.getElementById('notes').value = appt.notes || '';
            document.getElementById('chk-notify-on-save').checked = false;
            modal.classList.remove('hidden');
        };

        window.deleteAppointment = (id) => {
            if (confirm('Tem a certeza que deseja eliminar permanentemente este agendamento? Esta ação não pode ser desfeita.')) {
                store.deleteAppointment(id);
                this.loadAppointments();
            }
        };
    }

    loadClientVehicles(client, selectedVehicleValue = null) {
        const vehicleSelect = document.getElementById('select-vehicle');
        const customVehicleInput = document.getElementById('custom-vehicle-input');
        const btnToggleCustomVehicle = document.getElementById('btn-toggle-custom-vehicle');

        vehicleSelect.innerHTML = '<option value="">Selecione um veículo...</option>';

        if (client && client.vehicles && client.vehicles.length > 0) {
            vehicleSelect.disabled = false;
            let matchedOption = false;
            client.vehicles.forEach(v => {
                const option = document.createElement('option');
                const label = `${v.model} (${v.plate || 'Sem Matrícula'})`;
                option.value = label;
                option.textContent = label;
                if (selectedVehicleValue && label === selectedVehicleValue) {
                    option.selected = true;
                    matchedOption = true;
                }
                vehicleSelect.appendChild(option);
            });

            if (selectedVehicleValue && !matchedOption) {
                const extraOpt = document.createElement('option');
                extraOpt.value = selectedVehicleValue;
                extraOpt.textContent = selectedVehicleValue;
                extraOpt.selected = true;
                vehicleSelect.appendChild(extraOpt);
            } else if (!selectedVehicleValue && client.vehicles.length === 1) {
                vehicleSelect.selectedIndex = 1;
            }

            customVehicleInput.style.display = 'none';
            vehicleSelect.required = true;
            if (btnToggleCustomVehicle) btnToggleCustomVehicle.textContent = '+ Digitar outro veículo';
        } else {
            vehicleSelect.innerHTML = '<option value="">Sem veículos registados na ficha</option>';
            vehicleSelect.disabled = true;
            vehicleSelect.required = false;
            customVehicleInput.style.display = 'block';
            customVehicleInput.value = selectedVehicleValue || '';
            if (btnToggleCustomVehicle) btnToggleCustomVehicle.textContent = 'Usar veículo da lista';
        }
    }
}
