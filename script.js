const boton = document.getElementById("miBoton");

boton.addEventListener("click", () => {
  alert("¡Has hecho clic en el botón!");
});
const cambiarTitulo = document.getElementById("Cambiareltitulo");

cambiarTitulo.addEventListener("click", () => {
  document.querySelector("h1").textContent = "¡El título ha sido cambiado!";
});

const miImagen = document.getElementById("Alessa.jpeg");
const audio = new Audio("Audioalessa.opus");

miImagen.addEventListener("click", () => {
  audio.play();
});