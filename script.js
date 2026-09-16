const form = document.getElementById("generate-form");
const dropzone = document.getElementById("dropzone");
const imageInput = document.getElementById("image-input");
const preview = document.getElementById("preview");
const dropzoneHint = document.getElementById("dropzone-hint");
const promptInput = document.getElementById("prompt-input");
const generateBtn = document.getElementById("generate-btn");
const btnLabel = generateBtn.querySelector(".btn-label");
const btnSpinner = generateBtn.querySelector(".btn-spinner");
const errorMsg = document.getElementById("error-msg");
const resultCard = document.getElementById("result-card");
const resultVideo = document.getElementById("result-video");
const downloadLink = document.getElementById("download-link");

// --- image selection (click or drag-and-drop) ---------------------------

dropzone.addEventListener("click", () => imageInput.click());

dropzone.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    imageInput.click();
  }
});

imageInput.addEventListener("change", () => {
  if (imageInput.files[0]) showPreview(imageInput.files[0]);
});

["dragenter", "dragover"].forEach((evt) =>
  dropzone.addEventListener(evt, (e) => {
    e.preventDefault();
    dropzone.classList.add("is-dragover");
  })
);

["dragleave", "drop"].forEach((evt) =>
  dropzone.addEventListener(evt, (e) => {
    e.preventDefault();
    dropzone.classList.remove("is-dragover");
  })
);

dropzone.addEventListener("drop", (e) => {
  const file = e.dataTransfer.files[0];
  if (!file) return;
  imageInput.files = e.dataTransfer.files;
  showPreview(file);
});

function showPreview(file) {
  const url = URL.createObjectURL(file);
  preview.src = url;
  preview.hidden = false;
  dropzoneHint.hidden = true;
}

// --- form submission ------------------------------------------------------

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  hideError();

  if (!imageInput.files[0]) {
    return showError("Please choose an image first.");
  }
  if (!promptInput.value.trim()) {
    return showError("Please describe how the image should move.");
  }

  const formData = new FormData();
  formData.append("image", imageInput.files[0]);
  formData.append("prompt", promptInput.value.trim());

  setLoading(true);
  resultCard.hidden = true;

  try {
    const res = await fetch("/api/generate", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Something went wrong generating the clip.");
    }

    resultVideo.src = data.video_url;
    downloadLink.href = data.video_url;
    resultCard.hidden = false;
    resultCard.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (err) {
    showError(err.message);
  } finally {
    setLoading(false);
  }
});

function setLoading(isLoading) {
  generateBtn.disabled = isLoading;
  btnSpinner.hidden = !isLoading;
  btnLabel.textContent = isLoading ? "Generating…" : "Generate 8s clip";
}

function showError(message) {
  errorMsg.textContent = message;
  errorMsg.hidden = false;
}

function hideError() {
  errorMsg.hidden = true;
  errorMsg.textContent = "";
}
