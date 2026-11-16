const VEHICLE_COLORS = [
    { id: 'Preto', label: 'Preto', hex: '#1c1c1e', highlight: '#3a3a40', shadow: '#09090b', border: '#555' },
    { id: 'Branco', label: 'Branco', hex: '#e5e7eb', highlight: '#ffffff', shadow: '#9ca3af', border: '#fff' },
    { id: 'Cinzento Prata', label: 'Cinzento Prata', hex: '#9ca3af', highlight: '#e5e7eb', shadow: '#4b5563', border: '#cbd5e1' },
    { id: 'Cinzento Escuro', label: 'Cinzento Escuro', hex: '#4b5563', highlight: '#9ca3af', shadow: '#1f2937', border: '#6b7280' },
    { id: 'Azul', label: 'Azul', hex: '#1d4ed8', highlight: '#60a5fa', shadow: '#1e3a8a', border: '#3b82f6' },
    { id: 'Vermelho', label: 'Vermelho', hex: '#b91c1c', highlight: '#f87171', shadow: '#7f1d1d', border: '#ef4444' },
    { id: 'Verde', label: 'Verde', hex: '#15803d', highlight: '#4ade80', shadow: '#14532d', border: '#22c55e' },
    { id: 'Amarelo/Dourado', label: 'Amarelo/Dourado', hex: '#ca8a04', highlight: '#facc15', shadow: '#713f12', border: '#eab308' },
    { id: 'Bege/Castanho', label: 'Bege/Castanho', hex: '#78350f', highlight: '#b45309', shadow: '#451a03', border: '#a16207' }
];

const PANEL_DEFECT_TYPES = [
    { id: 'scratches', label: 'Riscos / Pintura', icon: '🔴', color: '#ff453a', checklistKey: 'defect_scratches' },
    { id: 'swirls', label: 'Swirls / Micro-riscos', icon: '🟠', color: '#ff9f0a', checklistKey: 'defect_scratches' },
    { id: 'dents', label: 'Amolgadela / Mossa', icon: '🟡', color: '#ffd60a', checklistKey: 'defect_dents' },
    { id: 'clearcoat', label: 'Verniz Queimado', icon: '🟣', color: '#bf5af2', checklistKey: 'defect_scratches' },
    { id: 'stone_chips', label: 'Picadas de Pedra', icon: '🔵', color: '#0a84ff', checklistKey: 'defect_scratches' },
    { id: 'rim_damage', label: 'Jante Raspada / Dano', icon: '⚫', color: '#8e8e93', checklistKey: 'defect_wheels' },
    { id: 'glass_chip', label: 'Vidro Picado / Estalado', icon: '🟢', color: '#30d158', checklistKey: 'defect_glass' }
];

const CAR_PANELS = [
    { id: 'front_bumper', name: 'Para-choques Frontal', cx: 180, cy: 42 },
    { id: 'hood', name: 'Capô', cx: 180, cy: 115 },
    { id: 'windshield', name: 'Para-brisas Frontal', cx: 180, cy: 192 },
    { id: 'roof', name: 'Tejadilho', cx: 180, cy: 278 },
    { id: 'rear_window', name: 'Óculo Traseiro', cx: 180, cy: 365 },
    { id: 'trunk', name: 'Mala / Bagageira', cx: 180, cy: 425 },
    { id: 'rear_bumper', name: 'Para-choques Traseiro', cx: 180, cy: 476 },
    { id: 'headlight_left', name: 'Farol Frontal Esq.', cx: 112, cy: 52 },
    { id: 'headlight_right', name: 'Farol Frontal Dir.', cx: 248, cy: 52 },
    { id: 'taillight_left', name: 'Farol Traseiro Esq.', cx: 114, cy: 465 },
    { id: 'taillight_right', name: 'Farol Traseiro Dir.', cx: 246, cy: 465 },
    { id: 'fender_fl', name: 'Guarda-lamas Frontal Esq.', cx: 78, cy: 122 },
    { id: 'door_fl', name: 'Porta Frontal Esq.', cx: 74, cy: 232 },
    { id: 'door_rl', name: 'Porta Traseira Esq.', cx: 74, cy: 318 },
    { id: 'quarter_rl', name: 'Painel Traseiro Esq.', cx: 78, cy: 408 },
    { id: 'fender_fr', name: 'Guarda-lamas Frontal Dir.', cx: 282, cy: 122 },
    { id: 'door_fr', name: 'Porta Frontal Dir.', cx: 286, cy: 232 },
    { id: 'door_rr', name: 'Porta Traseira Dir.', cx: 286, cy: 318 },
    { id: 'quarter_rr', name: 'Painel Traseiro Dir.', cx: 282, cy: 408 },
    { id: 'mirror_left', name: 'Espelho Retrovisor Esq.', cx: 52, cy: 185 },
    { id: 'mirror_right', name: 'Espelho Retrovisor Dir.', cx: 308, cy: 185 },
    { id: 'wheel_fl', name: 'Jante / Pneu Frontal Esq.', cx: 42, cy: 122 },
    { id: 'wheel_fr', name: 'Jante / Pneu Frontal Dir.', cx: 318, cy: 122 },
    { id: 'wheel_rl', name: 'Jante / Pneu Traseiro Esq.', cx: 42, cy: 392 },
    { id: 'wheel_rr', name: 'Jante / Pneu Traseiro Dir.', cx: 318, cy: 392 }
];

class Clients {
    constructor(container) {
        this.container = container;
        this.currentPanelDefects = {};
        this.selectedPanelId = null;
        this.quickDefectTool = null;
        this.currentCarColor = 'Cinzento Prata';
        this.render();
    }

    getColorMeta(colorName) {
        return VEHICLE_COLORS.find(c => c.id === colorName) || VEHICLE_COLORS[2];
    }

    renderColorOptions(selectedColor = '') {
        return `<option value="">Cor...</option>` + VEHICLE_COLORS.map(c =>
            `<option value="${c.id}" ${c.id === selectedColor ? 'selected' : ''}>${c.label}</option>`
        ).join('');
    }

    renderColorBadge(colorName) {
        if (!colorName) return '';
        const meta = this.getColorMeta(colorName);
        return `<span class="vehicle-color-badge" title="Cor: ${meta.label}">
            <span class="vehicle-color-dot" style="background:${meta.hex}; border-color:${meta.border};"></span>
            ${meta.label}
        </span>`;
    }

    createVehicleEntryHtml(v = {}, showRemove = false) {
        const model = v.model || '';
        const plate = v.plate || '';
        const year = v.year || (typeof PlateLookupService !== 'undefined' && plate ? (PlateLookupService.estimateYearFromPlate(plate) || '') : '');
        const color = v.color || (typeof PlateLookupService !== 'undefined' && model ? (PlateLookupService.inferColorFromModelName(model) || '') : '');
        return `
            <div class="vehicle-entry" style="margin-bottom:12px; background:rgba(255,255,255,0.03); padding:10px; border-radius:8px; border:1px solid rgba(255,255,255,0.06);">
                <div style="display:grid; grid-template-columns: 1.35fr 2fr 0.8fr 1.25fr auto; gap:8px; align-items:center;">
                    <div style="display:flex; gap:4px; align-items:center;">
                        <input type="text" name="plate[]" value="${plate}" placeholder="Matrícula (AA-00-AA)"
                               oninput="window.handlePlateInput(this)"
                               style="text-transform:uppercase; font-weight:600; letter-spacing:0.5px;">
                        <button type="button" class="btn btn-secondary" title="Pesquisar dados pela matrícula"
                                style="padding:8px 9px; font-size:0.85rem; flex-shrink:0;"
                                onclick="window.triggerPlateLookupBtn(this)">🔍</button>
                        <label class="btn btn-secondary" title="Identificar carro/matrícula/cor por fotografia"
                               style="padding:8px 9px; font-size:0.85rem; flex-shrink:0; margin:0; cursor:pointer;">
                            📷
                            <input type="file" accept="image/*" capture="environment" style="display:none;"
                                   onchange="window.handleCarPhotoInput(this)">
                        </label>
                    </div>
                    <input type="text" name="vehicle[]" list="pt-car-models-list" value="${model}" placeholder="Marca / Modelo" required>
                    <input type="number" name="year[]" value="${year}" placeholder="Ano" min="1950" max="2035">
                    <select name="color[]" class="vehicle-color-select">
                        ${this.renderColorOptions(color)}
                    </select>
                    ${showRemove ? `<button type="button" class="btn btn-danger" style="padding:8px 10px;" onclick="this.closest('.vehicle-entry').remove()">✕</button>` : `<span style="width:32px;"></span>`}
                </div>
                <div class="plate-lookup-status" style="font-size:0.76rem; color:var(--text-muted); margin-top:4px; min-height:14px;"></div>
            </div>
        `;
    }

