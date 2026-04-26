/**
 * A4 Page Builder - JavaScript Module
 * Separated from index.html for better maintainability
 */

/**
 * FIELD CONFIGURATION MAPPING
 */
const mapping = {
    'in-univ': 'out-univ',
    'in-coll': 'out-coll-path',
    'in-topic': 'out-topic',
    'in-header': 'out-header',
    'in-session': 'out-session',
    'in-name': 'out-name',
    'in-sem': 'out-sem',
    'in-course': 'out-course',
    'in-roll': 'out-roll',
    'in-uni-roll': 'out-uni-roll',
    'in-reg': 'out-reg'
};

/**
 * CORE INITIALIZATION
 */
function setupApp() {
    // Sync Inputs to Preview
    Object.keys(mapping).forEach(id => {
        const input = document.getElementById(id);
        const output = document.getElementById(mapping[id]);
        if (input && output) {
            input.addEventListener('input', () => {
                const value = input.value.trim();
                output.innerHTML = value === "" ? "&nbsp;" : value;
            });
        }
    });

    // Setup Curve Tuning
    ['adj-arc', 'adj-size'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', updateArc);
    });

    // Setup File Uploaders
    handleUpload('f-univ', 'p-univ', 'img-univ');
    handleUpload('f-coll', 'p-coll', 'img-coll');

    // Initial Arc Refresh
    updateArc();

    // Screen Preview Resizing
    window.addEventListener('resize', responsiveScale);
    responsiveScale();

    // Load saved data
    loadFromLocal();

    // Setup Auto-save for all inputs
    setupAutoSave();

    // Setup Exit Handling
    setupExitHandling();
}

/**
 * SVG ARC ENGINE
 */
function updateArc() {
    const arcEl = document.getElementById('adj-arc');
    const sizeEl = document.getElementById('adj-size');
    const depth = arcEl ? arcEl.value : 100;
    const fontSize = sizeEl ? sizeEl.value : 24;
    const path = document.getElementById('curve-path');
    const textPath = document.getElementById('out-coll-path');

    if (path) {
        // Redraw Arc
        path.setAttribute('d', `M 50,160 A 250,${depth} 0 0,1 550,160`);
    }
    if (textPath) {
        textPath.style.fontSize = `${fontSize}px`;
    }
}

/**
 * PRINT LOGIC
 */
function initiatePrint() {
    updateArc(); // Force final sync

    // Brief timeout for DOM stability
    setTimeout(() => {
        window.print();
    }, 200);
}

/**
 * EXPORT SOURCE CODE
 * Allows user to download the full HTML for GitHub Pages
 */
function exportCode() {
    // We obtain the current document's source
    const html = document.documentElement.outerHTML;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'index.html';
    a.click();
    URL.revokeObjectURL(url);
}

/**
 * FILE HELPERS
 */
function handleUpload(inputId, prevId, targetId) {
    const inputEl = document.getElementById(inputId);
    if (inputEl) {
        inputEl.addEventListener('change', function () {
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                reader.onload = e => {
                    const prevEl = document.getElementById(prevId);
                    const targetEl = document.getElementById(targetId);
                    if (prevEl) prevEl.src = e.target.result;
                    if (targetEl) targetEl.src = e.target.result;
                };
                reader.readAsDataURL(this.files[0]);
            }
        });
    }
}

function handleLink(targetId, prevId) {
    const url = prompt("Paste Direct Image Link (PNG/JPG):");
    if (url && (url.startsWith('http') || url.startsWith('data:'))) {
        const targetEl = document.getElementById(targetId);
        const prevEl = document.getElementById(prevId);
        if (targetEl) targetEl.src = url;
        if (prevEl) prevEl.src = url;
    }
}

/**
 * RESPONSIVE PREVIEW SCALING
 */
function responsiveScale() {
    const main = document.querySelector('main');
    const preview = document.getElementById('page-content');
    if (!main || !preview) return;

    // A4 width in pixels is roughly 794px at 96dpi
    const a4Width = 794;
    const padding = 80;
    
    // On small screens, we want a minimum scale so it's readable, 
    // which will trigger both horizontal and vertical scrolling.
    const isMobile = window.innerWidth < 1024;
    const minScale = isMobile ? 0.75 : 0.4; // Mobile gets 0.75 min, Desktop can scale more if window is tiny
    
    let scale = (main.offsetWidth - padding) / a4Width;
    scale = Math.max(minScale, Math.min(1, scale));
    
    preview.style.transform = `scale(${scale})`;
}

