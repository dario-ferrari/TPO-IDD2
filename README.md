Por si acaso, instalar la siguiente versión de node: v18.16.0

-------------------------------------

PARA INSTALAR TODAS LAS DEPENDENCIAS:

npm install 

-------------------------------------

ARRANCAR PROYECTO DE NODE EN AMBIENTE DE TEST:
NODE_ENV=test nodemon index.js

-------------------------------------

CASSANDRA

Instalar Java (lo necesita Cassandra):
sudo apt install openjdk-11-jdk -y 

Instalación Cassandra:
wget https://downloads.apache.org/cassandra/debian/apache-cassandra-4.1.3-all.deb
sudo dpkg -i apache-cassandra-4.1.3-all.deb

STATUS DE SERVER:
sudo service cassandra status

LEVANTAR CASSANDRA (en caso de que no esté el servidor corriendo):
sudo systemctl start cassandra

ABRIR CASSANDRA LOCAL:
cqlsh

VER TABLAS CREADAS:
DESCRIBE KEYSPACES

USAR TABLA:
USE -nombre de tabla-

SELECT * FROM -nombre de tabla-

------------------------------------

SERVER LOCAL DE REDIS:

sudo apt install redis -y

LEVANTAR SERVER DE REDIS:
redis-server

LEVANTAR CLIENTE DE REDIS:
redis-cli

OBTENER TODAS LAS KEYS DE REDIS:

KEYS*

GET -nombre de la key-

------------------------------------
------------------------------------
------------------------------------
TPO:

CREACIÓN DE PEDIDOS -
CARRITO COMPRAS - REDIS
CONVERSIÓN CARRITO A PEDIDO - MONGODB
FINALIZACIÓN DE PEDIDOS - 
GENERACIÓN DE FACTURAS - MONGODB
REGISTRO DE PAGOS      - 
GESTIÓN DE USUARIOS    - ? (ADM)



AUTENTICACIÓN Y SESIÓN DE USUARIOS - REDIS
CATEGORIZACIÓN DE USUARIOS - CASSANDRA?
CARRITO DE COMPRAS - REDIS
FACTURACIÓN - MONGODB
CONTROL DE OPERACIONES - 
CATÁLOGO DE PRODUCTOS - CASSANDRA?
LISTA DE PRECIOS - REDIS (usando como key el id de producto)
REGISTRO CAMBIOS CATÁLOGO - CASSANDRA

