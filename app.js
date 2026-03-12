const dropZone = document.getElementById("dropZone");
const fileInput = document.getElementById("fileInput");
const statusEl = document.getElementById("status");
const emulatorContainer = document.getElementById("emulator");

let activeCi = null;

const setStatus = (message, type = "") => {
  statusEl.textContent = message;
  statusEl.classList.remove("running", "warning");
  if (type) statusEl.classList.add(type);
};

const readFileAsArrayBuffer = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });

const launchExe = async (file) => {
  if (!file || !file.name.toLowerCase().endsWith(".exe")) {
    setStatus("Please choose a .exe file.", "warning");
    return;
  }

  setStatus(`Loading ${file.name}...`);

  const buffer = await readFileAsArrayBuffer(file);
  const bytes = new Uint8Array(buffer);

  emulatorContainer.innerHTML = "";
  const dosRoot = document.createElement("div");
  dosRoot.id = "dos-root";
  dosRoot.style.width = "100%";
  dosRoot.style.height = "100%";
  emulatorContainer.appendChild(dosRoot);

  if (activeCi && activeCi.exit) {
    try {
      await activeCi.exit();
    } catch {
      // ignore
    }
  }

  const dos = Dos(dosRoot, {
    wdosboxUrl: "https://js-dos.com/6.22/current/wdosbox.js",
  });

  activeCi = await dos.run({
    file: file.name,
    data: bytes,
  });

  await activeCi.command(`${file.name}\n`);
  setStatus(`Running ${file.name} (DOS-compatible EXE files only).`, "running");
};

const handleFiles = (files) => {
  const [file] = files;
  launchExe(file).catch((error) => {
    console.error(error);
    setStatus("Could not launch file. Use a DOS-compatible executable.", "warning");
  });
};

["dragenter", "dragover"].forEach((eventName) => {
  dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropZone.classList.add("drag-over");
  });
});

["dragleave", "drop"].forEach((eventName) => {
  dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropZone.classList.remove("drag-over");
  });
});

dropZone.addEventListener("drop", (event) => {
  handleFiles(event.dataTransfer.files);
});

fileInput.addEventListener("change", (event) => {
  handleFiles(event.target.files);
});
