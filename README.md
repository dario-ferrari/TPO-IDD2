# **Ingeniería de Datos 2 - Persistencia Políglota**

## Tabla de Contenidos
- [Introducción](#introducción)
- [Justificación](#justificación)
- [Flujo del Proyecto](#flujo-del-proyecto)
- [Ejemplos de Uso de la API](#ejemplos-de-uso-de-la-api)
- [Equipo Desarrollador](#equipo-desarrollador)

## Introducción
Esta aplicación es un TPO para la materia de Ingeniería de Datos 2 en UADE. Se enfoca en el desarrollo de un sistema de gestión para una plataforma de e-commerce haciendo énfasis en la persistencia políglota utilizando tres tipos de bases de datos diferentes: MongoDB, Redis y Cassandra.

## Justificación
La elección de los modelos de bases de datos para cada componente del sistema se basa en las ventajas específicas que cada uno ofrece:

- **Redis**: Utilizado para las sesiones de usuarios y los carritos de compra. Redis es ideal para estas funciones debido a su alta velocidad y capacidad de almacenamiento en memoria, lo que permite un acceso rápido y eficiente a los datos temporales y de sesión.

- **MongoDB**: Usado para almacenar los datos de los usuarios y las facturas. MongoDB es adecuado para estos casos debido a su flexibilidad en el modelado de datos y su capacidad para manejar grandes volúmenes de datos no estructurados, lo que es esencial para nuestro caso donde estos modelos no estan del todo definidos y pueden llegar a cambiar en el futuro.

- **Cassandra**: Elegido para el catálogo de productos y el historial de cambios de precios. Cassandra es muy bueno para manejar grandes cantidades de datos distribuidos con alta disponibilidad y escalabilidad, lo que se ajusta muy bien para el caso del catálogo de productos y el registro de cambios de precios. Este ultimo contará con constantes actualizaciones, lo cual refuerza la elección de Cassandra ya que es muy bueno para manejar grandes cantidades de datos que se actualizan constantemente.

La persistencia políglota nos permite combinar estos tres tipos de bases de datos NoSQL para satisfacer los distintos requerimientos del proyecto, aprovechando las fortalezas de cada uno en su caso de uso particular.

Además, tomamos la decisión de juntar los pedidos y las facturas en un solo modelo. Esto se debe a que al no contar con datos de dirección en los usuarios, el contenido de los pedidos y las facturas quedaba exactamente igual. Al hacerlo de esta manera ganamos tiempo para desarrollar el frontend, lo cual es muy útil para explicar y también para entender uno mismo el proyecto.

## Flujo del Proyecto
1. **Creación de Usuarios**: Los usuarios se crean enviando un POST a la API de usuarios.
2. **Inicio de Sesión**: Los usuarios hacen login en la página principal del proyecto. Si sus credenciales son válidas, acceden a la pantalla del catalogo de productos.
3. **Visualización de Productos**: Los productos se cargan con un POST usando la API de productos. Un usuario autenticado puede ver el catalogo de productos y agregar productos al carrito de compras.
4. **Gestión del Carrito**: Cada usuario tiene su carrito, que permanece en el tiempo. Pueden ver y modificar su carrito, añadiendo o eliminando productos.
5. **Finalización de Compra**: Al elegir un método de pago y finalizar la compra, el carrito se convierte en una factura que se guarda en la base de datos.
6. **Actualización de Precios**: Se puede hacer un PATCH a la API de productos para actualizar los precios, y los cambios se registran con un timestamp en la base de datos correspondiente.

## Ejemplos de Uso de la API
- **Crear un Usuario**: POST http://localhost:3000/users
{
    "username": "usuario",
    "password": "12345",
    "nombre": "Usuario"
}
- **Crear un Producto**: POST http://localhost:3000/service/products
{
    "name": "Xbox Series X",
    "description": "Consola Xbox Series X de 1TB",
    "price": 700.00,
    "image": "https://tienda.personal.com.ar/images/Consola_Xbox_Series_X_1_TB_afde3f8cbd.png"
}
- **Actualizar un Precio**: PATCH http://localhost:3000/service/products/:id/price
{
    "price": 299.99
}

## Equipo Desarrollador
- Rodrigo Ferreiro
- Dario Ferrari
- Luciano Fernandez

-------------------------------------
Version de Node: v18.16.0
Arrancar proyecto de Node en ambiente de test: NODE_ENV=test nodemon index.js
