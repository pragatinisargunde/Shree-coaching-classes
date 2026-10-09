// ==========================================
// 1. HEADER LOADER, THEME TOGGLE & SEARCH
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const headerElement = document.querySelector('.header');
    if (headerElement) {
        // Detect active page name
        const path = window.location.pathname.split('/').pop().toLowerCase();
        const currentPage = (path === '' || path === 'index.html') ? 'home' : path.replace('.html', '');

        headerElement.innerHTML = `
        <div style="position: sticky; top: 0; z-index: 50; backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); background: rgba(255, 255, 255, 0.88); border-bottom: 1px solid rgba(243, 182, 194, 0.4);" class="dark:!bg-[#080611]/90 dark:!border-[#1c1635]">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                
                <!-- Logo -->
                <a href="index.html" class="flex items-center gap-2" style="text-decoration: none;">
                    <span style="font-size: 24px;">🎓</span>
                    <span class="font-extrabold text-lg tracking-tight bg-gradient-to-r from-[#403D88] via-[#8B639B] to-[#AF719D] dark:from-white dark:via-[#F8B2B2] dark:to-[#ff9ebb] bg-clip-text text-transparent">EduHostel</span>
                </a>

                <!-- Navigation Links -->
                <nav class="hidden md:flex items-center">
                    <ul class="flex items-center gap-2 list-none m-0 p-1 rounded-full bg-[#fce5e9]/70 dark:bg-[#1c1635]/80 border border-[#f3b6c2]/70 dark:border-[#3b325c]">
                        <li><a href="index.html" class="nav-item ${currentPage === 'home' ? 'active-page' : ''}">Home</a></li>
                        <li><a href="about.html" class="nav-item ${currentPage === 'about' ? 'active-page' : ''}">About</a></li>
                        <li><a href="courses.html" class="nav-item ${currentPage === 'courses' ? 'active-page' : ''}">Courses</a></li>
                        <li><a href="hostel.html" class="nav-item ${currentPage === 'hostel' ? 'active-page' : ''}">Hostel</a></li>
                        <li><a href="admission.html" class="nav-item ${currentPage === 'admission' ? 'active-page' : ''}">Admission</a></li>
                        <li><a href="contact.html" class="nav-item ${currentPage === 'contact' ? 'active-page' : ''}">Contact</a></li>
                    </ul>
                </nav>

                <!-- Actions (Theme Toggle + Buttons) -->
                <div class="hidden md:flex items-center gap-3">
                    <!-- Working Pill Switch -->
                    <button id="themeToggleBtn" type="button" aria-label="Toggle Theme" style="width: 54px; height: 28px; border-radius: 9999px; position: relative; border: 1.5px solid; cursor: pointer; display: flex; align-items: center; padding: 2px;" class="bg-[#fce5e9] border-[#f3b6c2] dark:bg-[#1c1635] dark:border-[#4b3d75]">
                        <div id="themeToggleBall" style="width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);" class="bg-white text-[#8B639B] dark:bg-[#ff9ebb] dark:text-[#080611] shadow-sm">
                            <span id="themeToggleEmoji">☀️</span>
                        </div>
                    </button>

                    <a href="studentlogin.html" class="px-4 py-2 border border-[#8B639B] dark:border-[#ff9ebb] text-[#403D88] dark:text-[#ff9ebb] text-xs font-bold rounded-xl hover:bg-[#8B639B] hover:text-white dark:hover:bg-[#ff9ebb] dark:hover:text-[#080611] transition-colors" style="text-decoration: none;">
                        Student Login
                    </a>
                    <a href="admin.html" class="px-4 py-2 bg-gradient-to-r from-[#403D88] via-[#8B639B] to-[#AF719D] text-white text-xs font-bold rounded-xl shadow hover:opacity-90 transition-opacity" style="text-decoration: none;">
                        Admin
                    </a>
                </div>

                <!-- Mobile Hamburger -->
                <button id="mobileNavToggle" type="button" class="md:hidden p-2 rounded-xl text-[#8B639B] dark:text-[#ff9ebb] bg-[#fce5e9] dark:bg-[#1c1635] border border-[#f3b6c2] dark:border-[#3b325c]">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                </button>
            </div>

            <!-- Mobile Drawer -->
            <div id="mobileDrawer" style="display: none;" class="bg-[#fdf2f4] dark:bg-[#080611] border-b border-[#f3b6c2] dark:border-[#3b325c] px-6 py-4 space-y-2 md:hidden">
                <a href="index.html" class="block py-1.5 text-xs font-bold uppercase tracking-wider text-[#2a2238] dark:text-[#dfd7ea] ${currentPage === 'home' ? 'text-[#8B639B] dark:!text-[#ff9ebb]' : ''}">Home</a>
                <a href="about.html" class="block py-1.5 text-xs font-bold uppercase tracking-wider text-[#2a2238] dark:text-[#dfd7ea] ${currentPage === 'about' ? 'text-[#8B639B] dark:!text-[#ff9ebb]' : ''}">About</a>
                <a href="courses.html" class="block py-1.5 text-xs font-bold uppercase tracking-wider text-[#2a2238] dark:text-[#dfd7ea] ${currentPage === 'courses' ? 'text-[#8B639B] dark:!text-[#ff9ebb]' : ''}">Courses</a>
                <a href="hostel.html" class="block py-1.5 text-xs font-bold uppercase tracking-wider text-[#2a2238] dark:text-[#dfd7ea] ${currentPage === 'hostel' ? 'text-[#8B639B] dark:!text-[#ff9ebb]' : ''}">Hostel</a>
                <a href="admission.html" class="block py-1.5 text-xs font-bold uppercase tracking-wider text-[#2a2238] dark:text-[#dfd7ea] ${currentPage === 'admission' ? 'text-[#8B639B] dark:!text-[#ff9ebb]' : ''}">Admission</a>
                <a href="contact.html" class="block py-1.5 text-xs font-bold uppercase tracking-wider text-[#2a2238] dark:text-[#dfd7ea] ${currentPage === 'contact' ? 'text-[#8B639B] dark:!text-[#ff9ebb]' : ''}">Contact</a>
            </div>
        </div>
        `;

        // Setup Theme Switcher Click Event
        const toggleBtn = document.getElementById('themeToggleBtn');
        const ball = document.getElementById('themeToggleBall');
        const emoji = document.getElementById('themeToggleEmoji');

        function renderTheme(isDark) {
            if (isDark) {
                document.documentElement.classList.add('dark');
                if (ball) ball.style.transform = 'translateX(24px)';
                if (emoji) emoji.textContent = '🌙';
            } else {
                document.documentElement.classList.remove('dark');
                if (ball) ball.style.transform = 'translateX(0px)';
                if (emoji) emoji.textContent = '☀️';
            }
        }

        const currentThemeDark = document.documentElement.classList.contains('dark') || localStorage.getItem('theme') === 'dark';
        renderTheme(currentThemeDark);

        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                const isDarkNow = !document.documentElement.classList.contains('dark');
                localStorage.setItem('theme', isDarkNow ? 'dark' : 'light');
                renderTheme(isDarkNow);
            });
        }

        // Setup Mobile Menu Toggle
        const mobileBtn = document.getElementById('mobileNavToggle');
        const drawer = document.getElementById('mobileDrawer');
        if (mobileBtn && drawer) {
            mobileBtn.addEventListener('click', () => {
                drawer.style.display = drawer.style.display === 'none' ? 'block' : 'none';
            });
        }
    }
});


