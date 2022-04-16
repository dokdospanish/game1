const $ = id => { return document.getElementById(id) };
const inputArea = $('input-area');
const letterboard = $('letterboard');
const historyBoard = $('history-board');
const popup = $('popup');
const keyboard = $('keyboard');
const letterKeys = [...keyboard.querySelectorAll('.letter')];
const topBlur = $('top-blurrer');
const help = $('help');
const congrats = $('congrats');

/* Close modal by clicking on backdrop (No dialog-inner-wrap parent means it's backdrop) */
congrats.addEventListener('click', function(e) {
  if(!e.target.closest('.dialog-inner-wrap')) {
    e.target.close();
  }
});

help.addEventListener('click', function(e) {
  if(!e.target.closest('.dialog-inner-wrap')) {
    closeHelp();
  }
});

function closeHelp() {
  help.close();
  help.querySelector('button').style.display='none';
}


/* ######################## */

// Get the root element
var r = document.querySelector(':root');

// Create a function for getting a variable value
function myFunction_get() {
  // Get the styles (properties and values) for the root
  var rs = getComputedStyle(r);
  // Alert the value of the --blue variable
  alert("The value of --top-blurrer-top is: " + rs.getPropertyValue('--top-blurrer-top'));
}
// Create a function for setting a variable value
function myFunction_set() {
  // Set the value of variable --blue to another value (in this case "lightblue")
  r.style.setProperty('--blue', 'lightblue');
}

/* ######################## */

/* GLOBAL */
let TODAYS_WORD = {
/*
  whole: '하늘',
  grammar: 'noun', <== to-be
  category: 'nature', <== to-be
  hint: '☁', <== to-be
	flattened: ['ㅎ, 'ㅏ', 'ㄴ', 'ㅡ', 'ㄹ'],
	syllables: [
              {flat: ['ㅎ, 'ㅏ'], type: 'ga'},
              {flat: ['ㄴ', 'ㅡ', 'ㄹ'], type: 'gon'},
				    ]
*/
}

let TRIES_COUNTER = 0;

let Han = {
  /* https://github.com/idw111/Han-disassemble/blob/825349137fad5a8b302a8b5be399831abcf1c8b0/index.js */
  chars: [
    ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'],
    ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'],
    ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ']
  ],

  deconstruct: function(text, options) {
    options = options || {};
    var flatten = options.flatten || false;
    if (typeof text !== 'string') return null;
    if (text.length === 0) return '';
    return Han._deconstructMultipleCharacters(text, flatten);
  },

  toString: function(text) {
    return Han.deconstruct(text, {flatten: true}).join('');
  },

  isHan: function(text) {
    const Han = Han.deconstruct(text.replace(/[a-zA-Z0-9 ]/g, ''));
    for (var i in Han) {
      if (typeof Han[i] === 'object') return true;
      if (Han.isConsonant(Han[i]) || Han.isVowel(Han[i])) return true;
    }
    return false;
  },

  equals: function(a, b) {
    if (a === b) return true;
    return Han.toString(a) === Han.toString(b);
  },

  isVowel: function(character) {
    if (!character) return false;
    for (var i in Han.chars[1]) {
      if (character === Han.chars[1][i]) return true;
    }
    return false;
  },

  isConsonant: function(character) {
    if (!character) return false;
    for (var i in Han.chars[0]) {
      if (character === Han.chars[0][i]) return true;
    }
    for (var j in Han.chars[2]) {
      if (character === Han.chars[2][j]) return true;
    }
    return false;
  },

  _deconstructSingleCharacter: function(singleCharacter, flatten) {
    var code = singleCharacter.charCodeAt(0);
    if (code === 32 || code === 39 || code === 44) return singleCharacter;
    if (Han.isConsonant(singleCharacter) || Han.isVowel(singleCharacter)) {
      if (flatten) return [singleCharacter];
      else return null;
    }
    if (code < 0xAC00 || code > 0xD7A3) return singleCharacter;
    code = code - 0xAC00;

    var last = code % 28;
    var vowel = ((code - last) / 28) % 21;
    var first = (((code - last) / 28) - vowel) / 21;
    var result = {
      first: Han.chars[0][first],
      vowel: Han.chars[1][vowel],
      last: Han.chars[2][last]
    };

    if (!flatten) return result;

    var flat = [];
    if (result.first) flat.push(result.first);
    if (result.vowel) flat.push(result.vowel);
    if (result.last) flat.push(result.last);

    return flat;
  },

  _deconstructMultipleCharacters: function(multipleCharacters, flatten) {
    var result = [];
    for (var i = 0; i < multipleCharacters.length; i++) {
      var deconstructd = Han._deconstructSingleCharacter(multipleCharacters.charAt(i), flatten);
      if (flatten) result = result.concat(deconstructd);
      else result.push(deconstructd);
    }
    return result;
  }
};

