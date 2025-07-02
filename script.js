const apiToken = "r8_aqTq22fNZLcozPoMxGzGbGAbc55hIZy3aFoR5";
const model = "lucataco/animatediff-lightning"; // modelo que acepta imagen + prompt

document.getElementById("animateBtn").onclick = async () => {
  const fileInput = document.getElementById("inputImage");
  const promptText = document.getElementById("prompt").value.trim();
  const style = document.getElementById("styleSelect").value;

  if (!fileInput.files.length || !promptText) {
    alert("Por favor, selecciona una imagen y escribe una descripción.");
    return;
  }

  const fullPrompt = `Estilo ${style}. ${promptText}`;
  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = "<p>Generando animación con IA... espera un momento...</p>";

  const file = fileInput.files[0];
  const base64 = await toBase64(file);

  const body = {
    version: "cf5d6ee1e16dbd3b2ccf7c37e54a90b60a8cb47cf68d1893fa21333b3c64e5a6",
    input: {
      image: base64,
      prompt: fullPrompt
    }
  };

  const res = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      "Authorization": `Token ${apiToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  let prediction = await res.json();

  while (prediction.status !== "succeeded" && prediction.status !== "failed") {
    await new Promise(r => setTimeout(r, 2000));
    const statusRes = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
      headers: { "Authorization": `Token ${apiToken}` }
    });
    prediction = await statusRes.json();
  }

  if (prediction.status === "succeeded") {
    const videoUrl = prediction.output;
    resultDiv.innerHTML = `
      <h3>Resultado:</h3>
      <video controls autoplay loop src="${videoUrl}"></video>
      <br>
      <a href="${videoUrl}" download="animacion-ia.mp4">
        <button>Descargar Video</button>
      </a>
    `;
  } else {
    resultDiv.innerHTML = "<p>Error al generar la animación.</p>";
  }
};

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}
