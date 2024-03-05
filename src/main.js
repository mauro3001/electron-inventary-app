const { BrowserWindow, Notification, ipcMain } = require("electron");
const { getConnection } = require("./database");

async function createProduct(product) {
  try {
    const connection = await getConnection();
    product.price = parseFloat(product.price);
    const result = await connection.query("INSERT INTO product SET ?", product);

    new Notification({
      title: "Nuevo producto",
      body: "Se ha creado un nuevo producto satisfactoriamente.",
    }).show();

    product.id = result.insertId;
    return product;
  } catch (error) {
    console.log("El error presente es: ", error);
    throw error;
  }
}

async function getProducts() {
  try {
    const connection = await getConnection();
    const result = await connection.query("SELECT * FROM product ORDER BY id DESC");
    return result;
  } catch (error) {
    console.log("El error presente es: ", error);
    throw error;
  }
}

async function getProductById(productId) {
  try {
    const connection = await getConnection();
    const result = await connection.query(
      "SELECT * FROM product WHERE id = ?",
      productId
    );
    return result[0];
  } catch (error) {
    console.log("El error presente es: ", error);
    throw error;
  }
}

async function editProduct(product) {
  try {
    const connection = await getConnection();
    const result = await connection.query("UPDATE product SET ? WHERE id = ?", [
      product,
      product.id,
    ]);
    
    new Notification({
      title: "Producto Actualizado",
      body: "Se ha actualizado correctamente el producto.",
    }).show();

    return result;
  } catch (error) {
    console.log("El error presente es: ", error);
    throw error;
  }
}

async function deleteProduct(productId) {
  try {
    const connection = await getConnection();
    const result = await connection.query(
      "DELETE FROM product WHERE id = ?",
      productId
    );

    new Notification({
      title: "Producto Eliminado",
      body: "Se ha eliminado correctamente el producto.",
    }).show();
    
    return productId;
  } catch (error) {
    console.log("El error presente es: ", error);
    throw error;
  }
}

function createWindow() {
  window = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: false,
      nodeIntegrationInWorker: true,
      enableRemoteModule: true,
      nodeIntegration: true, // In the window i can import node modules
    },
  });

  window.loadFile("src/ui/index.html");

  /**
   * Comunication with the render process
   */
  ipcMain.on("nuevo-producto", async (event, producto) => {
    console.log("Información del producto recibido:", producto);
    try {
      const newProduct = await createProduct(producto);
      event.reply("nuevo-producto-respuesta", newProduct);
    } catch (error) {
      event.reply("nuevo-producto-respuesta", { error: error.message });
    }
  });

  /**
   * Function to load the products
   */
  ipcMain.on("cargar-productos", async (event) => {
    try {
      const products = await getProducts();
      event.reply("cargar-productos-respuesta", products);
    } catch (error) {
      event.reply("cargar-productos-respuesta", { error: error.message });
    }
  });

  /**
   * Function to delete a product
   * @param {number} id
  */
  ipcMain.on("eliminar-producto", async (event, id) => {
    try {
      const result = await deleteProduct(id);
      event.reply("eliminar-producto-respuesta", result);
    } catch (error) {
      event.reply("eliminar-producto-respuesta", { error: error.message });
    }
  });

  /**
   * Function to get a product by id
   */
  ipcMain.on("obtener-producto", async (event, id) => {
    try {
      const result = await getProductById(id);
      event.reply("obtener-producto-respuesta", result);
    } catch (error) {
      event.reply("obtener-producto-respuesta", { error: error.message });
    }
  });

  /**
   * Function to edit a product
   */
  ipcMain.on("actualizar-producto", async (event, product) => {
    try {
      const result = await editProduct(product);
      event.reply("actualizar-producto-respuesta", result);
    } catch (error) {
      event.reply("actualizar-producto-respuesta", { error: error.message });
    }
  });
}

module.exports = {
  createWindow,
};