let Analyzer = {
  midDubs: {
    'ㅘ': ['ㅗ', 'ㅏ'],
    'ㅙ': ['ㅗ', 'ㅐ'],
    'ㅚ': ['ㅗ', 'ㅣ'],
    'ㅝ': ['ㅜ', 'ㅓ'],
    'ㅞ': ['ㅜ', 'ㅔ'],
    'ㅟ': ['ㅜ', 'ㅣ'],
    'ㅢ': ['ㅡ', 'ㅣ']
  },

  finDubs: {
    'ㄳ': ['ㄱ', 'ㅅ'],
    'ㄵ': ['ㄴ', 'ㅈ'],
    'ㄶ': ['ㄴ', 'ㅎ'],
    'ㄺ': ['ㄹ', 'ㄱ'],
    'ㄻ': ['ㄹ', 'ㅁ'],
    'ㄼ': ['ㄹ', 'ㅂ'],
    'ㄽ': ['ㄹ', 'ㅅ'],
    'ㄾ': ['ㄹ', 'ㅌ'],
    'ㄿ': ['ㄹ', 'ㅍ'],
    'ㅀ': ['ㄹ', 'ㅎ'],
    'ㅄ': ['ㅂ', 'ㅅ']
  },

  keyDict : {
    Q: 'ㅃ', W: 'ㅉ', E: 'ㄸ', R: 'ㄲ', T: 'ㅆ', Y: 'ㅛ', U: 'ㅕ', I: 'ㅑ', O: 'ㅒ', P: 'ㅖ',
    A: 'ㅁ', S: 'ㄴ', D: 'ㅇ', F: 'ㄹ', G: 'ㅎ', H: 'ㅗ', J: 'ㅓ', K: 'ㅏ', L: 'ㅣ',
    Z: 'ㅋ', X: 'ㅌ', C: 'ㅊ', V: 'ㅍ', B: 'ㅠ', N: 'ㅜ', M: 'ㅡ',

    q: 'ㅂ', w: 'ㅈ', e: 'ㄷ', r: 'ㄱ', t: 'ㅅ', y: 'ㅛ', u: 'ㅕ', i: 'ㅑ', o: 'ㅐ', p: 'ㅔ',
    a: 'ㅁ', s: 'ㄴ', d: 'ㅇ', f: 'ㄹ', g: 'ㅎ', h: 'ㅗ', j: 'ㅓ', k: 'ㅏ', l: 'ㅣ',
    z: 'ㅋ', x: 'ㅌ', c: 'ㅊ', v: 'ㅍ', b: 'ㅠ', n: 'ㅜ', m: 'ㅡ',

    Backspace: 'Backspace', Delete: 'Delete', Enter: 'Enter',
  },

  acceptableLetters: {
    initial: ['ㅃ', 'ㅉ', 'ㄸ', 'ㄲ', 'ㅆ', 'ㅂ', 'ㅈ', 'ㄷ', 'ㄱ', 'ㅅ', 'ㅁ', 'ㄴ', 'ㅇ', 'ㄹ', 'ㅎ', 'ㅋ', 'ㅌ', 'ㅊ', 'ㅍ'],
    vertical: ['ㅕ', 'ㅑ', 'ㅒ', 'ㅖ','ㅐ', 'ㅔ', 'ㅓ', 'ㅏ', 'ㅣ'],
    horizontal: ['ㅛ', 'ㅗ', 'ㅠ', 'ㅜ', 'ㅡ'],
    'dipthong-horizontal': ['ㅗ', 'ㅜ', 'ㅡ'],
    'dipthong-vertical': {
      'ㅗ': ['ㅣ', 'ㅏ', 'ㅐ'],
      'ㅜ': ['ㅣ', 'ㅓ', 'ㅔ'],
      'ㅡ': ['ㅣ'],
    },
    final: ['ㄲ', 'ㅆ', 'ㅂ', 'ㅈ', 'ㄷ', 'ㄱ', 'ㅅ', 'ㅁ', 'ㄴ', 'ㅇ', 'ㄹ', 'ㅎ', 'ㅋ', 'ㅌ', 'ㅊ', 'ㅍ'],
    lefty: ['ㄱ', 'ㄴ', 'ㄹ', 'ㅂ'],
    righty: {
      'ㄱ': ['ㅅ'],
      'ㄴ': ['ㅈ', 'ㅎ'],
      'ㄹ': ['ㄱ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅌ', 'ㅍ', 'ㅎ'],
      'ㅂ': ['ㅅ']
    }
  },



  normalizeInput(e) {
    let k = (e.target.dataset['key']) ? e.target.dataset['key'] : Analyzer.keyDict[e.key];

    if (k === undefined || e.ctrlKey) { return undefined }
    if (k === '←' || k === 'Backspace' ) { return 'Backspace'}
    if (k === '↵' || k === 'Enter' ) {return 'Enter'} 

    return k
  },

  isVert(ch) {
    return [
      'ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅣ'
    ].includes(ch);
  },

  getSyllableType: function(letters){
    /* No batchim ? */
    if (letters.length < 3) {
      /* Complex final vowel? */
      return (letters[1] in Analyzer.midDubs) ? 'gwe' /* 괴 */
      : (Analyzer.isVert(letters[1])) ? 'ga' /* 가 */ : 'go' /* 고 */;
    }

    /* With batchim */
    /* Is last component complex? */
    if (letters[2] in Analyzer.finDubs) {
      /* Is middle component ALSO complex? */
      if (letters[1] in Analyzer.midDubs) {
        return 'gwenh' /* 괞 */
      }
      /* Only the last one */
      else {
        return (Analyzer.isVert(letters[1])) ? 'ganh' /* 갆 */ : 'gonh' /* 곦 */
      }
    }

    /* Is ONLY middle component is complex */
    if (letters[1] in Analyzer.midDubs) {
      return 'gwen' /* 괜 */
    }

    /* NO complex characters */
    return (Analyzer.isVert(letters[1])) ? 'gan' /* 간 */ : 'gon' /* 곤 */
  },

  letterType: {
    g: 'initial',
    o: 'horizontal',
    a: 'vertical',
    w: 'dipthong-horizontal',
    e: 'dipthong-vertical',
    n: 'final', /* Possibly, batchim's lefty */
    h: 'righty'
  },

  furtherDeconstruct: function(syllableLetters) {
    if (syllableLetters[2] && (syllableLetters[2] in Analyzer.finDubs)) {
      let [a, b] = [Analyzer.finDubs[syllableLetters[2]][0], Analyzer.finDubs[syllableLetters[2]][1]];
      syllableLetters.splice(2, 1, a, b);
    }

    if (syllableLetters[1] in Analyzer.midDubs) {
      let [a, b] = [Analyzer.midDubs[syllableLetters[1]][0], Analyzer.midDubs[syllableLetters[1]][1]];
      syllableLetters.splice(1, 1, a, b);
    }

    return syllableLetters
  },

  analyze(aKoreanWord) {
    let flattened = [];
    let syllables = [];
    
    for (let i = 0; i < aKoreanWord.length; i++) {      
      /* ['ㄱ', 'ㅘ', 'ㄶ'] */
      let indieLetters = Han.deconstruct([...aKoreanWord][i], {flatten: true});
      syllables.push({flat: '', type: Analyzer.getSyllableType(indieLetters)});

      /*['ㄱ', 'ㅗ', 'ㅏ', 'ㄴ', 'ㅎ']  */
      indieLetters = Analyzer.furtherDeconstruct(indieLetters);
      syllables[i].flat = indieLetters;
      flattened = [...flattened, ...indieLetters];
    }

    return {
      whole: aKoreanWord,
      flattened: flattened,
      syllables: syllables
    }
  }
}

