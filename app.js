const RIVAS = {
  latitude: 40.3261,
  longitude: -3.5109,
  timezone: "Europe/Madrid",
};

const weatherCodes = {
  0: ["Soleado", "sun"],
  1: ["Mayormente despejado", "sun"],
  2: ["Parcialmente nuboso", "partly"],
  3: ["Cubierto", "cloud"],
  45: ["Niebla", "fog"],
  48: ["Niebla con escarcha", "fog"],
  51: ["Llovizna ligera", "drizzle"],
  53: ["Llovizna", "drizzle"],
  55: ["Llovizna intensa", "drizzle"],
  56: ["Llovizna helada ligera", "drizzle"],
  57: ["Llovizna helada intensa", "drizzle"],
  61: ["Lluvia ligera", "rain"],
  63: ["Lluvia", "rain"],
  65: ["Lluvia intensa", "rain"],
  66: ["Lluvia helada ligera", "rain"],
  67: ["Lluvia helada intensa", "rain"],
  71: ["Nieve ligera", "snow"],
  73: ["Nieve", "snow"],
  75: ["Nieve intensa", "snow"],
  77: ["Granizo menudo", "snow"],
  80: ["Chubascos ligeros", "rain"],
  81: ["Chubascos", "rain"],
  82: ["Chubascos intensos", "rain"],
  85: ["Nevadas ligeras", "snow"],
  86: ["Nevadas intensas", "snow"],
  95: ["Tormenta", "storm"],
  96: ["Tormenta con granizo", "storm"],
  99: ["Tormenta fuerte con granizo", "storm"],
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
  return weatherCodes[code] ?? ["Tiempo variable", "cloud"];
}

function weatherIcon(name) {
  const common = 'fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';
  const icons = {
    sun: `
      <svg class="weather-svg" viewBox="0 0 64 64" aria-hidden="true">
        <circle ${common} cx="32" cy="32" r="12"/>
        <path ${common} d="M32 6v8M32 50v8M6 32h8M50 32h8M13.6 13.6l5.7 5.7M44.7 44.7l5.7 5.7M50.4 13.6l-5.7 5.7M19.3 44.7l-5.7 5.7"/>
      </svg>
    `,
    partly: `
      <svg class="weather-svg" viewBox="0 0 64 64" aria-hidden="true">
        <circle ${common} cx="25" cy="25" r="10"/>
        <path ${common} d="M25 7v6M25 37v5M7 25h6M40 25h5M12.3 12.3l4.2 4.2M34 34l3.7 3.7M37.7 12.3 34 16M16.5 34 12.3 38.2"/>
        <path ${common} d="M24 49h26a9 9 0 0 0 1.2-17.9 13.2 13.2 0 0 0-25.3-3.5A10.8 10.8 0 0 0 24 49Z"/>
      </svg>
    `,
    cloud: `
      <svg class="weather-svg" viewBox="0 0 64 64" aria-hidden="true">
        <path ${common} d="M18 48h29a11 11 0 0 0 1.4-21.9 16 16 0 0 0-30.7-4.3A13.1 13.1 0 0 0 18 48Z"/>
      </svg>
    `,
    fog: `
      <svg class="weather-svg" viewBox="0 0 64 64" aria-hidden="true">
        <path ${common} d="M18 35h29a9 9 0 0 0 1.1-17.9 14 14 0 0 0-26.8-3.7A11.4 11.4 0 0 0 18 35Z"/>
        <path ${common} d="M12 45h40M18 53h28"/>
      </svg>
    `,
    drizzle: `
      <svg class="weather-svg" viewBox="0 0 64 64" aria-hidden="true">
        <path ${common} d="M18 36h29a10 10 0 0 0 1.3-19.9 15 15 0 0 0-28.8-4A12.3 12.3 0 0 0 18 36Z"/>
        <path ${common} d="M24 46v5M34 44v5M44 46v5"/>
      </svg>
    `,
    rain: `
      <svg class="weather-svg" viewBox="0 0 64 64" aria-hidden="true">
        <path ${common} d="M18 35h29a10 10 0 0 0 1.3-19.9 15 15 0 0 0-28.8-4A12.3 12.3 0 0 0 18 35Z"/>
        <path ${common} d="m24 45-3 7M35 43l-3 8M46 45l-3 7"/>
      </svg>
    `,
    snow: `
      <svg class="weather-svg" viewBox="0 0 64 64" aria-hidden="true">
        <path ${common} d="M18 34h29a10 10 0 0 0 1.3-19.9 15 15 0 0 0-28.8-4A12.3 12.3 0 0 0 18 34Z"/>
        <path ${common} d="M25 46v8M21.5 48l7 4M28.5 48l-7 4M40 44v8M36.5 46l7 4M43.5 46l-7 4"/>
      </svg>
    `,
    storm: `
      <svg class="weather-svg" viewBox="0 0 64 64" aria-hidden="true">
        <path ${common} d="M18 34h29a10 10 0 0 0 1.3-19.9 15 15 0 0 0-28.8-4A12.3 12.3 0 0 0 18 34Z"/>
        <path ${common} d="m34 40-7 12h8l-5 8 12-14h-8l5-6Z"/>
      </svg>
    `,
  };

  return icons[name] ?? icons.cloud;
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

  el.currentIcon.innerHTML = weatherIcon(icon);
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
          <div class="mini-icon" aria-hidden="true">${weatherIcon(icon)}</div>
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
          <div class="mini-icon" aria-hidden="true">${weatherIcon(icon)}</div>
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
