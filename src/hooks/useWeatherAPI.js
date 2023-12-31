import { useState, useEffect, useCallback } from "react";
import dayjs from "dayjs";

const fetchCurrentWeather = async({ authorizationKey, locationName }) => {
    const response = await fetch(
      `https://opendata.cwb.gov.tw/api/v1/rest/datastore/O-A0003-001?Authorization=${authorizationKey}&StationName=${locationName}`
    )
    const data = await response.json();
    const locationData = data.records.Station[0].WeatherElement;
    console.log(locationData);
    return {
      observationTime: new Date(dayjs(locationData.observationTime)),
      WDSD: locationData.WindSpeed,
      TEMP: locationData.AirTemperature,
    };
}
  
const fetchWeatherForecast = async({ authorizationKey, cityName }) => {
    const response = await fetch(
      `https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=${authorizationKey}&locationName=${cityName}`
    )
    const data = await response.json();
    const locationData = data.records.location[0];
    const weatherElements = locationData.weatherElement.reduce((neededElements, item) => {
      if (['Wx', 'PoP', 'CI'].includes(item.elementName)){
        neededElements[item.elementName] = item.time[0].parameter;
      }
      return neededElements;
    }, {});
    const {Wx, PoP, CI} = weatherElements;
   return {
      locationName: locationData.locationName,
      description: Wx.parameterName,
      weatherCode: Wx.parameterValue,
      rainPossibility: PoP.parameterName,
      comfortability: CI.parameterName,
    };
}

const useWeatherAPI = ({ locationName, cityName, authorizationKey}) => {
    const [isLoading, setIsLoading] = useState(true);
    const [weatherElement, setWeatherElement] = useState({
        locationName: '',
        description: '',
        TEMP: 0,
        WDSD: 0,
        rainPossibility: 0,
        comfortability: '',
        weatherCode: 0,
        observationTime: new Date(),
    });
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        const [currentWeather, weatherForecast] = await Promise.all([
          fetchCurrentWeather({ authorizationKey, locationName }),
          fetchWeatherForecast({ authorizationKey, cityName })
        ]);
        setWeatherElement({
          ...currentWeather,
          ...weatherForecast,
        });
        setIsLoading(false);
    }, [locationName, cityName, authorizationKey]);
    useEffect(() => {
        fetchData();
    }, [fetchData]);
    return [isLoading, weatherElement, fetchData];
};

export default useWeatherAPI;