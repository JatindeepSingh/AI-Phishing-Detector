🔍 Pattern & Plagiarism Detector
String Pattern Matching & Plagiarism Detection Tool
Show Image
Show Image
Show Image
Show Image
Show Image
A text analysis tool implementing Rabin-Karp, KMP, and Boyer-Moore algorithms entirely in C++ to search patterns across documents — compares algorithms on execution time and match count, and highlights potentially plagiarized or repeated content.
Pattern Matching • Algorithm Benchmarking • Real-time Highlighting • Similarity Scoring • Web UI

📋 Overview
Pattern & Plagiarism Detector is a systems-level project that implements three classic string searching algorithms from scratch in C++17. The compiled binary outputs structured JSON, which a lightweight Node.js + Express bridge serves to a browser-based frontend. Users can paste any text, enter a search pattern, and instantly see where it appears — along with a side-by-side comparison of how each algorithm performed.
🎯 Purpose
Plagiarism and repeated content are major concerns in academia and publishing. This tool gives users a fast, algorithm-driven way to detect patterns and repetitions in documents — while also serving as a practical demonstration of how different string matching algorithms compare in real-world usage.

✨ Features

🤖 Three Algorithms — Rabin-Karp, KMP, and Boyer-Moore all implemented from scratch in C++17
⚡ Algorithm Benchmarking — Side-by-side execution time comparison in microseconds with visual bars
🏆 Fastest Algorithm Badge — Automatically highlights which algorithm won for the given input
🖊️ Match Highlighting — All occurrences highlighted and pulsing in the output text
📊 Similarity Score — 0–100% coverage score with a colour-coded meter
📁 File Mode — Analyze full documents via --file flag on the CLI
🌐 Web UI — Dark terminal-style interface served via Express, no framework required
🔧 VS Code Ready — Pre-configured tasks.json and launch.json for build and debug


🏗️ System Architecture
📦 Pattern & Plagiarism Detector
│
├── 🖥️  Frontend (Vanilla HTML/CSS/JS)
│   └── index.html   — Input, results, algorithm table, highlighted output
│
├── ⚡ Bridge (Node.js + Express)
│   └── server.js    — Spawns C++ binary, passes text via temp file, returns JSON
│
└── 🤖 Detection Engine (C++17)
    ├── rabin_karp.cpp    — Rolling hash, avg O(n+m)
    ├── kmp.cpp           — Failure function, guaranteed O(n+m)
    ├── boyer_moore.cpp   — Bad-char + good-suffix, O(n/m) best case
    ├── json_output.cpp   — Serializes results to stdout as JSON
    └── detector.cpp      — Entry point, times all 3, calls outputJSON

🧠 Algorithm Comparison
AlgorithmTime (Average)Time (Worst)SpaceBest Used ForRabin-KarpO(n + m)O(nm)O(1)Multiple patterns, large documentsKMPO(n + m)O(n + m)O(m)Guaranteed linear, single patternBoyer-MooreO(n / m)O(nm)O(σ + m)Long patterns on natural language text

σ = alphabet size (256 for ASCII text)

How Scoring Works
Input Text + Pattern
        ↓
Run all 3 algorithms (timed individually)
        ↓
Collect match positions + execution time (µs)
        ↓
Similarity = (matches × pattern_length) / text_length × 100
        ↓
  0–19%  →  ✅ LOW  (green)
 20–49%  →  ⚠️  MEDIUM (amber)
 50–100% →  🚨 HIGH  (red)
        ↓
JSON → Node.js → Browser → Highlighted Output

🚀 Quick Start
Prerequisites
RequirementVersionDownloadg++ / MinGW13+msys2.org (Windows)make / mingw32-make4+Included with MSYS2Node.js18+nodejs.org
⚡ Windows Setup (MSYS2)
bash# In MSYS2 MinGW x64 terminal
pacman -S mingw-w64-x86_64-gcc mingw-w64-x86_64-make
Then add C:\msys64\mingw64\bin to your Windows PATH environment variable.
⚡ Linux / Mac Setup
bash# Ubuntu / Debian
sudo apt install g++ make

