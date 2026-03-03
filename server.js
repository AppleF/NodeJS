// server.js
import http from 'http';
import { handleArezouPage } from './arezoupage.js';
import { handlePhotoBooth } from './photobooth.js';
import { handleNumericalRecipes } from './nr.js';
import { handleCalculator } from './calculator.js';
import { handleTextEditor } from './texteditor.js';
import { handleHome, serveStatic } from './home.js';
import { handleCompiler, handleCompile } from './compiler.js';
import { handleFlappyBird } from './flappybird.js'; // ✅ Added

const PORT = 3000;

http.createServer(async (req, res) => {

  // Serve static files first
  if (await serveStatic(req, res)) return;

  // Routing
  const url = req.url.toLowerCase(); // normalize to lowercase

  if (url === '/' || url === '/index.html') {
    await handleHome(req, res);
  } else if (url.startsWith('/calculator')) {
    await handleCalculator(req, res);
  } else if (url.startsWith('/texteditor')) {
    await handleTextEditor(req, res);
  } else if (url.startsWith('/compiler')) {
    await handleCompiler(req, res);
  } else if (url === '/compile') {
    await handleCompile(req, res);
  } else if (url === '/photobooth') {
    await handlePhotoBooth(req, res);
  } else if (url.startsWith('/numericalrecipes')) {
    await handleNumericalRecipes(req, res);
  } else if (url.startsWith('/flappybird')) {   // ✅ Added route
    await handleFlappyBird(req, res);
  } else if (url.startsWith('/arezoupage')) {   // ✅ Added route
    await handleArezouPage(req, res);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Page not found');
  }

}).listen(PORT, () => 
  console.log(`Server running on http://localhost:${PORT}`)
);