// ==========================================
// 2. ADMIN PANEL - SEARCH STUDENT FOR ENROLL
// ==========================================
async function searchStudentForEnroll() {
    const searchInput = document.getElementById('enroll-search-id');
    if (!searchInput) return;

    const searchId = searchInput.value.trim().toLowerCase();
    if (!searchId) return alert("Please enter a Student ID");

    try {
        const res = await fetch('http://127.0.0.1:5000/api/students');
        const data = await res.json();
        
        const student = data.students.find(s => s.studentId.toLowerCase() === searchId || s.studentId.toLowerCase().includes(searchId));

        if (student) {
            currentEnrollStudent = student; 
            document.getElementById('enroll-not-found').classList.add('hidden');
            document.getElementById('enroll-details-section').classList.remove('hidden');

            document.getElementById('enr-id').value = student.studentId;
            document.getElementById('enr-name').value = student.fullName || '';
            document.getElementById('enr-phone').value = student.phone || '';
            document.getElementById('enr-email').value = student.email || '';
            document.getElementById('enr-year').value = student.academicYear || '2026-27';
            document.getElementById('enr-cgpa').value = student.gpa || '0.0';
            document.getElementById('enr-fee-status').value = student.feesStatus || 'Pending';
            document.getElementById('enr-fee-paid').value = parseInt((student.paidAmount || "0").replace(/\D/g, '')) || 0;

            document.querySelectorAll('.admin-course-chk').forEach(cb => {
                if (student.classCourse && student.classCourse.includes(cb.getAttribute('data-name'))) {
                    cb.checked = true; 
                    cb.closest('.subject-card').classList.add('selected');
                } else {
                    cb.checked = false; 
                    cb.closest('.subject-card').classList.remove('selected');
                }
            });
            calcCourseLiveFees();
        } else {
            document.getElementById('enroll-not-found').classList.remove('hidden');
            document.getElementById('enroll-details-section').classList.add('hidden');
        }
    } catch (err) { 
        alert("Failed to fetch student data from server."); 
    }
}


