class Sidebar {
    constructor(container, navigateCallback) {
        this.container = container;
        this.navigate = navigateCallback;
        this.activeItem = 'dashboard';
        this.isCollapsed = localStorage.getItem('nccSidebarCollapsed') === 'true';
        this.syncStatus = store.syncStatus || 'connecting';
        this.render();

        store.onSyncStatusChanged((status) => {
            this.syncStatus = status;
            this.updateSyncBadge();
        });
    }

    getSyncBadgeInfo() {
        switch (this.syncStatus) {
            case 'synced':
                return { icon: '☁️', text: 'Sincronizado', color: '#34c759' };
            case 'syncing':
            case 'connecting':
                return { icon: '🔄', text: 'A sincronizar...', color: '#ff9f0a' };
            default:
                return { icon: '📴', text: 'Modo Local', color: '#8e8e93' };
        }
    }

    updateSyncBadge() {
        const badge = this.container.querySelector('#cloud-sync-badge');
        if (!badge) return;
        const info = this.getSyncBadgeInfo();
        badge.innerHTML = `<span class="sync-dot" style="background:${info.color};"></span> <span class="sync-text">${info.icon} ${info.text}</span>`;
    }

    render() {
        const info = this.getSyncBadgeInfo();
        this.container.innerHTML = `
            <div class="sidebar-container ${this.isCollapsed ? 'collapsed' : ''}">
                <div class="sidebar-header">
                    <div class="sidebar-brand">
                        <img src="assets/bg_watermark.png" alt="NiceCarCleaner" class="sidebar-logo">
                        <div id="cloud-sync-badge" class="cloud-sync-badge" title="${info.text}">
                            <span class="sync-dot" style="background:${info.color};"></span>
                            <span class="sync-text">${info.icon} ${info.text}</span>
                        </div>
                    </div>
                    <button type="button" id="btn-toggle-sidebar" class="btn-toggle-sidebar" title="Recolher / Expandir Menu">
                        ${this.isCollapsed ? '▶' : '◀'}
                    </button>
                </div>
                <ul class="nav-links">
                    <li data-page="dashboard" class="${this.activeItem === 'dashboard' ? 'active' : ''}" title="Dashboard">
                        <span class="nav-icon">📊</span> <span class="nav-label">Dashboard</span>
                    </li>
                    <li data-page="billing" class="${this.activeItem === 'billing' ? 'active' : ''}" title="Faturação">
                        <span class="nav-icon">💶</span> <span class="nav-label">Faturação</span>
                    </li>
                    <li data-page="schedule" class="${this.activeItem === 'schedule' ? 'active' : ''}" title="Agenda">
                        <span class="nav-icon">📅</span> <span class="nav-label">Agenda</span>
                    </li>
                    <li data-page="clients" class="${this.activeItem === 'clients' ? 'active' : ''}" title="Clientes">
                        <span class="nav-icon">👥</span> <span class="nav-label">Clientes</span>
                    </li>
                    <li data-page="services" class="${this.activeItem === 'services' ? 'active' : ''}" title="Serviços">
                        <span class="nav-icon">🔧</span> <span class="nav-label">Serviços</span>
                    </li>
                    <li data-page="expenses" class="${this.activeItem === 'expenses' ? 'active' : ''}" title="Despesas">
                        <span class="nav-icon">💰</span> <span class="nav-label">Despesas</span>
                    </li>
                    <li data-page="products" class="${this.activeItem === 'products' ? 'active' : ''}" title="Comparador">
                        <span class="nav-icon">⚖️</span> <span class="nav-label">Comparador</span>
                    </li>
                    <li data-page="data" class="${this.activeItem === 'data' ? 'active' : ''}" title="Dados & Relatórios">
                        <span class="nav-icon">💾</span> <span class="nav-label">Dados & Relatórios</span>
                    </li>
                </ul>
            </div>
        `;

        this.addStyles();
        this.attachEvents();
    }

