class Billing {
    constructor(container) {
        this.container = container;
        this.selectedPeriod = null; // Initialized dynamically on first load ('all' or most recent month)
        this.selectedMethod = 'all';
        this.searchQuery = '';
        this.historyLimit = 250;

        this.render();

        if (typeof store !== 'undefined' && typeof store.onDataChanged === 'function') {
            store.onDataChanged(() => {
                if (document.getElementById('billing-pending-list')) {
                    this.loadBilling();
                }
            });
        }
    }

    render() {
        this.container.innerHTML = `
            <div class="page-header billing-page-header">
                <div>
                    <h1>💳 Centro de Faturação & Checkout</h1>
                    <p style="margin: 4px 0 0 0; color: var(--text-secondary); font-size: 0.92rem;">
                        Cobrança rápida em 1 clique, controlo de caixa (Numerário / MBWay) e recibos via WhatsApp
                    </p>
                </div>
            </div>

            <!-- 1. Executive Financial KPI Cards -->
            <div class="billing-kpi-grid">
                <div class="billing-kpi-card kpi-pending">
                    <div class="kpi-icon-wrap">🕒</div>
                    <div class="kpi-info">
                        <span class="kpi-label">A Aguardar Pagamento</span>
                        <div class="kpi-value" id="kpi-pending-total">0,00 €</div>
                        <span class="kpi-sub" id="kpi-pending-count">0 veículos concluídos por cobrar</span>
                    </div>
                </div>

                <div class="billing-kpi-card kpi-billed">
                    <div class="kpi-icon-wrap">📅</div>
                    <div class="kpi-info">
                        <span class="kpi-label" id="kpi-period-label">Faturado no Período Selecionado</span>
                        <div class="kpi-value" id="kpi-period-total">0,00 €</div>
                        <span class="kpi-sub" id="kpi-period-count">0 serviços pagos</span>
                    </div>
                </div>

                <div class="billing-kpi-card kpi-cash">
                    <div class="kpi-icon-wrap">💵</div>
                    <div class="kpi-info">
                        <span class="kpi-label">Total Numerário (Período)</span>
                        <div class="kpi-value" id="kpi-cash-total">0,00 €</div>
                        <div class="kpi-bar-row">
                            <div class="kpi-mini-bar"><div id="kpi-cash-bar" class="kpi-mini-fill cash-fill" style="width: 0%;"></div></div>
                            <span class="kpi-sub" id="kpi-cash-pct">0% do total</span>
                        </div>
                    </div>
                </div>

                <div class="billing-kpi-card kpi-mbway">
                    <div class="kpi-icon-wrap">📱</div>
                    <div class="kpi-info">
                        <span class="kpi-label">Total MBWay (Período)</span>
                        <div class="kpi-value" id="kpi-mbway-total">0,00 €</div>
                        <div class="kpi-bar-row">
                            <div class="kpi-mini-bar"><div id="kpi-mbway-bar" class="kpi-mini-fill mbway-fill" style="width: 0%;"></div></div>
                            <span class="kpi-sub" id="kpi-mbway-pct">0% do total</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 2. 1-Click Fast Checkout for Pending Services -->
            <div class="card billing-section-card">
                <div class="billing-section-header">
                    <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
                        <h3>🕒 Serviços Concluídos — A Aguardar Pagamento</h3>
                        <span id="pending-badge-counter" class="billing-counter-badge pending-badge">0 pendentes</span>
                    </div>
                    <span style="font-size: 0.84rem; color: var(--text-secondary);">
                        💡 Pode editar o valor diretamente na linha antes de cobrar em 1 clique
                    </span>
                </div>

                <div class="table-responsive" style="margin-top: 14px;">
                    <table class="data-table billing-table">
                        <thead>
                            <tr>
                                <th>Data / Hora</th>
                                <th>Cliente & Contacto</th>
                                <th>Veículo / Matrícula</th>
                                <th>Serviços Realizados</th>
                                <th style="width: 150px;">Valor a Cobrar (€)</th>
                                <th style="text-align: right;">Checkout Rápido & Ações</th>
                            </tr>
                        </thead>
                        <tbody id="billing-pending-list">
                            <!-- Pending items -->
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- 3. Payment History with Filters & Instant Search -->
            <div class="card billing-section-card" style="margin-top: 24px;">
                <div class="billing-section-header">
                    <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
                        <h3>🧾 Histórico de Pagamentos</h3>
                        <span id="history-badge-counter" class="billing-counter-badge history-badge">0 registos</span>
                    </div>
                </div>

                <!-- Filter Bar -->
                <div class="billing-filters-bar">
                    <div class="filter-group">
                        <label for="billing-filter-period">📅 Mês / Período</label>
                        <select id="billing-filter-period">
                            <option value="all">Todos os Meses</option>
                        </select>
                    </div>

                    <div class="filter-group">
                        <label for="billing-filter-method">💳 Método de Pagamento</label>
                        <select id="billing-filter-method">
                            <option value="all">Todos os Métodos</option>
                            <option value="Numerário">💵 Numerário</option>
                            <option value="MBWay">📱 MBWay</option>
                        </select>
                    </div>

                    <div class="filter-group filter-search-group">
                        <label for="billing-filter-search">🔍 Pesquisa Instantânea</label>
                        <div style="position:relative; display:flex; align-items:center;">
                            <input type="text" id="billing-filter-search"
                                   placeholder="Pesquisar cliente, telefone, veículo, matrícula ou serviço..."
                                   autocomplete="off">
                            <button type="button" id="billing-clear-filters" class="btn btn-secondary hidden"
                                    title="Limpar filtros de pesquisa"
                                    style="margin-left: 8px; padding: 9px 12px; font-size: 0.82rem; white-space: nowrap;">
                                ✕ Limpar
                            </button>
                        </div>
                    </div>
                </div>

                <div class="table-responsive" style="margin-top: 12px;">
                    <table class="data-table billing-table">
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Cliente</th>
                                <th>Veículo / Matrícula</th>
                                <th>Serviços Realizados</th>
                                <th>Valor Pago</th>
                                <th>Método</th>
                                <th>Estado</th>
                                <th style="text-align: right;">Ações & Recibo</th>
                            </tr>
                        </thead>
                        <tbody id="billing-history-list">
                            <!-- History items -->
                        </tbody>
                        <tfoot>
                            <tr class="billing-tfoot-row">
                                <td colspan="4" style="text-align:right; font-weight:700; font-size:0.98rem;">
                                    Total Faturado (Filtro Atual):
                                </td>
                                <td id="billing-total" style="font-weight:800; font-size:1.1rem; color:var(--accent-success);">
                                    0,00 €
                                </td>
                                <td colspan="3" id="billing-tfoot-breakdown" style="font-size:0.84rem; color:var(--text-secondary);">
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            <!-- Modal for Payment Confirmation / Adjustment -->
            <div id="modal-payment" class="modal hidden">
                <div class="modal-content" style="max-width: 520px;">
                    <div class="modal-header">
                        <h2 id="modal-payment-title">✏️ Ajustar / Confirmar Pagamento</h2>
                        <span class="close-modal">&times;</span>
                    </div>
                    <form id="form-payment">
                        <input type="hidden" name="appointmentId" id="payment-appointment-id">

                        <div id="payment-client-banner" class="payment-client-banner"></div>

                        <div class="form-group">
                            <label>Serviços Realizados</label>
                            <input type="text" id="payment-service-name" disabled style="opacity:0.8;">
                        </div>

                        <div class="form-group">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                                <label style="margin:0;">Valor Final a Cobrar (€)</label>
                                <span id="payment-base-price-hint" style="font-size:0.8rem; color:var(--text-secondary);"></span>
                            </div>
                            <input type="number" name="finalPrice" id="payment-final-price" step="0.01" min="0" required
                                   style="font-size: 1.15rem; font-weight: 700; color: var(--accent-success);">
                            <div class="quick-price-pills" id="payment-quick-adjust">
                                <button type="button" class="price-pill" data-adj="base">Valor Base</button>
                                <button type="button" class="price-pill" data-adj="-5">-5 €</button>
                                <button type="button" class="price-pill" data-adj="-10%">-10%</button>
                                <button type="button" class="price-pill" data-adj="+5">+5 €</button>
                                <button type="button" class="price-pill" data-adj="+10">+10 €</button>
                            </div>
                        </div>

                        <div class="form-group">
                            <label>Método de Pagamento</label>
                            <select name="paymentMethod" id="payment-method-select" required>
                                <option value="Numerário">💵 Numerário</option>
                                <option value="MBWay">📱 MBWay</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label>Notas de Faturação / Observações (Opcional)</label>
                            <input type="text" name="paymentNotes" id="payment-notes"
                                   placeholder="Ex: Desconto cliente habitual, extra limpeza estofos, NIF...">
                        </div>

                        <div class="form-actions" style="display:flex; justify-content:flex-end; gap:10px; margin-top:20px;">
                            <button type="button" class="btn btn-secondary close-modal-btn">Cancelar</button>
                            <button type="submit" class="btn btn-primary">💾 Guardar Pagamento</button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Toast Notification Container -->
            <div id="billing-toast" class="billing-toast hidden"></div>
        `;

        this.addStyles();
        this.loadBilling();
        this.attachEvents();
    }

