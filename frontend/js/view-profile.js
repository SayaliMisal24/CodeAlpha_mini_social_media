// ============================================
// VIEW OTHER USER'S PROFILE LOGIC
// ============================================

requireAuth();
renderNavbar();

const currentUser = getUser();

// Get the user ID from the URL, e.g. view-profile.html?id=123
const urlParams = new URLSearchParams(window.location.search);
const profileUserId = urlParams.get('id');

// If someone lands here without an ID, or tries to view their own profile this way, redirect
if (!profileUserId) {
  window.location.href = 'feed.html';
}
if (profileUserId === currentUser.id) {
  window.location.href = 'profile.html';
}

const profileImage = document.getElementById('profileImage');
const profileName = document.getElementById('profileName');
const profileUsername = document.getElementById('profileUsername');
const profileBio = document.getElementById('profileBio');
const postsCount = document.getElementById('postsCount');
const followersCount = document.getElementById('followersCount');
const followingCount = document.getElementById('followingCount');
const followBtn = document.getElementById('followBtn');
const loadingSpinner = document.getElementById('loadingSpinner');
const userPostsContainer = document.getElementById('userPostsContainer');

let isFollowing = false;

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

// ----- Load the profile -----
async function loadUserProfile() {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${profileUserId}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const user = await response.json();

    if (!response.ok) throw new Error();

    profileImage.src = user.profileImage ? `images/${user.profileImage}` : `https://ui-avatars.com/api/?background=a855f7&color=fff&size=100&name=${encodeURIComponent(user.username)}`;
    profileName.textContent = user.name;
    profileUsername.textContent = `@${user.username}`;
    profileBio.textContent = user.bio || 'No bio yet';
    followersCount.textContent = user.followers.length;
    followingCount.textContent = user.following.length;

    isFollowing = user.followers.some((f) => f._id === currentUser.id);
updateFollowButton();

// Show mutual followers text
const mutualText = document.getElementById('mutualFollowersText');
if (user.mutualFollowers && user.mutualFollowers.length > 0) {
  const names = user.mutualFollowers.slice(0, 2).map((f) => f.username).join(', ');
  const extra = user.mutualFollowers.length > 2 ? ` and ${user.mutualFollowers.length - 2} others` : '';
  mutualText.textContent = `Followed by ${names}${extra}`;
} else {
  mutualText.textContent = '';
}
  } catch (error) {
    showToast('Failed to load profile', 'error');
  }
}

function updateFollowButton() {
  if (isFollowing) {
    followBtn.textContent = 'Unfollow';
    followBtn.className = 'btn btn-outline';
    followBtn.style.cssText = 'width: auto; padding: 10px 28px;';
  } else {
    followBtn.textContent = 'Follow';
    followBtn.className = 'btn btn-primary';
    followBtn.style.cssText = 'width: auto; padding: 10px 28px;';
  }
}

followBtn.addEventListener('click', async () => {
  followBtn.disabled = true;

  try {
    const url = isFollowing
      ? `${API_BASE_URL}/follow/${profileUserId}/unfollow`
      : `${API_BASE_URL}/follow/${profileUserId}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${getToken()}` },
    });

    if (!response.ok) throw new Error();

    isFollowing = !isFollowing;
    updateFollowButton();
    showToast(isFollowing ? 'Now following!' : 'Unfollowed', 'success');
    loadUserProfile();
  } catch (error) {
    showToast('Action failed', 'error');
  } finally {
    followBtn.disabled = false;
  }
});

function renderPostCard(post) {
  return `
    <div class="card">
      <div class="post-header">
        <img src="${profileImage.src}" alt="${post.userId.username}" />
        <div class="post-user-info">
          <span class="post-username">${post.userId.username}</span>
          <span class="post-date">${timeAgo(post.createdAt)}</span>
        </div>
      </div>
      ${post.caption ? `<p class="post-caption">${post.caption}</p>` : ''}
      ${post.image ? `<img src="images/${post.image}" class="post-image" alt="Post image" />` : ''}
      <div class="post-actions">
        <span class="btn-icon">❤️ ${post.likes.length}</span>
        <span class="btn-icon">💬 ${post.comments.length}</span>
      </div>
    </div>
  `;
}

async function loadUserPosts() {
  loadingSpinner.style.display = 'block';
  try {
    const response = await fetch(`${API_BASE_URL}/posts`, {
  headers: { Authorization: `Bearer ${getToken()}` },
  cache: 'no-store', // always get fresh data, never a cached 304 response
});
    const allPosts = await response.json();
    const userPosts = allPosts.filter((post) => post.userId._id === profileUserId);

    loadingSpinner.style.display = 'none';
    postsCount.textContent = userPosts.length;

    if (userPosts.length === 0) {
      userPostsContainer.innerHTML = `<div class="empty-state"><h3>No posts yet</h3></div>`;
      return;
    }

    userPostsContainer.innerHTML = userPosts.map(renderPostCard).join('');
  } catch (error) {
    loadingSpinner.style.display = 'none';
    showToast('Failed to load posts', 'error');
  }
}
// ----- Report / Block (UI-level for now) -----
document.getElementById('moreOptionsBtn').addEventListener('click', () => {
  const menu = document.getElementById('moreOptionsMenu');
  menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
});

document.getElementById('reportUserBtn').addEventListener('click', () => {
  if (confirm(`Report @${profileUsername.textContent.replace('@', '')} for review?`)) {
    showToast('Report submitted. Our team will review it.', 'success');
  }
});

document.getElementById('blockUserBtn').addEventListener('click', () => {
  if (confirm(`Block @${profileUsername.textContent.replace('@', '')}? You won't see their posts or profile.`)) {
    showToast('User blocked', 'success');
    setTimeout(() => (window.location.href = 'feed.html'), 1000);
  }
});

loadUserProfile();
loadUserPosts();