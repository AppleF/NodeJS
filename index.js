import { createServer } from './server.js';

const PORT = 3000;

const server = createServer();

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Text Editor: http://localhost:${PORT}/texteditor`);
  console.log(`CLI Calculator: http://localhost:${PORT}/calculator`);
});
