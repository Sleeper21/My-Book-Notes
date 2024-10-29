import express from "express"
import bodyParser from "body-parser"
import axios from "axios"
import pg from "pg"
import dotenv from "dotenv"

const app = express();
app.use(express.static("public"));

// Middleware
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

//import Env Variables
dotenv.config();

const port = process.env.LOCAL_PORT;
const APIurl = 'https://www.googleapis.com/books/v1/volumes'


const db = new pg.Client({
    user: process.env.DATABASE_USER,
    host: process.env.DATABASE_HOST,
    database: process.env.DATABASE_NAME,
    password: process.env.DATABASE_PASSWORD,
    port: process.env.DATABASE_PORT, //postgresql 17
  });
  db.connect();



app.get("/", async (req, res) => {
    try {
        const result = await db.query(
            "SELECT books.id, book_name, author, note, rating, month, year FROM books INNER JOIN notes ON notes.book_id = books.id INNER JOIN ratings ON ratings.book_id = books.id INNER JOIN completion_date ON completion_date.book_id = books.id ORDER BY books.id DESC")

        const myBooksData = result.rows
        
        res.render("index.ejs", {
            myBooks: myBooksData,
        });        
    } catch (error) {
        console.log("Couldn't load data from Database")
        console.log(error.detail)
    }
})

//Port
app.listen(port, () =>{
    console.log("Server running at http://localhost:" + port);
})