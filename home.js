// home.js
import { readFile } from 'fs/promises';
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Absolute path to your C files folder
const cfilesDir = '/Users/you/my-node-project/cfiles';

export async function handleHome(req, res) {
  if (req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(getHomeHTML());
  }
}

export async function serveStatic(req, res) {
  if (req.url.startsWith('/public/')) {
    try {
      const filePath = path.join(__dirname, req.url);
      const data = await readFile(filePath);

      const ext = path.extname(filePath);
      const contentType =
        ext === '.png'
          ? 'image/png'
          : ext === '.jpg' || ext === '.jpeg'
          ? 'image/jpeg'
          : 'application/octet-stream';

      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
      return true;
    } catch (err) {
      res.writeHead(404);
      res.end();
      return true;
    }
  }
  return false;
}

// Compile and then run the C program
export async function handleCompile(req, res) {
  if (req.method !== 'POST') {
    res.writeHead(405);
    res.end('Method not allowed');
    return;
  }

  const compileCommand = `cc ${path.join(cfilesDir,'file.c')} ${path.join(cfilesDir,'file1.c')} ${path.join(cfilesDir,'file2.c')} -o ${path.join(cfilesDir,'program')}`;

  exec(compileCommand, (compileError, compileStdout, compileStderr) => {
    if (compileError) {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end("Compilation Error:\n\n" + compileStderr);
      return;
    }

    const runCommand = `${path.join(cfilesDir,'program')}`;

    exec(runCommand, (runError, runStdout, runStderr) => {
      if (runError) {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end("Program Runtime Error:\n\n" + runStderr);
        return;
      }

      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end(
        "Compilation Successful.\n\n" +
        "Program Output:\n\n" +
        (runStdout || "Program executed with no output.")
      );
    });
  });
}

// HTML for landing page
function getHomeHTML() {
  return `
<html>
<head>
  <title>Modern Node App</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Segoe UI', sans-serif; min-height:200vh; transition:background 0.4s,color 0.4s; }

    body.dark {
      background: linear-gradient(135deg, rgba(0,0,0,0.85), rgba(0,0,0,0.6)), url('/public/image.png');
      background-size: cover; 
      background-position:center; 
      background-attachment:fixed; 
      color:white;
    }

    body.light {
      background: linear-gradient(135deg, rgba(255,255,255,0.85), rgba(255,255,255,0.6)), url('/public/image.png');
      background-size: cover; 
      background-position:center; 
      background-attachment:fixed; 
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

    .section { 
      height:100vh; 
      display:flex; 
      flex-direction:column; 
      justify-content:center; 
      align-items:center; 
      text-align:center; 
      padding:40px; 
    }

    h1 { font-size:48px; margin-bottom:20px; }
    p { max-width:600px; font-size:18px; line-height:1.6; margin-bottom:30px; }

    .buttons { 
      display:flex; 
      gap:20px; 
      flex-wrap:wrap; 
      justify-content:center; 
      align-items:center; 
    }

    .btn { 
      padding:12px 28px; 
      border-radius:40px; 
      font-weight:600; 
      text-decoration:none; 
      transition:0.3s; 
    }

    .btn-primary { 
      background:#4fc3f7; 
      color:#000; 
    }

    .btn-primary:hover { 
      transform:translateY(-3px); 
      box-shadow:0 8px 20px rgba(79,195,247,0.4); 
    }

    .btn-secondary { 
      border:1px solid currentColor; 
      color:inherit; 
    }

    .btn-secondary:hover { 
      background:rgba(255,255,255,0.15); 
    }
  </style>
</head>

<body class="dark">

  <div class="navbar">
    <div><strong>My Node App</strong></div>
    <button class="toggle-btn" onclick="toggleTheme()">Toggle Theme</button>
  </div>

  <div class="section">
    <h1>Home Page</h1>
    <p></p>

    <div class="buttons">
      <a href="/calculator" class="btn btn-primary">Calculator</a>
      <a href="/texteditor" class="btn btn-secondary">Text Editor</a>
      <a href="/compiler" class="btn btn-primary">C Compiler</a>
      <a href="/numericalrecipes" class="btn btn-secondary">Numerical Recipes Terminal</a>
    </div>

    <pre id="output"></pre>
  </div>

  <div class="section">
    <h1>Second Section</h1>
    <p></p>

    <div class="buttons">
      <a href="/photobooth" class="btn btn-primary">Photo Booth</a>
      <a href="/flappybird" class="btn btn-secondary">Flappy Bird</a>
    <a href="/arezoupage" class="btn btn-primary">Arezou's Button</a>
    </div>
  </div>

  <script>
    function toggleTheme() {
      const body = document.body;
      body.classList.toggle('dark');
      body.classList.toggle('light');
    }
  </script>

</body>
</html>
`;
}