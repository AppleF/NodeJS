import { writeFile } from 'fs/promises';
import path from 'path';

const SAVE_DIRECTORY = './cfiles'; // Change if needed

export function handleTextEditor(req, res) {

  if (req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(getEditorHTML());
  }

  else if (req.method === 'POST') {
    let body = '';

    req.on('data', chunk => body += chunk);

    req.on('end', async () => {
      try {
        const data = JSON.parse(body);

        if (!data.filename || !data.content) {
          throw new Error("Filename and content required");
        }

        const safeFilename = path.basename(data.filename);
        const filePath = path.join(SAVE_DIRECTORY, safeFilename);

        await writeFile(filePath, data.content, 'utf8');

        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(`Saved as ${safeFilename}`);
      } 
      catch (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error saving file: ' + err.message);
      }
    });
  }
}

function getEditorHTML() {
  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Text Editor</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<style>
* { margin:0; padding:0; box-sizing:border-box; }

body {
  font-family:'Segoe UI', monospace;
  min-height:100vh;
  transition:background 0.4s,color 0.4s;
  padding-top:80px;
}

body.dark {
  background:#121212;
  color:#eee;
}

body.light {
  background:#f4f4f4;
  color:#111;
}

.navbar {
  position:fixed;
  top:0;
  width:100%;
  padding:20px 40px;
  display:flex;
  justify-content:space-between;
  align-items:center;
  backdrop-filter: blur(10px);
}

.toggle-btn {
  padding:8px 16px;
  border-radius:20px;
  border:none;
  cursor:pointer;
  font-weight:600;
  transition:0.3s;
}

.dark .toggle-btn { background:#4fc3f7; color:#000; }
.light .toggle-btn { background:#111; color:#fff; }

.container {
  max-width:900px;
  margin:auto;
  padding:20px;
}

textarea {
  width:100%;
  height:400px;
  font-family:monospace;
  font-size:16px;
  padding:15px;
  border-radius:5px;
  border:none;
  resize:vertical;
}

.dark textarea { background:#1e1e1e; color:#fff; }
.light textarea { background:#fff; color:#000; border:1px solid #ccc; }

button.save-btn {
  padding:10px 20px;
  margin-top:15px;
  border:none;
  border-radius:5px;
  cursor:pointer;
  font-weight:600;
  background:#4fc3f7;
  color:#000;
}

#status {
  margin-top:15px;
  font-weight:600;
}

h1 { margin-bottom:15px; }
p { margin-bottom:15px; opacity:0.8; }
</style>
</head>

<body class="dark">

<div class="navbar">
  <div><strong>Text Editor</strong></div>
  <button class="toggle-btn" onclick="toggleTheme()">Toggle Theme</button>
</div>

<div class="container">
  <h1>Dark / Light Themed Text Editor</h1>
  <p>Write your text and save it with any filename and extension.</p>

  <textarea id="editor" placeholder="Start typing..."></textarea>
  <br>
  <button class="save-btn" onclick="saveText()">Save As</button>

  <div id="status"></div>
</div>

<script>
function toggleTheme() {
  const body = document.body;
  body.classList.toggle('dark');
  body.classList.toggle('light');
}

async function saveText() {
  const text = document.getElementById('editor').value;

  const filename = prompt(
    "Save file as (example: notes.txt, script.js, data.json):"
  );

  if (!filename) {
    alert("Save cancelled.");
    return;
  }

  const res = await fetch('/texteditor', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({
      content: text,
      filename: filename
    })
  });

  const result = await res.text();
  document.getElementById('status').innerText = result;
}
</script>

</body>
</html>
  `;
}