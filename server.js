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

    
    const urlF = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode,uv_index_max&temperature_unit=fahrenheit&forecast_days=7&timezone=auto`;
    const urlC = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode,uv_index_max&temperature_unit=celsius&forecast_days=7&timezone=auto`;

    const [dataF, dataC] = await Promise.all([
      fetch(urlF).then(r => r.json()),
      fetch(urlC).then(r => r.json())
    ]);
    
    const days = dataF.daily;

       const ICONS = {
         
                // Clear sky
                0: '😎☀️😎',  // Clear sky
              
                // Clouds
                1: '☀️🏖️',  // Mainly clear
                2: '⛅',  // Partly cloudy
                3: '☁️',  // Overcast
              
                // Fog
                45: '🌫️', // Fog
                48: '🌫️', // Depositing rime fog
              
                // Drizzle
                51: '🌦️', // Drizzle: Light intensity
                53: '🌦️', // Drizzle: Moderate intensity
                55: '🌦️', // Drizzle: Dense intensity
                56: '🥶💦', // Freezing Drizzle: Light intensity
                57: '🥶💦', // Freezing Drizzle: Dense intensity
              
                // Rain
                61: '🌧️🌂', // Rain: Slight intensity
                63: '🌧️🌂', // Rain: Moderate intensity
                65: '🌧️🌂', // Rain: Heavy intensity
                66: '🥶☔', // Freezing Rain: Light intensity
                67: '🥶☔', // Freezing Rain: Heavy intensity
              
                // Snow
                71: '🌨️', // Snow fall: Slight intensity
                73: '🌨️', // Snow fall: Moderate intensity
                75: '🌨️', // Snow fall: Heavy intensity
                77: '❄️', // Snow grains
              
                // Rain Showers
                80: '🌦️', // Rain showers: Slight intensity
                81: '🌦️', // Rain showers: Moderate intensity
                82: '🌧️', // Rain showers: Violent intensity
              
                // Snow Showers
                85: '🌨️❄️', // Snow showers: Slight intensity
                86: '🌨️❄️', // Snow showers: Heavy intensity
              
                // Thunderstorms
                95: '⛈️☂️', // Thunderstorm: Slight or moderate
                96: '⛈️☂️', // Thunderstorm with slight hail
                99: '⛈️☂️'  // Thunderstorm with heavy hail  
    
            };

     const EMOTES = {
                1: "UV01 UV01 UV01 • No protection needed EZ ",
                2:  "UV02 UV02 UV02 • No protection needed EZ ",
                3:  "UV03 UV03 UV03 • Some protection is required Yikes ",
                4:  "UV04 UV04 UV04 • Some protection is required Yikes ", 
                5:  "UV05 UV05 UV05 • Some protection is required Yikes ", 
                6:  "UV06 UV06 UV06 • Protection is essential NAILSING ", 
                7:  "UV07 UV07 UV07 • Protection is essential NAILSING ", 
                8:  "UV08 UV08 UV08 • Extra protection is needed REEE ", 
                9:  "UV09 UV09 UV09 • Extra protection is needed REEE ", 
                10:  "UV08 UV08 UV08 • Extra protection is needed REEE ", 
                11:  "UV11 UV11 UV11 • Stay fucking inside! patrickrage "
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
      const uv = Math.round(days.uv_index_max[i]); 
      const emote = EMOTES[uv];
      const code = days.weathercode[i];
      const icon = ICONS[code] || ICONS[Math.floor(code/10)*10] || '🌡️';
      return `$(newline) • ${day}: ${icon}  • [${hiF}°/${loF}°F]  • Rain: ${rain}%  •  🌡️  •  [${hiC}°/${loC}°C]  •  🌞 • UV-Index: • ${emote} •`;
    });

    res.send(`${name} 7-Day: ` + parts.join(' '));
  } catch (e) {
    res.send('Weather unavailable right now.');
  }
});

app.listen(3000, () => console.log('Weather bot running on 3000'));
