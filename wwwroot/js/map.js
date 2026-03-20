document.addEventListener("DOMContentLoaded", function () {
    // 1) Initialize the map
    // Centered around Europe roughly to show the whole world nicely
    const map = L.map('world-map', {
        center: [30, 0],
        zoom: 2,
        minZoom: 2,
        maxBounds: [
            [-90, -180],
            [90, 180]
        ],
        zoomControl: false // We will handle our own UI or add it to a different position if needed
    });

    // Add Zoom Control at bottom right
    L.control.zoom({
        position: 'bottomright'
    }).addTo(map);


    // 2) Dark/Modern Map Tiles (CartoDB Dark Matter)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(map);


    // Global variables to keep track of state
    let geojsonLayer;
    let markersLayer = L.layerGroup().addTo(map);
    let currentZoomedCountry = null;
    let allCities = [];

    const backButton = document.getElementById('back-to-world');
    const overlay = document.getElementById('welcome-overlay');

    // Route Planner Elements
    const openRouteBtn = document.getElementById('open-route-planner-btn');
    const closeRouteBtn = document.getElementById('close-route-planner-btn');
    const routeOverlay = document.getElementById('route-planner-overlay');
    const routeForm = document.getElementById('route-form');
    const routeCitiesSelect = document.getElementById('route-cities-select');
    const routeWarning = document.getElementById('route-budget-warning');
    let currentPolyline = null;
    let routeCityMarkers = L.layerGroup().addTo(map);

    if (openRouteBtn && closeRouteBtn && routeOverlay) {
        openRouteBtn.addEventListener('click', () => {
            routeOverlay.style.display = 'block';
        });
        closeRouteBtn.addEventListener('click', () => {
            routeOverlay.style.display = 'none';
        });
    }

    // Fetch GeoJSON Borders
    fetch('/data/world.geojson')
        .then(res => res.json())
        .then(data => {
            geojsonLayer = L.geoJson(data, {
                style: styleFeatures,
                onEachFeature: onEachFeature
            }).addTo(map);
        })
        .catch(err => console.error("Could not load world.geojson:", err));

    // Fetch Cities Data
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
        .catch(err => console.error("Could not load cities.json:", err));

    // Style for the GeoJSON layer (Country borders)
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

    // Hover Styles
    function highlightFeature(e) {
        if (currentZoomedCountry) return; // Don't highlight other countries when zoomed into one

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

    // Click on Country
    function zoomToFeature(e) {
        const layer = e.target;
        const countryName = layer.feature.properties.name;

        // Visual State Changes
        currentZoomedCountry = countryName;
        map.fitBounds(layer.getBounds(), { padding: [50, 50] });

        // UI Handling
        backButton.classList.add('visible');
        overlay.classList.add('hidden');

        // Specific Country Highlight
        geojsonLayer.eachLayer(function (l) {
            geojsonLayer.resetStyle(l);
        });
        layer.setStyle({
            weight: 2,
            color: '#0d6efd',
            fillOpacity: 0.2,
            fillColor: '#0d6efd'
        });

        // Show Cities
        showCitiesForCountry(countryName);
    }

    function onEachFeature(feature, layer) {
        layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight,
            click: zoomToFeature
        });

        // Add Tooltips with Country Names when hovered
        if (feature.properties && feature.properties.name) {
            layer.bindTooltip(feature.properties.name, {
                permanent: false,
                direction: "center",
                className: "country-tooltip"
            });
        }
    }


    // Custom Leaflet Marker Icon with HTML
    const customIcon = L.divIcon({
        className: 'custom-city-marker',
        html: `<div class="marker-pin"></div><i class="fa-solid fa-location-dot"></i>`,
        iconSize: [30, 42],
        iconAnchor: [15, 42]
    });


    function showCitiesForCountry(countryName) {
        // Clear previous markers (except route markers)
        markersLayer.clearLayers();

        // Filter cities by the country clicked
        const cities = allCities.filter(c => c.country === countryName);

        cities.forEach(city => {
            const marker = L.marker([city.lat, city.lng], { icon: customIcon })
                .bindTooltip(city.name, { direction: 'top', offset: [0, -40] })
                .addTo(markersLayer);

            marker.on('click', () => {
                window.location.href = `/City/Detail/${city.id}`;
            });
        });
    }

    // Route Planning Logic
    if (routeForm) {
        routeForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const selectedOptions = Array.from(routeCitiesSelect.selectedOptions);
            const userBudget = parseFloat(document.getElementById('route-budget').value);
            const days = parseInt(document.getElementById('route-days').value) || 1;

            if (selectedOptions.length < 2) {
                alert("Lütfen rota çizmek için en az 2 şehir seçin.");
                return;
            }

            // Clear previous route
            if (currentPolyline) {
                map.removeLayer(currentPolyline);
            }
            routeCityMarkers.clearLayers();

            let totalEstimatedCost = 0;
            const latlngs = [];

            selectedOptions.forEach(opt => {
                const lat = parseFloat(opt.dataset.lat);
                const lng = parseFloat(opt.dataset.lng);
                latlngs.push([lat, lng]);

                // Draw marker for selected route city
                const marker = L.marker([lat, lng], { icon: customIcon })
                    .bindTooltip(opt.textContent, { permanent: true, direction: 'top', offset: [0, -40] })
                    .addTo(routeCityMarkers);

                marker.on('click', () => {
                    window.location.href = `/City/Detail/${opt.value}`;
                });

                // Calculate cost based on BudgetLevel
                const bLevel = opt.dataset.budgetLevel;
                let dailyCost = 1500; // Orta
                if (bLevel.includes("Düşük")) dailyCost = 500;
                if (bLevel.includes("Yüksek")) dailyCost = 3000;

                totalEstimatedCost += dailyCost * (days / selectedOptions.length);
            });

            // Draw Polyline
            currentPolyline = L.polyline(latlngs, {
                color: '#38bdf8',
                weight: 4,
                opacity: 0.8,
                dashArray: '10, 10'
            }).addTo(map);

            map.fitBounds(currentPolyline.getBounds(), { padding: [50, 50] });

            // Budget Check
            if (totalEstimatedCost > userBudget) {
                routeWarning.style.display = 'block';
                routeWarning.innerHTML = `<i class="fa-solid fa-triangle-exclamation me-1"></i> Bütçeniz bu rota için biraz kısıtlı. Tahmini maliyet: <b>${totalEstimatedCost.toFixed(0)} ₺</b>, ancak bütçeniz: <b>${userBudget} ₺</b>.`;
            } else {
                routeWarning.style.display = 'block';
                routeWarning.className = 'alert alert-success mt-3 mb-0';
                routeWarning.innerHTML = `<i class="fa-solid fa-check me-1"></i> Harika! Bütçeniz bu rota için gayet yeterli. Tahmini maliyet: <b>${totalEstimatedCost.toFixed(0)} ₺</b>.`;

                // Save Route to DB... (Will implement in next step)
                saveRouteToDatabase(selectedOptions.map(o => o.value), userBudget, days);
            }
        });
    }

    function saveRouteToDatabase(cityIds, budget, days) {
        const routeType = document.getElementById('route-type').value;
        const payload = {
            RouteName: "Kişisel Rota (" + new Date().toLocaleDateString('tr-TR') + ")",
            TotalBudget: budget,
            Days: days,
            TripType: routeType,
            CityIds: cityIds.map(id => parseInt(id))
        };

        fetch('/Route/SaveRoute', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })
            .then(res => {
                if (!res.ok) throw new Error("Giriş yapmamış olabilirsiniz veya bir hata oluştu.");
                return res.json();
            })
            .then(data => {
                if (data.success) {
                    // Change button to success state briefly
                    const sBtn = document.querySelector('#route-form button[type="submit"]');
                    const origHtml = sBtn.innerHTML;
                    sBtn.innerHTML = '<i class="fa-solid fa-check me-2"></i>Rota Kaydedildi!';
                    sBtn.classList.remove('btn-info');
                    sBtn.classList.add('btn-success');
                    setTimeout(() => {
                        sBtn.innerHTML = origHtml;
                        sBtn.classList.remove('btn-success');
                        sBtn.classList.add('btn-info');
                    }, 3000);
                }
            })
            .catch(err => {
                console.error(err);
                alert("Rota kaydedilemedi: İstek hatası. Lütfen giriş yaptığınızdan emin olun.");
            });
    }



    // Reset Map View
    backButton.addEventListener('click', () => {
        currentZoomedCountry = null;
        map.setView([30, 0], 2);
        geojsonLayer.eachLayer(function (l) {
            geojsonLayer.resetStyle(l);
        });
        markersLayer.clearLayers();
        backButton.classList.remove('visible');
    });

});
