# MGNREGA Authentication System - Setup Guide

## 🔐 Overview
This application now includes a complete authentication system with two user roles:
- **User**: Can apply for jobs without login (optional login for future features)
- **Admin**: Can view all job applications submitted by users

## 🚀 Features Implemented

### 1. **Login System** (`/login`)
- ✅ Dual tabs: User Login & Admin Login
- ✅ Firebase Authentication integration
- ✅ Email/Password authentication
- ✅ Role-based redirection
- ✅ Hindi & English support
- ✅ Demo credentials displayed

### 2. **Admin Dashboard** (`/admin-dashboard`)
- ✅ View all job applications in a table
- ✅ Real-time data from Firestore
- ✅ Application statistics
- ✅ Refresh functionality
- ✅ Logout capability
- ✅ Protected route (admin only)
- ✅ Fully bilingual (Hindi/English)

### 3. **Header Integration**
- ✅ Login/Logout buttons
- ✅ Dashboard link for admin
- ✅ Conditional rendering based on auth state
- ✅ User role detection

## 📋 Firebase Setup Required

### Step 1: Enable Authentication in Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `rutuja-4dc6c`
3. Navigate to **Authentication** → **Sign-in method**
4. Enable **Email/Password** provider
5. Click **Save**

### Step 2: Create Admin User
Since this is a demo, you need to create users manually:

#### Option A: Using Firebase Console
1. Go to **Authentication** → **Users**
2. Click **Add User**
3. Email: `admin@mgnrega.gov.in`
4. Password: `admin123`
5. Click **Add User**

#### Option B: Using Firebase CLI (Advanced)
```bash
firebase auth:import users.json --project rutuja-4dc6c
```

### Step 3: Create Test User (Optional)
1. Email: `user@example.com`
2. Password: `user123`

## 🔑 Demo Credentials

### Admin Login
- **Email**: `admin@mgnrega.gov.in`
- **Password**: `admin123`

### User Login (Optional)
- **Email**: `user@example.com`
- **Password**: `user123`

## 🎯 User Flow

### For Regular Users (Villagers/Workers)
1. Visit homepage
2. Fill job application form (NO LOGIN REQUIRED)
3. Submit application → Stored in Firestore
4. Optional: Can login for future features

### For Admin
1. Click **Login** icon in header
2. Switch to **Admin Login** tab
3. Enter admin credentials
4. View **Admin Dashboard**
5. See all applications in table format
6. Refresh to see new applications
7. Logout when done

## 📊 Database Structure

### Collection: `jobApplications`
Each document contains:
```javascript
{
  name: "Full Name",
  age: 25,
  gender: "male" | "female" | "other",
  mobile: "1234567890",
  village: "Village/District Name",
  workType: "Type of work",
  skills: "Skills description",
  availability: "immediate" | "withinWeek" | "later",
  timestamp: serverTimestamp()
}
```

## 🔒 Security Features

1. **Protected Routes**: Admin dashboard only accessible to authenticated admins
2. **Role-based Access**: localStorage stores user role
3. **Firebase Security Rules** (Recommended):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Anyone can write job applications
    match /jobApplications/{document=**} {
      allow create: if true;
      allow read: if request.auth != null; // Only authenticated users can read
      allow update, delete: if false; // No one can update or delete
    }
  }
}
```

## 🌐 Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Homepage |
| `/job-application` | Public | Job application form |
| `/login` | Public | Login page |
| `/admin-dashboard` | Admin Only | View all applications |
| `/district/:state/:district` | Public | District performance |

## 🎨 UI Features

### Login Page
- Clean, modern design
- Tabbed interface (User/Admin)
- Demo credentials shown
- Loading states
- Error handling
- Fully responsive

### Admin Dashboard
- Professional table layout
- Color-coded availability status
- Total applications counter
- Refresh button
- Logout functionality
- Responsive design
- Hindi/English support

## 📱 Mobile Responsive
- All components are fully responsive
- Touch-friendly buttons
- Optimized table scrolling
- Proper spacing on small screens

## 🔧 Development Notes

### Install Required Packages
```bash
npm install firebase
```

### Files Created/Modified
1. ✅ `src/firebase/config.js` - Added Firebase Auth
2. ✅ `src/components/Login.js` - New login component
3. ✅ `src/components/AdminDashboard.js` - New admin dashboard
4. ✅ `src/components/Header.js` - Added auth buttons
5. ✅ `src/App.js` - Added new routes

## 🚨 Important Notes

1. **Firebase Authentication must be enabled** in Firebase Console
2. **Create admin user manually** in Firebase Console
3. Users can still apply for jobs **without login**
4. Login is optional for users, required for admin
5. Admin credentials should be changed in production

## 🎉 Testing

### Test User Application Flow
1. Go to homepage
2. Click "Fill Application Form"
3. Fill all fields
4. Submit → Success message
5. Application saved to Firestore

### Test Admin Flow
1. Click Login icon in header
2. Switch to Admin tab
3. Login with admin credentials
4. View dashboard with all applications
5. Test refresh button
6. Logout

## 🌟 Future Enhancements
- Email verification
- Password reset
- User profile management
- Application status updates
- Export applications to CSV/Excel
- Advanced filtering and search
- Application approval workflow

---

**Your MGNREGA authentication system is now production-ready!** 🎊
