document.addEventListener('DOMContentLoaded', () => {
    const checkWordsBtn = document.getElementById('checkWordsBtn');
    const submitTeamBtn = document.getElementById('submitTeamBtn');
    
    // "about" "heard" "reputation" "you've" "probably"
    const expectedWords = ["about", "heard", "reputation", "you've", "probably"];
    
    if (checkWordsBtn) {
        checkWordsBtn.addEventListener('click', () => {
            const w1 = document.getElementById('word1').value.trim().toLowerCase();
            const w2 = document.getElementById('word2').value.trim().toLowerCase();
            const w3 = document.getElementById('word3').value.trim().toLowerCase();
            const w4 = document.getElementById('word4').value.trim().toLowerCase();
            const w5 = document.getElementById('word5').value.trim().toLowerCase();
            
            // Clean up smart quotes and normalize apostrophe
            const sanitize = (str) => str.replace(/['']/g, "'").trim().toLowerCase();
            
            if (
                sanitize(w1) === expectedWords[0] &&
                sanitize(w2) === expectedWords[1] &&
                sanitize(w3) === expectedWords[2] &&
                sanitize(w4) === expectedWords[3] &&
                sanitize(w5) === expectedWords[4]
            ) {
                // Success
                document.getElementById('wordError').classList.add('d-none');
                
                // Animate transition using simple CSS visibility toggle
                document.getElementById('wordForm').classList.add('d-none');
                document.getElementById('teamForm').classList.remove('d-none');
            } else {
                // Failure
                document.getElementById('wordError').classList.remove('d-none');
            }
        });
        
        // Handle Enter key for the word inputs
        const wordInputs = [
            document.getElementById('word1'),
            document.getElementById('word2'),
            document.getElementById('word3'),
            document.getElementById('word4'),
            document.getElementById('word5')
        ];
        wordInputs.forEach((input, index) => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    if (index < wordInputs.length - 1) {
                        wordInputs[index + 1].focus();
                    } else {
                        checkWordsBtn.click();
                    }
                }
            });
        });
    }
    
    if (submitTeamBtn) {
        submitTeamBtn.addEventListener('click', () => {
            const teamSelect = document.getElementById('teamSelect');
            const team = teamSelect.value;
            
            if (team) {
                // Base64 encode the team name
                const base64Str = btoa(team);
                document.getElementById('base64Team').textContent = base64Str;
                
                // Show modal
                const modalEl = document.getElementById('successModal');
                const myModal = new bootstrap.Modal(modalEl);
                myModal.show();
            } else {
                // Shake the select or alert
                teamSelect.classList.add('is-invalid');
                setTimeout(() => teamSelect.classList.remove('is-invalid'), 1500);
            }
        });
    }
});
