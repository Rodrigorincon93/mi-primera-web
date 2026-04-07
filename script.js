const boton = document.getElementById("miBoton");

boton.addEventListener("click", () => {
  alert("¡Has hecho clic en el botón!");
});
const cambiarElTitulo = document.getElementById("cambiarElTitulo");

cambiarElTitulo.addEventListener("click", () => {
  const titulo = document.querySelector("h1");
  const textoOriginal = titulo.textContent;

  titulo.textContent = "¡El título ha sido cambiado!";

  setTimeout(() => {
    titulo.textContent = textoOriginal;
  }, 5000);
})
const miImagen = document.getElementById("miImagen");
console.log(miImagen)
const audio = new Audio("Audioalessa.mp3");

miImagen.addEventListener("click", () => {
  audio.play();
});