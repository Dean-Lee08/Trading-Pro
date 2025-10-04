// ============================================
// notes.js - Notes Management
// ============================================

// ============================================
// HTML Sanitization Helper
// ============================================

/**
 * 기본적인 HTML 태그만 허용하고 위험한 속성 제거
 */
function sanitizeHTML(html) {
    if (!html) return '';

    // 허용되는 안전한 태그 목록
    const allowedTags = ['b', 'i', 'u', 'strong', 'em', 'br', 'p', 'div', 'span'];
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    // 모든 요소를 순회하며 허용되지 않은 태그와 속성 제거
    const allElements = tempDiv.querySelectorAll('*');
    allElements.forEach(element => {
        // 허용되지 않은 태그 제거
        if (!allowedTags.includes(element.tagName.toLowerCase())) {
            element.replaceWith(element.textContent);
            return;
        }

        // style 속성만 허용하고 나머지 속성 제거
        const attributes = Array.from(element.attributes);
        attributes.forEach(attr => {
            if (attr.name !== 'style') {
                element.removeAttribute(attr.name);
            }
        });
    });

    return tempDiv.innerHTML;
}

// ============================================
// Notes Section Navigation
// ============================================

function showNotesSection(section, clickedElement) {
    // 노트 작성/편집 중인지 확인
    const noteEditor = document.getElementById('noteEditor');
    const isEditing = noteEditor.style.display === 'block';

    if (isEditing) {
        const title = document.getElementById('noteTitle').value.trim();
        const content = document.getElementById('noteContentEditor').innerHTML.trim();

        if (title || content) {
            const confirmMessage = currentLanguage === 'ko' ?
                '작성 중인 노트가 있습니다. 저장하지 않고 이동하시겠습니까?' :
                'You have unsaved note content. Do you want to leave without saving?';

            if (!confirm(confirmMessage)) {
                return;
            }
        }
    }

    // 모든 상태 초기화
    currentNotesSection = section;
    currentViewingNoteId = null;
    editingNoteId = null;

    // 에디터와 뷰모드 숨기기
    document.getElementById('noteEditor').style.display = 'none';
    document.getElementById('noteViewMode').style.display = 'none';

    // 탭 상태 업데이트
    document.querySelectorAll('.notes-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    if (clickedElement) {
        clickedElement.classList.add('active');
    }

    // 모든 섹션 숨기기
    document.querySelectorAll('.note-section').forEach(noteSection => {
        noteSection.classList.remove('active');
        noteSection.style.display = 'none';
    });

    // 선택된 섹션만 표시
    const targetSection = document.getElementById(`${section}NotesSection`);
    if (targetSection) {
        targetSection.classList.add('active');
        targetSection.style.display = 'block';
    }

    // 노트 목록 새로고침
    setTimeout(() => {
        renderNotesList(section);
    }, 10);
}

// ============================================
// Note Formatting Functions
// ============================================

function toggleBold() {
    document.execCommand('bold');
    document.querySelector('[onclick="toggleBold()"]').classList.toggle('active');
}

function toggleItalic() {
    document.execCommand('italic');
    document.querySelector('[onclick="toggleItalic()"]').classList.toggle('active');
}

function toggleUnderline() {
    document.execCommand('underline');
    document.querySelector('[onclick="toggleUnderline()"]').classList.toggle('active');
}

function changeFont() {
    const font = document.getElementById('fontSelector').value;
    currentFont = font;
    document.getElementById('noteContentEditor').style.fontFamily = font;
    document.execCommand('fontName', false, font);
}

function changeTextColor(color) {
    currentTextColor = color;
    document.querySelectorAll('.color-option').forEach(option => {
        option.classList.remove('active');
    });
    
    // 색상 매핑 객체를 사용한 올바른 활성화
    const colorMap = {
        '#e4e4e7': 'rgb(228, 228, 231)',
        '#10b981': 'rgb(16, 185, 129)',
        '#ef4444': 'rgb(239, 68, 68)',
        '#3b82f6': 'rgb(59, 130, 246)',
        '#f59e0b': 'rgb(245, 158, 11)',
        '#8b5cf6': 'rgb(139, 92, 246)'
    };
    
    document.querySelectorAll('.color-option').forEach(option => {
        if (colorMap[color] === option.style.backgroundColor) {
            option.classList.add('active');
        }
    });

    const selection = window.getSelection();
    
    if (selection.rangeCount > 0 && selection.toString().trim().length > 0) {
        document.execCommand('styleWithCSS', false, true);
        document.execCommand('foreColor', false, color);
        return;
    }
    
    const editor = document.getElementById('noteContentEditor');
    editor.style.color = color;
}

// ============================================
// Note Editor Functions
// ============================================