/**
 * BORDER STYLE CHANGER
 */
function changeBorderStyle() {
    const select = document.getElementById('border-style');
    const border = document.getElementById('page-border');
    if (!select || !border) return;

    // Remove all border style classes
    border.className = 'page-border';

    // Add selected style
    border.classList.add('border-style-' + select.value);
}

/**
 * SECTION VISIBILITY TOGGLES
 */
function setupSectionToggles() {
    const univToggle = document.getElementById('toggle-univ');
    const collToggle = document.getElementById('toggle-coll');

    if (univToggle) {
        univToggle.addEventListener('change', function () {
            const section = document.getElementById('section-univ');
            if (section) {
                section.style.display = this.checked ? 'block' : 'none';
            }
        });
    }

    if (collToggle) {
        collToggle.addEventListener('change', function () {
            const section = document.getElementById('section-coll');
            if (section) {
                section.style.display = this.checked ? 'block' : 'none';
            }
        });
    }
}

/**
 * FIELD VISIBILITY TOGGLE
 */
const fieldVisibility = {
    'name': true,
    'sem': true,
    'course': true,
    'roll': true,
    'uni-roll': true,
    'reg': true
};

function toggleFieldVisibility(fieldId) {
    fieldVisibility[fieldId] = !fieldVisibility[fieldId];
    const btn = document.getElementById('vis-btn-' + fieldId);
    const previewRow = document.getElementById('preview-row-' + fieldId);

    if (btn) {
        const icon = btn.querySelector('.material-symbols-outlined');
        if (fieldVisibility[fieldId]) {
            btn.classList.remove('hidden-field');
            if (icon) icon.textContent = 'visibility';
        } else {
            btn.classList.add('hidden-field');
            if (icon) icon.textContent = 'visibility_off';
        }
    }

    if (previewRow) {
        previewRow.style.display = fieldVisibility[fieldId] ? 'flex' : 'none';
    }
}

/**
 * EDITABLE FIELD LABELS
 */
function updateFieldLabel(fieldId) {
    const labelInput = document.getElementById('label-' + fieldId);
    const previewLabel = document.getElementById('preview-label-' + fieldId);

    if (labelInput && previewLabel) {
        const suffix = fieldId.includes('roll') || fieldId === 'reg' ? ':-' : ' -';
        previewLabel.textContent = labelInput.value + suffix;
    }
}

/**
 * POSITION CONTROLLERS
 */
function updatePositions() {
    const collNameSlider = document.getElementById('pos-coll-name');
    const collLogoSlider = document.getElementById('pos-coll-logo');
    const collNameWrapper = document.getElementById('coll-name-wrapper');
    const collLogoWrapper = document.getElementById('coll-logo-wrapper');

    if (collNameSlider && collNameWrapper) {
        const offset = collNameSlider.value;
        collNameWrapper.style.transform = `translateY(${offset}px)`;
    }

    if (collLogoSlider && collLogoWrapper) {
        const offset = collLogoSlider.value;
        collLogoWrapper.style.transform = `translateY(${offset}px)`;
    }
}

/**
 * LOGO VISIBILITY TOGGLES
 */
function setupLogoToggles() {
    const univLogoToggle = document.getElementById('toggle-univ-logo');
    const collLogoToggle = document.getElementById('toggle-coll-logo');

    if (univLogoToggle) {
        univLogoToggle.addEventListener('change', function () {
            const logoWrapper = document.getElementById('univ-logo-wrapper');
            if (logoWrapper) {
                logoWrapper.style.display = this.checked ? 'flex' : 'none';
            }
        });
    }

    if (collLogoToggle) {
        collLogoToggle.addEventListener('change', function () {
            const logoWrapper = document.getElementById('coll-logo-wrapper');
            if (logoWrapper) {
                logoWrapper.style.display = this.checked ? 'flex' : 'none';
            }
        });
    }
}

/**
 * PROJECT FIELD VISIBILITY TOGGLE
 */
const projectFieldVisibility = {
    'header': true,
    'topic': true,
    'session': true
};

