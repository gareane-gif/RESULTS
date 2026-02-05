/**
 * IndexedDB Helper for HISTJS Student Management System
 * Provides robust data storage with cross-browser and cross-device support
 */

const DB_NAME = 'HistJsDB';
const DB_VERSION = 1;
const STORE_NAME = 'students';
const BLOCKED_STORE = 'blockedStudents';
const SETTINGS_STORE = 'settings';

let db = null;

/**
 * Initialize IndexedDB
 * @returns {Promise<IDBDatabase>}
 */
async function initDB() {
    return new Promise((resolve, reject) => {
        // Check if IndexedDB is supported
        if (!window.indexedDB) {
            console.warn('⚠️ IndexedDB not supported, falling back to localStorage');
            resolve(null);
            return;
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            console.error('❌ IndexedDB error:', request.error);
            reject(request.error);
        };

        request.onsuccess = () => {
            db = request.result;
            console.log('✅ IndexedDB initialized successfully');
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const database = event.target.result;

            // Create students store
            if (!database.objectStoreNames.contains(STORE_NAME)) {
                const studentsStore = database.createObjectStore(STORE_NAME, { keyPath: 'id' });
                studentsStore.createIndex('department', 'department', { unique: false });
                studentsStore.createIndex('semester', 'semester', { unique: false });
                console.log('📦 Created students object store');
            }

            // Create blocked students store
            if (!database.objectStoreNames.contains(BLOCKED_STORE)) {
                database.createObjectStore(BLOCKED_STORE, { keyPath: 'studentId' });
                console.log('📦 Created blocked students store');
            }

            // Create settings store
            if (!database.objectStoreNames.contains(SETTINGS_STORE)) {
                database.createObjectStore(SETTINGS_STORE, { keyPath: 'key' });
                console.log('📦 Created settings store');
            }
        };
    });
}

/**
 * Save students array to IndexedDB
 * @param {Array} students - Array of student objects
 * @returns {Promise<boolean>}
 */
async function saveStudents(students) {
    try {
        // Save to localStorage as backup
        localStorage.setItem('students', JSON.stringify(students));
        sessionStorage.setItem('students', JSON.stringify(students));

        // Try IndexedDB if available
        if (!db) {
            await initDB();
        }

        if (db) {
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);

            // Clear existing data
            await new Promise((resolve, reject) => {
                const clearRequest = store.clear();
                clearRequest.onsuccess = () => resolve();
                clearRequest.onerror = () => reject(clearRequest.error);
            });

            // Add all students
            for (const student of students) {
                await new Promise((resolve, reject) => {
                    const addRequest = store.put(student);
                    addRequest.onsuccess = () => resolve();
                    addRequest.onerror = () => reject(addRequest.error);
                });
            }

            console.log(`✅ Saved ${students.length} students to IndexedDB`);
            return true;
        } else {
            console.log('✅ Saved students to localStorage only');
            return true;
        }
    } catch (error) {
        console.error('❌ Error saving students:', error);
        // Fallback to localStorage only
        localStorage.setItem('students', JSON.stringify(students));
        return false;
    }
}

/**
 * Load students from IndexedDB or localStorage
 * @returns {Promise<Array>}
 */
async function loadStudents() {
    try {
        // Try IndexedDB first
        if (!db) {
            await initDB();
        }

        if (db) {
            const transaction = db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);

            const students = await new Promise((resolve, reject) => {
                const request = store.getAll();
                request.onsuccess = () => resolve(request.result || []);
                request.onerror = () => reject(request.error);
            });

            if (students && students.length > 0) {
                console.log(`✅ Loaded ${students.length} students from IndexedDB`);
                // Sync to localStorage as backup
                localStorage.setItem('students', JSON.stringify(students));
                return students;
            }
        }

        // Fallback to localStorage
        const localData = localStorage.getItem('students');
        if (localData) {
            const students = JSON.parse(localData);
            console.log(`✅ Loaded ${students.length} students from localStorage`);
            return students;
        }

        // Fallback to sessionStorage
        const sessionData = sessionStorage.getItem('students');
        if (sessionData) {
            const students = JSON.parse(sessionData);
            console.log(`✅ Loaded ${students.length} students from sessionStorage`);
            return students;
        }

        console.log('ℹ️ No students found in storage');
        return [];
    } catch (error) {
        console.error('❌ Error loading students:', error);
        return [];
    }
}