function showNoteEditor() {
    // 기존 내용이 있는지 확인
    const noteEditor = document.getElementById('noteEditor');
    const isCurrentlyEditing = noteEditor.style.display === 'block';
    
    if (isCurrentlyEditing) {
        const title = document.getElementById('noteTitle').value.trim();
        const content = document.getElementById('noteContentEditor').innerHTML.trim();
        
        if (title || content) {
            const confirmMessage = currentLanguage === 'ko' ? 
                '작성 중인 노트가 있습니다. 새 노트를 시작하시겠습니까?' : 
                'You have unsaved content. Start a new note?';
            
            if (!confirm(confirmMessage)) {
                return;
            }
        }
    }

    editingNoteId = null;
    currentFont = "'Inter', sans-serif";
    currentTextColor = '#e4e4e7';
    
    document.getElementById('noteTitle').value = '';
    document.getElementById('noteContentEditor').innerHTML = '';
    document.getElementById('noteContentEditor').style.fontFamily = currentFont;
    document.getElementById('noteContentEditor').style.color = currentTextColor;
    document.getElementById('fontSelector').value = currentFont;
    
    // 색상 옵션 초기화
    document.querySelectorAll('.color-option').forEach(option => {
        option.classList.remove('active');
    });
    const defaultColorOption = document.querySelector('.color-option[style*="228, 228, 231"]');
    if (defaultColorOption) {
        defaultColorOption.classList.add('active');
    }
    
    document.getElementById('noteEditor').style.display = 'block';
    document.getElementById('noteViewMode').style.display = 'none';
    document.querySelectorAll('.note-section').forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById('noteTitle').focus();
}

function editNote(noteId) {
    const note = notes.find(n => n.id === noteId);
    if (note) {
        editingNoteId = noteId;
        currentTextColor = note.textColor || '#e4e4e7';
        currentFont = note.font || "'Inter', sans-serif";
        
        document.getElementById('noteTitle').value = note.title;
        document.getElementById('noteContentEditor').innerHTML = note.content;
        document.getElementById('noteContentEditor').style.fontFamily = currentFont;
        document.getElementById('noteContentEditor').style.color = currentTextColor;
        document.getElementById('fontSelector').value = currentFont;
        
        // 색상 옵션 업데이트
        document.querySelectorAll('.color-option').forEach(option => {
            option.classList.remove('active');
        });
        
        // 현재 색상에 맞는 옵션 선택
        const colorMap = {
            '#e4e4e7': 'rgb(228, 228, 231)',
            '#10b981': 'rgb(16, 185, 129)',
            '#ef4444': 'rgb(239, 68, 68)',
            '#3b82f6': 'rgb(59, 130, 246)',
            '#f59e0b': 'rgb(245, 158, 11)',
            '#8b5cf6': 'rgb(139, 92, 246)'
        };
        
        document.querySelectorAll('.color-option').forEach(option => {
            if (colorMap[currentTextColor] === option.style.backgroundColor) {
                option.classList.add('active');
            }
        });
        
        document.getElementById('noteEditor').style.display = 'block';
        document.getElementById('noteViewMode').style.display = 'none';
        document.querySelectorAll('.note-section').forEach(section => {
            section.style.display = 'none';
        });
        document.getElementById('noteTitle').focus();
    }
}

function deleteNote(noteId) {
    if (confirm(currentLanguage === 'ko' ? '이 노트를 삭제하시겠습니까?' : 'Are you sure you want to delete this note?')) {
        notes = notes.filter(note => note.id !== noteId);
        saveNotes();
        renderAllNotesSections();
        showToast(currentLanguage === 'ko' ? '노트가 삭제되었습니다' : 'Note deleted');
    }
}

function saveNote() {
    const title = document.getElementById('noteTitle').value.trim();
    const content = document.getElementById('noteContentEditor').innerHTML.trim();
    
    if (!title || !content) {
        alert(currentLanguage === 'ko' ? '제목과 내용을 모두 입력해주세요.' : 'Please enter both title and content.');
        return;
    }

    const now = new Date();
    
    if (editingNoteId) {
        // Update existing note
        const noteIndex = notes.findIndex(n => n.id === editingNoteId);
        if (noteIndex !== -1) {
            notes[noteIndex] = {
                ...notes[noteIndex],
                title: title,
                content: content,
                font: currentFont,
                textColor: currentTextColor,
                updatedAt: now.toISOString()
            };
        }
    } else {
        // Create new note
        const actualCategory = currentNotesSection === 'all' ? 'general' : currentNotesSection;
        const newNote = {
            id: Date.now(),
            title: title,
            content: content,
            font: currentFont,
            textColor: currentTextColor,
            category: actualCategory,
            pinned: false,
            createdAt: now.toISOString(),
            updatedAt: now.toISOString()
        };
        notes.unshift(newNote);
    }

    saveNotes();
    cancelNote();
    renderAllNotesSections();
    showToast(editingNoteId ? 
        (currentLanguage === 'ko' ? '노트가 업데이트되었습니다' : 'Note updated') :
        (currentLanguage === 'ko' ? '노트가 저장되었습니다' : 'Note saved')
    );
}

