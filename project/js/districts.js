const districts = {
    'Ariyalur': {
        coords: [11.1400, 79.0786],
        region: 'Central'
    },
    'Chengalpattu': {
        coords: [12.6819, 79.9888],
        region: 'North'
    },
    'Chennai': {
        coords: [13.0827, 80.2707],
        region: 'North'
    },
    'Coimbatore': {
        coords: [11.0168, 76.9558],
        region: 'West'
    },
    'Cuddalore': {
        coords: [11.7480, 79.7714],
        region: 'East'
    },
    'Dharmapuri': {
        coords: [12.1289, 78.1583],
        region: 'Northwest'
    },
    'Dindigul': {
        coords: [10.3624, 77.9695],
        region: 'South'
    },
    'Erode': {
        coords: [11.3410, 77.7172],
        region: 'West'
    },
    'Kallakurichi': {
        coords: [11.7383, 78.9571],
        region: 'Northeast'
    },
    'Kanchipuram': {
        coords: [12.8342, 79.7036],
        region: 'North'
    },
    'Kanyakumari': {
        coords: [8.0883, 77.5385],
        region: 'South'
    },
    'Karur': {
        coords: [10.9601, 78.0766],
        region: 'Central'
    },
    'Krishnagiri': {
        coords: [12.5265, 78.2150],
        region: 'Northwest'
    },
    'Madurai': {
        coords: [9.9252, 78.1198],
        region: 'South'
    },
    'Nagapattinam': {
        coords: [10.7672, 79.8449],
        region: 'East'
    },
    'Namakkal': {
        coords: [11.2342, 78.1673],
        region: 'West'
    },
    'Nilgiris': {
        coords: [11.4102, 76.6950],
        region: 'West'
    },
    'Perambalur': {
        coords: [11.2342, 78.8807],
        region: 'Central'
    },
    'Pudukkottai': {
        coords: [10.3833, 78.8001],
        region: 'South'
    },
    'Ramanathapuram': {
        coords: [9.3639, 78.8395],
        region: 'Southeast'
    },
    'Salem': {
        coords: [11.6643, 78.1460],
        region: 'West'
    },
    'Sivaganga': {
        coords: [9.8433, 78.4809],
        region: 'South'
    },
    'Thanjavur': {
        coords: [10.7870, 79.1378],
        region: 'East'
    },
    'Theni': {
        coords: [10.0104, 77.4768],
        region: 'Southwest'
    },
    'Thoothukudi': {
        coords: [8.7642, 78.1348],
        region: 'South'
    },
    'Tiruchirappalli': {
        coords: [10.7905, 78.7047],
        region: 'Central'
    },
    'Tirunelveli': {
        coords: [8.7139, 77.7567],
        region: 'South'
    },
    'Tiruppur': {
        coords: [11.1085, 77.3411],
        region: 'West'
    },
    'Tiruvallur': {
        coords: [13.1231, 79.9119],
        region: 'North'
    },
    'Tiruvannamalai': {
        coords: [12.2253, 79.0747],
        region: 'North'
    },
    'Tiruvarur': {
        coords: [10.7661, 79.6344],
        region: 'East'
    },
    'Vellore': {
        coords: [12.9165, 79.1325],
        region: 'North'
    },
    'Viluppuram': {
        coords: [11.9401, 79.4861],
        region: 'Northeast'
    },
    'Virudhunagar': {
        coords: [9.5680, 77.9624],
        region: 'South'
    },
    'Tenkasi': {
        coords: [8.9594, 77.3161],
        region: 'South'
    },
    'Tirupathur': {
        coords: [12.4950, 78.5698],
        region: 'North'
    },
    'Ranipet': {
        coords: [12.9277, 79.3193],
        region: 'North'
    },
    'Mayiladuthurai': {
        coords: [11.1014, 79.6583],
        region: 'East'
    }
};

const API_KEY = '1635890035cbba097fd5c26c8ea672a1';

// Weather condition to background mapping
const weatherBackgrounds = {
    'Clear': 'linear-gradient(135deg, #00b4db, #0083b0)',
    'Clouds': 'linear-gradient(135deg, #757f9a, #d7dde8)',
    'Rain': 'linear-gradient(135deg, #373b44, #4286f4)',
    'Snow': 'linear-gradient(135deg, #e6dada, #274046)',
    'Thunderstorm': 'linear-gradient(135deg, #283048, #859398)',
    'Drizzle': 'linear-gradient(135deg, #2c3e50, #3498db)',
    'Mist': 'linear-gradient(135deg, #304352, #d7d2cc)',
    'default': 'linear-gradient(135deg, #667eea, #764ba2)'
};

