import Geolocation from '@react-native-community/geolocation';
import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Dimensions,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Fontisto from 'react-native-vector-icons/Fontisto';

const SCREENT_WIDTH = Dimensions.get('window').width;
const API_KEY = `54ab9ddbcc5f748a72945bcf5dcbe455`;
const CLIENT_ID = `2fq2aw8r15`;
const CLIENT_SECRET = `YzfpLi67LLQxcHmbEhdUiTx2B8aDiguZiYjNIlMO`;
const icons = {
  Clouds: 'cloudy',
  Clear: 'day-sunny',
  Snow: 'snow',
  Rain: 'rains',
  Drizzle: 'rain',
  Thunderstorm: 'lightning',
  Atmosphere: 'cloudy-gusts',
};

const App = () => {
  const [latitude, setLatitude] = useState(0);
  const [logitude, setLogitude] = useState(0);
  const [days, setDays] = useState([]);
  const [city, setCity] = useState('');

  useEffect(() => {
    if (Platform.OS === 'android') {
      PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
    }
  }, []);

  useEffect(() => {
    const watchId = Geolocation.watchPosition(
      position => {
        setLatitude(position.coords.latitude);
        setLogitude(position.coords.longitude);
        fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${logitude}&appid=${API_KEY}&units=metric`,
        )
          .then(res => res.json())
          .then(data =>
            setDays(
              data.list.filter(weather => {
                if (weather.dt_txt.includes('00:00:00')) {
                  return weather;
                }
              }),
            ),
          );
        fetch(
          `https://naveropenapi.apigw.ntruss.com/map-reversegeocode/v2/gc?coords=129.0226,35.1562&orders=legalcode&output=json`,
          {
            headers: {
              'X-NCP-APIGW-API-KEY-ID': CLIENT_ID,
              'X-NCP-APIGW-API-KEY': CLIENT_SECRET,
            },
          },
        )
          .then(res => res.json())
          .then(data => {
            setCity(data.results[0].region.area3.name);
          });
      },
      error => {
        console.log(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
        distanceFilter: 1,
      },
    );

    return () => {
      Geolocation.clearWatch(watchId);
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.city}>
        <Text style={styles.cityName}>{city}</Text>
      </View>
      <ScrollView
        pagingEnabled
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.weather}>
        {days.length === 0 ? (
          <View style={styles.day}>
            <ActivityIndicator
              color="white"
              size="large"
              style={{marginTop: 10}}
            />
          </View>
        ) : (
          days.map((day, index) => (
            <View style={styles.day}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  width: '100%',
                  justifyContent: 'space-between',
                }}>
                <Text style={styles.temp}>
                  {parseFloat(day.main.temp).toFixed(1)}
                </Text>
                <Fontisto
                  name={icons[day.weather[0].main]}
                  size={68}
                  color="white"
                />
              </View>
              <Text style={styles.description}>{day.weather[0].main}</Text>
              <Text style={styles.tinyText}>{day.weather[0].description}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'tomato',
  },
  city: {
    flex: 1.2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weather: {},
  cityName: {
    fontSize: 68,
    fontWeight: '600',
    color: 'white',
  },
  day: {
    width: SCREENT_WIDTH,
    alignItems: 'flex-start',
    paddingLeft: 10,
    paddingRight: 10,
  },
  temp: {
    marginTop: 50,
    fontSize: 100,
    color: 'white',
    marginBottom: 10,
  },
  description: {
    marginTop: -30,
    fontSize: 30,
    color: 'white',
  },
  tinyText: {
    fontSize: 20,
    color: 'white',
  },
});

export default App;
