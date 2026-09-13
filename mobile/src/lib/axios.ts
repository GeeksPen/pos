import axios from 'axios';
import { Platform } from 'react-native';

// For Android emulator it needs 10.0.2.2 to access host localhost
// For iOS simulator localhost works
const baseURL = Platform.OS === 'android' ? 'http://10.0.2.2:8000/api' : 'http://localhost:8000/api';

const api = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

export default api;
