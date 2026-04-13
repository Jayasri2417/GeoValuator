// API Service for GeoValuator
class APIService {
    constructor() {
        this.backendUrl = 'http://localhost:5000';
        this.googleMapsApiKey = '';
        this.initialized = false;
    }

    async initialize() {
        try {
            const response = await fetch('/api/config');
            const config = await response.json();
            this.googleMapsApiKey = config.googleMapsApiKey;
            this.backendUrl = config.backendUrl;
            this.initialized = true;
            
            // Load Google Maps script with actual API key
            if (this.googleMapsApiKey && this.googleMapsApiKey !== 'your_google_maps_api_key') {
                this.loadGoogleMapsScript();
            }
        } catch (error) {
            console.warn('Could not load config, using defaults');
        }
    }

    loadGoogleMapsScript() {
        const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
        if (existingScript) {
            existingScript.remove();
        }
        
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${this.googleMapsApiKey}&libraries=places,geometry`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
    }

    // Land API endpoints
    async fetchProperties() {
        // Use client server mock endpoint for property listing
        try {
            const response = await fetch('/api/properties', {
                headers: { 'Content-Type': 'application/json' }
            });
            if (response.ok) {
                const data = await response.json();
                return data.properties || [];
            }
        } catch (error) {
            console.log('Properties endpoint unavailable, using mock data');
        }
        return this.getMockProperties();
    }

    async searchLand(query) {
        try {
            const response = await fetch(`${this.backendUrl}/api/land/search?q=${encodeURIComponent(query)}`, {
                headers: { 'Content-Type': 'application/json' }
            });
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error('Search failed:', error);
        }
        return { success: false, message: 'Search service unavailable' };
    }

    async getLandRating(landId) {
        try {
            const response = await fetch(`${this.backendUrl}/api/ai/rate-land`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ landId })
            });
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error('Rating failed:', error);
        }
        return { rating: 'N/A', analysis: 'Rating service unavailable' };
    }

    async getLiveUpdate(propertyId) {
        try {
            const response = await fetch(`${this.backendUrl}/api/ai/live-update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ propertyId })
            });
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error('Live update failed:', error);
        }
        return null;
    }

    async uploadDocument(file) {
        const formData = new FormData();
        formData.append('document', file);
        
        try {
            const response = await fetch(`${this.backendUrl}/api/land/upload`, {
                method: 'POST',
                body: formData
            });
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error('Upload failed:', error);
        }
        return { success: false, message: 'Upload service unavailable' };
    }

    async generateReport(propertyId) {
        // Hit backend PDF evidence generator
        try {
            const response = await fetch(`${this.backendUrl}/api/generate-evidence/${propertyId}`);
            if (response.ok) {
                const blob = await response.blob();
                return blob;
            }
        } catch (error) {
            console.error('Report generation failed:', error);
        }
        return null;
    }

    // Geocoding with Google Maps
    async geocodeAddress(address) {
        if (window.google && window.google.maps) {
            const geocoder = new google.maps.Geocoder();
            return new Promise((resolve, reject) => {
                geocoder.geocode({ address }, (results, status) => {
                    if (status === 'OK' && results[0]) {
                        resolve({
                            lat: results[0].geometry.location.lat(),
                            lng: results[0].geometry.location.lng(),
                            formatted: results[0].formatted_address
                        });
                    } else {
                        reject(new Error('Geocoding failed'));
                    }
                });
            });
        }
        // Fallback: call backend geocode if available
        try {
            const res = await fetch(`${this.backendUrl}/api/geocode?address=${encodeURIComponent(address)}`);
            if (res.ok) {
                const data = await res.json();
                if (data?.location) {
                    return { lat: data.location.lat, lng: data.location.lng, formatted: data.formatted_address || address };
                }
            }
        } catch (error) {
            console.warn('Geocode fallback failed', error);
        }
        return null;
    }

    async registerUser(payload) {
        try {
            const response = await fetch(`${this.backendUrl}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (response.ok) {
                const data = await response.json();
                if (data.token) {
                    localStorage.setItem('authToken', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                }
                return data;
            }
            const error = await response.json();
            throw new Error(error.error || 'Registration failed');
        } catch (error) {
            console.warn('Register error', error);
            return { success: false, message: error.message };
        }
    }

    async updateProfile(payload) {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) throw new Error('Not authenticated');
            
            const response = await fetch(`${this.backendUrl}/api/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('user', JSON.stringify(data.user));
                return data;
            }
        } catch (error) {
            console.warn('Profile update error', error);
        }
        return null;
    }

    async getLocationDetails(query, lat, lng) {
        try {
            const response = await fetch(`${this.backendUrl}/api/ai/search-suggest`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query, lat, lng })
            });
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.warn('Location details error', error);
        }
        return null;
    }

    async getMarketRates(location) {
        try {
            if (!this.initialized) {
                await this.initialize();
            }
            const response = await fetch(`${this.backendUrl}/api/ai/market-rates`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ location })
            });
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.warn('Market rates error', error);
        }
        return null;
    }

    getMockProperties() {
        return [
            {
                id: 'land-001',
                survey_no: 'SRV-442/B',
                location: 'Karnal, Haryana',
                address: 'Sector 14, Karnal',
                area_sqyd: 2500,
                current_value: 5040000,
                coordinates: { lat: 29.6857, lng: 76.9905 }
            },
            {
                id: 'land-002',
                survey_no: 'PLT-123/A',
                location: 'Delhi',
                address: 'Connaught Place, Delhi',
                area_sqyd: 1800,
                current_value: 8200000,
                coordinates: { lat: 28.7041, lng: 77.1025 }
            },
            {
                id: 'land-003',
                survey_no: 'MUM-567/C',
                location: 'Mumbai',
                address: 'Marine Drive, Mumbai',
                area_sqyd: 3200,
                current_value: 12500000,
                coordinates: { lat: 19.0760, lng: 72.8777 }
            }
        ];
    }
}

// Export singleton instance
const apiService = new APIService();
window.apiService = apiService;
