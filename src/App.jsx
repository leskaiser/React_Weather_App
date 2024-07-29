import {useEffect, useState} from "react";
import loader from './assets/loader.svg';
import browser from './assets/browser.svg';
import './App.css';

const API_KEY = import.meta.env.VITE_OPEN_WEATHER_MAP_API_KEY || null;
const URL = `http://api.airvisual.com/v2/nearest_station?key=${API_KEY}`;



function App() {
  const [weatherData, setWeatherData] = useState(null);
  const [errorInfo, setErrorInfo] = useState(null);

  useEffect(() => {
    // Fonction pour obtenir l'adresse IP de l'hôte
    async function getHostIP() {
      try {
        const response = await fetch('https://api64.ipify.org?format=json');
        if (!response.ok) throw new Error('Erreur lors de la récupération de l\'IP');
        const data = await response.json();
        return data.ip;
      } catch (error) {
        console.error('Erreur:', error);
        setErrorInfo({ msg: error.message });
      }
    }

    // Fonction pour obtenir les coordonnées latitude et longitude à partir de l'adresse IP
    async function getLatLong(ip) {
      try {
        const response = await fetch(`https://ipapi.co/${ip}/latlong/`);
        if (!response.ok) throw new Error('Erreur lors de la récupération des coordonnées');
        const latlong = (await response.text()).split(',');
        return latlong;
      } catch (error) {
        console.error('Erreur:', error);
        setErrorInfo({ msg: error.message });
      }
    }

    // Fonction pour obtenir la météo à partir des coordonnées
    async function getWeather(lat, lon) {
      try {
        const response = await fetch(`http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
        if (!response.ok) throw new Error(`Error: ${response.status}, ${response.statusText}`);
        const weather = await response.json();
        console.log(weather);
        // Conversion de la température de Kelvin en Celsius
        const temperatureInCelsius = weather.main.temp - 273.15;
        setWeatherData({
          city: weather.name,
          country: weather.sys.country,
          iconId: weather.weather[0].icon,
          temperature: temperatureInCelsius.toFixed(2),
        });
      } catch (error) {
        console.error('Erreur:', error);
        setErrorInfo({ msg: error.message });
      }
    }

    // Fonction principale pour orchestrer les appels
    async function main() {
      try {
        const ip = await getHostIP();
        if (!ip) return;

        const latlong = await getLatLong(ip);
        if (!latlong) return;

        const [lat, lon] = latlong;
        await getWeather(lat, lon);
      } catch (error) {
        console.error('Erreur:', error);
        setErrorInfo({ msg: error.message });
      }
    }

    // Appeler la fonction principale
    main();
  }, []);

  return (
    <main>
      <div className={`loader-container ${(!weatherData && !errorInfo) && "active"}`}>
        <img src={loader} alt="loading icon"/>
      </div>

      {weatherData && (
        <>
          <p className="city-name">{weatherData.city}</p>
          <p className="country-name">{weatherData.country}</p>
          <p className="temperature">{weatherData.temperature}°</p>
          <div className="info-icon-container">
            <img src={`/icons/${weatherData.iconId}.svg`} className={'info-icon'} alt="Weather icon"/>
          </div>
        </>
      )}

      {(errorInfo && !weatherData) && (
        <>
          <div className={'error'}>
            <p className="error-information">{errorInfo.msg}</p>
            <img src={browser} alt="error icon"/>
          </div>
        </>
      )}


    </main>
  );
}

export default App;
