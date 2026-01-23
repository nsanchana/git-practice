import axios from 'axios';

const symbol = 'LULU';
const url = 'http://localhost:3001/api/scrape/index'; // Adjust if needed

async function testCache() {
    console.log(`--- Testing Company Research for ${symbol} ---`);

    try {
        // First call - should trigger scraping and Gemini
        console.log('First call (Scraping + Gemini)...');
        const start1 = Date.now();
        const res1 = await axios.post('http://localhost:3001/api/scrape/index', { symbol });
        console.log(`Time taken: ${Date.now() - start1}ms`);
        console.log('Result samples:');
        console.log('- Analyst Target:', res1.data.metrics.find(m => m.label.includes('Target'))?.value);
        console.log('- Support/Resistance:', res1.data.signals[0]?.message);

        // Second call - should be instant from SQLite cache
        console.log('\nSecond call (Should be CACHED)...');
        const start2 = Date.now();
        const res2 = await axios.post('http://localhost:3001/api/scrape/index', { symbol });
        console.log(`Time taken: ${Date.now() - start2}ms`);

        if (Date.now() - start2 < 500) {
            console.log('SUCCESS: Cache hit confirmed (sub-500ms response).');
        } else {
            console.log('WARNING: Cache might have missed or response was slow.');
        }

    } catch (error) {
        console.error('Test failed:', error.message);
        if (error.response) console.error('Response data:', error.response.data);
    }
}

testCache();