    getCarModelsDatalistHtml() {
        const modelsSet = new Set(typeof PlateLookupService !== 'undefined' ? PlateLookupService.PT_CAR_CATALOG : []);
        if (typeof store !== 'undefined' && store.getClients) {
            store.getClients().forEach(c => {
                (c.vehicles || []).forEach(v => {
                    if (v.model && v.model.length > 2 && v.model !== 'Varios') {
                        modelsSet.add(v.model.trim());
                    }
                });
            });
        }
        return `<datalist id="pt-car-models-list">
            ${Array.from(modelsSet).sort().map(m => `<option value="${m.replace(/"/g, '&quot;')}"></option>`).join('')}
        </datalist>`;
    }

    buildCar3DSvg(prefix = 'insp') {
        return `
        <svg id="${prefix}-car-svg" class="car-3d-svg" viewBox="0 0 360 520" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <!-- 3D Metallic Body Gradient (dynamically updated by vehicle color) -->
                <linearGradient id="${prefix}-body-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" class="car-stop-shadow" stop-color="#4b5563" />
                    <stop offset="22%" class="car-stop-base" stop-color="#9ca3af" />
                    <stop offset="50%" class="car-stop-highlight" stop-color="#e5e7eb" />
                    <stop offset="78%" class="car-stop-base" stop-color="#9ca3af" />
                    <stop offset="100%" class="car-stop-shadow" stop-color="#4b5563" />
                </linearGradient>

                <linearGradient id="${prefix}-side-left-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" class="car-stop-shadow" stop-color="#4b5563" />
                    <stop offset="65%" class="car-stop-base" stop-color="#9ca3af" />
                    <stop offset="100%" class="car-stop-highlight" stop-color="#e5e7eb" />
                </linearGradient>

                <linearGradient id="${prefix}-side-right-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" class="car-stop-highlight" stop-color="#e5e7eb" />
                    <stop offset="35%" class="car-stop-base" stop-color="#9ca3af" />
                    <stop offset="100%" class="car-stop-shadow" stop-color="#4b5563" />
                </linearGradient>

                <linearGradient id="${prefix}-glass-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#0f172a" />
                    <stop offset="35%" stop-color="#1e293b" />
                    <stop offset="55%" stop-color="#334155" />
                    <stop offset="100%" stop-color="#090d16" />
                </linearGradient>

                <linearGradient id="${prefix}-wheel-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="#111827" />
                    <stop offset="50%" stop-color="#374151" />
                    <stop offset="100%" stop-color="#111827" />
                </linearGradient>

                <filter id="${prefix}-drop-shadow" x="-15%" y="-10%" width="130%" height="120%">
                    <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.65" />
                </filter>

                <filter id="${prefix}-defect-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="#ff453a" flood-opacity="0.85" />
                </filter>
            </defs>

            <!-- Ambient Floor Shadow & Blueprint Grid -->
            <rect x="8" y="8" width="344" height="504" rx="18" fill="rgba(10, 14, 24, 0.75)" stroke="rgba(255,255,255,0.06)" />
            <line x1="180" y1="14" x2="180" y2="506" stroke="rgba(255,255,255,0.05)" stroke-dasharray="4 6" />
            <line x1="18" y1="260" x2="342" y2="260" stroke="rgba(255,255,255,0.05)" stroke-dasharray="4 6" />
            <text x="180" y="23" text-anchor="middle" fill="rgba(255,255,255,0.35)" font-size="9" font-weight="600" letter-spacing="2">FRENTE</text>
            <text x="180" y="505" text-anchor="middle" fill="rgba(255,255,255,0.35)" font-size="9" font-weight="600" letter-spacing="2">TRASEIRA</text>
            <text x="20" y="256" fill="rgba(255,255,255,0.28)" font-size="8" font-weight="600">ESQ</text>
            <text x="322" y="256" fill="rgba(255,255,255,0.28)" font-size="8" font-weight="600">DIR</text>

            <!-- Car Underbody 3D Shadow Silhouette -->
            <path d="M 92 48 Q 180 24 268 48 Q 302 88 302 150 L 304 378 Q 300 448 268 478 Q 180 496 92 478 Q 60 448 56 378 L 58 150 Q 58 88 92 48 Z"
                  fill="rgba(0,0,0,0.55)" filter="url(#${prefix}-drop-shadow)" />

            <!-- 4 WHEELS / RIMS -->
            <g class="car-panel" data-panel="wheel_fl" data-name="Jante / Pneu Frontal Esq.">
                <rect x="28" y="92" width="28" height="60" rx="8" fill="url(#${prefix}-wheel-grad)" stroke="#64748b" stroke-width="1.5" />
                <line x1="33" y1="106" x2="51" y2="106" stroke="#94a3b8" stroke-width="1.5" />
                <line x1="33" y1="122" x2="51" y2="122" stroke="#cbd5e1" stroke-width="2" />
                <line x1="33" y1="138" x2="51" y2="138" stroke="#94a3b8" stroke-width="1.5" />
            </g>
            <g class="car-panel" data-panel="wheel_fr" data-name="Jante / Pneu Frontal Dir.">
                <rect x="304" y="92" width="28" height="60" rx="8" fill="url(#${prefix}-wheel-grad)" stroke="#64748b" stroke-width="1.5" />
                <line x1="309" y1="106" x2="327" y2="106" stroke="#94a3b8" stroke-width="1.5" />
                <line x1="309" y1="122" x2="327" y2="122" stroke="#cbd5e1" stroke-width="2" />
                <line x1="309" y1="138" x2="327" y2="138" stroke="#94a3b8" stroke-width="1.5" />
            </g>
            <g class="car-panel" data-panel="wheel_rl" data-name="Jante / Pneu Traseiro Esq.">
                <rect x="28" y="362" width="28" height="60" rx="8" fill="url(#${prefix}-wheel-grad)" stroke="#64748b" stroke-width="1.5" />
                <line x1="33" y1="376" x2="51" y2="376" stroke="#94a3b8" stroke-width="1.5" />
                <line x1="33" y1="392" x2="51" y2="392" stroke="#cbd5e1" stroke-width="2" />
                <line x1="33" y1="408" x2="51" y2="408" stroke="#94a3b8" stroke-width="1.5" />
            </g>
            <g class="car-panel" data-panel="wheel_rr" data-name="Jante / Pneu Traseiro Dir.">
                <rect x="304" y="362" width="28" height="60" rx="8" fill="url(#${prefix}-wheel-grad)" stroke="#64748b" stroke-width="1.5" />
                <line x1="309" y1="376" x2="327" y2="376" stroke="#94a3b8" stroke-width="1.5" />
                <line x1="309" y1="392" x2="327" y2="392" stroke="#cbd5e1" stroke-width="2" />
                <line x1="309" y1="408" x2="327" y2="408" stroke="#94a3b8" stroke-width="1.5" />
            </g>

            <!-- FRONT BUMPER -->
            <path class="car-panel" data-panel="front_bumper" data-name="Para-choques Frontal"
                  d="M 88 54 Q 180 26 272 54 L 262 68 Q 180 48 98 68 Z"
                  fill="url(#${prefix}-body-grad)" stroke="rgba(255,255,255,0.28)" stroke-width="1.2" />

            <!-- HOOD / CAPÔ -->
            <path class="car-panel" data-panel="hood" data-name="Capô"
                  d="M 98 68 Q 180 48 262 68 L 252 166 Q 180 154 108 166 Z"
                  fill="url(#${prefix}-body-grad)" stroke="rgba(255,255,255,0.28)" stroke-width="1.2" />
            <!-- Hood 3D crease lines -->
            <path d="M 132 72 L 138 158 M 228 72 L 222 158" stroke="rgba(255,255,255,0.2)" stroke-width="1" pointer-events="none" />

            <!-- WINDSHIELD / PARA-BRISAS -->
            <path class="car-panel" data-panel="windshield" data-name="Para-brisas Frontal"
                  d="M 108 166 Q 180 154 252 166 L 242 220 Q 180 212 118 220 Z"
                  fill="url(#${prefix}-glass-grad)" stroke="rgba(255,255,255,0.35)" stroke-width="1.3" />
            <path d="M 122 174 L 148 214" stroke="rgba(255,255,255,0.18)" stroke-width="2" pointer-events="none" />

            <!-- ROOF / TEJADILHO -->
            <path class="car-panel" data-panel="roof" data-name="Tejadilho"
                  d="M 118 220 Q 180 212 242 220 L 240 340 Q 180 346 120 340 Z"
                  fill="url(#${prefix}-body-grad)" stroke="rgba(255,255,255,0.28)" stroke-width="1.2" />

            <!-- REAR WINDOW / ÓCULO TRASEIRO -->
            <path class="car-panel" data-panel="rear_window" data-name="Óculo Traseiro"
                  d="M 120 340 Q 180 346 240 340 L 248 392 Q 180 400 112 392 Z"
                  fill="url(#${prefix}-glass-grad)" stroke="rgba(255,255,255,0.35)" stroke-width="1.3" />
            <path d="M 215 348 L 232 385" stroke="rgba(255,255,255,0.16)" stroke-width="2" pointer-events="none" />

            <!-- TRUNK / MALA -->
            <path class="car-panel" data-panel="trunk" data-name="Mala / Bagageira"
                  d="M 112 392 Q 180 400 248 392 L 258 456 Q 180 468 102 456 Z"
                  fill="url(#${prefix}-body-grad)" stroke="rgba(255,255,255,0.28)" stroke-width="1.2" />

            <!-- REAR BUMPER -->
            <path class="car-panel" data-panel="rear_bumper" data-name="Para-choques Traseiro"
                  d="M 94 456 Q 180 470 266 456 L 260 482 Q 180 496 100 482 Z"
                  fill="url(#${prefix}-body-grad)" stroke="rgba(255,255,255,0.28)" stroke-width="1.2" />

            <!-- LEFT SIDE PANELS (Fender FL, Door FL, Door RL, Quarter RL) -->
            <path class="car-panel" data-panel="fender_fl" data-name="Guarda-lamas Frontal Esq."
                  d="M 88 54 L 98 68 L 108 166 L 92 184 L 62 178 Q 56 115 88 54 Z"
                  fill="url(#${prefix}-side-left-grad)" stroke="rgba(255,255,255,0.26)" stroke-width="1.2" />

            <path class="car-panel" data-panel="door_fl" data-name="Porta Frontal Esq."
                  d="M 62 178 L 92 184 L 118 220 L 119 280 L 60 280 Z"
                  fill="url(#${prefix}-side-left-grad)" stroke="rgba(255,255,255,0.26)" stroke-width="1.2" />

            <path class="car-panel" data-panel="door_rl" data-name="Porta Traseira Esq."
                  d="M 60 280 L 119 280 L 120 340 L 96 356 L 62 352 Z"
                  fill="url(#${prefix}-side-left-grad)" stroke="rgba(255,255,255,0.26)" stroke-width="1.2" />

            <path class="car-panel" data-panel="quarter_rl" data-name="Painel Traseiro Esq."
                  d="M 62 352 L 96 356 L 112 392 L 102 456 L 94 456 Q 60 412 62 352 Z"
                  fill="url(#${prefix}-side-left-grad)" stroke="rgba(255,255,255,0.26)" stroke-width="1.2" />

            <!-- RIGHT SIDE PANELS (Fender FR, Door FR, Door RR, Quarter RR) -->
            <path class="car-panel" data-panel="fender_fr" data-name="Guarda-lamas Frontal Dir."
                  d="M 272 54 L 262 68 L 252 166 L 268 184 L 298 178 Q 304 115 272 54 Z"
                  fill="url(#${prefix}-side-right-grad)" stroke="rgba(255,255,255,0.26)" stroke-width="1.2" />

            <path class="car-panel" data-panel="door_fr" data-name="Porta Frontal Dir."
                  d="M 298 178 L 268 184 L 242 220 L 241 280 L 300 280 Z"
                  fill="url(#${prefix}-side-right-grad)" stroke="rgba(255,255,255,0.26)" stroke-width="1.2" />

            <path class="car-panel" data-panel="door_rr" data-name="Porta Traseira Dir."
                  d="M 300 280 L 241 280 L 240 340 L 264 356 L 298 352 Z"
                  fill="url(#${prefix}-side-right-grad)" stroke="rgba(255,255,255,0.26)" stroke-width="1.2" />

            <path class="car-panel" data-panel="quarter_rr" data-name="Painel Traseiro Dir."
                  d="M 298 352 L 264 356 L 248 392 L 258 456 L 266 456 Q 300 412 298 352 Z"
                  fill="url(#${prefix}-side-right-grad)" stroke="rgba(255,255,255,0.26)" stroke-width="1.2" />

            <!-- SIDE MIRRORS -->
            <path class="car-panel" data-panel="mirror_left" data-name="Espelho Retrovisor Esq."
                  d="M 64 176 L 40 182 Q 36 190 44 196 L 64 192 Z"
                  fill="url(#${prefix}-body-grad)" stroke="rgba(255,255,255,0.4)" stroke-width="1.2" />
            <path class="car-panel" data-panel="mirror_right" data-name="Espelho Retrovisor Dir."
                  d="M 296 176 L 320 182 Q 324 190 316 196 L 296 192 Z"
                  fill="url(#${prefix}-body-grad)" stroke="rgba(255,255,255,0.4)" stroke-width="1.2" />

            <!-- HEADLIGHTS & TAILLIGHTS -->
            <path class="car-panel" data-panel="headlight_left" data-name="Farol Frontal Esq."
                  d="M 92 50 L 128 43 L 124 58 L 94 64 Z"
                  fill="#fef08a" fill-opacity="0.88" stroke="#fde047" stroke-width="1.4" />
            <path class="car-panel" data-panel="headlight_right" data-name="Farol Frontal Dir."
                  d="M 268 50 L 232 43 L 236 58 L 266 64 Z"
                  fill="#fef08a" fill-opacity="0.88" stroke="#fde047" stroke-width="1.4" />

            <path class="car-panel" data-panel="taillight_left" data-name="Farol Traseiro Esq."
                  d="M 96 456 L 132 461 L 128 473 L 98 469 Z"
                  fill="#ef4444" fill-opacity="0.9" stroke="#f87171" stroke-width="1.4" />
            <path class="car-panel" data-panel="taillight_right" data-name="Farol Traseiro Dir."
                  d="M 264 456 L 228 461 L 232 473 L 262 469 Z"
                  fill="#ef4444" fill-opacity="0.9" stroke="#f87171" stroke-width="1.4" />

            <!-- Dynamic Overlay Group for Defect Markers/Badges -->
            <g id="${prefix}-markers-layer" pointer-events="none"></g>
        </svg>
        `;
    }

    render() {
        this.container.innerHTML = `
            <div class="page-header">
                <h1>Clientes</h1>
                <div style="display: flex; gap: 10px; align-items: center;">
                    <input type="text" id="client-search" placeholder="Pesquisar (Nome, Telefone, Matrícula, Cor, Ano)..." 
                           style="padding: 8px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-input); color: var(--text-primary); width: 320px;">
                    <button id="btn-add-client" class="btn btn-primary">+ Novo Cliente</button>
                </div>
            </div>
            
            <div class="card">
                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Telefone</th>
                                <th>Veículo (Ano / Cor)</th>
                                <th>Matrícula</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody id="clients-list">
                            <!-- Clients will be loaded here -->
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Modal for New/Edit Client -->
            <div id="modal-client" class="modal hidden">
                <div class="modal-content" style="max-width: 680px;">
                    <div class="modal-header">
                        <h2 id="modal-client-title">Novo Cliente</h2>
                        <span class="close-modal">&times;</span>
                    </div>
                    <form id="form-client">
                        <input type="hidden" name="id" id="client-id">
                        <div class="form-group">
                            <label>Nome</label>
                            <input type="text" name="name" required>
                        </div>
                        <div class="form-group">
                            <label>Telefone</label>
                            <input type="tel" name="phone" required>
                        </div>
                        <div class="form-group">
                            <label>Veículos (Insira a Matrícula ou tire 📷 Foto para preencher Marca/Modelo, Ano e Cor)</label>
                            <div id="new-client-vehicles-container">
                                ${this.createVehicleEntryHtml({}, false)}
                            </div>
                            <button type="button" id="btn-add-vehicle-field" class="btn btn-secondary" style="font-size:0.8em;">+ Adicionar Outro Veículo</button>
                        </div>
                        ${this.getCarModelsDatalistHtml()}
                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary close-modal-btn">Cancelar</button>
                            <button type="submit" class="btn btn-primary">Salvar</button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Modal for Client Details -->
            <div id="modal-client-details" class="modal hidden">
                <div class="modal-content" style="max-width: 940px; height: 90vh; display:flex; flex-direction:column;">
                    <div class="modal-header">
                        <h2 id="details-client-name">Detalhes do Cliente</h2>
                        <span class="close-modal-details">&times;</span>
                    </div>
                    
                    <div class="tabs">
                        <button class="tab-btn active" data-tab="tab-stats">Estatísticas</button>
                        <button class="tab-btn" data-tab="tab-vehicles">Veículos</button>
                        <button class="tab-btn" data-tab="tab-history">Histórico</button>
                        <button class="tab-btn" data-tab="tab-inspections">Inspeções 3D</button>
                    </div>

                    <div class="tab-content" id="tab-stats" style="display:block;">
                        <div class="stats-grid">
                            <div class="stat-card">
                                <h3>Total de Lavagens</h3>
                                <p id="stat-total-washes" class="stat-value">0</p>
                            </div>
                            <div class="stat-card">
                                <h3>Total Gasto</h3>
                                <p id="stat-total-spent" class="stat-value">0€</p>
                            </div>
                        </div>
                        <h3 style="margin-top:20px; margin-bottom:10px;">Tipos de Serviço</h3>
                        <div id="stat-services-list"></div>
                    </div>

                    <div class="tab-content" id="tab-vehicles" style="display:none;">
                        <div id="details-vehicles-list"></div>
                        <div style="margin-top:20px; border-top:1px solid var(--border-color); padding-top:15px;">
                            <h4>Adicionar Veículo (Matrícula Automática ou 📷 Foto IA)</h4>
                            <form id="form-add-vehicle-details" class="vehicle-entry" style="margin-top:10px;">
                                <div style="display:grid; grid-template-columns: 1.35fr 2fr 0.8fr 1.25fr auto; gap:10px; align-items:center;">
                                    <div style="display:flex; gap:4px; align-items:center;">
                                        <input type="text" name="plate" placeholder="Matrícula (AA-00-AA)"
                                               oninput="window.handlePlateInput(this)"
                                               style="text-transform:uppercase; font-weight:600; letter-spacing:0.5px;">
                                        <button type="button" class="btn btn-secondary" title="Pesquisar dados pela matrícula"
                                                style="padding:8px 9px; font-size:0.85rem; flex-shrink:0;"
                                                onclick="window.triggerPlateLookupBtn(this)">🔍</button>
                                        <label class="btn btn-secondary" title="Identificar carro/matrícula/cor por fotografia"
                                               style="padding:8px 9px; font-size:0.85rem; flex-shrink:0; margin:0; cursor:pointer;">
                                            📷
                                            <input type="file" accept="image/*" capture="environment" style="display:none;"
                                                   onchange="window.handleCarPhotoInput(this)">
                                        </label>
                                    </div>
                                    <input type="text" name="model" list="pt-car-models-list" placeholder="Marca / Modelo" required>
                                    <input type="number" name="year" placeholder="Ano" min="1950" max="2035">
                                    <select name="color" class="vehicle-color-select">
                                        ${this.renderColorOptions('')}
                                    </select>
                                    <button type="submit" class="btn btn-primary">Adicionar</button>
                                </div>
                                <div class="plate-lookup-status" style="font-size:0.76rem; color:var(--text-muted); margin-top:4px; min-height:14px;"></div>
                            </form>
                        </div>
                    </div>

                    <div class="tab-content" id="tab-history" style="display:none;">
                        <div class="table-responsive">
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>Data</th>
                                        <th>Serviço</th>
                                        <th>Estado</th>
                                        <th>Notas/Motivo</th>
                                    </tr>
                                </thead>
                                <tbody id="details-history-list"></tbody>
                            </table>
                        </div>
                    </div>

                    <div class="tab-content" id="tab-inspections" style="display:none;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                            <button id="btn-new-inspection" class="btn btn-primary">+ Nova Inspeção Interativa 3D</button>
                            <span style="font-size:0.85em; color:var(--text-muted);">Registe defeitos painel a painel no modelo 3D do veículo</span>
                        </div>
                        <div id="details-inspections-list" style="overflow-y:auto; max-height:60vh;"></div>
                    </div>
                </div>
            </div>

            <!-- Modal for Interactive 3D Inspection -->
            <div id="modal-inspection" class="modal hidden">
                <div class="modal-content" style="max-width: 1080px; width: 96vw; max-height: 94vh;">
                    <div class="modal-header">
                        <h2>🚘 Inspeção 3D de Painéis e Estado do Veículo</h2>
                        <span class="close-modal-inspection">&times;</span>
                    </div>
                    <form id="form-inspection">
                        <input type="hidden" id="inspection-client-id">

                        <!-- Top Bar: Vehicle Selector & Color Preview -->
                        <div class="inspection-vehicle-bar">
                            <div style="flex: 1; min-width: 220px;">
                                <label style="font-size:0.82rem; color:var(--text-secondary); display:block; margin-bottom:4px;">Veículo Inspecionado</label>
                                <select id="inspection-vehicle-select" style="width:100%; padding:8px 10px; border-radius:6px; background:var(--bg-input); border:1px solid var(--border-color); color:var(--text-primary);"></select>
                            </div>
                            <div style="min-width: 180px;">
                                <label style="font-size:0.82rem; color:var(--text-secondary); display:block; margin-bottom:4px;">Cor do Modelo 3D</label>
                                <select id="inspection-car-color-select" style="width:100%; padding:8px 10px; border-radius:6px; background:var(--bg-input); border:1px solid var(--border-color); color:var(--text-primary);">
                                    ${VEHICLE_COLORS.map(c => `<option value="${c.id}">${c.label}</option>`).join('')}
                                </select>
                            </div>
                            <div style="flex: 2; min-width: 260px;">
                                <label style="font-size:0.82rem; color:var(--text-secondary); display:block; margin-bottom:4px;">Ferramenta Rápida (Opcional - Clique num painel para aplicar ou abrir editor)</label>
                                <div id="quick-defect-toolbar" class="quick-defect-toolbar">
                                    <button type="button" class="defect-tool-pill active" data-tool="">🖱️ Selecionar Painel</button>
                                    ${PANEL_DEFECT_TYPES.map(d => `
                                        <button type="button" class="defect-tool-pill" data-tool="${d.id}" title="${d.label}">
                                            ${d.icon} ${d.label.split(' / ')[0]}
                                        </button>
                                    `).join('')}
                                </div>
                            </div>
                        </div>

                        <div class="inspection-3d-layout">
                            <!-- Left Column: Interactive 3D Car SVG Diagram -->
                            <div class="car-3d-stage">
                                <div class="car-3d-header">
                                    <span id="car-3d-color-indicator" class="vehicle-color-badge"></span>
                                    <span style="font-size:0.78rem; color:var(--text-muted);">Clique em qualquer painel (25 zonas)</span>
                                </div>
                                <div class="car-svg-wrapper">
                                    ${this.buildCar3DSvg('insp')}
                                </div>
                            </div>

                            <!-- Right Column: Active Panel Inspector + Summary + General Checklist + Photos -->
                            <div class="inspection-controls-column">
                                <!-- Active Panel Editor Card -->
                                <div id="panel-editor-card" class="panel-editor-card">
                                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                                        <div>
                                            <span style="font-size:0.75rem; text-transform:uppercase; letter-spacing:1px; color:var(--accent-primary);">Painel Selecionado</span>
                                            <h3 id="selected-panel-title" style="margin:2px 0 0 0; font-size:1.05rem;">Clique num painel do carro 3D 👈</h3>
                                        </div>
                                        <button type="button" id="btn-clear-panel" class="btn btn-danger hidden" style="padding:4px 10px; font-size:0.78rem;">Limpar Painel</button>
                                    </div>
                                    <div id="panel-defect-buttons" class="panel-defect-buttons disabled-area">
                                        ${PANEL_DEFECT_TYPES.map(d => `
                                            <button type="button" class="panel-defect-chip" data-defect="${d.id}">
                                                <span>${d.icon}</span>
                                                <span>${d.label}</span>
                                            </button>
                                        `).join('')}
                                    </div>
                                    <div style="margin-top:10px;">
                                        <input type="text" id="selected-panel-note" placeholder="Nota específica deste painel (ex: Risco fundo de 10cm junto ao puxador)..." disabled
                                               style="width:100%; padding:8px 10px; border-radius:6px; background:var(--bg-input); border:1px solid var(--border-color); color:var(--text-primary); font-size:0.88rem;">
                                    </div>
                                </div>

                                <!-- Marked Panels List -->
                                <div class="marked-panels-box">
                                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                                        <h4 style="margin:0; font-size:0.92rem;">📍 Painéis com Defeitos Assinalados (<span id="marked-panels-count">0</span>)</h4>
                                        <button type="button" id="btn-clear-all-panels" class="btn btn-secondary" style="padding:2px 8px; font-size:0.75rem;">Limpar Mapa</button>
                                    </div>
                                    <div id="panel-defects-summary-list" class="panel-defects-summary-list">
                                        <p style="color:var(--text-muted); font-size:0.85rem; margin:4px 0;">Nenhum painel com defeito assinalado. Clique no modelo 3D para marcar.</p>
                                    </div>
                                </div>

                                <!-- Classic Checklist + Notes + Photos -->
                                <div class="inspection-bottom-grid">
                                    <div class="checklist-section">
                                        <h4 style="margin:0 0 8px 0; font-size:0.92rem;">Checklist Geral</h4>
                                        <div class="form-group checklist-compact">
                                            <label><input type="checkbox" name="defect_scratches"> Riscos / Pintura</label>
                                            <label><input type="checkbox" name="defect_dents"> Amolgadelas</label>
                                            <label><input type="checkbox" name="defect_lights"> Luzes / Faróis</label>
                                            <label><input type="checkbox" name="defect_glass"> Vidros / Para-brisas</label>
                                            <label><input type="checkbox" name="defect_wheels"> Pneus / Jantes</label>
                                            <label><input type="checkbox" name="defect_interior"> Interior (Manchas/Rasgos)</label>
                                            <label><input type="checkbox" name="defect_dashboard_lights"> Luzes de Avaria no Quadrante</label>
                                        </div>
                                    </div>
                                    <div class="photos-section">
                                        <h4 style="margin:0 0 8px 0; font-size:0.92rem;">Notas & Fotos</h4>
                                        <textarea name="notes" rows="3" placeholder="Observações gerais da inspeção..." style="width:100%; padding:8px; border-radius:6px; background:var(--bg-input); border:1px solid var(--border-color); color:var(--text-primary); margin-bottom:8px; font-size:0.88rem;"></textarea>
                                        <label for="inspection-photos" class="btn btn-secondary" style="display:inline-block; cursor:pointer; padding:6px 12px; font-size:0.85rem;">
                                            📷 Adicionar Fotos
                                        </label>
                                        <input type="file" id="inspection-photos" multiple accept="image/*" style="display:none;">
                                        <div id="photos-preview" style="display:flex; flex-wrap:wrap; gap:8px; margin-top:8px;"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="form-actions" style="margin-top:16px;">
                            <button type="button" class="btn btn-secondary close-modal-inspection-btn">Cancelar</button>
                            <button type="submit" class="btn btn-primary">💾 Guardar Inspeção 3D</button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Modal for Viewing Saved 3D Inspection Map -->
            <div id="modal-view-3d-inspection" class="modal hidden" style="z-index: 1050;">
                <div class="modal-content" style="max-width: 760px; width: 94vw;">
                    <div class="modal-header">
                        <h2 id="view-3d-modal-title">Mapa 3D da Inspeção</h2>
                        <span class="close-modal-view-3d" style="cursor:pointer; font-size:24px;">&times;</span>
                    </div>
                    <div style="display:grid; grid-template-columns: 340px 1fr; gap: 20px; align-items: start;">
                        <div class="car-3d-stage" style="padding:10px;">
                            <div id="view-3d-vehicle-badge" style="margin-bottom:8px;"></div>
                            <div class="car-svg-wrapper">
                                ${this.buildCar3DSvg('view')}
                            </div>
                        </div>
                        <div>
                            <h4 style="margin-top:0;">Painéis Registos na Inspeção</h4>
                            <div id="view-3d-panels-list" style="max-height:360px; overflow-y:auto;"></div>
                            <div id="view-3d-notes" style="margin-top:12px; font-size:0.9rem; color:var(--text-secondary);"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modal for Photo Preview -->
            <div id="modal-photo-preview" class="modal hidden" style="z-index: 1100;">
                <div class="modal-content" style="background: transparent; box-shadow: none; border: none; max-width: 90vw; max-height: 90vh; display: flex; justify-content: center; align-items: center;">
                    <span class="close-modal-photo" style="position: absolute; top: 20px; right: 20px; color: white; font-size: 40px; cursor: pointer; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">&times;</span>
                    <img id="preview-image" src="" style="max-width: 100%; max-height: 90vh; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.5);">
                </div>
            </div>
        `;

        this.addStyles();
        this.loadClients();
        this.attachEvents();
    }

    addStyles() {
        let style = document.getElementById('page-styles');
        if (!style) {
            style = document.createElement('style');
            style.id = 'page-styles';
            document.head.appendChild(style);
        }
        style.textContent = `
            .page-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: var(--spacing-lg);
            }
            
            .data-table {
                width: 100%;
                border-collapse: collapse;
            }
            
            .data-table th, .data-table td {
                padding: 12px;
                text-align: left;
                border-bottom: 1px solid var(--border-color);
            }
            
            .data-table th {
                color: var(--text-secondary);
                font-weight: 500;
            }
            
            .modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.75);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
                backdrop-filter: blur(5px);
            }
            
            .hidden {
                display: none !important;
            }
            
            .modal-content {
                background: var(--bg-card);
                padding: 24px;
                border-radius: 12px;
                width: 100%;
                max-width: 500px;
                border: 1px solid var(--border-color);
                box-shadow: var(--shadow-card);
                max-height: 90vh;
                overflow-y: auto;
            }
            
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 16px;
            }
            
            .close-modal, .close-modal-inspection, .close-modal-details {
                cursor: pointer;
                font-size: 24px;
            }
            
            .form-group {
                margin-bottom: 16px;
            }
            
            .form-group label {
                display: block;
                margin-bottom: 8px;
                color: var(--text-secondary);
            }
            
            .form-group input, .vehicle-color-select {
                width: 100%;
                padding: 8px 10px;
                border-radius: 6px;
                border: 1px solid var(--border-color);
                background: var(--bg-input);
                color: var(--text-primary);
            }
            
            .form-actions {
                display: flex;
                justify-content: flex-end;
                gap: 12px;
                margin-top: 24px;
            }
            
            .btn-secondary {
                background: transparent;
                border: 1px solid var(--border-color);
                color: var(--text-primary);
            }

            .btn-danger {
                background-color: rgba(255, 69, 58, 0.12);
                color: var(--accent-danger);
                padding: 6px 12px;
                font-size: 0.9rem;
            }
            .btn-danger:hover {
                background-color: rgba(255, 69, 58, 0.24);
            }
            
            .btn-inspection {
                background-color: rgba(255, 255, 255, 0.1);
                color: var(--text-primary);
                padding: 6px 12px;
                font-size: 0.9rem;
                margin-right: 8px;
            }
            .btn-inspection:hover {
                background-color: rgba(255, 255, 255, 0.2);
            }

            /* Vehicle Color & Year Badges */
            .vehicle-color-badge {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 2px 8px;
                border-radius: 999px;
                font-size: 0.78rem;
                background: rgba(255,255,255,0.07);
                border: 1px solid rgba(255,255,255,0.12);
                color: var(--text-primary);
                vertical-align: middle;
            }
            .vehicle-color-dot {
                width: 10px;
                height: 10px;
                border-radius: 50%;
                border: 1px solid #fff;
                display: inline-block;
            }
            .vehicle-year-badge {
                display: inline-block;
                padding: 1px 6px;
                border-radius: 4px;
                font-size: 0.76rem;
                background: rgba(10, 132, 255, 0.15);
                color: #60a5fa;
                margin-left: 5px;
                font-weight: 600;
            }

            /* Tabs */
            .tabs {
                display: flex;
                border-bottom: 1px solid var(--border-color);
                margin-bottom: 20px;
            }
            .tab-btn {
                padding: 10px 20px;
                background: transparent;
                border: none;
                color: var(--text-secondary);
                cursor: pointer;
                font-size: 1rem;
                border-bottom: 2px solid transparent;
            }
            .tab-btn.active {
                color: var(--accent-primary);
                border-bottom-color: var(--accent-primary);
            }
            .tab-content {
                flex: 1;
                overflow-y: auto;
            }
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin-bottom: 20px;
            }
            .stat-card {
                background: rgba(255,255,255,0.05);
                padding: 20px;
                border-radius: 8px;
                text-align: center;
            }
            .stat-value {
                font-size: 2rem;
                font-weight: bold;
                color: var(--accent-primary);
                margin: 10px 0 0 0;
            }

            /* 3D Car Inspector Layout */
            .inspection-vehicle-bar {
                display: flex;
                flex-wrap: wrap;
                gap: 12px;
                background: rgba(255,255,255,0.03);
                border: 1px solid var(--border-color);
                padding: 12px;
                border-radius: 10px;
                margin-bottom: 16px;
                align-items: flex-end;
            }
            .quick-defect-toolbar {
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
            }
            .defect-tool-pill {
                padding: 5px 10px;
                border-radius: 999px;
                border: 1px solid var(--border-color);
                background: rgba(255,255,255,0.04);
                color: var(--text-secondary);
                font-size: 0.78rem;
                cursor: pointer;
                transition: all 0.15s ease;
            }
            .defect-tool-pill:hover {
                background: rgba(255,255,255,0.1);
                color: var(--text-primary);
            }
            .defect-tool-pill.active {
                background: rgba(10, 132, 255, 0.22);
                border-color: var(--accent-primary);
                color: #fff;
                font-weight: 600;
            }

            .inspection-3d-layout {
                display: grid;
                grid-template-columns: 350px 1fr;
                gap: 20px;
                align-items: start;
            }
            @media (max-width: 860px) {
                .inspection-3d-layout {
                    grid-template-columns: 1fr;
                }
            }

            .car-3d-stage {
                background: radial-gradient(circle at 50% 45%, rgba(30, 41, 59, 0.75), rgba(9, 13, 22, 0.95));
                border: 1px solid var(--border-color);
                border-radius: 12px;
                padding: 12px;
                display: flex;
                flex-direction: column;
                align-items: center;
            }
            .car-3d-header {
                width: 100%;
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;
            }
            .car-svg-wrapper {
                width: 100%;
                max-width: 330px;
            }
            .car-3d-svg {
                width: 100%;
                height: auto;
                display: block;
                user-select: none;
            }
            .car-panel {
                cursor: pointer;
                transition: filter 0.18s ease, stroke-width 0.18s ease, stroke 0.18s ease;
            }
            .car-panel:hover {
                filter: brightness(1.22);
                stroke: #38bdf8 !important;
                stroke-width: 2.2px !important;
            }
            .car-panel.panel-selected {
                stroke: #0a84ff !important;
                stroke-width: 3px !important;
                filter: brightness(1.25) drop-shadow(0 0 6px rgba(10, 132, 255, 0.75));
            }
            .car-panel.panel-has-defect {
                stroke-width: 2.5px !important;
            }

            .inspection-controls-column {
                display: flex;
                flex-direction: column;
                gap: 14px;
            }
            .panel-editor-card {
                background: rgba(255,255,255,0.04);
                border: 1px solid var(--border-color);
                border-radius: 10px;
                padding: 14px;
            }
            .panel-defect-buttons {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(175px, 1fr));
                gap: 8px;
            }
            .panel-defect-buttons.disabled-area {
                opacity: 0.45;
                pointer-events: none;
            }
            .panel-defect-chip {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 10px;
                border-radius: 8px;
                border: 1px solid var(--border-color);
                background: rgba(255,255,255,0.03);
                color: var(--text-primary);
                font-size: 0.83rem;
                cursor: pointer;
                text-align: left;
                transition: all 0.15s ease;
            }
            .panel-defect-chip:hover {
                background: rgba(255,255,255,0.09);
            }
            .panel-defect-chip.active {
                background: rgba(255, 69, 58, 0.22);
                border-color: #ff453a;
                font-weight: 600;
                box-shadow: 0 0 0 1px rgba(255, 69, 58, 0.4);
            }

            .marked-panels-box {
                background: rgba(255,255,255,0.03);
                border: 1px solid var(--border-color);
                border-radius: 10px;
                padding: 12px;
            }
            .panel-defects-summary-list {
                max-height: 155px;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
                gap: 6px;
            }
            .marked-panel-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 8px;
                padding: 6px 10px;
                border-radius: 6px;
                background: rgba(255,255,255,0.04);
                border-left: 3px solid var(--accent-danger);
                font-size: 0.84rem;
                cursor: pointer;
            }
            .marked-panel-row:hover {
                background: rgba(255,255,255,0.08);
            }

            .inspection-bottom-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 14px;
                background: rgba(255,255,255,0.02);
                border: 1px solid var(--border-color);
                border-radius: 10px;
                padding: 12px;
            }
            .checklist-compact label {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 5px;
                font-size: 0.86rem;
                cursor: pointer;
            }
            .checklist-compact input[type="checkbox"] {
                width: auto;
            }
        `;
    }

    applyCar3DColor(colorName, prefix = 'insp') {
        const meta = this.getColorMeta(colorName);
        const svg = document.getElementById(`${prefix}-car-svg`);
        if (!svg) return;

        svg.querySelectorAll('.car-stop-shadow').forEach(el => el.setAttribute('stop-color', meta.shadow));
        svg.querySelectorAll('.car-stop-base').forEach(el => el.setAttribute('stop-color', meta.hex));
        svg.querySelectorAll('.car-stop-highlight').forEach(el => el.setAttribute('stop-color', meta.highlight));

        if (prefix === 'insp') {
            const indicator = document.getElementById('car-3d-color-indicator');
            if (indicator) {
                indicator.innerHTML = `<span class="vehicle-color-dot" style="background:${meta.hex}; border-color:${meta.border};"></span> ${meta.label}`;
            }
        }
    }

    renderCar3DMarkers(panelDefects = {}, prefix = 'insp') {
        const svg = document.getElementById(`${prefix}-car-svg`);
        const markersLayer = document.getElementById(`${prefix}-markers-layer`);
        if (!svg || !markersLayer) return;

        markersLayer.innerHTML = '';

        svg.querySelectorAll('.car-panel').forEach(panelEl => {
            const pid = panelEl.dataset.panel;
            const entry = panelDefects[pid];
            const hasDefects = entry && ((entry.types && entry.types.length > 0) || (entry.note && entry.note.trim()));

            panelEl.classList.toggle('panel-has-defect', Boolean(hasDefects));
            if (prefix === 'insp') {
                panelEl.classList.toggle('panel-selected', pid === this.selectedPanelId);
            }

            if (hasDefects) {
                const firstType = entry.types && entry.types.length > 0
                    ? PANEL_DEFECT_TYPES.find(t => t.id === entry.types[0])
                    : null;
                const badgeColor = firstType ? firstType.color : '#ff453a';
                panelEl.style.stroke = badgeColor;

                const meta = CAR_PANELS.find(p => p.id === pid);
                if (meta) {
                    const count = (entry.types ? entry.types.length : 0) || 1;
                    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                    g.innerHTML = `
                        <circle cx="${meta.cx}" cy="${meta.cy}" r="10" fill="${badgeColor}" stroke="#ffffff" stroke-width="1.5" />
                        <text x="${meta.cx}" y="${meta.cy + 3.5}" text-anchor="middle" fill="#ffffff" font-size="10" font-weight="bold">${count}</text>
                    `;
                    markersLayer.appendChild(g);
                }
            } else {
                panelEl.style.stroke = '';
            }
        });
    }

    selectCarPanel(panelId) {
        this.selectedPanelId = panelId;
        const panelMeta = CAR_PANELS.find(p => p.id === panelId);
        const titleEl = document.getElementById('selected-panel-title');
        const buttonsBox = document.getElementById('panel-defect-buttons');
        const noteInput = document.getElementById('selected-panel-note');
        const clearBtn = document.getElementById('btn-clear-panel');

        if (!panelMeta) {
            titleEl.textContent = 'Clique num painel do carro 3D 👈';
            buttonsBox.classList.add('disabled-area');
            noteInput.disabled = true;
            noteInput.value = '';
            clearBtn.classList.add('hidden');
            this.renderCar3DMarkers(this.currentPanelDefects, 'insp');
            return;
        }

        titleEl.textContent = panelMeta.name;
        buttonsBox.classList.remove('disabled-area');
        noteInput.disabled = false;

        const currentEntry = this.currentPanelDefects[panelId] || { name: panelMeta.name, types: [], note: '' };
        noteInput.value = currentEntry.note || '';

        const hasAny = (currentEntry.types && currentEntry.types.length > 0) || (currentEntry.note && currentEntry.note.trim());
        clearBtn.classList.toggle('hidden', !hasAny);

        buttonsBox.querySelectorAll('.panel-defect-chip').forEach(btn => {
            const dId = btn.dataset.defect;
            btn.classList.toggle('active', currentEntry.types && currentEntry.types.includes(dId));
        });

        this.renderCar3DMarkers(this.currentPanelDefects, 'insp');
    }

    togglePanelDefectType(panelId, defectId) {
        if (!panelId) return;
        const panelMeta = CAR_PANELS.find(p => p.id === panelId);
        if (!panelMeta) return;

        if (!this.currentPanelDefects[panelId]) {
            this.currentPanelDefects[panelId] = { name: panelMeta.name, types: [], note: '' };
        }

        const entry = this.currentPanelDefects[panelId];
        const idx = entry.types.indexOf(defectId);
        if (idx === -1) {
            entry.types.push(defectId);
        } else {
            entry.types.splice(idx, 1);
        }

        if (entry.types.length === 0 && (!entry.note || !entry.note.trim())) {
            delete this.currentPanelDefects[panelId];
        }

        this.syncChecklistFromPanels();
        this.selectCarPanel(panelId);
        this.renderMarkedPanelsSummary();
    }

    updatePanelNote(panelId, noteText) {
        if (!panelId) return;
        const panelMeta = CAR_PANELS.find(p => p.id === panelId);
        if (!panelMeta) return;

        if (!this.currentPanelDefects[panelId]) {
            this.currentPanelDefects[panelId] = { name: panelMeta.name, types: [], note: '' };
        }
        this.currentPanelDefects[panelId].note = noteText;

        const entry = this.currentPanelDefects[panelId];
        if ((!entry.types || entry.types.length === 0) && (!entry.note || !entry.note.trim())) {
            delete this.currentPanelDefects[panelId];
        }

        this.renderCar3DMarkers(this.currentPanelDefects, 'insp');
        this.renderMarkedPanelsSummary();
    }

    syncChecklistFromPanels() {
        const form = document.getElementById('form-inspection');
        if (!form) return;

        const activeChecklistKeys = new Set();
        Object.values(this.currentPanelDefects).forEach(entry => {
            (entry.types || []).forEach(tId => {
                const dMeta = PANEL_DEFECT_TYPES.find(d => d.id === tId);
                if (dMeta && dMeta.checklistKey) {
                    activeChecklistKeys.add(dMeta.checklistKey);
                }
            });
        });

        activeChecklistKeys.forEach(chkName => {
            const checkbox = form.elements[chkName];
            if (checkbox) checkbox.checked = true;
        });
    }

    renderMarkedPanelsSummary() {
        const listEl = document.getElementById('panel-defects-summary-list');
        const countEl = document.getElementById('marked-panels-count');
        if (!listEl || !countEl) return;

        const entries = Object.entries(this.currentPanelDefects);
        countEl.textContent = entries.length;

        if (entries.length === 0) {
            listEl.innerHTML = `<p style="color:var(--text-muted); font-size:0.85rem; margin:4px 0;">Nenhum painel com defeito assinalado. Clique no modelo 3D para marcar.</p>`;
            return;
        }

        listEl.innerHTML = entries.map(([pid, data]) => {
            const badges = (data.types || []).map(tId => {
                const meta = PANEL_DEFECT_TYPES.find(d => d.id === tId);
                return meta ? `<span style="font-size:0.78rem; background:rgba(255,255,255,0.08); padding:2px 6px; border-radius:4px;">${meta.icon} ${meta.label}</span>` : '';
            }).join(' ');

            return `
                <div class="marked-panel-row" onclick="window.focusInspectorPanel('${pid}')">
                    <div>
                        <strong>${data.name}</strong>
                        <div style="display:flex; flex-wrap:wrap; gap:4px; margin-top:3px;">${badges}</div>
                        ${data.note ? `<div style="font-size:0.78rem; color:var(--text-muted); margin-top:2px;">📝 "${data.note}"</div>` : ''}
                    </div>
                    <button type="button" class="btn btn-danger" style="padding:2px 8px; font-size:0.75rem;" onclick="event.stopPropagation(); window.removeInspectorPanel('${pid}')">✕</button>
                </div>
            `;
        }).join('');
    }

    loadClients(filter = '') {
        const clients = store.getClients();
        const tbody = document.getElementById('clients-list');

        const filteredClients = clients.filter(client => {
            const searchTerm = filter.toLowerCase();
            const nameMatch = client.name.toLowerCase().includes(searchTerm);
            const phoneMatch = client.phone.includes(searchTerm);
            const vehicleMatch = client.vehicles && client.vehicles.some(v =>
                v.model.toLowerCase().includes(searchTerm) ||
                (v.plate && v.plate.toLowerCase().includes(searchTerm)) ||
                (v.year && String(v.year).toLowerCase().includes(searchTerm)) ||
                (v.color && v.color.toLowerCase().includes(searchTerm))
            );

            return nameMatch || phoneMatch || vehicleMatch;
        });

        if (filteredClients.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 20px; color: var(--text-muted);">Nenhum cliente encontrado.</td></tr>';
            return;
        }

        tbody.innerHTML = filteredClients.map(client => {
            const vehiclesCount = client.vehicles ? client.vehicles.length : 0;
            let primaryVehicle = '-';
            if (vehiclesCount > 0) {
                const v0 = client.vehicles[0];
                const resolvedYear = v0.year || (typeof PlateLookupService !== 'undefined' && v0.plate ? PlateLookupService.estimateYearFromPlate(v0.plate) : '');
                const resolvedColor = v0.color || (typeof PlateLookupService !== 'undefined' && v0.model ? PlateLookupService.inferColorFromModelName(v0.model) : '');
                const yearHtml = resolvedYear ? `<span class="vehicle-year-badge">${resolvedYear}</span>` : '';
                const colorHtml = resolvedColor ? `<span style="margin-left:6px;">${this.renderColorBadge(resolvedColor)}</span>` : '';
                primaryVehicle = `<strong>${v0.model}</strong> ${yearHtml} ${colorHtml}`;
            }
            const vehicleDisplay = vehiclesCount > 1
                ? `${primaryVehicle} <span style="font-size:0.8em; color:var(--text-muted); margin-left:4px;">+${vehiclesCount - 1}</span>`
                : primaryVehicle;

            return `
            <tr>
                <td>${client.name}</td>
                <td>${client.phone}</td>
                <td>${vehicleDisplay}</td>
                <td>${vehiclesCount > 0 ? client.vehicles[0].plate || '-' : '-'}</td>
                <td>
                    <button class="btn btn-secondary" style="margin-right:5px; padding:6px 12px; font-size:0.9rem;" onclick="window.editClient('${client.id}')">✏️ Editar</button>
                    <button class="btn btn-inspection" onclick="window.openClientDetails('${client.id}')">📂 Ficha</button>
                    <button class="btn btn-danger" onclick="window.deleteClient('${client.id}')">Remover</button>
                </td>
            </tr>
            `;
        }).join('');

        // Expose delete function globally
        window.deleteClient = (id) => {
            if (confirm('Tem a certeza que deseja remover este cliente?')) {
                store.deleteClient(id);
                this.loadClients(document.getElementById('client-search').value);
            }
        };

        // Expose edit function globally
        window.editClient = (id) => {
            const client = store.getClients().find(c => c.id === id);
            if (!client) return;

            document.getElementById('modal-client-title').textContent = 'Editar Cliente';
            document.getElementById('client-id').value = client.id;

            const form = document.getElementById('form-client');
            form.elements['name'].value = client.name;
            form.elements['phone'].value = client.phone;

            const container = document.getElementById('new-client-vehicles-container');
            container.innerHTML = '';

            if (client.vehicles && client.vehicles.length > 0) {
                container.innerHTML = client.vehicles.map((v, idx) =>
                    this.createVehicleEntryHtml(v, idx > 0 || client.vehicles.length > 1)
                ).join('');
            } else {
                container.innerHTML = this.createVehicleEntryHtml({}, false);
            }

            document.getElementById('modal-client').classList.remove('hidden');
        };

        // Expose open details function
        window.openClientDetails = (clientId) => {
            this.currentClientId = clientId;
            const client = store.getClients().find(c => c.id === clientId);
            if (!client) return;

            document.getElementById('details-client-name').textContent = client.name;
            document.getElementById('modal-client-details').classList.remove('hidden');

            this.loadClientStats(clientId);
            this.loadClientVehicles(clientId);
            this.loadClientHistory(clientId);
            this.loadClientInspections(clientId);
        };
    }

    loadClientVehicles(clientId) {
        const client = store.getClients().find(c => c.id === clientId);
        const container = document.getElementById('details-vehicles-list');

        if (!client || !client.vehicles || client.vehicles.length === 0) {
            container.innerHTML = '<p>Sem veículos registados.</p>';
            return;
        }

        container.innerHTML = client.vehicles.map((v, index) => {
            const resolvedYear = v.year || (typeof PlateLookupService !== 'undefined' && v.plate ? (PlateLookupService.estimateYearFromPlate(v.plate) || '') : '');
            const resolvedColor = v.color || (typeof PlateLookupService !== 'undefined' && v.model ? (PlateLookupService.inferColorFromModelName(v.model) || '') : '');
            return `
            <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.05); padding:12px; border-radius:8px; margin-bottom:8px; gap:10px; flex-wrap:wrap;">
                <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
                    <strong style="font-size:1.02rem;">${v.model}</strong>
                    <span style="color:var(--text-secondary); font-size:0.9em; background:rgba(255,255,255,0.06); padding:2px 8px; border-radius:4px;">${v.plate || 'Sem Matrícula'}</span>
                    ${resolvedYear ? `<span class="vehicle-year-badge">Ano: ${resolvedYear}</span>` : ''}
                    ${resolvedColor ? this.renderColorBadge(resolvedColor) : ''}
                </div>
                <div style="display:flex; gap:8px; align-items:center;">
                    <select onchange="window.updateClientVehicleColor('${clientId}', ${index}, this.value)" class="vehicle-color-select" style="width:auto; padding:4px 8px; font-size:0.82rem;">
                        ${this.renderColorOptions(resolvedColor)}
                    </select>
                    <input type="number" value="${resolvedYear}" placeholder="Ano" min="1950" max="2035"
                           onchange="window.updateClientVehicleYear('${clientId}', ${index}, this.value)"
                           style="width:78px; padding:4px 8px; font-size:0.82rem; border-radius:6px; border:1px solid var(--border-color); background:var(--bg-input); color:var(--text-primary);">
                    <button class="btn btn-danger" style="padding:4px 8px; font-size:0.8em;" onclick="window.removeClientVehicle('${clientId}', ${index})">Remover</button>
                </div>
            </div>
        `}).join('');

        window.updateClientVehicleColor = (cId, vIndex, newColor) => {
            const c = store.getClients().find(cl => cl.id === cId);
            if (c && c.vehicles && c.vehicles[vIndex]) {
                c.vehicles[vIndex].color = newColor;
                store.updateClient(c);
                this.loadClientVehicles(cId);
                this.loadClients(document.getElementById('client-search').value);
            }
        };

        window.updateClientVehicleYear = (cId, vIndex, newYear) => {
            const c = store.getClients().find(cl => cl.id === cId);
            if (c && c.vehicles && c.vehicles[vIndex]) {
                c.vehicles[vIndex].year = newYear.trim();
                store.updateClient(c);
                this.loadClientVehicles(cId);
                this.loadClients(document.getElementById('client-search').value);
            }
        };

        window.removeClientVehicle = (cId, vIndex) => {
            if (confirm('Remover este veículo?')) {
                const c = store.getClients().find(cl => cl.id === cId);
                c.vehicles.splice(vIndex, 1);
                store.updateClient(c);
                this.loadClientVehicles(cId);
                this.loadClients(document.getElementById('client-search').value);
            }
        };
    }

    loadClientStats(clientId) {
        const appointments = store.getAppointments().filter(a => a.clientId === clientId && (a.status === 'completed' || a.status === 'paid'));
        const services = store.getServices();

        // Total Washes
        document.getElementById('stat-total-washes').textContent = appointments.length;

        let totalSpent = 0;
        const serviceCounts = {};

        appointments.forEach(appt => {
            let price = 0;
            if (appt.finalPrice !== undefined && appt.finalPrice !== null && appt.finalPrice !== '') {
                price = parseFloat(appt.finalPrice);
            } else {
                if (appt.serviceIds && appt.serviceIds.length > 0) {
                    appt.serviceIds.forEach(id => {
                        const s = services.find(srv => srv.id === id);
                        if (s) price += parseFloat(s.price);
                    });
                } else if (appt.serviceId) {
                    const s = services.find(srv => srv.id === appt.serviceId);
                    if (s) price += parseFloat(s.price);
                }
            }
            totalSpent += price;

            if (appt.serviceIds && appt.serviceIds.length > 0) {
                appt.serviceIds.forEach(id => {
                    const s = services.find(srv => srv.id === id);
                    const name = s ? s.name : 'Serviço Removido';
                    serviceCounts[name] = (serviceCounts[name] || 0) + 1;
                });
            } else {
                const service = services.find(s => s.id === appt.serviceId);
                const serviceName = service ? service.name : (appt.serviceId ? 'Serviço Removido' : 'Desconhecido');
                if (appt.serviceId || service) {
                    serviceCounts[serviceName] = (serviceCounts[serviceName] || 0) + 1;
                }
            }
        });

        document.getElementById('stat-total-spent').textContent = totalSpent.toFixed(2) + '€';

        const servicesList = document.getElementById('stat-services-list');
        servicesList.innerHTML = Object.entries(serviceCounts)
            .map(([name, count]) => `
                <div style="display:flex; justify-content:space-between; padding:8px; border-bottom:1px solid var(--border-color);">
                    <span>${name}</span>
                    <span style="font-weight:bold;">${count}</span>
                </div>
            `).join('');
    }

    loadClientHistory(clientId) {
        const appointments = store.getAppointments().filter(a => a.clientId === clientId);
        const services = store.getServices();
        const tbody = document.getElementById('details-history-list');

        appointments.sort((a, b) => new Date(b.date) - new Date(a.date));

        tbody.innerHTML = appointments.map(appt => {
            let serviceName = 'Serviço Removido';

            if (appt.serviceIds && appt.serviceIds.length > 0) {
                serviceName = appt.serviceIds.map(id => {
                    const s = services.find(srv => srv.id === id);
                    return s ? s.name : 'Serviço Removido';
                }).join(', ');
            } else {
                const service = services.find(s => s.id === appt.serviceId);
                if (service) serviceName = service.name;
            }
            const date = new Date(appt.date).toLocaleDateString('pt-PT');

            let statusText = appt.status;
            let statusColor = 'var(--text-secondary)';
            let notes = appt.notes || '';

            if (appt.status === 'cancelled') {
                statusText = 'Cancelado';
                statusColor = 'var(--accent-danger)';
                notes = `<strong>Motivo:</strong> ${appt.cancellationReason || '-'} <br> 
                         <small>(${appt.isJustified ? 'Justificado' : 'Não Justificado'})</small>`;
            } else if (appt.status === 'completed' || appt.status === 'paid') {
                statusText = 'Concluído';
                statusColor = 'var(--accent-success)';
            } else {
                statusText = 'Agendado';
                statusColor = 'var(--accent-secondary)';
            }

            return `
                <tr>
                    <td>${date}</td>
                    <td>${serviceName}</td>
                    <td style="color:${statusColor}; font-weight:500;">${statusText}</td>
                    <td style="font-size:0.9em; color:var(--text-muted);">${notes}</td>
                </tr>
            `;
        }).join('');
    }

    loadClientInspections(clientId) {
        const inspections = [...store.getInspectionsByClientId(clientId)].sort((a, b) => new Date(b.date) - new Date(a.date));
        const container = document.getElementById('details-inspections-list');

        if (inspections.length === 0) {
            container.innerHTML = '<p style="color:var(--text-muted); font-size:0.9em; text-align:center; padding:20px;">Sem inspeções anteriores.</p>';
            return;
        }

        const defectLabels = {
            defect_scratches: 'Riscos / Pintura',
            defect_dents: 'Amolgadelas',
            defect_lights: 'Luzes / Faróis',
            defect_glass: 'Vidros / Para-brisas',
            defect_wheels: 'Pneus / Jantes',
            defect_interior: 'Interior',
            defect_dashboard_lights: 'Luzes Quadrante'
        };

        container.innerHTML = inspections.map(insp => {
            const date = new Date(insp.date).toLocaleDateString('pt-PT');
            const defects = Object.entries(insp.defects || {})
                .filter(([_, val]) => val)
                .map(([key, _]) => defectLabels[key] || key.replace('defect_', ''))
                .join(', ');

            const panelEntries = Object.entries(insp.panelDefects || {});
            const panelBadgesHtml = panelEntries.length > 0
                ? `<div style="margin:8px 0; display:flex; flex-wrap:wrap; gap:6px;">
                    ${panelEntries.map(([_, pData]) => {
                        const icons = (pData.types || []).map(tId => {
                            const m = PANEL_DEFECT_TYPES.find(d => d.id === tId);
                            return m ? m.icon : '🔴';
                        }).join('');
                        return `<span style="font-size:0.8rem; background:rgba(255,69,58,0.14); border:1px solid rgba(255,69,58,0.35); padding:3px 8px; border-radius:6px;">
                            ${icons} <strong>${pData.name}</strong>${pData.note ? `: ${pData.note}` : ''}
                        </span>`;
                    }).join('')}
                   </div>`
                : '';

            const vehicleHeader = insp.vehicleModel
                ? `<span style="margin-left:8px; font-size:0.85rem; color:var(--text-secondary);">
                    🚗 ${insp.vehicleModel} ${insp.vehiclePlate ? `(${insp.vehiclePlate})` : ''}
                    ${insp.vehicleYear ? `<span class="vehicle-year-badge">${insp.vehicleYear}</span>` : ''}
                    ${insp.vehicleColor ? this.renderColorBadge(insp.vehicleColor) : ''}
                   </span>`
                : '';

            return `
                <div style="background:rgba(255,255,255,0.05); padding:15px; border-radius:8px; margin-bottom:15px; border:1px solid rgba(255,255,255,0.06);">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; flex-wrap:wrap; gap:8px;">
                        <div>
                            <strong>📅 ${date}</strong>
                            ${vehicleHeader}
                        </div>
                        <div style="display:flex; align-items:center; gap:8px;">
                            <button type="button" class="btn btn-secondary" style="padding:4px 10px; font-size:0.8rem;" onclick="window.viewInspection3DMap('${insp.id}')">
                                🚘 Ver Mapa 3D (${panelEntries.length} painéis)
                            </button>
                            <span style="font-size:0.8em; color:var(--text-muted);">${(insp.photos || []).length} fotos</span>
                        </div>
                    </div>
                    ${panelBadgesHtml}
                    <div style="font-size:0.9em; color:var(--text-secondary); margin-bottom:5px;"><strong>Checklist Geral:</strong> ${defects || 'Nenhum'}</div>
                    ${insp.notes ? `<div style="font-size:0.9em; color:var(--text-muted); margin-bottom:10px; font-style:italic;">"${insp.notes}"</div>` : ''}
                    <div style="display:flex; gap:10px; overflow-x:auto; padding-bottom:5px;">
                        ${(insp.photos || []).map(p => `<img src="${p}" style="height:60px; border-radius:4px; cursor:pointer;" onclick="window.openPhotoPreview('${p}')">`).join('')}
                    </div>
                </div>
            `;
        }).join('');
    }

    loadInspectionHistory(clientId) {
        this.loadClientInspections(clientId);
    }

    attachEvents() {
        // Search Event
        const searchInput = document.getElementById('client-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.loadClients(e.target.value);
            });
        }

        // Plate Lookup & Camera AI Helpers (Solution C)
        const applyVehicleLookupResult = (entryEl, data, isAuto = false) => {
            if (!entryEl || !data) return;
            const plateInput = entryEl.querySelector('input[name="plate[]"], input[name="plate"]');
            const modelInput = entryEl.querySelector('input[name="vehicle[]"], input[name="model"]');
            const yearInput = entryEl.querySelector('input[name="year[]"], input[name="year"]');
            const colorSelect = entryEl.querySelector('select[name="color[]"], select[name="color"]');
            const statusEl = entryEl.querySelector('.plate-lookup-status');

            if (plateInput && data.plate) plateInput.value = data.plate;
            if (modelInput && data.model && (!isAuto || !modelInput.value.trim())) {
                modelInput.value = data.model;
            }
            if (yearInput && data.year) {
                yearInput.value = data.year;
            }
            if (colorSelect && data.color) {
                colorSelect.value = data.color;
            }

            if (statusEl) {
                const parts = [];
                if (data.model) parts.push(`🚗 <strong>${data.model}</strong>`);
                if (data.year) parts.push(`📅 Ano <strong>${data.year}</strong>`);
                if (data.color) parts.push(`🎨 Cor <strong>${data.color}</strong>`);
                if (parts.length > 0) {
                    statusEl.innerHTML = `<span style="color:#30d158;">✅ ${parts.join(' · ')} <span style="opacity:0.75;">(${data.source || 'Automático'})</span></span>`;
                } else if (!isAuto) {
                    statusEl.innerHTML = `<span style="color:#ffd60a;">ℹ️ Marca/Modelo não consta no catálogo público gratuito. Selecione na lista ou use o botão 📷 Foto IA.</span>`;
                }
            }
        };

        window.handlePlateInput = async (inputEl) => {
            if (typeof PlateLookupService === 'undefined') return;
            const raw = inputEl.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
            if (raw.length === 6) {
                const formatted = `${raw.slice(0, 2)}-${raw.slice(2, 4)}-${raw.slice(4, 6)}`;
                if (inputEl.value !== formatted) {
                    inputEl.value = formatted;
                }
                const entryEl = inputEl.closest('.vehicle-entry');
                const statusEl = entryEl ? entryEl.querySelector('.plate-lookup-status') : null;

                // Instant offline IMT year + local memory lookup
                const instantYear = PlateLookupService.estimateYearFromPlate(formatted);
                const localHit = PlateLookupService.lookupInLocalDatabase(formatted);
                if (localHit) {
                    applyVehicleLookupResult(entryEl, localHit, true);
                    return;
                }

                if (instantYear) {
                    applyVehicleLookupResult(entryEl, {
                        plate: formatted,
                        year: instantYear,
                        source: 'Série IMT Portugal'
                    }, true);
                }

                if (statusEl) {
                    statusEl.innerHTML = `<span style="color:#60a5fa;">🔄 Ano ${instantYear || ''} calculado. A procurar Marca/Modelo para ${formatted}...</span>`;
                }

                const onlineData = await PlateLookupService.lookupPlate(formatted);
                applyVehicleLookupResult(entryEl, onlineData, true);
            }
        };

        window.triggerPlateLookupBtn = async (btnEl) => {
            if (typeof PlateLookupService === 'undefined') return;
            const entryEl = btnEl.closest('.vehicle-entry');
            if (!entryEl) return;
            const plateInput = entryEl.querySelector('input[name="plate[]"], input[name="plate"]');
            const statusEl = entryEl.querySelector('.plate-lookup-status');
            if (!plateInput || !plateInput.value.trim()) {
                if (statusEl) statusEl.innerHTML = `<span style="color:#ff9f0a;">⚠️ Digite primeiro a matrícula (ex: AA-00-AA).</span>`;
                return;
            }
            const formatted = PlateLookupService.normalizePlate(plateInput.value);
            plateInput.value = formatted;
            if (statusEl) statusEl.innerHTML = `<span style="color:#60a5fa;">🔍 A consultar base de dados para <strong>${formatted}</strong>...</span>`;
            const data = await PlateLookupService.lookupPlate(formatted);
            applyVehicleLookupResult(entryEl, data, false);
        };

        window.handleCarPhotoInput = async (fileInputEl) => {
            if (typeof PlateLookupService === 'undefined') return;
            const file = fileInputEl.files && fileInputEl.files[0];
            if (!file) return;
            const entryEl = fileInputEl.closest('.vehicle-entry');
            const statusEl = entryEl ? entryEl.querySelector('.plate-lookup-status') : null;
            if (statusEl) {
                statusEl.innerHTML = `<span style="color:#60a5fa;">📷 A analisar fotografia do veículo (Cor / Marca / Matrícula)...</span>`;
            }
            try {
                const result = await PlateLookupService.analyzeCarPhoto(file);
                applyVehicleLookupResult(entryEl, result, false);
            } catch (err) {
                console.error(err);
                if (statusEl) statusEl.innerHTML = `<span style="color:#ff453a;">Erro ao analisar imagem.</span>`;
            }
            fileInputEl.value = '';
        };

        // Global helpers for 3D Car Inspector
        window.focusInspectorPanel = (panelId) => {
            this.selectCarPanel(panelId);
        };

        window.removeInspectorPanel = (panelId) => {
            delete this.currentPanelDefects[panelId];
            if (this.selectedPanelId === panelId) {
                this.selectCarPanel(panelId);
            } else {
                this.renderCar3DMarkers(this.currentPanelDefects, 'insp');
            }
            this.renderMarkedPanelsSummary();
        };

        window.viewInspection3DMap = (inspectionId) => {
            const insp = store.getInspections().find(i => i.id === inspectionId);
            if (!insp) return;

            const modal = document.getElementById('modal-view-3d-inspection');
            const dateStr = new Date(insp.date).toLocaleDateString('pt-PT');
            document.getElementById('view-3d-modal-title').textContent = `Mapa 3D da Inspeção (${dateStr})`;

            const colorToUse = insp.vehicleColor || 'Cinzento Prata';
            this.applyCar3DColor(colorToUse, 'view');
            this.renderCar3DMarkers(insp.panelDefects || {}, 'view');

            const badgeBox = document.getElementById('view-3d-vehicle-badge');
            badgeBox.innerHTML = `
                <div style="display:flex; align-items:center; justify-content:space-between; width:100%; gap:8px;">
                    <strong>${insp.vehicleModel || 'Veículo'} ${insp.vehiclePlate ? `(${insp.vehiclePlate})` : ''}</strong>
                    ${this.renderColorBadge(colorToUse)}
                </div>
            `;

            const entries = Object.entries(insp.panelDefects || {});
            const listBox = document.getElementById('view-3d-panels-list');
            if (entries.length === 0) {
                listBox.innerHTML = `<p style="color:var(--text-muted);">Nenhum defeito localizado em painéis específicos nesta inspeção.</p>`;
            } else {
                listBox.innerHTML = entries.map(([_, data]) => {
                    const badges = (data.types || []).map(tId => {
                        const meta = PANEL_DEFECT_TYPES.find(d => d.id === tId);
                        return meta ? `<span style="font-size:0.78rem; background:rgba(255,255,255,0.08); padding:2px 6px; border-radius:4px;">${meta.icon} ${meta.label}</span>` : '';
                    }).join(' ');
                    return `
                        <div class="marked-panel-row" style="cursor:default; margin-bottom:8px;">
                            <div>
                                <strong>${data.name}</strong>
                                <div style="display:flex; flex-wrap:wrap; gap:4px; margin-top:4px;">${badges}</div>
                                ${data.note ? `<div style="font-size:0.82rem; color:var(--text-muted); margin-top:3px;">📝 "${data.note}"</div>` : ''}
                            </div>
                        </div>
                    `;
                }).join('');
            }

            document.getElementById('view-3d-notes').innerHTML = insp.notes
                ? `<strong>Notas Gerais:</strong> "${insp.notes}"`
                : '';

            modal.classList.remove('hidden');
        };

        const closeView3DBtn = document.querySelector('.close-modal-view-3d');
        const modalView3D = document.getElementById('modal-view-3d-inspection');
        if (closeView3DBtn && modalView3D) {
            closeView3DBtn.addEventListener('click', () => modalView3D.classList.add('hidden'));
            modalView3D.addEventListener('click', (e) => {
                if (e.target === modalView3D) modalView3D.classList.add('hidden');
            });
        }

        // Photo Preview Logic
        window.openPhotoPreview = (src) => {
            const modal = document.getElementById('modal-photo-preview');
            const img = document.getElementById('preview-image');
            img.src = src;
            modal.classList.remove('hidden');
        };

        if (!window.photoPreviewEventsAttached) {
            const modal = document.getElementById('modal-photo-preview');
            const closeBtn = document.querySelector('.close-modal-photo');

            const closeModal = () => {
                modal.classList.add('hidden');
                document.getElementById('preview-image').src = '';
            };

            closeBtn.addEventListener('click', closeModal);
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeModal();
            });

            window.photoPreviewEventsAttached = true;
        }

        // Client Modal Events
        const modalClient = document.getElementById('modal-client');
        const btnAddClient = document.getElementById('btn-add-client');
        const btnCloseClient = document.querySelector('.close-modal');
        const btnCancelClient = document.querySelector('.close-modal-btn');
        const formClient = document.getElementById('form-client');

        const openClientModal = () => {
            document.getElementById('modal-client-title').textContent = 'Novo Cliente';
            document.getElementById('client-id').value = '';
            formClient.reset();
            document.getElementById('new-client-vehicles-container').innerHTML = this.createVehicleEntryHtml({}, false);
            modalClient.classList.remove('hidden');
        };
        const closeClientModal = () => modalClient.classList.add('hidden');

        const btnAddVehicleField = document.getElementById('btn-add-vehicle-field');
        btnAddVehicleField.addEventListener('click', () => {
            const container = document.getElementById('new-client-vehicles-container');
            container.insertAdjacentHTML('beforeend', this.createVehicleEntryHtml({}, true));
        });

        btnAddClient.addEventListener('click', openClientModal);
        btnCloseClient.addEventListener('click', closeClientModal);
        btnCancelClient.addEventListener('click', closeClientModal);

        formClient.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(formClient);
            const id = formData.get('id');

            // Collect vehicles with year & color
            const vehicles = [];
            const models = formData.getAll('vehicle[]');
            const plates = formData.getAll('plate[]');
            const years = formData.getAll('year[]');
            const colors = formData.getAll('color[]');

            for (let i = 0; i < models.length; i++) {
                if (models[i].trim()) {
                    const rawPlate = plates[i] ? plates[i].trim() : '';
                    const normPlate = (typeof PlateLookupService !== 'undefined' && rawPlate)
                        ? PlateLookupService.normalizePlate(rawPlate)
                        : rawPlate;
                    const resolvedYear = (years[i] && years[i].trim())
                        ? years[i].trim()
                        : ((typeof PlateLookupService !== 'undefined' && normPlate) ? (PlateLookupService.estimateYearFromPlate(normPlate) || '') : '');
                    const resolvedColor = (colors[i] && colors[i].trim())
                        ? colors[i].trim()
                        : ((typeof PlateLookupService !== 'undefined') ? (PlateLookupService.inferColorFromModelName(models[i]) || '') : '');

                    const vObj = {
                        model: models[i].trim(),
                        plate: normPlate,
                        year: String(resolvedYear || ''),
                        color: resolvedColor
                    };
                    vehicles.push(vObj);

                    if (typeof PlateLookupService !== 'undefined' && normPlate) {
                        PlateLookupService.saveToPlateCache(normPlate, vObj);
                    }
                }
            }

            const clientData = {
                name: formData.get('name'),
                phone: formData.get('phone'),
                vehicles: vehicles
            };

            if (id) {
                clientData.id = id;
                store.updateClient(clientData);
            } else {
                store.addClient(clientData);
            }

            formClient.reset();
            closeClientModal();
            this.loadClients(document.getElementById('client-search').value);
        });

        // Inspection Modal & 3D Car Events
        const modalInspection = document.getElementById('modal-inspection');
        const btnCloseInspection = document.querySelector('.close-modal-inspection');
        const btnCancelInspection = document.querySelector('.close-modal-inspection-btn');
        const formInspection = document.getElementById('form-inspection');
        const inputPhotos = document.getElementById('inspection-photos');
        const vehicleSelect = document.getElementById('inspection-vehicle-select');
        const carColorSelect = document.getElementById('inspection-car-color-select');
        const inspSvg = document.getElementById('insp-car-svg');

        const closeInspectionModal = () => modalInspection.classList.add('hidden');
        btnCloseInspection.addEventListener('click', closeInspectionModal);
        btnCancelInspection.addEventListener('click', closeInspectionModal);

        // Clicking panels on the 3D SVG
        if (inspSvg) {
            inspSvg.querySelectorAll('.car-panel').forEach(panelEl => {
                panelEl.addEventListener('click', () => {
                    const pid = panelEl.dataset.panel;
                    this.selectCarPanel(pid);
                    if (this.quickDefectTool) {
                        this.togglePanelDefectType(pid, this.quickDefectTool);
                    }
                });
            });
        }

        // Quick Defect Toolbar Pills
        document.querySelectorAll('#quick-defect-toolbar .defect-tool-pill').forEach(pill => {
            pill.addEventListener('click', () => {
                document.querySelectorAll('#quick-defect-toolbar .defect-tool-pill').forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                this.quickDefectTool = pill.dataset.tool || null;
            });
        });

        // Active Panel Editor Defect Chips
        document.querySelectorAll('#panel-defect-buttons .panel-defect-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                if (!this.selectedPanelId) return;
                this.togglePanelDefectType(this.selectedPanelId, chip.dataset.defect);
            });
        });

        // Active Panel Specific Note
        const panelNoteInput = document.getElementById('selected-panel-note');
        panelNoteInput.addEventListener('input', (e) => {
            if (!this.selectedPanelId) return;
            this.updatePanelNote(this.selectedPanelId, e.target.value);
        });

        // Clear Selected Panel Button
        document.getElementById('btn-clear-panel').addEventListener('click', () => {
            if (!this.selectedPanelId) return;
            delete this.currentPanelDefects[this.selectedPanelId];
            this.selectCarPanel(this.selectedPanelId);
            this.renderMarkedPanelsSummary();
        });

        // Clear All Panels Button
        document.getElementById('btn-clear-all-panels').addEventListener('click', () => {
            this.currentPanelDefects = {};
            this.selectCarPanel(this.selectedPanelId);
            this.renderMarkedPanelsSummary();
        });

        // Vehicle Selector Change -> Update 3D Car Color
        vehicleSelect.addEventListener('change', () => {
            const client = store.getClients().find(c => c.id === this.currentClientId);
            const idx = parseInt(vehicleSelect.value, 10);
            if (client && client.vehicles && client.vehicles[idx]) {
                const v = client.vehicles[idx];
                const col = v.color || 'Cinzento Prata';
                carColorSelect.value = col;
                this.applyCar3DColor(col, 'insp');
            }
        });

        carColorSelect.addEventListener('change', () => {
            this.applyCar3DColor(carColorSelect.value, 'insp');
        });

        // Photo Handling
        this.currentPhotos = [];
        inputPhotos.addEventListener('change', async (e) => {
            const files = Array.from(e.target.files);

            for (const file of files) {
                try {
                    const resizedImage = await this.resizeImage(file);
                    this.currentPhotos.push(resizedImage);

                    const img = document.createElement('img');
                    img.src = resizedImage;
                    img.style.height = '60px';
                    img.style.borderRadius = '4px';
                    img.style.border = '1px solid var(--border-color)';
                    document.getElementById('photos-preview').appendChild(img);
                } catch (err) {
                    console.error('Error resizing image:', err);
                }
            }
        });

        formInspection.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(formInspection);
            const clientId = document.getElementById('inspection-client-id').value;
            const client = store.getClients().find(c => c.id === clientId);
            const vIdx = parseInt(vehicleSelect.value, 10);
            const selectedVehicle = (client && client.vehicles && client.vehicles[vIdx]) ? client.vehicles[vIdx] : null;

            const inspection = {
                clientId: clientId,
                vehicleModel: selectedVehicle ? selectedVehicle.model : '',
                vehiclePlate: selectedVehicle ? (selectedVehicle.plate || '') : '',
                vehicleYear: selectedVehicle ? (selectedVehicle.year || '') : '',
                vehicleColor: carColorSelect.value || (selectedVehicle ? selectedVehicle.color : ''),
                panelDefects: JSON.parse(JSON.stringify(this.currentPanelDefects || {})),
                defects: {
                    defect_scratches: formData.get('defect_scratches') === 'on',
                    defect_dents: formData.get('defect_dents') === 'on',
                    defect_lights: formData.get('defect_lights') === 'on',
                    defect_glass: formData.get('defect_glass') === 'on',
                    defect_wheels: formData.get('defect_wheels') === 'on',
                    defect_interior: formData.get('defect_interior') === 'on',
                    defect_dashboard_lights: formData.get('defect_dashboard_lights') === 'on',
                },
                notes: formData.get('notes'),
                photos: this.currentPhotos
            };

            store.addInspection(inspection);
            closeInspectionModal();
            if (this.currentClientId === clientId) {
                this.loadClientInspections(clientId);
            }
            alert('Inspeção 3D guardada com sucesso!');
        });

        // Client Details Modal Events
        const modalDetails = document.getElementById('modal-client-details');
        const btnCloseDetails = document.querySelector('.close-modal-details');
        const btnNewInspection = document.getElementById('btn-new-inspection');
        const tabs = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        const closeDetailsModal = () => modalDetails.classList.add('hidden');
        btnCloseDetails.addEventListener('click', closeDetailsModal);

        btnNewInspection.addEventListener('click', () => {
            document.getElementById('form-inspection').reset();
            document.getElementById('inspection-client-id').value = this.currentClientId;
            this.currentPhotos = [];
            this.currentPanelDefects = {};
            this.selectedPanelId = null;
            this.quickDefectTool = null;

            document.querySelectorAll('#quick-defect-toolbar .defect-tool-pill').forEach((p, i) => {
                p.classList.toggle('active', i === 0);
            });

            document.getElementById('photos-preview').innerHTML = '';

            // Populate client vehicles in selector
            const client = store.getClients().find(c => c.id === this.currentClientId);
            if (client && client.vehicles && client.vehicles.length > 0) {
                vehicleSelect.innerHTML = client.vehicles.map((v, idx) =>
                    `<option value="${idx}">${v.model} (${v.plate || 'S/ Matrícula'})${v.year ? ` - ${v.year}` : ''}${v.color ? ` - ${v.color}` : ''}</option>`
                ).join('');
                const firstColor = client.vehicles[0].color || 'Cinzento Prata';
                carColorSelect.value = firstColor;
                this.applyCar3DColor(firstColor, 'insp');
            } else {
                vehicleSelect.innerHTML = `<option value="-1">Veículo Geral</option>`;
                carColorSelect.value = 'Cinzento Prata';
                this.applyCar3DColor('Cinzento Prata', 'insp');
            }

            this.selectCarPanel(null);
            this.renderMarkedPanelsSummary();
            document.getElementById('modal-inspection').classList.remove('hidden');
        });

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tabContents.forEach(c => c.style.display = 'none');

                tab.classList.add('active');
                document.getElementById(tab.dataset.tab).style.display = 'block';
            });
        });

        // Add Vehicle Form in Details
        const formAddVehicle = document.getElementById('form-add-vehicle-details');
        if (formAddVehicle) {
            formAddVehicle.addEventListener('submit', (e) => {
                e.preventDefault();
                const formData = new FormData(formAddVehicle);
                const client = store.getClients().find(c => c.id === this.currentClientId);

                if (client) {
                    if (!client.vehicles) client.vehicles = [];
                    client.vehicles.push({
                        model: formData.get('model'),
                        plate: formData.get('plate'),
                        year: formData.get('year') || '',
                        color: formData.get('color') || ''
                    });
                    store.updateClient(client);
                    formAddVehicle.reset();
                    this.loadClientVehicles(this.currentClientId);
                    this.loadClients(document.getElementById('client-search').value);
                }
            });
        }
    }

    resizeImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    const MAX_WIDTH = 800;
                    const MAX_HEIGHT = 800;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);

                    resolve(canvas.toDataURL('image/jpeg', 0.7));
                };
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
}
