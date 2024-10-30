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

app.get("/search", async (req, res) => {
    const searchInput = req.query.search
    const apiRequest = await axios.get(APIurl + "?q=" + searchInput + "&printType=books&startIndex=0&maxResults=15")
    const result = apiRequest.data.items //apiRequest.data.items for nested objects content
    //const bookInfo = result[0].volumeInfo
    //const searchInfo = result[0].searchInfo
    //const thumbnails = result[0].volumeInfo.imageLinks
    //const googleId = result[0].id

    //console.log("Google ID:");
    //console.log(googleId);
    //console.log("result:");
    //console.log(result);
    //console.log("bookInfo:");    
    //console.log(bookInfo);  

    res.render("search.ejs", {
        books: result,
        //apiId: result.id,
        //volumeInfo: bookInfo,
        //textSnippet: searchInfo.textSnippet,
        //thumbnails: thumbnails
    })
})

app.post("/add", async (req, res) => {
    const bookId = req.body.bookApiId
    try {
        const result = await axios.get(APIurl + "/" + bookId)
        const bookInfo = result.data 

        res.render("input.ejs", {
            book: bookInfo
        })
    } catch (error) {
        console.log(error)
        console.log("Error fetching from API")
    }
})

app.post("/add-toList", async (req, res) => {
    
        try {
            const authors = book.volumeInfo.authors ? book.volumeInfo.authors.join(', ') : "(n/a)";
            await db.query("INSERT INTO books (book_name, author) VALUES ($1, $2)",
            [book.volumeInfo.title, authors]);

            res.redirect("/")
        } catch (error) {
            console.log(error)
            console.log("Error saving into database")
        }    
})

//Port
app.listen(port, () =>{
    console.log("Server running at http://localhost:" + port);
})