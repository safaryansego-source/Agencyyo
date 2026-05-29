const body = document.body;
const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const menuBackdrop = document.querySelector("[data-menu-backdrop]");
const mobileMenu = document.querySelector("#mobile-menu");
const navLinks = document.querySelectorAll("[data-nav-link]");
const navSections = Array.from(
  new Set(Array.from(navLinks).map((link) => link.getAttribute("href")))
)
  .filter((href) => href && href.startsWith("#"))
  .map((href) => document.querySelector(href))
  .filter(Boolean);
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function setMenuState(isOpen) {
  body.classList.toggle("menu-open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  mobileMenu.setAttribute("aria-hidden", String(!isOpen));
}

menuToggle.addEventListener("click", () => {
  setMenuState(!body.classList.contains("menu-open"));
});

menuBackdrop.addEventListener("click", () => {
  setMenuState(false);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setMenuState(false);
  }
});

function updateHeaderState() {
  header.classList.toggle("is-scrolled", window.scrollY > 12);
}

function updateActiveNavigation() {
  const marker = window.scrollY + header.offsetHeight + 120;
  let currentId = "";

  navSections.forEach((section) => {
    if (section.offsetTop <= marker) {
      currentId = section.id;
    }
  });

  navLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === `#${currentId}`;

    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

updateHeaderState();
updateActiveNavigation();
window.addEventListener("scroll", updateHeaderState, { passive: true });
window.addEventListener("scroll", updateActiveNavigation, { passive: true });

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");
    const target = targetId.length > 1 ? document.querySelector(targetId) : null;

    if (!target) {
      return;
    }

    event.preventDefault();
    setMenuState(false);

    target.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start"
    });

    history.pushState(null, "", targetId);
  });
});

const revealItems = document.querySelectorAll(".reveal");

function revealVisibleItems() {
  revealItems.forEach((item) => {
    const rect = item.getBoundingClientRect();

    if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) {
      item.classList.add("is-visible");
    }
  });
}

revealVisibleItems();

document.documentElement.classList.add("js-reveal");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

window.addEventListener("scroll", revealVisibleItems, { passive: true });
window.addEventListener("hashchange", () => {
  window.setTimeout(revealVisibleItems, 120);
});
window.setTimeout(revealVisibleItems, 320);

document.querySelectorAll(".project-media img").forEach((image) => {
  const markLoaded = () => image.classList.add("is-loaded");
  const markMissing = () => image.classList.remove("is-loaded");

  if (image.complete && image.naturalWidth > 0) {
    markLoaded();
  }

  image.addEventListener("load", markLoaded);
  image.addEventListener("error", markMissing);
});

const year = document.querySelector("[data-year]");

if (year) {
  year.textContent = new Date().getFullYear();
}

const contactForm = document.querySelector("[data-contact-form]");
const formStatus = document.querySelector("[data-form-status]");

if (contactForm && formStatus) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    formStatus.textContent = "Thanks. Your message is ready for the next step.";
    contactForm.reset();
  });
}
