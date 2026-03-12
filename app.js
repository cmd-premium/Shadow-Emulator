const dropZone = document.getElementById("dropZone");
const fileInput = document.getElementById("fileInput");
const statusEl = document.getElementById("status");
const emulatorContainer = document.getElementById("emulator");
const gameLibrary = document.getElementById("gameLibrary");

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

const createDosInstance = async () => {
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
      // ignore previous crashed instance
    }
  }

  return Dos(dosRoot, {
    wdosboxUrl: "https://js-dos.com/6.22/current/wdosbox.js",
  });
};

const launchExe = async (file) => {
  if (!file || !file.name.toLowerCase().endsWith(".exe")) {
    setStatus("Please choose a .exe file.", "warning");
    return;
  }

  setStatus(`Loading ${file.name}...`);

  const buffer = await readFileAsArrayBuffer(file);
  const bytes = new Uint8Array(buffer);
  const dos = await createDosInstance();

  activeCi = await dos.run({
    file: file.name,
    data: bytes,
  });

  await activeCi.command(`${file.name}\n`);
  setStatus(`Running ${file.name} (DOS-compatible EXE files only).`, "running");
};

const launchFromUrl = async (game) => {
  setStatus(`Loading ${game.title} from library...`);
  const dos = await createDosInstance();
  activeCi = await dos.run(game.sourceUrl);

  if (game.command) {
    await activeCi.command(`${game.command}\n`);
  }

  setStatus(`Running ${game.title}.`, "running");
};

const createGameCard = (game) => {
  const card = document.createElement("article");
  card.className = "game-card";

  const title = document.createElement("h3");
  title.textContent = game.title;

  const desc = document.createElement("p");
  desc.className = "game-desc";
  desc.textContent = game.description;

  const notes = document.createElement("p");
  notes.className = "game-notes";
  notes.textContent = game.notes || "";

  const actions = document.createElement("div");
  actions.className = "game-actions";

  const launchButton = document.createElement("button");
  launchButton.type = "button";
  launchButton.textContent = "Play";
  launchButton.addEventListener("click", () => {
    launchFromUrl(game).catch((error) => {
      console.error(error);
      setStatus(`Could not load ${game.title}. Try another game or upload your own EXE.`, "warning");
    });
  });

  const sourceLink = document.createElement("a");
  sourceLink.href = game.sourceUrl;
  sourceLink.target = "_blank";
  sourceLink.rel = "noopener noreferrer";
  sourceLink.textContent = "Source";

  actions.append(launchButton, sourceLink);
  card.append(title, desc, notes, actions);

  return card;
};

const renderLibrary = () => {
  const games = window.SHADOW_GAMES || [];
  gameLibrary.innerHTML = "";
  games.forEach((game) => {
    gameLibrary.appendChild(createGameCard(game));
  });
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

renderLibrary();
