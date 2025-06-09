// Simple, efficient real-time weather app using OpenWeather API
class Weather {
    constructor() {
        this.API_KEY = '7fb10fad2554482de1f191d6cd6fd5f3';
        this.weatherData = null;

        // DOM elements
        this.temperatureElement = document.getElementById('weather-main');
        this.weatherIcon = document.getElementById('weather-icon');
        this.cityElement = document.getElementById('weather-city'); // Add this in your HTML

        this.init();
    }

    init() {
        this.getAndShowWeather();
        this.addManualCityButton();
    }

    getAndShowWeather() {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                pos => {
                    console.log('Your coordinates:', pos.coords.latitude, pos.coords.longitude);
                    this.fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
                },
                err => {
                    console.error('Geolocation error:', err);
                    this.showError('Location denied');
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        } else {
            this.showError('Geolocation not supported');
        }
    }

    async fetchWeatherByCoords(lat, lon) {
        try {
            // Get weather directly by coordinates
            const weatherRes = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${this.API_KEY}&units=metric`
            );
            if (!weatherRes.ok) throw new Error('Weather fetch failed');
            const data = await weatherRes.json();

            const city = data.name || 'Unknown';
            console.log('Detected city:', city);

            this.weatherData = {
                temperature: Math.round(data.main.temp),
                condition: data.weather[0].main,
                icon: this.getWeatherIcon(data.weather[0].id),
                humidity: data.main.humidity,
                windSpeed: Math.round(data.wind.speed * 3.6), // m/s to km/h
                city
            };
            this.updateDisplay();
        } catch (e) {
            console.error(e);
            this.showError('Weather unavailable');
        }
    }

    getWeatherIcon(code) {
        const icons = {
            800: '☀️', 801: '⛅', 802: '⛅', 803: '☁️', 804: '☁️',
            500: '🌧️', 501: '🌧️', 502: '🌧️', 300: '🌦️', 200: '⛈️',
            600: '❄️', 701: '🌫️'
        };
        return icons[code] || '❓';
    }

    updateDisplay() {
        if (!this.weatherData) return;

        // Update weather icon
        if (this.weatherIcon) this.weatherIcon.textContent = this.weatherData.icon;

        // Update temperature and condition
        const tempElement = this.temperatureElement.querySelector('.temperature');
        const condElement = this.temperatureElement.querySelector('.condition');
        if (tempElement) tempElement.textContent = `${this.weatherData.temperature}°C`;
        if (condElement) condElement.textContent = this.weatherData.condition;

        // Update city name
        if (this.cityElement) this.cityElement.textContent = this.weatherData.city;

        // Update humidity and wind
        const humidityElement = document.getElementById('humidity');
        const windElement = document.getElementById('wind');
        if (humidityElement && this.weatherData.humidity !== undefined)
            humidityElement.textContent = `${this.weatherData.humidity}%`;
        if (windElement && this.weatherData.windSpeed !== undefined)
            windElement.textContent = `${this.weatherData.windSpeed} km/h`;
    }

    showError(msg) {
        if (this.weatherIcon) this.weatherIcon.textContent = '❓';
        const tempElement = this.temperatureElement.querySelector('.temperature');
        const condElement = this.temperatureElement.querySelector('.condition');
        if (tempElement) tempElement.textContent = '--°C';
        if (condElement) condElement.textContent = msg || 'Unavailable';
        const humidityElement = document.getElementById('humidity');
        const windElement = document.getElementById('wind');
        if (humidityElement) humidityElement.textContent = '--%';
        if (windElement) windElement.textContent = '-- km/h';
    }

    addManualCityButton() {
        const button = document.createElement('button');
        button.textContent = 'Set to Algiers';
        button.classList.add('city-button');
        button.onclick = () => {
            this.fetchWeatherByCoords(36.7525, 3.04197); // Algiers coordinates
        };
        document.getElementById('weather-main').appendChild(button);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.weatherInstance = new Weather();
});
