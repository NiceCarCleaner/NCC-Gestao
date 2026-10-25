class Sidebar {
    constructor(container, navigateCallback) {
        this.container = container;
        this.navigate = navigateCallback;
        this.activeItem = 'dashboard';
        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div class="sidebar-container">
                <div class="sidebar-header" style="text-align:center;">
                    <img src="assets/bg_watermark.png" alt="NiceCarCleaner" style="max-width: 150px; height: auto;">
                </div>
                <ul class="nav-links">
                    <li data-page="dashboard" class="${this.activeItem === 'dashboard' ? 'active' : ''}">
                        <span>📊</span> Dashboard
                    </li>
                    <li data-page="billing" class="${this.activeItem === 'billing' ? 'active' : ''}">
                        <span>💶</span> Faturação
                    </li>
                    <li data-page="schedule" class="${this.activeItem === 'schedule' ? 'active' : ''}">
                        <span>📅</span> Agenda
                    </li>
                    <li data-page="clients" class="${this.activeItem === 'clients' ? 'active' : ''}">
                        <span>👥</span> Clientes
                    </li>
                    <li data-page="services" class="${this.activeItem === 'services' ? 'active' : ''}">
                        <span>🔧</span> Serviços
                    </li>
                    <li data-page="expenses" class="${this.activeItem === 'expenses' ? 'active' : ''}">
                        <span>💰</span> Despesas
                    </li>
                    <li data-page="products" class="${this.activeItem === 'products' ? 'active' : ''}">
                        <span>⚖️</span> Comparador
                    </li>
                    <li data-page="data" class="${this.activeItem === 'data' ? 'active' : ''}">
                        <span>💾</span> Dados & Relatórios
                    </li>
                </ul>
            </div>
        `;

        this.addStyles();
        this.attachEvents();
    }

    addStyles() {
        if (!document.getElementById('sidebar-styles')) {
            const style = document.createElement('style');
            style.id = 'sidebar-styles';
            style.textContent = `
                .sidebar-container {
                    width: 260px;
                    height: 100%;
                    background-color: var(--bg-sidebar);
                    border-right: 1px solid var(--border-color);
                    display: flex;
                    flex-direction: column;
                }
                .sidebar-header {
                    padding: 24px;
                    border-bottom: 1px solid var(--border-color);
                }
                .sidebar-header h2 {
                    font-size: 1.2rem;
                    background: linear-gradient(45deg, var(--accent-primary), var(--accent-secondary));
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .nav-links {
                    list-style: none;
                    padding: 16px;
                    margin: 0;
                }
                .nav-links li {
                    padding: 12px 16px;
                    margin-bottom: 4px;
                    border-radius: 8px;
                    cursor: pointer;
                    color: var(--text-secondary);
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    transition: all 0.2s;
                }
                .nav-links li:hover {
                    background-color: rgba(255, 255, 255, 0.05);
                    color: var(--text-primary);
                }
                .nav-links li.active {
                    background-color: rgba(0, 122, 255, 0.1);
                    color: var(--accent-primary);
                    font-weight: 500;
                }
            `;
            document.head.appendChild(style);
        }
    }

    attachEvents() {
        const links = this.container.querySelectorAll('.nav-links li');
        links.forEach(link => {
            link.addEventListener('click', () => {
                const page = link.dataset.page;
                this.activeItem = page;
                this.navigate(page);
                this.render(); // Re-render to update active state
            });
        });
    }
}
