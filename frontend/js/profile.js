// ============================================
// PROFILE PAGE LOGIC
// ============================================

requireAuth();
renderNavbar();

const currentUser = getUser();

const profileImage = document.getElementById('profileImage');
const profileName = document.getElementById('profileName');
const profileUsername = document.getElementById('profileUsername');
const profileBio = document.getElementById('profileBio');
const postsCount = document.getElementById('postsCount');
const followersCount = document.getElementById('followersCount');
const followingCount = document.getElementById('followingCount');

const editProfileBtn = document.getElementById('editProfileBtn');
const editProfileCard = document.getElementById('editProfileCard');
const editProfileForm = document.getElementById('editProfileForm');
const editName = document.getElementById('editName');
const editBio = document.getElementById('editBio');
const saveProfileBtn = document.getElementById('saveProfileBtn');

const loadingSpinner = document.getElementById('loadingSpinner');
const myPostsContainer = document.getElementById('myPostsContainer');

// ----- Load profile info from backend -----
async function loadProfile() {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const user = await response.json();

    if (!response.ok) throw new Error();

    // Fill in the profile card
    profileImage.src = user.profileImage
  ? `images/${user.profileImage}`
  : `https://ui-avatars.com/api/?background=a855f7&color=fff&size=100&name=${encodeURIComponent(user.username)}`;
    profileName.textContent = user.name;
    profileUsername.textContent = `@${user.username}`;
    profileBio.textContent = user.bio || 'No bio yet';
    followersCount.textContent = user.followers.length;
    followingCount.textContent = user.following.length;

    // Pre-fill the edit form
    editName.value = user.name;
    editBio.value = user.bio || '';

    // Update localStorage in case name/bio changed since login
    saveUser({ ...currentUser, name: user.name, bio: user.bio });
  } catch (error) {
    showToast('Failed to load profile', 'error');
  }
}

// ----- Load this user's own posts -----
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

function renderMyPostCard(post) {
  return `
    <div class="card">
      <div class="post-header">
        <img src="${profileImage.src}" alt="${currentUser.username}" />
        <div class="post-user-info">
          <span class="post-username">${currentUser.username}</span>
          <span class="post-date">${timeAgo(post.createdAt)}</span>
        </div>
      </div>
      ${post.caption ? `<p class="post-caption">${post.caption}</p>` : ''}
      ${post.image ? `<img src="images/${post.image}" class="post-image" alt="Post image" />` : ''}
      <div class="post-actions">
        <span class="btn-icon">❤️ ${post.likes.length}</span>
        <span class="btn-icon">💬 ${post.comments.length}</span>
        <button class="btn-danger delete-post-btn" data-id="${post._id}" style="margin-left: auto;">🗑️ Delete</button>
      </div>
    </div>
  `;
}

async function loadMyPosts() {
  loadingSpinner.style.display = 'block';
  try {
    const response = await fetch(`${API_BASE_URL}/posts`, {
  headers: { Authorization: `Bearer ${getToken()}` },
  cache: 'no-store', // always get fresh data, never a cached 304 response
});
    const allPosts = await response.json();

    // Filter to only this user's own posts
    const myPosts = allPosts.filter((post) => post.userId._id === currentUser.id);

    loadingSpinner.style.display = 'none';
    postsCount.textContent = myPosts.length;

    if (myPosts.length === 0) {
      myPostsContainer.innerHTML = `
        <div class="empty-state">
          <h3>No posts yet</h3>
          <p>Your posts will show up here</p>
        </div>
      `;
      return;
    }

    myPostsContainer.innerHTML = myPosts.map(renderMyPostCard).join('');

    // Attach delete button events
    document.querySelectorAll('.delete-post-btn').forEach((btn) => {
      btn.addEventListener('click', () => deletePost(btn.dataset.id));
    });
  } catch (error) {
    loadingSpinner.style.display = 'none';
    showToast('Failed to load your posts', 'error');
  }
}

// ----- Delete a post -----
async function deletePost(postId) {
  if (!confirm('Are you sure you want to delete this post?')) return;

  try {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!response.ok) throw new Error();

    showToast('Post deleted', 'success');
    loadMyPosts();
  } catch (error) {
    showToast('Failed to delete post', 'error');
  }
}

// ----- Toggle edit profile form -----
editProfileBtn.addEventListener('click', () => {
  editProfileCard.style.display =
    editProfileCard.style.display === 'none' ? 'block' : 'none';
});

