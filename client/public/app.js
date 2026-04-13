// State Management
const state = {
    user: null,
    currentPage: 'home',
    chartData: null,
    map: null,
    properties: [],
    backendUrl: 'http://localhost:5000',
    ai: {
        rating: { loading: false, value: null, summary: null },
        live: { loading: false, value: null, summary: null }
    }
};

// DOM Elements
const elements = {
    nav: document.getElementById('nav'),
    navLinks: document.querySelectorAll('.nav-link'),
    loginBtn: document.getElementById('loginBtn'),
    getStartedBtn: document.getElementById('getStartedBtn'),
    registerBtn: document.getElementById('openRegisterBtn'),
    loginModal: document.getElementById('loginModal'),
    closeModal: document.getElementById('closeModal'),
    loginForm: document.getElementById('loginForm'),
    pages: document.querySelectorAll('.page'),
    mapSearchInput: document.getElementById('mapSearchInput'),
    mapSearchBtn: document.getElementById('mapSearchBtn')
};

// Puzzle state
let currentPuzzle = '';

// Navigation
function navigateTo(pageName) {
    // Update page visibility
    elements.pages.forEach(page => {
        page.classList.remove('active');
        if (page.id === `${pageName}Page`) {
            page.classList.add('active');
        }
    });

    // Update nav links
    elements.navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === pageName) {
            link.classList.add('active');
        }
    });

    state.currentPage = pageName;
    
    // Initialize page-specific features
    if (pageName === 'dashboard') {
        initializeDashboard();
    }
}

// Modal Control
function openModal() {
    elements.loginModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    elements.loginModal.classList.remove('active');
    document.body.style.overflow = '';
}

// Login Handler
function handleLogin(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get('email') || e.target.querySelector('input[type="email"]').value;

    // Puzzle gate
    const puzzleInput = formData.get('puzzle');
    if (!currentPuzzle) currentPuzzle = generatePuzzle();
    if (!puzzleInput || puzzleInput.trim().toUpperCase() !== currentPuzzle) {
        showNotification('Access denied: puzzle mismatch', 'info');
        currentPuzzle = generatePuzzle();
        renderPuzzle();
        return;
    }
    
    // Mock authentication
    state.user = {
        id: `UID-${Date.now().toString().slice(-6)}`,
        name: email.split('@')[0],
        email: email
    };
    
    // Show success animation
    showNotification('Login successful!', 'success');
    
    // Navigate to dashboard
    setTimeout(() => {
        closeModal();
        navigateTo('dashboard');
    }, 800);
}

function generatePuzzle() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let out = '';
    for (let i = 0; i < 6; i++) {
        out += chars[Math.floor(Math.random() * chars.length)];
    }
    return out;
}

function renderPuzzle() {
    const puzzleEl = document.getElementById('puzzleCode');
    if (puzzleEl) puzzleEl.textContent = currentPuzzle || generatePuzzle();
}

// Dashboard Initialization
function initializeDashboard() {
    if (!state.chartData) {
        initializeChart();
    }
    if (!state.map) {
        initializeMap();
    }
    animateStats();
    fetchProperties();
}

// Register page logic
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(registerForm).entries());
        showNotification('Requesting location...', 'info');
        getLocation().then((coords) => {
            data.location = coords;
            submitRegistration(data);
        }).catch(() => {
            submitRegistration(data);
        });
    });
}

// Profile page logic
const profileForm = document.getElementById('profileForm');
if (profileForm) {
    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const data = Object.fromEntries(new FormData(profileForm).entries());
        
        const result = await apiService.updateProfile(data);
        if (result && result.success) {
            showNotification('Profile updated successfully', 'success');
            localStorage.setItem('user', JSON.stringify(result.user));
            loadUserProfile();
        } else {
            showNotification('Failed to update profile', 'error');
        }
    });
}

// Load user profile data
function loadUserProfile() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user && user.id) {
        document.getElementById('profileLink').style.display = 'block';
        document.getElementById('loginBtn').textContent = user.name || 'Account';
        
        if (document.getElementById('profName')) {
            document.getElementById('profName').value = user.name || '';
            document.getElementById('profMobile').value = user.mobile || '';
            document.getElementById('profEmail').value = user.email || '';
            document.getElementById('profLocation').value = user.location ? `${user.location.lat}, ${user.location.lng}` : '';
            document.getElementById('profileJoinDate').textContent = new Date().toLocaleDateString();
        }
    }
}

