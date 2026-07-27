document.querySelectorAll(".thumb img").forEach((img) => {
  img.addEventListener("error", () => {
    img.closest(".thumb").classList.add("image-failed");
    img.remove();
  }, { once: true });
});

const searchInput = document.querySelector("#guide-search");
if (searchInput) {
  const cards = [...document.querySelectorAll("#search-results .video-card")];
  const status = document.querySelector("#search-status");
  const empty = document.querySelector("#search-empty");
  const initialQuery = new URLSearchParams(window.location.search).get("q") || "";

  const applySearch = () => {
    const terms = searchInput.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
    let visible = 0;
    cards.forEach((card) => {
      const matches = terms.every((term) => card.dataset.search.includes(term));
      card.hidden = !matches;
      if (matches) visible += 1;
    });
    status.textContent = `${visible} ${visible === 1 ? "guide" : "guides"}`;
    empty.hidden = visible !== 0;
  };

  searchInput.value = initialQuery;
  searchInput.addEventListener("input", applySearch);
  applySearch();
}