// ----- Save profile edits -----
editProfileForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = editName.value.trim();
  const bio = editBio.value.trim();

  if (!name) {
    showToast('Name cannot be empty', 'error');
    return;
  }

  saveProfileBtn.disabled = true;
  saveProfileBtn.textContent = 'Saving...';

  try {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ name, bio }),
    });

    if (!response.ok) throw new Error();

    showToast('Profile updated!', 'success');
    editProfileCard.style.display = 'none';
    loadProfile();
  } catch (error) {
    showToast('Failed to update profile', 'error');
  } finally {
    saveProfileBtn.disabled = false;
    saveProfileBtn.textContent = 'Save Changes';
  }
});

// ----- Load everything when the page opens -----
loadProfile();
loadMyPosts();
// ----- Followers/Following Modal -----
const listModal = document.getElementById('listModal');
const modalTitle = document.getElementById('modalTitle');
const modalList = document.getElementById('modalList');
const modalCloseBtn = document.getElementById('modalCloseBtn');

async function openListModal(type) {
  modalTitle.textContent = type === 'followers' ? 'Followers' : 'Following';
  modalList.innerHTML = '<div class="spinner" style="margin: 20px auto;"></div>';
  listModal.classList.add('active');

  try {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const user = await response.json();
    const list = type === 'followers' ? user.followers : user.following;

    if (list.length === 0) {
      modalList.innerHTML = `<p style="color: var(--text-gray); text-align: center; padding: 20px 0;">No ${type} yet</p>`;
      return;
    }

    modalList.innerHTML = list
      .map(
        (u) => `
        <div class="modal-user-item">
          <img src="${u.profileImage ? 'images/' + u.profileImage : 'https://via.placeholder.com/40'}" />
          <a href="view-profile.html?id=${u._id}">@${u.username}</a>
        </div>
      `
      )
      .join('');
  } catch (error) {
    modalList.innerHTML = '<p style="color: var(--danger);">Failed to load</p>';
  }
}

document.getElementById('followersStat').addEventListener('click', () => openListModal('followers'));
document.getElementById('followingStat').addEventListener('click', () => openListModal('following'));
modalCloseBtn.addEventListener('click', () => listModal.classList.remove('active'));
listModal.addEventListener('click', (e) => {
  if (e.target === listModal) listModal.classList.remove('active');
});
// ----- Create Post (from Profile page) -----
const createPostFormProfile = document.getElementById('createPostFormProfile');
const postBtnProfile = document.getElementById('postBtnProfile');

createPostFormProfile.addEventListener('submit', async (e) => {
  e.preventDefault();

  const caption = document.getElementById('captionInputProfile').value.trim();
  const imageFile = document.getElementById('imageInputProfile').files[0];

  if (!caption && !imageFile) {
    showToast('Write something or add a photo first', 'error');
    return;
  }

  postBtnProfile.disabled = true;
  postBtnProfile.textContent = 'Posting...';

  try {
    const formData = new FormData();
    formData.append('caption', caption);
    if (imageFile) formData.append('image', imageFile);

    const response = await fetch(`${API_BASE_URL}/posts`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${getToken()}` },
      body: formData,
    });

    if (!response.ok) throw new Error();

    document.getElementById('captionInputProfile').value = '';
    document.getElementById('imageInputProfile').value = '';
    showToast('Post created!', 'success');
    loadMyPosts(); // refresh "My Posts" list below
  } catch (error) {
    showToast('Failed to create post', 'error');
  } finally {
    postBtnProfile.disabled = false;
    postBtnProfile.textContent = 'Post';
  }
});
// ----- Profile Photo Upload -----
const profilePhotoInput = document.getElementById('profilePhotoInput');
const profilePhotoWrapper = document.querySelector('.profile-photo-wrapper');

profilePhotoInput.addEventListener('change', async () => {
  const file = profilePhotoInput.files[0];
  if (!file) return;

  // Basic validation
  if (!file.type.startsWith('image/')) {
    showToast('Please select an image file', 'error');
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    showToast('Image must be under 5MB', 'error');
    return;
  }

  profilePhotoWrapper.classList.add('uploading');

  try {
    const formData = new FormData();
    formData.append('profileImage', file);

    const response = await fetch(`${API_BASE_URL}/auth/profile/photo`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${getToken()}` },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Upload failed');
    }

    // Update the image immediately on screen
    profileImage.src = `images/${data.profileImage}?t=${Date.now()}`; // cache-busting

    // Update saved user info so navbar/other pages reflect it too
    const updatedUser = { ...getUser(), profileImage: data.profileImage };
    saveUser(updatedUser);

    showToast('Profile photo updated!', 'success');
  } catch (error) {
    showToast(error.message || 'Failed to upload photo', 'error');
  } finally {
    profilePhotoWrapper.classList.remove('uploading');
    profilePhotoInput.value = ''; // reset so selecting the same file again still triggers change
  }
});