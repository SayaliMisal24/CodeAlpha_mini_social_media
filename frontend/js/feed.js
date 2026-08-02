// ============================================
// FEED PAGE LOGIC
// ============================================

requireAuth(); // redirect to login if not logged in
renderNavbar();

const postsContainer = document.getElementById('postsContainer');
const loadingSpinner = document.getElementById('loadingSpinner');
const createPostForm = document.getElementById('createPostForm');
const postBtn = document.getElementById('postBtn');
const currentUser = getUser();

// ----- Format date nicely (e.g. "2 hours ago") -----
function timeAgo(dateString) {
  const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// ----- Build the HTML for a single post -----
function renderPostCard(post) {
  const isLiked = post.likes.includes(currentUser.id);
  const profileImg = post.userId.profileImage
    ? `images/${post.userId.profileImage}`
    : 'https://via.placeholder.com/44';

  const commentsHTML = post.comments
    .map(
      (c) => `
      <div class="comment-item">
        <strong>${c.userId.username}</strong>${c.comment}
      </div>
    `
    )
    .join('');

  return `
    <div class="card" data-post-id="${post._id}">
      <div class="post-header">
        <img src="${profileImg}" alt="${post.userId.username}" />
        <div class="post-user-info">
  <a href="${post.userId._id === currentUser.id ? 'profile.html' : 'view-profile.html?id=' + post.userId._id}" class="post-username" style="color: var(--text-dark);">${post.userId.username}</a>
  <span class="post-date">${timeAgo(post.createdAt)}</span>
</div>

      ${post.caption ? `<p class="post-caption">${post.caption}</p>` : ''}
      ${post.image ? `<img src="images/${post.image}" class="post-image" alt="Post image" />` : ''}

      <div class="post-actions">
        <button class="btn-icon like-btn ${isLiked ? 'liked' : ''}" data-id="${post._id}">
          ${isLiked ? '❤️' : '🤍'} <span class="like-count">${post.likes.length}</span>
        </button>
        <button class="btn-icon comment-toggle-btn" data-id="${post._id}">
          💬 <span>${post.comments.length}</span>
        </button>
      </div>

      <div class="comments-section" style="display: none;" id="comments-${post._id}">
        <div class="comment-list">${commentsHTML}</div>
        <div class="comment-input-row">
          <input type="text" placeholder="Write a comment..." class="comment-input" data-id="${post._id}" />
        </div>
      </div>
    </div>
  `;
}

// ----- Fetch all posts from backend -----
async function loadPosts() {
  loadingSpinner.style.display = 'block';
  postsContainer.innerHTML = '';

  try {
    const response = await fetch(`${API_BASE_URL}/posts`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const posts = await response.json();

    loadingSpinner.style.display = 'none';

    if (posts.length === 0) {
      postsContainer.innerHTML = `
        <div class="empty-state">
          <h3>No posts yet</h3>
          <p>Be the first to share something!</p>
        </div>
      `;
      return;
    }

    postsContainer.innerHTML = posts.map(renderPostCard).join('');
    attachPostEventListeners();
  } catch (error) {
    loadingSpinner.style.display = 'none';
    showToast('Failed to load posts', 'error');
  }
}

// ----- Attach click events to like/comment buttons (run after every render) -----
function attachPostEventListeners() {
  document.querySelectorAll('.like-btn').forEach((btn) => {
    btn.addEventListener('click', () => toggleLike(btn.dataset.id));
  });

  document.querySelectorAll('.comment-toggle-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const section = document.getElementById(`comments-${btn.dataset.id}`);
      section.style.display = section.style.display === 'none' ? 'block' : 'none';
    });
  });

  document.querySelectorAll('.comment-input').forEach((input) => {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && input.value.trim() !== '') {
        addComment(input.dataset.id, input.value.trim());
        input.value = '';
      }
    });
  });
}

// ----- Like/unlike a post -----
async function toggleLike(postId) {
  try {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/like`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!response.ok) throw new Error();
    loadPosts(); // reload feed to reflect the new like count
  } catch (error) {
    showToast('Failed to like post', 'error');
  }
}

// ----- Add a comment -----
async function addComment(postId, comment) {
  try {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/comment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ comment }),
    });
    if (!response.ok) throw new Error();
    loadPosts();
  } catch (error) {
    showToast('Failed to add comment', 'error');
  }
}

// ----- Create a new post -----
createPostForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const caption = document.getElementById('captionInput').value.trim();
  const imageFile = document.getElementById('imageInput').files[0];

  if (!caption && !imageFile) {
    showToast('Write something or add a photo first', 'error');
    return;
  }

  postBtn.disabled = true;
  postBtn.textContent = 'Posting...';

  try {
    // FormData lets us send both text AND a file together
    const formData = new FormData();
    formData.append('caption', caption);
    if (imageFile) formData.append('image', imageFile);

    const response = await fetch(`${API_BASE_URL}/posts`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${getToken()}` }, // NOTE: no Content-Type here - browser sets it automatically for FormData
      body: formData,
    });

    if (!response.ok) throw new Error();

    document.getElementById('captionInput').value = '';
    document.getElementById('imageInput').value = '';
    showToast('Post created!', 'success');
    loadPosts();
  } catch (error) {
    showToast('Failed to create post', 'error');
  } finally {
    postBtn.disabled = false;
    postBtn.textContent = 'Post';
  }
});

// ----- Load posts when the page opens -----
loadPosts();