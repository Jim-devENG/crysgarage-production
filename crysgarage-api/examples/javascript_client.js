/**
 * CrysGarage API JavaScript Client Example
 */

class CrysGarageAPI {
    constructor(baseUrl = 'https://crysgarage.studio/api/v1') {
        this.baseUrl = baseUrl;
    }

    async healthCheck() {
        const response = await fetch(this.baseUrl + '/../health');
        return await response.json();
    }

    async getInfo() {
        const response = await fetch(this.baseUrl + '/info');
        return await response.json();
    }

    async getTiers() {
        const response = await fetch(this.baseUrl + '/tiers');
        return await response.json();
    }

    async masterAudio(file, tier = 'professional', genre = 'default') {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('tier', tier);
        formData.append('genre', genre);

        const response = await fetch(this.baseUrl + '/master', {
            method: 'POST',
            body: formData
        });

        return await response.json();
    }

    async getStatus(fileId) {
        const response = await fetch(this.baseUrl + '/status/' + fileId);
        return await response.json();
    }

    async downloadFile(fileId) {
        const response = await fetch(this.baseUrl + '/download/' + fileId);
        return await response.blob();
    }
}

// Example usage
async function example() {
    const api = new CrysGarageAPI();
    
    console.log('Health Check:', await api.healthCheck());
    console.log('API Info:', await api.getInfo());
    console.log('Tiers:', await api.getTiers());
}

example();
