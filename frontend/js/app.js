const postForm = document.querySelector("#post-form");
const postContent = document.querySelector("#post-content");
const characterCount = document.querySelector("#character-count");
const postsContainer = document.querySelector("#posts-container");

postContent.addEventListener("input", () => {
  characterCount.textContent = `${postContent.value.length} / 280`;
});

postForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const content = postContent.value.trim();

  if (!content) {
    return;
  }

  const newPost = document.createElement("article");
  newPost.className = "post-card";

  const postHeader = document.createElement("div");
  postHeader.className = "post-header";
  postHeader.innerHTML = `
    <div class="small-avatar">SM</div>
    <div>
      <h3>Sayali Misal</h3>
      <p>@sayali · Just now</p>
    </div>
  `;

  const postText = document.createElement("p");
  postText.className = "post-content";
  postText.textContent = content;

  const postActions = document.createElement("div");
  postActions.className = "post-actions";

  const likeButton = document.createElement("button");
  likeButton.type = "button";
  likeButton.textContent = "♡ Like";

  likeButton.addEventListener("click", () => {
    const isLiked = likeButton.textContent === "♥ Liked";
    likeButton.textContent = isLiked ? "♡ Like" : "♥ Liked";
    likeButton.style.color = isLiked ? "" : "#e11d48";
  });

  const commentButton = document.createElement("button");
  commentButton.type = "button";
  commentButton.textContent = "💬 Comment";

  postActions.append(likeButton, commentButton);
  newPost.append(postHeader, postText, postActions);

  postsContainer.prepend(newPost);

  postForm.reset();
  characterCount.textContent = "0 / 280";
});