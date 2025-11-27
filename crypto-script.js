// Crypto puzzle logic
class CryptoPuzzle {
    constructor() {
        this.letterMap = new Map();
        this.totalCells = 0;
        this.filledCells = 0;
        this.correctAnswers = {
            // Row answers: [row_index, start_col, answer]
            rows: [
                [0, 3, 'GRAAN'],    // Row 1: G + RAAN
                [1, 2, 'KISTEN'],   // Row 2: KI + S + TEN
                [2, 1, 'KOSTEN'],   // Row 3: KO + S + TEN
                [3, 0, 'ELEMENT'],  // Row 4: ELEM + E + NT
                [4, 1, 'SALON'],    // Row 5: SA + L + ON
                [5, 2, 'KLAAR'],    // Row 6: KL + A + AR
                [6, 1, 'BIER']      // Row 7: BI + E + R
            ]
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.countTotalCells();
        this.updateProgress();
        this.addAnimationEffects();
    }

    setupEventListeners() {
        const inputs = document.querySelectorAll('.letter-input');
        
        inputs.forEach(input => {
            input.addEventListener('input', (e) => this.handleInput(e));
            input.addEventListener('keydown', (e) => this.handleKeydown(e));
            input.addEventListener('focus', (e) => this.handleFocus(e));
            input.addEventListener('blur', (e) => this.handleBlur(e));
        });
    }

    handleInput(e) {
        const input = e.target;
        const number = input.dataset.number;
        const letter = input.value.toUpperCase();

        // Only allow letters
        if (letter && !/[A-Z]/.test(letter)) {
            input.value = '';
            return;
        }

        // Update all cells with the same number (except blank cells which are independent)
        if (number !== 'blank') {
            if (letter) {
                this.letterMap.set(number, letter);
                this.updateAllCellsWithNumber(number, letter);
            } else {
                this.letterMap.delete(number);
                this.updateAllCellsWithNumber(number, '');
            }
        }

        // Auto-navigate to next cell in the same row if letter was entered
        if (letter) {
            this.navigateToNextCellInRow(input);
        }

        this.updateProgress();
        this.checkAnswers();
        this.checkCompletion();
        this.addRippleEffect(input.parentElement);
    }

    handleKeydown(e) {
        // Allow navigation with arrow keys
        if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
            e.preventDefault();
            this.navigateGrid(e.target, e.key);
        }
        
        // Allow backspace and delete
        if (e.key === 'Backspace' || e.key === 'Delete') {
            e.target.value = '';
            this.handleInput(e);
        }
    }

    handleFocus(e) {
        e.target.parentElement.style.transform = 'scale(1.1)';
        e.target.parentElement.style.zIndex = '10';
    }

    handleBlur(e) {
        e.target.parentElement.style.transform = 'scale(1)';
        e.target.parentElement.style.zIndex = '1';
    }

    navigateGrid(currentInput, direction) {
        const inputs = Array.from(document.querySelectorAll('.letter-input'));
        const currentIndex = inputs.indexOf(currentInput);
        
        let nextIndex;
        const gridWidth = 8;
        
        switch (direction) {
            case 'ArrowLeft':
                nextIndex = currentIndex - 1;
                break;
            case 'ArrowRight':
                nextIndex = currentIndex + 1;
                break;
            case 'ArrowUp':
                nextIndex = currentIndex - gridWidth;
                break;
            case 'ArrowDown':
                nextIndex = currentIndex + gridWidth;
                break;
        }
        
        if (nextIndex >= 0 && nextIndex < inputs.length) {
            inputs[nextIndex].focus();
        }
    }

    navigateToNextCellInRow(currentInput) {
        const allInputs = Array.from(document.querySelectorAll('.letter-input'));
        const currentIndex = allInputs.indexOf(currentInput);
        const gridWidth = 8;
        
        // Calculate current row
        const currentRow = Math.floor(currentIndex / gridWidth);
        const currentCol = currentIndex % gridWidth;
        
        // Find next input in the same row
        for (let col = currentCol + 1; col < gridWidth; col++) {
            const nextIndex = currentRow * gridWidth + col;
            if (nextIndex < allInputs.length) {
                const nextInput = allInputs[nextIndex];
                // Check if this input exists and is visible (not in an empty cell)
                if (nextInput && nextInput.parentElement.classList.contains('number-cell')) {
                    nextInput.focus();
                    nextInput.select(); // Select any existing text for easy replacement
                    break;
                }
            }
        }
    }

    updateAllCellsWithNumber(number, letter) {
        // Don't sync blank cells
        if (number === 'blank') return;
        
        const cells = document.querySelectorAll(`[data-number="${number}"]`);
        cells.forEach(cell => {
            const input = cell.querySelector('.letter-input');
            if (input) {
                input.value = letter;
                
                // Add visual feedback
                if (letter) {
                    input.classList.add('correct');
                    cell.style.animation = 'cellGlow 0.5s ease-in-out';
                } else {
                    input.classList.remove('correct');
                }
            }
        });
        
        // Check answers after syncing
        setTimeout(() => {
            this.checkAnswers();
        }, 50);
    }

    countTotalCells() {
        this.totalCells = document.querySelectorAll('.letter-input').length;
    }

