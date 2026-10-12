import { solve } from "./engine";
self.onmessage = (e) => {
  try {
    self.postMessage(solve(e.data.config, e.data.vehicles, 160000));
  } catch {
    self.postMessage({ status: "limit", moves: [], visited: 0 });
  }
};
