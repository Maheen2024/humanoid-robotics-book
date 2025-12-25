# Quickstart Guide: ROS 2 for Physical AI Educational Module

**Feature**: 001-ros2-physical-ai
**Date**: 2025-12-18

## Getting Started

This guide will help you set up the Docusaurus documentation site for the ROS 2 educational module.

### Prerequisites

- Node.js v18 or higher
- npm or yarn package manager
- Git
- A code editor

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd <repository-name>
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**
   ```bash
   npm run start
   # or
   yarn start
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the documentation site.

### Adding New Content

1. **Create a new markdown file** in the `docs/module-1/` directory:
   ```bash
   # Example for a new chapter
   touch docs/module-1/new-chapter.md
   ```

2. **Add frontmatter** to your markdown file:
   ```markdown
   ---
   title: Chapter Title
   sidebar_position: 2
   description: Brief description of the chapter
   ---
   ```

3. **Update the sidebar** in `sidebars.js` to include your new content:
   ```javascript
   module.exports = {
     tutorialSidebar: [
       'intro',
       {
         type: 'category',
         label: 'Module 1: The Robotic Nervous System',
         items: [
           'module-1/intro-to-ros2',
           'module-1/ros2-communication',
           'module-1/urdf-modeling',
           'module-1/new-chapter', // Add your new chapter here
         ],
       },
     ],
   };
   ```

### Building for Production

To build the site for production:

```bash
npm run build
# or
yarn build
```

This will create a `build/` directory with the static files ready for deployment.

### Deployment

The site is configured for GitHub Pages deployment. After building, you can deploy using:

```bash
npm run deploy
# or
yarn deploy
```

Alternatively, you can set up GitHub Actions for automated deployment.

### Customization

1. **Site configuration** can be modified in `docusaurus.config.js`
2. **Sidebar navigation** can be updated in `sidebars.js`
3. **Styling** can be customized in `src/css/custom.css`
4. **Components** can be added in the `src/components/` directory

### Content Guidelines

When creating educational content:

- Use clear, instructional technical writing
- Include practical examples and hands-on exercises
- Follow the learning outcomes specified in the feature requirements
- Ensure content is appropriate for AI students and developers transitioning into Physical AI
- Use consistent formatting and structure

### Troubleshooting

- **Port already in use**: Use `npm run start -- --port 3001` to use a different port
- **Build errors**: Check for syntax errors in markdown files and configuration files
- **Missing navigation**: Ensure all pages are added to `sidebars.js`
- **Images not loading**: Place images in the `static/` directory and reference with `/img/image-name.jpg`

### Next Steps

1. Review the [feature specification](specs/001-ros2-physical-ai/spec.md) for detailed requirements
2. Check the [implementation plan](specs/001-ros2-physical-ai/plan.md) for technical details
3. Add the three required chapters to the documentation
4. Test the site locally before committing changes