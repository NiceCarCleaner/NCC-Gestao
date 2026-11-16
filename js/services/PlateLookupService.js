class PlateLookupService {
    static PT_CAR_CATALOG = [
        "Abarth 500", "Abarth 595",
        "Alfa Romeo Giulietta", "Alfa Romeo Giulia", "Alfa Romeo MiTo", "Alfa Romeo Stelvio", "Alfa Romeo Tonale",
        "Audi A1", "Audi A3", "Audi A4", "Audi A5", "Audi A6", "Audi A7", "Audi A8", "Audi Q2", "Audi Q3", "Audi Q4 e-tron", "Audi Q5", "Audi Q7", "Audi Q8", "Audi TT", "Audi R8",
        "BMW Série 1", "BMW 116d", "BMW 118d", "BMW 120d", "BMW Série 2", "BMW 218d Gran Coupé", "BMW Série 3", "BMW 316d", "BMW 318d", "BMW 320d", "BMW 330e", "BMW E36", "BMW E46 320d", "BMW E90", "BMW E91", "BMW F30", "BMW F31 320d", "BMW G20", "BMW Série 4", "BMW 420d Gran Coupé", "BMW Série 5", "BMW 520d", "BMW 530d", "BMW 530e", "BMW E39", "BMW E60", "BMW F10", "BMW F11", "BMW G30", "BMW Série 7", "BMW X1", "BMW X2", "BMW X3", "BMW X4", "BMW X5", "BMW X6", "BMW i3", "BMW i4", "BMW iX", "BMW iX1", "BMW iX2", "BMW iX3", "BMW M2", "BMW M3", "BMW M4",
        "BYD Atto 3", "BYD Dolphin", "BYD Han", "BYD Seal", "BYD Seal U", "BYD Tang",
        "Chevrolet Aveo", "Chevrolet Captiva", "Chevrolet Cruze", "Chevrolet Spark",
        "Citroën Berlingo", "Citroën C1", "Citroën C3", "Citroën C3 Aircross", "Citroën C4", "Citroën C4 Cactus", "Citroën C4 Picasso", "Citroën C5", "Citroën C5 Aircross", "Citroën DS3", "Citroën DS4", "Citroën DS5", "Citroën Jumpy", "Citroën Saxo", "Citroën Xsara Picasso",
        "Cupra Born", "Cupra Formentor", "Cupra Leon", "Cupra Terramar",
        "Dacia Bigster", "Dacia Duster", "Dacia Jogger", "Dacia Lodgy", "Dacia Logan", "Dacia Sandero", "Dacia Sandero Stepway", "Dacia Spring",
        "DS 3 Crossback", "DS 4", "DS 7 Crossback",
        "Fiat 500", "Fiat 500e", "Fiat 500L", "Fiat 500X", "Fiat 124 Spider", "Fiat Bravo", "Fiat Doblo", "Fiat Ducato", "Fiat Fiorino", "Fiat Panda", "Fiat Punto", "Fiat Tipo",
        "Ford B-Max", "Ford C-Max", "Ford EcoSport", "Ford Fiesta", "Ford Focus", "FordFocus SW", "Ford Galaxy", "Ford Ka", "Ford Kuga", "Ford Mondeo", "Ford Mustang", "Ford Mustang Mach-E", "Ford Puma", "Ford Ranger", "Ford S-Max", "Ford Transit", "Ford Transit Connect",
        "Honda Accord", "Honda Civic", "Honda CR-V", "Honda HR-V", "Honda Jazz",
        "Hyundai Bayon", "Hyundai Getz", "Hyundai i10", "Hyundai i20", "Hyundai i30", "Hyundai i30N", "Hyundai Ioniq", "Hyundai Ioniq 5", "Hyundai Kauai", "Hyundai Kauai Electric", "Hyundai Santa Fe", "Hyundai Tucson",
        "Jaguar E-Pace", "Jaguar F-Pace", "Jaguar F-Type", "Jaguar I-Pace", "Jaguar XE", "Jaguar XF", "Jaguar XJ",
        "Jeep Avenger", "Jeep Cherokee", "Jeep Compass", "Jeep Grand Cherokee", "Jeep Renegade", "Jeep Wrangler",
        "Kia Ceed", "Kia Ceed SW", "Kia EV6", "Kia Niro", "Kia Picanto", "Kia ProCeed", "Kia Rio", "Kia Sorento", "Kia Sportage", "Kia Stonic", "Kia XCeed",
        "Land Rover Defender", "Land Rover Discovery", "Land RoverDiscovery Sport", "Range Rover", "Range Rover Evoque", "Range Rover Sport", "Range Rover Velar",
        "Lexus CT 200h", "Lexus IS 300h", "Lexus LBX", "Lexus NX", "Lexus RX", "Lexus UX 250h",
        "Mazda 2", "Mazda 3", "Mazda 6", "Mazda CX-3", "Mazda CX-30", "Mazda CX-5", "Mazda CX-60", "Mazda MX-5",
        "Mercedes-Benz Classe A", "Mercedes A 180d", "Mercedes A 200", "Mercedes A 250e", "Mercedes Classe B", "Mercedes B 180d", "Mercedes Classe C", "Mercedes C 200d", "Mercedes C 220d", "Mercedes C 300de", "Mercedes C 300e", "Mercedes CLA", "Mercedes CLA 200d", "Mercedes CLA Shooting Brake", "Mercedes CLS", "Mercedes Classe E", "Mercedes E 220d", "Mercedes E 250", "Mercedes E 300de", "Mercedes E 300e", "Mercedes Classe S", "Mercedes GLA", "Mercedes GLB", "Mercedes GLC", "Mercedes GLC 250d", "Mercedes GLC 300de", "Mercedes GLC Coupé", "Mercedes GLE", "Mercedes GLE 350d", "Mercedes EQA", "Mercedes EQB", "Mercedes EQC", "Mercedes EQE", "Mercedes EQS", "Mercedes Vito", "Mercedes Sprinter", "Mercedes 190D",
        "MG 4 Electric", "MG EHS", "MG ZS", "MG ZS EV",
        "Mini Aceman", "Mini Clubman", "Mini Cooper", "Mini Cooper D", "Mini Cooper S", "Mini Cooper SE", "Mini Countryman", "Mini One",
        "Mitsubishi ASX", "Mitsubishi Colt", "Mitsubishi Eclipse Cross", "Mitsubishi L200", "Mitsubishi Lancer", "Mitsubishi Outlander PHEV", "Mitsubishi Pajero", "Mitsubishi Space Star",
        "Nissan Almera", "Nissan Ariya", "Nissan Juke", "Nissan Leaf", "Nissan Micra", "Nissan Navara", "Nissan Note", "Nissan Patrol", "Nissan Patrol GR Y61", "Nissan Primastar", "Nissan Pulsar", "Nissan Qashqai", "Nissan X-Trail", "Nissan GT-R",
        "Opel Adam", "Opel Astra", "Opel Astra Sports Tourer", "Opel Combo", "Opel Corsa", "Opel Corsa-e", "Opel Crossland", "Opel Frontera", "Opel Grandland", "Opel Insignia", "Opel Meriva", "Opel Mokka", "Opel Vectra", "Opel Vivaro", "Opel Zafira",
        "Peugeot 107", "Peugeot 108", "Peugeot 206", "Peugeot 207", "Peugeot 208", "Peugeot e-208", "Peugeot 307", "Peugeot 308", "Peugeot 308 SW", "Peugeot 407", "Peugeot 508", "Peugeot 508 SW", "Peugeot 2008", "Peugeot e-2008", "Peugeot 3008", "Peugeot 5008", "Peugeot Partner", "Peugeot Rifter", "Peugeot Boxer", "Peugeot RCZ",
        "Polestar 2", "Polestar 3", "Polestar 4",
        "Porsche 911", "Porsche Boxster", "Porsche Cayman", "Porsche Cayenne", "Porsche Macan", "Porsche Panamera", "Porsche Taycan",
        "Renault Arkana", "Renault Austral", "Renault Captur", "Renault Clio", "Renault Clio RS", "Renault Clio IV", "Renault Clio V", "Renault Espace", "Renault Express", "Renault Kadjar", "Renault Kangoo", "Renault Laguna", "Renault Master", "Renault Megane", "Renault Megane Sport Tourer", "Renault Megane E-Tech", "Renault 5 E-Tech", "Renault Scenic", "Renault Symbioz", "Renault Talisman", "Renault Trafic", "Renault Twingo", "Renault Zoe",
        "Seat Alhambra", "Seat Altea", "Seat Arona", "Seat Ateca", "Seat Ibiza", "Seat Leon", "Seat Leon ST", "Seat Mii", "Seat Tarraco",
        "Skoda Citigo", "Skoda Enyaq", "Skoda Fabia", "Skoda Kamiq", "Skoda Karoq", "Skoda Kodiaq", "Skoda Octavia", "Skoda Octavia Break", "Skoda Scala", "Skoda Superb",
        "Smart ForTwo", "Smart ForFour", "Smart #1", "Smart #3",
        "Suzuki Ignis", "Suzuki Jimny", "Suzuki Swift", "Suzuki S-Cross", "Suzuki Vitara",
        "Tesla Model 3", "Tesla Model Y", "Tesla Model S", "Tesla Model X",
        "Toyota Auris", "Toyota Avensis", "Toyota Aygo", "Toyota Aygo X", "Toyota bZ4X", "Toyota C-HR", "Toyota Corolla", "Toyota Corolla Touring Sports", "Toyota Hilux", "Toyota Land Cruiser", "Toyota Prius", "Toyota Proace", "Toyota RAV4", "Toyota Verso", "Toyota Yaris", "Toyota Yaris Cross", "Toyota Yaris GR",
        "Volkswagen Amarok", "Volkswagen Arteon", "Volkswagen Caddy", "Volkswagen Crafter", "Volkswagen Golf", "Volkswagen Golf 4", "Volkswagen Golf 5", "Volkswagen Golf 6", "Volkswagen Golf 7", "Volkswagen Golf 7 GTD", "Volkswagen Golf 7 GTI", "Volkswagen Golf 8", "Volkswagen ID.3", "Volkswagen ID.4", "Volkswagen ID.5", "Volkswagen ID.Buzz", "Volkswagen Passat", "Volkswagen Passat Variant", "Volkswagen Polo", "Volkswagen Scirocco", "Volkswagen Sharan", "Volkswagen Taigo", "Volkswagen T-Cross", "Volkswagen Tiguan", "Volkswagen Touareg", "Volkswagen Touran", "Volkswagen Transporter", "Volkswagen T-Roc", "Volkswagen Up!",
        "Volvo C30", "Volvo C40", "Volvo EX30", "Volvo EX90", "Volvo S40", "Volvo S60", "Volvo S90", "Volvo V40", "Volvo V50", "Volvo V60", "Volvo V90", "Volvo XC40", "Volvo XC60", "Volvo XC90",
        "XPENG G6", "XPENG G9", "XPENG P7"
    ];

    static normalizePlate(raw) {
        if (!raw) return '';
        const clean = raw.toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (clean.length === 6) {
            return `${clean.slice(0, 2)}-${clean.slice(2, 4)}-${clean.slice(4, 6)}`;
        }
        return raw.toUpperCase().trim();
    }

    static isValidPortuguesePlate(plate) {
        const formatted = this.normalizePlate(plate);
        return /^([A-Z]{2}-\d{2}-\d{2}|\d{2}-\d{2}-[A-Z]{2}|\d{2}-[A-Z]{2}-\d{2}|[A-Z]{2}-\d{2}-[A-Z]{2})$/.test(formatted);
    }

    /**
     * Calcula o ano de matrícula em Portugal com base nas séries oficiais do IMT (1937 - 2026+)
     */
    static estimateYearFromPlate(plate) {
        const formatted = this.normalizePlate(plate);
        if (!this.isValidPortuguesePlate(formatted)) return null;

        const parts = formatted.split('-');

        // Série 4: AA-00-AA (Março 2020 até presente)
        if (/^[A-Z]{2}$/.test(parts[0]) && /^\d{2}$/.test(parts[1]) && /^[A-Z]{2}$/.test(parts[2])) {
            const l12 = parts[0];
            const l34 = parts[2];
            const code = l12 + l34;
            if (code <= 'AFMZ') return 2020;
            if (code <= 'ALZZ') return 2021;
            if (code <= 'AVLZ') return 2022;
            if (code <= 'BGZZ') return 2023;
            if (code <= 'BTZZ') return 2024;
            if (code <= 'CFZZ') return 2025;
            return 2026;
        }

        // Série 3: 00-AA-00 (Maio 2005 a Março 2020)
        if (/^\d{2}$/.test(parts[0]) && /^[A-Z]{2}$/.test(parts[1]) && /^\d{2}$/.test(parts[2])) {
            const letters = parts[1];
            if (letters <= 'BL') return 2005;
            if (letters <= 'DC') return 2006;
            if (letters <= 'FB') return 2007;
            if (letters <= 'GZ') return 2008;
            if (letters <= 'IZ') return 2009;
            if (letters <= 'LZ') return 2010;
            if (letters <= 'NZ') return 2011;
            if (letters <= 'OS') return 2012;
            if (letters <= 'PI') return 2013;
            if (letters <= 'QJ') return 2014;
            if (letters <= 'RX') return 2015;
            if (letters <= 'TG') return 2016;
            if (letters <= 'VF') return 2017;
            if (letters <= 'XJ') return 2018;
            if (letters <= 'ZU') return 2019;
            return 2020;
        }

        // Série 2: 00-00-AA (Março 1992 a Maio 2005)
        if (/^\d{2}$/.test(parts[0]) && /^\d{2}$/.test(parts[1]) && /^[A-Z]{2}$/.test(parts[2])) {
            const letters = parts[2];
            if (letters <= 'BU') return 1992;
            if (letters <= 'DM') return 1993;
            if (letters <= 'FN') return 1994;
            if (letters <= 'HQ') return 1995;
            if (letters <= 'JX') return 1996;
            if (letters <= 'LP') return 1997;
            if (letters <= 'NZ') return 1998;
            if (letters <= 'QX') return 1999;
            if (letters <= 'TG') return 2000;
            if (letters <= 'VZ') return 2001;
            if (letters <= 'XU') return 2002;
            if (letters <= 'ZH') return 2003;
            if (letters <= 'ZT') return 2004;
            return 2005;
        }

        // Série 1: AA-00-00 (1937 a Fevereiro 1992)
        if (/^[A-Z]{2}$/.test(parts[0]) && /^\d{2}$/.test(parts[1]) && /^\d{2}$/.test(parts[2])) {
            const c1 = parts[0].charCodeAt(0) - 65;
            return Math.min(1992, Math.max(1960, 1960 + Math.round(c1 * 1.3)));
        }

        return null;
    }

    /**
     * Procura na memória local (clientes existentes + cache local de matrículas)
     */
    static lookupInLocalDatabase(plate) {
        const formatted = this.normalizePlate(plate);
        if (!formatted) return null;

        // 1. Check custom plate cache in localStorage
        try {
            const cache = JSON.parse(localStorage.getItem('nccPlateCache') || '{}');
            if (cache[formatted]) {
                return cache[formatted];
            }
        } catch (_) {}

        // 2. Check existing clients in store
        if (typeof store !== 'undefined' && store.getClients) {
            const clients = store.getClients();
            for (const client of clients) {
                if (Array.isArray(client.vehicles)) {
                    const match = client.vehicles.find(v => v.plate && this.normalizePlate(v.plate) === formatted);
                    if (match && match.model && match.model !== '?' && match.model !== 'ND') {
                        return {
                            plate: formatted,
                            model: match.model,
                            year: match.year || this.estimateYearFromPlate(formatted) || '',
                            color: match.color || this.inferColorFromModelName(match.model) || '',
                            source: 'Histórico NiceCarCleaner'
                        };
                    }
                }
            }
        }

        return null;
    }

    static saveToPlateCache(plate, info) {
        const formatted = this.normalizePlate(plate);
        if (!formatted || !info) return;
        try {
            const cache = JSON.parse(localStorage.getItem('nccPlateCache') || '{}');
            cache[formatted] = {
                ...cache[formatted],
                ...info,
                plate: formatted,
                updatedAt: Date.now()
            };
            localStorage.setItem('nccPlateCache', JSON.stringify(cache));
        } catch (_) {}
    }

    static inferColorFromModelName(modelStr = '') {
        const lower = modelStr.toLowerCase();
        if (lower.includes('preto') || lower.includes('preta') || lower.includes('black')) return 'Preto';
        if (lower.includes('branco') || lower.includes('branca') || lower.includes('white')) return 'Branco';
        if (lower.includes('cinza') || lower.includes('cinzento') || lower.includes('prata') || lower.includes('silver')) return 'Cinzento Prata';
        if (lower.includes('azul') || lower.includes('blue')) return 'Azul';
        if (lower.includes('vermelho') || lower.includes('vermelha') || lower.includes('red')) return 'Vermelho';
        if (lower.includes('verde') || lower.includes('green')) return 'Verde';
        if (lower.includes('amarelo') || lower.includes('dourado')) return 'Amarelo';
        return '';
    }

    /**
     * Consulta online gratuita por matrícula portuguesa (tentativa multi-fonte + fallback IMT)
     */
    static async lookupPlate(rawPlate) {
        const plate = this.normalizePlate(rawPlate);
        const estimatedYear = this.estimateYearFromPlate(plate);

        // 1. Check local database & cache first (instant)
        const localMatch = this.lookupInLocalDatabase(plate);
        if (localMatch && localMatch.model) {
            return {
                ...localMatch,
                year: localMatch.year || estimatedYear || ''
            };
        }

        // 2. Try online Portuguese plate lookup endpoints via CORS proxy
        const cleanPlateNoDashes = plate.replace(/-/g, '');
        const onlineResult = await this.tryOnlineCatalogLookup(plate, cleanPlateNoDashes);
        if (onlineResult && onlineResult.model) {
            const finalData = {
                plate,
                model: onlineResult.model,
                year: onlineResult.year || estimatedYear || '',
                color: onlineResult.color || '',
                source: onlineResult.source || 'Catálogo Online'
            };
            this.saveToPlateCache(plate, finalData);
            return finalData;
        }

        // 3. Fallback: return estimated year from IMT table
        return {
            plate,
            model: '',
            year: estimatedYear || '',
            color: '',
            source: estimatedYear ? 'Série IMT (Ano Automático)' : 'Manual'
        };
    }

    static async tryOnlineCatalogLookup(formattedPlate, cleanPlate) {
        // Endpoint 1: Custom API key if user configured Matricula.co.pt / RegCheck
        const customApiUser = localStorage.getItem('nccPlateApiUser');
        if (customApiUser) {
            try {
                const url = `https://www.regcheck.org.uk/api/reg.asmx/CheckPortugal?RegistrationNumber=${encodeURIComponent(cleanPlate)}&username=${encodeURIComponent(customApiUser)}`;
                const res = await fetch(url);
                const text = await res.text();
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const data = JSON.parse(jsonMatch[0]);
                    const model = data.Description || `${data.CarMake?.CurrentTextValue || ''} ${data.CarModel?.CurrentTextValue || ''}`.trim();
                    if (model) {
                        return {
                            model,
                            year: data.RegistrationYear || '',
                            color: data.Colour || '',
                            source: 'API Matrícula PT'
                        };
                    }
                }
            } catch (e) {
                console.warn('Custom Plate API error:', e);
            }
        }

        // Endpoint 2: Public web catalog search via CORS proxy (B-Parts / AutoCatalog)
        const proxies = [
            (u) => `https://api.allorigins.win/get?url=${encodeURIComponent(u)}`,
            (u) => `https://corsproxy.io/?${encodeURIComponent(u)}`
        ];

        const targets = [
            `https://www.b-parts.com/pt/search?q=${encodeURIComponent(formattedPlate)}`,
            `https://www.b-parts.com/pt/search?q=${encodeURIComponent(cleanPlate)}`
        ];

        for (const target of targets) {
            for (const makeProxy of proxies) {
                try {
                    const controller = new AbortController();
                    const timeout = setTimeout(() => controller.abort(), 3200);
                    const resp = await fetch(makeProxy(target), { signal: controller.signal });
                    clearTimeout(timeout);
                    if (!resp.ok) continue;

                    const bodyText = target.includes('allorigins') ? (await resp.json()).contents : await resp.text();
                    if (!bodyText) continue;

                    const parsed = this.extractCarModelFromHtml(bodyText);
                    if (parsed) {
                        return {
                            model: parsed.model,
                            year: parsed.year || '',
                            source: 'Catálogo Automóvel PT'
                        };
                    }
                } catch (_) {
                    // Continue silently to next fallback
                }
            }
        }

        return null;
    }

    static extractCarModelFromHtml(html) {
        if (!html || typeof html !== 'string') return null;
        for (const catalogItem of this.PT_CAR_CATALOG) {
            const escaped = catalogItem.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`\\b${escaped}\\b`, 'i');
            if (regex.test(html)) {
                return { model: catalogItem };
            }
        }
        return null;
    }

    /**
     * Analisa uma fotografia do veículo:
     * 1) Deteta automaticamente a Cor Dominante real da pintura no Canvas (100% offline/instantâneo)
     * 2) Se existir API Gemini (ou Firebase AI Logic), extrai Matrícula, Marca, Modelo, Ano e Cor por IA!
     */
    static async analyzeCarPhoto(file) {
        const base64DataUrl = await this.fileToDataUrl(file);
        const dominantColor = await this.detectDominantColorFromDataUrl(base64DataUrl);

        // Try Gemini Vision (Free Tier API Key or Project Key)
        const apiKey = localStorage.getItem('nccGeminiApiKey') || FIREBASE_CONFIG.apiKey;
        if (apiKey) {
            try {
                const base64Clean = base64DataUrl.split(',')[1];
                const mimeType = file.type || 'image/jpeg';
                const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;

                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{
                            parts: [
                                {
                                    text: 'Analisa a foto deste automóvel em Portugal e devolve APENAS um objeto JSON válido com as chaves: "plate" (matrícula portuguesa no formato XX-XX-XX se visível, ou ""), "model" (Marca e Modelo do carro, ex: "BMW Série 3", "Peugeot 2008", "Mercedes Classe A"), "color" (uma de: "Preto", "Branco", "Cinzento Prata", "Cinzento Escuro", "Azul", "Vermelho", "Verde", "Amarelo", "Castanho"), "year" (ano estimado ou ""). Não uses markdown.'
                                },
                                {
                                    inlineData: {
                                        mimeType,
                                        data: base64Clean
                                    }
                                }
                            ]
                        }],
                        generationConfig: {
                            temperature: 0.1,
                            responseMimeType: 'application/json'
                        }
                    })
                });

                if (response.ok) {
                    const result = await response.json();
                    const rawText = result?.candidates?.[0]?.content?.parts?.[0]?.text || '';
                    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        const parsed = JSON.parse(jsonMatch[0]);
                        const normPlate = parsed.plate ? this.normalizePlate(parsed.plate) : '';
                        const imtYear = normPlate ? this.estimateYearFromPlate(normPlate) : null;
                        const finalResult = {
                            plate: normPlate,
                            model: parsed.model || '',
                            year: imtYear || parsed.year || '',
                            color: parsed.color || dominantColor || 'Cinzento Prata',
                            source: 'IA Câmara (Gemini)'
                        };
                        if (normPlate && finalResult.model) {
                            this.saveToPlateCache(normPlate, finalResult);
                        }
                        return finalResult;
                    }
                }
            } catch (err) {
                console.warn('Gemini Vision fallback para deteção local:', err);
            }
        }

        return {
            plate: '',
            model: '',
            year: '',
            color: dominantColor || 'Cinzento Prata',
            source: 'Deteção Visual de Cor'
        };
    }

    static fileToDataUrl(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    static detectDominantColorFromDataUrl(dataUrl) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const size = 64;
                canvas.width = size;
                canvas.height = size;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, size, size);

                // Sample center region of the image (where the car body usually is)
                const data = ctx.getImageData(16, 16, 32, 32).data;
                let rSum = 0, gSum = 0, bSum = 0, count = 0;
                for (let i = 0; i < data.length; i += 4) {
                    rSum += data[i];
                    gSum += data[i + 1];
                    bSum += data[i + 2];
                    count++;
                }
                const r = rSum / count;
                const g = gSum / count;
                const b = bSum / count;

                const max = Math.max(r, g, b);
                const min = Math.min(r, g, b);
                const lum = (max + min) / 2;
                const sat = max === min ? 0 : (max - min) / (255 - Math.abs(max + min - 255));

                if (lum < 55) return resolve('Preto');
                if (lum > 205 && sat < 0.25) return resolve('Branco');
                if (sat < 0.18) {
                    return resolve(lum > 130 ? 'Cinzento Prata' : 'Cinzento Escuro');
                }
                if (r > g + 35 && r > b + 35) {
                    return resolve(g > 130 ? 'Amarelo' : 'Vermelho');
                }
                if (b > r + 25 && b > g + 15) return resolve('Azul');
                if (g > r + 20 && g > b + 20) return resolve('Verde');
                return resolve('Cinzento Prata');
            };
            img.onerror = () => resolve('Cinzento Prata');
            img.src = dataUrl;
        });
    }
}

window.PlateLookupService = PlateLookupService;
