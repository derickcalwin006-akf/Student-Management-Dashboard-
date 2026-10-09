/**
 * Student Management System - Core Application Logic
 * Shared across all pages: Storage, Auth, Toasts, Modals, Shared Utilities
 */

// Storage Keys
const STORAGE_KEYS = {
  STUDENTS: 'SMS_STUDENTS_DATA',
  AUTH: 'SMS_AUTH_USER'
};

// Initial Sample Data (as specified in prompt)
const INITIAL_STUDENTS = [
  {
    id: 'STU-2024-001',
    name: 'Arun Kumar',
    gender: 'Male',
    dob: '2003-04-15',
    department: 'Computer Science',
    email: 'arun.kumar@college.edu',
    phone: '9876543210',
    address: '124 Park Avenue, Anna Nagar, Chennai',
    createdAt: '2024-01-10T10:00:00.000Z'
  },
  {
    id: 'STU-2024-002',
    name: 'Priya Sharma',
    gender: 'Female',
    dob: '2004-08-22',
    department: 'Data Science',
    email: 'priya.sharma@college.edu',
    phone: '9876543211',
    address: '45 Lake View Road, Indiranagar, Bangalore',
    createdAt: '2024-01-11T11:30:00.000Z'
  },
  {
    id: 'STU-2024-003',
    name: 'Rahul Kumar',
    gender: 'Male',
    dob: '2003-11-10',
    department: 'Information Technology',
    email: 'rahul.kumar@college.edu',
    phone: '9876543212',
    address: '78 Tech Park Colony, Hitech City, Hyderabad',
    createdAt: '2024-01-12T09:15:00.000Z'
  },
  {
    id: 'STU-2024-004',
    name: 'Divya Sri',
    gender: 'Female',
    dob: '2004-02-18',
    department: 'Data Science',
    email: 'divya.sri@college.edu',
    phone: '9876543213',
    address: '12 Green Hills, RS Puram, Coimbatore',
    createdAt: '2024-01-14T14:20:00.000Z'
  },
  {
    id: 'STU-2024-005',
    name: 'Karthik Raj',
    gender: 'Male',
    dob: '2003-07-05',
    department: 'Computer Applications',
    email: 'karthik.raj@college.edu',
    phone: '9876543214',
    address: '56 Sunrise Enclave, KK Nagar, Madurai',
    createdAt: '2024-01-15T16:45:00.000Z'
  }
];

// Standard Departments
const AVAILABLE_DEPARTMENTS = [
  'Computer Science',
  'Data Science',
  'Information Technology',
  'Computer Applications',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering'
];

/* ==========================================================================
   Data Persistence (LocalStorage)
   ========================================================================== */

/**
 * Initialize sample students if none exist in LocalStorage
 */
function initStudentsData() {
  const existing = localStorage.getItem(STORAGE_KEYS.STUDENTS);
  if (!existing) {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
    return [...INITIAL_STUDENTS];
  }
  try {
    const parsed = JSON.parse(existing);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
      return [...INITIAL_STUDENTS];
    }
    return parsed;
  } catch (e) {
    console.error('Failed to parse students from localStorage, resetting to initial sample data.', e);
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
    return [...INITIAL_STUDENTS];
  }
}

/**
 * Get all students
 */
function getStudents() {
  const data = localStorage.getItem(STORAGE_KEYS.STUDENTS);
  if (!data) return initStudentsData();
  try {
    return JSON.parse(data);
  } catch (e) {
    return initStudentsData();
  }
}

/**
 * Save students list to LocalStorage
 */
function saveStudents(students) {
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  // Dispatch custom event for cross-component sync
  window.dispatchEvent(new CustomEvent('studentsUpdated', { detail: { count: students.length } }));
}

/**
 * Find student by ID
 */
function getStudentById(id) {
  const students = getStudents();
  return students.find(s => s.id === id) || null;
}

/**
 * Generate next auto-increment student ID (e.g. STU-2024-006)
 */