    addStyles() {
        let style = document.getElementById('billing-custom-styles');
        if (!style) {
            style = document.createElement('style');
            style.id = 'billing-custom-styles';
            document.head.appendChild(style);
        }
        style.textContent = `
            .billing-page-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                flex-wrap: wrap;
                gap: 12px;
            }

            .billing-kpi-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                gap: 16px;
                margin-bottom: 24px;
            }

            .billing-kpi-card {
                background: var(--bg-card);
                border: 1px solid var(--border-color);
                border-radius: 12px;
                padding: 18px 20px;
                display: flex;
                align-items: center;
                gap: 16px;
                box-shadow: var(--shadow-card);
                position: relative;
                overflow: hidden;
            }

            .billing-kpi-card::before {
                content: '';
                position: absolute;
                left: 0;
                top: 0;
                bottom: 0;
                width: 4px;
            }

            .billing-kpi-card.kpi-pending::before { background: #ff9f0a; }
            .billing-kpi-card.kpi-billed::before { background: #32d74b; }
            .billing-kpi-card.kpi-cash::before { background: #30d158; }
            .billing-kpi-card.kpi-mbway::before { background: #0a84ff; }

            .kpi-icon-wrap {
                width: 48px;
                height: 48px;
                border-radius: 12px;
                background: rgba(255, 255, 255, 0.05);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.5rem;
                flex-shrink: 0;
            }

            .kpi-info {
                flex: 1;
                min-width: 0;
            }

            .kpi-label {
                display: block;
                font-size: 0.8rem;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                color: var(--text-secondary);
                margin-bottom: 4px;
                font-weight: 600;
            }

            .kpi-value {
                font-size: 1.55rem;
                font-weight: 800;
                color: var(--text-primary);
                line-height: 1.2;
                margin-bottom: 4px;
            }

            .kpi-pending .kpi-value { color: #ff9f0a; }
            .kpi-billed .kpi-value { color: var(--accent-success); }

            .kpi-sub {
                font-size: 0.8rem;
                color: var(--text-secondary);
            }

            .kpi-bar-row {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-top: 4px;
            }

            .kpi-mini-bar {
                flex: 1;
                height: 6px;
                background: rgba(255, 255, 255, 0.08);
                border-radius: 999px;
                overflow: hidden;
            }

            .kpi-mini-fill {
                height: 100%;
                border-radius: 999px;
                transition: width 0.3s ease;
            }

            .cash-fill { background: #30d158; }
            .mbway-fill { background: #0a84ff; }

            .billing-section-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-wrap: wrap;
                gap: 10px;
            }

            .billing-counter-badge {
                font-size: 0.78rem;
                font-weight: 700;
                padding: 4px 10px;
                border-radius: 999px;
            }

            .pending-badge {
                background: rgba(255, 159, 10, 0.16);
                color: #ffb340;
                border: 1px solid rgba(255, 159, 10, 0.35);
            }

            .history-badge {
                background: rgba(50, 215, 75, 0.14);
                color: #32d74b;
                border: 1px solid rgba(50, 215, 75, 0.3);
            }

            .billing-filters-bar {
                display: grid;
                grid-template-columns: 240px 210px 1fr;
                gap: 14px;
                margin-top: 16px;
                padding: 14px;
                background: rgba(255, 255, 255, 0.025);
                border: 1px solid var(--border-color);
                border-radius: 10px;
                align-items: end;
            }

            @media (max-width: 920px) {
                .billing-filters-bar {
                    grid-template-columns: 1fr;
                }
            }

            .filter-group label {
                display: block;
                font-size: 0.78rem;
                font-weight: 600;
                color: var(--text-secondary);
                margin-bottom: 6px;
            }

            .filter-group select,
            .filter-group input {
                width: 100%;
                padding: 9px 12px;
                font-size: 0.9rem;
            }

            .billing-table th {
                font-size: 0.8rem;
                text-transform: uppercase;
                letter-spacing: 0.4px;
                color: var(--text-secondary);
                background: rgba(255, 255, 255, 0.02);
            }

            .billing-table td {
                vertical-align: middle;
                font-size: 0.92rem;
            }

            .plate-chip {
                display: inline-block;
                background: #141923;
                color: #f8fafc;
                border: 1px solid rgba(255, 255, 255, 0.22);
                border-left: 4px solid #2563eb;
                padding: 1px 7px;
                border-radius: 4px;
                font-family: monospace;
                font-weight: 700;
                font-size: 0.8rem;
                letter-spacing: 0.6px;
                margin-left: 4px;
            }

            .inline-price-wrap {
                display: flex;
                align-items: center;
                gap: 4px;
                background: var(--bg-input);
                border: 1px solid var(--border-color);
                border-radius: 7px;
                padding: 3px 8px;
                max-width: 125px;
            }

            .inline-price-wrap:focus-within {
                border-color: var(--accent-primary);
            }

            .inline-price-input {
                width: 82px;
                border: none !important;
                background: transparent !important;
                padding: 4px 2px !important;
                font-weight: 700;
                font-size: 0.96rem;
                color: var(--text-primary);
                text-align: right;
                outline: none;
            }

            .checkout-actions-row {
                display: flex;
                justify-content: flex-end;
                gap: 6px;
                flex-wrap: wrap;
            }

            .btn-checkout {
                padding: 6px 10px;
                border-radius: 7px;
                font-size: 0.81rem;
                font-weight: 600;
                display: inline-flex;
                align-items: center;
                gap: 5px;
                transition: transform 0.15s, filter 0.15s;
                white-space: nowrap;
            }

            .btn-checkout:hover {
                transform: translateY(-1px);
                filter: brightness(1.1);
            }

            .btn-cash {
                background: rgba(48, 209, 88, 0.18);
                color: #4ade80;
                border: 1px solid rgba(48, 209, 88, 0.4);
            }

            .btn-mbway {
                background: rgba(10, 132, 255, 0.18);
                color: #60a5fa;
                border: 1px solid rgba(10, 132, 255, 0.4);
            }

            .btn-adjust {
                background: rgba(255, 255, 255, 0.08);
                color: var(--text-primary);
                border: 1px solid rgba(255, 255, 255, 0.16);
            }

            .btn-whatsapp {
                background: rgba(37, 211, 102, 0.16);
                color: #25D366;
                border: 1px solid rgba(37, 211, 102, 0.38);
            }

            .method-badge {
                display: inline-flex;
                align-items: center;
                gap: 5px;
                padding: 3px 9px;
                border-radius: 999px;
                font-size: 0.8rem;
                font-weight: 600;
            }

            .method-cash {
                background: rgba(48, 209, 88, 0.14);
                color: #4ade80;
                border: 1px solid rgba(48, 209, 88, 0.3);
            }

            .method-mbway {
                background: rgba(10, 132, 255, 0.14);
                color: #60a5fa;
                border: 1px solid rgba(10, 132, 255, 0.3);
            }

            .status-paid-pill {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                color: var(--accent-success);
                font-weight: 700;
                font-size: 0.84rem;
            }

            .payment-client-banner {
                background: rgba(255, 255, 255, 0.04);
                border: 1px solid var(--border-color);
                border-radius: 8px;
                padding: 10px 12px;
                margin-bottom: 14px;
                font-size: 0.88rem;
            }

            .quick-price-pills {
                display: flex;
                gap: 6px;
                flex-wrap: wrap;
                margin-top: 8px;
            }

            .price-pill {
                background: rgba(255, 255, 255, 0.07);
                color: var(--text-secondary);
                border: 1px solid var(--border-color);
                border-radius: 6px;
                padding: 4px 10px;
                font-size: 0.78rem;
                font-weight: 600;
            }

            .price-pill:hover {
                background: rgba(255, 255, 255, 0.15);
                color: var(--text-primary);
            }

            .billing-tfoot-row td {
                background: rgba(255, 255, 255, 0.03);
                padding-top: 14px;
                padding-bottom: 14px;
            }

            .billing-toast {
                position: fixed;
                bottom: 24px;
                right: 24px;
                background: #18181b;
                color: #fff;
                border-left: 4px solid var(--accent-success);
                padding: 12px 18px;
                border-radius: 8px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.6);
                font-size: 0.9rem;
                font-weight: 600;
                z-index: 2000;
                transition: opacity 0.25s ease, transform 0.25s ease;
            }

            .billing-toast.hidden {
                opacity: 0;
                pointer-events: none;
                transform: translateY(10px);
            }
        `;
    }

