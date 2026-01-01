# vL Browser Agent

An open-source AI web automation tool that runs in your browser.

## 🛠️ Build and Install

### Prerequisites
*   [Node.js](https://nodejs.org/) (v22.12.0 or higher)
*   [pnpm](https://pnpm.io/installation) (v9.15.1 or higher)

### Build Steps

1.  **Clone the Repository**:
    ```bash
    git clone <repository-url>
    cd vL-browser--agent
    ```

2.  **Install Dependencies**:
    ```bash
    pnpm install
    ```

3.  **Build the Extension**:
    ```bash
    pnpm build
    ```

4.  **Load the Extension**:
    *   Open `chrome://extensions/` in Chrome.
    *   Enable **Developer mode** (top right).
    *   Click **Load unpacked** (top left).
    *   Select the `dist` folder generated in the project directory.

### Development Mode

To run in development mode with hot-reload:

```bash
pnpm dev
```

## ⚙️ Configuration

1.  Click the extension icon in your browser toolbar to open the sidebar.
2.  Click the **Settings** icon (top right).
3.  Add your LLM API keys (OpenAI, Anthropic, Gemini, Ollama, etc.).
4.  Choose which model to use for different agents (Navigator, Planner).

## 📄 License

This project is licensed under the Apache License 2.0.
