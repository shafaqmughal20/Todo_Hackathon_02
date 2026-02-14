# Phase II Todo App - Frontend

A modern, responsive task management application built with Next.js, TypeScript, and Tailwind CSS.

## Features

- 🔐 **Secure Authentication**: JWT-based authentication with Better Auth
- ✅ **Task Management**: Create, read, update, and delete tasks
- 🎯 **Completion Tracking**: Mark tasks as complete/incomplete with visual feedback
- 👥 **Multi-User Support**: User-specific task isolation
- 🎨 **Modern UI**: Clean, responsive design with Tailwind CSS
- 🌙 **Dark Mode**: Support for light and dark themes
- 📱 **Mobile-First**: Fully responsive design

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 3.x
- **Authentication**: Better Auth + JWT
- **HTTP Client**: Fetch API with custom wrapper

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm 9 or higher
- Backend API running on `http://localhost:8002`

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.local.example .env.local
```

3. Update `.env.local` with your configuration:
```env
NEXT_PUBLIC_API_URL=http://localhost:8002
BETTER_AUTH_SECRET=your-secret-key-min-32-characters-long
BETTER_AUTH_URL=http://localhost:3000
NODE_ENV=development
```

**Important**: The `BETTER_AUTH_SECRET` must match the backend configuration.

### Development

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

Build for production:
```bash
npm run build
```

Start production server:
```bash
npm start
```

## Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── dashboard/          # Protected dashboard page
│   │   ├── signin/             # Sign in page
│   │   ├── signup/             # Sign up page
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page
│   │   └── globals.css         # Global styles
│   ├── components/             # React components
│   │   ├── AuthGuard.tsx       # Route protection component
│   │   ├── TaskForm.tsx        # Task create/edit form
│   │   ├── TaskItem.tsx        # Individual task display
│   │   └── TaskList.tsx        # Task list container
│   ├── services/               # API service clients
│   │   ├── auth.ts             # Authentication service
│   │   └── tasks.ts            # Task management service
│   ├── lib/                    # Utility libraries
│   │   ├── api.ts              # HTTP client wrapper
│   │   └── auth.ts             # Auth configuration
│   └── types/                  # TypeScript type definitions
│       ├── user.ts             # User types
│       └── task.ts             # Task types
├── public/                     # Static assets
├── middleware.ts               # Next.js middleware for route protection
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── postcss.config.js           # PostCSS configuration
└── next.config.js              # Next.js configuration
```

## Features in Detail

### Authentication

- **Sign Up**: Create a new account with email and password
- **Sign In**: Authenticate with existing credentials
- **Session Management**: JWT tokens stored in localStorage
- **Route Protection**: AuthGuard component and middleware protect dashboard routes
- **Sign Out**: Clear session and redirect to home

### Task Management

- **Create Task**: Add new tasks with title and optional description
- **View Tasks**: See all your tasks organized by completion status
- **Edit Task**: Update task title and description
- **Delete Task**: Remove tasks with confirmation
- **Toggle Completion**: Mark tasks as complete/incomplete with visual feedback

### User Experience

- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Loading States**: Visual feedback during API operations
- **Error Handling**: User-friendly error messages
- **Form Validation**: Client-side validation for all inputs
- **Accessibility**: Semantic HTML and ARIA labels

## API Integration

The frontend communicates with the backend API using the following endpoints:

- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/signin` - Authenticate user
- `GET /api/{user_id}/tasks` - List all tasks
- `POST /api/{user_id}/tasks` - Create new task
- `GET /api/{user_id}/tasks/{id}` - Get specific task
- `PUT /api/{user_id}/tasks/{id}` - Update task
- `DELETE /api/{user_id}/tasks/{id}` - Delete task
- `PATCH /api/{user_id}/tasks/{id}/complete` - Toggle completion

All protected endpoints require JWT token in Authorization header.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:8002` |
| `BETTER_AUTH_SECRET` | JWT secret (must match backend) | Required |
| `BETTER_AUTH_URL` | Frontend URL | `http://localhost:3000` |
| `NODE_ENV` | Environment mode | `development` |

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Security Considerations

- JWT tokens stored in localStorage (consider httpOnly cookies for production)
- All API requests include Authorization header
- User ID validation on backend prevents unauthorized access
- Input validation on both client and server
- CORS configured on backend

## Browser Support

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)

## Troubleshooting

### Cannot connect to backend

- Verify backend is running on `http://localhost:8002`
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Ensure CORS is configured on backend

### Authentication not working

- Verify `BETTER_AUTH_SECRET` matches backend
- Check browser console for errors
- Clear localStorage and try again

### Tasks not loading

- Verify you're signed in
- Check network tab for API errors
- Ensure JWT token is valid

## Contributing

This is a Phase II hackathon project. All code is generated by Claude Code following the specification and plan documents.

## License

This project is part of the Todo Hackathon Phase II.
