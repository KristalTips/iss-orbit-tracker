const status = document.getElementById("iss-status");
const latEl = document.getElementById("iss-lat");
const lonEl = document.getElementById("iss-lon");
const altEl = document.getElementById("iss-alt");
const velEl = document.getElementById("iss-vel");
const timeEl = document.getElementById("iss-time");
const angleEl = document.getElementById("iss-angle");
const issDot = document.getElementById("iss-dot");

function setOrbitDot(longitude) {
  // Convert longitude to angle around orbit circle (0..360)
  const normalizedLongitude =
    (((parseFloat(longitude) + 180) % 360) + 360) % 360;
  const angle = normalizedLongitude;
  angleEl.textContent = angle.toFixed(2);
  issDot.style.transform = `translate(-50%, -50%) rotate(${angle}deg) translate(140px) rotate(-${angle}deg)`;
}

async function loadISSPosition() {
  try {
    const response = await fetch(
      "https://api.wheretheiss.at/v1/satellites/25544",
    );
    if (!response.ok) throw new Error("Network response was not ok");

    const data = await response.json();

    const lat = parseFloat(data.latitude).toFixed(5);
    const lon = parseFloat(data.longitude).toFixed(5);
    const alt = parseFloat(data.altitude).toFixed(2);
    const vel = parseFloat(data.velocity).toFixed(2);
    const orbitTime = data.timestamp
      ? new Date(data.timestamp * 1000)
      : new Date();

    latEl.textContent = `${lat}°`;
    lonEl.textContent = `${lon}°`;
    altEl.textContent = `${alt}`;
    velEl.textContent = `${vel}`;
    timeEl.textContent = orbitTime.toUTCString();

    const normalizedLongitude = (((parseFloat(lon) + 180) % 360) + 360) % 360;
    setOrbitDot(normalizedLongitude);

    status.textContent =
      "ISS position fetched successfully from wheretheiss.at.";
    status.classList.remove("error");
    status.classList.add("success");
  } catch (error) {
    status.textContent = "Unable to load ISS position. Try again later.";
    status.classList.remove("success");
    status.classList.add("error");
    console.error("ISS API error:", error);
  }
}

async function loadISSPositionFromRoute() {
  try {
    const res = await fetch("/iss-position");
    if (!res.ok) throw new Error("Route /iss-position not available");

    const data = await res.json();
    if (
      typeof data.longitude !== "number" ||
      typeof data.latitude !== "number"
    ) {
      throw new Error("Invalid /iss-position response format");
    }

    const lat = data.latitude.toFixed(5);
    const lon = data.longitude.toFixed(5);
    const alt = (
      typeof data.altitude === "number" ? data.altitude : 408
    ).toFixed(2);
    const vel = (
      typeof data.velocity === "number" ? data.velocity : 27600
    ).toFixed(2);
    const orbitTime = data.timestamp
      ? new Date(data.timestamp * 1000)
      : new Date();
    const newAngle = (((parseFloat(data.longitude) + 180) % 360) + 360) % 360;

    latEl.textContent = `${lat}°`;
    lonEl.textContent = `${lon}°`;
    altEl.textContent = `${alt}`;
    velEl.textContent = `${vel}`;
    timeEl.textContent = orbitTime.toUTCString();
    angleEl.textContent = newAngle.toFixed(2);
    issDot.style.transform = `translate(-50%, -50%) rotate(${newAngle}deg) translate(140px) rotate(-${newAngle}deg)`;

    status.textContent = "ISS position fetched from /iss-position.";
    status.classList.remove("error");
    status.classList.add("success");

    return true;
  } catch (err) {
    return false;
  }
}

async function updateISS() {
  const fromRoute = await loadISSPositionFromRoute();
  if (!fromRoute) {
    await loadISSPosition();
  }
}

updateISS();
setInterval(updateISS, 5000);
