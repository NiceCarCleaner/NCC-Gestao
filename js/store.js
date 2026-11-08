const FIREBASE_CONFIG = {
    apiKey: "AIzaSyAk5tceK_KGpIniIBmdxtkPnApmcBCMk3s",
    authDomain: "nicecarcleaner-gestao.firebaseapp.com",
    projectId: "nicecarcleaner-gestao",
    storageBucket: "nicecarcleaner-gestao.firebasestorage.app",
    messagingSenderId: "1026184905550",
    appId: "1:1026184905550:web:83bd2bfb8d38fa8844941f"
};

const SYNC_COLLECTIONS = ['clients', 'services', 'appointments', 'expenses', 'products', 'inspections'];

class Store {
    constructor() {
        this.listeners = [];
        this.statusListeners = [];
        this.syncStatus = 'connecting';
        this.db = null;
        this.isApplyingRemote = false;
        this.load();
        this.initCloudSync();
    }

    onDataChanged(callback) {
        this.listeners.push(callback);
    }

    notifyListeners() {
        this.listeners.forEach(cb => {
            try { cb(); } catch (e) { console.error(e); }
        });
    }

    onSyncStatusChanged(callback) {
        this.statusListeners.push(callback);
        callback(this.syncStatus);
    }

    setSyncStatus(status) {
        this.syncStatus = status;
        this.statusListeners.forEach(cb => {
            try { cb(status); } catch (e) { console.error(e); }
        });
    }

    hasLocalData() {
        if (!this.state) return false;
        return SYNC_COLLECTIONS.some(key => Array.isArray(this.state[key]) && this.state[key].length > 0);
    }

    initCloudSync() {
        if (typeof firebase === 'undefined') {
            console.warn('Firebase SDK não disponível. A funcionar em modo local.');
            this.setSyncStatus('offline');
            return;
        }

        try {
            if (!firebase.apps.length) {
                firebase.initializeApp(FIREBASE_CONFIG);
            }
            this.db = firebase.firestore();

            this.db.collection('ncc_data').onSnapshot((snapshot) => {
                if (snapshot.empty) {
                    if (this.hasLocalData()) {
                        this.saveAllToCloud();
                    } else {
                        this.setSyncStatus('synced');
                    }
                    return;
                }

                let changed = false;
                this.isApplyingRemote = true;

                snapshot.docs.forEach(doc => {
                    const section = doc.id;
                    if (SYNC_COLLECTIONS.includes(section)) {
                        const data = doc.data();
                        if (data && Array.isArray(data.items)) {
                            const currentJson = JSON.stringify(this.state[section] || []);
                            const incomingJson = JSON.stringify(data.items);
                            if (currentJson !== incomingJson) {
                                this.state[section] = data.items;
                                changed = true;
                            }
                        }
                    }
                });

                if (changed) {
                    this.runMigrations(false);
                    localStorage.setItem('niceCarCleanerData', JSON.stringify(this.state));
                    this.notifyListeners();
                }

                this.isApplyingRemote = false;
                this.setSyncStatus('synced');
            }, (error) => {
                console.error('Erro na sincronização com Firebase:', error);
                this.setSyncStatus('offline');
            });
        } catch (err) {
            console.error('Falha ao inicializar Firebase:', err);
            this.setSyncStatus('offline');
        }
    }

    async syncSectionToCloud(section) {
        if (!this.db || !SYNC_COLLECTIONS.includes(section)) return;
        this.setSyncStatus('syncing');
        try {
            const cleanItems = JSON.parse(JSON.stringify(this.state[section] || []));
            await this.db.collection('ncc_data').doc(section).set({
                items: cleanItems,
                updatedAt: Date.now()
            });
            this.setSyncStatus('synced');
        } catch (err) {
            console.error(`Erro ao guardar secção ${section} na nuvem:`, err);
            this.setSyncStatus('offline');
        }
    }

    async saveAllToCloud() {
        if (!this.db) return;
        this.setSyncStatus('syncing');
        try {
            const promises = SYNC_COLLECTIONS.map(section => {
                const cleanItems = JSON.parse(JSON.stringify(this.state[section] || []));
                return this.db.collection('ncc_data').doc(section).set({
                    items: cleanItems,
                    updatedAt: Date.now()
                });
            });
            await Promise.all(promises);
            this.setSyncStatus('synced');
        } catch (err) {
            console.error('Erro ao sincronizar todos os dados para a nuvem:', err);
            this.setSyncStatus('offline');
        }
    }

    load() {
        const data = localStorage.getItem('niceCarCleanerData');
        if (data) {
            this.state = JSON.parse(data);
        } else {
            this.state = {
                clients: [],
                services: [],
                appointments: [],
                expenses: [],
                products: [],
                inspections: []
            };
            localStorage.setItem('niceCarCleanerData', JSON.stringify(this.state));
        }

        // Ensure all collections exist
        SYNC_COLLECTIONS.forEach(key => {
            if (!Array.isArray(this.state[key])) {
                this.state[key] = [];
            }
        });

        this.runMigrations(true);
    }

