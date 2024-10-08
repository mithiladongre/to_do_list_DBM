import express from "express";
import sqlite3 from 'sqlite3';
import cors from "cors";
import bodyParser from 'body-parser';
import bcrypt from "bcrypt";
import cookieParser from 'cookie-parser';
import session from "express-session";

// Initialize SQLite database connection
let db = new sqlite3.Database('./database/to_do_list.db', (err) => {
    if (err) {
        console.log('Could not connect to database', err);
    } else {
        console.log('Connected to SQLite database');
    }
});

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(cookieParser());
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true, 
    cookie: {
        secure: false, // Use true for HTTPS
        maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
}));

// Register route
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        // Check if username already exists
        db.get("SELECT * FROM users WHERE username = ?", [username], async (err, user) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            if (user) {
                return res.status(400).send("Username already exists. Try logging in.");
            }
            // Hash the password and insert the new user
            const hashedPassword = await bcrypt.hash(password, 10);
            db.run("INSERT INTO users (username, password) VALUES (?, ?)", [username, hashedPassword], (insertErr) => {
                if (insertErr) {
                    return res.status(500).json({ error: 'Database insert error' });
                }
                res.status(200).json({ message: "SignUp successful", redirectUrl: "/" });
            });
        });
    } catch (insertError) {
        console.error('Registering:', insertError.message);
        res.status(500).send('Server error while inserting user');
    }
});

// Login route
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        // Get the user by username
        db.get("SELECT * FROM users WHERE username = ?", [username], async (err, user) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            if (!user) {
                return res.status(404).send("User not found");
            }
            // Compare hashed passwords
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (passwordMatch) {
                // req.session.username = user.username; // Set session username
                req.session.user_id=user.id;
                res.status(200).json({ login: true });
            } else {
                res.status(200).json({ login: false });
            }
        });
    } catch (err) {
        console.error("Login=>", err.message);
        res.status(500).send('Server error');
    }
});

// Route to check if the user is logged in (session-based)
app.get("/home", (req, res) => {
    if (req.session.user_id) {
        return res.json({ valid: true, user_id: req.session.user_id });
    } else {
        return res.json({ valid: false });
    }
});

app.get("/content", (req, res) => {
    try {
        db.all("SELECT list.id,title,status FROM list JOIN users ON users.id=list.user_id WHERE user_id= ? ;", [req.session.user_id], (err, rows) => {
            if (err) {
                console.error("Error in fetching data from the database: ", err);
                return res.status(500).json({ error: 'Database error' });
            }
            res.json({rows});
        });
    } catch (err) {
        console.error("Error in fetching data from the database: ", err);
        res.status(500).send('Server error');
    }
});

app.post("/add",(req,res)=>{
    const data=req.body.newEntry;
    console.log("Data received for adding: ",data);
    try{
        db.run("INSERT INTO list (user_id, title, status) VALUES (?,?,?);",[req.session.user_id,data.title,data.status],(err,res)=>{
            if(err){
                console.error("Error in adding the item (server-database): ",err);
            }else{
                console.log("item added successfully! ",data);
            }
        });
    }catch(err){
        console.log("Error in adding ( server ): ",err);
    }
});

app.delete("/delete", (req, res) => {
    const { id } = req.body;
    console.log("Item called for deletion:", id);

    try {
        db.run("DELETE FROM list WHERE id = ?", [id],(err)=>{
            if (err) {
                console.error("Error in deleting the item (server-database):", err);
                return res.status(500).json({ message: "Failed to delete the item" });
            }
            res.status(200).json({ message: "Item deleted successfully" });
        });
    } catch (error) {
        console.error("Error in deleting the item (server):", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.patch("/mark",(req,res)=>{
    const {id}=req.body;
    console.log("item received for marking: ",id);
    try{
        db.run("UPDATE list SET status = CASE WHEN status = 1 THEN 0 ELSE 1 END WHERE id = ?;",[id],(err)=>{
            if (err) {
                console.error("Error in marking the item (server-database):", err);
                return res.status(500).json({ message: "Failed to marking the item" });
            }
            res.status(200).json({ message: "Item marked successfully" });
        })
    }catch(error){
        console.error("Error in marking the item (server):", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.patch("/update", (req, res) => {
    const { id, title } = req.body; // Destructure both id and title
    console.log("Item received for update:", id, "--", title);
  
    try {
      // Update the title where the id matches
      db.run("UPDATE list SET title = ? WHERE id = ?;", [title, id], (err) => {
        if (err) {
          console.error("Error in updating the item (server-database):", err);
          return res.status(500).json({ message: "Failed to update the item" });
        }
        res.status(200).json({ message: "Item updated successfully" });
      });
    } catch (error) {
      console.error("Error in updating the item (server):", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
