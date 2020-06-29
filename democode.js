require('dotenv').config();
const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL);
client.connect()
  .then(() => console.log('yes!'))
  .catch(error => console.error('badness', error.message))
let SQL = "SELECT * FROM table WHERE age > $1";
let VALUES = [request.query.name]
client.query(SQL, VALUES) // merge the SQL with the VALUES array and $1, 2, 3, etc are pulled from the array
  .then(data => {
    console.log(data.rows) // an array of all the matching records
  })
let SQL = "INSERT INTO FROM table (name, phone) VALUES ($1,$2) RETURNING *";
let VALUES = [request.query.name, request.query.phonenumber]
client.query(SQL, VALUES) // merge the SQL with the VALUES array and $1, 2, 3, etc are pulled from the array
  .then(data => {
    console.log(data.rowCount) // number, like 1
    console.log(data.rows) // undefined
    console.log(data.rows) // if RETURNING * ... [{ name: 'xxy', .... }]
  })
// .env file...
DATABASE_URL = postgres://localhost:5432/city_explorer
DATABASE_URL = postgres://johncokos:supersecretwords@localhost:5432/city_explorer