import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  // baseURL: 'http://192.168.1.2:3333' //praia
  // baseURL: 'http://192.168.1.36:3333' // casa
  baseURL: 'http://192.168.250.6:3333' //apto
});

api.interceptors.response.use(
  (response) => {
    return response;
  }, async (error) => {
    if (error.response && error.response.status === 401) {
      await AsyncStorage.removeItem('@sujeitopizzaria');
    }

    return Promise.reject(error);
  }
);

export { api };