    formatCurrency(val) {
        const num = Number(val) || 0;
        return num.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
    }

    getMonthYearKey(dateStr) {
        if (!dateStr) return null;
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return null;
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        return `${yyyy}-${mm}`;
    }

    formatMonthYearLabel(ymKey) {
        if (!ymKey || !ymKey.includes('-')) return ymKey;
        const [year, month] = ymKey.split('-').map(Number);
        const monthsPt = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        const mName = monthsPt[month - 1] || ymKey;
        return `${mName} ${year}`;
    }

    getServiceDetails(appt, services) {
        let total = 0;
        let names = [];

        if (appt.serviceIds && appt.serviceIds.length > 0) {
            appt.serviceIds.forEach(id => {
                const s = services.find(srv => srv.id === id);
                if (s) {
                    total += parseFloat(s.price) || 0;
                    names.push(s.name);
                }
            });
        } else if (appt.serviceId) {
            const s = services.find(srv => srv.id === appt.serviceId);
            if (s) {
                total = parseFloat(s.price) || 0;
                names.push(s.name);
            }
        }

        return {
            price: total,
            name: names.length > 0 ? names.join(', ') : (appt.serviceName || 'Serviço Personalizado')
        };
    }

    getVehicleDetails(appt, client) {
        const vehicles = (client && Array.isArray(client.vehicles)) ? client.vehicles : [];
        let rawVehicle = (appt.vehicle || '').trim();
        let plate = (appt.plate || '').trim();
        let model = rawVehicle;

        // Check if rawVehicle has plate in parentheses e.g. "BMW 320d (AA-00-BB)"
        const parenMatch = rawVehicle.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
        if (parenMatch) {
            model = parenMatch[1].trim();
            if (!plate) plate = parenMatch[2].trim();
        }

        if (!model && vehicles.length > 0) {
            model = vehicles[0].model || '-';
            if (!plate) plate = vehicles[0].plate || '';
        }

        if (!plate && model && vehicles.length > 0) {
            const matched = vehicles.find(v =>
                v.model && v.model.toLowerCase() === model.toLowerCase()
            ) || vehicles[0];
            if (matched && matched.plate) {
                plate = matched.plate;
            }
        }

        if (!model) model = 'Veículo';
        const fullText = plate ? `${model} (${plate})` : model;

        return { model, plate, fullText };
    }

