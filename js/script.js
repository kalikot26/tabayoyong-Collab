// ================================================
// GLOBAL VARIABLES
// ================================================
const uploadModal = document.getElementById('uploadModal');
const modal = document.getElementById('editModal');
const uploadBtn = document.querySelector('.upload-btn');
const postDateInput = document.getElementById('postDate');
const uploadForm = document.getElementById('uploadForm');
let selectedPostAction = null; // store dito ung details

// ================================================
// INITIALIZATION
// ================================================
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupSearchFunctionality();
    setupProfileEdit();
    setupPostUpload();
    setupModalClickOutside();
}

// ================================================
// SEARCH FUNCTIONALITY
// logic ng search bar galing github hahah
// ================================================
function setupSearchFunctionality() {
    document.getElementById('searchInput').addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            searchPosts();
        }
    });
}

function searchPosts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const posts = document.querySelectorAll('.post-card');

    posts.forEach(post => {
        const title = post.querySelector('h3') ? post.querySelector('h3').textContent.toLowerCase() : '';
        const desc = post.querySelector('p') ? post.querySelector('p').textContent.toLowerCase() : '';
        const meta = post.querySelector('.post-meta') ? post.querySelector('.post-meta').textContent.toLowerCase() : '';

        const match = title.includes(searchTerm) || desc.includes(searchTerm) || meta.includes(searchTerm);
        post.style.display = match ? 'block' : 'none';
    });
}

// ================================================
// SECTION NAVIGATION
// ================================================
function showSection(id) {
    document.getElementById('sidebar-left').classList.remove('active');
    document.getElementById('content').classList.remove('active');
    document.getElementById('sidebar-right').classList.remove('active');

    document.getElementById(id).classList.add('active');
}

function goBack() {
    alert("dito niyo ilagay kung anong gagawin niyo sa go back, kung babalik ba sa last history or ihref niyo na lang ");
}

// ================================================
// PROFILE EDIT FUNCTIONALITY
// pag clinick ko ung edit profile, eto lalabas
// ================================================
function setupProfileEdit() {
    const editBtn = document.querySelector('.edit-btn');
    
    editBtn.addEventListener('click', () => {
        document.getElementById('editName').value = document.querySelector('.username').textContent;
        document.getElementById('editBio').value = document.querySelector('.bio').textContent.trim();
        modal.style.display = 'flex';
    });
}

function closeModal() {
    modal.style.display = 'none';
}

function saveProfile(event) {
    event.preventDefault();

    const newName = document.getElementById('editName').value;
    const newBio = document.getElementById('editBio').value;
    const newPicFile = document.getElementById('editPic').files[0];

    document.querySelector('.username').textContent = newName;
    document.querySelector('.bio').textContent = newBio;

    if (newPicFile) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.querySelector('.profile-pic').src = e.target.result;
        };
        reader.readAsDataURL(newPicFile);
    }

    closeModal();
}

// ================================================
// POST UPLOAD FUNCTIONALITY
// eto lalabas pag clinick mo ung upload
// ================================================
function setupPostUpload() {
    // eto ioopen ung upload na div (modal)
    uploadBtn.addEventListener('click', () => {
        // eto naman is wag na pakielaman, siya ung nagseset ng date today
        const today = new Date();
        postDateInput.value = today.toLocaleDateString();
        selectedPostAction = null;
        resetActionButtons();
        uploadModal.style.display = 'flex';
    });

    // eto naman ung naghahandle pag may request na bagong post
    uploadForm.addEventListener('submit', handlePostSubmit);
}

function closeUploadModal() {
    uploadModal.style.display = 'none';
    uploadForm.reset();
    resetActionButtons();
}

function handlePostSubmit(e) {
    e.preventDefault();

    const fileInput = document.getElementById('postPhoto');
    const title = document.getElementById('postTitle').value.trim();
    const desc = document.getElementById('postDesc').value.trim();
    const location = document.getElementById('postLocation').value.trim();
    const date = postDateInput.value;

    if (!fileInput.files[0]) {
        alert("Please upload a photo");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
        createPostCard(event.target.result, title, desc, location, date);
        // close ung modal tapos marereset din ung details
        closeUploadModal();
    };

    reader.readAsDataURL(fileInput.files[0]);
}

