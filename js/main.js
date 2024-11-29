const hamburger = document.querySelector("#toggle-btn");

hamburger.addEventListener("click", function() {

    document.querySelector("#sidebar").classList.toggle("expand");

})

function mostrarToastify(mensaje, color) {
    Toastify({
        text: mensaje,
        duration: 3000,
        close: true,
        gravity: "top",
        position: "right",
        backgroundColor: color,
    }).showToast();
}
