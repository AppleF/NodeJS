export function executeCommand(cmd) {
  const parts = cmd.trim().split(/\s+/);
  const op = parts[0].toLowerCase();
  const num1 = Number(parts[1]);
  const num2 = parts.length > 2 ? Number(parts[2]) : null;

  switch (op) {
    case 'add': return add(num1, num2);
    case 'subtract': return subtract(num1, num2);
    case 'multiply': return multiply(num1, num2);
    case 'divide': return divide(num1, num2);
    case 'power': return power(num1, num2);
    case 'sqrt': return sqrt(num1);
    case 'mod': return mod(num1, num2);
    case 'sin': return sin(num1);
    case 'cos': return cos(num1);
    case 'tan': return tan(num1);
    default: throw new Error('Unknown operation');
  }
}

// ----------------------------
// Math Functions
// ----------------------------
function add(a, b) { return a + b; }
function subtract(a, b) { return a - b; }
function multiply(a, b) { return a * b; }

function divide(a, b) {
  if (b === 0) throw new Error('Cannot divide by zero');
  return a / b;
}

function power(a, b) { return Math.pow(a, b); }

function sqrt(a) {
  if (a < 0) throw new Error('Cannot take square root of negative number');
  return Math.sqrt(a);
}

function mod(a, b) { return a % b; }

// Trig (degrees)
function toRadians(deg) { return deg * (Math.PI / 180); }
function sin(a) { return Math.sin(toRadians(a)); }
function cos(a) { return Math.cos(toRadians(a)); }
function tan(a) { return Math.tan(toRadians(a)); }

// ----------------------------
// Route Handler
// ----------------------------
export function handleCalculator(req, res) {
  if (req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(getCalculatorHTML());
  }

  else if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { command } = JSON.parse(body);
        const result = executeCommand(command);
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(result.toString());
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Error: ' + err.message);
      }
    });
  }
}

function getCalculatorHTML() {
  return `
<html>
<head>
  <title>CLI Calculator</title>
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
      max-width:700px;
      margin:auto;
      padding:20px;
    }

    input {
      width:70%;
      padding:10px;
      font-family:monospace;
      border-radius:5px;
      border:none;
      outline:none;
    }

    .dark input { background:#1e1e1e; color:#fff; }
    .light input { background:#fff; color:#000; border:1px solid #ccc; }

    button.run-btn {
      padding:10px 20px;
      margin-left:10px;
      border:none;
      border-radius:5px;
      cursor:pointer;
      font-weight:600;
      background:#4fc3f7;
      color:#000;
    }

    #output {
      margin-top:20px;
      padding:15px;
      border-radius:5px;
      min-height:200px;
      white-space:pre-wrap;
      overflow-y:auto;
    }

    .dark #output { background:#1e1e1e; }
    .light #output { background:#ffffff; border:1px solid #ddd; }

    h1 { margin-bottom:15px; }
    p { margin-bottom:20px; opacity:0.8; }
  </style>
</head>

<body class="dark">

  <div class="navbar">
    <div><strong>Calculator</strong></div>
    <button class="toggle-btn" onclick="toggleTheme()">Toggle Theme</button>
  </div>

  <div class="container">
    <h1>CLI Calculator</h1>
    <p>
      add 10 5 | subtract 8 3 | multiply 4 6 | divide 10 2 |
      sqrt 144 | power 2 10 | mod 10 3 |
      sin 90 | cos 60 | tan 45
    </p>

    <input type="text" id="command" placeholder="Enter command..." />
    <button class="run-btn" onclick="runCommand()">Run</button>

    <div id="output"></div>
  </div>

  <script>
    function toggleTheme() {
      const body = document.body;
      body.classList.toggle('dark');
      body.classList.toggle('light');
    }

    const input = document.getElementById('command');

    input.addEventListener("keydown", function(event) {
      if (event.key === "Enter") {
        runCommand();
      }
    });

    async function runCommand() {
      const cmd = input.value.trim();
      if (!cmd) return;

      const res = await fetch('/calculator', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ command: cmd })
      });

      const result = await res.text();

      const output = document.getElementById('output');
      output.innerText += '> ' + cmd + '\\n' + result + '\\n\\n';
      output.scrollTop = output.scrollHeight;

      input.value = '';
    }
  </script>

</body>
</html>
`;
}