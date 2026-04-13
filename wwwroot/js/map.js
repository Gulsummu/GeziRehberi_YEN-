// ============================================================
//  MAP.JS – Gezi Rehberi
//  Landing ↔ Map transition + interactive world map logic
// ============================================================

// ── Global map reference (initialised lazily) ──────────────
let map = null;
let geojsonLayer;
let markersLayer;
let currentZoomedCountry = null;
let allCities = [];
let currentPolyline = null;
let routeCityMarkers;
let mapInitialised = false;

// ── Çatlak Yumurta İkonu (global – initMap'ten önce tanımlanır) ──
let crackEggIcon = null;

function getCrackEggIcon() {
    if (!crackEggIcon) {
        crackEggIcon = L.icon({
            iconUrl: '/images/crack-egg.png',
            iconSize: [38, 48],   // genişlik × yükseklik (px)
            iconAnchor: [19, 48],   // ikonun alt-ortasını koordinata sabitle
            popupAnchor: [0, -48],
            className: 'crack-egg-marker'
        });
    }
    return crackEggIcon;
}

// ── Landing Page → Map transition ─────────────────────────
window.activateMap = function () {
    const hero = document.getElementById('landing-hero');
    const mapContainer = document.getElementById('map-container');

    if (!mapContainer) return;

    // If hero exists and is visible, fade it out
    if (hero && hero.style.display !== 'none') {
        hero.classList.add('fade-out');
    }

    // 2) Show map container after brief delay
    setTimeout(() => {
        if (hero) hero.style.display = 'none';
        mapContainer.style.display = 'block';

        // Swap navbar style
        document.body.classList.remove('landing-active');
        document.body.classList.add('map-view-active');

        // Fade-in map
        requestAnimationFrame(() => {
            mapContainer.classList.add('map-visible');
        });

        // 3) Init Leaflet only once
        if (!mapInitialised) {
            initMap();
            mapInitialised = true;
        } else {
            // Invalidate size in case the container changed dimensions
            map && map.invalidateSize();
        }
    }, hero && hero.style.display !== 'none' ? 650 : 0);
};

// ── Map → Landing Page transition ─────────────────────────
window.deactivateMap = function () {
    const hero = document.getElementById('landing-hero');
    const mapContainer = document.getElementById('map-container');

    if (!hero || !mapContainer) return;

    // Fade out map
    mapContainer.classList.remove('map-visible');

    setTimeout(() => {
        mapContainer.style.display = 'none';
        hero.style.display = 'flex';
        hero.classList.remove('fade-out');

        document.body.classList.add('landing-active');
        document.body.classList.remove('map-view-active');
    }, 650);
};

