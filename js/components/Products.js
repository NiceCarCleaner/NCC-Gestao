class Products {
    constructor(container) {
        this.container = container;
        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div class="page-header">
                <h1>Comparador de Produtos</h1>
                <button id="btn-add-product" class="btn btn-primary">+ Adicionar Produto</button>
            </div>
            
            <div class="products-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
                <div class="card">
                    <h3>Inventário / Comparação</h3>
                    <div class="table-responsive" style="margin-top:16px;">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Produto</th>
                                    <th>Preço</th>
                                    <th>Quantidade (L/Kg)</th>
                                    <th>Custo por Unidade</th>
                                    <th>Diluição</th>
                                </tr>
                            </thead>
                            <tbody id="products-list">
                                <!-- Products will be loaded here -->
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="card">
                    <h3>Calculadora de Custo/Benefício</h3>
                    <div style="padding: 16px; color: var(--text-secondary);">
                        <p>Selecione dois produtos da lista para comparar o custo real por aplicação.</p>
                        <div id="comparison-result" style="margin-top: 24px;">
                            <!-- Comparison results will appear here -->
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modal for New Product -->
            <div id="modal-product" class="modal hidden">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Novo Produto</h2>
                        <span class="close-modal">&times;</span>
                    </div>
                    <form id="form-product">
                        <div class="form-group">
                            <label>Nome do Produto</label>
                            <input type="text" name="name" required placeholder="Ex: Champô X">
                        </div>
                        <div class="form-group">
                            <label>Preço de Compra (€)</label>
                            <input type="number" name="price" step="0.01" required>
                        </div>
                        <div class="form-group">
                            <label>Quantidade Embalagem (Litros/Kg)</label>
                            <input type="number" name="quantity" step="0.01" required>
                        </div>
                        <div class="form-group">
                            <label>Diluição (1 parte produto para X partes água)</label>
                            <input type="number" name="dilution" placeholder="Ex: 10 (para 1:10)" required>
                            <small style="color:var(--text-muted); display:block; margin-top:4px;">Coloque 0 se for pronto a usar.</small>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary close-modal-btn">Cancelar</button>
                            <button type="submit" class="btn btn-primary">Salvar</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        this.loadProducts();
        this.attachEvents();
    }

    loadProducts() {
        const products = store.getProducts();
        const tbody = document.getElementById('products-list');

        if (products.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 20px; color: var(--text-muted);">Nenhum produto registado.</td></tr>';
            return;
        }

        tbody.innerHTML = products.map(product => {
            const price = parseFloat(product.price);
            const qty = parseFloat(product.quantity);
            const costPerUnit = price / qty;
            const dilution = parseFloat(product.dilution) || 0;

            // Calculate cost per liter of ready-to-use solution
            // If dilution is 1:10, total volume is 11 parts. 1 part product.
            // But usually detailers think: 1L product makes (1+Dilution)L solution.
            // Cost of 1L solution = Cost of 1L product / (1 + Dilution)
            const costPerReadyLiter = costPerUnit / (1 + dilution);

            return `
                <tr class="product-row" data-id="${product.id}" style="cursor:pointer;" title="Clique para comparar">
                    <td>${product.name}</td>
                    <td>${price.toFixed(2)} €</td>
                    <td>${qty}</td>
                    <td>
                        <div>${costPerUnit.toFixed(2)} €/L (Conc.)</div>
                        <div style="font-size:0.85em; color:var(--accent-success); font-weight:bold;">${costPerReadyLiter.toFixed(3)} €/L (Uso)</div>
                    </td>
                    <td>1:${dilution}</td>
                </tr>
            `;
        }).join('');
    }

    attachEvents() {
        const modal = document.getElementById('modal-product');
        const btnAdd = document.getElementById('btn-add-product');
        const btnClose = document.querySelector('.close-modal');
        const btnCancel = document.querySelector('.close-modal-btn');
        const form = document.getElementById('form-product');

        const openModal = () => modal.classList.remove('hidden');
        const closeModal = () => modal.classList.add('hidden');

        btnAdd.addEventListener('click', openModal);
        btnClose.addEventListener('click', closeModal);
        btnCancel.addEventListener('click', closeModal);

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const product = {
                name: formData.get('name'),
                price: formData.get('price'),
                quantity: formData.get('quantity'),
                dilution: formData.get('dilution')
            };

            store.addProduct(product);
            form.reset();
            closeModal();
            this.loadProducts();
        });
    }
}
