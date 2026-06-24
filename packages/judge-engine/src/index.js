console.log('[judge-engine] service started');

setInterval(() => {
  // Keep the container alive for Compose while the real executor is wired up.
}, 60000);

process.stdin.resume();
