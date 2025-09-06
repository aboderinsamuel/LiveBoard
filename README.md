# Collaborative Whiteboard App

A real-time collaborative whiteboard application built with Next.js, TypeScript, and WebSockets. Multiple users can draw, collaborate, and create together in real-time with live cursor tracking and conflict resolution.

## Features

### Core Functionality
- **Real-time Collaboration**: Multiple users can draw simultaneously with live updates
- **Drawing Tools**: Pen, eraser, and highlighter with customizable colors and stroke widths
- **Live Cursor Tracking**: See where other users are drawing in real-time
- **Conflict Resolution**: Advanced operational transformation for handling simultaneous edits
- **Persistent State**: Serverless API routes for saving and loading whiteboard states

### Technical Features
- **TypeScript**: Full type safety throughout the application
- **WebSocket Communication**: Real-time bidirectional communication
- **Canvas API**: High-performance drawing with HTML5 Canvas
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Error Handling**: Comprehensive error boundaries and recovery mechanisms
- **Performance Optimization**: Debounced events, action batching, and memory management
- **Testing**: Unit tests with Jest and React Testing Library

### User Experience
- **Intuitive Interface**: Clean, modern UI with Tailwind CSS
- **Collaborator Management**: See who's online and their activity
- **Tool Customization**: Adjustable colors, stroke widths, and opacity
- **Keyboard Shortcuts**: Quick access to common actions
- **Offline Support**: Graceful handling of connection issues

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Real-time**: Socket.IO
- **Canvas**: HTML5 Canvas API
- **State Management**: Custom hooks with Zustand
- **Testing**: Jest, React Testing Library
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd collaborative-whiteboard
```

2. Install dependencies:
```bash
npm install
```

3. Run the development servers:
```bash
# Start both Next.js app and WebSocket server
npm run dev:full

# Or start them separately:
# Terminal 1: npm run dev (Next.js on port 3000)
# Terminal 2: npm run server (WebSocket on port 3002)
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Quick Start

1. **Create a New Whiteboard**: Click "Create New Whiteboard" on the home page
2. **Start Drawing**: Use the tools panel on the left to select pen, eraser, or highlighter
3. **Customize**: Change colors, stroke width, and opacity
4. **Share & Collaborate**: 
   - Click the share button in the header to get an invite link
   - Copy the link and share it with others
   - Both users can now draw and see each other's changes in real-time
5. **Live Collaboration**: See other users' cursors and drawings in real-time

### Real-time Collaboration Features

- **Invite Links**: Generate shareable links for easy collaboration
- **Live Cursors**: See where other users are drawing
- **Real-time Sync**: All drawings sync instantly between users
- **Conflict Resolution**: Handles simultaneous edits gracefully
- **User Management**: See who's online and active

### Environment Variables

Create a `.env.local` file with the following variables:

```env
NEXT_PUBLIC_WS_URL=http://localhost:3001
NODE_ENV=development
```

## Project Structure

```
src/
├── components/          # React components
│   ├── WhiteboardCanvas.tsx
│   ├── ToolPanel.tsx
│   ├── CollaboratorList.tsx
│   ├── WhiteboardApp.tsx
│   └── ErrorBoundary.tsx
├── hooks/              # Custom React hooks
│   ├── useWhiteboard.ts
│   └── useCollaboration.ts
├── lib/                # Utility libraries
│   ├── websocket.ts
│   ├── collaboration.ts
│   ├── errorHandler.ts
│   ├── performance.ts
│   └── utils.ts
├── pages/              # Next.js pages and API routes
│   ├── api/
│   │   ├── socket.ts
│   │   ├── whiteboards/
│   │   └── errors.ts
│   ├── _app.tsx
│   ├── _document.tsx
│   └── index.tsx
├── types/              # TypeScript type definitions
│   └── whiteboard.ts
├── styles/             # Global styles
│   └── globals.css
└── __tests__/          # Test files
    ├── components/
    ├── utils.test.ts
    └── collaboration.test.ts
```

## API Endpoints

### WebSocket API
- **Connection**: `/api/socket`
- **Events**: `join`, `leave`, `action`, `cursor_move`, `user_join`, `user_leave`

### REST API
- `GET /api/whiteboards` - List whiteboards
- `POST /api/whiteboards` - Create whiteboard
- `GET /api/whiteboards/[id]` - Get whiteboard
- `PUT /api/whiteboards/[id]` - Update whiteboard
- `DELETE /api/whiteboards/[id]` - Delete whiteboard
- `GET /api/whiteboards/[id]/actions` - Get actions
- `POST /api/whiteboards/[id]/actions` - Add action
- `POST /api/errors` - Report errors

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run type-check` - Run TypeScript type checking

### Code Quality

The project includes:
- **ESLint**: Code linting with Next.js configuration
- **Prettier**: Code formatting (configured via ESLint)
- **TypeScript**: Strict type checking
- **Jest**: Unit testing with 70% coverage threshold
- **Error Boundaries**: React error handling

### Testing

Run the test suite:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically

### Manual Deployment

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## Performance Considerations

- **Action Batching**: Drawing actions are batched to reduce WebSocket traffic
- **Canvas Optimization**: Path simplification for large drawings
- **Memory Management**: Automatic cleanup of old actions
- **Debounced Events**: Mouse/touch events are debounced for better performance
- **Virtual Scrolling**: For large collaborator lists
- **Image Compression**: Automatic image optimization

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Real-time communication with [Socket.IO](https://socket.io/)
- Styling with [Tailwind CSS](https://tailwindcss.com/)
- Canvas drawing with HTML5 Canvas API
- Icons from [Heroicons](https://heroicons.com/)

## Support

For support, email support@whiteboard-app.com or create an issue in the repository.
