class Clients {
    constructor(container) {
        this.container = container;
        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div class="page-header">
                <h1>Clientes</h1>
                <div style="display: flex; gap: 10px; align-items: center;">
                    <input type="text" id="client-search" placeholder="Pesquisar (Nome, Telefone, Matrícula)..." 
                           style="padding: 8px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-input); color: var(--text-primary); width: 300px;">
                    <button id="btn-add-client" class="btn btn-primary">+ Novo Cliente</button>
                </div>
            </div>
            
            <div class="card">
                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Telefone</th>
                                <th>Veículo</th>
                                <th>Matrícula</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody id="clients-list">
                            <!-- Clients will be loaded here -->
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Modal for New Client -->
            <div id="modal-client" class="modal hidden">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2 id="modal-client-title">Novo Cliente</h2>
                        <span class="close-modal">&times;</span>
                    </div>
                    <form id="form-client">
                        <input type="hidden" name="id" id="client-id">
                        <div class="form-group">
                            <label>Nome</label>
                            <input type="text" name="name" required>
                        </div>
                        <div class="form-group">
                            <label>Telefone</label>
                            <input type="tel" name="phone" required>
                        </div>
                        <div class="form-group">
                            <label>Veículos</label>
                            <div id="new-client-vehicles-container">
                                <div class="vehicle-entry" style="display:flex; gap:10px; margin-bottom:10px;">
                                    <input type="text" name="vehicle[]" placeholder="Marca/Modelo" required style="flex:2;">
                                    <input type="text" name="plate[]" placeholder="Matrícula" style="flex:1;">
                                </div>
                            </div>
                            <button type="button" id="btn-add-vehicle-field" class="btn btn-secondary" style="font-size:0.8em;">+ Adicionar Outro Veículo</button>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary close-modal-btn">Cancelar</button>
                            <button type="submit" class="btn btn-primary">Salvar</button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Modal for Client Details -->
            <div id="modal-client-details" class="modal hidden">
                <div class="modal-content" style="max-width: 900px; height: 90vh; display:flex; flex-direction:column;">
                    <div class="modal-header">
                        <h2 id="details-client-name">Detalhes do Cliente</h2>
                        <span class="close-modal-details">&times;</span>
                    </div>
                    
                    <div class="tabs">
                        <button class="tab-btn active" data-tab="tab-stats">Estatísticas</button>
                        <button class="tab-btn" data-tab="tab-vehicles">Veículos</button>
                        <button class="tab-btn" data-tab="tab-history">Histórico</button>
                        <button class="tab-btn" data-tab="tab-inspections">Inspeções</button>
                    </div>

                    <div class="tab-content" id="tab-stats" style="display:block;">
                        <div class="stats-grid">
                            <div class="stat-card">
                                <h3>Total de Lavagens</h3>
                                <p id="stat-total-washes" class="stat-value">0</p>
                            </div>
                            <div class="stat-card">
                                <h3>Total Gasto</h3>
                                <p id="stat-total-spent" class="stat-value">0€</p>
                            </div>
                        </div>
                        <h3 style="margin-top:20px; margin-bottom:10px;">Tipos de Serviço</h3>
                        <div id="stat-services-list"></div>
                    </div>

                    <div class="tab-content" id="tab-vehicles" style="display:none;">
                        <div id="details-vehicles-list"></div>
                        <div style="margin-top:20px; border-top:1px solid var(--border-color); padding-top:15px;">
                            <h4>Adicionar Veículo</h4>
                            <form id="form-add-vehicle-details" style="display:flex; gap:10px; margin-top:10px;">
                                <input type="text" name="model" placeholder="Marca/Modelo" required style="flex:2;">
                                <input type="text" name="plate" placeholder="Matrícula" style="flex:1;">
                                <button type="submit" class="btn btn-primary">Adicionar</button>
                            </form>
                        </div>
                    </div>

                    <div class="tab-content" id="tab-history" style="display:none;">
                        <div class="table-responsive">
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>Data</th>
                                        <th>Serviço</th>
                                        <th>Estado</th>
                                        <th>Notas/Motivo</th>
                                    </tr>
                                </thead>
                                <tbody id="details-history-list"></tbody>
                            </table>
                        </div>
                    </div>

                    <div class="tab-content" id="tab-inspections" style="display:none;">
                        <button id="btn-new-inspection" class="btn btn-primary" style="margin-bottom:15px;">+ Nova Inspeção</button>
                        <div id="details-inspections-list" style="overflow-y:auto; max-height:60vh;"></div>
                    </div>
                </div>
            </div>

            <!-- Modal for Inspection -->
            <div id="modal-inspection" class="modal hidden">
                <div class="modal-content" style="max-width: 800px;">
                    <div class="modal-header">
                        <h2>Inspeção de Veículo</h2>
                        <span class="close-modal-inspection">&times;</span>
                    </div>
                    <form id="form-inspection">
                        <input type="hidden" id="inspection-client-id">
                        
                        <div class="inspection-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                            <div class="checklist-section">
                                <h3>Checklist de Defeitos</h3>
                                <div class="form-group">
                                    <label><input type="checkbox" name="defect_scratches"> Riscos / Pintura</label>
                                    <label><input type="checkbox" name="defect_dents"> Amolgadelas</label>
                                    <label><input type="checkbox" name="defect_lights"> Luzes / Faróis</label>
                                    <label><input type="checkbox" name="defect_glass"> Vidros / Para-brisas</label>
                                    <label><input type="checkbox" name="defect_wheels"> Pneus / Jantes</label>
                                    <label><input type="checkbox" name="defect_interior"> Interior (Manchas/Rasgos)</label>
                                    <label><input type="checkbox" name="defect_dashboard_lights"> Luzes de Avaria no Quadrante</label>
                                </div>
                                <div class="form-group">
                                    <label>Notas Adicionais</label>
                                    <textarea name="notes" rows="4" style="width:100%; padding:8px; border-radius:6px; background:var(--bg-input); border:1px solid var(--border-color); color:var(--text-primary);"></textarea>
                                </div>
                            </div>
                            
                            <div class="photos-section">
                                <h3>Fotos do Veículo</h3>
                                <div class="form-group">
                                    <label for="inspection-photos" class="btn btn-secondary" style="display:inline-block; cursor:pointer;">
                                        📷 Adicionar Fotos
                                    </label>
                                    <input type="file" id="inspection-photos" multiple accept="image/*" style="display:none;">
                                    <div id="photos-preview" style="display:flex; flex-wrap:wrap; gap:10px; margin-top:10px;"></div>
                                </div>
                            </div>
                        </div>

                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary close-modal-inspection-btn">Cancelar</button>
                            <button type="submit" class="btn btn-primary">Salvar Inspeção</button>
                        </div>
                    </form>
                    
                    <div style="margin-top: 30px; border-top: 1px solid var(--border-color); padding-top: 20px;">
                        <h3>Histórico de Inspeções</h3>
                        <div id="inspection-history" style="max-height: 200px; overflow-y: auto;"></div>
                    </div>
                </div>
            </div>

            <!-- Modal for Photo Preview -->
            <div id="modal-photo-preview" class="modal hidden" style="z-index: 1100;">
                <div class="modal-content" style="background: transparent; box-shadow: none; border: none; max-width: 90vw; max-height: 90vh; display: flex; justify-content: center; align-items: center;">
                    <span class="close-modal-photo" style="position: absolute; top: 20px; right: 20px; color: white; font-size: 40px; cursor: pointer; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">&times;</span>
                    <img id="preview-image" src="" style="max-width: 100%; max-height: 90vh; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.5);">
                </div>
            </div>
        `;

        this.addStyles();
        this.loadClients();
        this.attachEvents();
    }

    addStyles() {
        if (!document.getElementById('page-styles')) {
            const style = document.createElement('style');
            style.id = 'page-styles';
            style.textContent = `
                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: var(--spacing-lg);
                }
                
