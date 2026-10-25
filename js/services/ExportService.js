class ExportService {
    static exportToExcel() {
        const wb = XLSX.utils.book_new();

        // 1. Financial Summary
        const appointments = store.getAppointments();
        const expenses = store.getExpenses();
        const services = store.getServices();
        const clients = store.getClients();

        const financialData = appointments
            .filter(a => a.status === 'paid')
            .map(a => {
                const client = clients.find(c => c.id === a.clientId);
                const service = services.find(s => s.id === a.serviceId);
                return {
                    Data: new Date(a.date).toLocaleDateString(),
                    Cliente: client ? client.name : 'N/A',
                    Serviço: service ? service.name : 'N/A',
                    Valor: a.finalPrice ? parseFloat(a.finalPrice) : (service ? parseFloat(service.price) : 0)
                };
            });

        const wsFinance = XLSX.utils.json_to_sheet(financialData);
        XLSX.utils.book_append_sheet(wb, wsFinance, "Faturação");

        // 2. Expenses
        const expenseData = expenses.map(e => ({
            Data: new Date(e.date).toLocaleDateString(),
            Categoria: e.category,
            Descrição: e.description,
            Valor: parseFloat(e.amount)
        }));
        const wsExpenses = XLSX.utils.json_to_sheet(expenseData);
        XLSX.utils.book_append_sheet(wb, wsExpenses, "Despesas");

        // 3. Clients
        const clientData = clients.map(c => ({
            Nome: c.name,
            Telefone: c.phone,
            Veículo: c.vehicle,
            Matrícula: c.plate || ''
        }));
        const wsClients = XLSX.utils.json_to_sheet(clientData);
        XLSX.utils.book_append_sheet(wb, wsClients, "Clientes");

        // Save File
        XLSX.writeFile(wb, `NiceCarCleaner_Relatorio_${new Date().toISOString().slice(0, 10)}.xlsx`);
    }

    static backupData() {
        const data = localStorage.getItem('niceCarCleanerData');
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `NiceCarCleaner_Backup_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    static async restoreData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    // Basic validation
                    if (data.clients && data.services && data.appointments) {
                        localStorage.setItem('niceCarCleanerData', JSON.stringify(data));
                        // Reload store
                        store.load();
                        resolve(true);
                    } else {
                        reject('Ficheiro de backup inválido.');
                    }
                } catch (err) {
                    reject('Erro ao ler ficheiro.');
                }
            };
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }
}
