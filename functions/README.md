# Firebase Cloud Functions for OSDR AI Agent

This directory contains the backend cloud functions for the application.

## Setup

1.  **Install Dependencies**: Navigate to this `functions` directory and run `npm install`.

2.  **Set Gemini API Key**: This project requires your Gemini API key to be set in the Firebase environment configuration. From the root directory of the project, run the following command, replacing `YOUR_API_KEY` with your actual key:
    ```bash
    firebase functions:config:set gemini.key="YOUR_API_KEY"
    ```
    This only needs to be done once per project.

    **For Local Emulation**: If you are running the functions locally using the Firebase Emulator Suite, you'll need to fetch this configuration. Run the following command from the project root:
    ```bash
    firebase functions:config:get > functions/.runtimeconfig.json
    ```
    This creates a `functions/.runtimeconfig.json` file that the emulator will use to load the config. **Important**: Do not commit the `.runtimeconfig.json` file to version control.

## Deployment

To deploy only the functions, run this command from the root of the project:

```bash
firebase deploy --only functions
```
