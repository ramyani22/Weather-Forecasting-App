const userLocation = document.getElementById("userLocation"),
    weatherIcon = document.querySelector(".weatherIcon"),
    temperature = document.querySelector(".temperature"),
    feelsLike = document.querySelector(".feelsLike"),
    description = document.querySelector(".description"),
    dateElement = document.querySelector(".date"),
    city = document.querySelector(".city"),
    Hvalue = document.getElementById("Hvalue"),
    Wvalue = document.getElementById("Wvalue"),
    SRValue = document.getElementById("SRValue"),
    SSValue = document.getElementById("SSValue"),
    Cvalue = document.getElementById("Cvalue"),
    Pvalue = document.getElementById("Pvalue"),
    Vvalue = document.getElementById("Vvalue"),
    forecast = document.querySelector(".forecast"),
    converter = document.querySelector(".converter");

const API_KEY = "INSERT YOUR API";
const WEATHER_API = `https://api.openweathermap.org/data/2.5/weather?appid=${API_KEY}&units=metric&q=`;
const FORECAST_API = `https://api.openweathermap.org/data/2.5/forecast?appid=${API_KEY}&units=metric&q=`;

function findUserLocation() {
    forecast.innerHTML = "";
    let location = userLocation.value.trim();

    if (!location) {
        alert("Please enter a valid city name.");
        return;
    }

    fetch(WEATHER_API + location)
        .then(response => response.json())
        .then(data => {
            if (data.cod !== 200) {
                alert(`Error: ${data.message}`);
                return;
            }

            console.log("Weather Data:", data);
            updateWeatherDetails(data);
            fetchForecast(location);
        })
        .catch(error => console.error("Error fetching weather data:", error));
}

function updateWeatherDetails(data) {
    city.innerHTML = `${data.name}, ${data.sys.country}`;
    weatherIcon.style.backgroundImage = `url(https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png)`;
    temperature.innerHTML = TempConverter(data.main.temp);
    feelsLike.innerHTML = `Feels Like: ${TempConverter(data.main.feels_like)}`;
    description.innerHTML = `Description: ${data.weather[0].description}`;

    Hvalue.innerHTML = `${data.main.humidity}%`;
    Wvalue.innerHTML = `${data.wind.speed} m/s`;
    Cvalue.innerHTML = `${data.clouds.all}%`;
    Pvalue.innerHTML = `${data.main.pressure} hPa`;
    Vvalue.innerHTML = `${(data.visibility / 1000).toFixed(1)} km`;

    SRValue.innerHTML = new Date(data.sys.sunrise * 1000).toLocaleTimeString();
    SSValue.innerHTML = new Date(data.sys.sunset * 1000).toLocaleTimeString();

    dateElement.innerHTML = getFormattedDateTime(data.dt, data.timezone);
}

function getFormattedDateTime(timestamp, timezoneOffset) {
    return new Date((timestamp + timezoneOffset) * 1000).toLocaleString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
    });
}

function fetchForecast(location) {
    fetch(FORECAST_API + location)
        .then(response => response.json())
        .then(data => {
            console.log("Forecast Data:", data);
            display7DayForecast(data.list);
        })
        .catch(error => console.error("Error fetching forecast data:", error));
}

function display7DayForecast(forecastData) {
    let dailyData = {};
    let daysCount = 0;

    forecastData.forEach(item => {
        let date = item.dt_txt.split(" ")[0];

        if (!dailyData[date]) {
            dailyData[date] = {
                minTemp: item.main.temp_min,
                maxTemp: item.main.temp_max,
                icon: item.weather[0].icon,
                description: item.weather[0].description,
                timestamp: item.dt
            };
            daysCount++;
        } else {
            dailyData[date].minTemp = Math.min(dailyData[date].minTemp, item.main.temp_min);
            dailyData[date].maxTemp = Math.max(dailyData[date].maxTemp, item.main.temp_max);
        }

        if (daysCount >= 7) return;
    });

    forecast.innerHTML = "";

    Object.values(dailyData).forEach(weather => {
        let div = document.createElement("div");
        div.innerHTML = `
            <p>${new Date(weather.timestamp * 1000).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
            <img src="https://openweathermap.org/img/wn/${weather.icon}@2x.png">
            <p>${weather.description}</p>
            <p>Min: ${TempConverter(weather.minTemp)} | Max: ${TempConverter(weather.maxTemp)}</p>
        `;
        forecast.append(div);
    });
}

function TempConverter(temp) {
    let tempValue = Math.round(temp);
    if (converter && converter.value === "°C") {
        return `${tempValue}<span>°C</span>`;
    } else {
        let ctof = (tempValue * 9) / 5 + 32;
        return `${Math.round(ctof)}<span>°F</span>`;
    }
}