function cancelNote() {
    editingNoteId = null;
    currentViewingNoteId = null;
    
    document.getElementById('noteEditor').style.display = 'none';
    document.getElementById('noteViewMode').style.display = 'none';
    
    // 모든 섹션 숨기기 후 현재 카테고리만 표시
    document.querySelectorAll('.note-section').forEach(section => {
        section.style.display = 'none';
        section.classList.remove('active');
    });
    
    const targetSection = document.getElementById(`${currentNotesSection}NotesSection`);
    if (targetSection) {
        targetSection.style.display = 'block';
        targetSection.classList.add('active');
    }
    
    // 노트 목록 새로 렌더링
    setTimeout(() => {
        renderNotesList(currentNotesSection);
    }, 10);
}

// ============================================
// Note Rendering Functions
// ============================================

function renderAllNotesSections() {
    renderNotesList('all');
    renderNotesList('daily');
    renderNotesList('strategy');
    renderNotesList('general');
}

function renderNotesList(category) {
    let categoryNotes;
    if (category === 'all') {
        categoryNotes = notes;
    } else {
        categoryNotes = notes.filter(note => note.category === category);
    }
    
    // 고정된 노트와 일반 노트 분리
    const pinnedNotes = categoryNotes.filter(note => note.pinned);
    const regularNotes = categoryNotes.filter(note => !note.pinned);
    
    // 고정된 노트는 업데이트 시간순, 일반 노트는 생성 시간순 정렬
    pinnedNotes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    regularNotes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    const sortedNotes = [...pinnedNotes, ...regularNotes];
    
    const notesList = document.getElementById(`${category}NotesList`);
    
    if (sortedNotes.length === 0) {
        const emptyMessages = {
            all: currentLanguage === 'ko' ? '아직 작성된 노트가 없습니다. "새 노트"를 클릭하여 시작하세요.' : 'No notes written yet. Click "New Note" to start.',
            daily: currentLanguage === 'ko' ? '일일 리뷰 노트가 아직 없습니다. "새 노트"를 클릭하여 시작하세요.' : 'No daily review notes yet. Click "New Note" to start.',
            strategy: currentLanguage === 'ko' ? '전략 노트가 아직 없습니다. "새 노트"를 클릭하여 시작하세요.' : 'No strategy notes yet. Click "New Note" to start.',
            general: currentLanguage === 'ko' ? '일반 노트가 아직 없습니다. "새 노트"를 클릭하여 시작하세요.' : 'No general notes yet. Click "New Note" to start.'
        };
        
        notesList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📝</div>
                <div>${emptyMessages[category]}</div>
            </div>
        `;
        return;
    }

    notesList.innerHTML = sortedNotes.map(note => {
        const createdDate = new Date(note.createdAt);
        const formattedDate = createdDate.toLocaleDateString(currentLanguage === 'ko' ? 'ko-KR' : 'en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        // Sanitize and create preview
        const sanitizedContent = sanitizeHTML(note.content);
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = sanitizedContent;
        const textContent = tempDiv.textContent || tempDiv.innerText || '';

        // 150자 넘으면 텍스트만, 안 넘으면 HTML 유지
        const previewHTML = textContent.length > 150 ?
            (textContent.substring(0, 150) + '...') :
            sanitizedContent;

        const categoryLabels = {
            daily: currentLanguage === 'ko' ? '일일 리뷰' : 'Daily Review',
            strategy: currentLanguage === 'ko' ? '전략' : 'Strategy',
            general: currentLanguage === 'ko' ? '일반' : 'General'
        };

        const pinnedClass = note.pinned ? 'note-item-pinned' : '';
        const pinnedIcon = note.pinned ? '📌 ' : '';
        const uniqueId = `${note.id}_${category}`;

        return `
            <div class="note-item ${pinnedClass}" onclick="viewNote(${note.id})">
                <div class="note-item-header">
                    <div>
                        <h3 class="note-item-title">${pinnedIcon}${note.title}</h3>
                        ${category === 'all' ? `<div class="note-item-category">${categoryLabels[note.category]}</div>` : ''}
                    </div>
                    <div class="note-item-header-right">
                        <span class="note-item-date">${formattedDate}</span>
                        <button class="pin-btn" onclick="event.stopPropagation(); togglePinNote(${note.id})" title="${note.pinned ? (currentLanguage === 'ko' ? '고정 해제' : 'Unpin') : (currentLanguage === 'ko' ? '상단 고정' : 'Pin to top')}">${note.pinned ? '📌' : '📌'}</button>
                    </div>
                </div>
                <div class="note-item-preview" id="preview-${uniqueId}" style="color: ${note.textColor || '#94a3b8'}; font-family: ${note.font || "'Inter', sans-serif"};">${previewHTML}</div>
                <button class="expand-btn" data-note-id="${note.id}" data-category="${category}" onclick="event.stopPropagation(); toggleNotePreview(this)">${currentLanguage === 'ko' ? '더보기' : 'Show more'}</button>
                <div class="note-item-actions">
                    <button class="action-btn" onclick="event.stopPropagation(); editNote(${note.id})" title="Edit note">✏️</button>
                    <button class="action-btn" onclick="event.stopPropagation(); deleteNote(${note.id})" title="Delete note">🗑️</button>
                </div>
            </div>
        `;
    }).join('');
}

function toggleNotePreview(buttonElement) {
    const noteId = parseInt(buttonElement.getAttribute('data-note-id'));
    const category = buttonElement.getAttribute('data-category');
    const uniqueId = `${noteId}_${category}`;

    const previewElement = document.getElementById(`preview-${uniqueId}`);
    const note = notes.find(n => n.id === noteId);

    if (!previewElement || !note) return;

    if (previewElement.classList.contains('expanded')) {
        // Collapse - show truncated HTML preview
        const sanitizedContent = sanitizeHTML(note.content);
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = sanitizedContent;
        const textContent = tempDiv.textContent || tempDiv.innerText || '';

        // 150자까지만 표시하되, HTML 구조 유지
        if (textContent.length > 150) {
            const truncated = textContent.substring(0, 150) + '...';
            previewElement.textContent = truncated;
        } else {
            previewElement.innerHTML = sanitizedContent;
        }

        previewElement.style.fontFamily = note.font || "'Inter', sans-serif";
        previewElement.style.color = note.textColor || '#94a3b8';
        previewElement.classList.remove('expanded');
        buttonElement.textContent = currentLanguage === 'ko' ? '더보기' : 'Show more';
    } else {
        // Expand - sanitize HTML before rendering
        previewElement.innerHTML = sanitizeHTML(note.content);
        previewElement.style.fontFamily = note.font || "'Inter', sans-serif";
        previewElement.style.color = note.textColor || '#94a3b8';
        previewElement.classList.add('expanded');
        buttonElement.textContent = currentLanguage === 'ko' ? '접기' : 'Show less';
    }
}

// ============================================
// Note View Mode Functions
// ============================================

function viewNote(noteId) {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;

    currentViewingNoteId = noteId;

    document.getElementById('noteViewTitle').textContent = note.title;
    // Sanitize HTML before rendering
    document.getElementById('noteViewContent').innerHTML = sanitizeHTML(note.content);

    // 폰트와 색상 적용
    const viewContent = document.getElementById('noteViewContent');
    viewContent.style.fontFamily = note.font || "'Inter', sans-serif";
    viewContent.style.color = note.textColor || '#e4e4e7';

    // Show view mode, hide other sections
    document.getElementById('noteViewMode').style.display = 'block';
    document.getElementById('noteEditor').style.display = 'none';
    document.querySelectorAll('.note-section').forEach(section => {
        section.style.display = 'none';
    });
}

function backToNotesList() {
    currentViewingNoteId = null;
    editingNoteId = null;
    
    document.getElementById('noteViewMode').style.display = 'none';
    document.getElementById('noteEditor').style.display = 'none';
    
    // 모든 섹션 숨기기
    document.querySelectorAll('.note-section').forEach(section => {
        section.style.display = 'none';
        section.classList.remove('active');
    });
    
    // 현재 카테고리 섹션만 표시
    const targetSection = document.getElementById(`${currentNotesSection}NotesSection`);
    if (targetSection) {
        targetSection.style.display = 'block';
        targetSection.classList.add('active');
    }
}

function editCurrentNote() {
    if (currentViewingNoteId) {
        editNote(currentViewingNoteId);
    }
}

// ============================================
// Note Pin/Unpin Function
// ============================================

function togglePinNote(noteId) {
    const noteIndex = notes.findIndex(n => n.id === noteId);
    if (noteIndex !== -1) {
        notes[noteIndex].pinned = !notes[noteIndex].pinned;
        saveNotes();
        renderAllNotesSections();
        
        const message = notes[noteIndex].pinned ? 
            (currentLanguage === 'ko' ? '노트가 상단에 고정되었습니다' : 'Note pinned to top') :
            (currentLanguage === 'ko' ? '노트 고정이 해제되었습니다' : 'Note unpinned');
        
        showToast(message);
    }
}
