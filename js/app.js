class App {
    constructor() {
        this.appElement = document.getElementById('app');
        this.currentPage = 'dashboard';
        this.init();
    }

    init() {
        this.renderLayout();
        this.navigateTo('dashboard');
    }

    renderLayout() {
        this.appElement.innerHTML = `
            <div class="app-layout">
                <nav id="sidebar"></nav>
                <main id="main-content" class="main-content"></main>
            </div>
        `;

        // Initialize Sidebar
        // Assuming Sidebar is globally available now
        new Sidebar(document.getElementById('sidebar'), (page) => this.navigateTo(page));
    }

    navigateTo(page) {
        this.currentPage = page;
        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = ''; // Clear current content

        switch (page) {
            case 'dashboard':
                new Dashboard(mainContent);
                break;
            case 'clients':
                new Clients(mainContent);
                break;
            case 'services':
                new Services(mainContent);
                break;
            case 'schedule':
                new Schedule(mainContent);
                break;
            case 'expenses':
                new Expenses(mainContent);
                break;
            case 'billing':
                new Billing(mainContent);
                break;
            case 'products':
                new Products(mainContent);
                break;
            case 'data':
                new DataView(mainContent);
                break;
            default:
                new Dashboard(mainContent);
        }
    }
}

// Initialize App when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new App();
});
