class DataView {
    constructor(container) {
        this.container = container;
        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div class="page-header">
                <h1>Dados & Relatórios</h1>
            </div>

            <div class="dashboard-grid" style="grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));">
                <!-- Excel Export Card -->
                <div class="card">
                    <h2 style="margin-bottom:15px;">📊 Relatórios Excel</h2>
                    <p style="color:var(--text-secondary); margin-bottom:20px;">
                        Exporte todos os seus dados para Excel. Inclui folhas separadas para Faturação, Despesas e Clientes.
                        Ideal para contabilidade mensal.
                    </p>
                    <button id="btn-export-excel" class="btn btn-primary" style="width:100%;">
                        📥 Descarregar Relatório Excel
                    </button>
                </div>

                <!-- Backup Card -->
                <div class="card">
                    <h2 style="margin-bottom:15px;">💾 Backup de Segurança</h2>
                    <p style="color:var(--text-secondary); margin-bottom:20px;">
                        Guarde uma cópia completa de todos os dados (incluindo fotos) no seu computador.
                        Faça isto regularmente.
                    </p>
                    <button id="btn-backup" class="btn btn-secondary" style="width:100%; border:1px solid var(--accent-primary); color:var(--accent-primary);">
                        💾 Fazer Backup Completo (JSON)
                    </button>
                </div>

                <!-- Restore Card -->
                <div class="card">
                    <h2 style="margin-bottom:15px;">♻️ Restaurar Dados</h2>
                    <p style="color:var(--text-secondary); margin-bottom:20px;">
                        Recupere os dados a partir de um ficheiro de backup anterior.
                        ⚠️ Isto irá substituir os dados atuais!
                    </p>
                    <input type="file" id="file-restore" accept=".json" style="display:none;">
                    <button id="btn-restore" class="btn btn-danger" style="width:100%;">
                        ♻️ Restaurar de Backup
                    </button>
                </div>
            </div>
        `;

        this.attachEvents();
    }

    attachEvents() {
        document.getElementById('btn-export-excel').addEventListener('click', () => {
            try {
                ExportService.exportToExcel();
                alert('Relatório Excel gerado com sucesso!');
            } catch (e) {
                console.error(e);
                alert('Erro ao gerar Excel. Verifique se tem dados suficientes.');
            }
        });

        document.getElementById('btn-backup').addEventListener('click', () => {
            ExportService.backupData();
        });

        const btnRestore = document.getElementById('btn-restore');
        const fileInput = document.getElementById('file-restore');

        btnRestore.addEventListener('click', () => {
            if (confirm('ATENÇÃO: Isto irá APAGAR todos os dados atuais e substituir pelo backup. Tem a certeza?')) {
                fileInput.click();
            }
        });

        fileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                await ExportService.restoreData(file);
                alert('Dados restaurados com sucesso! A página será recarregada.');
                window.location.reload();
            } catch (err) {
                alert('Erro ao restaurar: ' + err);
            }
        });
    }
}
