import "@testing-library/jest-dom/vitest";

// jsdom does not implement the native dialog methods used by the reset prompt.
HTMLDialogElement.prototype.showModal = function () {
  this.setAttribute("open", "");
};
HTMLDialogElement.prototype.close = function () {
  this.removeAttribute("open");
};

window.scrollTo = () => {};
