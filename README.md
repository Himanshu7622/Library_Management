# Library Management System

A modern desktop library management application built with Electron, React, and SQLite that operates entirely offline. This application provides comprehensive book, member, and transaction management with a clean, intuitive interface.

## 🚀 Features

### Core Functionality
- **Book Management**: Complete CRUD operations for books with metadata, genres, cover images, and availability tracking
- **Member Management**: Member registration with types (Student/Faculty/Public), contact information, and loan history
- **Transaction System**: Lending and return workflows with automatic due date calculation and fine management
- **Search & Filtering**: Global search across titles, authors, ISBN, and tags with advanced filtering options
- **Dashboard**: Real-time statistics, recent activity, and overdue book monitoring

### Advanced Features
- **CSV Import/Export**: Bulk import books and members from CSV files with validation
- **Database Backup**: Full SQLite database backups with restore functionality
- **Cover Image Management**: Upload and manage book cover images with automatic resizing
- **Local Authentication**: Optional PIN-based authentication system with session management
- **Offline Operation**: Completely offline functionality with local data storage
- **Responsive Design**: Modern UI that works on desktop and tablet screens

### Technical Features
- **SQLite Database**: Local file-based database with migrations and data integrity
- **TypeScript**: Full TypeScript support for type safety and better development experience
- **Tailwind CSS**: Modern utility-first CSS framework for styling
- **Secure Architecture**: Proper Electron security with context isolation and secure IPC communication

## 📦 Installation

### Prerequisites
- Node.js 18+ (Node.js 20 LTS recommended for Windows)
- npm or yarn package manager
- Build tools for native compilation:
  - Linux: `build-essential` and `python3`
  - macOS: Xcode Command Line Tools
  - Windows: Visual Studio 2022 with C++ development tools OR Visual Studio Build Tools 2022

### Steps
1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Library_Management
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run in development mode**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## 🛠️ Development

### Available Scripts
- `npm run dev` - Start development server with hot reload
- `npm run dev:renderer` - Start only the renderer development server
- `npm run dev:main` - Start only Electron main process
- `npm run build` - Build for production
- `npm run build:renderer` - Build only the renderer
- `npm run build:main` - Build and package the application
- `npm run test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm run type-check` - Run TypeScript type checking

### Project Structure
```
Library_Management/
├── src/
│   ├── main/                    # Electron main process
│   │   ├── database/           # Database operations and migrations
│   │   ├── services/           # Business logic services
│   │   └── ipc-handlers.js     # IPC communication
│   ├── renderer/               # React frontend
│   │   ├── components/         # Reusable React components
│   │   ├── pages/             # Page components
│   │   ├── contexts/          # React Context providers
│   │   ├── hooks/             # Custom React hooks
│   │   └── utils/             # Utility functions
│   └── shared/                # Shared types and constants
├── database/
│   ├── migrations/            # SQL migration files
│   └── seeds/                # Seed data
├── assets/                    # Static assets (covers, images)
├── tests/                     # Unit and integration tests
├── public/                    # Electron main files
└── build/                     # Build configuration
```

## 📊 Database Schema

### Books Table
- **title**: Book title (required)
- **authors**: JSON array of author names
- **isbn**: ISBN-13 (unique, optional)
- **publisher**: Publisher name
- **publication_year**: Publication year
- **genres**: JSON array of genres
- **language**: Language code (ISO 639-1)
- **total_copies**: Total number of copies
- **available_copies**: Available copies for lending
- **location**: Shelf location code
- **tags**: JSON array of tags
- **description**: Book description
- **cover_image_path**: Path to cover image
- **status**: available/loaned/reserved

### Members Table
- **name**: Member name (required)
- **member_id**: Unique member identifier
- **email**: Email address (unique)
- **phone**: Phone number
- **address**: Physical address
- **member_type**: student/faculty/public
- **notes**: Additional notes

### Transactions Table
- **book_id**: Reference to books table
- **member_id**: Reference to members table
- **transaction_type**: lend/return
- **transaction_date**: When the transaction occurred
- **due_date**: When the book should be returned
- **return_date**: When the book was actually returned
- **fine_amount**: Calculated fine for overdue books
- **fine_paid**: Whether the fine has been paid
- **notes**: Transaction notes

## 🔐 Authentication

The application includes an optional local authentication system:

- **PIN-based Login**: Simple 4-8 digit PIN authentication
- **Session Management**: Automatic session timeout after inactivity
- **Failed Attempt Lockout**: Temporary lockout after multiple failed attempts
- **PIN Change**: Secure PIN change functionality
- **Configurable Settings**: Adjustable session timeout and lockout duration

## 🎨 UI/UX Features

