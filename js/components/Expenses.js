class Expenses {
    constructor(container) {
        this.container = container;
        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div class="page-header">
                <h1>Despesas</h1>
                <button id="btn-add-expense" class="btn btn-primary">+ Nova Despesa</button>
            </div>
            
            <div class="card">
                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Descrição</th>
                                <th>Categoria</th>
                                <th>Valor</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody id="expenses-list">
                            <!-- Expenses will be loaded here -->
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="3" style="text-align:right; font-weight:bold;">Total:</td>
                                <td id="expenses-total" style="font-weight:bold; color:var(--accent-danger);">0.00 €</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            <!-- Modal for New Expense -->
            <div id="modal-expense" class="modal hidden">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Nova Despesa</h2>
                        <span class="close-modal">&times;</span>
                    </div>
                    <form id="form-expense">
                        <div class="form-group">
                            <label>Descrição</label>
                            <input type="text" name="description" required placeholder="Ex: Produtos de Limpeza">
                        </div>
                        <div class="form-group">
                            <label>Categoria</label>
                            <select name="category" required>
                                <option value="products">Produtos</option>
                                <option value="equipment">Equipamento</option>
                                <option value="utilities">Utilidades (Água/Luz)</option>
                                <option value="marketing">Marketing</option>
                                <option value="other">Outros</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Valor (€)</label>
                            <input type="number" name="amount" step="0.01" required placeholder="0.00">
                        </div>
                        <div class="form-group">
                            <label>Data</label>
                            <input type="date" name="date" required value="${new Date().toISOString().split('T')[0]}">
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary close-modal-btn">Cancelar</button>
                            <button type="submit" class="btn btn-primary">Salvar</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        this.loadExpenses();
        this.attachEvents();
    }

    loadExpenses() {
        const expenses = store.getExpenses();
        const tbody = document.getElementById('expenses-list');
        const totalEl = document.getElementById('expenses-total');

        if (expenses.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 20px; color: var(--text-muted);">Nenhuma despesa registada.</td></tr>';
            totalEl.textContent = '0.00 €';
            return;
        }

        // Sort by date (newest first)
        expenses.sort((a, b) => new Date(b.date) - new Date(a.date));

        let total = 0;

        tbody.innerHTML = expenses.map(expense => {
            const amount = parseFloat(expense.amount);
            total += amount;
            const date = new Date(expense.date).toLocaleDateString('pt-PT');

            return `
                <tr>
                    <td>${date}</td>
                    <td>${expense.description}</td>
                    <td><span style="text-transform:capitalize;">${this.translateCategory(expense.category)}</span></td>
                    <td style="color:var(--accent-danger); font-weight:500;">-${amount.toFixed(2)} €</td>
                    <td>
                        <button class="btn-icon btn-delete-expense" data-id="${expense.id}" style="color: var(--accent-danger); background: none; border: none; cursor: pointer;">
                            🗑️
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        totalEl.textContent = `-${total.toFixed(2)} €`;
    }

    translateCategory(cat) {
        const map = {
            'products': 'Produtos',
            'equipment': 'Equipamento',
            'utilities': 'Utilidades',
            'marketing': 'Marketing',
            'other': 'Outros'
        };
        return map[cat] || cat;
    }

    attachEvents() {
        const tbody = document.getElementById('expenses-list');
        tbody.addEventListener('click', (e) => {
            const btn = e.target.closest('.btn-delete-expense');
            if (btn) {
                const id = btn.dataset.id;
                if (confirm('Tem a certeza que deseja eliminar esta despesa?')) {
                    store.deleteExpense(id);
                    this.loadExpenses();
                }
            }
        });

        const modal = document.getElementById('modal-expense');
        const btnAdd = document.getElementById('btn-add-expense');
        const btnClose = document.querySelector('.close-modal');
        const btnCancel = document.querySelector('.close-modal-btn');
        const form = document.getElementById('form-expense');

        const openModal = () => modal.classList.remove('hidden');
        const closeModal = () => modal.classList.add('hidden');

        btnAdd.addEventListener('click', openModal);
        btnClose.addEventListener('click', closeModal);
        btnCancel.addEventListener('click', closeModal);

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const expense = {
                description: formData.get('description'),
                category: formData.get('category'),
                amount: formData.get('amount'),
                date: formData.get('date')
            };

            store.addExpense(expense);
            form.reset();
            closeModal();
            this.loadExpenses();
        });
    }
}