function generateNextStudentId() {
  const students = getStudents();
  const year = new Date().getFullYear();
  let maxNum = 0;

  students.forEach(s => {
    if (s.id && typeof s.id === 'string') {
      const parts = s.id.split('-');
      if (parts.length >= 3) {
        const num = parseInt(parts[2], 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    }
  });

  const nextNum = maxNum + 1;
  const padded = String(nextNum).padStart(3, '0');
  return `STU-${year}-${padded}`;
}

/**
 * Add a new student
 */
function addStudent(studentData) {
  const students = getStudents();
  const newStudent = {
    ...studentData,
    id: studentData.id || generateNextStudentId(),
    createdAt: new Date().toISOString()
  };

  students.unshift(newStudent);
  saveStudents(students);
  return newStudent;
}

/**
 * Update an existing student
 */
function updateStudent(id, updatedData) {
  const students = getStudents();
  const index = students.findIndex(s => s.id === id);
  if (index === -1) return null;

  students[index] = {
    ...students[index],
    ...updatedData,
    updatedAt: new Date().toISOString()
  };

  saveStudents(students);
  return students[index];
}

/**
 * Delete a student by ID
 */
function deleteStudent(id) {
  const students = getStudents();
  const filtered = students.filter(s => s.id !== id);
  if (filtered.length !== students.length) {
    saveStudents(filtered);
    return true;
  }
  return false;
}

/**
 * Calculate dashboard metrics
 */
function getStatistics() {
  const students = getStudents();
  const total = students.length;
  let male = 0;
  let female = 0;
  let other = 0;

  const departmentMap = {};

  students.forEach(s => {
    const g = (s.gender || '').toLowerCase();
    if (g === 'male') male++;
    else if (g === 'female') female++;
    else other++;

    const dept = s.department || 'Other';
    departmentMap[dept] = (departmentMap[dept] || 0) + 1;
  });

  const departmentNames = Object.keys(departmentMap);

  return {
    total,
    male,
    female,
    other,
    malePercentage: total > 0 ? Math.round((male / total) * 100) : 0,
    femalePercentage: total > 0 ? Math.round((female / total) * 100) : 0,
    departmentsCount: departmentNames.length,
    departmentMap
  };
}

/* ==========================================================================
   Authentication & Session Handling
   ========================================================================== */

function getAuthUser() {
  const data = localStorage.getItem(STORAGE_KEYS.AUTH);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch (e) {
    return null;
  }
}

function loginUser(username, password) {
  if (username === 'admin' && password === 'admin123') {
    const userSession = {
      username: 'admin',
      fullName: 'System Administrator',
      role: 'Administrator',
      loggedInAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(userSession));
    return { success: true };
  }
  return { success: false, message: 'Invalid username or password.' };
}

function logoutUser() {
  localStorage.removeItem(STORAGE_KEYS.AUTH);
  window.location.href = 'index.html';
}

/**
 * Guard protected pages (Dashboard, Students, Add Student)
 */
function requireAuth() {
  const user = getAuthUser();
  if (!user) {
    window.location.href = 'index.html';
  }
}

/**
 * Redirect if already logged in on login page
 */
function redirectIfLoggedIn() {
  const user = getAuthUser();
  if (user) {
    window.location.href = 'dashboard.html';
  }
}

/* ==========================================================================
   Toast Notification System
   ========================================================================== */

function showToast(message, type = 'success', duration = 3500) {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  let iconClass = 'fa-solid fa-circle-check';
  let title = 'Success';
  if (type === 'error') {
    iconClass = 'fa-solid fa-circle-xmark';
    title = 'Error';
  } else if (type === 'warning') {
    iconClass = 'fa-solid fa-triangle-exclamation';
    title = 'Attention';
  } else if (type === 'info') {
    iconClass = 'fa-solid fa-circle-info';
    title = 'Notice';
  }

  toast.innerHTML = `
    <div class="toast-icon"><i class="${iconClass}"></i></div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${escapeHtml(message)}</div>
    </div>
    <button type="button" class="toast-close" aria-label="Close">&times;</button>
  `;

  container.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  const closeBtn = toast.querySelector('.toast-close');
  const removeToast = () => {
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentElement) toast.parentElement.removeChild(toast);
    }, 300);
  };

  closeBtn.addEventListener('click', removeToast);

  const timer = setTimeout(removeToast, duration);
  toast.addEventListener('mouseenter', () => clearTimeout(timer));
  toast.addEventListener('mouseleave', () => setTimeout(removeToast, 1500));
}

