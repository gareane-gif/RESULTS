// Student Data File - Shared between pages
// This file acts as a simple data API

// Global students data
let studentsData = [];

// Function to get students data
function getStudentsData() {
    return studentsData;
}

// Function to set students data
function setStudentsData(data) {
    studentsData = data;
    // Also save to localStorage as backup
    localStorage.setItem('studentsData', JSON.stringify(data));
}

// Function to load from localStorage
function loadFromLocalStorage() {
    try {
        const stored = localStorage.getItem('studentsData');
        if (stored) {
            studentsData = JSON.parse(stored);
            return true;
        }
    } catch (error) {
        console.error('Error loading from localStorage:', error);
    }
    return false;
}

// Function to initialize with sample data if empty
function initializeWithSampleData() {
    if (studentsData.length === 0) {
        studentsData = [
            {
                id: 'CO242001',
                name: 'أحمد محمد علي',
                department: 'علوم الحاسوب',
                semester: 1,
                subjects: [
                    { name: 'برمجة 2 (مطالب)', units: 3, classwork: 18, final: 32, total: 50 },
                    { name: 'رياضيات متقدمة', units: 2, classwork: 15, final: 25, total: 40 },
                    { name: 'قواعد بيانات', units: 3, classwork: 20, final: 35, total: 55 },
                    { name: 'شبكات حاسوب', units: 2, classwork: 16, final: 28, total: 44 }
                ]
            },
            {
                id: 'CO242002',
                name: 'فاطمة عبدالله سالم',
                department: 'علوم الحاسوب',
                semester: 1,
                subjects: [
                    { name: 'برمجة 2 (مطالب)', units: 3, classwork: 10, final: 15, total: 25 },
                    { name: 'رياضيات متقدمة', units: 2, classwork: 18, final: 30, total: 48 },
                    { name: 'قواعد بيانات', units: 3, classwork: 19, final: 31, total: 50 },
                    { name: 'شبكات حاسوب', units: 2, classwork: 17, final: 29, total: 46 }
                ]
            },
            {
                id: 'CO242003',
                name: 'محمد خالد عمر',
                department: 'علوم الحاسوب',
                semester: 1,
                subjects: [
                    { name: 'برمجة 2 (مطالب)', units: 3, classwork: 25, final: 45, total: 70 },
                    { name: 'رياضيات متقدمة', units: 2, classwork: 20, final: 35, total: 55 },
                    { name: 'قواعد بيانات', units: 3, classwork: 23, final: 42, total: 65 },
                    { name: 'شبكات حاسوب', units: 2, classwork: 22, final: 38, total: 60 }
                ]
            }
        ];
        // Save to localStorage
        localStorage.setItem('studentsData', JSON.stringify(studentsData));
        console.log('✅ Initialized with sample data');
    }
}

// Auto-load on script load
loadFromLocalStorage();
if (studentsData.length === 0) {
    initializeWithSampleData();
}

// Make functions globally available
window.getStudentsData = getStudentsData;
window.setStudentsData = setStudentsData;
window.loadFromLocalStorage = loadFromLocalStorage;
window.initializeWithSampleData = initializeWithSampleData;
