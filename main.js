const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { exec } = require('child_process');

// Function to download and save the MP4 file from a given IPFS link
async function downloadAndSaveMP4(ipfsLink) {
    try {
        const response = await axios.get(ipfsLink, { responseType: 'stream' });
        const filePath = path.join(__dirname, 'MP4s', path.basename(ipfsLink));
        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);
        return new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
    } catch (error) {
        console.error(`Error downloading MP4 from ${ipfsLink}: ${error}`);
    }
}

// Function to process each JSON file in the designated folder
async function processJSONFiles(folderPath) {
    try {
        const files = fs.readdirSync(folderPath);
        for (const file of files) {
            if (file.endsWith('.json')) {
                const filePath = path.join(folderPath, file);
                const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                const ipfsLink = jsonData.image; // Assuming 'image' field contains IPFS link
                if (ipfsLink) {
                    await downloadAndSaveMP4(ipfsLink);
                } else {
                    console.error(`No IPFS link found in ${file}`);
                }
            }
        }
    } catch (error) {
        console.error(`Error processing JSON files: ${error}`);
    }
}

// Define the folder containing JSON files
const folderPath = '/path/to/your/json/folder';

// Ensure the MP4s folder exists
const mp4FolderPath = path.join(__dirname, 'MP4s');
if (!fs.existsSync(mp4FolderPath)) {
    fs.mkdirSync(mp4FolderPath);
}

// Start processing JSON files
processJSONFiles(folderPath);
