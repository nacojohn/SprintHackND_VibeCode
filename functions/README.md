# Firebase Cloud Functions for OSDR AI Agent

This directory contains the backend cloud functions for the application.

## Setup

1.  **Install Dependencies**: Navigate to this `functions` directory and run `npm install`.

2.  **Set Environment Variables**: The Gemini API key must be set as a Firebase Function configuration variable. This is a secure way to store secrets.

    Run the following command from the root of your project, replacing `your-api-key` with your actual Gemini API key:

    ```bash
    firebase functions:config:set gemini.key="your-api-key"
    ```

    You only need to do this once per project.

## Deployment

To deploy only the functions, run this command from the root of the project:

```bash
firebase deploy --only functions
```
