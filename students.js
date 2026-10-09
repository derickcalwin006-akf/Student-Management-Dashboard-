/**
 * Student Management System - Students Management Controller
 * Handles Table, Instant Search, Department/Gender Filter, Sort, View, Edit, Delete
 */

let allStudents = [];
let currentFilter = {
  search: '',
  department: 'all',
  gender: 'all',
  sort: 'id-asc'
};

let studentToDeleteId = null;

document.addEventListener('DOMContentLoaded', () => {
  // Ensure user is authenticated
  requireAuth();

  // Load students
  loadStudentsData();

  // Initialize UI controls & filters
  setupFiltersAndSearch();

  // Setup Edit Form Validation & Submission
  setupEditForm();

  // Setup Delete Confirmation
  setupDeleteModal();

  // Handle URL query parameters (e.g. ?focus=search or ?edit=STU-2024-001 or ?search=...)
  handleUrlParams();
});

/**
 * Load student records from storage
 */
function loadStudentsData() {
  allStudents = getStudents();
  renderStudentsTable();
  updateSidebarCount();
}

/**
 * Update student count in sidebar
 */
function updateSidebarCount() {
  const badge = document.getElementById('sidebarStudentCount');
  if (badge) badge.textContent = allStudents.length;
}

/**
 * Filter and sort students based on current filter state
 */
function getFilteredAndSortedStudents() {
  let list = [...allStudents];

  // 1. Search filter (Name, ID, Department, Email, Phone)
  const q = currentFilter.search.toLowerCase().trim();
  if (q) {
    list = list.filter(s => {
      const name = (s.name || '').toLowerCase();
      const id = (s.id || '').toLowerCase();
      const dept = (s.department || '').toLowerCase();
      const email = (s.email || '').toLowerCase();
      const phone = (s.phone || '').toLowerCase();
      return name.includes(q) || id.includes(q) || dept.includes(q) || email.includes(q) || phone.includes(q);
    });
  }

  // 2. Department filter
  if (currentFilter.department && currentFilter.department !== 'all') {
    list = list.filter(s => s.department === currentFilter.department);
  }

  // 3. Gender filter
  if (currentFilter.gender && currentFilter.gender !== 'all') {
    list = list.filter(s => (s.gender || '').toLowerCase() === currentFilter.gender.toLowerCase());
  }

  // 4. Sorting
  list.sort((a, b) => {
    switch (currentFilter.sort) {
      case 'name-asc':
        return (a.name || '').localeCompare(b.name || '');
      case 'name-desc':
        return (b.name || '').localeCompare(a.name || '');
      case 'id-asc':
        return (a.id || '').localeCompare(b.id || '');
      case 'id-desc':
        return (b.id || '').localeCompare(a.id || '');
      case 'dob-asc': // Oldest birthdate first
        return new Date(a.dob || 0) - new Date(b.dob || 0);
      case 'dob-desc': // Youngest birthdate first
        return new Date(b.dob || 0) - new Date(a.dob || 0);
      default:
        return 0;
    }
  });

  return list;
}

/**
 * Render students into the table
 */
