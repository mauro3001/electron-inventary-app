// comunicacion con el main process
const { ipcRenderer } = require("electron");

const $ = (selector) => document.querySelector(selector);

const productForm = $("#productForm");
const submitButton = $("#submitButton");

const productName = $("#name");
const productDescription = $("#description");
const productPrice = $("#price");
const productList = $("#productList");

let productsFinal = [];
let editStatus = false;
let productId = "";

submitButton.addEventListener("click", (e) => {
  e.preventDefault();
  const newProduct = {
    name: productName.value,
    description: productDescription.value,
    price: productPrice.value,
  };

  if (!editStatus) {
    /**
     * Send the data to the main process
     */
    ipcRenderer.send("nuevo-producto", newProduct);

    ipcRenderer.on("nuevo-producto-respuesta", (event, response) => {
      if (response.error) {
        console.error("Hubo un error al crear el producto:", response.error);
      } else {
        console.log("Producto creado exitosamente desde el render:", response);
      }
    });
  } else {
    const productToUpdated = {
      id: productId,
      name: productName.value,
      description: productDescription.value,
      price: productPrice.value,
    };
    console.log("Producto a actualizar:", productToUpdated);
    ipcRenderer.send("actualizar-producto", productToUpdated);
    ipcRenderer.on("actualizar-producto-respuesta", (event, response) => {
      if (response.error) {
        console.error("Hubo un error al actualizar el producto:", response.error);
      }
    });
    editStatus = false;
    productId = "";
  }

  productForm.reset();
  productName.focus();

  loadProducts();
});

/**
 * Function to delete a product
 */
function deleteProduct(id) {
  const confimation = confirm("¿Estás seguro de eliminar el producto?");
  if (!confimation) {
    return;
  }
  ipcRenderer.send("eliminar-producto", id);
  ipcRenderer.on("eliminar-producto-respuesta", (event, response) => {
    if (response.error) {
      console.error("Hubo un error al eliminar el producto:", response.error);
    } else {
      console.log("Producto eliminado exitosamente con el id:", response);
    }
  });
  loadProducts();
}

/**
 * Function to edit product
 * @param {*} productId 
 */
function editProduct(productId) {
  ipcRenderer.send("obtener-producto", productId);
}

/**
 * Listen the response to show the product by Id
 */
ipcRenderer.on("obtener-producto-respuesta", (event, product) => {
  productName.value = product.name;
  productDescription.value = product.description;
  productPrice.value = product.price;

  editStatus = true;
  productId = product.id;
});

// Función para cargar la lista de productos
function loadProducts() {
  ipcRenderer.send("cargar-productos");
}

// Escuchar la respuesta para cargar productos
ipcRenderer.on("cargar-productos-respuesta", (event, products) => {
  // Limpiar la lista de productos antes de mostrar los nuevos
  productList.innerHTML = "";

  // Guardar los productos en la variable global
  productsFinal = products;

  products.forEach((product) => {
    // Crear el contenido del producto
    const productContent = document.createElement("div");
    productContent.classList.add(
      "max-w-sm",
      "p-6",
      "bg-white",
      "border",
      "border-gray-200",
      "rounded-lg",
      "shadow",
      "dark:bg-gray-800",
      "dark:border-gray-700",
      "w-80",
      "mx-auto",
      "animate-fade-in-right",
      "duration-500",
      "delay-200"
    );

    // Agregar el nombre del producto
    const productName = document.createElement("h5");
    productName.classList.add(
      "mb-2",
      "text-2xl",
      "font-bold",
      "tracking-tight",
      "text-gray-900",
      "dark:text-white"
    );
    productName.textContent = product.name;

    // Agregar la descripción del producto
    const productDescription = document.createElement("p");
    productDescription.classList.add(
      "mb-3",
      "font-normal",
      "text-gray-700",
      "dark:text-gray-400"
    );
    productDescription.textContent = product.description;

    // Agregar el precio del producto
    const productPrice = document.createElement("p");
    productPrice.classList.add(
      "mb-3",
      "font-semibold",
      "text-blue-600",
      "dark:text-blue-600"
    );
    productPrice.textContent = product.price;

    //Agregar el boton de editar y eliminar
    const editButton = document.createElement("a");
    editButton.href = "#";
    editButton.classList.add(
      "inline-flex",
      "items-center",
      "px-3",
      "py-2",
      "text-sm",
      "font-medium",
      "text-center",
      "text-white",
      "bg-yellow-500",
      "rounded-lg",
      "hover:bg-yellow-600",
      "focus:ring-4",
      "focus:outline-none",
      "focus:ring-yellow-300",
      "dark:bg-yellow-500",
      "dark:hover:bg-yellow-700",
      "dark:focus:ring-yellow-800"
    );
    editButton.textContent = "Editar";
    editButton.addEventListener("click", () => {
      editProduct(product.id);
    });

    //Agregar el boton de editar y eliminar
    const deleteButton = document.createElement("a");
    deleteButton.href = "#";
    deleteButton.classList.add(
      "inline-flex",
      "items-center",
      "px-3",
      "py-2",
      "text-sm",
      "font-medium",
      "text-center",
      "text-white",
      "bg-red-500",
      "rounded-lg",
      "hover:bg-red-600",
      "focus:ring-4",
      "focus:outline-none",
      "focus:ring-red-300",
      "dark:bg-red-500",
      "dark:hover:bg-red-700",
      "dark:focus:ring-red-800"
    );
    deleteButton.textContent = "Eliminar";
    deleteButton.addEventListener("click", () => {
      deleteProduct(product.id);
    });

    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("flex", "justify-center", "space-x-4");
    buttonContainer.appendChild(editButton);
    buttonContainer.appendChild(deleteButton);

    // Agregar todos los elementos al contenido del producto
    productContent.appendChild(productName);
    productContent.appendChild(productDescription);
    productContent.appendChild(productPrice);
    productContent.appendChild(buttonContainer);

    // Agregar el contenedor del producto a la lista de productos
    productList.appendChild(productContent);
  });

  console.log("Productos cargados:", products);
});

// Llamar a loadProducts cuando se cargue la página
window.addEventListener("DOMContentLoaded", () => {
  loadProducts();
});
