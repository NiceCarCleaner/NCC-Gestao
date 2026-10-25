class Dashboard {
    constructor(container) {
        this.container = container;
        this.selectedDate = new Date(); // Default to current date
        this.selectedMonthVal = this.selectedDate.getMonth().toString();
        this.render();
    }

    async render() {
        const monthNames = [
            "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
            "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
        ];
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let i = currentYear; i >= currentYear - 5; i--) {
            years.push(i);
        }

        this.container.innerHTML = `
            <div class="page-header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
                <h1>Dashboard</h1>
                
                <div style="display:flex; gap:10px; align-items:center;">
                    <!-- Date Selector -->
                    <div style="display:flex; gap:5px; background:#000; padding:5px 10px; border-radius:10px; border:1px solid var(--border-color);">
                        <select id="dashboard-month" style="background:transparent; border:none; color:var(--text-primary); font-family:inherit; cursor:pointer; outline:none;">
                            ${monthNames.map((m, i) => `<option value="${i}" style="background-color: #000; color: #fff;" ${i.toString() === this.selectedMonthVal ? 'selected' : ''}>${m}</option>`).join('')}
                            <option value="all" style="background-color: #000; color: #fff;" ${this.selectedMonthVal === 'all' ? 'selected' : ''}>Total Anual</option>
                        </select>
                        <select id="dashboard-year" style="background:transparent; border:none; color:var(--text-primary); font-family:inherit; cursor:pointer; outline:none;">
                            ${years.map(y => `<option value="${y}" style="background-color: #000; color: #fff;" ${y === this.selectedDate.getFullYear() ? 'selected' : ''}>${y}</option>`).join('')}
                        </select>
                    </div>

                    <div id="weather-widget" style="display:flex; align-items:center; gap:10px; background:rgba(255,255,255,0.1); padding:8px 16px; border-radius:20px; font-size:0.9em;">
                        <span>🌤️ A carregar meteo...</span>
                    </div>
                </div>
            </div>
            <!-- KPI Cards -->
            <div class="dashboard-grid" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap:20px; margin-bottom:30px;">
                <div class="card kpi-card">
                    <h3 id="lbl-revenue" style="color:var(--text-secondary); font-size:0.9em; margin-bottom:8px;">Faturação Mensal</h3>
                    <div style="font-size:1.8em; font-weight:bold;" id="kpi-revenue">0.00 €</div>
                    <div style="font-size:0.85em; margin-top:4px;" id="kpi-growth"><span style="color:var(--text-muted);">-- vs anterior</span></div>
                </div>
                <div class="card kpi-card">
                    <h3 id="lbl-expenses" style="color:var(--text-secondary); font-size:0.9em; margin-bottom:8px;">Despesas Mensais</h3>
                    <div style="font-size:1.8em; font-weight:bold; color:var(--accent-danger);" id="kpi-expenses">0.00 €</div>
                    <div style="font-size:0.85em; margin-top:4px;" id="kpi-growth-expenses"></div>
                </div>
                <div class="card kpi-card">
                    <h3 style="color:var(--text-secondary); font-size:0.9em; margin-bottom:8px;">Lucro Líquido</h3>
                    <div style="font-size:1.8em; font-weight:bold; color:var(--accent-success);" id="kpi-profit">0.00 €</div>
                    <div style="font-size:0.85em; margin-top:4px;" id="kpi-growth-profit"></div>
                </div>
                <div class="card kpi-card">
                    <h3 style="color:var(--text-secondary); font-size:0.9em; margin-bottom:8px;">Serviços Realizados</h3>
                    <div style="font-size:1.8em; font-weight:bold; color:var(--accent-primary);" id="kpi-services">0</div>
                    <div style="font-size:0.85em; margin-top:4px;" id="kpi-growth-services"></div>
                </div>
                <div class="card kpi-card">
                    <h3 style="color:var(--text-secondary); font-size:0.9em; margin-bottom:8px;">Faturação Média Diária</h3>
                    <div style="font-size:1.8em; font-weight:bold;" id="kpi-avg-revenue">0.00 €</div>
                    <div style="font-size:0.85em; margin-top:4px;" id="kpi-growth-avg-revenue"></div>
                </div>
                <div class="card kpi-card">
                    <h3 style="color:var(--text-secondary); font-size:0.9em; margin-bottom:8px;">Serviços Médios Diários</h3>
                    <div style="font-size:1.8em; font-weight:bold;" id="kpi-avg-daily-services">0</div>
                    <div style="font-size:0.85em; margin-top:4px;" id="kpi-growth-avg-daily-services"></div>
                </div>
                <div class="card kpi-card">
                    <h3 style="color:var(--text-secondary); font-size:0.9em; margin-bottom:8px;">Média por Serviço</h3>
                    <div style="font-size:1.8em; font-weight:bold;" id="kpi-avg-per-service">0.00 €</div>
                    <div style="font-size:0.85em; margin-top:4px;" id="kpi-growth-avg-per-service"></div>
                </div>
            </div>
            <!-- Payment Stats Table -->
            <div class="card" style="margin-bottom:30px;">
                <h3 style="color:var(--text-secondary); font-size:0.9em; margin-bottom:15px;">Resumo de Pagamentos (Numerário vs MBWay)</h3>
                <div class="table-responsive">
                    <table class="data-table" style="width:100%;">
                        <thead>
                            <tr>
                                <th>Método</th>
                                <th>Este Mês</th>
                                <th>Este Ano</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Numerário</td>
                                <td id="stats-cash-month" style="font-weight:bold;">0.00 €</td>
                                <td id="stats-cash-year" style="font-weight:bold;">0.00 €</td>
                            </tr>
                            <tr>
                                <td>MBWay</td>
                                <td id="stats-mbway-month" style="font-weight:bold;">0.00 €</td>
                                <td id="stats-mbway-year" style="font-weight:bold;">0.00 €</td>
                            </tr>
                            <tr style="border-top:2px solid var(--border-color);">
                                <td><strong>Total</strong></td>
                                <td id="stats-total-month" style="font-weight:bold; color:var(--accent-primary);">0.00 €</td>
                                <td id="stats-total-year" style="font-weight:bold; color:var(--accent-primary);">0.00 €</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <!-- Daily Revenue Table -->
            <div class="card" style="margin-bottom:30px;">
                <h3 id="lbl-table-title" style="color:var(--text-secondary); font-size:0.9em; margin-bottom:15px;">Faturação Diária do Mês</h3>
                <div class="table-responsive" style="max-height:400px; overflow-y:auto;">
                    <table class="data-table" style="width:100%;">
                        <thead id="tbl-header" style="position:sticky; top:0; background:var(--bg-secondary); z-index:1;">
                            <tr>
                                <th>Dia</th>
                                <th>Data</th>
                                <th>Serviços</th>
                                <th>Faturação</th>
                            </tr>
                        </thead>
                        <tbody id="daily-revenue-table">
                            <!-- Daily revenue will be loaded here -->
                        </tbody>
                    </table>
                </div>
            </div>
            <!-- Charts Row -->
            <div class="charts-grid" style="display:grid; grid-template-columns: 2fr 1fr; gap:20px;">
                <div class="card">
                    <h3 id="lbl-chart-title">Evolução de Receitas (6 Meses)</h3>
                    <div style="height:300px; position:relative;">
                        <canvas id="revenueChart"></canvas>
                    </div>
                </div>
                <div class="card">
                    <h3>Top Serviços</h3>
                    <div style="height:300px; position:relative;">
                        <canvas id="servicesChart"></canvas>
                    </div>
                </div>
            </div>
        `;

        this.loadWeather();
        this.calculateAnalytics();
        this.setupEventListeners();
    }

    setupEventListeners() {
        const monthSelect = document.getElementById('dashboard-month');
        const yearSelect = document.getElementById('dashboard-year');

        const updateDate = () => {
            const mVal = monthSelect.value;
            const y = parseInt(yearSelect.value);
            this.selectedMonthVal = mVal;
            if (mVal === 'all') {
                this.selectedDate = new Date(y, 0, 1);
            } else {
                this.selectedDate = new Date(y, parseInt(mVal), 1);
            }
            this.calculateAnalytics();
        };

        monthSelect.addEventListener('change', updateDate);
        yearSelect.addEventListener('change', updateDate);
    }

    async loadWeather() {
        try {
            const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=41.34&longitude=-8.47&current_weather=true');
            const data = await response.json();
            const temp = data.current_weather.temperature;
            const code = data.current_weather.weathercode;
            let icon = '☀️';
            if (code > 3) icon = '☁️';
            if (code > 50) icon = '🌧️';
            if (code > 90) icon = '⛈️';
            const widget = document.getElementById('weather-widget');
            if (widget) {
                widget.innerHTML = `
                    <span style="font-size:1.2em;">${icon}</span>
                    <span>Santo Tirso: <strong>${temp}°C</strong></span>
                `;
            }
        } catch (e) {
            const widget = document.getElementById('weather-widget');
            if (widget) widget.innerHTML = '<span>Meteo indisponível</span>';
        }
    }

    calculateAnalytics() {
        const appointments = store.getAppointments();
        const expenses = store.getExpenses();
        const services = store.getServices();

        const isYearly = this.selectedMonthVal === 'all';
        const now = this.selectedDate;
        const currentMonth = isYearly ? null : now.getMonth();
        const currentYear = now.getFullYear();

        const prevMonthDate = new Date(currentYear, now.getMonth() - 1, 1);
        const prevMonth = prevMonthDate.getMonth();
        const prevYear = prevMonthDate.getFullYear();

        // Labels UI
        document.getElementById('lbl-revenue').textContent = isYearly ? 'Faturação Anual' : 'Faturação Mensal';
        document.getElementById('lbl-expenses').textContent = isYearly ? 'Despesas Anuais' : 'Despesas Mensais';

        const getApptValue = (a) => {
            if (a.finalPrice) return parseFloat(a.finalPrice);
            let val = 0;
            if (a.serviceIds && a.serviceIds.length > 0) {
                a.serviceIds.forEach(id => {
                    const s = services.find(srv => srv.id === id);
                    if (s) val += parseFloat(s.price);
                });
            } else {
                const s = services.find(srv => srv.id === a.serviceId);
                val = s ? parseFloat(s.price) : 0;
            }
            return val;
        };

        const getRevenue = (m, y, yearly, maxDay = null) => {
            return appointments
                .filter(a => {
                    const d = new Date(a.date);
                    const isCorrectPeriod = yearly ? d.getFullYear() === y : (d.getMonth() === m && d.getFullYear() === y);
                    const isWithinMaxDay = maxDay ? d.getDate() <= maxDay : true;
                    return a.status === 'paid' && isCorrectPeriod && isWithinMaxDay;
                })
                .reduce((sum, a) => sum + getApptValue(a), 0);
        };

        const todayReal = new Date();
        const isCurrentMonthReal = !isYearly && currentMonth === todayReal.getMonth() && currentYear === todayReal.getFullYear();
        let maxPaidDay = null;
        if (isCurrentMonthReal) {
            const currentAppts = appointments.filter(a => {
                const d = new Date(a.date);
                return a.status === 'paid' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
            });
            if (currentAppts.length > 0) {
                maxPaidDay = Math.max(...currentAppts.map(a => new Date(a.date).getDate()));
            } else {
                maxPaidDay = todayReal.getDate();
            }
        }

        const currentRevenue = getRevenue(currentMonth, currentYear, isYearly);
        const prevRevenue = getRevenue(isYearly ? null : prevMonth, isYearly ? currentYear - 1 : prevYear, isYearly, isCurrentMonthReal ? maxPaidDay : null);

        const getExpenses = (m, y, yearly, maxDay = null) => {
            return expenses
                .filter(e => {
                    const d = new Date(e.date);
                    const isCorrectPeriod = yearly ? d.getFullYear() === y : (d.getMonth() === m && d.getFullYear() === y);
                    const isWithinMaxDay = maxDay ? d.getDate() <= maxDay : true;
                    return isCorrectPeriod && isWithinMaxDay;
                })
                .reduce((sum, e) => sum + parseFloat(e.amount), 0);
        };

        const getServicesCount = (m, y, yearly, maxDay = null) => {
            return appointments
                .filter(a => {
                    const d = new Date(a.date);
                    const isCorrectPeriod = yearly ? d.getFullYear() === y : (d.getMonth() === m && d.getFullYear() === y);
                    const isWithinMaxDay = maxDay ? d.getDate() <= maxDay : true;
                    return (a.status === 'completed' || a.status === 'paid') && isCorrectPeriod && isWithinMaxDay;
                }).length;
        };

        const getActiveDaysCount = (m, y, yearly, maxDay = null) => {
            const activeDays = new Set();
            appointments.forEach(a => {
                const d = new Date(a.date);
                const isCorrectPeriod = yearly ? d.getFullYear() === y : (d.getMonth() === m && d.getFullYear() === y);
                const isWithinMaxDay = maxDay ? d.getDate() <= maxDay : true;
                if ((a.status === 'completed' || a.status === 'paid') && isCorrectPeriod && isWithinMaxDay) {
                    activeDays.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
                }
            });
            return activeDays.size;
        };

        const currentExpenses = getExpenses(currentMonth, currentYear, isYearly);
        const prevExpenses = getExpenses(isYearly ? null : prevMonth, isYearly ? currentYear - 1 : prevYear, isYearly, isCurrentMonthReal ? maxPaidDay : null);

        const currentServicesCount = getServicesCount(currentMonth, currentYear, isYearly);
        const prevServicesCount = getServicesCount(isYearly ? null : prevMonth, isYearly ? currentYear - 1 : prevYear, isYearly, isCurrentMonthReal ? maxPaidDay : null);

        const currentActiveDays = getActiveDaysCount(currentMonth, currentYear, isYearly);
        const prevActiveDays = getActiveDaysCount(isYearly ? null : prevMonth, isYearly ? currentYear - 1 : prevYear, isYearly, isCurrentMonthReal ? maxPaidDay : null);

        const currentProfit = currentRevenue - currentExpenses;
        const prevProfit = prevRevenue - prevExpenses;

        const currentAvgRevenue = currentActiveDays ? currentRevenue / currentActiveDays : 0;
        const prevAvgRevenue = prevActiveDays ? prevRevenue / prevActiveDays : 0;

        const currentAvgDailyServices = currentActiveDays ? currentServicesCount / currentActiveDays : 0;
        const prevAvgDailyServices = prevActiveDays ? prevServicesCount / prevActiveDays : 0;

        const currentAvgPerService = currentServicesCount ? currentRevenue / currentServicesCount : 0;
        const prevAvgPerService = prevServicesCount ? prevRevenue / prevServicesCount : 0;

        document.getElementById('kpi-revenue').textContent = `${currentRevenue.toFixed(2)} €`;
        document.getElementById('kpi-expenses').textContent = `${currentExpenses.toFixed(2)} €`;
        document.getElementById('kpi-profit').textContent = `${currentProfit.toFixed(2)} €`;
        document.getElementById('kpi-services').textContent = currentServicesCount;
        document.getElementById('kpi-avg-revenue').textContent = `${currentAvgRevenue.toFixed(2)} €`;
        document.getElementById('kpi-avg-daily-services').textContent = currentAvgDailyServices.toFixed(2);
        document.getElementById('kpi-avg-per-service').textContent = `${currentAvgPerService.toFixed(2)} €`;

        const renderGrowth = (elId, current, prev, isInverseGood = false) => {
            const el = document.getElementById(elId);
            if (!el) return;
            if (prev === 0) {
                el.innerHTML = '<span style="color:var(--text-muted);">Sem dados ant.</span>';
            } else {
                const growth = ((current - prev) / Math.abs(prev)) * 100;
                let color = 'var(--text-muted)';
                let icon = '〰';
                if (growth > 0) {
                    color = isInverseGood ? 'var(--accent-danger)' : 'var(--accent-success)';
                    icon = '⬆';
                } else if (growth < 0) {
                    color = isInverseGood ? 'var(--accent-success)' : 'var(--accent-danger)';
                    icon = '⬇';
                }
                
                let periodStr = isYearly ? 'ano anterior' : 'mês anterior';
                if (isCurrentMonthReal && maxPaidDay) {
                    periodStr = `ant. (até dia ${maxPaidDay})`;
                }
                el.innerHTML = `<span style="color:${color}; font-weight:bold;">${icon} ${Math.abs(growth).toFixed(1)}%</span> <span style="color:var(--text-muted); font-size:0.85em;">vs ${periodStr}</span>`;
            }
        };

        renderGrowth('kpi-growth', currentRevenue, prevRevenue);
        renderGrowth('kpi-growth-expenses', currentExpenses, prevExpenses, true);
        renderGrowth('kpi-growth-profit', currentProfit, prevProfit);
        renderGrowth('kpi-growth-services', currentServicesCount, prevServicesCount);
        renderGrowth('kpi-growth-avg-revenue', currentAvgRevenue, prevAvgRevenue);
        renderGrowth('kpi-growth-avg-daily-services', currentAvgDailyServices, prevAvgDailyServices);
        renderGrowth('kpi-growth-avg-per-service', currentAvgPerService, prevAvgPerService);

        // Payment stats
        const getPaymentStats = (method, periodFilter = true) => {
            return appointments
                .filter(a => {
                    const d = new Date(a.date);
                    const isPaid = a.status === 'paid';
                    const isMethod = a.paymentMethod === method;
                    const isYear = d.getFullYear() === currentYear;
                    const isPeriod = periodFilter ? (isYearly ? isYear : d.getMonth() === currentMonth) : true;
                    return isPaid && isMethod && isYear && isPeriod;
                })
                .reduce((sum, a) => sum + getApptValue(a), 0);
        };
        const cashMonth = getPaymentStats('Numerário', true);
        const cashYear = getPaymentStats('Numerário', false);
        const mbwayMonth = getPaymentStats('MBWay', true);
        const mbwayYear = getPaymentStats('MBWay', false);
        document.getElementById('stats-cash-month').textContent = `${cashMonth.toFixed(2)} €`;
        document.getElementById('stats-cash-year').textContent = `${cashYear.toFixed(2)} €`;
        document.getElementById('stats-mbway-month').textContent = `${mbwayMonth.toFixed(2)} €`;
        document.getElementById('stats-mbway-year').textContent = `${mbwayYear.toFixed(2)} €`;
        document.getElementById('stats-total-month').textContent = `${(cashMonth + mbwayMonth).toFixed(2)} €`;
        document.getElementById('stats-total-year').textContent = `${(cashYear + mbwayYear).toFixed(2)} €`;

        this.renderRevenueTable(appointments, services, expenses, currentMonth, currentYear, isYearly, expenses);
        this.renderCharts(appointments, services, currentMonth, currentYear, isYearly);
    }

    getWeekNumber(d) {
        d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
        var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
        var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
        return weekNo;
    }

    renderRevenueTable(appointments, services, expenses, currentMonth, currentYear, isYearly, allExpenses) {
        const tbody = document.getElementById('daily-revenue-table');
        const header = document.getElementById('tbl-header');
        const title = document.getElementById('lbl-table-title');
        
        const today = new Date();
        const isCurrentPeriod = isYearly ? (today.getFullYear() === currentYear) : (today.getMonth() === currentMonth && today.getFullYear() === currentYear);

        const getApptValue = (a) => {
            if (a.finalPrice) return parseFloat(a.finalPrice);
            let val = 0;
            if (a.serviceIds && a.serviceIds.length > 0) {
                a.serviceIds.forEach(id => {
                    const s = services.find(srv => srv.id === id);
                    if (s) val += parseFloat(s.price);
                });
            } else {
                const s = services.find(srv => srv.id === a.serviceId);
                val = s ? parseFloat(s.price) : 0;
            }
            return val;
        };

        if (isYearly) {
            title.textContent = 'Faturação Semanal do Ano e Despesas';
            header.innerHTML = `
                <tr>
                    <th>Semana</th>
                    <th>Período</th>
                    <th>Serviços</th>
                    <th>Despesas</th>
                    <th>Faturação</th>
                </tr>
            `;

            // Calculate weekly data for the current year
            const weeks = {};
            
            // Generate all weeks numbers (1-52/53) based on a crude logic or just fill from existing data + empty
            for(let i=1; i<=53; i++) {
                weeks[i] = { week: i, count: 0, revenue: 0, expenses: 0, startObj: null };
            }

            // Distribute appointments matching current year
            appointments.filter(a => new Date(a.date).getFullYear() === currentYear && a.status === 'paid').forEach(a => {
                const d = new Date(a.date);
                const weekNum = this.getWeekNumber(d);
                if (weeks[weekNum]) {
                    weeks[weekNum].count++;
                    weeks[weekNum].revenue += getApptValue(a);
                    if (!weeks[weekNum].startObj || d < weeks[weekNum].startObj) weeks[weekNum].startObj = d;
                }
            });

            // Distribute expenses
            allExpenses.filter(e => new Date(e.date).getFullYear() === currentYear).forEach(e => {
                const d = new Date(e.date);
                const weekNum = this.getWeekNumber(d);
                if (weeks[weekNum]) {
                    weeks[weekNum].expenses += parseFloat(e.amount || 0);
                    if (!weeks[weekNum].startObj || d < weeks[weekNum].startObj) weeks[weekNum].startObj = d;
                }
            });

            // Clean up empty trailing weeks where there's no data and it's past the current date if current year
            const sortedWeeks = Object.values(weeks).filter(w => w.revenue > 0 || w.expenses > 0 || w.count > 0).sort((a,b)=>a.week-b.week);

            const thisWeekNum = this.getWeekNumber(today);

            tbody.innerHTML = sortedWeeks.map(item => {
                const isThisWeek = isCurrentPeriod && item.week === thisWeekNum;
                const rowStyle = isThisWeek ? 'background:rgba(255,59,48,0.1); font-weight:bold;' : '';
                const revenueColor = item.revenue > 0 ? 'var(--accent-success)' : 'var(--text-muted)';
                const expColor = item.expenses > 0 ? 'var(--accent-danger)' : 'var(--text-muted)';
                return `
                    <tr style="${rowStyle}">
                        <td>S${item.week}</td>
                        <td>${item.startObj ? 'Mês ' + (item.startObj.getMonth()+1) : '-'}</td>
                        <td>${item.count}</td>
                        <td style="color:${expColor};">${item.expenses.toFixed(2)} €</td>
                        <td style="color:${revenueColor}; font-weight:bold;">${item.revenue.toFixed(2)} €</td>
                    </tr>
                `;
            }).join('');
        } else {
            title.textContent = 'Faturação Diária do Mês';
            header.innerHTML = `
                <tr>
                    <th>Dia</th>
                    <th>Data</th>
                    <th>Serviços</th>
                    <th>Despesas</th>
                    <th>Faturação</th>
                </tr>
            `;

            const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
            const todayDay = isCurrentPeriod ? today.getDate() : -1;

            const dailyData = [];
            for (let day = 1; day <= daysInMonth; day++) {
                const dayAppointments = appointments.filter(a => {
                    const d = new Date(a.date);
                    return a.status === 'paid' && d.getDate() === day && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
                });
                const revenue = dayAppointments.reduce((sum, a) => sum + getApptValue(a), 0);
                
                const dayExpenses = allExpenses.filter(e => {
                    const d = new Date(e.date);
                    return d.getDate() === day && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
                }).reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

                dailyData.push({ day, count: dayAppointments.length, revenue, expenses: dayExpenses });
            }

            tbody.innerHTML = dailyData.map(item => {
                const date = new Date(currentYear, currentMonth, item.day);
                const dayName = date.toLocaleString('pt-PT', { weekday: 'short' });
                const dateStr = date.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' });
                const isToday = item.day === todayDay;
                const rowStyle = isToday ? 'background:rgba(255,59,48,0.1); font-weight:bold;' : '';
                const revenueColor = item.revenue > 0 ? 'var(--accent-success)' : 'var(--text-muted)';
                const expColor = item.expenses > 0 ? 'var(--accent-danger)' : 'var(--text-muted)';
                return `
                    <tr style="${rowStyle}">
                        <td>${dayName}</td>
                        <td>${dateStr}${isToday ? ' <span style="color:var(--accent-primary); font-size:0.8em;">(Hoje)</span>' : ''}</td>
                        <td>${item.count}</td>
                        <td style="color:${expColor};">${item.expenses.toFixed(2)} €</td>
                        <td style="color:${revenueColor}; font-weight:bold;">${item.revenue.toFixed(2)} €</td>
                    </tr>
                `;
            }).join('');
        }
    }

    renderCharts(appointments, services, currentMonth, currentYear, isYearly) {
        // Destroy existing charts if they exist
        if (this.revenueChartInstance) this.revenueChartInstance.destroy();
        if (this.servicesChartInstance) this.servicesChartInstance.destroy();

        const ctxRevenue = document.getElementById('revenueChart').getContext('2d');
        const labels = [];
        const dataRevenue = [];

        const getApptValue = (a) => {
            if (a.finalPrice) return parseFloat(a.finalPrice);
            let val = 0;
            if (a.serviceIds && a.serviceIds.length > 0) {
                a.serviceIds.forEach(id => {
                    const s = services.find(srv => srv.id === id);
                    if (s) val += parseFloat(s.price);
                });
            } else {
                const s = services.find(srv => srv.id === a.serviceId);
                val = s ? parseFloat(s.price) : 0;
            }
            return val;
        };

        if (isYearly) {
            document.getElementById('lbl-chart-title').textContent = `Evolução de Receitas (${currentYear})`;
            // Show months of the year
            for (let i = 0; i < 12; i++) {
                const d = new Date(currentYear, i, 1);
                labels.push(d.toLocaleString('pt-PT', { month: 'short' }));
                const rev = appointments.filter(a => {
                    const ad = new Date(a.date);
                    return a.status === 'paid' && ad.getMonth() === i && ad.getFullYear() === currentYear;
                }).reduce((sum, a) => sum + getApptValue(a), 0);
                dataRevenue.push(rev);
            }
        } else {
            document.getElementById('lbl-chart-title').textContent = 'Evolução de Receitas (6 Meses)';
            // Revenue Chart (Last 6 Months ending in selected month)
            const endDate = new Date(currentYear, currentMonth, 1);
            for (let i = 5; i >= 0; i--) {
                const d = new Date(endDate);
                d.setMonth(d.getMonth() - i);
                const monthName = d.toLocaleString('pt-PT', { month: 'short' });
                labels.push(monthName);
                const m = d.getMonth();
                const y = d.getFullYear();
                const rev = appointments
                    .filter(a => {
                        const ad = new Date(a.date);
                        return a.status === 'paid' && ad.getMonth() === m && ad.getFullYear() === y;
                    })
                    .reduce((sum, a) => sum + getApptValue(a), 0);
                dataRevenue.push(rev);
            }
        }

        this.revenueChartInstance = new Chart(ctxRevenue, {
            type: 'line',
            data: { labels, datasets: [{ label: 'Faturação (€)', data: dataRevenue, borderColor: '#FF3B30', backgroundColor: 'rgba(255, 59, 48, 0.1)', tension: 0.4, fill: true }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#a0a0a0' } }, x: { grid: { display: false }, ticks: { color: '#a0a0a0' } } } }
        });

        // Top Services Chart (Filtered by selected period)
        const ctxServices = document.getElementById('servicesChart').getContext('2d');
        const serviceCounts = {};
        appointments.forEach(a => {
            const d = new Date(a.date);
            const inPeriod = isYearly ? (d.getFullYear() === currentYear) : (d.getMonth() === currentMonth && d.getFullYear() === currentYear);
            
            if ((a.status === 'paid' || a.status === 'completed') && inPeriod) {
                if (a.serviceIds && a.serviceIds.length > 0) {
                    a.serviceIds.forEach(id => {
                        const s = services.find(srv => srv.id === id);
                        const name = s ? s.name : 'Outros';
                        serviceCounts[name] = (serviceCounts[name] || 0) + 1;
                    });
                } else {
                    const s = services.find(srv => srv.id === a.serviceId);
                    const name = s ? s.name : 'Outros';
                    serviceCounts[name] = (serviceCounts[name] || 0) + 1;
                }
            }
        });

        // If no services this month, show empty or placeholder? 
        // Chart.js handles empty data okay, but let's see.

        const sortedServices = Object.entries(serviceCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        this.servicesChartInstance = new Chart(ctxServices, {
            type: 'doughnut',
            data: {
                labels: sortedServices.map(i => i[0]),
                datasets: [{ data: sortedServices.map(i => i[1]), backgroundColor: ['#FF3B30', '#FFFFFF', '#323232', '#666666', '#999999'], borderWidth: 0 }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#a0a0a0', boxWidth: 12 } }, tooltip: { callbacks: { label: function (context) { let label = context.label || ''; if (label) { label += ': '; } const value = context.raw; const total = context.chart._metasets[context.datasetIndex].total; const percentage = Math.round((value / total) * 100) + '%'; return label + value + ' (' + percentage + ')'; } } } } }
        });
    }
}