// Logout handler
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        showNotification('Logged out successfully', 'success');
        navigateTo('home');
        location.reload();
    });
}

function getLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) return reject();
        navigator.geolocation.getCurrentPosition(
            (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            () => reject(),
            { enableHighAccuracy: true, timeout: 5000 }
        );
    });
}

function submitRegistration(data) {
    apiService.registerUser(data).then((res) => {
        if (res?.success) {
            showNotification('Registered successfully', 'success');
            navigateTo('dashboard');
        } else {
            showNotification(res?.message || 'Registration submitted (mock)', 'info');
        }
    }).catch(() => showNotification('Registration failed', 'info'));
}

// Initialize Map
function initializeMap() {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;
    
    // Initialize Leaflet map centered on India
    state.map = L.map('map').setView([20.5937, 78.9629], 5);
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(state.map);
    
    // Add some default property markers
    const defaultProperties = [
        { lat: 29.6857, lng: 76.9905, name: 'SRV-442/B', location: 'Karnal, Haryana', value: '₹5.04M' },
        { lat: 28.7041, lng: 77.1025, name: 'PLT-123/A', location: 'Delhi', value: '₹8.2M' },
        { lat: 19.0760, lng: 72.8777, name: 'MUM-567/C', location: 'Mumbai', value: '₹12.5M' }
    ];
    
    defaultProperties.forEach((prop, index) => {
        const marker = L.marker([prop.lat, prop.lng], {
            icon: L.divIcon({
                className: 'custom-marker',
                html: '',
                iconSize: [30, 30],
                iconAnchor: [15, 30]
            })
        }).addTo(state.map);
        
        marker.bindPopup(`
            <div class="popup-title">${prop.name}</div>
            <div class="popup-info">
                <strong>Location:</strong> ${prop.location}<br>
                <div class="popup-value">Current Value: ${prop.value}</div>
            </div>
        `);
        
        if (index === 0) {
            state.map.setView([prop.lat, prop.lng], 10);
        }
    });
    
    // Add fullscreen handler
    const fullscreenBtn = document.getElementById('fullscreenMap');
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', () => {
            const mapCard = document.querySelector('.map-card');
            if (!document.fullscreenElement) {
                if (mapCard.requestFullscreen) {
                    mapCard.requestFullscreen();
                } else if (mapCard.webkitRequestFullscreen) {
                    mapCard.webkitRequestFullscreen();
                } else if (mapCard.msRequestFullscreen) {
                    mapCard.msRequestFullscreen();
                }
                setTimeout(() => state.map.invalidateSize(), 200);
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                }
                setTimeout(() => state.map.invalidateSize(), 200);
            }
        });
    }
    
    // Handle fullscreen changes
    document.addEventListener('fullscreenchange', () => {
        if (state.map) {
            setTimeout(() => state.map.invalidateSize(), 100);
        }
    });
}

async function handleMapSearch() {
    const query = elements.mapSearchInput?.value?.trim();
    if (!query) {
        showNotification('Please enter a location or survey number', 'info');
        return;
    }
    
    showNotification(`Searching for ${query}...`, 'info');
    
    // Ensure map is initialized
    if (!state.map) {
        showNotification('Map not initialized, please navigate to dashboard', 'error');
        return;
    }
    
    try {
        // First, geocode the address
        const geo = await apiService.geocodeAddress(query);
        if (geo && geo.lat && geo.lng) {
            // Get location details from Gemini API
            const locationDetails = await apiService.getLocationDetails(query, geo.lat, geo.lng);
            
            // Create and add marker
            const marker = L.marker([geo.lat, geo.lng], {
                icon: L.divIcon({ 
                    className: 'custom-marker', 
                    html: '', 
                    iconSize: [30, 30], 
                    iconAnchor: [15, 30] 
                })
            }).addTo(state.map);
            
            // Create popup with location and location details
            const estimatedRate = estimateRate();
            let popupContent = `<div class="popup-title" style="font-weight:600;font-size:0.95rem;margin-bottom:0.5rem;">${geo.formatted || query}</div>`;
            popupContent += `<div class="popup-info" style="font-size:0.85rem;color:#666;margin-bottom:0.5rem;">Est. Rate: ₹${estimatedRate}/sq.yd</div>`;
            
            if (locationDetails && locationDetails.success) {
                popupContent += `<div class="popup-details" style="font-size:0.8rem;color:#555;margin-top:0.5rem;border-top:1px solid #ddd;padding-top:0.5rem;">`;
                if (locationDetails.details) {
                    popupContent += `<p><strong>Details:</strong> ${typeof locationDetails.details === 'string' ? locationDetails.details : JSON.stringify(locationDetails.details).substring(0, 150)}</p>`;
                }
                popupContent += `</div>`;
            }
            
            marker.bindPopup(popupContent).openPopup();
            
            // Center map on marker
            state.map.setView([geo.lat, geo.lng], 14);
            showNotification(`Found: ${geo.formatted || query}`, 'success');
            
            // Clear search input after successful search
            elements.mapSearchInput.value = '';
        } else {
            showNotification('Location not found. Try a different search term', 'info');
        }
    } catch (error) {
        console.error('Search error:', error);
        showNotification('Error searching location. Try again', 'error');
    }
}

