const fs = require('fs');
const { JSDOM } = require('jsdom');

describe('Dictionary App', () => {
  let dom, document, window, fetchMock;

  beforeEach(() => {
    const html = fs.readFileSync('./index.html', 'utf8');
    dom = new JSDOM(html, { runScripts: 'dangerously', resources: 'usable' });
    document = dom.window.document;
    window = dom.window;

    const scriptContent = fs.readFileSync('./index.js', 'utf8'); // Assuming script is index.js
    const scriptEl = document.createElement('script');
    scriptEl.textContent = scriptContent;
    document.body.appendChild(scriptEl);

    fetchMock = jest.fn();
    window.fetch = fetchMock;
  });

  test('handles empty search', () => {
    const input = document.getElementById('word-input');
    input.value = '';
    const form = document.getElementById('search-form');
    form.dispatchEvent(new window.Event('submit'));
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('displays results for valid word', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([{
        word: 'test',
        phonetic: '/tɛst/',
        phonetics: [{ audio: 'audio.mp3' }],
        meanings: [{
          partOfSpeech: 'noun',
          definitions: [{ definition: 'A procedure.', example: 'Run a test.' }],
          synonyms: ['trial']
        }]
      }])
    });

    const input = document.getElementById('word-input');
    input.value = 'test';
    const form = document.getElementById('search-form');
    form.dispatchEvent(new window.Event('submit'));

    await Promise.resolve();

    const results = document.getElementById('results');
    expect(results.innerHTML).toContain('test');
    expect(results.innerHTML).toContain('/tɛst/');
    expect(results.innerHTML).toContain('A procedure.');
    expect(results.innerHTML).toContain('Synonyms: trial');
  });

  test('handles word not found', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false });

    const input = document.getElementById('word-input');
    input.value = 'unknown';
    const form = document.getElementById('search-form');
    form.dispatchEvent(new window.Event('submit'));

    await Promise.resolve();

    const results = document.getElementById('results');
    expect(results.innerHTML).toContain('Word not found');
  });

  test('toggles theme', () => {
    const toggle = document.getElementById('theme-toggle');
    toggle.dispatchEvent(new window.Event('click'));
    expect(document.body.classList.contains('dark-theme')).toBe(true);
    toggle.dispatchEvent(new window.Event('click'));
    expect(document.body.classList.contains('dark-theme')).toBe(false);
  });
});