// weather.js — deploy on Glitch, Railway, Render, etc.
const express = require('express');
const app = express();

// Hardcode your coords or accept ?lat=&lon= as params
const DEFAULT_LAT = 43.02;  // <-- change to your location
const DEFAULT_LON = -78.87;
const LOCATION_NAME = "🌆North Tonawanda, NY🗽"; // <-- your city name

app.get('/weather', async (req, res) => {
  const lat = req.query.lat || DEFAULT_LAT;
  const lon = req.query.lon || DEFAULT_LON;
  const name = req.query.city || LOCATION_NAME;

  try {
    const fetch = (await import('node-fetch')).default;

    const urlF = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode&temperature_unit=fahrenheit&forecast_days=7&timezone=auto`;
    const urlC = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode&temperature_unit=celsius&forecast_days=7&timezone=auto`;

    const [dataF, dataC] = await Promise.all([
      fetch(urlF).then(r => r.json()),
      fetch(urlC).then(r => r.json())
    ]);
    
    const days = dataF.daily;

    const ICONS = {
      0:'☀️', 1:'🌤️', 2:'⛅', 3:'☁️',
      45:'🌫️', 51:'🌦️', 61:'🌧️', 71:'🌨️',
      80:'🌦️', 95:'⛈️'
    };

    const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

    let parts = days.time.map((dateStr, i) => {
      const d = new Date(dateStr + 'T12:00:00');
      const day = dayNames[d.getDay()];
      
      const hiF = Math.round(dataF.daily.temperature_2m_max[i]);
      const loF = Math.round(dataF.daily.temperature_2m_min[i]);
      const hiC = Math.round(dataC.daily.temperature_2m_max[i]);
      const loC = Math.round(dataC.daily.temperature_2m_min[i]);
      
      const rain = days.precipitation_probability_max[i];
      const code = days.weathercode[i];
      const icon = ICONS[code] || ICONS[Math.floor(code/10)*10] || '🌡️';
      return `$(newline) ${day}: ${icon} ${hiF}°/${loF}°F ${rain}%🔹${hiC}°/${loC}°C`;
    });

    res.send(`${name} 7-Day: ` + parts.join(' | '));
  } catch (e) {
    res.send('Weather unavailable right now.');
  }
});

app.listen(3000, () => console.log('Weather bot running on 3000'));
