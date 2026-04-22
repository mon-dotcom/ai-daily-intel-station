function getCardValues(card, key) {
  const raw = card.dataset[key] || "";
  if (!raw) return [];
  return raw.split("|").map((item) => item.trim()).filter(Boolean);
}

function getVisibleCards(sectionRoot) {
  const sectionId = sectionRoot.dataset.filterSection;
  const section = sectionRoot.closest(".section");
  if (!section) return [];
  return [...section.querySelectorAll(`[data-filter-target="${sectionId}"] [data-card]`)].filter((card) => !card.hidden);
}

function updateCarouselSection(sectionRoot) {
  const sectionId = sectionRoot.dataset.filterSection;
  const section = sectionRoot.closest(".section");
  if (!section) return;

  const grid = section.querySelector(`[data-filter-target="${sectionId}"]`);
  if (!grid) return;

  const pageSize = Number.parseInt(grid.dataset.pageSize || "3", 10) || 3;
  const status = section.querySelector(`[data-carousel-status="${sectionId}"]`);
  const prevButton = section.querySelector(`[data-carousel-prev="${sectionId}"]`);
  const nextButton = section.querySelector(`[data-carousel-next="${sectionId}"]`);
  const visibleCards = getVisibleCards(sectionRoot);
  const totalPages = Math.max(1, Math.ceil(visibleCards.length / pageSize));
  let currentPage = Number.parseInt(section.dataset.currentPage || "1", 10) || 1;
  currentPage = Math.min(Math.max(1, currentPage), totalPages);
  section.dataset.currentPage = String(currentPage);

  visibleCards.forEach((card, index) => {
    const inPage = index >= (currentPage - 1) * pageSize && index < currentPage * pageSize;
    card.style.display = inPage ? "" : "none";
  });

  if (status) {
    status.textContent = `${currentPage} / ${totalPages}`;
  }

  if (prevButton) prevButton.disabled = currentPage <= 1;
  if (nextButton) nextButton.disabled = currentPage >= totalPages;
}

function updateFilterSection(sectionRoot, resetPage = false) {
  const sectionId = sectionRoot.dataset.filterSection;
  const section = sectionRoot.closest(".section");
  if (!section) return;

  const cards = [...section.querySelectorAll(`[data-filter-target="${sectionId}"] [data-card]`)];
  const emptyState = section.querySelector(`[data-filter-empty="${sectionId}"]`);
  const activeCategoryButtons = [...sectionRoot.querySelectorAll('[data-filter-group="categories"].is-active')];
  const activeCountryButtons = [...sectionRoot.querySelectorAll('[data-filter-group="country"].is-active')];
  const activeCategories = activeCategoryButtons.map((button) => button.dataset.filterValue).filter((value) => value !== "all");
  const activeCountries = activeCountryButtons.map((button) => button.dataset.filterValue).filter((value) => value !== "all");

  let visibleCount = 0;

  for (const card of cards) {
    const categories = getCardValues(card, "categories");
    const country = card.dataset.country || "";
    const categoryMatch = !activeCategories.length || activeCategories.some((value) => categories.includes(value));
    const countryMatch = !activeCountries.length || activeCountries.includes(country);
    const isVisible = categoryMatch && countryMatch;

    card.hidden = !isVisible;
    card.style.display = isVisible ? "" : "none";
    if (isVisible) visibleCount += 1;
  }

  if (resetPage) {
    section.dataset.currentPage = "1";
  }

  if (emptyState) {
    emptyState.hidden = visibleCount > 0;
    emptyState.style.display = visibleCount > 0 ? "none" : "block";
  }

  updateCarouselSection(sectionRoot);
}

function activateButtonGroup(sectionRoot, groupName, clickedButton) {
  const buttons = [...sectionRoot.querySelectorAll(`[data-filter-group="${groupName}"]`)];
  const isAllButton = clickedButton.dataset.filterValue === "all";

  if (isAllButton) {
    for (const button of buttons) {
      button.classList.toggle("is-active", button === clickedButton);
      button.setAttribute("aria-pressed", button === clickedButton ? "true" : "false");
    }
    return;
  }

  for (const button of buttons) {
    if (button.dataset.filterValue === "all") {
      button.classList.remove("is-active");
      button.setAttribute("aria-pressed", "false");
    }
  }

  clickedButton.classList.toggle("is-active");
  clickedButton.setAttribute("aria-pressed", clickedButton.classList.contains("is-active") ? "true" : "false");

  const hasActiveSpecificButton = buttons.some(
    (button) => button.dataset.filterValue !== "all" && button.classList.contains("is-active")
  );

  if (!hasActiveSpecificButton) {
    const allButton = buttons.find((button) => button.dataset.filterValue === "all");
    if (allButton) {
      allButton.classList.add("is-active");
      allButton.setAttribute("aria-pressed", "true");
    }
  }

  for (const button of buttons) {
    if (button !== clickedButton && button.dataset.filterValue !== "all") {
      button.setAttribute("aria-pressed", button.classList.contains("is-active") ? "true" : "false");
    }
  }
}

function initFilters() {
  const sections = [...document.querySelectorAll("[data-filter-section]")];

  for (const sectionRoot of sections) {
    const sectionId = sectionRoot.dataset.filterSection;
    const section = sectionRoot.closest(".section");
    if (!section) continue;

    const buttons = [...sectionRoot.querySelectorAll("[data-filter-group][data-filter-value]")];
    const prevButton = section.querySelector(`[data-carousel-prev="${sectionId}"]`);
    const nextButton = section.querySelector(`[data-carousel-next="${sectionId}"]`);

    for (const button of buttons) {
      button.setAttribute("aria-pressed", button.classList.contains("is-active") ? "true" : "false");
      button.addEventListener("click", () => {
        activateButtonGroup(sectionRoot, button.dataset.filterGroup, button);
        updateFilterSection(sectionRoot, true);
      });
    }

    prevButton?.addEventListener("click", () => {
      const currentPage = Number.parseInt(section.dataset.currentPage || "1", 10) || 1;
      section.dataset.currentPage = String(Math.max(1, currentPage - 1));
      updateCarouselSection(sectionRoot);
    });

    nextButton?.addEventListener("click", () => {
      const currentPage = Number.parseInt(section.dataset.currentPage || "1", 10) || 1;
      section.dataset.currentPage = String(currentPage + 1);
      updateCarouselSection(sectionRoot);
    });

    updateFilterSection(sectionRoot, true);
  }
}

document.addEventListener("DOMContentLoaded", initFilters);
