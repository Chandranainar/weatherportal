// Weather Cache Manager
class WeatherCacheManager {
    constructor(options = {}) {
        this.weatherCacheKey = 'tnWeatherCache';
        this.forecastCacheKey = 'tnForecastCache';
        this.refreshInterval = options.refreshInterval || 300000; // 5 minutes
        this.maxAge = options.maxAge || 3600000; // 1 hour
        this.isOnline = navigator.onLine;
        this.setupEventListeners();
        this.startAutoRefresh();
    }

    setupEventListeners() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.updateOnlineStatus();
            this.refreshAllData();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.updateOnlineStatus();
        });

        // Initial status update
        this.updateOnlineStatus();
    }

    updateOnlineStatus() {
        const statusIndicator = document.getElementById('connection-status');
        if (!statusIndicator) {
            // Create status indicator if it doesn't exist
            const nav = document.querySelector('.navbar-nav');
            if (nav) {
                const statusLi = document.createElement('li');
                statusLi.className = 'nav-item d-flex align-items-center ms-3';
                statusLi.innerHTML = `
                    <div id="connection-status" class="d-flex align-items-center">
                        <span class="status-dot ${this.isOnline ? 'bg-success' : 'bg-warning'}" 
                              style="width: 8px; height: 8px; border-radius: 50%; display: inline-block; margin-right: 5px;"></span>
                        <span class="status-text" style="color: white; font-size: 0.9em;">
                            ${this.isOnline ? 'Online' : 'Offline (Cached Data)'}
                        </span>
                    </div>
                `;
                nav.appendChild(statusLi);
            }
        } else {
            const dot = statusIndicator.querySelector('.status-dot');
            const text = statusIndicator.querySelector('.status-text');
            
            dot.className = `status-dot ${this.isOnline ? 'bg-success' : 'bg-danger'}`;
            text.textContent = this.isOnline ? 'Online' : 'Offline';
        }
    }

    // Save weather data to localStorage
    async saveWeatherData(district, data) {
        try {
            const cache = this.getCache(this.weatherCacheKey);
            cache[district] = {
                data: data,
                timestamp: new Date().getTime()
            };
            localStorage.setItem(this.weatherCacheKey, JSON.stringify(cache));
            return true;
        } catch (error) {
            console.error('Error saving to cache:', error);
            return false;
        }
    }

    // Save forecast data to localStorage
    async saveForecastData(district, data) {
        try {
            const cache = this.getCache(this.forecastCacheKey);
            cache[district] = {
                data: data,
                timestamp: new Date().getTime()
            };
            localStorage.setItem(this.forecastCacheKey, JSON.stringify(cache));
            return true;
        } catch (error) {
            console.error('Error saving forecast to cache:', error);
            return false;
        }
    }

    // Get weather data from localStorage
    getWeatherData(district) {
        return this.getCacheData(district, this.weatherCacheKey);
    }

    // Get forecast data from localStorage
    getForecastData(district) {
        return this.getCacheData(district, this.forecastCacheKey);
    }

    // Generic function to get cached data
    getCacheData(district, cacheKey) {
        try {
            const cache = this.getCache(cacheKey);
            const cachedData = cache[district];
            
            if (!cachedData) return null;

            const age = new Date().getTime() - cachedData.timestamp;
            // Only remove old data if we're online and can fetch new data
            if (age > this.maxAge && this.isOnline) {
                // Data is too old and we're online, remove it
                delete cache[district];
                localStorage.setItem(cacheKey, JSON.stringify(cache));
                return null;
            }
            
            // If we're offline, always return cached data regardless of age
            if (!this.isOnline) {
                cachedData.data.isOfflineData = true;
                cachedData.data.lastUpdated = new Date(cachedData.timestamp).toLocaleString();
                return cachedData.data;
            }

            return {
                ...cachedData.data,
                isOfflineData: !this.isOnline,
                lastUpdated: new Date(cachedData.timestamp).toLocaleString()
            };
        } catch (error) {
            console.error('Error reading from cache:', error);
            return null;
        }
    }

    // Get entire cache for a specific key
    getCache(cacheKey) {
        try {
            return JSON.parse(localStorage.getItem(cacheKey) || '{}');
        } catch {
            return {};
        }
    }

    // Clear entire cache
    clearCache() {
        localStorage.removeItem(this.weatherCacheKey);
        localStorage.removeItem(this.forecastCacheKey);
    }

    // Refresh all cached data if online
    async refreshAllData() {
        if (!this.isOnline) return;

        const cache = this.getCache();
        for (const district in cache) {
            try {
                const coords = window.weatherUtils.getDistrictCoordinates(district);
                if (coords) {
                    const freshData = await window.weatherUtils.getWeatherData(coords[0], coords[1]);
                    if (freshData) {
                        await this.saveWeatherData(district, freshData);
                    }
                }
            } catch (error) {
                console.error(`Error refreshing data for ${district}:`, error);
            }
        }
    }

    // Start auto-refresh mechanism
    startAutoRefresh() {
        setInterval(() => {
            if (this.isOnline) {
                this.refreshAllData();
            }
        }, this.refreshInterval);
    }
}

// Initialize cache manager with longer maxAge for offline resilience
const weatherCache = new WeatherCacheManager({
    refreshInterval: 300000, // 5 minutes
    maxAge: 24 * 3600000 // 24 hours - keep data longer for offline access
});

// Store the cache manager instance globally
window.weatherCache = weatherCache;
