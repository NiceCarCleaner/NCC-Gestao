class Services {
    constructor(container) {
        this.container = container;
        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div class="page-header">
                <h1>Serviços</h1>
                <button id="btn-add-service" class="btn btn-primary">+ Novo Serviço</button>
            </div>
            
            <div class="card">
                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Nome do Serviço</th>
                                <th>Descrição</th>
                                <th>Preço Estimado</th>
                                <th>Duração (min)</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody id="services-list">
                            <!-- Services will be loaded here -->
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Modal for New Service -->
            <div id="modal-service" class="modal hidden">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Novo Serviço</h2>
                        <span class="close-modal">&times;</span>
                    </div>
                    <form id="form-service">
                        <div class="form-group">
                            <label>Nome do Serviço</label>
                            <input type="text" name="name" required placeholder="Ex: Lavagem Completa">
                        </div>
                        <div class="form-group">
                            <label>Descrição</label>
                            <textarea name="description" rows="3" style="width:100%; background:var(--bg-input); border:1px solid var(--border-color); color:var(--text-primary); padding:10px; border-radius:6px;"></textarea>
                        </div>
                        <div class="form-group">
                            <label>Preço (€)</label>
                            <input type="number" name="price" step="0.01" required placeholder="0.00">
                        </div>
                        <div class="form-group">
                            <label>Duração Estimada (minutos)</label>
                            <input type="number" name="duration" required placeholder="60">
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary close-modal-btn">Cancelar</button>
                            <button type="submit" class="btn btn-primary">Salvar</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        this.loadServices();
        this.attachEvents();
    }

    loadServices() {
        const services = store.getServices();
        const tbody = document.getElementById('services-list');

        if (services.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 20px; color: var(--text-muted);">Nenhum serviço registado.</td></tr>';
            return;
        }

        tbody.innerHTML = services.map(service => `
            <tr>
                <td>${service.name}</td>
                <td>${service.description || '-'}</td>
                <td>${parseFloat(service.price).toFixed(2)} €</td>
                <td>${service.duration} min</td>
                <td>
                    <button class="btn btn-danger" onclick="window.deleteService('${service.id}')">Remover</button>
                </td>
            </tr>
        `).join('');

        window.deleteService = (id) => {
            if (confirm('Tem a certeza que deseja remover este serviço?')) {
                store.deleteService(id);
                this.loadServices();
            }
        };
    }

    attachEvents() {
        const modal = document.getElementById('modal-service');
        const btnAdd = document.getElementById('btn-add-service');
        const btnClose = document.querySelector('.close-modal');
        const btnCancel = document.querySelector('.close-modal-btn');
        const form = document.getElementById('form-service');

        const openModal = () => modal.classList.remove('hidden');
        const closeModal = () => modal.classList.add('hidden');

        btnAdd.addEventListener('click', openModal);
        btnClose.addEventListener('click', closeModal);
        btnCancel.addEventListener('click', closeModal);

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const service = {
                name: formData.get('name'),
                description: formData.get('description'),
                price: formData.get('price'),
                duration: formData.get('duration')
            };

            store.addService(service);
            form.reset();
            closeModal();
            this.loadServices();
        });
    }
}
