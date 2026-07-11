document.querySelectorAll(".thumb img").forEach((img) => {
  img.addEventListener("error", () => {
    img.closest(".thumb").classList.add("image-failed");
    img.remove();
  }, { once: true });
});
