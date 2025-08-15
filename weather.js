
function updateComingFiveDays(forecastList) {
    const container = document.getElementById('comingFiveDaysContainer');
    container.innerHTML = '';
    forecastList.forEach(item => {
        const row = document.createElement('div');
        row.className = 'foreCastRow d-flex align-items-center justify-content-between';
        row.innerHTML = `
            <div class="d-flex gap-1 align-items-center">
                <img src="${item.icon}" width="25px">
                <h6 class="m-0">${item.temp} &deg;C</h6>
            </div>
            <h6 class="m-0">${item.day}</h6>
            <h6 class="m-0">${item.date}</h6>
        `;
        container.appendChild(row);
    });
}


async function updateAllWeather(city) {
    const apiKey = "0ae7909adb9d0eeea2354347203e1e28";
    // Show loading spinner or message
    let cityNameElem = document.getElementById('cityName');
    if (cityNameElem) cityNameElem.innerText = 'Loading...';
    let errorElem = document.getElementById('weatherError');
    if (!errorElem) {
        errorElem = document.createElement('div');
        errorElem.id = 'weatherError';
        errorElem.style.color = 'red';
        errorElem.style.margin = '10px 0';
        cityNameElem && cityNameElem.parentNode.insertBefore(errorElem, cityNameElem.nextSibling);
    }
    errorElem.innerText = '';

    try {
        // Fetch current weather
        const weatherRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
        if (!weatherRes.ok) throw new Error('City not found or API error');
        const weatherData = await weatherRes.json();

        // Fetch air pollution
        if (!weatherData.coord) throw new Error('No coordinates found for city');
        const { lat, lon } = weatherData.coord;
        const airRes = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`);
        if (!airRes.ok) throw new Error('Air pollution API error');
        const airData = await airRes.json();
        const air = airData.list && airData.list[0] ? airData.list[0].components : {};

        // Update UI (check IDs)
        if (document.getElementById('cityName')) document.getElementById('cityName').innerText = weatherData.name || '-';
        if (document.getElementById('cityTemp')) document.getElementById('cityTemp').innerText = weatherData.main ? weatherData.main.temp : '-';
        if (document.getElementById('skyDesc')) document.getElementById('skyDesc').innerText = weatherData.weather && weatherData.weather[0] ? weatherData.weather[0].description : '-';
        if (document.getElementById('humidity')) document.getElementById('humidity').innerText = weatherData.main ? weatherData.main.humidity : '-';
        if (document.getElementById('pressure')) document.getElementById('pressure').innerText = weatherData.main ? weatherData.main.pressure : '-';
        if (document.getElementById('feelsLike')) document.getElementById('feelsLike').innerText = weatherData.main ? weatherData.main.feels_like : '-';
        if (document.getElementById('visiblity')) document.getElementById('visiblity').innerText = weatherData.visibility || '-';
        if (document.getElementById('date')) document.getElementById('date').innerText = weatherData.dt ? new Date(weatherData.dt * 1000).toLocaleDateString() : '-';
        if (document.getElementById('time')) document.getElementById('time').innerText = weatherData.dt ? new Date(weatherData.dt * 1000).toLocaleTimeString() : '-';
        if (document.getElementById('sunriseTime')) document.getElementById('sunriseTime').innerText = weatherData.sys ? new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString() : '-';
        if (document.getElementById('sunsetTime')) document.getElementById('sunsetTime').innerText = weatherData.sys ? new Date(weatherData.sys.sunset * 1000).toLocaleTimeString() : '-';
        if (document.getElementById('coValue')) document.getElementById('coValue').innerText = air.co || '-';
        if (document.getElementById('so2Value')) document.getElementById('so2Value').innerText = air.so2 || '-';
        if (document.getElementById('o3Value')) document.getElementById('o3Value').innerText = air.o3 || '-';
        if (document.getElementById('no2Value')) document.getElementById('no2Value').innerText = air.no2 || '-';

        // Fetch 5-day forecast and update Coming 5 Days section
        const forecastRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
        if (!forecastRes.ok) throw new Error('Forecast API error');
        const forecastData = await forecastRes.json();
        // Parse 5 unique days
        const dailyMap = {};
        forecastData.list.forEach(item => {
            const dateObj = new Date(item.dt * 1000);
            const dateStr = dateObj.toLocaleDateString('en-GB'); // DD/MM/YYYY
            if (!dailyMap[dateStr]) {
                dailyMap[dateStr] = item;
            }
        });
        const forecastList = Object.values(dailyMap).slice(0, 5).map(item => {
            const dateObj = new Date(item.dt * 1000);
            const day = dateObj.toLocaleDateString('en-GB', { weekday: 'long' });
            const date = dateObj.toLocaleDateString('en-GB').replace(/\//g, '-'); // DD-MM-YYYY
            return {
                icon: item.weather && item.weather[0] ? `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png` : '',
                temp: item.main ? item.main.temp.toFixed(1) : '-',
                day,
                date
            };
        });
        updateComingFiveDays(forecastList);
    } catch (err) {
        // Show error message
        if (errorElem) errorElem.innerText = err.message;
        // Clear UI fields
        [
            'cityName','cityTemp','skyDesc','humidity','pressure','feelsLike','visiblity','date','time','sunriseTime','sunsetTime','coValue','so2Value','o3Value','no2Value'
        ].forEach(id => {
            if (document.getElementById(id)) document.getElementById(id).innerText = '-';
        });
        updateComingFiveDays([]);
    }
}