    runMigrations(persist = true) {
        let migrationNeeded = false;
        this.state.clients = (this.state.clients || []).map(c => {
            if (c.vehicle && !c.vehicles) {
                migrationNeeded = true;
                const migrated = {
                    ...c,
                    vehicles: [{ model: c.vehicle, plate: c.plate || '' }]
                };
                delete migrated.vehicle;
                delete migrated.plate;
                return migrated;
            }
            return c;
        });

        this.state.appointments = (this.state.appointments || []).map(a => {
            if (a.serviceId && !a.serviceIds) {
                migrationNeeded = true;
                const migrated = {
                    ...a,
                    serviceIds: [a.serviceId]
                };
                delete migrated.serviceId;
                return migrated;
            }
            if (!a.serviceIds) {
                a.serviceIds = [];
            }
            return a;
        });

        if (migrationNeeded && persist) {
            localStorage.setItem('niceCarCleanerData', JSON.stringify(this.state));
            console.log('Migrated data structures (clients/vehicles and appointments/services).');
        }
    }

    save(section = null) {
        localStorage.setItem('niceCarCleanerData', JSON.stringify(this.state));
        if (!this.isApplyingRemote) {
            if (section) {
                this.syncSectionToCloud(section);
            } else {
                this.saveAllToCloud();
            }
        }
    }

    // Clients
    getClients() {
        return [...this.state.clients].sort((a, b) => a.name.localeCompare(b.name));
    }

    addClient(client) {
        client.id = Date.now().toString();
        client.createdAt = new Date().toISOString();
        // Ensure vehicles is an array
        if (!client.vehicles) client.vehicles = [];

        this.state.clients.push(client);
        this.save('clients');
        return client;
    }

    updateClient(updatedClient) {
        const index = this.state.clients.findIndex(c => c.id === updatedClient.id);
        if (index !== -1) {
            this.state.clients[index] = { ...this.state.clients[index], ...updatedClient };
            this.save('clients');
        }
    }

    deleteClient(id) {
        this.state.clients = this.state.clients.filter(c => c.id !== id);
        this.save('clients');
    }

    // Services
    getServices() {
        // Return services sorted alphabetically by name
        return [...this.state.services].sort((a, b) => a.name.localeCompare(b.name));
    }

    addService(service) {
        service.id = Date.now().toString();
        this.state.services.push(service);
        this.save('services');
        return service;
    }

    deleteService(id) {
        this.state.services = this.state.services.filter(s => s.id !== id);
        this.save('services');
    }

    // Appointments
    getAppointments() {
        return this.state.appointments;
    }

    addAppointment(appointment) {
        appointment.id = Date.now().toString();
        // Status: 'scheduled', 'completed', 'paid'
        if (!appointment.status) appointment.status = 'scheduled';
        this.state.appointments.push(appointment);
        this.save('appointments');
        return appointment;
    }

    updateAppointmentStatus(id, status, finalPrice = null, paymentMethod = null) {
        const index = this.state.appointments.findIndex(a => a.id === id);
        if (index !== -1) {
            this.state.appointments[index].status = status;
            if (finalPrice !== null) {
                this.state.appointments[index].finalPrice = finalPrice;
            }
            if (paymentMethod !== null) {
                this.state.appointments[index].paymentMethod = paymentMethod;
            }
            this.save('appointments');
        }
    }

    // Update an existing appointment (used for editing)
    updateAppointment(updated) {
        const index = this.state.appointments.findIndex(a => a.id === updated.id);
        if (index !== -1) {
            // Preserve immutable fields if not provided
            const existing = this.state.appointments[index];
            this.state.appointments[index] = { ...existing, ...updated };
            this.save('appointments');
        }
    }

    cancelAppointment(id, reason, isJustified) {
        const index = this.state.appointments.findIndex(a => a.id === id);
        if (index !== -1) {
            this.state.appointments[index].status = 'cancelled';
            this.state.appointments[index].cancellationReason = reason;
            this.state.appointments[index].isJustified = isJustified;
            this.save('appointments');
        }
    }

    deleteAppointment(id) {
        this.state.appointments = this.state.appointments.filter(a => a.id !== id);
        this.save('appointments');
    }

    // Expenses
    getExpenses() {
        return this.state.expenses;
    }

    addExpense(expense) {
        expense.id = Date.now().toString();
        if (!expense.date) {
            expense.date = new Date().toISOString();
        }
        this.state.expenses.push(expense);
        this.save('expenses');
        return expense;
    }

    deleteExpense(id) {
        this.state.expenses = this.state.expenses.filter(e => e.id !== id);
        this.save('expenses');
    }

    // Products
    getProducts() {
        return this.state.products;
    }

    addProduct(product) {
        product.id = Date.now().toString();
        this.state.products.push(product);
        this.save('products');
        return product;
    }

    // Inspections
    getInspections() {
        return this.state.inspections;
    }

    getInspectionsByClientId(clientId) {
        return this.state.inspections.filter(i => i.clientId === clientId);
    }

    addInspection(inspection) {
        inspection.id = Date.now().toString();
        inspection.date = new Date().toISOString();
        this.state.inspections.push(inspection);
        this.save('inspections');
        return inspection;
    }

    deleteInspection(id) {
        this.state.inspections = this.state.inspections.filter(i => i.id !== id);
        this.save('inspections');
    }
}

// Global instance
const store = new Store();