class HangulBlock {
  static layouts = {
  /* 가 */
  ga: `
    grid-template-columns: 50% 50%;
    grid-template-rows: 100%;
    grid-template-areas: 
      'area0 area1';
  `,
  /* 고 */
  go: `
    grid-template-columns: 100%;
    grid-template-rows: 50% 50%;
    grid-template-areas: 
      'area0'
      'area1';
  `,
  /* 괴 */
  gwe: `
    grid-template-columns: 50% 50%;
    grid-template-rows: 50% 50%;
    grid-template-areas: 
      'area0 area2'
      'area1 area2';
  `,
  /* 간 */
  gan: `
    grid-template-columns: 50% 50%;
    grid-template-rows: 50% 50%;
    grid-template-areas: 
      'area0 area1'
      'area2 area2';
  `,
  /* 곤 */
  gon: ` 
    grid-template-columns: 100%;
    grid-template-rows: 33.3% 33.3% 33.3%;
    grid-template-areas: 
      'area0'
      'area1'
      'area2';
  `,
  /* 괜 */
  gwen: `
    grid-template-columns: 60% 40%;
    grid-template-rows: 33.3% 33.3% 33.3%;
    grid-template-areas: 
      'area0 area2'
      'area1 area2'
      'area3 area3';
  `,
  /* 갆 */
  ganh: `
    grid-template-columns: 50% 50%;
    grid-template-rows: 50% 50%;
    grid-template-areas: 
      'area0 area1'
      'area2 area3';
  `,
  /* 곦 */
  gonh: `
    grid-template-columns: 50% 50%;
    grid-template-rows: 33.3% 33.3% 33.3%;
    grid-template-areas: 
      'area0 area0'
      'area1 area1'
      'area2 area3';
  `,
  /* 괞 */
  gwenh: `
    grid-template-columns: 50% 50%;
    grid-template-rows: 33.3% 33.3% 33.3%;
    grid-template-areas: 
      'area0 area2'
      'area1 area2'
      'area3 area4';
  `,
};
  constructor(oSyllable, adoptiveParent) {
    /* Syllable container*/
    let syllableContainer = Object.assign(document.createElement('article'), { classList: 'syllable-container' });
    syllableContainer.style = HangulBlock.layouts[oSyllable.type];
    adoptiveParent.append(syllableContainer);

    /* Letter containers (Tiles) */
    oSyllable.flat.forEach( (ltr, i) => {
    let tile = Object.assign(document.createElement('div'), { classList: 'tile masked', /* .masked is removed after animation completes, to reveal the color underneath */
      style: `grid-area: area${i}`,
      /* innerText: ltr */ /* REVEAL ANSWER */
    });
    tile.dataset['readyForInput'] = 1;
    let letterPosition = oSyllable.type[i]; /* g w a e o n h */
    let letterType = Analyzer.letterType[letterPosition]; /* initial, vertical, horizontal, lefty, righty (batchim) */
    if (letterType === 'final' && oSyllable.flat [i + 1]) { letterType = 'lefty'} /* If next index exists it's not final-final */
    tile.dataset['accepts'] = letterType;
    syllableContainer.append(tile);
  });

  }
}