    normalizePhoneForWhatsApp(phone) {
        if (!phone) return '';
        let digits = String(phone).replace(/\D/g, '');
        if (digits.startsWith('00')) {
            digits = digits.slice(2);
        }
        if (digits.length === 9) {
            digits = '351' + digits;
        }
        return digits;
    }

    showToast(message) {
        const toast = document.getElementById('billing-toast');
        if (!toast) return;
        toast.textContent = message;
        toast.classList.remove('hidden');
        clearTimeout(this._toastTimer);
        this._toastTimer = setTimeout(() => {
            toast.classList.add('hidden');
        }, 3200);
    }

    populatePeriodSelector(paidAppointments) {
        const select = document.getElementById('billing-filter-period');
        if (!select) return;

        const monthsMap = new Map();
        paidAppointments.forEach(a => {
            const key = this.getMonthYearKey(a.date);
            if (key) {
                monthsMap.set(key, (monthsMap.get(key) || 0) + 1);
            }
        });

        const sortedMonths = Array.from(monthsMap.keys()).sort((a, b) => b.localeCompare(a));

        // Initialize default selection once: most recent month with data, or 'all'
        if (this.selectedPeriod === null) {
            this.selectedPeriod = sortedMonths.length > 0 ? sortedMonths[0] : 'all';
        }

        const now = new Date();
        const currentYm = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

        let optionsHtml = `
            <option value="all" ${this.selectedPeriod === 'all' ? 'selected' : ''}>🌎 Todos os Meses (${paidAppointments.length})</option>
            <option value="today" ${this.selectedPeriod === 'today' ? 'selected' : ''}>📍 Hoje</option>
            <option value="this_month" ${this.selectedPeriod === 'this_month' ? 'selected' : ''}>📅 Este Mês (${this.formatMonthYearLabel(currentYm)})</option>
        `;

        if (sortedMonths.length > 0) {
            optionsHtml += `<optgroup label="Meses com Faturação">`;
            sortedMonths.forEach(ym => {
                const count = monthsMap.get(ym);
                const selected = this.selectedPeriod === ym ? 'selected' : '';
                optionsHtml += `<option value="${ym}" ${selected}>🗓️ ${this.formatMonthYearLabel(ym)} (${count})</option>`;
            });
            optionsHtml += `</optgroup>`;
        }

        select.innerHTML = optionsHtml;
    }