function estimateRate() {
    if (state.properties.length === 0) return '2,450';
    const total = state.properties.reduce((sum, p) => sum + (p.current_value || 0), 0);
    const avg = total / state.properties.length / 2500;
    return Math.max(1200, Math.round(avg)).toLocaleString();
}

// Fetch Properties from Backend
async function fetchProperties() {
    try {
        state.properties = await apiService.fetchProperties();
        updateMapMarkers();
        updateStats();
    } catch (error) {
        console.log('Using default properties');
    }
}

// Update Map Markers with Backend Data
function updateMapMarkers() {
    if (!state.map || state.properties.length === 0) return;
    
    state.properties.forEach(property => {
        if (property.coordinates) {
            const marker = L.marker([property.coordinates.lat, property.coordinates.lng], {
                icon: L.divIcon({
                    className: 'custom-marker',
                    html: '',
                    iconSize: [30, 30],
                    iconAnchor: [15, 30]
                })
            }).addTo(state.map);
            
            marker.bindPopup(`
                <div class="popup-title">${property.survey_no}</div>
                <div class="popup-info">
                    <strong>Location:</strong> ${property.location}<br>
                    <strong>Size:</strong> ${property.area_sqyd} sq.yd<br>
                    <div class="popup-value">₹${(property.current_value / 100000).toFixed(2)}L</div>
                </div>
            `);
        }
    });
}

// Chart Initialization
function initializeChart() {
    const canvas = document.getElementById('valueChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const data = [4.5, 4.59, 4.71, 4.86, 4.95, 5.04];
    const labels = ['M1', 'M2', 'M3', 'M4', 'M5', 'M6'];
    
    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    const padding = 40;
    const width = canvas.width - padding * 2;
    const height = canvas.height - padding * 2;
    
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min;
    
    // Draw grid
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
        const y = padding + (height / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(padding + width, y);
        ctx.stroke();
    }
    
    // Draw line
    ctx.strokeStyle = '#2D5016';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    const points = data.map((value, index) => {
        const x = padding + (width / (data.length - 1)) * index;
        const y = padding + height - ((value - min) / range) * height;
        return { x, y };
    });
    
    // Animate line drawing
    let progress = 0;
    function drawLine() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Redraw grid
        ctx.strokeStyle = '#E5E7EB';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
            const y = padding + (height / 5) * i;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(padding + width, y);
            ctx.stroke();
        }
        
        // Draw line with gradient
        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, '#2D5016');
        gradient.addColorStop(1, '#4A7C29');
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        const drawPoints = Math.floor(points.length * progress);
        points.slice(0, drawPoints).forEach((point, i) => {
            if (i === 0) {
                ctx.moveTo(point.x, point.y);
            } else {
                ctx.lineTo(point.x, point.y);
            }
        });
        
        if (drawPoints > 0 && drawPoints < points.length) {
            const lastPoint = points[drawPoints - 1];
            const nextPoint = points[drawPoints];
            const fraction = (points.length * progress) % 1;
            const x = lastPoint.x + (nextPoint.x - lastPoint.x) * fraction;
            const y = lastPoint.y + (nextPoint.y - lastPoint.y) * fraction;
            ctx.lineTo(x, y);
        }
        
        ctx.stroke();
        
        // Draw points
        points.slice(0, drawPoints).forEach((point, i) => {
            ctx.fillStyle = '#2D5016';
            ctx.beginPath();
            ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // Draw labels
        ctx.fillStyle = '#6B7280';
        ctx.font = '12px Inter';
        ctx.textAlign = 'center';
        points.forEach((point, i) => {
            ctx.fillText(labels[i], point.x, canvas.height - 10);
        });
        
        if (progress < 1) {
            progress += 0.02;
            requestAnimationFrame(drawLine);
        }
    }
    
    drawLine();
    state.chartData = data;
}