                .data-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                
                .data-table th, .data-table td {
                    padding: 12px;
                    text-align: left;
                    border-bottom: 1px solid var(--border-color);
                }
                
                .data-table th {
                    color: var(--text-secondary);
                    font-weight: 500;
                }
                
                .modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0,0,0,0.7);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                    backdrop-filter: blur(5px);
                }
                
                .hidden {
                    display: none;
                }
                
                .modal-content {
                    background: var(--bg-card);
                    padding: 24px;
                    border-radius: 12px;
                    width: 100%;
                    max-width: 500px;
                    border: 1px solid var(--border-color);
                    box-shadow: var(--shadow-card);
                    max-height: 90vh;
                    overflow-y: auto;
                }
                
                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }
                
                .close-modal, .close-modal-inspection {
                    cursor: pointer;
                    font-size: 24px;
                }
                
                .form-group {
                    margin-bottom: 16px;
                }
                
                .form-group label {
                    display: block;
                    margin-bottom: 8px;
                    color: var(--text-secondary);
                }
                
                .form-group input {
                    width: 100%;
                }
                
                .form-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                    margin-top: 24px;
                }
                
                .btn-secondary {
                    background: transparent;
                    border: 1px solid var(--border-color);
                    color: var(--text-primary);
                }

                .btn-danger {
                    background-color: rgba(255, 69, 58, 0.1);
                    color: var(--accent-danger);
                    padding: 6px 12px;
                    font-size: 0.9rem;
                }
                .btn-danger:hover {
                    background-color: rgba(255, 69, 58, 0.2);
                }
                
                .btn-inspection {
                    background-color: rgba(255, 255, 255, 0.1);
                    color: var(--text-primary);
                    padding: 6px 12px;
                    font-size: 0.9rem;
                    margin-right: 8px;
                }
                .btn-inspection:hover {
                    background-color: rgba(255, 255, 255, 0.2);
                }

                /* Tabs */
                .tabs {
                    display: flex;
                    border-bottom: 1px solid var(--border-color);
                    margin-bottom: 20px;
                }
                .tab-btn {
                    padding: 10px 20px;
                    background: transparent;
                    border: none;
                    color: var(--text-secondary);
                    cursor: pointer;
                    font-size: 1rem;
                    border-bottom: 2px solid transparent;
                }
                .tab-btn.active {
                    color: var(--accent-primary);
                    border-bottom-color: var(--accent-primary);
                }
                .tab-content {
                    flex: 1;
                    overflow-y: auto;
                }
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 20px;
                    margin-bottom: 20px;
                }
                .stat-card {
                    background: rgba(255,255,255,0.05);
                    padding: 20px;
                    border-radius: 8px;
                    text-align: center;
                }
                .stat-value {
                    font-size: 2rem;
                    font-weight: bold;
                    color: var(--accent-primary);
                    margin: 10px 0 0 0;
                }
            `;
            document.head.appendChild(style);
        }
    }

    loadClients(filter = '') {
        const clients = store.getClients();
        const tbody = document.getElementById('clients-list');

        const filteredClients = clients.filter(client => {
            const searchTerm = filter.toLowerCase();
            const nameMatch = client.name.toLowerCase().includes(searchTerm);
            const phoneMatch = client.phone.includes(searchTerm);
            const vehicleMatch = client.vehicles && client.vehicles.some(v =>
                v.model.toLowerCase().includes(searchTerm) ||
                (v.plate && v.plate.toLowerCase().includes(searchTerm))
            );

            return nameMatch || phoneMatch || vehicleMatch;
        });

        if (filteredClients.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 20px; color: var(--text-muted);">Nenhum cliente encontrado.</td></tr>';
            return;
        }

        tbody.innerHTML = filteredClients.map(client => {
            const vehiclesCount = client.vehicles ? client.vehicles.length : 0;
            const primaryVehicle = vehiclesCount > 0 ? `${client.vehicles[0].model} (${client.vehicles[0].plate || '-'})` : '-';
            const vehicleDisplay = vehiclesCount > 1 ? `${primaryVehicle} <span style="font-size:0.8em; color:var(--text-muted);">+${vehiclesCount - 1}</span>` : primaryVehicle;

            return `
            <tr>
                <td>${client.name}</td>
                <td>${client.phone}</td>
                <td>${vehicleDisplay}</td>
                <td>${vehiclesCount > 0 ? client.vehicles[0].plate || '-' : '-'}</td>
                <td>
                    <button class="btn btn-secondary" style="margin-right:5px; padding:6px 12px; font-size:0.9rem;" onclick="window.editClient('${client.id}')">✏️ Editar</button>
                    <button class="btn btn-inspection" onclick="window.openClientDetails('${client.id}')">📂 Ficha</button>
                    <button class="btn btn-danger" onclick="window.deleteClient('${client.id}')">Remover</button>
                </td>
            </tr>
            `;
        }).join('');

        // Expose delete function globally
        window.deleteClient = (id) => {
            if (confirm('Tem a certeza que deseja remover este cliente?')) {
                store.deleteClient(id);
                this.loadClients(document.getElementById('client-search').value);
            }
        };

        // Expose edit function globally
        window.editClient = (id) => {
            const client = store.getClients().find(c => c.id === id);
            if (!client) return;

            document.getElementById('modal-client-title').textContent = 'Editar Cliente';
            document.getElementById('client-id').value = client.id;

            const form = document.getElementById('form-client');
            form.elements['name'].value = client.name;
            form.elements['phone'].value = client.phone;

            const container = document.getElementById('new-client-vehicles-container');
            container.innerHTML = '';

            if (client.vehicles && client.vehicles.length > 0) {
                client.vehicles.forEach(v => {
                    const div = document.createElement('div');
                    div.className = 'vehicle-entry';
                    div.style.cssText = 'display:flex; gap:10px; margin-bottom:10px;';
                    div.innerHTML = `
                        <input type="text" name="vehicle[]" value="${v.model}" placeholder="Marca/Modelo" required style="flex:2;">
                        <input type="text" name="plate[]" value="${v.plate || ''}" placeholder="Matrícula" style="flex:1;">
                        <button type="button" class="btn btn-danger" style="padding:0 10px;" onclick="this.parentElement.remove()">X</button>
                    `;
                    container.appendChild(div);
                });
            } else {
                // Add one empty if none (shouldn't happen usually)
                container.innerHTML = `
                    <div class="vehicle-entry" style="display:flex; gap:10px; margin-bottom:10px;">
                        <input type="text" name="vehicle[]" placeholder="Marca/Modelo" required style="flex:2;">
                        <input type="text" name="plate[]" placeholder="Matrícula" style="flex:1;">
                    </div>
                `;
            }

            document.getElementById('modal-client').classList.remove('hidden');
        };

        // Expose open details function
        window.openClientDetails = (clientId) => {
            this.currentClientId = clientId;
            const client = store.getClients().find(c => c.id === clientId);
            if (!client) return;

            document.getElementById('details-client-name').textContent = client.name;
            document.getElementById('modal-client-details').classList.remove('hidden');

            this.loadClientStats(clientId);
            this.loadClientVehicles(clientId);
            this.loadClientHistory(clientId);
            this.loadClientInspections(clientId);
        };
    }

    loadClientVehicles(clientId) {
        const client = store.getClients().find(c => c.id === clientId);
        const container = document.getElementById('details-vehicles-list');

        if (!client || !client.vehicles || client.vehicles.length === 0) {
            container.innerHTML = '<p>Sem veículos registados.</p>';
            return;
        }

        container.innerHTML = client.vehicles.map((v, index) => `
            <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.05); padding:10px; border-radius:6px; margin-bottom:8px;">
                <div>
                    <strong>${v.model}</strong>
                    <span style="margin-left:10px; color:var(--text-secondary); font-size:0.9em;">${v.plate || 'Sem Matrícula'}</span>
                </div>
                <button class="btn btn-danger" style="padding:4px 8px; font-size:0.8em;" onclick="window.removeClientVehicle('${clientId}', ${index})">Remover</button>
            </div>
        `).join('');

        window.removeClientVehicle = (cId, vIndex) => {
            if (confirm('Remover este veículo?')) {
                const c = store.getClients().find(cl => cl.id === cId);
                c.vehicles.splice(vIndex, 1);
                store.updateClient(c);
                this.loadClientVehicles(cId);
                this.loadClients(document.getElementById('client-search').value); // Refresh main list
            }
        };
    }

    loadClientStats(clientId) {
        const appointments = store.getAppointments().filter(a => a.clientId === clientId && (a.status === 'completed' || a.status === 'paid'));
        const services = store.getServices();

        // Total Washes
        document.getElementById('stat-total-washes').textContent = appointments.length;

        // Total Spent (Approximate based on current service prices if finalPrice not saved, ideally should use finalPrice)
        // Assuming finalPrice is stored in appointment or falling back to service price
        let totalSpent = 0;
        const serviceCounts = {};

        appointments.forEach(appt => {
            // Calculate Price
            let price = 0;
            if (appt.finalPrice !== undefined && appt.finalPrice !== null && appt.finalPrice !== '') {
                price = parseFloat(appt.finalPrice);
            } else {
                // Fallback to service prices
                if (appt.serviceIds && appt.serviceIds.length > 0) {
                    appt.serviceIds.forEach(id => {
                        const s = services.find(srv => srv.id === id);
                        if (s) price += parseFloat(s.price);
                    });
                } else if (appt.serviceId) {
                    const s = services.find(srv => srv.id === appt.serviceId);
                    if (s) price += parseFloat(s.price);
                }
            }
            totalSpent += price;

            // Count Services for Statistics
            if (appt.serviceIds && appt.serviceIds.length > 0) {
                appt.serviceIds.forEach(id => {
                    const s = services.find(srv => srv.id === id);
                    const name = s ? s.name : 'Serviço Removido';
                    serviceCounts[name] = (serviceCounts[name] || 0) + 1;
                });
            } else {
                const service = services.find(s => s.id === appt.serviceId);
                const serviceName = service ? service.name : (appt.serviceId ? 'Serviço Removido' : 'Desconhecido');
                // Only count if it was a real service
                if (appt.serviceId || service) {
                    serviceCounts[serviceName] = (serviceCounts[serviceName] || 0) + 1;
                }
            }
        });

        document.getElementById('stat-total-spent').textContent = totalSpent.toFixed(2) + '€';

        // Service Types List
        const servicesList = document.getElementById('stat-services-list');
        servicesList.innerHTML = Object.entries(serviceCounts)
            .map(([name, count]) => `
                <div style="display:flex; justify-content:space-between; padding:8px; border-bottom:1px solid var(--border-color);">
                    <span>${name}</span>
                    <span style="font-weight:bold;">${count}</span>
                </div>
            `).join('');
    }

    loadClientHistory(clientId) {
        const appointments = store.getAppointments().filter(a => a.clientId === clientId);
        const services = store.getServices();
        const tbody = document.getElementById('details-history-list');

        appointments.sort((a, b) => new Date(b.date) - new Date(a.date));

        tbody.innerHTML = appointments.map(appt => {
            let serviceName = 'Serviço Removido';

            if (appt.serviceIds && appt.serviceIds.length > 0) {
                serviceName = appt.serviceIds.map(id => {
                    const s = services.find(srv => srv.id === id);
                    return s ? s.name : 'Serviço Removido';
                }).join(', ');
            } else {
                const service = services.find(s => s.id === appt.serviceId);
                if (service) serviceName = service.name;
            }
            const date = new Date(appt.date).toLocaleDateString('pt-PT');

            let statusText = appt.status;
            let statusColor = 'var(--text-secondary)';
            let notes = appt.notes || '';

            if (appt.status === 'cancelled') {
                statusText = 'Cancelado';
                statusColor = 'var(--accent-danger)';
                notes = `<strong>Motivo:</strong> ${appt.cancellationReason || '-'} <br> 
                         <small>(${appt.isJustified ? 'Justificado' : 'Não Justificado'})</small>`;
            } else if (appt.status === 'completed' || appt.status === 'paid') {
                statusText = 'Concluído';
                statusColor = 'var(--accent-success)';
            } else {
                statusText = 'Agendado';
                statusColor = 'var(--accent-secondary)';
            }

            return `
                <tr>
                    <td>${date}</td>
                    <td>${serviceName}</td>
                    <td style="color:${statusColor}; font-weight:500;">${statusText}</td>
                    <td style="font-size:0.9em; color:var(--text-muted);">${notes}</td>
                </tr>
            `;
        }).join('');
    }

    loadClientInspections(clientId) {
        // Reuse existing logic but target the new container
        const inspections = store.getInspectionsByClientId(clientId);
        const container = document.getElementById('details-inspections-list');

        if (inspections.length === 0) {
            container.innerHTML = '<p style="color:var(--text-muted); font-size:0.9em; text-align:center; padding:20px;">Sem inspeções anteriores.</p>';
            return;
        }

        container.innerHTML = inspections.map(insp => {
            const date = new Date(insp.date).toLocaleDateString('pt-PT');
            const defects = Object.entries(insp.defects)
                .filter(([_, val]) => val)
                .map(([key, _]) => key.replace('defect_', ''))
                .join(', ');

            return `
                <div style="background:rgba(255,255,255,0.05); padding:15px; border-radius:6px; margin-bottom:15px;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                        <strong>${date}</strong>
                        <span style="font-size:0.8em; color:var(--text-muted);">${insp.photos.length} fotos</span>
                    </div>
                    <div style="font-size:0.9em; color:var(--text-secondary); margin-bottom:5px;"><strong>Defeitos:</strong> ${defects || 'Nenhum'}</div>
                    ${insp.notes ? `<div style="font-size:0.9em; color:var(--text-muted); margin-bottom:10px; font-style:italic;">"${insp.notes}"</div>` : ''}
                    <div style="display:flex; gap:10px; overflow-x:auto; padding-bottom:5px;">
                        ${insp.photos.map(p => `<img src="${p}" style="height:60px; border-radius:4px; cursor:pointer;" onclick="window.openPhotoPreview('${p}')">`).join('')}
                    </div>
                </div>
            `;
        }).join('');
    }

    // Kept for backward compatibility if needed, but logic moved to loadClientInspections
    loadInspectionHistory(clientId) {
        // This function is now redundant for the main flow but kept if called elsewhere
        this.loadClientInspections(clientId);
    }

    // Expose photo preview function


    attachEvents() {
        // Search Event
        const searchInput = document.getElementById('client-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.loadClients(e.target.value);
            });
        }

        // Photo Preview Logic
        window.openPhotoPreview = (src) => {
            const modal = document.getElementById('modal-photo-preview');
            const img = document.getElementById('preview-image');
            img.src = src;
            modal.classList.remove('hidden');
        };

        if (!window.photoPreviewEventsAttached) {
            const modal = document.getElementById('modal-photo-preview');
            const closeBtn = document.querySelector('.close-modal-photo');

            const closeModal = () => {
                modal.classList.add('hidden');
                document.getElementById('preview-image').src = '';
            };

            closeBtn.addEventListener('click', closeModal);
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeModal();
            });

            window.photoPreviewEventsAttached = true;
        }
        // Client Modal Events
        const modalClient = document.getElementById('modal-client');
        const btnAddClient = document.getElementById('btn-add-client');
        const btnCloseClient = document.querySelector('.close-modal');
        const btnCancelClient = document.querySelector('.close-modal-btn');
        const formClient = document.getElementById('form-client');

        const openClientModal = () => {
            document.getElementById('modal-client-title').textContent = 'Novo Cliente';
            document.getElementById('client-id').value = '';
            formClient.reset();
            document.getElementById('new-client-vehicles-container').innerHTML = `
                <div class="vehicle-entry" style="display:flex; gap:10px; margin-bottom:10px;">
                    <input type="text" name="vehicle[]" placeholder="Marca/Modelo" required style="flex:2;">
                    <input type="text" name="plate[]" placeholder="Matrícula" style="flex:1;">
                </div>
            `;
            modalClient.classList.remove('hidden');
        };
        const closeClientModal = () => modalClient.classList.add('hidden');

        const btnAddVehicleField = document.getElementById('btn-add-vehicle-field');

        btnAddVehicleField.addEventListener('click', () => {
            const container = document.getElementById('new-client-vehicles-container');
            const div = document.createElement('div');
            div.className = 'vehicle-entry';
            div.style.cssText = 'display:flex; gap:10px; margin-bottom:10px;';
            div.innerHTML = `
                <input type="text" name="vehicle[]" placeholder="Marca/Modelo" required style="flex:2;">
                <input type="text" name="plate[]" placeholder="Matrícula" style="flex:1;">
                <button type="button" class="btn btn-danger" style="padding:0 10px;" onclick="this.parentElement.remove()">X</button>
            `;
            container.appendChild(div);
        });

        btnAddClient.addEventListener('click', openClientModal);
        btnCloseClient.addEventListener('click', closeClientModal);
        btnCancelClient.addEventListener('click', closeClientModal);

        formClient.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(formClient);
            const id = formData.get('id');

            // Collect vehicles
            const vehicles = [];
            const models = formData.getAll('vehicle[]');
            const plates = formData.getAll('plate[]');

            for (let i = 0; i < models.length; i++) {
                if (models[i].trim()) {
                    vehicles.push({
                        model: models[i].trim(),
                        plate: plates[i] ? plates[i].trim() : ''
                    });
                }
            }

            const clientData = {
                name: formData.get('name'),
                phone: formData.get('phone'),
                vehicles: vehicles
            };

            if (id) {
                clientData.id = id;
                store.updateClient(clientData);
            } else {
                store.addClient(clientData);
            }

            formClient.reset();
            closeClientModal();
            this.loadClients(document.getElementById('client-search').value);
        });

        // Inspection Modal Events
        const modalInspection = document.getElementById('modal-inspection');
        const btnCloseInspection = document.querySelector('.close-modal-inspection');
        const btnCancelInspection = document.querySelector('.close-modal-inspection-btn');
        const formInspection = document.getElementById('form-inspection');
        const inputPhotos = document.getElementById('inspection-photos');

        const closeInspectionModal = () => modalInspection.classList.add('hidden');

        btnCloseInspection.addEventListener('click', closeInspectionModal);
        btnCancelInspection.addEventListener('click', closeInspectionModal);

        // Photo Handling
        this.currentPhotos = [];

        inputPhotos.addEventListener('change', async (e) => {
            const files = Array.from(e.target.files);

            for (const file of files) {
                try {
                    const resizedImage = await this.resizeImage(file);
                    this.currentPhotos.push(resizedImage);

                    // Preview
                    const img = document.createElement('img');
                    img.src = resizedImage;
                    img.style.height = '60px';
                    img.style.borderRadius = '4px';
                    img.style.border = '1px solid var(--border-color)';
                    document.getElementById('photos-preview').appendChild(img);
                } catch (err) {
                    console.error('Error resizing image:', err);
                }
            }
        });

        formInspection.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(formInspection);
            const clientId = document.getElementById('inspection-client-id').value;

            const inspection = {
                clientId: clientId,
                defects: {
                    defect_scratches: formData.get('defect_scratches') === 'on',
                    defect_dents: formData.get('defect_dents') === 'on',
                    defect_lights: formData.get('defect_lights') === 'on',
                    defect_glass: formData.get('defect_glass') === 'on',
                    defect_wheels: formData.get('defect_wheels') === 'on',
                    defect_interior: formData.get('defect_interior') === 'on',
                    defect_dashboard_lights: formData.get('defect_dashboard_lights') === 'on',
                },
                notes: formData.get('notes'),
                photos: this.currentPhotos
            };

            store.addInspection(inspection);
            closeInspectionModal();
            // Refresh details if open
            if (this.currentClientId === clientId) {
                this.loadClientInspections(clientId);
            }
            alert('Inspeção guardada com sucesso!');
        });

        // Client Details Modal Events
        const modalDetails = document.getElementById('modal-client-details');
        const btnCloseDetails = document.querySelector('.close-modal-details');
        const btnNewInspection = document.getElementById('btn-new-inspection');
        const tabs = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        const closeDetailsModal = () => modalDetails.classList.add('hidden');

        btnCloseDetails.addEventListener('click', closeDetailsModal);

        btnNewInspection.addEventListener('click', () => {
            // Open the inspection modal
            document.getElementById('inspection-client-id').value = this.currentClientId;
            document.getElementById('modal-inspection').classList.remove('hidden');
            this.currentPhotos = [];
            document.getElementById('photos-preview').innerHTML = '';
            document.getElementById('form-inspection').reset();
            document.getElementById('inspection-client-id').value = this.currentClientId;
        });

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active class from all
                tabs.forEach(t => t.classList.remove('active'));
                tabContents.forEach(c => c.style.display = 'none');

                // Add active to current
                tab.classList.add('active');
                document.getElementById(tab.dataset.tab).style.display = 'block';
            });
        });

        // Add Vehicle Form in Details
        const formAddVehicle = document.getElementById('form-add-vehicle-details');
        if (formAddVehicle) {
            formAddVehicle.addEventListener('submit', (e) => {
                e.preventDefault();
                const formData = new FormData(formAddVehicle);
                const client = store.getClients().find(c => c.id === this.currentClientId);

                if (client) {
                    if (!client.vehicles) client.vehicles = [];
                    client.vehicles.push({
                        model: formData.get('model'),
                        plate: formData.get('plate')
                    });
                    store.updateClient(client);
                    formAddVehicle.reset();
                    this.loadClientVehicles(this.currentClientId);
                    this.loadClients();
                }
            });
        }
    }

    resizeImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    // Max dimensions
                    const MAX_WIDTH = 800;
                    const MAX_HEIGHT = 800;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);

                    // Compress to JPEG 0.7
                    resolve(canvas.toDataURL('image/jpeg', 0.7));
                };
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
}
