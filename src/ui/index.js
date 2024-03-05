// comunicacion con el main process
const { ipcRenderer } = require("electron");

const $ = (selector) => document.querySelector(selector);

const addButton = $("#addButton");

const productName = $("#name");
const productDescription = $("#description");
const productPrice = $("#price");
const productList = $("#productList");

let productsFinal = [];
let editStatus = false;
let productId = "";

// Agrega esta variable global para mantener el estado de la página actual
let currentPage = 1;
const productsPerPage = 5;

// Función para cargar la lista de productos
function loadProducts() {
  ipcRenderer.send("cargar-productos");
}

function renderPoroducts(products) {
  // Escuchar la respuesta para cargar productos
  productList.innerHTML = "";

  products.forEach((product) => {
    // Construir la fila de la tabla para cada producto
    const productRow = `
      <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
        <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">${product.id}</th>
        <td class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">${product.name}</td>
        <td class="px-6 py-4">${product.description}</td>
        <td class="px-6 py-4">${product.price}</td>
        <td class="px-6 py-4">
          <a href="#" class="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">Agregar</a>
        </td>
      </tr>
    `;

    // Agregar la fila al cuerpo de la tabla
    productList.insertAdjacentHTML("beforeend", productRow);
  });
}

// Escuchar la respuesta para cargar productos
ipcRenderer.on("cargar-productos-respuesta", (event, products) => {
  // Save products in the global variable
  productsFinal = products;

  renderPoroducts(products);
});

/**
 * Function to filter products by name
 */
function filterProductsByName(name) {
  const filteredProducts = productsFinal.filter((product) =>
    product.name.toLowerCase().includes(name.toLowerCase())
  );

  renderPoroducts(filteredProducts);
}

// Llamar a loadProducts cuando se cargue la página
window.addEventListener("DOMContentLoaded", () => {
  loadProducts();

  const searchInput = $("#default-search");

  //prevent default action to de searchInput
  searchInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
    }
  });

  // Event to listen the input search value
  searchInput.addEventListener("input", (event) => {
    const searchTerm = event.target.value.trim();
    filterProductsByName(searchTerm);
  });
});
