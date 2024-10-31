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
            "SELECT books.id, book_name, author, api_id, note, rating, month, year, small_image FROM books INNER JOIN notes ON notes.book_id = books.id INNER JOIN ratings ON ratings.book_id = books.id INNER JOIN completion_date ON completion_date.book_id = books.id INNER JOIN thumbnails ON thumbnails.book_id = books.id ORDER BY books.id DESC");

        const myBooksData = result.rows
        
        res.render("index.ejs", {
            myBooks: myBooksData,
        });        
    } catch (error) {
        console.log("Couldn't load data from Database")
        console.log(error.detail)
    }
})

app.get("/edit", async (req, res) => {
    const id = req.query.apiId
    try {
        const result = await db.query("SELECT books.id, book_name, author, api_id, note,rating, month, year, small_image FROM books INNER JOIN notes ON notes.book_id = books.id INNER JOIN ratings ON ratings.book_id = books.id INNER JOIN completion_date ON completion_date.book_id = books.id INNER JOIN thumbnails ON thumbnails.book_id = books.id WHERE api_id = $1", [id]);
        const bookToEdit = result.rows[0]

        res.render("input.ejs", {
            toEdit : bookToEdit,
        })
        
    } catch (error) {
        console.log("Error finding book id on Database.", error)
    }    
})

app.post("/edit/submit", async (req,res) => {
    const request = req.body
    try {
        const result = await db.query("SELECT books.id, book_name, author, api_id, note, rating, month, year FROM books INNER JOIN notes ON notes.book_id = books.id INNER JOIN ratings ON ratings.book_id = books.id INNER JOIN completion_date ON completion_date.book_id = books.id WHERE api_id = $1", [request.bookId]);
        const current = result.rows[0]

        try {
            await db.query("BEGIN");
            if(request.year !== current.year) {
                await db.query("UPDATE completion_date SET year = $1 WHERE book_id = $2", [request.year, current.id]);
            }
            if(request.month !== current.month) {
                await db.query("UPDATE completion_date SET month = $1 WHERE book_id = $2", [request.month, current.id]);
            }
            if(request.rating !== current.rating) {
                await db.query("UPDATE ratings SET rating = $1 WHERE book_id = $2", [request.rating, current.id]);
            }
            if(request.notes.trim() !== current.note.trim()) { // trim is to deal with the break lines or unusual spaces
                await db.query("UPDATE notes SET note = $1 WHERE book_id = $2", [request.notes, current.id]);
            } 
            
            await db.query("COMMIT");

            res.redirect("/")

        } catch (error) {
            await db.query("ROLLBACK");
            console.log("Error saving the edited data.", error)
        }
    } catch (error) {
        console.log("Error retrieving data from the Database.", error)
    }    
})

app.get("/search", async (req, res) => {
    const searchInput = req.query.search
    const apiRequest = await axios.get(APIurl + "?q=" + searchInput + "&printType=books&startIndex=0&maxResults=15")
    const result = apiRequest.data.items //apiRequest.data.items for nested objects content
    res.render("search.ejs", {
        books: result,
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

app.post("/add/submit", async (req, res) => {
    
    const input = req.body
        try {
            await db.query("BEGIN");

            const returned = await db.query("INSERT INTO books (book_name, author, api_id) VALUES ($1, $2, $3) RETURNING id", [input.bookTitle, input.bookAuthor, input.bookId]);
            const id = returned.rows[0].id;

            await db.query("INSERT INTO completion_date (book_id, month, year) VALUES ($1, $2, $3)", [id, input.month, input.year]);
            await db.query("INSERT INTO notes (book_id, note) VALUES ($1, $2)", [id, input.notes]);
            await db.query("INSERT INTO ratings (book_id, rating) VALUES ($1, $2)", [id, input.rating]);
            await db.query("INSERT INTO thumbnails (book_id, small_image) VALUES ($1, $2)", [id, input.bookImage]);

            await db.query("COMMIT");

            res.redirect("/")

        } catch (error) {
            await db.query("ROLLBACK")
            console.log("Data NOT saved. Error saving into database:", error)
        }    
})

//Port
app.listen(port, () =>{
    console.log("Server running at http://localhost:" + port);
})