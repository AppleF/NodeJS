// nr.js
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nrDir = path.join(__dirname, 'nr'); // folder with C programs

export async function handleNumericalRecipes(req, res) {
  if (req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(getNumericalRecipesHTML());
  } else if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { command } = JSON.parse(body);
        if (!command || command.trim() === '') {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end('❌ No command provided');
          return;
        }

        // Execute only in nr folder
        exec(command, { cwd: nrDir }, (err, stdout, stderr) => {
          if (err) {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('❌ Error:\n' + stderr);
            return;
          }
          res.writeHead(200, { 'Content-Type': 'text/plain' });
          res.end(stdout || 'Command executed with no output.');
        });
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Error: ' + err.message);
      }
    });
  }
}

function getNumericalRecipesHTML() {
  return `
<html>
<head>
  <title>Numerical Recipes Terminal</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'Courier New', monospace;
      margin:0; padding:0;
      transition: background 0.3s, color 0.3s;
      background: #121212;
      color: #eee;
    }
    body.light {
      background: #f9f9f9;
      color: #111;
    }
    .container {
      max-width: 800px;
      margin: 50px auto;
      padding: 20px;
    }
    h2 {
      text-align: center;
      margin-bottom: 20px;
    }
    textarea {
      width: 100%;
      height: 100px;
      padding: 10px;
      font-family: monospace;
      font-size: 16px;
      border-radius: 5px;
      border: 1px solid #888;
      background: #1e1e1e;
      color: #fff;
      resize: vertical;
      transition: background 0.3s, color 0.3s;
    }
    body.light textarea {
      background: #eee;
      color: #111;
      border: 1px solid #ccc;
    }
    pre {
      margin-top: 20px;
      padding: 15px;
      border-radius: 5px;
      background: #1e1e1e;
      overflow: auto;
      max-height: 300px;
      white-space: pre-wrap;
      transition: background 0.3s, color 0.3s;
    }
    body.light pre {
      background: #f4f4f4;
      color: #111;
    }
    button {
      padding: 8px 16px;
      margin-top: 10px;
      font-weight: 600;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      background: #4fc3f7;
      color: #000;
      transition: opacity 0.2s;
    }
    button:hover { opacity: 0.85; }
    .toggle-theme {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 6px 12px;
      font-size: 14px;
      border-radius: 20px;
      background: #4fc3f7;
      color: #000;
      cursor: pointer;
      border: none;
    }
  </style>
</head>
<body>

  <button class="toggle-theme" onclick="toggleTheme()">Toggle Theme</button>

  <div class="container">
    <h2>Numerical Recipes Terminal</h2>
    <textarea id="command" placeholder="Type C commands like: cc filename.c"></textarea>
    <button onclick="runCommand()">Run</button>
    <pre id="output"></pre>
  </div>

  <script>
    function toggleTheme() {
      document.body.classList.toggle('light');
    }

    async function runCommand() {
      const cmd = document.getElementById('command').value;
      const outputEl = document.getElementById('output');
      outputEl.textContent = 'Running...';
      try {
        const res = await fetch('/numericalrecipes', {
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ command: cmd })
        });
        const text = await res.text();
        outputEl.textContent = text;
      } catch(err) {
        outputEl.textContent = 'Error: ' + err;
      }
    }
  </script>

</body>
</html>
`;
}