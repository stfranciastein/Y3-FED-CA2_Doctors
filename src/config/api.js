import axios from "axios";

const instance = axios.create({
    baseURL: 'https://ca2-med-api.vercel.app',
    timeout: 10000,
    headers: {'Content-Type': 'application/json'}
});

export default instance;