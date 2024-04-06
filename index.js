// index.js

const express = require('express');
const bodyParser = require('body-parser');
const questions = require('./questions.json');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('home');
});

// Route to serve the quiz interface for each question
app.get('/quiz/:questionIndex', (req, res) => {
    try {
        const questionIndex = parseInt(req.params.questionIndex);
        // Ensure the question index is within bounds
        if (questionIndex >= 1 && questionIndex <= questions.length) {
            const question = questions[questionIndex - 1].question; // Adjusted index to start from 0
            const options = questions[questionIndex - 1].options; // Adjusted index to start from 0
            res.render('quiz', { questionIndex: questionIndex, question: question, options: options });
        } else {
            // Handle invalid question index, redirect or show an error page
            res.status(404).render('questionNotFound');
        }
    } catch (error) {
        // Handle any unexpected errors
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Array to store feedback for each question
let feedbackArray = [];

// Route to handle quiz submissions for each question
app.post('/submit/:questionIndex', (req, res) => {
    const questionIndex = parseInt(req.params.questionIndex);
    const submittedAnswer = req.body.answer;
    const correctAnswer = questions[questionIndex - 1].answer; // Adjusted index to start from 0
    const isCorrect = correctAnswer === submittedAnswer;

    const feedback = {
        questionIndex: questionIndex,
        question: questions[questionIndex - 1].question, // Adjusted index to start from 0
        submittedAnswer: submittedAnswer,
        correctAnswer: correctAnswer,
        isCorrect: isCorrect
    };

    // Push the feedback to the array
    feedbackArray.push(feedback);

    // If all questions have been submitted, redirect to the score page
    if (questionIndex === questions.length) {
        res.redirect('/score');
    } else {
        // Redirect to the next question
        res.redirect(`/quiz/${questionIndex + 1}`);
    }
});

// Route to display final score
app.get('/score', (req, res) => {
    // Calculate final score based on the feedback array
    const finalScore = feedbackArray.filter(feedback => feedback.isCorrect).length;
    ;
    // Render the score page with the final score and feedback array
    res.render('score', { finalScore: finalScore, totalQuestions: questions.length, feedbackArray: feedbackArray });
    feedbackArray = [];
});

// Catch-all route for unmatched endpoints
app.use((req, res) => {
    res.status(404).render('error');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
