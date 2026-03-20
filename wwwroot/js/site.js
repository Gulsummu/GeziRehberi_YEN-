let map;
let geoJsonLayer;
let cityMarkers = [];
let allCities = [];
let isCountrySelected = false;
let selectedCountryName = null;

document.addEventListener("DOMContentLoaded", () => {
    // Only initialize if we're on the map page
    if (!document.getElementById("world-map")) return;

    initMap();
    loadCitiesData();
    setupEventListeners();
});

function initMap() {
    // Initialize map centered on the world
    map = L.map('world-map', {
        zoomControl: false, // We'll add it custom or hide it
        minZoom: 2,
        maxZoom: 10
    }).setView([20, 0], 2);

    // Add a dark theme tile layer (CartoDB Dark Matter)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(map);

    // Custom Zoom control at bottom right
    L.control.zoom({
        position: 'bottomright'
    }).addTo(map);

    // Load GeoJSON data for countries
    fetch('/data/world.geojson')
        .then(response => response.json())
        .then(data => {
            geoJsonLayer = L.geoJson(data, {
                style: getCountryStyle,
                onEachFeature: onEachCountry
            }).addTo(map);
        })
        .catch(err => console.error("Error loading world data:", err));

    // Listen to zoom events to show cities only when zoomed in enough
    map.on('zoomend', () => {
        if (isCountrySelected && selectedCountryName) {
            if (map.getZoom() >= 4) {
                // If we haven't rendered them yet, do it now
                if (cityMarkers.length === 0) {
                    showCitiesForCountry(selectedCountryName);
                }
            } else {
                // Hide if we zoom too far out
                clearCityMarkers();
            }
        }
    });
}

function loadCitiesData() {
    fetch('/data/cities.json')
        .then(response => response.json())
        .then(data => {
            allCities = data;
        })
        .catch(err => console.error("Error loading cities data:", err));
}

// Styling for countries
function getCountryStyle(feature) {
    return {
        fillColor: '#1e293b', // Slate 800
        weight: 1,
        opacity: 1,
        color: '#334155', // Slate 700
        fillOpacity: 0.7
    };
}

function onEachCountry(feature, layer) {
    layer.on({
        mouseover: highlightCountry,
        mouseout: resetCountryHighlight,
        click: zoomToCountry
    });
}

function highlightCountry(e) {
    if (isCountrySelected) return; // Don't highlight if a country is already picked

    const layer = e.target;
    layer.setStyle({
        weight: 2,
        color: '#38bdf8', // Light blue border
        fillOpacity: 0.9,
        fillColor: '#0ea5e9' // Sky 500
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
}

function resetCountryHighlight(e) {
    if (isCountrySelected) return;
    geoJsonLayer.resetStyle(e.target);
}

function zoomToCountry(e) {
    const layer = e.target;
    selectedCountryName = layer.feature.properties.name;

    // Set state
    isCountrySelected = true;

    // Hide welcome overlay
    document.getElementById('welcome-overlay').classList.add('fade-out');

    // Show Back button
    document.getElementById('back-to-world').style.display = 'block';

    // Highlight selected
    geoJsonLayer.eachLayer(l => geoJsonLayer.resetStyle(l)); // Reset all
    layer.setStyle({
        weight: 2,
        color: '#38bdf8',
        fillOpacity: 0.4,
        fillColor: '#38bdf8'
    });

    // Animate zoom to country bounds
    // (This flyToBounds triggers zoomend, which then adds the city markers if >= zoom 4)
    map.flyToBounds(layer.getBounds(), {
        padding: [50, 50],
        duration: 1.5
    });
}

function showCitiesForCountry(countryName) {
    clearCityMarkers();

    const citiesInCountry = allCities.filter(c =>
        c.country && (c.country.toLowerCase() === countryName.toLowerCase() ||
            c.country.toLowerCase() === layerCountryCodeHack(countryName).toLowerCase())
    );

    if (citiesInCountry.length === 0) {
        // Show a temporary tooltip if no data
        showToast(`No mock data available for ${countryName}`);
        return;
    }

    citiesInCountry.forEach(city => {
        // Create custom HTML icon
        const customIcon = L.divIcon({
            className: 'custom-city-marker',
            html: `<div class="marker-pin" title="${city.name}"></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });

        const marker = L.marker([city.lat, city.lng], { icon: customIcon })
            .addTo(map)
            .bindTooltip(`<strong>${city.name}</strong>`, { direction: 'top', offset: [0, -10] });

        marker.on('click', () => {
            // Redirect to the new Gezimanya-style City Detail page
            window.location.href = `/City/Detail/${city.id}`;
        });

        cityMarkers.push(marker);
    });
}

function clearCityMarkers() {
    cityMarkers.forEach(marker => map.removeLayer(marker));
    cityMarkers = [];
}

function setupEventListeners() {
    document.getElementById('back-to-world')?.addEventListener('click', resetMap);
    document.getElementById('close-card-btn')?.addEventListener('click', hideCityDetailCard);
}

function resetMap() {
    isCountrySelected = false;
    selectedCountryName = null;
    clearCityMarkers();
    hideCityDetailCard();

    document.getElementById('back-to-world').style.display = 'none';
    document.getElementById('welcome-overlay').classList.remove('fade-out');

    geoJsonLayer.eachLayer(l => geoJsonLayer.resetStyle(l)); // Reset styles

    map.flyTo([20, 0], 2, { duration: 1.5 });
}

function showCityDetailCard(city) {
    document.getElementById('city-title').textContent = city.name;
    document.getElementById('city-desc').textContent = city.description;

    const placesList = document.getElementById('places-list');
    placesList.innerHTML = '';

    city.places.forEach(place => {
        const li = document.createElement('li');
        li.className = 'place-item';

        let stars = '';
        const roundedRtg = Math.round(place.rating);
        for (let i = 0; i < 5; i++) {
            stars += `<i class="fa-${i < roundedRtg ? 'solid' : 'regular'} fa-star text-warning" style="font-size: 0.7rem;"></i>`;
        }

        li.innerHTML = `
            <div class="place-header">
                <span class="place-name">${place.name}</span>
                <span class="place-rating">${place.rating} <i class="fa-solid fa-star"></i></span>
            </div>
            <div class="place-type"><i class="fa-solid fa-tag me-1"></i>${place.type}</div>
        `;
        placesList.appendChild(li);
    });

    const card = document.getElementById('city-detail-card');
    card.classList.add('show');
}

function hideCityDetailCard() {
    const card = document.getElementById('city-detail-card');
    card.classList.remove('show');
}

// Temporary hack to map GeoJSON name to Code for our mock logic
function layerCountryCodeHack(name) {
    const map = {
        "United States of America": "United States",
        "Turkey": "Turkey",
        "Italy": "Italy",
        "France": "France",
        "Japan": "Japan"
    };
    return map[name] || "";
}

function showToast(message) {
    // Simple alert replacement for non-intrusive feedback
    const toast = document.createElement('div');
    toast.style.position = 'absolute';
    toast.style.bottom = '20px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.background = 'rgba(0,0,0,0.8)';
    toast.style.color = 'white';
    toast.style.padding = '10px 20px';
    toast.style.borderRadius = '5px';
    toast.style.zIndex = '9999';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}
