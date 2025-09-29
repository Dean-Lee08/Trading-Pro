/* AUTO-GENERATED: extracted from original 4.html
   filename: js/notes.js
*/

// Notes section functions

        // Notes section functions
        function showNotesSection(section) {

// 노트 작성/편집 중인지 확인
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

// 노트 목록 새로고침
            
            // 노트 목록 새로고침
            setTimeout(() => {
                renderNotesList(section);
            }, 10);
        }

// Enhanced Notes functions with categories

        // Enhanced Notes functions with categories
        function showNoteEditor() {

// Create new note
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

// 노트 목록 새로 렌더링
    
    // 노트 목록 새로 렌더링
    setTimeout(() => {
        renderNotesList(currentNotesSection);
    }, 10);
}

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
    
    // 고정된 노트와 일반 노트 분리
    const pinnedNotes = categoryNotes.filter(note => note.pinned);
    const regularNotes = categoryNotes.filter(note => !note.pinned);

// 고정된 노트는 업데이트 시간순, 일반 노트는 생성 시간순 정렬
    
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
        
        const preview = note.content.replace(/<[^>]*>/g, '');
        const previewText = preview.length > 150 ? preview.substring(0, 150) + '...' : preview;

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
                <div class="note-item-preview" id="preview-${uniqueId}" style="color: ${note.textColor || '#94a3b8'}; font-family: ${note.font || "'Inter', sans-serif"};">${previewText}</div>
                <button class="expand-btn" data-note-id="${note.id}" data-category="${category}" onclick="event.stopPropagation(); toggleNotePreview(this)">${currentLanguage === 'ko' ? '더보기' : 'Show more'}</button>
                <div class="note-item-actions">
                    <button class="action-btn" onclick="event.stopPropagation(); editNote(${note.id})" title="Edit note">✏️</button>
                    <button class="action-btn" onclick="event.stopPropagation(); deleteNote(${note.id})" title="Delete note">🗑️</button>
                </div>
            </div>
        `;
    }).join('');
}

        function saveNotes() {
            try {
                localStorage.setItem('tradingPlatformNotes', JSON.stringify(notes));
            } catch (error) {
                console.error('Error saving notes:', error);
            }
        }

        function toggleNotePreview(buttonElement) {
    const noteId = parseInt(buttonElement.getAttribute('data-note-id'));
    const category = buttonElement.getAttribute('data-category');
    const uniqueId = `${noteId}_${category}`;
    
    const previewElement = document.getElementById(`preview-${uniqueId}`);
    const note = notes.find(n => n.id === noteId);
    
    if (!previewElement || !note) return;
    
    if (previewElement.classList.contains('expanded')) {

// Ensure all trades have notes property and shares property
                    // Ensure all trades have notes property and shares property
                    trades = trades.map(trade => ({
                        ...trade,
                        notes: trade.notes || '',
                        shares: trade.shares || (trade.amount && trade.buyPrice ? Math.round(trade.amount / trade.buyPrice) : 0),
                        amount: trade.amount || (trade.shares && trade.buyPrice ? trade.shares * trade.buyPrice : 0)
                    }));
                } else {
                    trades = [];
                }
            } catch (error) {
                console.error('Error loading trades:', error);
                trades = [];
                alert('Failed to load saved data.');
            }
        }