// ── Initialise the Leaflet map ─────────────────────────────
function initMap() {
    map = L.map('world-map', {
        center: [30, 0],
        zoom: 2,
        minZoom: 2,
        maxBounds: [
            [-90, -180],
            [90, 180]
        ],
        zoomControl: false
    });

    // Zoom control – bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Dark map tiles (CartoDB Dark Matter)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(map);

    // Layer groups
    markersLayer = L.layerGroup().addTo(map);
    routeCityMarkers = L.layerGroup().addTo(map);

    const backButton = document.getElementById('back-to-world');

    // Route Planner elements
    const openRouteBtn = document.getElementById('open-route-planner-btn');
    const closeRouteBtn = document.getElementById('close-route-planner-btn');
    const routeOverlay = document.getElementById('route-planner-overlay');
    const routeForm = document.getElementById('route-form');
    const routeCitiesSelect = document.getElementById('route-cities-select');
    const routeWarning = document.getElementById('route-budget-warning');

    if (openRouteBtn && closeRouteBtn && routeOverlay) {
        openRouteBtn.addEventListener('click', () => { routeOverlay.style.display = 'block'; });
        closeRouteBtn.addEventListener('click', () => { routeOverlay.style.display = 'none'; });
    }

    // ── Fetch GeoJSON country borders ─────────────────────
    fetch('/data/world.geojson')
        .then(res => res.json())
        .then(data => {
            geojsonLayer = L.geoJson(data, {
                style: styleFeatures,
                onEachFeature: onEachFeature
            }).addTo(map);
        })
        .catch(err => console.error('Could not load world.geojson:', err));

    // ── Fetch cities data ──────────────────────────────────
    fetch('/data/cities.json')
        .then(res => res.json())
        .then(data => {
            allCities = data;
            if (routeCitiesSelect) {
                allCities.forEach(city => {
                    const opt = document.createElement('option');
                    opt.value = city.id;
                    opt.textContent = `${city.name} (${city.country})`;
                    opt.dataset.lat = city.lat;
                    opt.dataset.lng = city.lng;
                    opt.dataset.budgetLevel = city.budget || 'Orta';
                    routeCitiesSelect.appendChild(opt);
                });
            }
        })
        .catch(err => console.error('Could not load cities.json:', err));

    // ── GeoJSON style helpers ──────────────────────────────
    function styleFeatures(feature) {
        return {
            fillColor: '#2b2b2b',
            weight: 1,
            opacity: 1,
            color: '#444',
            dashArray: '3',
            fillOpacity: 0.5
        };
    }

    function highlightFeature(e) {
        if (currentZoomedCountry) return;
        const layer = e.target;
        layer.setStyle({
            weight: 2,
            color: '#0d6efd',
            dashArray: '',
            fillOpacity: 0.7,
            fillColor: '#1c1c1c'
        });
        layer.bringToFront();
    }

    function resetHighlight(e) {
        if (currentZoomedCountry) return;
        geojsonLayer.resetStyle(e.target);
    }

    // ── Country click → zoom + show cities ────────────────
    function zoomToFeature(e) {
        const layer = e.target;
        const countryName = layer.feature.properties.name;

        currentZoomedCountry = countryName;
        map.fitBounds(layer.getBounds(), { padding: [50, 50] });

        backButton.classList.add('visible');

        // Reset all country highlights then highlight selected
        geojsonLayer.eachLayer(l => geojsonLayer.resetStyle(l));
        layer.setStyle({
            weight: 2,
            color: '#0d6efd',
            fillOpacity: 0.2,
            fillColor: '#0d6efd'
        });

        showCitiesForCountry(countryName);
    }

    function onEachFeature(feature, layer) {
        layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight,
            click: zoomToFeature
        });

        if (feature.properties && feature.properties.name) {
            layer.bindTooltip(feature.properties.name, {
                permanent: false,
                direction: 'center',
                className: 'country-tooltip'
            });
        }
    }

    // ── Çatlak Yumurta İkonu ──────────────────────────────
    const cityIcon = getCrackEggIcon();

    // ── Show city markers for a country ───────────────────
    function showCitiesForCountry(countryName) {
        markersLayer.clearLayers();

        const cities = allCities.filter(c => c.country === countryName);

        cities.forEach(city => {
            const marker = L.marker([city.lat, city.lng], { icon: cityIcon })
                .bindTooltip(city.name, { direction: 'top', offset: [0, -54] })
                .addTo(markersLayer);

            marker.on('click', () => {
                window.location.href = `/City/Detail/${city.id}`;
            });
        });
    }

    // ── Route Planning ─────────────────────────────────────
    if (routeForm) {
        routeForm.addEventListener('submit', e => {
            e.preventDefault();

            const selectedOptions = Array.from(routeCitiesSelect.selectedOptions);
            const userBudget = parseFloat(document.getElementById('route-budget').value);
            const days = parseInt(document.getElementById('route-days').value) || 1;

            if (selectedOptions.length < 2) {
                alert('Lütfen rota çizmek için en az 2 şehir seçin.');
                return;
            }

            if (currentPolyline) map.removeLayer(currentPolyline);
            routeCityMarkers.clearLayers();

            let totalEstimatedCost = 0;
            const latlngs = [];

            selectedOptions.forEach(opt => {
                const lat = parseFloat(opt.dataset.lat);
                const lng = parseFloat(opt.dataset.lng);
                latlngs.push([lat, lng]);

                const marker = L.marker([lat, lng], { icon: cityIcon })
                    .bindTooltip(opt.textContent, { permanent: true, direction: 'top', offset: [0, -54] })
                    .addTo(routeCityMarkers);

                marker.on('click', () => {
                    window.location.href = `/City/Detail/${opt.value}`;
                });

                const bLevel = opt.dataset.budgetLevel;
                let dailyCost = 1500;
                if (bLevel.includes('Düşük')) dailyCost = 500;
                if (bLevel.includes('Yüksek')) dailyCost = 3000;

                totalEstimatedCost += dailyCost * (days / selectedOptions.length);
            });

            currentPolyline = L.polyline(latlngs, {
                color: '#38bdf8',
                weight: 4,
                opacity: 0.8,
                dashArray: '10, 10'
            }).addTo(map);

            map.fitBounds(currentPolyline.getBounds(), { padding: [50, 50] });

            if (totalEstimatedCost > userBudget) {
                routeWarning.style.display = 'block';
                routeWarning.className = 'alert alert-warning mt-3 mb-0';
                routeWarning.innerHTML = `<i class="fa-solid fa-triangle-exclamation me-1"></i> Bütçeniz bu rota için biraz kısıtlı. Tahmini maliyet: <b>${totalEstimatedCost.toFixed(0)} ₺</b>, bütçeniz: <b>${userBudget} ₺</b>.`;
            } else {
                routeWarning.style.display = 'block';
                routeWarning.className = 'alert alert-success mt-3 mb-0';
                routeWarning.innerHTML = `<i class="fa-solid fa-check me-1"></i> Harika! Bütçeniz yeterli. Tahmini maliyet: <b>${totalEstimatedCost.toFixed(0)} ₺</b>.`;
                saveRouteToDatabase(selectedOptions.map(o => o.value), userBudget, days);
            }
        });
    }

    function saveRouteToDatabase(cityIds, budget, days) {
        const routeType = document.getElementById('route-type').value;
        const payload = {
            RouteName: 'Kişisel Rota (' + new Date().toLocaleDateString('tr-TR') + ')',
            TotalBudget: budget,
            Days: days,
            TripType: routeType,
            CityIds: cityIds.map(id => parseInt(id))
        };

        fetch('/Route/SaveRoute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
            .then(res => {
                if (!res.ok) throw new Error('Giriş yapmamış olabilirsiniz veya bir hata oluştu.');
                return res.json();
            })
            .then(data => {
                if (data.success) {
                    const sBtn = document.querySelector('#route-form button[type="submit"]');
                    const origHtml = sBtn.innerHTML;
                    sBtn.innerHTML = '<i class="fa-solid fa-check me-2"></i>Rota Kaydedildi!';
                    sBtn.classList.replace('btn-info', 'btn-success');
                    setTimeout(() => {
                        sBtn.innerHTML = origHtml;
                        sBtn.classList.replace('btn-success', 'btn-info');
                    }, 3000);
                }
            })
            .catch(err => {
                console.error(err);
                alert('Rota kaydedilemedi. Lütfen giriş yaptığınızdan emin olun.');
            });
    }

    // ── Back to World ──────────────────────────────────────
    if (backButton) {
        backButton.addEventListener('click', () => {
            currentZoomedCountry = null;
            map.setView([30, 0], 2);
            geojsonLayer.eachLayer(l => geojsonLayer.resetStyle(l));
            markersLayer.clearLayers();
            backButton.classList.remove('visible');
        });
    }
}

// ── On DOM ready: set initial state ───────────────────────
document.addEventListener('DOMContentLoaded', function () {
    const hero = document.getElementById('landing-hero');
    const mapContainer = document.getElementById('map-container');

    // If hero is already hidden (logged-in user), skip landing setup
    if (hero && hero.style.display !== 'none') {
        hero.style.display = 'flex';
        document.body.classList.add('landing-active');
    }

    // mapContainer is managed by Index.cshtml inline style;
    // if it's already visible (logged-in auto-start), don't hide it again.
    if (mapContainer && mapContainer.style.display !== 'block') {
        mapContainer.style.display = 'none';
    }
});
