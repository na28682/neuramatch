const { spawn } = require("child_process");
const path = require("path");

// Calls match.py with the mood text, returns parsed JSON result.
// Uses the venv python so it has access to pinecone/sentence-transformers/supabase.
function runMatch(moodText) {
  return new Promise((resolve, reject) => {
    const pythonPath = path.join(__dirname, "..", "venv", "bin", "python3");
    const scriptPath = path.join(__dirname, "match.py");

    const proc = spawn(pythonPath, [scriptPath, moodText]);

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    proc.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    proc.on("close", (code) => {
      if (code !== 0) {
        return reject(new Error(stderr || `match.py exited with code ${code}`));
      }
      try {
        const result = JSON.parse(stdout);
        resolve(result);
      } catch (err) {
        reject(new Error(`Failed to parse match.py output: ${stdout}`));
      }
    });
  });
}

module.exports = { runMatch };