// Animate Stats
function animateStats() {
    const statValues = document.querySelectorAll('.stat-value');
    statValues.forEach(stat => {
        const text = stat.textContent;
        const match = text.match(/[\d.]+/);
        if (match) {
            const target = parseFloat(match[0]);
            animateValue(stat, 0, target, 1000, text);
        }
    });
}

function animateValue(element, start, end, duration, template) {
    const startTime = performance.now();
    const isInteger = Number.isInteger(end) && !template.includes('.');
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = start + (end - start) * easeOutQuart;
        
        const formatted = isInteger ? Math.round(current).toString() : current.toFixed(2);
        element.textContent = template.replace(/[\d.]+/, formatted);
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 2rem;
        background: ${type === 'success' ? '#10B981' : '#3B82F6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        z-index: 3000;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Scroll Animations
const observerOptions = {
    threshold: 0.2,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Observe elements
document.querySelectorAll('.animate-on-scroll').forEach(el => {
    observer.observe(el);
});

// Scroll navbar effect
let lastScroll = 0;
window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 50) {
        elements.nav.classList.add('scrolled');
    } else {
        elements.nav.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
});

// Event Listeners
elements.navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = link.dataset.page;
        if (page === 'dashboard' && !state.user) {
            openModal();
        } else {
            navigateTo(page);
        }
    });
});

elements.loginBtn?.addEventListener('click', openModal);
elements.getStartedBtn?.addEventListener('click', openModal);
elements.registerBtn?.addEventListener('click', () => navigateTo('register'));
elements.closeModal?.addEventListener('click', closeModal);

elements.loginModal?.querySelector('.modal-overlay')?.addEventListener('click', closeModal);

elements.loginForm?.addEventListener('submit', handleLogin);

// Map search
elements.mapSearchBtn?.addEventListener('click', () => handleMapSearch());
elements.mapSearchInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        handleMapSearch();
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && elements.loginModal.classList.contains('active')) {
        closeModal();
    }
});

// Quick Action Handlers
function setupQuickActions() {
    const actionButtons = document.querySelectorAll('.action-btn');
    
    actionButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const actionText = btn.querySelector('span').textContent;
            
            switch(actionText) {
                case 'Search Land':
                    handleSearchLand();
                    break;
                case 'Compare':
                    handleCompare();
                    break;
                case 'Upload':
                    handleUpload();
                    break;
                case 'Report':
                    handleReport();
                    break;
                case 'Rate':
                    handleRateLand();
                    break;
                case 'Live Update':
                    handleLiveUpdate();
                    break;
            }
        });
    });
}

function handleSearchLand() {
    const searchTerm = elements.mapSearchInput?.value?.trim() || prompt('Enter Survey Number or Location:');
    if (searchTerm) {
        showNotification(`Searching for: ${searchTerm}`, 'info');
        apiService.searchLand(searchTerm).then(result => {
            if (result.success && result.results) {
                state.properties = result.results;
                updateMapMarkers();
                showNotification(`Found ${result.results.length} properties`, 'success');
            } else {
                showNotification('No properties found', 'info');
            }
        });
    }
}

function handleCompare() {
    showNotification('Compare feature - Select properties to compare', 'info');
    // TODO: Implement comparison logic
}

function handleUpload() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.jpg,.png,.jpeg';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            showNotification(`Uploading: ${file.name}`, 'info');
            
            apiService.uploadDocument(file).then(result => {
                if (result.success) {
                    showNotification('Document uploaded successfully!', 'success');
                    fetchProperties(); // Refresh properties
                } else {
                    showNotification(result.message || 'Upload failed', 'info');
                }
            });
        }
    };
    input.click();
}

function handleRateLand() {
    const propertyId = state.properties.length > 0 ? (state.properties[0].id || state.properties[0]._id || 'land-001') : 'land-001';
    setAIStatus('loading', 'Fetching rating...');
    toggleAISpinner(true);
    setAIRating({ value: null, summary: 'Working...' });
    apiService.getLandRating(propertyId).then(res => {
        if (res && (res.rating || res.analysis)) {
            const ratingText = res.rating ? `Rating: ${res.rating}` : '';
            const summary = res.analysis ? (res.analysis.summary || res.analysis) : '';
            setAIStatus('success', 'Rating ready');
            setAIRating({ value: ratingText || 'Rating available', summary: summary || 'Result received.' });
            showNotification(`${ratingText} ${summary}`.trim() || 'Rating ready', 'success');
        } else {
            setAIStatus('error', 'Rating unavailable');
            setAIRating({ value: 'N/A', summary: 'No rating returned.' });
            showNotification('Rating unavailable', 'info');
        }
        toggleAISpinner(false);
    });
}

