(() => {
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".primary-navigation");
  if (!toggle || !nav) return;
  toggle.addEventListener("click", () => {
    const expanded = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!expanded));
    toggle.setAttribute("aria-label", expanded ? "بازکردن منو" : "بستن منو");
    nav.classList.toggle("is-open", !expanded);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav.classList.contains("is-open")) {
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "بازکردن منو");
      nav.classList.remove("is-open");
      toggle.focus();
    }
  });
})();
