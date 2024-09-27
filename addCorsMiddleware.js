const fs = require('fs');
const path = require('path');

// Directory containing API routes
const apiDir = path.join(__dirname, 'src/pages/api');

// CORS code to inject
const corsImport = `import cors, { runMiddleware } from '../../utils/cors';\n`;
const corsMiddleware = `
  // Run CORS middleware
  await runMiddleware(req, res, cors);
`;

// Recursively read through API files
const addCorsToApiFiles = (dir) => {
    fs.readdirSync(dir).forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.lstatSync(filePath);

        if (stat.isDirectory()) {
            // If it's a directory, search recursively
            addCorsToApiFiles(filePath);
        } else if (file.endsWith('.js')) {
            // Only apply to JS files in the API folder
            processApiFile(filePath);
        }
    });
};

// Function to add CORS middleware to individual API files
const processApiFile = (filePath) => {
    let fileContent = fs.readFileSync(filePath, 'utf8');

    // Skip if CORS middleware is already added
    if (fileContent.includes("runMiddleware") || fileContent.includes("cors")) {
        console.log(`Skipping ${filePath} (CORS already added)`);
        return;
    }

    // Add CORS import at the top
    fileContent = corsImport + fileContent;

    // Find the handler function and add CORS middleware inside it
    const handlerRegex = /(export default async function handler\(req, res\) {)/;

    if (handlerRegex.test(fileContent)) {
        fileContent = fileContent.replace(
            handlerRegex,
            `$1\n${corsMiddleware}\n`
        );

        // Save the modified file
        fs.writeFileSync(filePath, fileContent);
        console.log(`CORS added to ${filePath}`);
    }
};

// Start processing API directory
addCorsToApiFiles(apiDir);

console.log('CORS middleware added to all API routes.');