function toggleProjectField(fieldId) {
    projectFieldVisibility[fieldId] = !projectFieldVisibility[fieldId];
    const btn = document.getElementById('vis-btn-' + fieldId);

    // Map field IDs to preview element IDs
    const previewMap = {
        'header': 'out-header',
        'topic': 'out-topic',
        'session': 'preview-session-footer'
    };

    const previewEl = document.getElementById(previewMap[fieldId]);

    if (btn) {
        const icon = btn.querySelector('.material-symbols-outlined');
        if (projectFieldVisibility[fieldId]) {
            btn.classList.remove('hidden-field');
            if (icon) icon.textContent = 'visibility';
        } else {
            btn.classList.add('hidden-field');
            if (icon) icon.textContent = 'visibility_off';
        }
    }

    if (previewEl) {
        previewEl.style.display = projectFieldVisibility[fieldId] ? '' : 'none';
    }
}

/**
 * BORDER COLOR UPDATE
 */
function updateBorderColor() {
    const colorPicker = document.getElementById('border-color');
    const border = document.getElementById('page-border');

    if (colorPicker && border) {
        const color = colorPicker.value;
        border.style.borderColor = color;
        // Also update CSS variable for double/dashed borders
        document.documentElement.style.setProperty('--border-color', color);
    }
}

/**
 * TEXT STYLING UPDATE
 */
function updateTextStyle(fieldId) {
    const colorPicker = document.getElementById('color-' + fieldId);
    const fontSelect = document.getElementById('font-' + fieldId);
    const sizeInput = document.getElementById('size-' + fieldId);

    // Map to preview elements
    const previewMap = {
        'univ': 'out-univ',
        'coll': 'out-coll-path',
        'header': 'out-header',
        'topic': 'out-topic',
        'session': 'out-session-p'
    };

    const previewEl = document.getElementById(previewMap[fieldId]);

    if (previewEl) {
        if (colorPicker) {
            previewEl.style.color = colorPicker.value;
            // For SVG text (college name)
            if (fieldId === 'coll') {
                previewEl.style.fill = colorPicker.value;
            }
        }
        if (fontSelect) {
            previewEl.style.fontFamily = fontSelect.value;
        }
        if (sizeInput) {
            previewEl.style.fontSize = sizeInput.value + 'px';
        }
    }
}

/**
 * BACKGROUND OPTIONS
 */
