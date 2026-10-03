(() => {
  const gallery = document.querySelector(".woocommerce-product-gallery");
  const image = gallery?.querySelector(".woocommerce-product-gallery__wrapper img");
  if (!gallery || !image) return;

  gallery.classList.add("originaly-lens-enabled");
  const lens = document.createElement("div");
  lens.className = "originaly-product-lens";
  lens.setAttribute("aria-hidden", "true");
  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "originaly-lens-toggle";
  toggle.setAttribute("aria-pressed", "false");
  toggle.textContent = "لمس یا مکث برای دیدن جزئیات";
  toggle.setAttribute("aria-label", "فعال یا غیرفعال‌کردن ذره‌بین تصویر محصول");
  gallery.append(lens, toggle);

  let pinned = false;
  const update = (event) => {
    const rect = gallery.getBoundingClientRect();
    const x = Math.max(8, Math.min(92, ((event.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(8, Math.min(92, ((event.clientY - rect.top) / rect.height) * 100));
    lens.style.left = `${x}%`;
    lens.style.top = `${y}%`;
    lens.style.backgroundImage = `url("${(image.currentSrc || image.src).replaceAll('"', "%22")}")`;
    lens.style.backgroundPosition = `${x}% ${y}%`;
  };
  const show = () => { lens.classList.add("is-visible"); };
  const hide = () => { if (!pinned) lens.classList.remove("is-visible"); };

  gallery.addEventListener("pointerenter", (event) => { if (event.pointerType === "mouse") show(); });
  gallery.addEventListener("pointerleave", (event) => { if (event.pointerType === "mouse") hide(); });
  gallery.addEventListener("pointermove", (event) => {
    if (event.pointerType === "mouse" || pinned) update(event);
  });
  gallery.addEventListener("pointerdown", (event) => {
    if (event.target.closest(".originaly-lens-toggle")) return;
    if (event.pointerType === "touch") {
      pinned = true;
      toggle.setAttribute("aria-pressed", "true");
      toggle.textContent = "ذره‌بین فعال است؛ لمس کنید تا ببندید";
      show();
      update(event);
    }
  });
  toggle.addEventListener("click", (event) => {
    event.stopPropagation();
    pinned = !pinned;
    toggle.setAttribute("aria-pressed", String(pinned));
    toggle.textContent = pinned ? "ذره‌بین فعال است؛ لمس کنید تا ببندید" : "لمس یا مکث برای دیدن جزئیات";
    if (pinned) show(); else lens.classList.remove("is-visible");
  });
})();
