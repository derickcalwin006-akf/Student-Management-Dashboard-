/**
 * Student Management System - Dashboard Controller
 */

let deptChartInstance = null;
let genderChartInstance = null;

document.addEventListener('DOMContentLoaded', () => {
  // Ensure user is authenticated
  requireAuth();

  // Load and display dashboard data
  refreshDashboard();

  // Listen for storage changes from other tabs or actions
  window.addEventListener('studentsUpdated', () => {
    refreshDashboard();
  });

  // Attach CSV export listener
  const exportBtn = document.getElementById('exportCsvBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', (e) => {
      e.preventDefault();
      exportStudentsToCSV();
    });
  }
});

/**
 * Refresh all dashboard widgets and charts
 */
function refreshDashboard() {
  const stats = getStatistics();
  const students = getStudents();

  // Update Stat Cards
  const totalElem = document.getElementById('statTotalStudents');
  const maleElem = document.getElementById('statMaleStudents');
  const femaleElem = document.getElementById('statFemaleStudents');
  const deptsElem = document.getElementById('statDepartments');
  const malePctElem = document.getElementById('statMalePercentage');
  const femalePctElem = document.getElementById('statFemalePercentage');

  if (totalElem) totalElem.textContent = stats.total;
  if (maleElem) maleElem.textContent = stats.male;
  if (femaleElem) femaleElem.textContent = stats.female;
  if (deptsElem) deptsElem.textContent = stats.departmentsCount;

  if (malePctElem) malePctElem.textContent = `${stats.malePercentage}% of total`;
  if (femalePctElem) femalePctElem.textContent = `${stats.femalePercentage}% of total`;

  // Render Charts
  renderCharts(stats);

  // Render Recently Added Students
  renderRecentStudents(students);
}

/**
 * Render Chart.js charts
 */
function renderCharts(stats) {
  // Department Distribution Chart
  const deptCanvas = document.getElementById('departmentChart');
  if (deptCanvas && window.Chart) {
    const labels = Object.keys(stats.departmentMap);
    const dataValues = Object.values(stats.departmentMap);

    const colors = [
      '#2563eb', // Blue (CS)
      '#7c3aed', // Purple (DS)
      '#0284c7', // Sky (IT)
      '#059669', // Emerald (CA)
      '#d97706', // Amber (EE)
      '#dc2626', // Red (Mech)
      '#4b5563'  // Slate (Civil)
    ];

    if (deptChartInstance) {
      deptChartInstance.destroy();
    }

    deptChartInstance = new Chart(deptCanvas, {
      type: 'bar',
      data: {
        labels: labels.length ? labels : ['No Data'],
        datasets: [{
          label: 'Enrolled Students',
          data: dataValues.length ? dataValues : [0],
          backgroundColor: colors.slice(0, Math.max(labels.length, 1)),
          borderRadius: 6,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: '#0f172a',
            titleFont: { family: 'Plus Jakarta Sans', size: 13, weight: 'bold' },
            bodyFont: { family: 'Inter', size: 12 },
            padding: 10,
            cornerRadius: 8
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              font: { family: 'Plus Jakarta Sans', size: 11, weight: '600' },
              color: '#64748b'
            }
          },
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              precision: 0,
              font: { family: 'Plus Jakarta Sans', size: 11 },
              color: '#64748b'
            },
            grid: {
              color: '#f1f5f9'
            }
          }
        }
      }
    });
  }

  // Gender Ratio Doughnut Chart
  const genderCanvas = document.getElementById('genderChart');
  if (genderCanvas && window.Chart) {
    if (genderChartInstance) {
      genderChartInstance.destroy();
    }

    const hasData = stats.total > 0;
    const genderLabels = ['Male', 'Female'];
    const genderData = hasData ? [stats.male, stats.female] : [1, 1];
    const bgColors = hasData ? ['#0284c7', '#ec4899'] : ['#e2e8f0', '#cbd5e1'];

    if (stats.other > 0) {
      genderLabels.push('Other');
      genderData.push(stats.other);
      bgColors.push('#8b5cf6');
    }

    genderChartInstance = new Chart(genderCanvas, {
      type: 'doughnut',
      data: {
        labels: genderLabels,
        datasets: [{
          data: genderData,
          backgroundColor: bgColors,
          borderWidth: 2,
          borderColor: '#ffffff',
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              font: { family: 'Plus Jakarta Sans', size: 12, weight: '600' },
              color: '#475569',
              usePointStyle: true,
              padding: 16
            }
          },
          tooltip: {
            backgroundColor: '#0f172a',
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: (context) => {
                if (!hasData) return 'No student records';
                const total = stats.total;
                const value = context.parsed;
                const pct = Math.round((value / total) * 100);
                return ` ${context.label}: ${value} (${pct}%)`;
              }
            }
          }
        },
        cutout: '68%'
      }
    });
  }
}

/**
 * Render recent students table
 */
function renderRecentStudents(students) {
  const tbody = document.getElementById('recentStudentsBody');
  if (!tbody) return;

  // Show up to 5 latest students
  const recent = [...students].slice(0, 5);

  if (recent.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 2.5rem; color: var(--slate-400);">
          <i class="fa-solid fa-user-slash" style="font-size: 2rem; margin-bottom: 0.5rem; display: block;"></i>
          No student records available. Click "Add Student" to create one.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = recent.map(s => {
    const genderClass = s.gender === 'Female' ? 'badge-gender-female' : (s.gender === 'Male' ? 'badge-gender-male' : 'badge-gender-other');
    const avatarClass = s.gender === 'Female' ? 'avatar-female' : (s.gender === 'Male' ? 'avatar-male' : 'avatar-other');
    const deptClass = getDepartmentBadgeClass(s.department);
    const initials = getInitials(s.name);

    return `
      <tr>
        <td>
          <span class="student-id-cell">${escapeHtml(s.id)}</span>
        </td>
        <td>
          <div class="student-name-cell">
            <div class="student-avatar-mini ${avatarClass}">${initials}</div>
            <div>
              <div class="student-name-text">${escapeHtml(s.name)}</div>
              <div style="font-size: 0.78rem; color: var(--slate-400);">${escapeHtml(s.email)}</div>
            </div>
          </div>
        </td>
        <td>
          <span class="badge ${genderClass}">${escapeHtml(s.gender || 'N/A')}</span>
        </td>
        <td>
          <span class="badge ${deptClass}">${escapeHtml(s.department || 'N/A')}</span>
        </td>
        <td style="font-size: 0.82rem; color: var(--slate-500);">
          ${formatDate(s.createdAt || s.dob)}
        </td>
        <td>
          <button type="button" class="btn-header-action btn-outline btn-sm" onclick="viewRecentStudentDetails('${escapeHtml(s.id)}')">
            <i class="fa-solid fa-eye"></i> View
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * Open profile modal from recent table
 */
window.viewRecentStudentDetails = function(studentId) {
  const student = getStudentById(studentId);
  if (!student) {
    showToast('Student record not found.', 'error');
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
  const editLink = document.getElementById('viewModalEditLink');

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

  if (editLink) {
    editLink.onclick = () => {
      window.location.href = `students.html?edit=${encodeURIComponent(student.id)}`;
    };
  }

  openModal('studentProfileModal');
};