// ==========================================
// 3. STUDENT LOGIN HANDLER (WITH PASSWORD SUPPORT)
// ==========================================
async function executePortalAuth(event) {
    event.preventDefault();
    const studentIdInput = document.getElementById('studentId');
    const passwordInput = document.getElementById('password');
    
    if (!studentIdInput || !passwordInput) return;

    const studentId = studentIdInput.value.trim();
    const password = passwordInput.value.trim();
    const errorMsg = document.getElementById('loginError');
    if (errorMsg) errorMsg.classList.add('hidden');

    try {
        const res = await fetch('http://127.0.0.1:5000/api/student-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studentId, password })
        });
        const data = await res.json();

        if (data.success) {
            sessionStorage.setItem('portal_auth_token', 'active');
            sessionStorage.setItem('active_student_data', JSON.stringify(data.student));
            if (typeof syncPortalSession === 'function') {
                syncPortalSession();
            } else {
                window.location.href = 'studentdashboard.html';
            }
        } else {
            if (errorMsg) errorMsg.classList.remove('hidden');
        }
    } catch (err) {
        alert("⚠️ Server connection failed!");
    }
}


// ==========================================
// 4. ADMIN PANEL - OPEN STUDENT MODAL (COMMON PASSWORD)
// ==========================================
function openStudentModal() {
    const form = document.getElementById('student-form-dialog');
    const modalForm = document.getElementById('student-modal-form');
    if (modalForm) modalForm.reset();
    uploadedPhotoBase64 = "";
    
    const passInput = document.getElementById('modal-stu-pass');
    if (passInput) passInput.value = "12345"; // Common default password set here
    
    const yearInput = document.getElementById('modal-stu-year');
    if (yearInput) yearInput.value = "2026-27";
    
    const idInput = document.getElementById('modal-stu-id');
    if (idInput) idInput.disabled = false;
    
    if (form && typeof form.showModal === 'function') {
        form.showModal();
    }
}


// ==========================================
// 5. STUDENT DASHBOARD - LAST LOGIN ACTIVITY HELPER
// ==========================================
function updateLastLoginDisplay(student) {
    const lastLoginElem = document.getElementById('lastLoginDisplay');
    if (lastLoginElem && student) {
        lastLoginElem.innerText = student.lastLogin || 'First Time Login';
    }
}