function handleLiveUpdate() {
    const propertyId = state.properties.length > 0 ? (state.properties[0].id || state.properties[0]._id || 'land-001') : 'land-001';
    setAIStatus('loading', 'Fetching live update...');
    toggleAISpinner(true);
    setAILive({ value: null, summary: 'Working...' });
    apiService.getLiveUpdate(propertyId).then(res => {
        if (res && (res.summary || res.trends)) {
            const text = res.summary || JSON.stringify(res.trends);
            setAIStatus('success', 'Live update ready');
            setAILive({ value: 'Update', summary: text });
            showNotification(text, 'success');
        } else {
            setAIStatus('error', 'No live updates');
            setAILive({ value: 'N/A', summary: 'No data returned.' });
            showNotification('No live updates available', 'info');
        }
        toggleAISpinner(false);
    });
}

function handleReport() {
    const propertyId = state.properties.length > 0 ? state.properties[0].id : 'land-001';
    showNotification('Generating report...', 'info');
    
    apiService.generateReport(propertyId).then(blob => {
        if (blob) {
            // Download the report
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `property-report-${propertyId}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            showNotification('Report generated successfully!', 'success');
        } else {
            showNotification('Report generation in progress...', 'info');
        }
    });
}

// Initialize quick actions when dashboard loads
document.addEventListener('DOMContentLoaded', () => {
    setupQuickActions();
    // Initialize API service
    apiService.initialize().then(() => {
        console.log('API Service initialized');
    });

    // Initialize AI panel defaults
    renderAIPanel();

    // Seed puzzle on load
    currentPuzzle = generatePuzzle();
    renderPuzzle();
});

// Add stats update function
function updateStats() {
    if (state.properties.length === 0) return;
    
    const totalValue = state.properties.reduce((sum, p) => sum + (p.current_value || 0), 0);
    const propertyCount = state.properties.length;
    
    // Update stat cards
    const statCards = document.querySelectorAll('.stat-card');
    if (statCards[0]) {
        const valueEl = statCards[0].querySelector('.stat-value');
        if (valueEl) {
            valueEl.textContent = `₹${(totalValue / 1000000).toFixed(2)}M`;
        }
    }
    if (statCards[1]) {
        const countEl = statCards[1].querySelector('.stat-value');
        if (countEl) {
            countEl.textContent = propertyCount.toString();
        }
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// AI Panel helpers
function setAIStatus(status, text) {
    const pill = document.getElementById('aiStatus');
    if (!pill) return;
    pill.classList.remove('loading', 'success', 'error');
    if (status) pill.classList.add(status);
    pill.textContent = text || 'Idle';
}

function setAIRating({ value, summary }) {
    state.ai.rating.value = value;
    state.ai.rating.summary = summary;
    renderAIPanel();
}

function setAILive({ value, summary }) {
    state.ai.live.value = value;
    state.ai.live.summary = summary;
    renderAIPanel();
}

function renderAIPanel() {
    const ratingValueEl = document.getElementById('aiRatingValue');
    const ratingSummaryEl = document.getElementById('aiRatingSummary');
    const liveValueEl = document.getElementById('aiLiveValue');
    const liveSummaryEl = document.getElementById('aiLiveSummary');

    if (ratingValueEl) ratingValueEl.textContent = state.ai.rating.value || '–';
    if (ratingSummaryEl) ratingSummaryEl.textContent = state.ai.rating.summary || 'Trigger “Rate” to fetch.';
    if (liveValueEl) liveValueEl.textContent = state.ai.live.value || '–';
    if (liveSummaryEl) liveSummaryEl.textContent = state.ai.live.summary || 'Trigger “Live Update” to fetch.';
}

function toggleAISpinner(show) {
    const spinner = document.getElementById('aiSpinner');
    if (!spinner) return;
    spinner.hidden = !show;
}

// Initialize
console.log('🌍 GeoValuator initialized');

// Auto-resize chart on window resize
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        if (state.currentPage === 'dashboard' && state.chartData) {
            state.chartData = null;
            initializeChart();
        }
    }, 250);
});