    addStyles() {
        let style = document.getElementById('sidebar-styles');
        if (!style) {
            style = document.createElement('style');
            style.id = 'sidebar-styles';
            document.head.appendChild(style);
        }
        style.textContent = `
            #sidebar {
                flex-shrink: 0;
                z-index: 200;
            }
            .sidebar-container {
                width: 245px;
                height: 100%;
                background-color: var(--bg-sidebar);
                border-right: 1px solid var(--border-color);
                display: flex;
                flex-direction: column;
                transition: width 0.22s ease;
            }
            .sidebar-container.collapsed {
                width: 74px;
            }
            .sidebar-header {
                padding: 18px 14px;
                border-bottom: 1px solid var(--border-color);
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 8px;
            }
            .sidebar-brand {
                display: flex;
                flex-direction: column;
                align-items: center;
                flex: 1;
                min-width: 0;
            }
            .sidebar-logo {
                max-width: 140px;
                height: auto;
                transition: max-width 0.2s ease;
            }
            .sidebar-container.collapsed .sidebar-logo {
                max-width: 40px;
            }
            .sidebar-container.collapsed .sync-text,
            .sidebar-container.collapsed .nav-label {
                display: none;
            }
            .sidebar-container.collapsed .sidebar-header {
                flex-direction: column;
                padding: 12px 6px;
            }
            .btn-toggle-sidebar {
                background: rgba(255, 255, 255, 0.06);
                color: var(--text-secondary);
                border: 1px solid var(--border-color);
                border-radius: 6px;
                width: 28px;
                height: 28px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.75rem;
                flex-shrink: 0;
            }
            .btn-toggle-sidebar:hover {
                background: rgba(255, 255, 255, 0.14);
                color: var(--text-primary);
            }
            .cloud-sync-badge {
                margin-top: 8px;
                font-size: 0.74rem;
                color: var(--text-secondary);
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 4px 10px;
                border-radius: 999px;
                background: rgba(255, 255, 255, 0.05);
                white-space: nowrap;
            }
            .sync-dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                display: inline-block;
                flex-shrink: 0;
            }
            .nav-links {
                list-style: none;
                padding: 12px;
                margin: 0;
                overflow-y: auto;
                flex: 1;
            }
            .nav-links li {
                padding: 12px 14px;
                margin-bottom: 4px;
                border-radius: 8px;
                cursor: pointer;
                color: var(--text-secondary);
                display: flex;
                align-items: center;
                gap: 12px;
                transition: all 0.2s;
                white-space: nowrap;
                user-select: none;
            }
            .sidebar-container.collapsed .nav-links li {
                justify-content: center;
                padding: 12px 8px;
            }
            .nav-icon {
                font-size: 1.15rem;
                flex-shrink: 0;
            }
            .nav-links li:hover {
                background-color: rgba(255, 255, 255, 0.06);
                color: var(--text-primary);
            }
            .nav-links li.active {
                background-color: rgba(255, 59, 48, 0.15);
                color: var(--accent-primary);
                font-weight: 600;
            }

            /* Tablet Portrait & Mobile (<= 900px): Top header + horizontal touch nav */
            @media (max-width: 900px) {
                .sidebar-container,
                .sidebar-container.collapsed {
                    width: 100%;
                    height: auto;
                    border-right: none;
                    border-bottom: 1px solid var(--border-color);
                    flex-direction: column;
                }
                .sidebar-header {
                    padding: 8px 14px !important;
                    flex-direction: row !important;
                    justify-content: space-between;
                }
                .sidebar-brand {
                    flex-direction: row;
                    justify-content: space-between;
                    width: 100%;
                    gap: 10px;
                }
                .sidebar-logo,
                .sidebar-container.collapsed .sidebar-logo {
                    max-width: 95px;
                }
                .cloud-sync-badge {
                    margin-top: 0;
                }
                .sidebar-container.collapsed .sync-text,
                .sidebar-container.collapsed .nav-label {
                    display: inline;
                }
                .btn-toggle-sidebar {
                    display: none;
                }
                .nav-links {
                    display: flex;
                    flex-direction: row;
                    overflow-x: auto;
                    overflow-y: hidden;
                    -webkit-overflow-scrolling: touch;
                    padding: 6px 10px;
                    gap: 6px;
                    scrollbar-width: none;
                }
                .nav-links::-webkit-scrollbar {
                    display: none;
                }
                .nav-links li,
                .sidebar-container.collapsed .nav-links li {
                    margin-bottom: 0;
                    padding: 8px 12px;
                    font-size: 0.86rem;
                    gap: 6px;
                    flex-shrink: 0;
                    border: 1px solid rgba(255,255,255,0.05);
                }
            }
        `;
    }

    attachEvents() {
        const toggleBtn = this.container.querySelector('#btn-toggle-sidebar');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                this.isCollapsed = !this.isCollapsed;
                localStorage.setItem('nccSidebarCollapsed', String(this.isCollapsed));
                this.render();
            });
        }

        const links = this.container.querySelectorAll('.nav-links li');
        links.forEach(link => {
            link.addEventListener('click', () => {
                const page = link.dataset.page;
                this.activeItem = page;
                this.navigate(page);
                this.render();
            });
        });
    }
}
