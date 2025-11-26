# Wanderlust - Premium Itinerary Planner

A beautiful, modern web application for planning and managing your travel itineraries with Firebase authentication and cloud sync.

## Features

- 🔐 **User Authentication** - Google Sign-In and Email/Password authentication
- ☁️ **Cloud Sync** - Real-time synchronization with Firebase Firestore
- 💾 **Local Mode** - Works offline with localStorage fallback
- 📅 **Itinerary Management** - Create, edit, and organize trip activities
- 📍 **Location Integration** - Direct links to Google Maps
- 📄 **Export Options** - Export to PDF or Excel
- 🎨 **Premium Design** - Modern, responsive UI with Tailwind CSS

## Project Structure

```
itinerary-planner/
├── index.html             # Clean HTML structure
├── css/
│   └── styles.css         # Custom styles and Tailwind config
├── js/
│   ├── app.js             # Main application initialization
│   ├── config.js          # Firebase configuration
│   ├── utils.js           # Utility functions
│   ├── stores/
│   │   ├── DataStore.js   # Base store class
│   │   ├── LocalStore.js  # localStorage implementation
│   │   └── FirebaseStore.js # Firebase/Firestore implementation
│   ├── ui/
│   │   ├── views.js       # View management
│   │   ├── navbar.js      # Navbar updates
│   │   └── renderers.js   # UI rendering functions
│   └── handlers/
│       ├── auth.js        # Authentication handlers
│       ├── holidays.js    # Holiday CRUD operations
│       ├── items.js       # Itinerary item operations
│       └── export.js      # PDF/Excel export functions
└── README.md              # This file
```

## Getting Started

### Prerequisites

- A modern web browser
- A local web server (required for ES6 modules)

### How to Run?

You can access the application through one of the following methods:

**Option 1: Visit the Hosted Version**
Open your browser and go to: `https://jonekaa.github.io/itinerary-planner/`

**Option 2: Run Locally using VS Code Live Server**
1. Install the "Live Server" extension in VS Code.
2. Open the `itinerary-planner` folder in VS Code.
3. Right-click on `index.html` and select "Open with Live Server" or click "Go Live" in the VS Code status bar.

### Firebase Setup for **Your Own Project**

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project or select existing
3. Enable Authentication (Google & Email/Password)
4. Enable Firestore Database
5. Add your domain to authorized domains in Authentication settings
6. Copy your Firebase config to `js/config.js`

## Usage

### Authentication

- **Google Sign-In**: Click "Sign in with Google" button
- **Email/Password**: Enter credentials and click "Login" or "Register"

### Managing Trips

1. **Create a Trip**: Enter destination name and click "New Trip"
2. **View Trip**: Click on a trip card to view details
3. **Delete Trip**: Click the "Delete" button on a trip card

### Managing Activities

1. **Add Activity**: Click "Add Activity" in trip detail view
2. **Fill Details**: Enter date, time, activity name, location, and notes
3. **Delete Activity**: Click the trash icon on an activity

### Exporting

- **PDF**: Click "PDF" button to download formatted itinerary
- **Excel**: Click "Excel" button to download spreadsheet

## Architecture

### Data Layer

- **DataStore**: Abstract base class defining the data interface
- **LocalStore**: localStorage implementation for offline use
- **FirebaseStore**: Cloud-synced implementation with Firestore

### UI Layer

- **Views**: Manages switching between login, list, and detail views
- **Renderers**: Handles rendering of holidays and itinerary items
- **Navbar**: Updates user profile display

### Handler Layer

- **Auth**: Login, logout, and registration handlers
- **Holidays**: CRUD operations for trips
- **Items**: CRUD operations for itinerary items
- **Export**: PDF and Excel generation

## Technologies

- **Frontend**: HTML5, Tailwind CSS, Vanilla JavaScript (ES6+)
- **Icons**: Phosphor Icons
- **Backend**: Firebase Authentication & Firestore
- **Libraries**: 
  - jsPDF (PDF generation)
  - SheetJS (Excel export)
  - Day.js (Date formatting)

## License

This project is open source and available under the MIT License.