    updateProgress() {
        this.filledCells = Array.from(document.querySelectorAll('.letter-input'))
            .filter(input => input.value.trim() !== '').length;
        
        const progress = (this.filledCells / this.totalCells) * 100;
        const progressFill = document.getElementById('progressFill');
        
        if (progressFill) {
            progressFill.style.width = `${progress}%`;
        }
    }

    checkAnswers() {
        const allInputs = Array.from(document.querySelectorAll('.letter-input'));
        const gridWidth = 8;

        this.correctAnswers.rows.forEach(([rowIndex, startCol, answer]) => {
            let isRowCorrect = true;
            const rowInputs = [];

            // Get all inputs for this row
            for (let i = 0; i < answer.length; i++) {
                const inputIndex = rowIndex * gridWidth + startCol + i;
                if (inputIndex < allInputs.length) {
                    const input = allInputs[inputIndex];
                    if (input && input.parentElement.classList.contains('number-cell')) {
                        rowInputs.push(input);
                        if (input.value.toUpperCase() !== answer[i]) {
                            isRowCorrect = false;
                        }
                    }
                }
            }

            // Apply feedback after 500ms delay
            if (isRowCorrect && rowInputs.length === answer.length) {
                setTimeout(() => {
                    rowInputs.forEach(input => {
                        if (input.parentElement.classList.contains('white')) {
                            input.classList.add('correct-answer');
                        }
                    });
                }, 500);
            } else {
                // Remove correct styling if answer becomes incorrect
                rowInputs.forEach(input => {
                    input.classList.remove('correct-answer');
                });
            }
        });
    }

    checkCompletion() {
        if (this.filledCells === this.totalCells) {
            // Add a small delay for better UX
            setTimeout(() => {
                this.showSuccessMessage();
            }, 500);
        }
    }

    showSuccessMessage() {
        const successMessage = document.getElementById('successMessage');
        successMessage.classList.add('show');
        
        // Add confetti effect
        this.createConfetti();
        
        // Redirect after 3 seconds
        setTimeout(() => {
            window.location.href = 'vienna.html';
        }, 3000);
    }

    addRippleEffect(element) {
        const ripple = document.createElement('div');
        ripple.className = 'ripple-effect';
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.6);
            transform: scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
            top: 50%;
            left: 50%;
            width: 20px;
            height: 20px;
            margin-top: -10px;
            margin-left: -10px;
        `;
        
        element.style.position = 'relative';
        element.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    createConfetti() {
        const colors = ['#FFD700', '#3B82F6', '#06B6D4', '#10B981', '#34D399'];
        
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.style.cssText = `
                    position: fixed;
                    width: 10px;
                    height: 10px;
                    background: ${colors[Math.floor(Math.random() * colors.length)]};
                    left: ${Math.random() * 100}vw;
                    top: -10px;
                    z-index: 1001;
                    border-radius: 50%;
                    pointer-events: none;
                    animation: confettiFall 3s linear forwards;
                `;
                
                document.body.appendChild(confetti);
                
                setTimeout(() => {
                    confetti.remove();
                }, 3000);
            }, i * 50);
        }
    }

    addAnimationEffects() {
        // Add hover effects to grid cells
        const cells = document.querySelectorAll('.grid-cell.number-cell');
        cells.forEach(cell => {
            cell.addEventListener('mouseenter', () => {
                cell.style.transform = 'scale(1.05) rotate(2deg)';
            });
            
            cell.addEventListener('mouseleave', () => {
                cell.style.transform = 'scale(1) rotate(0deg)';
            });
        });

        // Add typing sound effect (visual feedback)
        const inputs = document.querySelectorAll('.letter-input');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                input.style.animation = 'none';
                setTimeout(() => {
                    input.style.animation = 'typeEffect 0.3s ease-out';
                }, 10);
            });
        });
    }
}

// Add CSS animations dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    @keyframes confettiFall {
        to {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
        }
    }
    
    @keyframes typeEffect {
        0% {
            transform: scale(1.2);
            background: rgba(16, 185, 129, 0.5);
        }
        100% {
            transform: scale(1);
            background: rgba(16, 185, 129, 0.3);
        }
    }
`;
document.head.appendChild(style);

// Initialize the puzzle when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new CryptoPuzzle();
    
    // Add some initial animation delays
    const cells = document.querySelectorAll('.grid-cell.number-cell');
    cells.forEach((cell, index) => {
        cell.style.animationDelay = `${index * 0.1}s`;
    });
    
    // Add welcome message
    setTimeout(() => {
        const welcomeToast = document.createElement('div');
        welcomeToast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(255, 255, 255, 0.9);
            padding: 1rem 2rem;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            animation: slideInRight 0.5s ease-out;
            font-weight: 500;
            color: #1a1a1a;
        `;
        welcomeToast.textContent = '💡 Same numbers = same letters!';
        document.body.appendChild(welcomeToast);
        
        setTimeout(() => {
            welcomeToast.style.animation = 'slideOutRight 0.5s ease-out forwards';
            setTimeout(() => welcomeToast.remove(), 500);
        }, 4000);
    }, 2000);
});

// Add slide out animation
const slideOutStyle = document.createElement('style');
slideOutStyle.textContent = `
    @keyframes slideOutRight {
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(slideOutStyle);