function createPostCard(imageSrc, title, desc, location, date) {
    // eto ung nasa main, postcard sya
    const postCard = document.createElement('div');
    postCard.className = 'post-card';

    postCard.innerHTML = `
        <div class="post-menu">
            <button class="post-menu-button">⋯</button>
            <div class="post-menu-dropdown">
                <button class="post-menu-item delete">Delete</button>
            </div>
        </div>
        <img src="${imageSrc}" alt="Post photo" />
        <h3>${escapeHtml(title)}</h3>
        <p>${escapeHtml(desc)}</p>
        <div class="post-meta">Location: ${escapeHtml(location)} | Date: ${escapeHtml(date)}</div>
        <div class="post-actions">
            <button class="retruth">Retruth</button>
            <button class="untruth">Untruth</button>
        </div>
        <div class="comments">
            <strong>Comments:</strong>
            <div class="comment-list"></div>
            <div class="add-comment">
                <input type="text" placeholder="Add a comment..." />
                <button>Add</button>
            </div>
        </div>
    `;

    setupPostCardEventListeners(postCard);
    // iaadd ung post mo sa newsfeed 
    document.getElementById('content').prepend(postCard);
}

function setupPostCardEventListeners(postCard) {
    //event listener(pag clinick) gagawin niya tong mga to
    const actions = postCard.querySelector('.post-actions');
    actions.querySelector('.retruth').addEventListener('click', () => alert('You clicked Retruth'));
    actions.querySelector('.untruth').addEventListener('click', () => alert('You clicked Untruth'));
    
    // Three-dot menu functionality
    setupThreeDotMenu(postCard);
    
    // eto naman ung logic sa comments
    setupComments(postCard);
}

function setupThreeDotMenu(postCard) {
    const menuButton = postCard.querySelector('.post-menu-button');
    const menuDropdown = postCard.querySelector('.post-menu-dropdown');
    const deleteButton = postCard.querySelector('.post-menu-item.delete');
    
    menuButton.addEventListener('click', (e) => {
        e.stopPropagation();
        // Close other open menus first
        document.querySelectorAll('.post-menu-dropdown.show').forEach(dropdown => {
            if (dropdown !== menuDropdown) {
                dropdown.classList.remove('show');
            }
        });
        menuDropdown.classList.toggle('show');
    });
    
    deleteButton.addEventListener('click', () => {
        showDeleteConfirmation(postCard);
        // Close the three-dot menu
        menuDropdown.classList.remove('show');
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!menuButton.contains(e.target) && !menuDropdown.contains(e.target)) {
            menuDropdown.classList.remove('show');
        }
    });
}

function showDeleteConfirmation(postCard) {
    // Show the custom delete popup
    const deletePopup = document.getElementById('deletePopupOverlay');
    deletePopup.style.display = 'flex';
    
    // Set up the popup buttons for this specific post
    const confirmBtn = document.getElementById('deleteConfirmBtn');
    const cancelBtn = document.getElementById('deleteCancelBtn');
    
    // Remove any existing event listeners by cloning the buttons
    const newConfirmBtn = confirmBtn.cloneNode(true);
    const newCancelBtn = cancelBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
    
    // Add new event listeners for this specific post
    newConfirmBtn.addEventListener('click', () => {
        postCard.remove();
        deletePopup.style.display = 'none';
    });
    
    newCancelBtn.addEventListener('click', () => {
        deletePopup.style.display = 'none';
    });
}

function setupComments(postCard) {
    const commentList = postCard.querySelector('.comment-list');
    const commentInput = postCard.querySelector('.add-comment input');
    const commentBtn = postCard.querySelector('.add-comment button');

    commentBtn.addEventListener('click', () => {
        const commentText = commentInput.value.trim();
        if (!commentText) return;
        
        // Get current user info from profile section
        const currentUserName = document.querySelector('.username').textContent;
        const currentUserPic = document.querySelector('.profile-pic').src;
        
        // Create comment with profile info
        const commentEl = document.createElement('div');
        commentEl.className = 'comment';
        commentEl.innerHTML = `
            <div class="comment-header">
                <img src="${currentUserPic}" alt="Profile" class="comment-profile-pic" />
                <span class="comment-username">${escapeHtml(currentUserName)}</span>
                <span class="comment-time">${getTimeAgo()}</span>
            </div>
            <div class="comment-text">${escapeHtml(commentText)}</div>
        `;
        
        commentList.appendChild(commentEl);
        commentInput.value = '';
    });
}

// Helper function para sa timestamp ng comments
function getTimeAgo() {
    const now = new Date();
    return "now"; // pwede mo palitan to ng mas detailed time formatting
}

// ================================================
// UTILITY FUNCTIONS
// ================================================

// minsan may xss na nagleleak, eto ung code para miawasan yon
function escapeHtml(text) {
    return text.replace(/[&<>"']/g, function(m) {
        return ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        })[m];
    });
}

function resetActionButtons() {
    const actionButtons = document.querySelectorAll('.post-action-btn');
    actionButtons.forEach(btn => btn.classList.remove('selected'));
    selectedPostAction = null;
}

function setupModalClickOutside() {
    //tanggalin niyo na lang to if ayaw niyo na pag pinindot ko ung blank spaces, mawawala ung pop up (modal)
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Upload modal click outside
    window.addEventListener('click', function(e) {
        if (e.target === uploadModal) {
            closeUploadModal();
        }
    });
}
