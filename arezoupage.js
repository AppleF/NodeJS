// arezoupage.js

export function handleArezouPage(req, res) {
    res.writeHead(200, { 'Content-Type': 'text/html' });

    res.end(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Arezou Page</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f0f0f0;
                    text-align: center;
                    padding-top: 100px;
                }
                h1 { color: #333; }
            </style>
        </head>
        <body>
            <h1>Welcome to Arezou's Page 🌸</h1>
            <p>This page is working correctly!</p>
        </body>
        </html>
    `);
}