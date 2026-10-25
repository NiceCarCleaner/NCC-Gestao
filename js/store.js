class Store {
    constructor() {
        this.load();
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
            this.save();
        }

        // Ensure inspections array exists for old data
        if (!this.state.inspections) {
            this.state.inspections = [];
            this.save();
        }

        // MIGRATION: Convert single vehicle to array
        let migrationNeeded = false;
        this.state.clients = this.state.clients.map(c => {
            if (c.vehicle && !c.vehicles) {
                migrationNeeded = true;
                return {
                    ...c,
                    vehicles: [{ model: c.vehicle, plate: c.plate || '' }],
                    vehicle: undefined, // Remove old fields
                    plate: undefined
                };
            }
            return c;
        });

        this.state.appointments = this.state.appointments.map(a => {
            if (a.serviceId && !a.serviceIds) {
                migrationNeeded = true;
                return {
                    ...a,
                    serviceIds: [a.serviceId],
                    serviceId: undefined // Remove old field
                };
            }
            // Ensure serviceIds exists if it's a new empty appointment or legacy weirdness
            if (!a.serviceIds) {
                a.serviceIds = [];
            }
            return a;
        });

        if (migrationNeeded) {
            this.save();
            console.log('Migrated data structures (clients/vehicles and appointments/services).');
        }
    }

    save() {
        localStorage.setItem('niceCarCleanerData', JSON.stringify(this.state));
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
        this.save();
        return client;
    }

    updateClient(updatedClient) {
        const index = this.state.clients.findIndex(c => c.id === updatedClient.id);
        if (index !== -1) {
            this.state.clients[index] = { ...this.state.clients[index], ...updatedClient };
            this.save();
        }
    }

    deleteClient(id) {
        this.state.clients = this.state.clients.filter(c => c.id !== id);
        this.save();
    }

    // Services
    getServices() {
        // Return services sorted alphabetically by name
        return [...this.state.services].sort((a, b) => a.name.localeCompare(b.name));
    }

    addService(service) {
        service.id = Date.now().toString();
        this.state.services.push(service);
        this.save();
        return service;
    }

    deleteService(id) {
        this.state.services = this.state.services.filter(s => s.id !== id);
        this.save();
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
        this.save();
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
            this.save();
        }
    }

    // Update an existing appointment (used for editing)
    updateAppointment(updated) {
        const index = this.state.appointments.findIndex(a => a.id === updated.id);
        if (index !== -1) {
            // Preserve immutable fields if not provided
            const existing = this.state.appointments[index];
            this.state.appointments[index] = { ...existing, ...updated };
            this.save();
        }
    }

    cancelAppointment(id, reason, isJustified) {
        const index = this.state.appointments.findIndex(a => a.id === id);
        if (index !== -1) {
            this.state.appointments[index].status = 'cancelled';
            this.state.appointments[index].cancellationReason = reason;
            this.state.appointments[index].isJustified = isJustified;
            this.save();
        }
    }

    deleteAppointment(id) {
        this.state.appointments = this.state.appointments.filter(a => a.id !== id);
        this.save();
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
        this.save();
        return expense;
    }

    deleteExpense(id) {
        this.state.expenses = this.state.expenses.filter(e => e.id !== id);
        this.save();
    }

    // Products
    getProducts() {
        return this.state.products;
    }

    addProduct(product) {
        product.id = Date.now().toString();
        this.state.products.push(product);
        this.save();
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
        this.save();
        return inspection;
    }

    deleteInspection(id) {
        this.state.inspections = this.state.inspections.filter(i => i.id !== id);
        this.save();
    }
}

// Global instance
const store = new Store();
