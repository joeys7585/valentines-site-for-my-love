// Quiz Data (loaded from JSON)
let quizData = [];

// Quiz State
let currentQuestion = 0;
let score = 0;

// Login State
const SECRET_PASSWORD = '060623';
let loginAttempts = 0;

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function () {
    // Login Elements
    const loginOverlay = document.getElementById('loginOverlay');
    const passwordInput = document.getElementById('passwordInput');
    const unlockBtn = document.getElementById('unlockBtn');
    const loginMessage = document.getElementById('loginMessage');

    // Quiz DOM Elements
    const questionText = document.getElementById('questionText');
    const optionsContainer = document.getElementById('optionsContainer');
    const nextBtn = document.getElementById('nextBtn');
    const progressBar = document.getElementById('progressBar');
    const currentQuestionSpan = document.getElementById('currentQuestion');
    const totalQuestionsSpan = document.getElementById('totalQuestions');
    const resultModal = document.getElementById('resultModal');
    const resultIcon = document.getElementById('resultIcon');
    const resultText = document.getElementById('resultText');
    const continueBtn = document.getElementById('continueBtn');
    const finalScreen = document.getElementById('finalScreen');
    const yesBtn = document.getElementById('yesBtn');
    const noBtn = document.getElementById('noBtn');
    const successScreen = document.getElementById('successScreen');

    // Login Handler
    function handleLogin() {
        const enteredPassword = passwordInput.value.trim();

        if (enteredPassword === SECRET_PASSWORD) {
            // Correct password - hide login and start quiz
            loginOverlay.classList.add('hidden');
            loadQuestions();
        } else {
            // Wrong password
            loginAttempts++;
            passwordInput.value = '';
            passwordInput.classList.add('shake');

            setTimeout(() => {
                passwordInput.classList.remove('shake');
            }, 500);

            if (loginAttempts >= 3) {
                // Show hint after 3 attempts
                loginMessage.textContent = "Hint: It's our wedding anniversary, pagli! 💕";
                loginMessage.className = 'login-message hint';
            } else {
                // Just show try again
                loginMessage.textContent = 'Wrong password! Try again 💔';
                loginMessage.className = 'login-message error';
            }
        }
    }

    // Login Event Listeners
    unlockBtn.addEventListener('click', handleLogin);
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    });

    // Focus on password input
    passwordInput.focus();

    // Load Questions from JSON
    async function loadQuestions() {
        try {
            const response = await fetch('questions.json');
            if (!response.ok) {
                throw new Error('Failed to load questions');
            }
            quizData = await response.json();
            console.log('Loaded questions:', quizData.length);
            if (quizData.length > 0) {
                initQuiz();
            } else {
                questionText.textContent = 'No questions found in questions.json';
            }
        } catch (error) {
            console.error('Error loading questions:', error);
            questionText.textContent = 'Error loading questions. Please make sure questions.json exists.';
        }
    }

    // Initialize Quiz
    function initQuiz() {
        currentQuestion = 0;
        score = 0;
        totalQuestionsSpan.textContent = quizData.length;
        finalScreen.classList.remove('show');
        successScreen.classList.remove('show');
        document.querySelector('.valentine-content').style.display = 'block';
        nextBtn.style.display = 'none';
        resetNoButton();
        loadQuestion();
    }

    // Load Question
    function loadQuestion() {
        if (currentQuestion >= quizData.length) {
            showValentineQuestion();
            return;
        }

        const data = quizData[currentQuestion];
        questionText.textContent = data.question;
        currentQuestionSpan.textContent = currentQuestion + 1;

        // Update progress bar
        const progress = ((currentQuestion) / quizData.length) * 100;
        progressBar.style.width = progress + '%';

        // Clear previous options
        optionsContainer.innerHTML = '';

        // Create option elements
        const letters = ['A', 'B', 'C', 'D'];
        data.options.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'option';
            optionElement.innerHTML = `
                <span class="option-letter">${letters[index]}</span>
                <span class="option-text">${option}</span>
            `;
            optionElement.addEventListener('click', () => selectAndCheckAnswer(index, optionElement));
            optionsContainer.appendChild(optionElement);
        });
    }

    // Select Option and Immediately Check Answer
    function selectAndCheckAnswer(index, element) {
        const data = quizData[currentQuestion];
        const options = document.querySelectorAll('.option');
        const resultContent = resultModal.querySelector('.result-content');

        // Mark selected option
        element.classList.add('selected');

        // Disable all options immediately
        options.forEach(opt => opt.classList.add('disabled'));

        // Show correct/incorrect styling
        options.forEach((opt, i) => {
            if (i === data.correct) {
                opt.classList.add('correct');
            } else if (i === index && index !== data.correct) {
                opt.classList.add('incorrect');
            }
        });

        // Show result modal with feedback
        if (index === data.correct) {
            score++;
            resultIcon.textContent = '🎉';
            resultText.textContent = 'Yay, you know it!';
            resultContent.className = 'result-content correct';
        } else {
            resultIcon.textContent = '😅';
            resultText.textContent = 'I will speak to you later!';
            resultContent.className = 'result-content incorrect';
        }

        // Short delay before showing modal for visual feedback
        setTimeout(() => {
            resultModal.classList.add('show');
        }, 400);
    }

    // Continue to Next Question
    function continueQuiz() {
        resultModal.classList.remove('show');
        currentQuestion++;

        if (currentQuestion < quizData.length) {
            loadQuestion();
        } else {
            showValentineQuestion();
        }
    }

    // Show Valentine's Question
    function showValentineQuestion() {
        progressBar.style.width = '100%';
        finalScreen.classList.add('show');
        resetNoButton();
    }

    // Reset No button position
    function resetNoButton() {
        if (noBtn) {
            noBtn.style.left = '';
            noBtn.style.top = '';
            noBtn.style.right = '';
            noBtn.style.position = 'relative';
        }
    }

    // Make No button run away from cursor
    function runAway(e) {
        const buttonRect = noBtn.getBoundingClientRect();
        const containerRect = noBtn.parentElement.getBoundingClientRect();

        // Calculate distance from mouse to button center
        const buttonCenterX = buttonRect.left + buttonRect.width / 2;
        const buttonCenterY = buttonRect.top + buttonRect.height / 2;
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        const distance = Math.sqrt(
            Math.pow(mouseX - buttonCenterX, 2) +
            Math.pow(mouseY - buttonCenterY, 2)
        );

        // Only run if mouse is close
        if (distance < 100) {
            noBtn.style.position = 'absolute';

            // Calculate new position away from mouse
            const angle = Math.atan2(buttonCenterY - mouseY, buttonCenterX - mouseX);
            const moveDistance = 150;

            let newX = (buttonRect.left - containerRect.left) + Math.cos(angle) * moveDistance;
            let newY = (buttonRect.top - containerRect.top) + Math.sin(angle) * moveDistance;

            // Keep within container bounds
            const maxX = containerRect.width - buttonRect.width - 10;
            const maxY = containerRect.height - buttonRect.height - 10;

            newX = Math.max(10, Math.min(newX, maxX));
            newY = Math.max(10, Math.min(newY, maxY));

            // Randomize a bit for fun
            newX += (Math.random() - 0.5) * 50;
            newY += (Math.random() - 0.5) * 30;

            noBtn.style.left = newX + 'px';
            noBtn.style.top = newY + 'px';
        }
    }

    // Make Yes button grow when hovered
    function growYes() {
        yesBtn.classList.add('growing');
    }

    function shrinkYes() {
        yesBtn.classList.remove('growing');
    }

    // Handle Yes click - show success!
    function handleYes() {
        document.querySelector('.valentine-content').style.display = 'none';
        successScreen.classList.add('show');
    }

    // Event Listeners
    continueBtn.addEventListener('click', continueQuiz);

    // Valentine button interactions
    if (noBtn) {
        noBtn.addEventListener('mouseover', runAway);
        noBtn.addEventListener('mousemove', runAway);
        noBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            runAway({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY });
        });
    }

    if (yesBtn) {
        yesBtn.addEventListener('mouseenter', growYes);
        yesBtn.addEventListener('mouseleave', shrinkYes);
        yesBtn.addEventListener('click', handleYes);
    }
});
