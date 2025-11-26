import React, { useEffect, useState } from "react";
import "./weather.css";

import rain from "../assets/rain.mp4";
import video2 from "../assets/sun.mp4";
import video3 from "../assets/strom.mp4";
import video4 from "../assets/cloud.mp4";

function Weather() {
  const YOUR_API_KEY = "b02809755efa4c0098632bd54e5cd561";

  const [data, setData] = useState(null);
  const [city, setCity] = useState("mumbai");
  const [inputCity, setInputCity] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [forecast, setForecast] = useState([]);

  // ✅ Function to choose video based on weather
  const getVideo = (description) => {
    if (!description) return video2;

    const desc = description.toLowerCase();

    if (desc.includes("rain")) return rain;
    if (desc.includes("clear")) return video2; // Clear sky
    if (desc.includes("sun")) return video2; // Sunny
    if (desc.includes("storm")) return video3; // Storm
    if (desc.includes("cloud")) return video4; // Clouds
    if (desc.includes("overcast")) return video4;
    if (desc.includes("mist") || desc.includes("fog")) return video4;

    return video2; // Default fallback
  };

  // Fetch weather
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    setLoading(true);
    setError("");

    fetch(
      `https://api.weatherbit.io/v2.0/current?city=${city}&key=${YOUR_API_KEY}`,
      { signal }
    )
      .then((res) => res.json())
      .then((response) => response.data[0])
      .then((data) => {
        setData(data);
      })
      .catch(() => setError("City not found or API error."));

    // Fetch 5-day forecast
    fetch(
      `https://api.weatherbit.io/v2.0/forecast/daily?city=${city}&key=${YOUR_API_KEY}&days=5`,
      { signal }
    )
      .then((res) => res.json())
      .then((data) => {
        // console.log("Forecast =>", data.data);
        setForecast(data.data);
      })
      .catch(() => setError("Forecast unavailable."))
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [city]);

  const handleCity = () => {
    if (inputCity.trim() === "") return;
    setCity(inputCity);
    setInputCity("");
  };

  return (
    <>
      <div className="video-container">
        <video
          key={getVideo(data?.weather?.description)}
          autoPlay
          loop
          muted
          className="video-bg"
        >
          <source src={getVideo(data?.weather?.description)} type="video/mp4" />
        </video>

        <div className="content">
          {/* Header */}
          <div className="header-box">
            <h2 style={{ margin: 0, color: "#fff" }}>Weather App</h2>
            <input
              className="city-input"
              type="text"
              value={inputCity}
              placeholder="Enter city..."
              onChange={(e) => setInputCity(e.target.value)}
            />
            <button className="search-btn" onClick={handleCity}>
              Search
            </button>
          </div>

          {/* Main Weather Card */}
          <div className="weather-box">
            {loading && <p style={{ color: "yellow" }}>Loading...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}

            {data && !loading && (
              <>
                <h2>{data.city_name}</h2>
                <hr style={{ borderColor: "white" }} />

                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <div>
                    <p className="temp-big">{data.temp}°C</p>
                    <p>Feels Like: {data.app_temp}°C</p>
                  </div>

                  <div>
                    <p>{data.weather.description}</p>
                    <p>💨 Wind: {data.wind_spd} m/s</p>
                    <p>💧 Humidity: {data.rh}%</p>
                  </div>
                </div>

                {/* Forecast Grid */}
                <div className="forecast-container">
                  {forecast.map((day) => (
                    <div key={day.valid_date} className="forecast-card">
                      <p className="date-text">{day.valid_date}</p>
                      <p>{day.weather.description}</p>
                      <p>{day.temp}°C</p>
                      <p>💧 {day.rh}%</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Weather;
