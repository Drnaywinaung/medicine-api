const express = require('express');
const cors = require('cors');
const fs = require('fs');

// Create the Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Load the medicine data from the JSON file when the server starts
let medicines = [];
try {
    const data = fs.readFileSync('medicines.json', 'utf8');
    medicines = JSON.parse(data);
    console.log(`${medicines.length} medicines loaded successfully.`);
} catch (err) {
    console.error("Error reading or parsing medicines.json:", err);
    process.exit(1); // Exit if the data can't be loaded
}

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // To parse JSON bodies

// --- API Endpoints ---

// A simple root endpoint to confirm the API is running
app.get('/', (req, res) => {
    res.send('Medicine Search API is running!');
});

// The main search endpoint
app.get('/api/search', (req, res) => {
    // Get the search query from the URL (e.g., /api/search?q=para)
    const query = req.query.q;

    if (!query) {
        return res.status(400).json({ error: 'Search query "q" is required.' });
    }

    const lowerCaseQuery = query.toLowerCase();

    // Filter the medicines array based on the query
    const results = medicines.filter(med => {
        // By adding '|| ""', we ensure that if a property is missing (undefined),
        // we try to search on an empty string instead of crashing.
        const brandName = (med.name || '').toLowerCase();
        const genericName = (med.short_composition1 || '').toLowerCase();
        const uses = (med.medicine_desc || '').toLowerCase();

        return brandName.includes(lowerCaseQuery) ||
               genericName.includes(lowerCaseQuery) ||
               uses.includes(lowerCaseQuery);
    });

    res.json(results);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});