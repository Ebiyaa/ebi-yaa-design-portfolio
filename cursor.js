// Custom cursor: a cream disc that follows the pointer with a smooth trailing
// motion and expands into a "see more" badge over work media. Composited with
// mix-blend-mode: difference so it inverts against whatever is behind it.
// Only runs on devices with a real mouse (skips touch/mobile).
(function () {
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  var cursor = document.createElement("div");
  cursor.className = "custom-cursor";
  cursor.innerHTML = "<span>see more</span>";

  function attach() {
    document.body.appendChild(cursor);
    document.body.classList.add("cursor-none");
  }
  if (document.body) attach();
  else document.addEventListener("DOMContentLoaded", attach);

  var mouseX = -100,
    mouseY = -100,
    curX = -100,
    curY = -100;

  window.addEventListener("mousemove", function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.classList.add("is-active");
  });

  document.addEventListener("mouseleave", function () {
    cursor.classList.remove("is-active");
  });

  function raf() {
    curX += (mouseX - curX) * 0.2;
    curY += (mouseY - curY) * 0.2;
    cursor.style.left = curX + "px";
    cursor.style.top = curY + "px";
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // Media gets the "see more" badge only when it actually links somewhere —
  // cards without a case study page keep the plain cursor.
  function isHot(target) {
    if (!target || !target.closest) return false;
    var media = target.closest(".work-media, .case-media");
    return !!(media && media.closest("a[href]"));
  }

  document.addEventListener("mouseover", function (e) {
    if (isHot(e.target)) cursor.classList.add("cursor-work");
  });
  document.addEventListener("mouseout", function (e) {
    if (isHot(e.target)) cursor.classList.remove("cursor-work");
  });
})();