/**
 * Export all data as JSON
 * @returns {Promise<Object>}
 */
async function exportData() {
    try {
        const students = await loadStudents();
        const blockedStudents = JSON.parse(localStorage.getItem('blockedStudents') || '[]');
        const departments = JSON.parse(localStorage.getItem('departments') || '[]');
        const customSubjects = JSON.parse(localStorage.getItem('customSubjects') || '{}');
        const settings = JSON.parse(localStorage.getItem('requiredSubjectSettings') || '{}');

        const exportObject = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            data: {
                students,
                blockedStudents,
                departments,
                customSubjects,
                settings
            }
        };

        console.log('✅ Data exported successfully');
        return exportObject;
    } catch (error) {
        console.error('❌ Error exporting data:', error);
        throw error;
    }
}

/**
 * Import data from JSON
 * @param {Object} jsonData - Data object to import
 * @returns {Promise<boolean>}
 */
async function importData(jsonData) {
    try {
        if (!jsonData || !jsonData.data) {
            throw new Error('Invalid data format');
        }

        const { students, blockedStudents, departments, customSubjects, settings } = jsonData.data;

        // Import students
        if (students && Array.isArray(students)) {
            await saveStudents(students);
        }

        // Import other data to localStorage
        if (blockedStudents) {
            localStorage.setItem('blockedStudents', JSON.stringify(blockedStudents));
        }
        if (departments) {
            localStorage.setItem('departments', JSON.stringify(departments));
        }
        if (customSubjects) {
            localStorage.setItem('customSubjects', JSON.stringify(customSubjects));
        }
        if (settings) {
            localStorage.setItem('requiredSubjectSettings', JSON.stringify(settings));
        }

        console.log('✅ Data imported successfully');
        return true;
    } catch (error) {
        console.error('❌ Error importing data:', error);
        throw error;
    }
}

/**
 * Download data as JSON file
 */
async function downloadDataAsJSON() {
    try {
        const data = await exportData();
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `histjs-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        console.log('✅ Data downloaded as JSON file');
        return true;
    } catch (error) {
        console.error('❌ Error downloading data:', error);
        alert('حدث خطأ أثناء تنزيل البيانات');
        return false;
    }
}

/**
 * Upload and import JSON file
 */
function uploadJSONFile() {
    return new Promise((resolve, reject) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.onchange = async (e) => {
            try {
                const file = e.target.files[0];
                if (!file) {
                    reject(new Error('No file selected'));
                    return;
                }

                const reader = new FileReader();
                reader.onload = async (event) => {
                    try {
                        const jsonData = JSON.parse(event.target.result);
                        await importData(jsonData);
                        resolve(true);
                    } catch (error) {
                        reject(error);
                    }
                };
                reader.onerror = () => reject(reader.error);
                reader.readAsText(file);
            } catch (error) {
                reject(error);
            }
        };

        input.click();
    });
}

/**
 * Generate shareable link with data
 * @param {string} baseUrl - Base URL for student search page
 * @returns {Promise<string>}
 */
async function generateShareableLink(baseUrl = 'student_search.html') {
    try {
        const students = await loadStudents();

        // For large datasets, we'll provide download option instead
        const dataSize = JSON.stringify(students).length;

        if (dataSize > 50000) {
            // Data too large for URL, suggest download instead
            console.warn('⚠️ Data too large for URL sharing');
            return null;
        }

        // Encode data for URL
        const encodedData = encodeURIComponent(JSON.stringify(students));
        const shareUrl = `${baseUrl}?students=${encodedData}`;

        return shareUrl;
    } catch (error) {
        console.error('❌ Error generating shareable link:', error);
        return null;
    }
}

// Initialize DB on load - REMOVED to prevent blocking login
// DB will be initialized automatically when needed (lazy loading)
if (typeof window !== 'undefined') {
    // Don't auto-initialize - let it happen on first use
    console.log('📦 db-helper.js loaded - IndexedDB will initialize on first use');
}
