// ============================================================
//  SITE.JS – Gezi Rehberi
//  Genel yardımcı fonksiyonlar
//  NOT: Tüm harita (Leaflet) ve landing-page mantığı map.js içinde.
//  Bu dosyada map değişkeni TANIMLANMAZ – map.js ile çakışmayı önler.
// ============================================================

// ── City detail card helpers (map.js içinden çağrılır) ────
function showCityDetailCard(city) {
    const titleEl = document.getElementById('city-title');
    const descEl  = document.getElementById('city-desc');
    const placesList = document.getElementById('places-list');
    const card = document.getElementById('city-detail-card');

    if (!card) return;

    if (titleEl) titleEl.textContent = city.name;
    if (descEl)  descEl.textContent = city.description;

    if (placesList) {
        placesList.innerHTML = '';
        (city.places || []).forEach(place => {
            const li = document.createElement('li');
            li.className = 'place-item';
            li.innerHTML = `
                <div class="place-header">
                    <span class="place-name">${place.name}</span>
                    <span class="place-rating">${place.rating} <i class="fa-solid fa-star"></i></span>
                </div>
                <div class="place-type"><i class="fa-solid fa-tag me-1"></i>${place.type}</div>
            `;
            placesList.appendChild(li);
        });
    }

    card.classList.add('show');
}

function hideCityDetailCard() {
    const card = document.getElementById('city-detail-card');
    if (card) card.classList.remove('show');
}

// ── Toast helper ──────────────────────────────────────────
function showToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = [
        'position:fixed',
        'bottom:24px',
        'left:50%',
        'transform:translateX(-50%)',
        'background:rgba(15,23,42,0.92)',
        'color:#f1f5f9',
        'padding:10px 22px',
        'border-radius:8px',
        'border:1px solid rgba(255,255,255,0.12)',
        'font-size:0.88rem',
        'z-index:99999',
        'backdrop-filter:blur(8px)',
        'box-shadow:0 8px 24px rgba(0,0,0,0.5)'
    ].join(';');
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}
