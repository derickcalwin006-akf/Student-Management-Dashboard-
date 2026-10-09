# Student Management System 🎓

A complete, modern, fully functional **College Student Management System** web application built with HTML5, CSS3, JavaScript, and LocalStorage for reliable data persistence.

---

## 📌 Project Overview

The **Student Management System** is a responsive web application designed for college administrators to oversee student registrations, demographic metrics, department distributions, and student records with zero backend dependencies.

### 🌟 Key Features

1. **🔐 Authentication & Access Control**:
   - Secure login portal for college administrators.
   - Show/Hide password toggle.
   - One-click **Auto-fill Demo Credentials** button for easy testing.
   - Session guard on all management pages with redirect to login.
   - Demo credentials:
     - **Username**: `admin`
     - **Password**: `admin123`

2. **📊 Admin Dashboard**:
   - Welcome banner with live academic session badges.
   - Real-time stat cards: **Total Students**, **Male Students** (with % breakdown), **Female Students** (with % breakdown), and **Active Departments**.
   - Interactive charts via **Chart.js**:
     - Department Distribution Bar Chart.
     - Gender Demographics Doughnut Chart.
   - **Recently Added Students** table with instant "View" profile preview.
   - Quick export to CSV functionality.

3. **👨‍🎓 Student Management (Directory)**:
   - Clean, modern, responsive data table displaying:
     - ID, Full Name (with stylized initials avatar), Gender badge, Date of Birth, Department badge, Email, Phone, Address, and Action buttons.
   - **Instant Real-Time Search**: Filters records on-the-fly across Name, ID, Department, Email, and Phone number.
   - **Multi-Filter Controls**:
     - Filter by Department (Computer Science, Data Science, IT, Computer Applications, etc.).
     - Filter by Gender (Male, Female).
     - Sort by ID, Name (A–Z / Z–A), or Age / DOB.
   - Instant count indicator (`Showing X of Y students`).
   - Friendly empty state with one-click "Reset Filters" when no records match.

4. **➕ Add Student**:
   - Dedicated admission registration form.
   - Auto-generated next student ID (e.g., `STU-2024-006`) with option to auto-regenerate.
   - Form validation:
     - Full Name validation (min 2 characters).
     - Gender radio selection.
     - Date of Birth validator with age limit checks.
     - Department selector.
     - Valid RFC email format check.
     - 10-digit mobile number validator.
     - Residential address verification.
   - Instant LocalStorage sync and redirect to student list.

5. **✏️ Edit Student**:
   - Interactive modal popup.
   - Pre-fills student data automatically.
   - Inline field validation.
   - Instant updates to LocalStorage, table, and dashboard statistics.

6. **👁️ View Student (Profile Card)**:
   - Professional ID card modal with student avatar, ID badge, department badge, DOB, calculated age, contact info, and residential address.
   - Direct shortcut to edit student.

7. **🗑️ Delete Student**:
   - Confirmation modal with student name and ID to prevent accidental deletions.
   - Smoothly removes record from LocalStorage and updates all metrics.

8. **🔔 Toast Notification System**:
   - Animated notification alerts:
     - *"Login successful!"*
     - *"Invalid username or password."*
     - *"Student added successfully!"*
     - *"Student updated successfully!"*
     - *"Student deleted successfully!"*
     - *"Student records exported to CSV!"*

---

## 📁 File Structure

```text
student-management-system/
│
├── index.html            # Administrator Login Page
├── dashboard.html        # Admin Dashboard with metrics & charts
├── students.html         # Students Directory with search, filters, modals
├── add-student.html      # New Student Registration Form
├── css/
│   └── style.css         # Modern academic CSS design system
│
├── js/
│   ├── app.js            # Core data store, auth guard, toast & modal engine
│   ├── login.js          # Login validation and session handling
│   ├── dashboard.js      # Dashboard metrics & Chart.js rendering
│   └── students.js       # Table controls, instant search, edit, view, delete
│
└── README.md             # Documentation and quickstart guide
```

---

## 🚀 How to Run and Test

1. **Option A: Direct Browser Opening**:
   - Double-click or open `student-management-system/index.html` in any modern web browser (Chrome, Edge, Firefox, Safari).

2. **Option B: Local Development Server**:
   - Run a static file server using Node.js:
     ```bash
     npx serve student-management-system
     ```
   - Open the provided URL (e.g. `http://localhost:3000`) in your browser.

3. **Login Details**:
   - Click the **Auto-fill** button on the login screen or manually type:
     - **Username:** `admin`
     - **Password:** `admin123`
   - Click **Login to Dashboard**.

---

## 💾 Pre-loaded Sample Students

The application comes pre-populated with initial student records:
1. **Arun Kumar** – Male – Computer Science (Chennai)
2. **Priya Sharma** – Female – Data Science (Bangalore)
3. **Rahul Kumar** – Male – Information Technology (Hyderabad)
4. **Divya Sri** – Female – Data Science (Coimbatore)
5. **Karthik Raj** – Male – Computer Applications (Madurai)

All changes (additions, edits, deletions) persist in your browser's **LocalStorage**.