### Design System
- **Modern Interface**: Clean, card-based layout with subtle shadows
- **Responsive Design**: Works on desktop and tablet screens
- **Dark Mode**: Automatic dark mode support with system preference detection
- **Accessibility**: Full keyboard navigation and screen reader support
- **Consistent Components**: Reusable component library with consistent styling

### User Experience
- **Intuitive Navigation**: Sidebar navigation with active state indicators
- **Search Functionality**: Global search with real-time filtering
- **Status Indicators**: Visual status badges for books and transactions
- **Loading States**: Proper loading indicators for async operations
- **Error Handling**: User-friendly error messages and recovery options

## 💾 Data Management

### CSV Import/Export
- **Books Import**: Bulk import from CSV with validation
- **Members Import**: Import member data from CSV files
- **Data Export**: Export books, members, and transactions to CSV
- **Error Reporting**: Detailed import error reporting with validation feedback

### Backup and Recovery
- **Database Backup**: Complete SQLite database backups
- **Cover Images**: Optional inclusion of cover images in backups
- **Scheduled Backups**: Configurable automatic backup schedules
- **Restore Functionality**: Easy database restore from backup files

## 🧪 Testing

### Unit Tests
- **Database Layer**: Test CRUD operations and data validation
- **Business Logic**: Test fine calculations and transaction workflows
- **Utility Functions**: Test helper functions and data processing

### Integration Tests
- **IPC Communication**: Test main-renderer communication
- **File Operations**: Test import/export and backup functionality
- **Authentication**: Test login/logout flows and security

### Manual Testing
- **End-to-End Workflows**: Complete book lending cycles
- **Data Integrity**: Verify data consistency and relationships
- **Performance**: Test with large datasets
- **Cross-Platform**: Verify functionality on Windows, macOS, and Linux

## 📱 Usage Guide

### Initial Setup
1. **Start the Application**: Launch the app and complete the initial authentication setup
2. **Import Data**: Use CSV import to add existing books and members, or create manually
3. **Configure Settings**: Set up fine rules, lending periods, and other preferences

### Daily Operations
1. **Lending Books**: Select a book and member, the system calculates due dates automatically
2. **Returning Books**: Mark books as returned, fines are calculated automatically for overdue items
3. **Monitoring**: Check the dashboard for overdue books and system statistics
4. **Data Management**: Regular backups and data exports for record-keeping

## 🔧 Configuration

### Fine Rules
Configure different fine rates and grace periods for member types:
- **Students**: Standard library patron rules
- **Faculty**: Extended lending periods with reduced fines
- **Public**: Shorter periods with higher fines

### Lending Periods
Set different lending periods based on member type:
- **Students**: 14 days (default)
- **Faculty**: 30 days (default)
- **Public**: 7 days (default)

### UI Preferences
- **Theme**: Light/Dark/System
- **Font Size**: Small/Medium/Large
- **Date Format**: Multiple format options
- **Items Per Page**: Configure list pagination

## 🚀 Building and Distribution

### Electron Builder Configuration
The application is configured to build for multiple platforms:
- **Windows**: NSIS installer with desktop shortcut
- **macOS**: DMG image with proper code signing
- **Linux**: AppImage for universal Linux distribution

### Build Process
1. **Renderer Build**: Vite builds the React frontend
2. **Main Process**: Electron bundles the Node.js backend
3. **Packaging**: Electron Builder creates platform-specific installers
4. **Code Signing**: Optional code signing for distribution

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines
- **Code Style**: Follow ESLint configuration and use Prettier
- **Type Safety**: Use TypeScript for all new code
- **Testing**: Write tests for new features and bug fixes
- **Documentation**: Update README and code comments
- **Security**: Follow Electron security best practices

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For issues, questions, or feature requests:
1. **Check the Wiki**: Comprehensive documentation and FAQs
2. **Search Issues**: Look for existing solutions
3. **Create Issue**: Provide detailed information about your issue
4. **Discussion**: Use GitHub Discussions for general questions

## 📈 Roadmap

### Upcoming Features
- **Barcode Scanning**: Integrated barcode scanner for quick book processing
- **Email Notifications**: Automatic email notifications for overdue books
- **Reporting System**: Advanced reporting with charts and analytics
- **Web Interface**: Optional web-based interface for remote access
- **Mobile App**: Companion mobile app for basic operations

### Technical Improvements
- **Performance**: Optimizations for large datasets
- **Security**: Enhanced security features and audit logging
- **Accessibility**: Improved accessibility features
- **Internationalization**: Multi-language support

## 🙏 Acknowledgments

- **Electron**: For enabling cross-platform desktop applications
- **React**: For the excellent UI library and ecosystem
- **SQLite**: For the reliable, lightweight database engine
- **Tailwind CSS**: For the utility-first CSS framework
- **Lucide Icons**: For the beautiful icon set
- **Vite**: For the fast development build tool

---

**Built with ❤️ for libraries and book lovers everywhere**