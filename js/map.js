/**
 * Coca-Cola Global Bottler Map Hub
 * Integrates Leaflet.js with Dark-Theme tiles and coordinates data profiles.
 */
let map;
let markers = [];
let hqMarker;
let activeRegionFilter = 'all';

function initGlobalMap() {
  // Initialize Leaflet map
  // Centered globally with a widescreen focus
  map = L.map('leafletMap', {
    center: [22.0, 10.0],
    zoom: 2,
    minZoom: 2,
    maxZoom: 9,
    zoomControl: false, // Custom position below
    scrollWheelZoom: false // Prevent intrusive scrolling hijack
  });

  // Custom Zoom Control positioning
  L.control.zoom({
    position: 'bottomright'
  }).addTo(map);

  // Load CartoDB Dark Matter Tiles (Free, stable, dark styled)
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
  }).addTo(map);

  // Double click map to zoom, but enable scroll on focus
  map.on('focus', () => {
    map.scrollWheelZoom.enable();
  });
  map.on('blur', () => {
    map.scrollWheelZoom.disable();
  });

  // Render Headquarters Marker (Atlanta, GA)
  renderHeadquartersPin();

  // Render Bottlers Markers
  renderBottlerPins();

  // Setup Map Filter Event Handlers
  setupMapControls();
}