function renderStudentsTable() {
  const tbody = document.getElementById('studentsTableBody');
  const countIndicator = document.getElementById('tableCountIndicator');
  const emptyState = document.getElementById('tableEmptyState');
  const tableWrapper = document.getElementById('studentsTableWrapper');

  if (!tbody) return;

  const filtered = getFilteredAndSortedStudents();

  if (countIndicator) {
    countIndicator.textContent = `Showing ${filtered.length} of ${allStudents.length} students`;
  }

  if (filtered.length === 0) {
    if (tableWrapper) tableWrapper.style.display = 'none';
    if (emptyState) emptyState.style.display = 'flex';
    tbody.innerHTML = '';
    return;
  }

  if (tableWrapper) tableWrapper.style.display = 'block';
  if (emptyState) emptyState.style.display = 'none';

  tbody.innerHTML = filtered.map(s => {
    const genderClass = s.gender === 'Female' ? 'badge-gender-female' : (s.gender === 'Male' ? 'badge-gender-male' : 'badge-gender-other');
    const avatarClass = s.gender === 'Female' ? 'avatar-female' : (s.gender === 'Male' ? 'avatar-male' : 'avatar-other');
    const deptClass = getDepartmentBadgeClass(s.department);
    const initials = getInitials(s.name);

    return `
      <tr data-student-id="${escapeHtml(s.id)}">
        <td>
          <span class="student-id-cell">${escapeHtml(s.id)}</span>
        </td>
        <td>
          <div class="student-name-cell">
            <div class="student-avatar-mini ${avatarClass}">${initials}</div>
            <div class="student-name-text">${escapeHtml(s.name)}</div>
          </div>
        </td>
        <td>
          <span class="badge ${genderClass}">${escapeHtml(s.gender || 'N/A')}</span>
        </td>
        <td style="white-space: nowrap;">
          ${formatDate(s.dob)}
        </td>
        <td>
          <span class="badge ${deptClass}">${escapeHtml(s.department || 'N/A')}</span>
        </td>
        <td>
          <a href="mailto:${escapeHtml(s.email)}" style="color: var(--slate-700);">${escapeHtml(s.email)}</a>
        </td>
        <td style="white-space: nowrap;">
          ${escapeHtml(s.phone)}
        </td>
        <td style="max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${escapeHtml(s.address)}">
          ${escapeHtml(s.address || 'N/A')}
        </td>
        <td>
          <div class="action-buttons">
            <button 
              type="button" 
              class="action-btn view-btn" 
              title="View Profile" 
              onclick="handleViewStudent('${escapeHtml(s.id)}')"
              aria-label="View Student Details"
            >
              <i class="fa-solid fa-eye"></i>
            </button>
            <button 
              type="button" 
              class="action-btn edit-btn" 
              title="Edit Student" 
              onclick="handleEditStudent('${escapeHtml(s.id)}')"
              aria-label="Edit Student"
            >
              <i class="fa-solid fa-pen"></i>
            </button>
            <button 
              type="button" 
              class="action-btn delete-btn" 
              title="Delete Student" 
              onclick="handleDeleteStudent('${escapeHtml(s.id)}')"
              aria-label="Delete Student"
            >
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * Setup search and filter input events
 */
function setupFiltersAndSearch() {
  const searchInput = document.getElementById('tableSearchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  const deptFilter = document.getElementById('departmentFilter');
  const genderFilter = document.getElementById('genderFilter');
  const sortFilter = document.getElementById('sortFilter');
  const resetFiltersBtn = document.getElementById('resetFiltersBtn');

  // Populate department filter dynamically based on existing and standard departments
  if (deptFilter) {
    const existingDepts = [...new Set([...AVAILABLE_DEPARTMENTS, ...allStudents.map(s => s.department).filter(Boolean)])];
    existingDepts.sort();
    
    existingDepts.forEach(dept => {
      // Check if option already exists
      const exists = Array.from(deptFilter.options).some(o => o.value === dept);
      if (!exists) {
        const opt = document.createElement('option');
        opt.value = dept;
        opt.textContent = dept;
        deptFilter.appendChild(opt);
      }
    });
  }

  // Real-time Search
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      currentFilter.search = searchInput.value;
      if (clearSearchBtn) {
        clearSearchBtn.style.display = searchInput.value ? 'block' : 'none';
      }
      renderStudentsTable();
    });
  }

  // Clear Search Button
  if (clearSearchBtn && searchInput) {
    clearSearchBtn.addEventListener('click', () => {
      searchInput.value = '';
      currentFilter.search = '';
      clearSearchBtn.style.display = 'none';
      renderStudentsTable();
      searchInput.focus();
    });
  }

  // Department Filter
  if (deptFilter) {
    deptFilter.addEventListener('change', () => {
      currentFilter.department = deptFilter.value;
      renderStudentsTable();
    });
  }

  // Gender Filter
  if (genderFilter) {
    genderFilter.addEventListener('change', () => {
      currentFilter.gender = genderFilter.value;
      renderStudentsTable();
    });
  }

  // Sort Filter
  if (sortFilter) {
    sortFilter.addEventListener('change', () => {
      currentFilter.sort = sortFilter.value;
      renderStudentsTable();
    });
  }

  // Reset Filters Button
  if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener('click', () => {
      resetAllFilters();
    });
  }
}

function resetAllFilters() {
  currentFilter = {
    search: '',
    department: 'all',
    gender: 'all',
    sort: 'id-asc'
  };

  const searchInput = document.getElementById('tableSearchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  const deptFilter = document.getElementById('departmentFilter');
  const genderFilter = document.getElementById('genderFilter');
  const sortFilter = document.getElementById('sortFilter');

  if (searchInput) searchInput.value = '';
  if (clearSearchBtn) clearSearchBtn.style.display = 'none';
  if (deptFilter) deptFilter.value = 'all';
  if (genderFilter) genderFilter.value = 'all';
  if (sortFilter) sortFilter.value = 'id-asc';

  renderStudentsTable();
}

/**
 * Handle View Student
 */
window.handleViewStudent = function(studentId) {
  const student = getStudentById(studentId);
  if (!student) {
    showToast('Student not found.', 'error');
    return;
  }

  const avatar = document.getElementById('viewModalAvatar');
  const name = document.getElementById('viewModalName');
  const idBadge = document.getElementById('viewModalIdBadge');
  const deptBadge = document.getElementById('viewModalDeptBadge');
  const gender = document.getElementById('viewModalGender');
  const dob = document.getElementById('viewModalDob');
  const age = document.getElementById('viewModalAge');
  const department = document.getElementById('viewModalDepartment');
  const email = document.getElementById('viewModalEmail');
  const phone = document.getElementById('viewModalPhone');
  const address = document.getElementById('viewModalAddress');
  const editBtn = document.getElementById('viewModalEditBtn');

  if (avatar) avatar.textContent = getInitials(student.name);
  if (name) name.textContent = student.name;
  if (idBadge) idBadge.textContent = student.id;
  if (deptBadge) {
    deptBadge.textContent = student.department;
    deptBadge.className = `badge ${getDepartmentBadgeClass(student.department)}`;
  }
  if (gender) gender.textContent = student.gender;
  if (dob) dob.textContent = formatDate(student.dob);
  if (age) age.textContent = calculateAge(student.dob);
  if (department) department.textContent = student.department;
  if (email) email.textContent = student.email;
  if (phone) phone.textContent = student.phone;
  if (address) address.textContent = student.address || 'N/A';

  if (editBtn) {
    editBtn.onclick = () => {
      closeModal('studentProfileModal');
      setTimeout(() => {
        handleEditStudent(student.id);
      }, 200);
    };
  }

  openModal('studentProfileModal');
};

/**
 * Handle Edit Student
 */
window.handleEditStudent = function(studentId) {
  const student = getStudentById(studentId);
  if (!student) {
    showToast('Student record not found.', 'error');
    return;
  }

  const idInput = document.getElementById('editStudentId');
  const nameInput = document.getElementById('editFullName');
  const genderSelect = document.getElementById('editGender');
  const dobInput = document.getElementById('editDob');
  const deptSelect = document.getElementById('editDepartment');
  const emailInput = document.getElementById('editEmail');
  const phoneInput = document.getElementById('editPhone');
  const addressInput = document.getElementById('editAddress');

  if (idInput) idInput.value = student.id;
  if (nameInput) nameInput.value = student.name || '';
  if (genderSelect) genderSelect.value = student.gender || 'Male';
  if (dobInput) dobInput.value = student.dob || '';
  if (deptSelect) deptSelect.value = student.department || '';
  if (emailInput) emailInput.value = student.email || '';
  if (phoneInput) phoneInput.value = student.phone || '';
  if (addressInput) addressInput.value = student.address || '';

  // Clear previous validation errors
  clearEditFormErrors();

  openModal('editStudentModal');
};

/**
 * Clear edit form errors
 */
function clearEditFormErrors() {
  document.querySelectorAll('#editStudentForm .form-control').forEach(el => {
    el.classList.remove('is-invalid');
  });
  document.querySelectorAll('#editStudentForm .form-error-feedback').forEach(el => {
    el.classList.remove('visible');
  });
}

/**
 * Setup Edit Form submission and validation
 */
function setupEditForm() {
  const form = document.getElementById('editStudentForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const id = document.getElementById('editStudentId').value.trim();
    const nameInput = document.getElementById('editFullName');
    const genderSelect = document.getElementById('editGender');
    const dobInput = document.getElementById('editDob');
    const deptSelect = document.getElementById('editDepartment');
    const emailInput = document.getElementById('editEmail');
    const phoneInput = document.getElementById('editPhone');
    const addressInput = document.getElementById('editAddress');

    clearEditFormErrors();

    let isValid = true;

    // Validate Name
    if (!nameInput.value.trim() || nameInput.value.trim().length < 2) {
      showFieldError('editFullName', 'Please enter a valid full name (at least 2 characters).');
      isValid = false;
    }

    // Validate DOB
    if (!dobInput.value) {
      showFieldError('editDob', 'Please select a valid date of birth.');
      isValid = false;
    } else {
      const birth = new Date(dobInput.value);
      const today = new Date();
      if (birth >= today) {
        showFieldError('editDob', 'Date of birth must be in the past.');
        isValid = false;
      }
    }

    // Validate Department
    if (!deptSelect.value) {
      showFieldError('editDepartment', 'Please select a department.');
      isValid = false;
    }

    // Validate Email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailInput.value.trim() || !emailPattern.test(emailInput.value.trim())) {
      showFieldError('editEmail', 'Please enter a valid email address.');
      isValid = false;
    }

    // Validate Phone (10 digits)
    const phonePattern = /^\d{10}$/;
    const cleanPhone = phoneInput.value.trim().replace(/\D/g, '');
    if (!phonePattern.test(cleanPhone)) {
      showFieldError('editPhone', 'Please enter a valid 10-digit phone number.');
      isValid = false;
    }

    // Validate Address
    if (!addressInput.value.trim() || addressInput.value.trim().length < 5) {
      showFieldError('editAddress', 'Please provide a valid residential address.');
      isValid = false;
    }

    if (!isValid) return;

    // Prepare updated data
    const updatedData = {
      name: nameInput.value.trim(),
      gender: genderSelect.value,
      dob: dobInput.value,
      department: deptSelect.value,
      email: emailInput.value.trim(),
      phone: cleanPhone,
      address: addressInput.value.trim()
    };

    const updated = updateStudent(id, updatedData);

    if (updated) {
      closeModal('editStudentModal');
      showToast('Student updated successfully!', 'success');
      loadStudentsData();
    } else {
      showToast('Failed to update student. Please try again.', 'error');
    }
  });
}

function showFieldError(inputId, message) {
  const input = document.getElementById(inputId);
  if (!input) return;
  input.classList.add('is-invalid');
  const errorEl = document.getElementById(`${inputId}Error`);
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.add('visible');
  }
}

/**
 * Handle Delete Student
 */
window.handleDeleteStudent = function(studentId) {
  const student = getStudentById(studentId);
  if (!student) {
    showToast('Student not found.', 'error');
    return;
  }

  studentToDeleteId = studentId;

  const targetName = document.getElementById('deleteTargetName');
  const targetId = document.getElementById('deleteTargetId');

  if (targetName) targetName.textContent = student.name;
  if (targetId) targetId.textContent = student.id;

  openModal('deleteConfirmModal');
};

/**
 * Setup Delete Confirmation Actions
 */
function setupDeleteModal() {
  const confirmBtn = document.getElementById('confirmDeleteBtn');
  if (!confirmBtn) return;

  confirmBtn.addEventListener('click', () => {
    if (!studentToDeleteId) return;

    const success = deleteStudent(studentToDeleteId);

    if (success) {
      closeModal('deleteConfirmModal');
      showToast('Student deleted successfully!', 'success');
      studentToDeleteId = null;
      loadStudentsData();
    } else {
      showToast('Could not delete student.', 'error');
    }
  });
}

/**
 * Handle URL query parameters
 */
function handleUrlParams() {
  const params = new URLSearchParams(window.location.search);

  // Focus search
  if (params.get('focus') === 'search') {
    const searchInput = document.getElementById('tableSearchInput');
    if (searchInput) {
      setTimeout(() => {
        searchInput.focus();
      }, 100);
    }
  }

  // Pre-fill search
  if (params.has('search')) {
    const query = params.get('search');
    const searchInput = document.getElementById('tableSearchInput');
    if (searchInput) {
      searchInput.value = query;
      currentFilter.search = query;
      const clearSearchBtn = document.getElementById('clearSearchBtn');
      if (clearSearchBtn) clearSearchBtn.style.display = 'block';
      renderStudentsTable();
    }
  }

  // Pre-fill department filter
  if (params.has('dept')) {
    const dept = params.get('dept');
    const deptFilter = document.getElementById('departmentFilter');
    if (deptFilter) {
      deptFilter.value = dept;
      currentFilter.department = dept;
      renderStudentsTable();
    }
  }

  // Direct edit trigger
  if (params.has('edit')) {
    const editId = params.get('edit');
    setTimeout(() => {
      handleEditStudent(editId);
    }, 200);
  }
}