/* ==========================================================================
   Modal Helpers
   ========================================================================== */

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

/* ==========================================================================
   Utility Helpers
   ========================================================================== */

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (e) {
    return dateStr;
  }
}

function calculateAge(dobStr) {
  if (!dobStr) return 'N/A';
  const birthDate = new Date(dobStr);
  if (isNaN(birthDate.getTime())) return 'N/A';
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age > 0 ? `${age} yrs` : 'N/A';
}

function getInitials(name) {
  if (!name) return 'ST';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getDepartmentBadgeClass(dept) {
  const lower = (dept || '').toLowerCase();
  if (lower.includes('data')) return 'badge-dept-ds';
  if (lower.includes('information')) return 'badge-dept-it';
  if (lower.includes('computer applications') || lower.includes('applications')) return 'badge-dept-ca';
  if (lower.includes('computer')) return 'badge-dept-cs';
  return 'badge-dept';
}

function exportStudentsToCSV() {
  const students = getStudents();
  if (!students.length) {
    showToast('No students to export!', 'warning');
    return;
  }

  const headers = ['ID', 'Name', 'Gender', 'Date of Birth', 'Department', 'Email', 'Phone', 'Address'];
  const rows = students.map(s => [
    `"${s.id || ''}"`,
    `"${s.name || ''}"`,
    `"${s.gender || ''}"`,
    `"${s.dob || ''}"`,
    `"${s.department || ''}"`,
    `"${s.email || ''}"`,
    `"${s.phone || ''}"`,
    `"${(s.address || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `students_records_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('Student records exported to CSV!', 'success');
}

/* ==========================================================================
   Global Setup & Navigation UI Initializer
   ========================================================================== */

function setupGlobalNavigation() {
  // Mobile sidebar toggle
  const toggleBtn = document.getElementById('sidebarToggleBtn');
  const sidebar = document.getElementById('sidebar');
  let backdrop = document.querySelector('.sidebar-backdrop');

  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.className = 'sidebar-backdrop';
    document.body.appendChild(backdrop);
  }

  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('mobile-open');
      backdrop.classList.toggle('active');
    });

    backdrop.addEventListener('click', () => {
      sidebar.classList.remove('mobile-open');
      backdrop.classList.remove('active');
    });
  }

  // Logout triggers
  const logoutBtns = document.querySelectorAll('.action-logout');
  logoutBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (confirm('Are you sure you want to log out?')) {
        logoutUser();
      }
    });
  });

  // Modal backdrop click to close
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  });

  // Modal close buttons
  document.querySelectorAll('.modal-close-trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal-overlay');
      if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  });

  // Quick search in top navbar
  const globalSearchInput = document.getElementById('globalQuickSearch');
  if (globalSearchInput) {
    globalSearchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = encodeURIComponent(globalSearchInput.value.trim());
        window.location.href = `students.html?search=${val}`;
      }
    });
  }

  // Set active state in sidebar based on current pathname
  const currentPath = window.location.pathname;
  document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
    const href = item.getAttribute('href');
    if (href && currentPath.endsWith(href)) {
      item.classList.add('active');
    } else if (currentPath.endsWith('/') && href === 'dashboard.html') {
      // root or dashboard
    }
  });

  // Update total badge in sidebar if present
  const studentBadge = document.getElementById('sidebarStudentCount');
  if (studentBadge) {
    const students = getStudents();
    studentBadge.textContent = students.length;
  }
}

// Ensure data is ready when app.js loads
initStudentsData();

document.addEventListener('DOMContentLoaded', () => {
  setupGlobalNavigation();
});
