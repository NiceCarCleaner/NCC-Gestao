class Schedule {
    constructor(container) {
        this.container = container;
        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div class="page-header">
                <h1>Agenda</h1>
                <button id="btn-add-appointment" class="btn btn-primary">+ Novo Agendamento</button>
            </div>
            <div class="card">
                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Data/Hora</th>
                                <th>Cliente</th>
                                <th>Serviço</th>
                                <th>Estado</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody id="appointments-list">
                            <!-- Appointments will be loaded here -->
                        </tbody>
                    </table>
                </div>
            </div>
            <!-- Modal for New / Edit Appointment -->
            <div id="modal-appointment" class="modal hidden">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Agendamento</h2>
                        <span class="close-modal">&times;</span>
                    </div>
                    <form id="form-appointment">
                        <div class="form-group" style="position: relative;">
                            <label>Cliente</label>
                            <input type="text" id="search-client-input" placeholder="Pesquisar cliente (Nome, Telefone, Matrícula)..." autocomplete="off">
                            <input type="hidden" name="clientId" id="selected-client-id" required>
                            <div id="client-search-results" style="position: absolute; top: 100%; left: 0; right: 0; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 6px; max-height: 200px; overflow-y: auto; z-index: 100; display: none;"></div>
                        </div>
                        <div class="form-group">
                            <label>Veículo</label>
                            <select name="vehicle" id="select-vehicle" required disabled>
                                <option value="">Selecione um cliente primeiro...</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Serviços</label>
                            <div style="display:flex; gap:10px;">
                                <select id="select-service" style="flex:1;">
                                    <option value="">Selecione um serviço...</option>
                                </select>
                                <button type="button" id="btn-add-service-to-list" class="btn btn-secondary" style="padding:0 12px;">Adicionar</button>
                            </div>
                            <div id="selected-services-container" style="display:flex; flex-wrap:wrap; gap:5px; margin-top:10px; min-height:30px; padding:5px; background:var(--bg-input); border:1px solid var(--border-color); border-radius:6px;">
                                <!-- Selected services tags will appear here -->
                                <span class="placeholder-text" style="color:var(--text-muted); font-size:0.9em; padding:4px;">Nenhum serviço selecionado</span>
                            </div>
                            <input type="hidden" name="serviceIds" id="selected-service-ids">
                        </div>
                        <div class="form-group">
                            <label>Data e Hora</label>
                            <input type="datetime-local" name="date" id="date" required>
                        </div>
                        <div class="form-group">
                            <label>Notas</label>
                            <textarea name="notes" id="notes" rows="2" style="width:100%; background:var(--bg-input); border:1px solid var(--border-color); color:var(--text-primary); padding:10px; border-radius:6px;"></textarea>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary close-modal-btn">Cancelar</button>
                            <input type="hidden" name="editAppointmentId" id="edit-appointment-id">
                            <button type="submit" class="btn btn-primary">Salvar</button>
                        </div>
                    </form>
                </div>
            </div>
            <!-- Modal for Cancellation -->
            <div id="modal-cancellation" class="modal hidden">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Cancelar Agendamento</h2>
                        <span class="close-modal-cancellation">&times;</span>
                    </div>
                    <form id="form-cancellation">
                        <input type="hidden" id="cancellation-appointment-id">
                        <div class="form-group">
                            <label>Motivo do Cancelamento</label>
                            <textarea name="reason" rows="3" required style="width:100%; background:var(--bg-input); border:1px solid var(--border-color); color:var(--text-primary); padding:10px; border-radius:6px;"></textarea>
                        </div>
                        <div class="form-group">
                            <label style="display:flex; align-items:center; gap:10px; cursor:pointer;">
                                <input type="checkbox" name="isJustified" style="width:auto;">
                                Cancelamento Justificado?
                            </label>
                            <small style="color:var(--text-muted);">Marque se o cliente avisou com antecedência ou teve um motivo válido.</small>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary close-modal-cancellation-btn">Voltar</button>
                            <button type="submit" class="btn btn-danger">Confirmar Cancelamento</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        this.loadAppointments();
        this.loadOptions();
        this.attachEvents();
    }

    loadOptions() {
        // Only load services, clients are loaded dynamically via search
        const services = store.getServices();
        const serviceSelect = document.getElementById('select-service');

        // Clear existing options first to avoid duplicates if called multiple times
        serviceSelect.innerHTML = '<option value="">Selecione um serviço...</option>';

        services.forEach(s => {
            const option = document.createElement('option');
            option.value = s.id;
            option.textContent = `${s.name} - ${s.price}€`;
            serviceSelect.appendChild(option);
        });
    }

    loadAppointments() {
        const appointments = store.getAppointments();
        const clients = store.getClients();
        const services = store.getServices();
        const tbody = document.getElementById('appointments-list');
        if (appointments.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px; color:var(--text-muted);">Nenhum agendamento registado.</td></tr>';
            return;
        }
        appointments.sort((a, b) => new Date(b.date) - new Date(a.date));
        tbody.innerHTML = appointments.map(appt => {
            const client = clients.find(c => c.id === appt.clientId) || { name: 'Cliente Removido', vehicles: [] };

            // Map serviceIds to names
            let serviceNames = 'Sem serviço';
            if (appt.serviceIds && appt.serviceIds.length > 0) {
                serviceNames = appt.serviceIds.map(id => {
                    const s = services.find(srv => srv.id === id);
                    return s ? s.name : '???';
                }).join(', ');
            } else if (appt.serviceId) {
                // Fallback for non-migrated (shouldn't happen with store migration but safe to keep)
                const s = services.find(srv => srv.id === appt.serviceId);
                serviceNames = s ? s.name : '???';
            }

            const date = new Date(appt.date).toLocaleString('pt-PT', { dateStyle: 'short', timeStyle: 'short' });
            let vehicleDisplay = '-';
            if (appt.vehicle) {
                vehicleDisplay = appt.vehicle;
            } else if (client.vehicles && client.vehicles.length > 0) {
                vehicleDisplay = `${client.vehicles[0].model} (${client.vehicles[0].plate || ''})`;
            }
            let statusBadge = '';
            let actionBtn = '';
            if (appt.status === 'scheduled' || !appt.status) {
                statusBadge = '<span style="padding:4px 8px; border-radius:4px; background:rgba(255,215,0,0.1); color:var(--accent-secondary); font-size:0.9em;">Agendado</span>';
                actionBtn = `
                    <button class="btn btn-primary" style="padding:6px 12px; font-size:0.9em; margin-right:5px;" onclick="window.completeAppointment('${appt.id}')">Concluir</button>
                    <button class="btn btn-danger" style="padding:6px 12px; font-size:0.9em; margin-right:5px;" onclick="window.cancelAppointment('${appt.id}')">Cancelar</button>
                    <button class="btn btn-secondary" style="padding:6px 12px; font-size:0.9em;" onclick="window.openEditAppointment('${appt.id}')">Editar</button>
                `;
            } else if (appt.status === 'completed') {
                statusBadge = '<span style="padding:4px 8px; border-radius:4px; background:rgba(0,122,255,0.1); color:var(--accent-primary); font-size:0.9em;">Concluído</span>';
                actionBtn = `<span style="font-size:0.85em; color:var(--text-muted); margin-right:5px; vertical-align:middle;">A aguardar pagamento</span><button style="background:transparent; border:none; color:var(--accent-danger); cursor:pointer; padding:4px; vertical-align:middle;" title="Eliminar" onclick="window.deleteAppointment('${appt.id}')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg></button>`;
            } else if (appt.status === 'paid') {
                statusBadge = '<span style="padding:4px 8px; border-radius:4px; background:rgba(50,215,75,0.1); color:var(--accent-success); font-size:0.9em;">Pago</span>';
                actionBtn = `<span style="font-size:0.85em; color:var(--accent-success); margin-right:5px; vertical-align:middle;">Finalizado</span><button style="background:transparent; border:none; color:var(--accent-danger); cursor:pointer; padding:4px; vertical-align:middle;" title="Eliminar" onclick="window.deleteAppointment('${appt.id}')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg></button>`;
            } else if (appt.status === 'cancelled') {
                statusBadge = '<span style="padding:4px 8px; border-radius:4px; background:rgba(255,69,58,0.1); color:var(--accent-danger); font-size:0.9em;">Cancelado</span>';
                actionBtn = `<span style="font-size:0.85em; color:var(--text-muted); margin-right:5px; vertical-align:middle;">${appt.isJustified ? 'Justificado' : 'Não Justificado'}</span><button style="background:transparent; border:none; color:var(--accent-danger); cursor:pointer; padding:4px; vertical-align:middle;" title="Eliminar" onclick="window.deleteAppointment('${appt.id}')"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg></button>`;
            }
            return `
                <tr>
                    <td>${date}</td>
                    <td>
                        <div style="font-weight:500;">${client.name}</div>
                        <div style="font-size:0.85em; color:var(--text-secondary);">${vehicleDisplay}</div>
                    </td>
                    <td>${serviceNames}</td>
                    <td>${statusBadge}</td>
                    <td>${actionBtn}</td>
                </tr>
            `;
        }).join('');
    }

    attachEvents() {
        const modal = document.getElementById('modal-appointment');
        const btnAdd = document.getElementById('btn-add-appointment');
        const btnClose = document.querySelector('.close-modal');
        const btnCancel = document.querySelector('.close-modal-btn');
        const form = document.getElementById('form-appointment');
        const searchInput = document.getElementById('search-client-input');
        const searchResults = document.getElementById('client-search-results');
        const selectedClientIdInput = document.getElementById('selected-client-id');
        const vehicleSelect = document.getElementById('select-vehicle');
        const modalCancel = document.getElementById('modal-cancellation');
        const btnCloseCancel = document.querySelector('.close-modal-cancellation');
        const btnBackCancel = document.querySelector('.close-modal-cancellation-btn');
        const formCancel = document.getElementById('form-cancellation');

        const btnAddService = document.getElementById('btn-add-service-to-list');
        const selectedServicesContainer = document.getElementById('selected-services-container');
        let currentSelectedServices = []; // Array of objects {id, name}

        const renderSelectedServices = () => {
            if (currentSelectedServices.length === 0) {
                selectedServicesContainer.innerHTML = '<span class="placeholder-text" style="color:var(--text-muted); font-size:0.9em; padding:4px;">Nenhum serviço selecionado</span>';
                return;
            }
            selectedServicesContainer.innerHTML = currentSelectedServices.map((s, index) => `
                <span style="background:var(--accent-primary); color:white; padding:4px 8px; border-radius:12px; font-size:0.85em; display:flex; align-items:center; gap:5px;">
                    ${s.name}
                    <span class="remove-service-tag" data-index="${index}" style="cursor:pointer; font-weight:bold;">&times;</span>
                </span>
            `).join('');

            // Add click events for removal
            selectedServicesContainer.querySelectorAll('.remove-service-tag').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const idx = parseInt(e.target.dataset.index);
                    currentSelectedServices.splice(idx, 1);
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

            // Check if already added
            if (currentSelectedServices.some(s => s.id === serviceId)) {
                alert('Este serviço já foi adicionado.');
                return;
            }

            if (service) {
                currentSelectedServices.push({ id: service.id, name: service.name });
                renderSelectedServices();
                serviceSelect.value = ''; // Reset select
            }
        });

        const openModal = () => {
            document.getElementById('edit-appointment-id').value = '';
            // Reset search fields
            searchInput.value = '';
            selectedClientIdInput.value = '';
            // Reset services
            currentSelectedServices = [];
            renderSelectedServices();

            vehicleSelect.innerHTML = '<option value="">Selecione um cliente primeiro...</option>';
            vehicleSelect.disabled = true;
            modal.classList.remove('hidden');
        };
        const closeModal = () => {
            modal.classList.add('hidden');
            searchResults.style.display = 'none';
        };
        const closeCancelModal = () => {
            modalCancel.classList.add('hidden');
            formCancel.reset();
        };

        btnAdd.addEventListener('click', openModal);
        btnClose.addEventListener('click', closeModal);
        btnCancel.addEventListener('click', closeModal);
        btnCloseCancel.addEventListener('click', closeCancelModal);
        btnBackCancel.addEventListener('click', closeCancelModal);

        // Search Logic
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            if (term.length < 1) {
                searchResults.style.display = 'none';
                return;
            }

            const clients = store.getClients();
            const filtered = clients.filter(c =>
                c.name.toLowerCase().includes(term) ||
                c.phone.includes(term) ||
                (c.vehicles && c.vehicles.some(v => v.plate && v.plate.toLowerCase().includes(term)))
            );

            if (filtered.length > 0) {
                searchResults.innerHTML = filtered.map(c => `
                    <div class="search-result-item" data-id="${c.id}" style="padding: 10px; cursor: pointer; border-bottom: 1px solid var(--border-color);">
                        <div style="font-weight: bold;">${c.name}</div>
                        <div style="font-size: 0.8em; color: var(--text-secondary);">${c.phone}</div>
                    </div>
                `).join('');
                searchResults.style.display = 'block';

                // Add click events to results
                searchResults.querySelectorAll('.search-result-item').forEach(item => {
                    item.addEventListener('click', () => {
                        const clientId = item.dataset.id;
                        const client = clients.find(c => c.id === clientId);

                        searchInput.value = client.name;
                        selectedClientIdInput.value = client.id;
                        searchResults.style.display = 'none';

                        // Trigger vehicle load
                        this.loadClientVehicles(client);
                    });
                });
            } else {
                searchResults.innerHTML = '<div style="padding: 10px; color: var(--text-muted);">Nenhum cliente encontrado</div>';
                searchResults.style.display = 'block';
            }
        });

        // Close search results when clicking outside
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
                searchResults.style.display = 'none';
            }
        });

        // Form submit handling (new or edit)
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const editId = formData.get('editAppointmentId');

            if (!formData.get('clientId')) {
                alert('Por favor selecione um cliente da lista.');
                return;
            }

            if (currentSelectedServices.length === 0) {
                alert('Por favor adicione pelo menos um serviço.');
                return;
            }

            const appointmentData = {
                clientId: formData.get('clientId'),
                serviceIds: currentSelectedServices.map(s => s.id),
                vehicle: formData.get('vehicle'),
                date: formData.get('date'),
                notes: formData.get('notes')
            };
            if (editId) {
                appointmentData.id = editId;
                store.updateAppointment(appointmentData);
            } else {
                appointmentData.status = 'scheduled';
                store.addAppointment(appointmentData);
            }
            form.reset();
            closeModal();
            this.loadAppointments();
        });

        // Global actions
        window.completeAppointment = (id) => {
            if (confirm('Marcar este serviço como concluído? Ele aparecerá na Faturação.')) {
                store.updateAppointmentStatus(id, 'completed');
                this.loadAppointments();
            }
        };
        window.cancelAppointment = (id) => {
            document.getElementById('cancellation-appointment-id').value = id;
            modalCancel.classList.remove('hidden');
        };
        window.openEditAppointment = (id) => {
            const appt = store.getAppointments().find(a => a.id === id);
            if (!appt) return;

            document.getElementById('edit-appointment-id').value = id;

            // Pre-fill client search
            const client = store.getClients().find(c => c.id === appt.clientId);
            if (client) {
                document.getElementById('search-client-input').value = client.name;
                document.getElementById('selected-client-id').value = client.id;
                this.loadClientVehicles(client);
                setTimeout(() => {
                    document.getElementById('select-vehicle').value = appt.vehicle || '';
                }, 100);
            }

            // Populate services
            currentSelectedServices = [];
            if (appt.serviceIds && appt.serviceIds.length > 0) {
                const services = store.getServices();
                appt.serviceIds.forEach(id => {
                    const s = services.find(srv => srv.id === id);
                    if (s) currentSelectedServices.push({ id: s.id, name: s.name });
                });
            } else if (appt.serviceId) {
                const services = store.getServices();
                const s = services.find(srv => srv.id === appt.serviceId);
                if (s) currentSelectedServices.push({ id: s.id, name: s.name });
            }
            renderSelectedServices();

            document.getElementById('select-service').value = '';
            document.getElementById('date').value = appt.date ? new Date(appt.date).toISOString().slice(0, 16) : '';
            document.getElementById('notes').value = appt.notes || '';
            modal.classList.remove('hidden');
        };
        window.deleteAppointment = (id) => {
            if (confirm('Tem a certeza que deseja eliminar permanentemente este agendamento? Esta ação não pode ser desfeita.')) {
                store.deleteAppointment(id);
                this.loadAppointments();
            }
        };

        // Cancellation form
        formCancel.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('cancellation-appointment-id').value;
            const reason = formCancel.elements['reason'].value;
            const isJustified = formCancel.elements['isJustified'].checked;
            store.cancelAppointment(id, reason, isJustified);
            closeCancelModal();
            this.loadAppointments();
        });
    }

    loadClientVehicles(client) {
        const vehicleSelect = document.getElementById('select-vehicle');
        vehicleSelect.innerHTML = '<option value="">Selecione um veículo...</option>';

        if (client && client.vehicles && client.vehicles.length > 0) {
            vehicleSelect.disabled = false;
            client.vehicles.forEach(v => {
                const option = document.createElement('option');
                const label = `${v.model} (${v.plate || 'Sem Matrícula'})`;
                option.value = label;
                option.textContent = label;
                vehicleSelect.appendChild(option);
            });
            if (client.vehicles.length === 1) {
                vehicleSelect.selectedIndex = 1;
            }
        } else {
            vehicleSelect.innerHTML = '<option value="">Sem veículos registados</option>';
            vehicleSelect.disabled = true;
        }
    }
}
