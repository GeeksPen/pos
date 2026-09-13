import axios from 'axios';
import { Platform } from 'react-native';

// Use env variable if provided, fallback to standard emulator/simulator addresses for dev
const defaultBaseURL = Platform.OS === 'android' ? 'http://10.0.2.2/api' : 'http://localhost/api';
const baseURL = process.env.EXPO_PUBLIC_API_URL || defaultBaseURL;

const api = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

export default api;
