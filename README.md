# yoannmoi.net - 3D Cube Redesign

This is a redesign of the personal website yoannmoi.net, featuring a 3D cube interface.

## Local Development

To run this website locally, you'll need Node.js and npm installed.

1.  **Clone the repository (if you haven't already):**
    ```bash
    git clone <repository_url>
    cd <repository_directory>
    ```

2.  **Install dependencies:**
    This project uses `http-server` to serve files locally, overcoming CORS issues with ES Modules loaded from CDNs.
    ```bash
    npm install
    ```

3.  **Start the local server:**
    ```bash
    npm start
    ```
    This will typically open the website in your default web browser at `http://localhost:8080`.

## About the Implementation

-   **3D Engine:** [Three.js](https://threejs.org/) (using `CSS3DRenderer` for HTML content on cube faces)
-   **Animation Engine:** [Anime.js](https://animejs.com/) (for scroll-driven cube rotation)
-   **Content:** Extracted from the original `index.html` of yoannmoi.net.

### Current Status (as of last AI commit)

-   Foundational 3D cube interface is in place.
-   Content is mapped to the 6 faces of the cube.
-   Scroll-driven rotation of the cube on its X-axis is implemented.
-   Basic CSS styling for cube faces and scene background.
-   A local development server (`http-server`) is set up.

### Known Issues / Incomplete Features (at time of this README creation)

-   Detailed typography and custom scrollbar styles for cube faces were attempted but not successfully applied due to tooling issues (`src/style.css`).
-   Advanced text orientation (ensuring text is always perfectly upright on the *active* face) and hiding/dimming of non-active cube faces were attempted but not successfully applied due to tooling issues with `src/app.js`. The current version in the branch `feat/3d-cube-interface-partial` reflects this state.