/* ============================================================================ */
/* ============================================================================ */

async function play() {
  resetGame();
  getWord().then(()=>{
    setupBoard();
    startInteractivity();
  });  
}


function resetGame() {
  while (inputArea.firstElementChild) { inputArea.firstElementChild.remove(); }
  while (historyBoard.firstElementChild) { historyBoard.firstElementChild.remove(); }
  maskKeys();
  TRIES_COUNTER = 0;
}

async function getWord() {
  await fetch('advanced.txt')
    .then(response => response.text())
    .then(data => {
      let dictionary = data.split('\r\n');
      let randomWord = dictionary[Math.floor(Math.random() * dictionary.length)];
      TODAYS_WORD = Analyzer.analyze(randomWord);
    });
  return Promise.resolve();
}

function setupBoard() {
  [...TODAYS_WORD.syllables].forEach( (syllable) => {
    new HangulBlock(syllable, inputArea);
  });
  placeCursor();
}

function placeCursor() {
  letterboard.querySelector('.focused')?.classList.remove('focused');
  let emptyTile = letterboard.querySelector('[data-ready-for-input="1"]');
  if (!emptyTile) { return }
  emptyTile.classList.add('focused');
}

function startInteractivity() {
  document.addEventListener('keydown', handleInput);
  document.querySelectorAll('[data-key]').forEach(b => {
    b.addEventListener('click', handleInput);
    b.addEventListener('touchstart', handleInput);
    b.addEventListener('touchend', e => event.preventDefault()); /* Don't trigger both click and touch */
  });
}

