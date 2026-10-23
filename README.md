# 🚀 Auto-Committer

A lightning-fast, AI-powered CLI tool that analyzes your uncommitted git changes and automatically groups them into logical, Conventional Commits. Built for speed so it is actually faster than typing `git add -p` manually.

## ✨ Features

- **⚡ Zero-Latency AI**: Powered by Google's `gemini-flash-lite-latest` model for instant, millisecond diff analysis.
- **🧠 Intelligent Grouping**: Reads your entire workspace diff and groups unrelated changes (e.g., bug fixes vs. feature additions) into separate, atomic commits.
- **🛡️ Bulletproof Networking**: Built-in IPv4 DNS forcing to bypass the notorious Node.js IPv6 hanging bug on strict ISPs.
- **💅 Beautiful UI**: Interactive, terminal-native prompts powered by `@clack/prompts` to review, confirm, and push your code.

## 🛠️ Tech Stack

- **Runtime**: Node.js & TypeScript
- **AI**: `@google/genai` (Gemini API)
- **UI**: `@clack/prompts`
- **Git Operations**: Native child processes / `simple-git`

## ⚙️ Setup & Installation

1. **Clone the repository:**
   \`\`\`bash
   git clone <your-repo-url>
   cd auto-committer
   \`\`\`

2. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

3. **Configure your environment:**
   Create a `.env` file in the root directory and add your Google Gemini API key:
   \`\`\`env
   GEMINI_API_KEY=your_api_key_here
   \`\`\`

## 🚀 Usage

Run the CLI tool from your project directory whenever you have uncommitted changes:

\`\`\`bash
npm run dev
\`\`\`

**What to expect:**
1. The agent extracts your git diff (including untracked files).
2. Gemini analyzes the code and generates logical commit groups with conventional messages.
3. You review the proposed commits in the terminal.
4. Confirm to execute the commits locally.
5. (Optional) Confirm to push directly to your remote repository.

## 🧠 Under the Hood: Why is it so fast?

Most AI committers suffer from network timeouts and large payload bottlenecks. This tool solves both:
1. **Model Selection**: Uses `gemini-flash-lite-latest`, keeping it off the highly congested main `flash` clusters.
2. **DNS Resolution**: Enforces `dns.setDefaultResultOrder('ipv4first')` to prevent the underlying `fetch` API from silently timing out on ISPs that drop IPv6 packets.

## 📜 License

MIT License