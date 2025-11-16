# Firebase Cloud Functions for OSDR AI Agent

This directory contains the backend cloud functions for the application.

## Setup

1.  **Install Dependencies**: Navigate to this `functions` directory and run `npm install`.

2.  **Environment Variables**: This project requires the `API_KEY` environment variable to be set for the functions with your Gemini API key. For deployment, this should be configured as a secret. For local development, this can be set in an `.env` file within the `functions` directory.

## Deployment

To deploy only the functions, run this command from the root of the project:

```bash
firebase deploy --only functions
```