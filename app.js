const RIVAS = {
  latitude: 40.3261,
  longitude: -3.5109,
  timezone: "Europe/Madrid",
};

const weatherCodes = {
  0: ["Soleado", "☀"],
  1: ["Mayormente despejado", "◐"],
  2: ["Parcialmente nuboso", "☁"],
  3: ["Cubierto", "☁"],
  45: ["Niebla", "≋"],
  48: ["Niebla con escarcha", "≋"],
  51: ["Llovizna ligera", "╱"],
  53: ["Llovizna", "╱"],
  55: ["Llovizna intensa", "╱"],
  56: ["Llovizna helada ligera", "╱"],
  57: ["Llovizna helada intensa", "╱"],
  61: ["Lluvia ligera", "☂"],
  63: ["Lluvia", "☂"],
  65: ["Lluvia intensa", "☂"],
  66: ["Lluvia helada ligera", "☂"],
  67: ["Lluvia helada intensa", "☂"],
  71: ["Nieve ligera", "✳"],
  73: ["Nieve", "✳"],
  75: ["Nieve intensa", "✳"],
  77: ["Granizo menudo", "✳"],
  80: ["Chubascos ligeros", "☂"],
  81: ["Chubascos", "☂"],
  82: ["Chubascos intensos", "☂"],
  85: ["Nevadas ligeras", "✳"],
  86: ["Nevadas intensas", "✳"],
  95: ["Tormenta", "⚡"],
  96: ["Tormenta con granizo", "⚡"],
  99: ["Tormenta fuerte con granizo", "⚡"],
};

const el = {
  updated: document.querySelector("#updated"),
  refresh: document.querySelector("#refresh"),
  status: document.querySelector("#status"),
  currentIcon: document.querySelector("#current-icon"),
  currentCondition: document.querySelector("#current-condition"),
  currentTemp: document.querySelector("#current-temp"),
  feelsLike: document.querySelector("#feels-like"),
  humidity: document.querySelector("#humidity"),
  wind: document.querySelector("#wind"),
  rain: document.querySelector("#rain"),
  todayRange: document.querySelector("#today-range"),
  hourly: document.querySelector("#hourly"),
  daily: document.querySelector("#daily"),
};

const formatters = {
  time: new Intl.DateTimeFormat("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  }),
  weekday: new Intl.DateTimeFormat("es-ES", {
    weekday: "short",
  }),
  dayMonth: new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
  }),
  longDate: new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }),
};

function getWeatherInfo(code) {
  return weatherCodes[code] ?? ["Tiempo variable", "•"];
}

function round(value) {
  return Math.round(Number(value));
}

function degreesToCompass(degrees) {
  const directions = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"];
  return directions[Math.round(degrees / 45) % 8];
}

function buildUrl() {
  const params = new URLSearchParams({
    latitude: RIVAS.latitude,
    longitude: RIVAS.longitude,
    current:
      "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m",
    hourly:
      "temperature_2m,precipitation_probability,weather_code,wind_speed_10m",
    daily:
      "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max,sunrise,sunset",
    timezone: RIVAS.timezone,
    forecast_days: "7",
  });

  return `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
}

async function fetchWeather() {
  const response = await fetch(buildUrl());
  if (!response.ok) {
    throw new Error("No se pudo obtener la previsión.");
  }

  return response.json();
}

function renderCurrent(data) {
  const current = data.current;
  const units = data.current_units;
  const [label, icon] = getWeatherInfo(current.weather_code);

  el.currentIcon.textContent = icon;
  el.currentCondition.textContent = label;
  el.currentTemp.textContent = round(current.temperature_2m);
  el.feelsLike.textContent = `${round(current.apparent_temperature)}${units.apparent_temperature}`;
  el.humidity.textContent = `${current.relative_humidity_2m}${units.relative_humidity_2m}`;
  el.wind.textContent = `${round(current.wind_speed_10m)} ${units.wind_speed_10m} ${degreesToCompass(
    current.wind_direction_10m,
  )}`;
  el.rain.textContent = `${current.precipitation} ${units.precipitation}`;
  el.updated.textContent = `Actualizado: ${formatters.longDate.format(new Date(current.time))}`;
}

function renderHourly(data) {
  const now = new Date(data.current.time);
  const hours = data.hourly.time
    .map((time, index) => ({
      time: new Date(time),
      temp: data.hourly.temperature_2m[index],
      rain: data.hourly.precipitation_probability[index],
      code: data.hourly.weather_code[index],
      wind: data.hourly.wind_speed_10m[index],
    }))
    .filter((item) => item.time >= now)
    .slice(0, 12);

  el.hourly.innerHTML = hours
    .map((hour) => {
      const [label, icon] = getWeatherInfo(hour.code);
      return `
        <article class="hour-card" aria-label="${formatters.time.format(hour.time)}, ${label}">
          <div class="time-label">${formatters.time.format(hour.time)}</div>
          <div class="mini-icon" aria-hidden="true">${icon}</div>
          <div>
            <div class="hour-temp">${round(hour.temp)}°</div>
            <div class="rain-chance">${hour.rain ?? 0}% lluvia</div>
            <div class="wind-line">${round(hour.wind)} km/h</div>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderDaily(data) {
  const daily = data.daily.time.map((time, index) => ({
    time: new Date(`${time}T12:00:00`),
    code: data.daily.weather_code[index],
    max: data.daily.temperature_2m_max[index],
    min: data.daily.temperature_2m_min[index],
    rain: data.daily.precipitation_probability_max[index],
    wind: data.daily.wind_speed_10m_max[index],
  }));

  const today = daily[0];
  el.todayRange.textContent = `Hoy ${round(today.min)}° / ${round(today.max)}°`;

  el.daily.innerHTML = daily
    .map((day, index) => {
      const [label, icon] = getWeatherInfo(day.code);
      const dayName = index === 0 ? "Hoy" : formatters.weekday.format(day.time);

      return `
        <article class="day-card" aria-label="${dayName}, ${label}">
          <div>
            <div class="day-name">${dayName}</div>
            <div class="day-date">${formatters.dayMonth.format(day.time)}</div>
          </div>
          <div class="mini-icon" aria-hidden="true">${icon}</div>
          <div class="day-temp">${round(day.min)}° / ${round(day.max)}°</div>
          <div class="rain-chance">${day.rain ?? 0}% lluvia</div>
          <div class="wind-line">Viento ${round(day.wind)} km/h</div>
        </article>
      `;
    })
    .join("");
}

function setStatus(message, isError = false) {
  el.status.textContent = message;
  el.status.classList.toggle("error", isError);
}

async function loadWeather() {
  el.refresh.disabled = true;
  setStatus("Actualizando datos...");

  try {
    const data = await fetchWeather();
    renderCurrent(data);
    renderHourly(data);
    renderDaily(data);
    setStatus("Datos de Open-Meteo para Rivas Vaciamadrid.");
  } catch (error) {
    setStatus(`${error.message} Revisa tu conexión e inténtalo de nuevo.`, true);
  } finally {
    el.refresh.disabled = false;
  }
}

el.refresh.addEventListener("click", loadWeather);
loadWeather();
