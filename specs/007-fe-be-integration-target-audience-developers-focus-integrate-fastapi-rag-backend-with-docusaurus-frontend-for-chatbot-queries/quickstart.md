# Quickstart Guide: Frontend-Backend Integration

**Feature**: Frontend-Backend Integration
**Created**: 2025-12-24
**Branch**: `007-fe-be-integration-target-audience-developers-focus-integrate-fastapi-rag-backend-with-docusaurus-frontend-for-chatbot-queries`
**Related Spec**: [specs/007-fe-be-integration-target-audience-developers-focus-integrate-fastapi-rag-backend-with-docusaurus-frontend-for-chatbot-queries/spec.md](specs/007-fe-be-integration-target-audience-developers-focus-integrate-fastapi-rag-backend-with-docusaurus-frontend-for-chatbot-queries/spec.md)

## Overview

This guide provides step-by-step instructions for setting up, configuring, and using the Docusaurus-FastAPI integration that embeds a RAG-powered chatbot directly in documentation pages. The integration enables users to ask questions about the documentation content and receive accurate answers based on the indexed materials.

## Prerequisites

Before starting, ensure you have:

- **Node.js 18+** installed for Docusaurus development
- **npm or yarn** package manager
- **Python 3.9+** installed for backend development
- **Git** for version control
- **Access to the existing FastAPI RAG backend** (from feature 006)
- **API key for the RAG backend** (if authentication is enabled)

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd <repository-directory>
```

### 2. Set up Docusaurus Frontend

```bash
cd frontend
npm install
```

### 3. Configure Backend Connection

Create a `.env` file in the frontend directory with the following variables:

```env
# API Configuration
REACT_APP_API_BASE_URL=http://localhost:8000
REACT_APP_API_KEY=your_api_key_here

# Frontend Configuration
REACT_APP_CHATBOT_ENABLED=true
REACT_APP_MAX_HISTORY_LENGTH=50
REACT_APP_AUTO_SCROLL=true
```

## Configuration

### 1. Backend Configuration

Ensure your FastAPI RAG backend is running and properly configured with:

- CORS enabled for your frontend domain
- API endpoints available at `/api/v1/rag/query`
- Proper authentication if required

### 2. Docusaurus Integration

Update your `docusaurus.config.js` to include the chatbot component:

```javascript
module.exports = {
  // ... existing configuration
  plugins: [
    // ... existing plugins
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'docs',
        path: 'docs',
        // Enable chatbot integration
        remarkPlugins: [require('./src/plugins/chatbot-remark-plugin')],
      },
    ],
  ],
  themes: [
    // ... existing themes
  ],
};
```

### 3. Component Integration

Add the chatbot component to your desired pages or layouts in Docusaurus:

```jsx
// In your layout or page component
import Chatbot from './src/components/Chatbot/Chatbot';

function Layout({children}) {
  return (
    <div>
      <main>{children}</main>
      <Chatbot />
    </div>
  );
}
```

## Setup Process

### 1. Start the Backend Service

```bash
cd backend
python main.py api
```

Or using uvicorn directly:
```bash
cd backend
uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Start the Docusaurus Frontend

```bash
cd frontend
npm start
```

The documentation site will be available at `http://localhost:3000`.

### 3. Verify Integration

Check if the chatbot is properly integrated:

1. Navigate to any documentation page
2. Verify the chatbot component is visible
3. Test the connection by sending a simple query
4. Check browser console for any errors

## Usage Examples

### 1. Basic Chat Interaction

The chatbot should be embedded in documentation pages. Users can:

1. Type questions in the chat input field
2. Receive responses based on the documentation content
3. View source citations for the answers
4. Continue conversations with follow-up questions

### 2. API Client Usage

For direct API interaction:

```javascript
import { apiClient } from './src/components/ApiClient/apiClient';

// Submit a query to the RAG backend
const response = await apiClient.queryRag({
  query: "What are the key principles of humanoid robotics?",
  max_chunks: 5,
  temperature: 0.1,
  include_sources: true
});

console.log(response.data.answer);
console.log(response.data.sources);
```

### 3. Component Customization

Customize the chatbot component appearance:

```jsx
<Chatbot
  maxHistoryLength={30}
  showSources={true}
  inputPlaceholder="Ask a question about this documentation..."
  title="Documentation Assistant"
  theme="light"
/>
```

## API Endpoints

### 1. Query Endpoint
- **URL**: `POST /api/v1/rag/query`
- **Description**: Submit a question to the RAG agent
- **Request Body**: API Request model
- **Response**: API Response model

### 2. Health Check
- **URL**: `GET /health`
- **Description**: Check backend service health status

### 3. Configuration
- **URL**: `GET /config`
- **Description**: Get backend configuration parameters

## Development Workflow

### 1. Frontend Development

For frontend development with hot reloading:

```bash
cd frontend
npm start
```

### 2. Component Testing

Run the component test suite:

```bash
cd frontend
npm test
```

### 3. Integration Testing

Test the frontend-backend integration:

```bash
cd frontend
npm run integration-test
```

## Troubleshooting

### 1. Common Issues

**Q: Chatbot component not appearing**
- A: Check that the component is properly imported and included in your layout
- Verify that `REACT_APP_CHATBOT_ENABLED` is set to `true`

**Q: API requests failing with CORS error**
- A: Ensure the backend has CORS enabled for your frontend domain
- Check that the API URL in environment variables is correct

**Q: No responses from backend**
- A: Verify the backend service is running and accessible
- Check API key configuration if authentication is required

**Q: Slow response times**
- A: Check network connectivity to the backend
- Verify the RAG pipeline is properly configured

### 2. Debugging

Enable debug logging by setting:

```env
REACT_APP_DEBUG=true
```

Check browser developer tools for:
- Network tab to verify API requests
- Console for JavaScript errors
- Elements tab to inspect component structure

### 3. Backend Health Check

Verify backend status:

```bash
curl http://localhost:8000/health
```

## Performance Tips

### 1. Frontend Optimization
- Use lazy loading for the chatbot component
- Implement virtual scrolling for long conversation histories
- Optimize bundle size by code splitting

### 2. API Optimization
- Implement request caching for common queries
- Use appropriate timeout values
- Monitor and optimize response times

## Next Steps

1. **Customize Appearance**: Adjust the chatbot styling to match your documentation theme
2. **Add Analytics**: Implement tracking for user interactions and satisfaction
3. **Enhance Features**: Add features like message export, conversation sharing
4. **Scale Deployment**: Consider deployment options for production workloads
5. **Monitor Usage**: Set up logging and monitoring for production use

## Support

For support, please check:
- API documentation at the backend `/docs` endpoint
- Frontend component documentation in the `src/components/Chatbot/` directory
- Configuration files in the `frontend/` directory