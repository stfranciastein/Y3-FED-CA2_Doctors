import axios from "axios";

const instance = axios.create({
    baseURL: 'https://ca2-med-api.vercel.app',
    timeout: 10000,
    headers: {'Content-Type': 'application/json'}
});

// Fetch holidays from Nager.Date API
export const fetchHolidays = async (countryCode = 'IE', year = new Date().getFullYear()) => {
    try {
        const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`);
        const holidaysData = await response.json();
        return holidaysData;
    } catch (error) {
        console.error('Error fetching holidays:', error);
        return [];
    }
};

export default instance;