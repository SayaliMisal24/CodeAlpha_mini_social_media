function renderNavbar() {
  const user = getUser();
  if (!user) return;

  const navbarHTML = `
    <nav class="navbar">
      <a href="feed.html" class="navbar-logo" style="display: flex; align-items: center; gap: 8px;">
        <img src="images/logo.svg" alt="Bondly" style="width: 32px; height: 32px;" />
        <span style="background: linear-gradient(90deg, #7c3aed, #a855f7, #d946ef, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">Bondly</span>
      </a>

      <div style="flex: 1; max-width: 260px; margin: 0 16px;">
        <input type="text" id="searchInput" placeholder="Search users..." 
          style="width: 100%; padding: 8px 14px; border: 1px solid var(--border-color); border-radius: 20px; font-size: 14px;" />
        <div id="searchResults" style="position: absolute; background: var(--white); box-shadow: var(--shadow-hover); border-radius: 8px; margin-top: 4px; max-width: 260px; display: none; z-index: 200;"></div>
      </div>

      <button class="navbar-toggle" id="navToggle">&#9776;</button>

      <div class="navbar-links" id="navLinks">
        <a href="feed.html">Home</a>
        <a href="profile.html">Profile</a>
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

  document.getElementById('navToggle').addEventListener('click', () => {
    document.getElementById('navLinks').classList.toggle('active');
  });

  document.getElementById('dropdownBtn').addEventListener('click', () => {
    document.getElementById('dropdownMenu').classList.toggle('active');
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.profile-dropdown')) {
      document.getElementById('dropdownMenu').classList.remove('active');
    }
  });

  document.getElementById('logoutBtn').addEventListener('click', logout);

  // Search users as you type
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

    // Wait 300ms after typing stops before searching (avoids too many requests)
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
                <img src="${u.profileImage ? 'images/' + u.profileImage : 'https://ui-avatars.com/api/?background=a855f7&color=fff&size=28&name=' + encodeURIComponent(u.username)}" style="width: 28px; height: 28px; border-radius: 50%; object-fit: cover;" />
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

  // Hide search results when clicking elsewhere
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#searchInput') && !e.target.closest('#searchResults')) {
      searchResults.style.display = 'none';
    }
  });
}