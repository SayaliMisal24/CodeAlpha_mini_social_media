// ============================================
// NAVBAR - injected into every logged-in page
// Includes: logo, search, theme toggle, notifications, profile dropdown
// ============================================

function renderNavbar() {
  const user = getUser();
  if (!user) return; // safety check

  const navbarHTML = `
    <nav class="navbar">
      <a href="feed.html" class="navbar-logo" style="display: flex; align-items: center; gap: 8px;">
        <img src="images/logo.svg" alt="Bondly" style="width: 32px; height: 32px;" />
        <span style="background: linear-gradient(90deg, #7c3aed, #a855f7, #d946ef, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Bondly</span>
      </a>

      <div style="flex: 1; max-width: 260px; margin: 0 16px; position: relative;">
        <input type="text" id="searchInput" placeholder="Search users..."
          style="width: 100%; padding: 8px 14px; border: 1px solid var(--border-color); border-radius: 20px; font-size: 14px;" />
        <div id="searchResults" style="position: absolute; background: var(--white); box-shadow: var(--shadow-hover); border-radius: 8px; margin-top: 4px; width: 100%; display: none; z-index: 200;"></div>
      </div>

      <button class="navbar-toggle" id="navToggle">&#9776;</button>

      <div class="navbar-links" id="navLinks">
        <a href="feed.html">Home</a>
        <a href="profile.html">Profile</a>
      </div>

      <button class="theme-toggle" id="themeToggle" title="Toggle dark mode">🌙</button>

      <div class="notif-wrapper" style="position: relative;">
        <button class="theme-toggle" id="notifBell" title="Notifications">
          🔔
          <span class="notif-badge" id="notifBadge" style="display: none;">0</span>
        </button>
        <div class="dropdown-menu notif-dropdown" id="notifDropdown"></div>
      </div>

      <div class="profile-dropdown">
        <button class="profile-dropdown-btn" id="dropdownBtn">
          <img src="${user.profileImage ? 'images/' + user.profileImage : 'https://ui-avatars.com/api/?background=a855f7&color=fff&name=' + encodeURIComponent(user.username)}" alt="Profile" />
        </button>
        <div class="dropdown-menu" id="dropdownMenu">
          <a href="profile.html">My Profile</a>
          <button id="logoutBtn">Logout</button>
        </div>
      </div>
    </nav>
  `;

  document.getElementById('navbar-container').innerHTML = navbarHTML;

  // ---- Everything below runs AFTER navbarHTML is inserted into the page ----

  // Mobile menu toggle
  document.getElementById('navToggle').addEventListener('click', () => {
    document.getElementById('navLinks').classList.toggle('active');
  });

  // Profile dropdown toggle
  document.getElementById('dropdownBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    const menu = document.getElementById('dropdownMenu');
    const isOpen = menu.classList.contains('active');
    document.querySelectorAll('.dropdown-menu').forEach((d) => d.classList.remove('active'));
    if (!isOpen) menu.classList.add('active');
  });

  // Close any open dropdown when clicking elsewhere
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.profile-dropdown') && !e.target.closest('.notif-wrapper')) {
      document.querySelectorAll('.dropdown-menu').forEach((d) => d.classList.remove('active'));
    }
  });

  // Logout
  document.getElementById('logoutBtn').addEventListener('click', logout);

  // ----- Dark mode toggle -----
  const themeToggle = document.getElementById('themeToggle');
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    themeToggle.textContent = next === 'dark' ? '☀️' : '🌙';
  });

  // ----- Search users -----
  const searchInput = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');
  let debounceTimer;

  searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    const query = searchInput.value.trim();

    if (query.length === 0) {
      searchResults.style.display = 'none';
      return;
    }

    debounceTimer = setTimeout(async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/users/search?q=${encodeURIComponent(query)}`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        const users = await response.json();

        if (users.length === 0) {
          searchResults.innerHTML = `<div style="padding: 12px; color: var(--text-gray); font-size: 14px;">No users found</div>`;
        } else {
          searchResults.innerHTML = users
            .map(
              (u) => `
              <a href="view-profile.html?id=${u._id}" style="display: flex; align-items: center; gap: 10px; padding: 10px 14px; color: var(--text-dark); font-size: 14px;">
                <img src="${u.profileImage ? 'images/' + u.profileImage : 'https://ui-avatars.com/api/?background=a855f7&color=fff&name=' + encodeURIComponent(u.username)}" style="width: 28px; height: 28px; border-radius: 50%; object-fit: cover;" />
                @${u.username}
              </a>
            `
            )
            .join('');
        }
        searchResults.style.display = 'block';
      } catch (error) {
        searchResults.style.display = 'none';
      }
    }, 300);
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('#searchInput') && !e.target.closest('#searchResults')) {
      searchResults.style.display = 'none';
    }
  });

  // ----- Notifications -----
  const notifBell = document.getElementById('notifBell');
  const notifBadge = document.getElementById('notifBadge');
  const notifDropdown = document.getElementById('notifDropdown');

  function timeAgoNotif(dateString) {
    const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  async function loadUnreadCount() {
    try {
      const res = await fetch(`${API_BASE_URL}/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (data.count > 0) {
        notifBadge.textContent = data.count > 9 ? '9+' : data.count;
        notifBadge.style.display = 'flex';
      } else {
        notifBadge.style.display = 'none';
      }
    } catch (error) {
      // Fail silently
    }
  }

  async function loadNotifications() {
    notifDropdown.innerHTML = '<div style="padding: 16px; text-align: center; color: var(--text-gray); font-size: 13px;">Loading...</div>';

    try {
      const res = await fetch(`${API_BASE_URL}/notifications`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const notifications = await res.json();

      if (notifications.length === 0) {
        notifDropdown.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--text-gray); font-size: 13px;">No notifications yet</div>';
        return;
      }

      const messages = { like: 'liked your post', comment: 'commented on your post', follow: 'started following you' };

      notifDropdown.innerHTML = notifications
        .map((n) => {
          const avatar = n.sender.profileImage
            ? `images/${n.sender.profileImage}`
            : `https://ui-avatars.com/api/?background=a855f7&color=fff&size=36&name=${encodeURIComponent(n.sender.username)}`;
          const link = n.type === 'follow' ? `view-profile.html?id=${n.sender._id}` : 'feed.html';
          return `
            <a href="${link}" class="notif-item ${n.read ? '' : 'unread'}">
              <img src="${avatar}" />
              <div>
                <span><strong>${n.sender.username}</strong> ${messages[n.type]}</span>
                <div class="notif-time">${timeAgoNotif(n.createdAt)}</div>
              </div>
            </a>
          `;
        })
        .join('');

      await fetch(`${API_BASE_URL}/notifications/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      notifBadge.style.display = 'none';
    } catch (error) {
      notifDropdown.innerHTML = '<div style="padding: 16px; text-align: center; color: var(--danger); font-size: 13px;">Failed to load</div>';
    }
  }

  notifBell.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = notifDropdown.classList.contains('active');
    document.querySelectorAll('.dropdown-menu').forEach((d) => d.classList.remove('active'));
    if (!isOpen) {
      notifDropdown.classList.add('active');
      loadNotifications();
    }
  });

  loadUnreadCount();
  setInterval(loadUnreadCount, 15000); // check for new notifications every 15 seconds
}