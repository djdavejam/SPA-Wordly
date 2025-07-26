document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('search-form');
    const input = document.getElementById('word-input');
    const results = document.getElementById('results');
    const themeToggle = document.getElementById('theme-toggle');

    let savedWords = JSON.parse(localStorage.getItem('savedWords')) || [];

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const word = input.value.trim();
        if (!word) return;

        try {
            const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
            if (!response.ok) throw new Error('Word not found');
            const [data] = await response.json();
            displayResults(data);
        } catch (error) {
            results.innerHTML = `<p class="error">${error.message}</p>`;
        }
    });

    function displayResults(data) {
        results.innerHTML = '';
        const isSaved = savedWords.includes(data.word);

        const wordEl = document.createElement('h2');
        wordEl.textContent = data.word;
        results.appendChild(wordEl);

        if (data.phonetic) {
            const phoneticEl = document.createElement('p');
            phoneticEl.textContent = `Pronunciation: ${data.phonetic}`;
            results.appendChild(phoneticEl);
        }

        const audio = data.phonetics.find(p => p.audio);
        if (audio) {
            const audioEl = document.createElement('audio');
            audioEl.src = audio.audio;
            audioEl.controls = true;
            results.appendChild(audioEl);
        }

        data.meanings.forEach(meaning => {
            const defDiv = document.createElement('div');
            defDiv.classList.add('definition');
            if (isSaved) defDiv.classList.add('saved');

            const pos = document.createElement('h3');
            pos.textContent = meaning.partOfSpeech;
            defDiv.appendChild(pos);

            meaning.definitions.forEach(def => {
                const defP = document.createElement('p');
                defP.textContent = def.definition;
                defDiv.appendChild(defP);

                if (def.example) {
                    const exP = document.createElement('p');
                    exP.textContent = `Example: ${def.example}`;
                    defDiv.appendChild(exP);
                }
            });

            if (meaning.synonyms.length) {
                const synP = document.createElement('p');
                synP.textContent = `Synonyms: ${meaning.synonyms.join(', ')}`;
                defDiv.appendChild(synP);
            }

            results.appendChild(defDiv);
        });

        const saveBtn = document.createElement('button');
        saveBtn.textContent = isSaved ? 'Unsave' : 'Save';
        saveBtn.addEventListener('click', () => {
            if (isSaved) {
                savedWords = savedWords.filter(w => w !== data.word);
            } else {
                savedWords.push(data.word);
            }
            localStorage.setItem('savedWords', JSON.stringify(savedWords));
            displayResults(data); // Refresh
        });
        results.appendChild(saveBtn);
    }

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
    });
});