# Mac
xcode-select --install

1. Clone the Repository
bashgit clone https://github.com/YourUsername/pattern-plagiarism-detector.git
cd pattern-plagiarism-detector
2. Install Node Dependencies
bashnpm install
3. Compile the C++ Binary
bash# Linux / Mac
make

# Windows
mingw32-make
✅ Produces detector (Linux/Mac) or detector.exe (Windows)
4. Start the Web Server
bashnode server.js
✅ Server runs at http://localhost:3000
5. Open in Browser
http://localhost:3000

🖥️ CLI Usage
You can also run the C++ binary directly from the terminal:
bash# Search pattern in inline text
./detector "the cat sat on the mat and the cat came back" "cat"

# Search pattern in a file
./detector samples/sample1.txt "quick brown fox" --file
Sample JSON Output
json{
  "text": "the cat sat on the mat...",
  "pattern": "cat",
  "similarity": 12.5,
  "matchPositions": [4, 18],
  "matchCount": 2,
  "algorithms": [
    { "name": "Rabin-Karp",  "matchCount": 2, "timeUs": 3, "matches": [4, 18] },
    { "name": "KMP",         "matchCount": 2, "timeUs": 2, "matches": [4, 18] },
    { "name": "Boyer-Moore", "matchCount": 2, "timeUs": 1, "matches": [4, 18] }
  ]
}

📁 Project Structure
pattern-plagiarism-detector/
│
├── src/
│   ├── detector.cpp        ← Main entry point
│   ├── rabin_karp.cpp      ← Rabin-Karp implementation
│   ├── kmp.cpp             ← KMP implementation
│   ├── boyer_moore.cpp     ← Boyer-Moore implementation
│   └── json_output.cpp     ← JSON serializer
│
├── include/
│   ├── algorithms.h        ← Declarations + AlgorithmResult struct
│   └── json_output.h       ← outputJSON declaration
│
├── frontend/
│   └── index.html          ← Web UI (single file, no build step needed)
│
├── samples/
│   └── sample1.txt         ← Sample document for testing
│
├── .vscode/
│   ├── tasks.json          ← Build / Run / Clean tasks
│   └── launch.json         ← C++ debugger config (F5)
│
├── Makefile                ← Compiles all C++ sources
├── server.js               ← Express bridge server
├── package.json
└── README.md

🧪 Test Inputs
High Repetition (high similarity score expected)
the quick brown fox jumps over the lazy dog the quick brown fox
Pattern: the quick brown fox
No Match
hello world this is a test document
Pattern: xyz
File Mode
bash./detector samples/sample1.txt "quick brown fox" --file

🛠️ VS Code Integration
Build (Ctrl+Shift+B)
Runs make / mingw32-make automatically via tasks.json.
Debug (F5)
Launches the C++ binary with sample input via launch.json. Set breakpoints anywhere in the source files.
All Tasks (Ctrl+Shift+P → "Run Task")
TaskWhat it doesBuild C++ (make)Compiles all source filesStart Web ServerRuns node server.jsBuild & RunCompiles then starts serverRun CLI TestRuns make test with sample inputsCleanDeletes the compiled binary

🤝 Contributing

Fork the repository
Create your feature branch: git checkout -b feature/YourFeature
Commit your changes: git commit -m 'Add YourFeature'
Push to the branch: git push origin feature/YourFeature
Open a Pull Request


⚠️ Disclaimer
This tool is intended for educational and academic use. The similarity score is based on exact pattern coverage and is not a substitute for a full plagiarism detection system. Always verify results manually.

📝 License
This project is open source and available under the MIT License.

👨‍💻 Developer
Jatindeep Singh
🌟 Star this repo if it helped you!