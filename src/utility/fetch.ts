import axios from 'axios';

/**
 * Attaches a given access token to a MS Graph API call
 * @param endpoint - REST API endpoint to call
 * @param accessToken - raw access token string
 * @returns Response data from the API call
 */
async function fetch(endpoint: string, accessToken: string): Promise<any> {
    const options = {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    };

    console.log(`Request made to ${endpoint} at: ` + new Date().toString());

    try {
        const response = await axios.get(endpoint, options);
        return response.data;
    } catch (error) {
        throw new Error(`Failed to fetch from endpoint ${endpoint}: ${error}`);
    }
}

export default fetch;
