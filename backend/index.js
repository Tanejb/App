const express = require('express');
const path = require('path');
const app = express();
const bodyParser= require('body-parser');

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(bodyParser.json()); 
app.set('view engine', 'ejs');

const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, getDoc, doc, query, where, addDoc } = require("firebase/firestore");
const firebaseConfig = require("./firebaseConfig");

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/categories', async (req, res) => {
    try {
        const categoriesRef = collection(db, 'categories');
        const categoriesSnapshot = await getDocs(categoriesRef);
        const categories = categoriesSnapshot.docs.map(doc => ({
            id: doc.id, 
            ...doc.data()
        }));

        res.render('categories', {categories});
    } catch (error) {
        console.error('Napaka pri pridobivanju kategorij:', error);
        res.status(500).json({ error: 'Napaka pri pridobivanju kategorij' });
    }
});

app.get('/categories/:id', async (req, res) => {
    const categoryId = req.params.id;
    try {
        const categoryRef = doc(db, 'categories', categoryId);
        const categoryDoc = await getDoc(categoryRef);
        if (!categoryDoc.exists()) {
            return res.status(404).send('Kategorija ne obstaja');
        }

        const quizzesRef = collection(db, 'quizzes');
        const q = query(quizzesRef, where('categoryId', '==', categoryRef));
        const quizzesSnapshot = await getDocs(q);
        const quizzes = quizzesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        const category = categoryDoc.data();
        res.render('categories-details', { category, quizzes });
    } catch (error) {
        console.error('Napaka pri pridobivanju kategorije ali kvizov:', error);
        res.status(500).send('Notranja napaka strežnika');
    }
});

app.get('/quizzes/:id', async (req, res) => {
    const quizId = req.params.id;

    try {
        const quizRef = doc(db, 'quizzes', quizId);
        const quizDoc = await getDoc(quizRef);
        if (!quizDoc.exists()) {
            return res.status(404).send('Kviz ne obstaja');
        }

        const questionsRef = collection(db, 'questions');
        const q = query(questionsRef, where('quizId', '==', quizRef));
        const questionsSnapshot = await getDocs(q);
        const questions = questionsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        const quiz = { id: quizDoc.id, ...quizDoc.data() };

        res.render('quiz-detail', { quiz, questions });
    } catch (error) {
        console.error('Napaka pri pridobivanju kviza ali vprašanj:', error);
        res.status(500).send('Notranja napaka strežnika');
    }
});

app.post('/submit-quiz/:id', async (req, res) => {
    const quizId = req.params.id;
    const userAnswers = req.body;

    try {
        const quizRef = doc(db, 'quizzes', quizId);
        const quizDoc = await getDoc(quizRef);
        if (!quizDoc.exists()) {
            return res.status(404).send('Kviz ne obstaja');
        }

        const questionsRef = collection(db, 'questions');
        const q = query(questionsRef, where('quizId', '==', quizRef));
        const questionsSnapshot = await getDocs(q);
        const questions = questionsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        let score = 0;
        const results = questions.map(question => {
            const correctAnswer = question.correct_answer;
            const userAnswer = userAnswers[`question-${question.id}`];
            const isCorrect = parseInt(userAnswer) === correctAnswer;

            if (isCorrect) {
                score += 10;
            }

            return {
                question: question.question,
                correctAnswer: question.options[correctAnswer],
                userAnswer: question.options[parseInt(userAnswer)],
                isCorrect
            };
        });

        await addDoc(collection(db, 'results'), {
            quizId: quizRef,
            score,
            completed_at: new Date()
        });

        res.render('quiz-result', { quiz: quizDoc.data(), results, score });
    } catch (error) {
        console.error('Napaka pri oddaji kviza:', error);
        res.status(500).send('Notranja napaka strežnika');
    }
});

app.listen(3000, () => {
    console.log(`Strežnik posluša na portu 3000`);
});