    matchesPeriod(appt, period) {
        if (!period || period === 'all') return true;
        if (!appt.date) return false;
        const apptDate = new Date(appt.date);
        if (isNaN(apptDate.getTime())) return false;

        const now = new Date();
        if (period === 'today') {
            return apptDate.getFullYear() === now.getFullYear() &&
                   apptDate.getMonth() === now.getMonth() &&
                   apptDate.getDate() === now.getDate();
        }
        if (period === 'this_month') {
            return apptDate.getFullYear() === now.getFullYear() &&
                   apptDate.getMonth() === now.getMonth();
        }
        return this.getMonthYearKey(appt.date) === period;
    }

    getPeriodDisplayLabel(period) {
        if (!period || period === 'all') return 'Todos os Meses';
        if (period === 'today') return 'Hoje';
        if (period === 'this_month') return 'Este Mês';
        return this.formatMonthYearLabel(period);
    }

    loadBilling() {
        const appointments = store.getAppointments() || [];
        const clients = store.getClients() || [];
        const services = store.getServices() || [];

        const clientsById = new Map();
        clients.forEach(c => clientsById.set(c.id, c));

        const pendingList = document.getElementById('billing-pending-list');
        const historyList = document.getElementById('billing-history-list');
        const totalEl = document.getElementById('billing-total');
        const breakdownEl = document.getElementById('billing-tfoot-breakdown');

        if (!pendingList || !historyList) return;

        // 1. Separate Pending ('completed') and Paid ('paid')
        const completed = appointments
            .filter(a => a.status === 'completed')
            .sort((a, b) => new Date(b.date) - new Date(a.date));

        const paidAll = appointments.filter(a => a.status === 'paid');

        // Populate Month/Period dropdown dynamically from data
        this.populatePeriodSelector(paidAll);

        // Calculate Pending KPI
        let pendingTotalEur = 0;
        completed.forEach(appt => {
            const details = this.getServiceDetails(appt, services);
            const val = appt.finalPrice !== undefined && appt.finalPrice !== null && appt.finalPrice !== ''
                ? parseFloat(appt.finalPrice)
                : details.price;
            pendingTotalEur += (isNaN(val) ? 0 : val);
        });

        const pendingBadge = document.getElementById('pending-badge-counter');
        if (pendingBadge) {
            pendingBadge.textContent = `${completed.length} ${completed.length === 1 ? 'pendente' : 'pendentes'}`;
        }

        // Render Pending Table
        if (completed.length === 0) {
            pendingList.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align:center; padding: 28px; color: var(--text-muted);">
                        ✅ Excelente! Não existem serviços concluídos a aguardar pagamento de momento.
                    </td>
                </tr>
            `;
        } else {
            pendingList.innerHTML = completed.map(appt => {
                const client = clientsById.get(appt.clientId) || { name: 'Cliente Desconhecido', phone: '', vehicles: [] };
                const details = this.getServiceDetails(appt, services);
                const veh = this.getVehicleDetails(appt, client);
                const dObj = new Date(appt.date);
                const dateStr = !isNaN(dObj.getTime()) ? dObj.toLocaleDateString('pt-PT') : '-';
                const timeStr = !isNaN(dObj.getTime()) ? dObj.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }) : '';

                const defaultPrice = (appt.finalPrice !== undefined && appt.finalPrice !== null && appt.finalPrice !== '')
                    ? parseFloat(appt.finalPrice)
                    : details.price;

                return `
                    <tr>
                        <td>
                            <div style="font-weight:600;">${dateStr}</div>
                            <small style="color:var(--text-secondary);">${timeStr}</small>
                        </td>
                        <td>
                            <div style="font-weight:600;">${client.name}</div>
                            <small style="color:var(--text-secondary);">${client.phone || 'Sem telefone'}</small>
                        </td>
                        <td>
                            <span>${veh.model}</span>
                            ${veh.plate ? `<span class="plate-chip">${veh.plate}</span>` : ''}
                        </td>
                        <td>
                            <div style="max-width: 260px; line-height: 1.35;">${details.name}</div>
                        </td>
                        <td>
                            <div class="inline-price-wrap" title="Edite o valor diretamente se desejar ajustar antes de cobrar">
                                <input type="number" step="0.01" min="0"
                                       id="pending-price-${appt.id}"
                                       class="inline-price-input"
                                       value="${(defaultPrice || 0).toFixed(2)}">
                                <span style="color:var(--text-secondary); font-weight:700; font-size:0.85rem;">€</span>
                            </div>
                        </td>
                        <td>
                            <div class="checkout-actions-row">
                                <button type="button" class="btn-checkout btn-cash"
                                        title="Confirmar pagamento em Numerário em 1 clique"
                                        onclick="window.quickCheckoutPayment('${appt.id}', 'Numerário')">
                                    💵 Cobrar Numerário
                                </button>
                                <button type="button" class="btn-checkout btn-mbway"
                                        title="Confirmar pagamento por MBWay em 1 clique"
                                        onclick="window.quickCheckoutPayment('${appt.id}', 'MBWay')">
                                    📱 Cobrar MBWay
                                </button>
                                <button type="button" class="btn-checkout btn-adjust"
                                        title="Abrir janela de ajuste detalhado de valor/notas"
                                        onclick="window.openPaymentModal('${appt.id}')">
                                    ✏️ Ajustar Valor
                                </button>
                                <button type="button" class="btn-checkout btn-whatsapp"
                                        title="Enviar WhatsApp a avisar que o carro está pronto"
                                        onclick="window.notifyCarReadyWhatsApp('${appt.id}')">
                                    📲 Avisar Carro Pronto
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');
        }

        // 2. Filter Paid History
        const query = (this.searchQuery || '').trim().toLowerCase();
        const filteredPaid = paidAll.filter(appt => {
            if (!this.matchesPeriod(appt, this.selectedPeriod)) return false;

            if (this.selectedMethod !== 'all') {
                const method = appt.paymentMethod || '';
                if (method !== this.selectedMethod) return false;
            }

            if (query) {
                const client = clientsById.get(appt.clientId) || { name: '', phone: '', vehicles: [] };
                const veh = this.getVehicleDetails(appt, client);
                const details = this.getServiceDetails(appt, services);
                const allPlates = (client.vehicles || []).map(v => v.plate || '').join(' ');
                const allModels = (client.vehicles || []).map(v => v.model || '').join(' ');

                const haystack = `${client.name} ${client.phone || ''} ${veh.model} ${veh.plate} ${allPlates} ${allModels} ${details.name} ${appt.paymentNotes || ''}`.toLowerCase();
                if (!haystack.includes(query)) return false;
            }

            return true;
        }).sort((a, b) => new Date(b.date) - new Date(a.date));

        // Show/hide clear filters button
        const clearBtn = document.getElementById('billing-clear-filters');
        if (clearBtn) {
            if (query || this.selectedMethod !== 'all') {
                clearBtn.classList.remove('hidden');
            } else {
                clearBtn.classList.add('hidden');
            }
        }

        // Compute KPIs for filtered paid appointments
        let periodTotal = 0;
        let cashTotal = 0;
        let mbwayTotal = 0;
        let cashCount = 0;
        let mbwayCount = 0;

        filteredPaid.forEach(appt => {
            const details = this.getServiceDetails(appt, services);
            const finalPrice = (appt.finalPrice !== undefined && appt.finalPrice !== null && appt.finalPrice !== '')
                ? parseFloat(appt.finalPrice)
                : details.price;
            const amount = isNaN(finalPrice) ? 0 : finalPrice;

            periodTotal += amount;
            if (appt.paymentMethod === 'Numerário') {
                cashTotal += amount;
                cashCount++;
            } else if (appt.paymentMethod === 'MBWay') {
                mbwayTotal += amount;
                mbwayCount++;
            }
        });

        const cashPct = periodTotal > 0 ? Math.round((cashTotal / periodTotal) * 100) : 0;
        const mbwayPct = periodTotal > 0 ? Math.round((mbwayTotal / periodTotal) * 100) : 0;

        // Update Top KPI Cards
        document.getElementById('kpi-pending-total').textContent = this.formatCurrency(pendingTotalEur);
        document.getElementById('kpi-pending-count').textContent =
            `${completed.length} ${completed.length === 1 ? 'veículo concluído por cobrar' : 'veículos concluídos por cobrar'}`;

        document.getElementById('kpi-period-label').textContent =
            `Faturado (${this.getPeriodDisplayLabel(this.selectedPeriod)})`;
        document.getElementById('kpi-period-total').textContent = this.formatCurrency(periodTotal);
        document.getElementById('kpi-period-count').textContent =
            `${filteredPaid.length} ${filteredPaid.length === 1 ? 'serviço pago' : 'serviços pagos'}`;

        document.getElementById('kpi-cash-total').textContent = this.formatCurrency(cashTotal);
        document.getElementById('kpi-cash-pct').textContent = `${cashPct}% (${cashCount})`;
        document.getElementById('kpi-cash-bar').style.width = `${cashPct}%`;

        document.getElementById('kpi-mbway-total').textContent = this.formatCurrency(mbwayTotal);
        document.getElementById('kpi-mbway-pct').textContent = `${mbwayPct}% (${mbwayCount})`;
        document.getElementById('kpi-mbway-bar').style.width = `${mbwayPct}%`;

        const historyBadge = document.getElementById('history-badge-counter');
        if (historyBadge) {
            historyBadge.textContent = `${filteredPaid.length} ${filteredPaid.length === 1 ? 'registo' : 'registos'}`;
        }

        // Render History Rows (with smart pagination cap for 1,000+ rows)
        if (filteredPaid.length === 0) {
            historyList.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align:center; padding: 28px; color: var(--text-muted);">
                        Nenhum pagamento encontrado para os filtros selecionados.
                    </td>
                </tr>
            `;
        } else {
            const visibleItems = filteredPaid.slice(0, this.historyLimit);
            const rowsHtml = visibleItems.map(appt => {
                const client = clientsById.get(appt.clientId) || { name: 'Cliente Desconhecido', phone: '', vehicles: [] };
                const details = this.getServiceDetails(appt, services);
                const veh = this.getVehicleDetails(appt, client);
                const dObj = new Date(appt.date);
                const dateStr = !isNaN(dObj.getTime()) ? dObj.toLocaleDateString('pt-PT') : '-';

                const finalPrice = (appt.finalPrice !== undefined && appt.finalPrice !== null && appt.finalPrice !== '')
                    ? parseFloat(appt.finalPrice)
                    : details.price;

                const method = appt.paymentMethod || 'Numerário';
                const methodBadge = method === 'MBWay'
                    ? `<span class="method-badge method-mbway">📱 MBWay</span>`
                    : `<span class="method-badge method-cash">💵 Numerário</span>`;

                return `
                    <tr>
                        <td style="white-space:nowrap;">${dateStr}</td>
                        <td>
                            <div style="font-weight:600;">${client.name}</div>
                            <small style="color:var(--text-secondary);">${client.phone || ''}</small>
                        </td>
                        <td>
                            <span>${veh.model}</span>
                            ${veh.plate ? `<span class="plate-chip">${veh.plate}</span>` : ''}
                        </td>
                        <td>
                            <div style="max-width: 250px; line-height: 1.35;">${details.name}</div>
                            ${appt.paymentNotes ? `<small style="color:#ff9f0a; display:block; margin-top:2px;">📝 ${appt.paymentNotes}</small>` : ''}
                        </td>
                        <td style="font-weight:800; color:var(--text-primary); white-space:nowrap;">
                            ${this.formatCurrency(finalPrice)}
                        </td>
                        <td>${methodBadge}</td>
                        <td><span class="status-paid-pill">✔ Pago</span></td>
                        <td>
                            <div class="checkout-actions-row">
                                <button type="button" class="btn-checkout btn-adjust"
                                        title="Alterar valor cobrado ou método de pagamento (Numerário / MBWay)"
                                        onclick="window.openPaymentModal('${appt.id}')">
                                    ✏️ Alterar Valor / Método
                                </button>
                                <button type="button" class="btn-checkout btn-whatsapp"
                                        title="Enviar Recibo / Comprovativo por WhatsApp ao cliente"
                                        onclick="window.sendReceiptWhatsApp('${appt.id}')">
                                    🧾 Recibo WhatsApp
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');

            const remaining = filteredPaid.length - visibleItems.length;
            const loadMoreRow = remaining > 0 ? `
                <tr>
                    <td colspan="8" style="text-align:center; padding: 14px;">
                        <button type="button" class="btn btn-secondary" onclick="window.loadMoreBillingHistory()">
                            Mostrar mais registos (${remaining} restantes)
                        </button>
                    </td>
                </tr>
            ` : '';

            historyList.innerHTML = rowsHtml + loadMoreRow;
        }

        totalEl.textContent = this.formatCurrency(periodTotal);
        if (breakdownEl) {
            breakdownEl.innerHTML = `💵 Numerário: <strong>${this.formatCurrency(cashTotal)}</strong> (${cashPct}%) &nbsp;|&nbsp; 📱 MBWay: <strong>${this.formatCurrency(mbwayTotal)}</strong> (${mbwayPct}%)`;
        }

        // Global action handlers
        window.loadMoreBillingHistory = () => {
            this.historyLimit += 300;
            this.loadBilling();
        };

        window.quickCheckoutPayment = (id, method) => {
            const appt = store.getAppointments().find(a => a.id === id);
            if (!appt) return;
            const details = this.getServiceDetails(appt, services);
            const priceInput = document.getElementById(`pending-price-${id}`);
            let finalPrice = priceInput ? parseFloat(priceInput.value) : details.price;
            if (isNaN(finalPrice) || finalPrice < 0) {
                finalPrice = details.price;
            }

            store.updateAppointmentStatus(id, 'paid', Number(finalPrice.toFixed(2)), method);
            this.showToast(`✅ Pagamento de ${this.formatCurrency(finalPrice)} (${method}) registado com sucesso!`);
            this.loadBilling();
        };

        window.openPaymentModal = (id) => {
            const modal = document.getElementById('modal-payment');
            const appt = store.getAppointments().find(a => a.id === id);
            if (!appt) return;

            const client = clientsById.get(appt.clientId) || { name: 'Cliente', phone: '', vehicles: [] };
            const veh = this.getVehicleDetails(appt, client);
            const details = this.getServiceDetails(appt, services);

            const currentPrice = (appt.finalPrice !== undefined && appt.finalPrice !== null && appt.finalPrice !== '')
                ? parseFloat(appt.finalPrice)
                : details.price;

            const inlineInput = document.getElementById(`pending-price-${id}`);
            const prefillPrice = inlineInput ? parseFloat(inlineInput.value) : currentPrice;

            this._currentModalBasePrice = details.price;

            document.getElementById('modal-payment-title').textContent =
                appt.status === 'paid' ? '✏️ Alterar Pagamento Registado' : '💳 Confirmar / Ajustar Pagamento';

            document.getElementById('payment-client-banner').innerHTML = `
                <div><strong>👤 Cliente:</strong> ${client.name} ${client.phone ? `(${client.phone})` : ''}</div>
                <div style="margin-top:3px;"><strong>🚘 Veículo:</strong> ${veh.fullText}</div>
            `;

            document.getElementById('payment-appointment-id').value = id;
            document.getElementById('payment-service-name').value = details.name;
            document.getElementById('payment-base-price-hint').textContent = `Base tabelado: ${this.formatCurrency(details.price)}`;
            document.getElementById('payment-final-price').value = (isNaN(prefillPrice) ? details.price : prefillPrice).toFixed(2);
            document.getElementById('payment-method-select').value = appt.paymentMethod || 'Numerário';
            document.getElementById('payment-notes').value = appt.paymentNotes || '';

            modal.classList.remove('hidden');
        };

        window.notifyCarReadyWhatsApp = (id) => {
            const appt = store.getAppointments().find(a => a.id === id);
            if (!appt) return;
            const client = clientsById.get(appt.clientId) || { name: 'Cliente', phone: '', vehicles: [] };
            const veh = this.getVehicleDetails(appt, client);
            const details = this.getServiceDetails(appt, services);
            const priceInput = document.getElementById(`pending-price-${id}`);
            const amount = priceInput && !isNaN(parseFloat(priceInput.value))
                ? parseFloat(priceInput.value)
                : details.price;

            let phoneDigits = this.normalizePhoneForWhatsApp(client.phone);
            if (!phoneDigits) {
                const manual = prompt(`O cliente ${client.name} não tem telefone válido associado. Insira o número de telemóvel para enviar WhatsApp:`, '91');
                if (!manual) return;
                phoneDigits = this.normalizePhoneForWhatsApp(manual);
            }

            const msg = `Olá ${client.name}! O seu veículo (${veh.fullText}) já se encontra pronto para levantamento na NiceCarCleaner ✨. Serviços realizados: ${details.name}. Valor a pagamento: ${amount.toFixed(2)}€ (Numerário ou MBWay). Até já!`;
            window.open(`https://wa.me/${phoneDigits}?text=${encodeURIComponent(msg)}`, '_blank');
        };

        window.sendReceiptWhatsApp = (id) => {
            const appt = store.getAppointments().find(a => a.id === id);
            if (!appt) return;
            const client = clientsById.get(appt.clientId) || { name: 'Cliente', phone: '', vehicles: [] };
            const veh = this.getVehicleDetails(appt, client);
            const details = this.getServiceDetails(appt, services);

            const finalPrice = (appt.finalPrice !== undefined && appt.finalPrice !== null && appt.finalPrice !== '')
                ? parseFloat(appt.finalPrice)
                : details.price;
            const method = appt.paymentMethod || 'Numerário';

            let phoneDigits = this.normalizePhoneForWhatsApp(client.phone);
            if (!phoneDigits) {
                const manual = prompt(`O cliente ${client.name} não tem telefone válido associado. Insira o número de telemóvel para enviar o recibo WhatsApp:`, '91');
                if (!manual) return;
                phoneDigits = this.normalizePhoneForWhatsApp(manual);
            }

            const msg = `Olá ${client.name}! Obrigado pela preferência na NiceCarCleaner. Resumo do serviço no seu ${veh.fullText}: ${details.name} — Total pago: ${finalPrice.toFixed(2)}€ (${method}). Até à próxima!`;
            window.open(`https://wa.me/${phoneDigits}?text=${encodeURIComponent(msg)}`, '_blank');
        };
    }