function stopInteractivity() {
  document.removeEventListener('keydown', handleInput);
  document.querySelectorAll('[data-key]').forEach(b => {
    b.removeEventListener('click', handleInput);
    b.removeEventListener('touchstart', handleInput);
    b.removeEventListener('touchend', e => event.preventDefault()); /* Don't trigger both click and touch */
  });
}

function handleInput(e) {
  e.stopPropagation(); /* Due to icon nested in button */
  let key = Analyzer.normalizeInput(e);
  if (!key) { return }
  
  /* ENTER */
  if (key === 'Enter' && help.getAttribute('open')) { closeHelp(); return }
  if (key === 'Enter') { assessGuess() }

  /* DEL */
  else if (key === 'Backspace' || key === 'Delete') {
    let filledTiles = letterboard.querySelectorAll('[data-ready-for-input="0"]');
    if (!filledTiles.length) { return }
    let lastFilledTile = filledTiles[filledTiles.length-1];
    lastFilledTile.innerText = '';
    lastFilledTile.dataset['readyForInput'] = 1;
  }

  /* LETTER */
  else {
    let emptyTile = letterboard.querySelector('[data-ready-for-input="1"]');
    if (!emptyTile) { return }

    let acceptableType = emptyTile.dataset['accepts']; 
    let acceptableLetters = Analyzer.acceptableLetters[acceptableType];

    if (acceptableType === 'righty') {
      previousLetter = emptyTile.previousElementSibling.textContent;
      acceptableLetters = acceptableLetters[previousLetter];
    }

    else if (acceptableType === 'dipthong-vertical') {
      previousLetter = emptyTile.previousElementSibling.textContent;
      acceptableLetters = acceptableLetters[previousLetter];
    }

    if (acceptableLetters.includes(key)) {
      emptyTile.innerText = key;
      emptyTile.dataset['readyForInput'] = 0;
    } else { shakeContainers(); /* showPopup(`😮 안 들어가네!`) */ }
  }

  placeCursor();
  /* Remove key focus to prevent physical key press from firing previously clicked button instead of own key */
  e.target.blur();
}

function assessGuess() {
  /* Incomplete guess */
  let emptyTiles = document.querySelectorAll('[data-ready-for-input="1"]');
  if  (emptyTiles.length) { shakeContainers(), showPopup('Not enough letters'); return }

  TRIES_COUNTER++;
  
  /* TODO: doesWordExist()... but would hae to assemble user input first (not even possible for some double batchims) */
  let tiles = [...letterboard.querySelectorAll('.tile')];
  let stillAvailableLetters = [...TODAYS_WORD.flattened]; /* Deep copy to be used to splice out green letters, to determine if repetitions should be yellow or gray */
  
  /* First pass (Green / Gray) */
  tiles.forEach((tile, i) => {
    let userLetter = tile.textContent;
    let newClass =  (userLetter === TODAYS_WORD.flattened[i]) ? 'correct' : 'absent';
    tile.classList.add(newClass);
    document.querySelector(`[data-key="${userLetter}"]`).classList.add(newClass); /* KEYBOARD */
    
    if (newClass === 'correct') {
      let j = stillAvailableLetters.indexOf(userLetter);
      stillAvailableLetters.splice(j, 1); /* Reduced array for checking following 'presents' (yellow) and void extras */
    }
  });

  /* Second pass (Yellow) */
  tiles.forEach((tile, i) => {
    let userLetter = tile.textContent;
    if (stillAvailableLetters.includes(userLetter)) {
      tile.classList.add('present');
      document.querySelector(`[data-key="${userLetter}"]`).classList.add('present'); /* KEYBOARD */
      let j = stillAvailableLetters.indexOf(userLetter);
      stillAvailableLetters.splice(j, 1);
    }
  });

  /* IF FULL MATCH: */
  if (letterboard.querySelectorAll('.correct').length === TODAYS_WORD.flattened.length) {
    let triesCount = historyBoard.children.length + 1;
    stopInteractivity();

    (async function congratulate() {
      await doTheMacarena();
      unmaskKeys()
      congrats.querySelector('#counter-div').textContent = TRIES_COUNTER;
      congrats.querySelector('#try-tries').innerText = (TRIES_COUNTER > 1) ? 'tries' : 'try!';
      congrats.querySelector('a').href = `https://en.dict.naver.com/#/search?query=${encodeURIComponent(TODAYS_WORD.whole)}`;
      congrats.querySelector('a').textContent = `What's ${TODAYS_WORD.whole} in English?`;
      congrats.showModal();
    }());

    return
  }

/* IF WRONG GUESS:
  Clone word container
  Play animation
  Append clone approximately when animation ends
  Unmask clone / Fully rotate back
  Color keyboard
*/
  
  (async function moveToHistory() {
    let clone = letterboard.cloneNode(true);
    clone.id = ''; /* Prevent duplicated ID! */

    go = await flipContainers();

    /* Reset main letterboard */
    let syllableContainers = [...letterboard.querySelectorAll('.syllable-container')];
    syllableContainers.forEach(c => { c.classList.remove('flip') }); /* STILL BUGGY !!! In case user didn't let animation finnish, preveting it from triggering eventListener (Replicate 'not enough letters' -> quickly add one -> submit) */
    tiles.forEach((tile, i) => {
      tile.className = 'tile masked'; /* remove correct|present|absent */
      tile.textContent = '';
      tile.dataset['readyForInput'] = 1;
    });

    /* Reveal in history */
    historyBoard.scrollTop = 0;
    historyBoard.prepend(clone);
    [...clone.querySelectorAll('.tile')].forEach(t => {t.classList.remove('masked')});

    /* Keyboard coloring (all at once)*/
    unmaskKeys();
  }());

}

