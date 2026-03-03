// compiler.js
import { writeFile, unlink } from 'fs/promises';
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to your C files folder
const cfilesDir = '/home/ghost/intellectual/nodeJS/website/cfiles';
const tempFile = path.join(cfilesDir, 'user_temp.c');
const programFile = path.join(cfilesDir, 'program');

// Serve the compiler IDE page
export async function handleCompiler(req, res) {
  if (req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(getCompilerHTML());
  }
}

// Compile code (textarea only)
export async function handleCompile(req, res) {
  if (req.method !== 'POST') {
    res.writeHead(405);
    res.end('Method not allowed');
    return;
  }

  let body = '';
  req.on('data', chunk => (body += chunk));
  req.on('end', async () => {
    try {
      const { code } = JSON.parse(body);

      if (!code || code.trim() === '') {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('❌ No code written, cannot compile.');
        return;
      }

      await writeFile(tempFile, code);

      const compileCommand = `cc ${tempFile} -o ${programFile}`;

      exec(compileCommand, (compileError, compileStdout, compileStderr) => {
        if (compileError) {
          res.writeHead(200, { 'Content-Type': 'text/plain' });
          res.end("❌ Compilation Error:\n\n" + compileStderr);
          return;
        }

        exec(programFile, async (runError, runStdout, runStderr) => {
          await unlink(tempFile).catch(() => {});

          if (runError) {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end("⚠ Runtime Error:\n\n" + runStderr);
            return;
          }

          res.writeHead(200, { 'Content-Type': 'text/plain' });
          res.end(
            "✅ Compilation Successful!\n\n🚀 Program Output:\n\n" +
            (runStdout || "Program executed with no output.")
          );
        });
      });

    } catch {
      res.writeHead(400);
      res.end('Bad request');
    }
  });
}

// IDE HTML page with theme toggle
function getCompilerHTML() {
  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Browser C Compiler IDE</title>
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
  height:300px;
  font-family:monospace;
  font-size:16px;
  padding:10px;
  border-radius:5px;
  border:none;
  resize:vertical;
}

.dark textarea { background:#1e1e1e; color:#fff; }
.light textarea { background:#fff; color:#000; border:1px solid #ccc; }

button.run-btn {
  padding:10px 20px;
  margin-top:10px;
  border:none;
  border-radius:5px;
  cursor:pointer;
  font-weight:600;
  background:#4fc3f7;
  color:#000;
}

pre {
  margin-top:20px;
  padding:15px;
  border-radius:5px;
  max-height:400px;
  overflow:auto;
  white-space:pre-wrap;
}

.dark pre { background:#1e1e1e; }
.light pre { background:#ffffff; border:1px solid #ddd; }

h1 { margin-bottom:15px; }
p { margin-bottom:15px; opacity:0.8; }
</style>
</head>

<body class="dark">

<div class="navbar">
  <div><strong>Compiler</strong></div>
  <button class="toggle-btn" onclick="toggleTheme()">Toggle Theme</button>
</div>

<div class="container">
  <h1>Browser C Compiler IDE</h1>
  <p>Type your C code below and click compile.</p>

  <textarea id="code" placeholder="// Type your C code here"></textarea>
  <br>
  <button class="run-btn" onclick="compileProgram()">Compile</button>

  <h2 style="margin-top:20px;">Output:</h2>
  <pre id="output"></pre>
</div>

<script>
function toggleTheme() {
  const body = document.body;
  body.classList.toggle('dark');
  body.classList.toggle('light');
}

async function compileProgram() {
  const code = document.getElementById('code').value;
  const outputEl = document.getElementById('output');
  outputEl.textContent = "Compiling...";

  try {
    const res = await fetch('/compile', {
      method:'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ code })
    });

    const text = await res.text();
    outputEl.textContent = text;

  } catch(err) {
    outputEl.textContent = "Error: " + err;
  }
}
</script>

</body>
</html>
  `;
}