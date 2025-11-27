const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3000;

const db = new sqlite3.Database('./mydatabase.db');

app.use(express.json());

const cors = require('cors');

app.use(cors());

app.post('/get-answer', (req, res) => {
    const questionText = req.body.question?.normalize('NFC').trim();

    if (!questionText) {
        return res.status(400).json({ error: "Please provide a question in JSON body" });
    }

    console.log(`Received question: ${questionText}`);

    const sql = `
        SELECT DISTINCT questionid, question, answer
        FROM Questions
        WHERE question LIKE ?
    `;

    db.all(sql, [`%${questionText}%`], (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Database error" });
        }

        if (rows.length === 0) {
            return res.json({ message: "No answers found" });
        }

        const results = rows.map(r => ({
            matchedQuestion: r.Question,
            answer: r.Answer
        }));

        res.json({
            searched: questionText,
            matches: results
        });

    });
});


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
