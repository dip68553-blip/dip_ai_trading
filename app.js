const fileInput = document.querySelector("#chart-upload");
const analyzeBtn = document.querySelector("#analyze-btn");
const resultDiv = document.querySelector("#result");
const status = document.querySelector("#status");
const preview = document.querySelector("#preview");
const output = document.querySelector("#output");

let selectedFile = null;
let timeframe = "1m";

document.querySelectorAll("[data-tf]").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("[data-tf]").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    timeframe = btn.dataset.tf;
  });
});

fileInput.addEventListener("change", () => {
  selectedFile = fileInput.files[0] || null;
  if (!selectedFile) {
    analyzeBtn.disabled = true;
    return;
  }
  if (!["image/png", "image/jpeg", "image/webp"].includes(selectedFile.type)) {
    status.textContent = "Please upload PNG, JPG, or WEBP image.";
    analyzeBtn.disabled = true;
    return;
  }
  preview.src = URL.createObjectURL(selectedFile);
  analyzeBtn.disabled = false;
  status.textContent = "";
});

analyzeBtn.addEventListener("click", async () => {
  if (!selectedFile) return;

  analyzeBtn.disabled = true;
  status.textContent = "Analyzing chart...";
  output.textContent = "";

  try {
    const imageData = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(selectedFile);
    });

    const pairInput = document.querySelector("#pair");
    const pair = pairInput ? pairInput.value : "";

    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        imageData,
        timeframe,
        pair
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Analysis failed.");

    output.textContent = data.analysis;
    status.textContent = "Analysis complete.";
  } catch (err) {
    status.textContent = err.message || "An error occurred.";
  } finally {
    analyzeBtn.disabled = !selectedFile;
  }
});