function renderHeadquartersPin() {
  const hq = COKE_DATA.headquarters;
  
  // Custom glowing white/red marker for Global HQ
  const hqIcon = L.divIcon({
    className: 'custom-glow-marker',
    html: `
      <div class="marker-pin-dot" style="background-color: var(--coke-red); border-color: #fff; width: 18px; height: 18px;"></div>
      <div class="marker-pulse-ring" style="border-color: #fff; width: 38px; height: 38px;"></div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });

  hqMarker = L.marker(hq.coords, { icon: hqIcon }).addTo(map);

  // Custom Popup HTML
  const popupContent = `
    <div class="map-popup-card" style="border-top: 3px solid var(--coke-red);">
      <span class="map-popup-tag" style="background-color: rgba(244, 0, 9, 0.15); color: var(--coke-red);">Global HQ</span>
      <h4>${hq.name}</h4>
      <div class="popup-hq">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"></path><circle cx="12" cy="10" r="3"></circle></svg>
        <span>Atlanta, Georgia</span>
      </div>
      <p>The central nervous system of Coca-Cola's global brand. Home of the secret formula, corporate archives, and leadership.</p>
      <div class="popup-stats">
        <span>Est: <strong>1886</strong></span>
        <span>Founder: <strong>Pemberton</strong></span>
      </div>
    </div>
  `;

  hqMarker.bindPopup(popupContent);
  
  hqMarker.on('click', () => {
    map.setView(hq.coords, 6, { animate: true, duration: 1.5 });
    displayHeadquartersProfileInSidebar();
  });
}

function renderBottlerPins() {
  COKE_DATA.bottlers.forEach((bottler) => {
    const regionInfo = COKE_DATA.regions[bottler.region];
    const markerColor = regionInfo.color;

    // Custom pulsing DivIcon keyed to region neon color
    const customIcon = L.divIcon({
      className: 'custom-glow-marker',
      html: `
        <div class="marker-pin-dot" style="background-color: ${markerColor};"></div>
        <div class="marker-pulse-ring" style="border-color: ${markerColor};"></div>
      `,
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });

    const marker = L.marker(bottler.coords, { icon: customIcon }).addTo(map);
    
    // Custom popup
    const popupContent = `
      <div class="map-popup-card" style="border-top: 3px solid ${markerColor};">
        <span class="map-popup-tag" style="background-color: ${markerColor}22; color: ${markerColor};">${regionInfo.name}</span>
        <h4>${bottler.name}</h4>
        <div class="popup-hq">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          <span>${bottler.hq}</span>
        </div>
        <p>${bottler.description.slice(0, 100)}...</p>
        <div class="popup-stats">
          <span>Plants: <strong>${bottler.plants}</strong></span>
          <span>Est: <strong>${bottler.established}</strong></span>
        </div>
      </div>
    `;

    marker.bindPopup(popupContent);
    
    // Attach event callbacks
    marker.on('click', () => {
      map.setView(bottler.coords, 5, { animate: true, duration: 1.2 });
      displayBottlerProfileInSidebar(bottler);
    });

    // Save references to manage filters
    markers.push({
      id: bottler.id,
      region: bottler.region,
      markerInstance: marker,
      data: bottler
    });
  });
}

function displayBottlerProfileInSidebar(bottler) {
  const promptView = document.getElementById('sidebarPromptView');
  const profileView = document.getElementById('sidebarProfileView');
  const regionInfo = COKE_DATA.regions[bottler.region];

  if (!promptView || !profileView) return;

  // Toggle views
  promptView.style.display = 'none';
  profileView.style.display = 'flex';

  // Render profile contents
  profileView.innerHTML = `
    <div class="profile-header">
      <span class="profile-tag" style="background-color: ${regionInfo.color}22; color: ${regionInfo.color};">${regionInfo.name} Region</span>
      <h3>${bottler.name}</h3>
      <div class="profile-hq">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"></path><circle cx="12" cy="10" r="3"></circle></svg>
        <span>HQ: ${bottler.hq}</span>
      </div>
    </div>
    
    <div class="profile-body">
      <p class="profile-bio">${bottler.description}</p>
      
      <div class="profile-stats-grid">
        <div class="profile-stat-box">
          <span>Established</span>
          <strong>${bottler.established}</strong>
        </div>
        <div class="profile-stat-box">
          <span>Bottling Plants</span>
          <strong>${bottler.plants}</strong>
        </div>
        <div class="profile-stat-box">
          <span>Logistics Hubs</span>
          <strong>${bottler.distributionCenters} Centers</strong>
        </div>
        <div class="profile-stat-box">
          <span>Local Staff</span>
          <strong>${bottler.employees.toLocaleString()}</strong>
        </div>
      </div>
      
      <div class="profile-initiative-box" style="border-color: ${regionInfo.color}40; background-color: ${regionInfo.color}07;">
        <h5 style="color: ${regionInfo.color};">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
          Sustainability Initiative
        </h5>
        <p>${bottler.initiatives}</p>
      </div>
    </div>
    
    <div class="profile-footer">
      <button class="map-btn" onclick="zoomToMarkerCoords(${bottler.coords[0]}, ${bottler.coords[1]})" style="width:100%; border-color: ${regionInfo.color}50; color: ${regionInfo.color}; background: rgba(255,255,255,0.02)">
        Recenter Camera on Plant
      </button>
    </div>
  `;
}

function displayHeadquartersProfileInSidebar() {
  const promptView = document.getElementById('sidebarPromptView');
  const profileView = document.getElementById('sidebarProfileView');
  const hq = COKE_DATA.headquarters;

  if (!promptView || !profileView) return;

  promptView.style.display = 'none';
  profileView.style.display = 'flex';

  profileView.innerHTML = `
    <div class="profile-header">
      <span class="profile-tag" style="background-color: var(--coke-red-glow); color: var(--coke-red);">Global HQ Hub</span>
      <h3>${hq.name}</h3>
      <div class="profile-hq">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"></path><circle cx="12" cy="10" r="3"></circle></svg>
        <span>HQ: ${hq.address}</span>
      </div>
    </div>
    
    <div class="profile-body">
      <p class="profile-bio">${hq.description}</p>
      
      <div class="profile-stats-grid">
        <div class="profile-stat-box">
          <span>Founded</span>
          <strong>${hq.established}</strong>
        </div>
        <div class="profile-stat-box">
          <span>Founder</span>
          <strong>Dr. John Pemberton</strong>
        </div>
        <div class="profile-stat-box" style="grid-column: span 2;">
          <span>Strategic Operations</span>
          <strong>${hq.employees}</strong>
        </div>
      </div>
      
      <div class="profile-initiative-box" style="border-color: var(--coke-red-glow); background: rgba(244,0,9,0.03);">
        <h5 style="color: var(--coke-red);">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
          HQ Leadership Role
        </h5>
        <ul style="padding-left: 1rem; font-size: 0.8rem; color: rgba(255,255,255,0.7); display:flex; flex-direction:column; gap:0.4rem;">
          ${hq.highlights.map(h => `<li>${h}</li>`).join('')}
        </ul>
      </div>
    </div>
    
    <div class="profile-footer">
      <button class="map-btn active" onclick="zoomToMarkerCoords(${hq.coords[0]}, ${hq.coords[1]})" style="width:100%;">
        Focus Headquarters Camera
      </button>
    </div>
  `;
}

function zoomToMarkerCoords(lat, lng) {
  if (map) {
    map.setView([lat, lng], 7, { animate: true, duration: 1.5 });
  }
}

function setupMapControls() {
  document.querySelectorAll('.map-btn[data-region]').forEach(button => {
    button.addEventListener('click', (e) => {
      const region = e.target.getAttribute('data-region');
      filterMapByRegion(region);
      
      // Select button
      document.querySelectorAll('.map-btn[data-region]').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
    });
  });
}

function filterMapByRegion(region) {
  activeRegionFilter = region;

  // Zoom fitting variables
  let pointsToFit = [];

  markers.forEach(m => {
    if (region === 'all' || m.region === region) {
      // Show Marker
      m.markerInstance.addTo(map);
      m.markerInstance.setOpacity(1.0);
      pointsToFit.push(m.data.coords);
    } else {
      // Soft hide: Remove or set low opacity
      // We will temporarily remove them from the map layout to avoid cluttered overlays
      map.removeLayer(m.markerInstance);
    }
  });

  // Include headquarters in North America view
  if (region === 'all' || region === 'north-america') {
    hqMarker.addTo(map);
    hqMarker.setOpacity(1.0);
    pointsToFit.push(COKE_DATA.headquarters.coords);
  } else {
    map.removeLayer(hqMarker);
  }

  // Auto-pan / fit bounds perfectly
  if (pointsToFit.length > 0) {
    const bounds = L.latLngBounds(pointsToFit);
    map.fitBounds(bounds, {
      padding: [50, 50],
      maxZoom: 5,
      animate: true,
      duration: 1.5
    });
  } else if (region === 'all') {
    map.setView([22.0, 10.0], 2, { animate: true, duration: 1.5 });
  }
  
  // Re-display generic welcome sidebar view
  resetSidebarPrompt();
}

function resetSidebarPrompt() {
  const promptView = document.getElementById('sidebarPromptView');
  const profileView = document.getElementById('sidebarProfileView');

  if (promptView && profileView) {
    promptView.style.display = 'flex';
    profileView.style.display = 'none';
  }
}

// Global functions for regional cards on the webpage to pan the map
function linkRegionCardToMap(regionId) {
  // Sync the map filter button
  const mapBtn = document.querySelector(`.map-btn[data-region="${regionId}"]`);
  if (mapBtn) {
    mapBtn.click();
  }
  
  // Scroll map section smoothly into focus
  document.getElementById('map-hub').scrollIntoView({ behavior: 'smooth' });
}