function updateBackground() {
    const colorPicker = document.getElementById('bg-color');
    const opacitySlider = document.getElementById('bg-opacity');
    const opacityValue = document.getElementById('opacity-value');
    const pageContent = document.getElementById('page-content');

    if (colorPicker && opacitySlider && pageContent) {
        const color = colorPicker.value;
        const opacity = opacitySlider.value / 100;

        // Convert hex to rgba
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);

        pageContent.style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${opacity})`;
        if (opacityValue) opacityValue.textContent = opacitySlider.value + '%';
    }
}

function handleBgImage(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const preview = document.getElementById('bg-image-preview');
            const text = document.getElementById('bg-image-text');
            const pageContent = document.getElementById('page-content');

            if (preview) {
                preview.src = e.target.result;
                preview.classList.remove('hidden');
            }
            if (text) text.classList.add('hidden');
            if (pageContent) {
                pageContent.style.backgroundImage = `url(${e.target.result})`;
                pageContent.style.backgroundSize = 'cover';
                pageContent.style.backgroundPosition = 'center';
            }
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function clearBgImage() {
    const preview = document.getElementById('bg-image-preview');
    const text = document.getElementById('bg-image-text');
    const pageContent = document.getElementById('page-content');
    const fileInput = document.getElementById('bg-image-file');

    if (preview) {
        preview.src = '';
        preview.classList.add('hidden');
    }
    if (text) text.classList.remove('hidden');
    if (pageContent) pageContent.style.backgroundImage = 'none';
    if (fileInput) fileInput.value = '';
}

/**
 * PWA SERVICE WORKER REGISTRATION
 */
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        const sw = "self.addEventListener('fetch', () => {});";
        const swBlob = new Blob([sw], { type: 'application/javascript' });
        navigator.serviceWorker.register(URL.createObjectURL(swBlob)).catch(e => console.log(e));
    }
}

/**
 * PERSISTENCE SYSTEM (AUTO-SAVE/LOAD)
 */
function setupAutoSave() {
    // Collect all inputs, selects, and textareas
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('input', () => saveToLocal());
        input.addEventListener('change', () => saveToLocal());
    });

    // Special case for custom visibility buttons
    const originalToggleFieldVisibility = window.toggleFieldVisibility;
    window.toggleFieldVisibility = (fieldId) => {
        originalToggleFieldVisibility(fieldId);
        saveToLocal();
    };

    const originalToggleProjectField = window.toggleProjectField;
    window.toggleProjectField = (fieldId) => {
        originalToggleProjectField(fieldId);
        saveToLocal();
    };
}

function saveToLocal() {
    const data = {
        inputs: {},
        fieldVisibility: fieldVisibility,
        projectFieldVisibility: projectFieldVisibility,
        images: {
            univ: document.getElementById('p-univ').src,
            coll: document.getElementById('p-coll').src,
            bg: document.getElementById('bg-image-preview').src
        }
    };

    // Save all named inputs
    document.querySelectorAll('input[id], select[id], textarea[id]').forEach(el => {
        if (el.type === 'checkbox') {
            data.inputs[el.id] = el.checked;
        } else {
            data.inputs[el.id] = el.value;
        }
    });

    localStorage.setItem('a4PageBuilderData', JSON.stringify(data));
}

function loadFromLocal() {
    const raw = localStorage.getItem('a4PageBuilderData');
    if (!raw) return;

    try {
        const data = JSON.parse(raw);
        
        // Restore Inputs
        if (data.inputs) {
            Object.keys(data.inputs).forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    if (el.type === 'checkbox') {
                        el.checked = data.inputs[id];
                        el.dispatchEvent(new Event('change'));
                    } else {
                        el.value = data.inputs[id];
                        el.dispatchEvent(new Event('input'));
                    }
                }
            });
        }

        // Restore Visibility Status
        if (data.fieldVisibility) {
            Object.keys(data.fieldVisibility).forEach(id => {
                // If visibility differs from default, toggle it
                if (data.fieldVisibility[id] !== fieldVisibility[id]) {
                    toggleFieldVisibility(id);
                }
            });
        }
        if (data.projectFieldVisibility) {
            Object.keys(data.projectFieldVisibility).forEach(id => {
                if (data.projectFieldVisibility[id] !== projectFieldVisibility[id]) {
                    toggleProjectField(id);
                }
            });
        }

        // Restore Images
        if (data.images) {
            if (data.images.univ) {
                document.getElementById('p-univ').src = data.images.univ;
                document.getElementById('img-univ').src = data.images.univ;
            }
            if (data.images.coll) {
                document.getElementById('p-coll').src = data.images.coll;
                document.getElementById('img-coll').src = data.images.coll;
            }
            if (data.images.bg && data.images.bg.startsWith('data:')) {
                document.getElementById('bg-image-preview').src = data.images.bg;
                document.getElementById('bg-image-preview').classList.remove('hidden');
                document.getElementById('bg-image-text').classList.add('hidden');
                document.getElementById('page-content').style.backgroundImage = `url(${data.images.bg})`;
                document.getElementById('page-content').style.backgroundSize = 'cover';
            }
        }

        // Trigger updates
        changeBorderStyle();
        updateBorderColor();
        updateBackground();
        updatePositions();
        updateArc();
        ['univ', 'coll', 'header', 'topic', 'session'].forEach(id => updateTextStyle(id));
        ['name', 'sem', 'course', 'roll', 'uni-roll', 'reg'].forEach(id => updateFieldLabel(id));

    } catch (e) {
        console.error("Load failed", e);
    }
}

/**
 * EXIT HANDLING
 */
let lastBackPress = 0;
function setupExitHandling() {
    history.pushState({ page: 'exit-wait' }, '', window.location.href);

    window.addEventListener('popstate', () => {
        const now = Date.now();
        saveToLocal();

        if (now - lastBackPress < 2000) {
            setTimeout(() => {
                window.close();
                window.location.href = "about:blank";
            }, 300);
        } else {
            lastBackPress = now;
            alert("Press BACK again to exit app"); // Using alert as fallback for Toast if not implemented
            history.pushState({ page: 'exit-wait' }, '', window.location.href);
        }
    });
}

/**
 * ENHANCED SETUP
 */
function initializeApp() {
    setupApp();
    setupSectionToggles();
    setupLogoToggles();
    updatePositions();
    registerServiceWorker();

    // Delay start for responsive scale to ensure DOM info is correct
    setTimeout(responsiveScale, 100);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeApp);

