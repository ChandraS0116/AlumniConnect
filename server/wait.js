import net from "node:net";

const PORT = 5000;
const HOST = "127.0.0.1";
const MAX_ATTEMPTS = 40; // 4 seconds max

let attempts = 0;

function check() {
  const socket = net.createConnection(PORT, HOST);
  socket.once("connect", () => {
    socket.destroy();
    process.exit(0);
  });
  socket.once("error", () => {
    attempts++;
    if (attempts >= MAX_ATTEMPTS) {
      process.exit(0);
    }
    setTimeout(check, 100);
  });
}

check();
