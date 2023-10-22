import styled from '@emotion/styled';
import { ThemeProvider } from '@emotion/react'
import { useState, useEffect } from 'react';
import WeatherCard from './views/WeatherCard';
import WeatherSetting from './views/WeatherSetting';
import useWeatherAPI from './hooks/useWeatherAPI';
import { findLocation } from './utils/locationList';

const themeList = {
  light: {
    backgroundColor: '#ededed',
    foregroundColor: '#f9f9f9',
    boxShadow: '0 1px 3px 0 #999999',
    titleColor: '#212121',
    temperatureColor: '#757575',
    textColor: '#828282',
  },
  dark: {
    backgroundColor: '#1F2022',
    foregroundColor: '#121416',
    boxShadow:
      '0 1px 4px 0 rgba(12, 12, 13, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.15)',
    titleColor: '#f9f9fa',
    temperatureColor: '#dddddd',
    textColor: '#cccccc',
  },
};

const Container = styled.div`
  background-color: ${({ theme }) => theme.backgroundColor};
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const AUTHORIZATION_KEY = 'CWB-9C9E4215-F4D7-4160-BFDD-548A1E7C523A';

const App = () => {
  const [currentPage, setCurrentPage] = useState('WeatherCard');
  const handleCurrentPageChange = () => {
    if(currentPage === 'WeatherCard'){
      setCurrentPage('WeatherSetting');
    }else{
      setCurrentPage('WeatherCard');
    }
  }
  const [currentTheme, setCurrentTheme] = useState('light');
  const storageCity = localStorage.getItem('cityName') || '臺北市';
  const [currentCity, setCurrentCity] = useState(storageCity);
  const handleCurrentCity = (currentCity) => {
    setCurrentCity(currentCity);
  }
  const {locationName, cityName} = findLocation(currentCity);
  const [isLoading, weatherElement, fetchData] = useWeatherAPI({
    locationName,
    cityName,
    authorizationKey: AUTHORIZATION_KEY,
  })
  const moment = (weatherElement.observationTime.getHours() >= 6 && weatherElement.observationTime.getHours() < 18) ? "day" : "night";
  useEffect(() => {
    setCurrentTheme(moment == "day" ? "light" : "dark");
  }, [moment]);
  return (
    <ThemeProvider theme={themeList[currentTheme]}>
      <Container> 
        {currentPage === 'WeatherCard' && (
          <WeatherCard
            isLoading={isLoading}
            weatherElement={weatherElement}
            moment={moment}
            fetchData={fetchData}
            handleCurrentPageChange={handleCurrentPageChange}
          />
        )}
        {currentPage === 'WeatherSetting' && (
          <WeatherSetting 
            currentCity={currentCity}
            handleCurrentPageChange={handleCurrentPageChange}
            handleCurrentCity={handleCurrentCity}
          />)}
      </Container>
    </ThemeProvider>
  );
}

export default App;