// Utility functions
async function getWeatherData(lat, lon, districtName = null) {
    try {
        // Try to get data from cache if we have a district name
        if (districtName && window.weatherCache) {
            const cachedData = window.weatherCache.getWeatherData(districtName);
            if (cachedData && (!navigator.onLine || cachedData.isOfflineData)) {
                console.log('Using cached data for:', districtName);
                return cachedData;
            }
        }

        // If we're offline and don't have cached data, return null
        if (!navigator.onLine) {
            throw new Error('No internet connection and no cached data available');
        }

        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
        console.log('Fetching weather from:', url);
        
        const response = await fetch(url);
        console.log('API Response status:', response.status);
        
        const data = await response.json();
        console.log('API Response:', data);

        if (data.cod === 401) {
            throw new Error('Invalid API key. Please make sure the API key is valid and activated.');
        }
        
        if (!response.ok) {
            throw new Error(`Weather data fetch failed: ${data.message || response.statusText}`);
        }

        // Save to cache if we have a district name
        if (districtName && window.weatherCache) {
            await window.weatherCache.saveWeatherData(districtName, data);
        }

        return data;
    } catch (error) {
        console.error('Error fetching weather:', error);
        if (!navigator.onLine) {
            console.log('Device is offline');
        }
        return null;
    }
}

async function getForecastData(lat, lon, districtName = null) {
    try {
        // Try to get data from cache if we have a district name
        if (districtName && window.weatherCache) {
            const cachedData = window.weatherCache.getForecastData(districtName);
            if (cachedData && (!navigator.onLine || cachedData.isOfflineData)) {
                console.log('Using cached forecast data for:', districtName);
                return cachedData;
            }
        }

        // If we're offline and don't have cached data, return null
        if (!navigator.onLine) {
            throw new Error('No internet connection and no cached data available');
        }

        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        if (!response.ok) throw new Error('Forecast data fetch failed');
        
        const data = await response.json();

        // Process the data to get daily forecasts
        const dailyForecasts = processForecastData(data);

        // Save to cache if we have a district name
        if (districtName && window.weatherCache) {
            await window.weatherCache.saveForecastData(districtName, dailyForecasts);
        }

        return dailyForecasts;
    } catch (error) {
        console.error('Error fetching forecast:', error);
        return null;
    }
}

// Process 3-hour forecast data into daily forecasts
function processForecastData(data) {
    const dailyData = {};
    
    data.list.forEach(forecast => {
        const date = new Date(forecast.dt * 1000);
        const dateKey = date.toISOString().split('T')[0];
        
        if (!dailyData[dateKey]) {
            dailyData[dateKey] = {
                date: dateKey,
                temps: [],
                rainfall: 0,
                cloudCover: [],
                windDirection: [],
                windSpeed: [],
                forecasts: [],
                icons: new Set()
            };
        }

        // Collect all data points for the day
        dailyData[dateKey].temps.push(forecast.main.temp);
        dailyData[dateKey].rainfall += forecast.rain ? forecast.rain['3h'] || 0 : 0;
        dailyData[dateKey].cloudCover.push(forecast.clouds.all);
        dailyData[dateKey].windDirection.push(forecast.wind.deg);
        dailyData[dateKey].windSpeed.push(forecast.wind.speed);
        dailyData[dateKey].forecasts.push(forecast.weather[0].description);
        dailyData[dateKey].icons.add(forecast.weather[0].icon);
    });

    // Process collected data into final format
    return Object.values(dailyData).map(day => ({
        date: day.date,
        minTemp: Math.min(...day.temps),
        maxTemp: Math.max(...day.temps),
        rainfall: Math.round(day.rainfall * 10) / 10,
        cloudCover: Math.round(day.cloudCover.reduce((a, b) => a + b, 0) / day.cloudCover.length),
        windDirection: getMostFrequent(day.windDirection),
        windDirectionText: getWindDirection(getMostFrequent(day.windDirection)),
        windSpeed: Math.round(day.windSpeed.reduce((a, b) => a + b, 0) / day.windSpeed.length * 10) / 10,
        forecast: getMostFrequent(day.forecasts),
        icon: Array.from(day.icons)[0]
    })).slice(0, 5); // Get only next 5 days
}

// Helper function to get most frequent value in array
function getMostFrequent(arr) {
    return arr.sort((a,b) =>
        arr.filter(v => v === a).length - arr.filter(v => v === b).length
    ).pop();
}

// Convert wind direction degrees to cardinal direction
function getWindDirection(degrees) {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
}

function getDistrictCoordinates(districtName) {
    return districts[districtName]?.coords;
}

function getWeatherIcon(iconCode) {
    return `http://openweathermap.org/img/wn/${iconCode}@2x.png`;
}

function getBackgroundForWeather(weatherMain) {
    return weatherBackgrounds[weatherMain] || weatherBackgrounds.default;
}

// Export for use in other files
window.weatherUtils = {
    districts,
    API_KEY,
    weatherBackgrounds,
    getWeatherData,
    getForecastData,
    getDistrictCoordinates,
    getWeatherIcon,
    getBackgroundForWeather
};