    attachEvents() {
        const modal = document.getElementById('modal-payment');
        const btnClose = modal.querySelector('.close-modal');
        const btnCancel = modal.querySelector('.close-modal-btn');
        const form = document.getElementById('form-payment');

        const closeModal = () => modal.classList.add('hidden');

        btnClose.addEventListener('click', closeModal);
        btnCancel.addEventListener('click', closeModal);

        // Quick price adjustment pills inside modal
        const quickContainer = document.getElementById('payment-quick-adjust');
        if (quickContainer) {
            quickContainer.querySelectorAll('.price-pill').forEach(btn => {
                btn.addEventListener('click', () => {
                    const input = document.getElementById('payment-final-price');
                    const base = Number(this._currentModalBasePrice) || 0;
                    let curr = parseFloat(input.value) || base;
                    const adj = btn.dataset.adj;

                    if (adj === 'base') curr = base;
                    else if (adj === '-5') curr = Math.max(0, curr - 5);
                    else if (adj === '+5') curr = curr + 5;
                    else if (adj === '+10') curr = curr + 10;
                    else if (adj === '-10%') curr = Math.max(0, curr * 0.9);

                    input.value = curr.toFixed(2);
                });
            });
        }

        // Filter events
        const periodSelect = document.getElementById('billing-filter-period');
        const methodSelect = document.getElementById('billing-filter-method');
        const searchInput = document.getElementById('billing-filter-search');
        const clearBtn = document.getElementById('billing-clear-filters');

        if (periodSelect) {
            periodSelect.addEventListener('change', (e) => {
                this.selectedPeriod = e.target.value;
                this.historyLimit = 250;
                this.loadBilling();
            });
        }

        if (methodSelect) {
            methodSelect.addEventListener('change', (e) => {
                this.selectedMethod = e.target.value;
                this.historyLimit = 250;
                this.loadBilling();
            });
        }

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value;
                this.historyLimit = 250;
                this.loadBilling();
            });
        }

        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.selectedMethod = 'all';
                this.searchQuery = '';
                if (methodSelect) methodSelect.value = 'all';
                if (searchInput) searchInput.value = '';
                this.loadBilling();
            });
        }

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const id = formData.get('appointmentId');
            const finalPrice = parseFloat(formData.get('finalPrice')) || 0;
            const paymentMethod = formData.get('paymentMethod') || 'Numerário';
            const paymentNotes = (formData.get('paymentNotes') || '').trim();

            store.updateAppointmentStatus(id, 'paid', Number(finalPrice.toFixed(2)), paymentMethod);
            if (typeof store.updateAppointment === 'function') {
                store.updateAppointment({
                    id,
                    status: 'paid',
                    finalPrice: Number(finalPrice.toFixed(2)),
                    paymentMethod,
                    paymentNotes
                });
            }

            form.reset();
            closeModal();
            this.showToast(`✅ Pagamento guardado: ${this.formatCurrency(finalPrice)} (${paymentMethod})`);
            this.loadBilling();
        });
    }
}
