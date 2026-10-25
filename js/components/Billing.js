class Billing {
    constructor(container) {
        this.container = container;
        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div class="page-header">
                <h1>Faturação</h1>
            </div>
            
            <div class="card">
                <h3>Serviços Concluídos (A Aguardar Pagamento)</h3>
                <div class="table-responsive" style="margin-top:16px;">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Cliente</th>
                                <th>Serviço</th>
                                <th>Valor Base</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody id="billing-pending-list">
                            <!-- Pending items -->
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="card" style="margin-top: 24px;">
                <h3>Histórico de Pagamentos</h3>
                <div class="table-responsive" style="margin-top:16px;">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Data Pagamento</th>
                                <th>Cliente</th>
                                <th>Serviço</th>
                                <th>Valor Cobrado</th>
                                <th>Método</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody id="billing-history-list">
                            <!-- History items -->
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="3" style="text-align:right; font-weight:bold;">Total Faturado:</td>
                                <td id="billing-total" style="font-weight:bold; color:var(--accent-success);">0.00 €</td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            <!-- Modal for Payment Confirmation -->
            <div id="modal-payment" class="modal hidden">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Confirmar Pagamento</h2>
                        <span class="close-modal">&times;</span>
                    </div>
                    <form id="form-payment">
                        <input type="hidden" name="appointmentId" id="payment-appointment-id">
                        <div class="form-group">
                            <label>Serviço Base</label>
                            <input type="text" id="payment-service-name" disabled style="opacity:0.7;">
                        </div>
                        <div class="form-group">
                            <label>Valor Final a Cobrar (€)</label>
                            <input type="number" name="finalPrice" id="payment-final-price" step="0.01" required>
                            <small style="color:var(--text-muted);">Ajuste este valor se houver extras ou descontos.</small>
                        </div>
                        <div class="form-group">
                            <label>Método de Pagamento</label>
                            <select name="paymentMethod" required>
                                <option value="">Selecione...</option>
                                <option value="Numerário">Numerário</option>
                                <option value="MBWay">MBWay</option>
                            </select>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary close-modal-btn">Cancelar</button>
                            <button type="submit" class="btn btn-primary">Confirmar Recebimento</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        this.loadBilling();
        this.attachEvents();
    }

    loadBilling() {
        const appointments = store.getAppointments();
        const clients = store.getClients();
        const services = store.getServices();

        const pendingList = document.getElementById('billing-pending-list');
        const historyList = document.getElementById('billing-history-list');
        const totalEl = document.getElementById('billing-total');

        // Filter appointments
        const completed = appointments.filter(a => a.status === 'completed');
        const paid = appointments.filter(a => a.status === 'paid');

        // Helper to get service details
        const getServiceDetails = (appt) => {
            let total = 0;
            let names = [];

            if (appt.serviceIds && appt.serviceIds.length > 0) {
                appt.serviceIds.forEach(id => {
                    const s = services.find(srv => srv.id === id);
                    if (s) {
                        total += parseFloat(s.price);
                        names.push(s.name);
                    }
                });
            } else if (appt.serviceId) {
                const s = services.find(srv => srv.id === appt.serviceId);
                if (s) {
                    total = parseFloat(s.price);
                    names.push(s.name);
                }
            }

            return {
                price: total,
                name: names.length > 0 ? names.join(', ') : 'Serviço Removido'
            };
        };

        // Render Pending
        if (completed.length === 0) {
            pendingList.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 20px; color: var(--text-muted);">Nenhum serviço a aguardar pagamento.</td></tr>';
        } else {
            pendingList.innerHTML = completed.map(appt => {
                const client = clients.find(c => c.id === appt.clientId) || { name: '?', vehicle: '-' };
                const details = getServiceDetails(appt);
                const date = new Date(appt.date).toLocaleDateString('pt-PT');

                // Show vehicle from appt if available, otherwise first vehicle of client
                const vehicle = appt.vehicle || (client.vehicles && client.vehicles.length > 0 ? client.vehicles[0].model : '-');

                return `
                    <tr>
                        <td>${date}</td>
                        <td>${client.name} <small>(${vehicle})</small></td>
                        <td>${details.name}</td>
                        <td style="font-weight:bold;">${details.price.toFixed(2)} €</td>
                        <td>
                            <button class="btn btn-primary" style="padding: 6px 12px; font-size: 0.9em;" onclick="window.openPaymentModal('${appt.id}')">Confirmar Pagamento</button>
                        </td>
                    </tr>
                `;
            }).join('');
        }

        // Render History
        let total = 0;
        if (paid.length === 0) {
            historyList.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 20px; color: var(--text-muted);">Nenhum pagamento registado.</td></tr>';
        } else {
            paid.sort((a, b) => new Date(b.date) - new Date(a.date));

            historyList.innerHTML = paid.map(appt => {
                const client = clients.find(c => c.id === appt.clientId) || { name: '?', vehicle: '-' };
                const details = getServiceDetails(appt);
                const date = new Date(appt.date).toLocaleDateString('pt-PT');

                // Use finalPrice if available, otherwise fallback to calculated price
                const finalPrice = appt.finalPrice ? parseFloat(appt.finalPrice) : details.price;
                total += finalPrice;

                return `
                    <tr>
                        <td>${date}</td>
                        <td>${client.name}</td>
                        <td>${details.name}</td>
                        <td>${finalPrice.toFixed(2)} €</td>
                        <td>${appt.paymentMethod || '-'}</td>
                        <td><span style="color:var(--accent-success); font-weight:bold;">Pago</span></td>
                    </tr>
                `;
            }).join('');
        }

        totalEl.textContent = `${total.toFixed(2)} €`;

        // Expose function for onclick
        window.openPaymentModal = (id) => {
            const modal = document.getElementById('modal-payment');
            const appt = store.getAppointments().find(a => a.id === id);
            if (!appt) return;

            const details = getServiceDetails(appt);

            document.getElementById('payment-appointment-id').value = id;
            document.getElementById('payment-service-name').value = details.name;
            document.getElementById('payment-final-price').value = details.price.toFixed(2);
            modal.classList.remove('hidden');
        };
    }

    attachEvents() {
        const modal = document.getElementById('modal-payment');
        const btnClose = document.querySelector('.close-modal');
        const btnCancel = document.querySelector('.close-modal-btn');
        const form = document.getElementById('form-payment');

        const closeModal = () => modal.classList.add('hidden');

        btnClose.addEventListener('click', closeModal);
        btnCancel.addEventListener('click', closeModal);

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const id = formData.get('appointmentId');
            const finalPrice = formData.get('finalPrice');
            const paymentMethod = formData.get('paymentMethod');

            store.updateAppointmentStatus(id, 'paid', finalPrice, paymentMethod);
            form.reset();
            closeModal();
            this.loadBilling();
        });
    }
}