function maskKeys() {
  letterKeys.forEach( k => { k.classList = 'masked letter key' });
}

function unmaskKeys() {
/*   keys.forEach(k => {
      if (k.classList.contains('correct')
        || k.classList.contains('present')
        || k.classList.contains('absent')) { k.classList.remove('masked') };
    }); */

  letterKeys.forEach( k => { k.classList.remove('masked') });
}

function showPopup(msg) {
  popup.innerText = msg;
  popup.style.transition = '';
  popup.style.visibility = 'visible';
  popup.style.opacity = '1';
  setTimeout(()=>{
    popup.style.transition = 'visibility 0s 2s, opacity 0.3s linear';
    popup.style.visibility = 'hidden';
    popup.style.opacity = '0'
  }, 1000);
}

function shakeContainers() {
  [...letterboard.querySelectorAll('.syllable-container')].forEach(t => {
    t.classList.add('shake');
    t.addEventListener('animationend', () => {
      t.classList.remove('shake');
    }, { once: true });
  })
}

async function flipContainers() {
  return new Promise((resolve) => {
    const DURATION = 500; /* Each CSS rotation's transition is set to 250ms */
    let containers = [...letterboard.querySelectorAll('.syllable-container')];

    containers.forEach( (c, i) => {
      setTimeout( ()=>{c.classList.add('flip')}, (i * DURATION) / 2);
      c.addEventListener('transitionend', () => {
        c.classList.remove('flip'); /* Removing transition plays it in reverse */
        [...c.querySelectorAll('.tile')].forEach( t => { 
          /* Reveal each tile's color */
          t.classList.remove('masked');
          /* Reveal each tile's color => Done later all at once, to prevent green from being revaled ahead of time when it's yellow */
          /* document.querySelector(`[data-key="${t.textContent}"]`).classList.remove('masked'); */
        });
        setTimeout(() => {
          resolve();
        }, 700) /* WAIT FOR FULL ANIMATION (approximate...)*/
      });
    })
  });
}

async function doTheMacarena() {
  return new Promise((resolve) => {
    const OFFSET = 175; /* half the .bounce animation length (700ms)*/
    let containers = [...letterboard.querySelectorAll('.syllable-container')];
    containers.forEach( (c, i) => {
      setTimeout(()=>{
        bounceContainer(c)
      }, i * OFFSET);
    });
    setTimeout(() => {
          resolve();
        }, 1200) /* WAIT FOR FULL ANIMATION (approximate...)*/
  });
}

function bounceContainer(container) {
  [...container.querySelectorAll('.tile')].forEach( t => { t.classList.remove('masked') }); /* Reveal each tile's color */
  container.classList.add('bounce');
  container.addEventListener('animationend', () => {
    container.classList.remove('bounce');
  }, { once: true });
}

/* ################################################ */
/* ################## AUTO EXECUTE ################ */
/* ################################################ */

help.showModal();

/* Close modal by pressing enter */
document.addEventListener('keyup', () => {
/*   if (e.key === 'Enter') {
    closeHelp();
  } */
}, {once: true});

help.addEventListener('close', (event) => {
    play();
}, {once: true});