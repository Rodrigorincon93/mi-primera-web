'use strict';
/* Crónicas de Lexara — contenido del juego (mundos, vocabulario, misiones) */

const WORLDS = [
  /* ───────────────────────── 1. GREENWOOD MEADOW ───────────────────────── */
  {
    key: 'meadow', name: 'Greenwood Meadow', es: 'Pradera Verdealba', icon: '🌳',
    level: 'A1 · Saludos, colores y números',
    crystal: ['Crystal of Greetings', 'Cristal de los Saludos'],
    house: '🏡', mob: '🐝', seed: 7, rooms: 5, need: 5,
    pal: { g: ['#63b34c', '#5cab46'], speck: '#4d9a3b', flower: ['#fff27a', '#ff9ecb', '#ffffff'],
      path: '#dcbb7e', pathSpeck: '#c9a566', tree: 'round', leaf: '#2e7d32', leaf2: '#43a047', trunk: '#7b4b22',
      rock: '#8f939c', water: '#3d8ee0', water2: '#69acef', floor: '#8a9a72', wall: '#3e5a34' },
    owl: [
      ['Hoot! This is Greenwood Meadow. The people here forgot their words.', '¡Uuh! Esta es la Pradera Verdealba. La gente de aquí olvidó sus palabras.'],
      ['Talk to the villagers. Help them and they will give you runes.', 'Habla con los aldeanos. Ayúdalos y te darán runas.'],
      ['With five runes you can open the maze. The crystal is inside!', 'Con cinco runas podrás abrir el laberinto. ¡El cristal está dentro!']
    ],
    mazeIntro: ['Welcome to the Hedge Maze. Read the instruction and choose a door: north, south, east or west. North is always up!',
      'Bienvenido al Laberinto de Setos. Lee la instrucción y elige una puerta: norte, sur, este u oeste. ¡El norte siempre está arriba!'],
    vocab: [
      ['hello', 'hola', '👋'], ['goodbye', 'adiós', ''], ['please', 'por favor', ''], ['thank you', 'gracias', '🙏'],
      ['friend', 'amigo', '🤝'], ['house', 'casa', '🏠'], ['tree', 'árbol', '🌳'], ['dog', 'perro', '🐶'],
      ['cat', 'gato', '🐱'], ['sun', 'sol', '☀️'], ['water', 'agua', '💧'], ['flower', 'flor', '🌸'],
      ['book', 'libro', '📖'], ['mother', 'madre', ''], ['father', 'padre', ''], ['red', 'rojo', '🔴'],
      ['blue', 'azul', '🔵'], ['green', 'verde', '🟢'], ['yellow', 'amarillo', '🟡'], ['happy', 'feliz', '😀']
    ],
    quests: [
      { id: 'elder', type: 'mc', npc: '👵', name: 'Elder Rose',
        intro: ['Hello, traveller! Welcome to Greenwood. Can you greet people in English?', '¡Hola, viajero! Bienvenido a Greenwood. ¿Sabes saludar en inglés?'],
        done: ['Wonderful! You are very polite. Take this rune.', '¡Maravilloso! Eres muy educado. Toma esta runa.'],
        items: [
          ["How do you say 'hola' in English?", 'Hello', 'Goodbye', 'Please'],
          ['It is 8:00 in the morning. You say…', 'Good morning!', 'Good night!', 'Goodbye!'],
          ['Someone gives you a present 🎁. You say…', 'Thank you!', 'Sorry!', 'Hello!'],
          ['You are leaving the village. You say…', 'Goodbye!', 'Good morning!', 'Please!']
        ] },
      { id: 'farmer', type: 'scramble', npc: '👨', name: 'Farmer Tom',
        intro: ['Oh no! The wind mixed all my letters. Can you put them in order?', '¡Oh, no! El viento mezcló todas mis letras. ¿Puedes ordenarlas?'],
        done: ['Great job! Now I can read my farm signs again.', '¡Buen trabajo! Ya puedo leer otra vez los letreros de mi granja.'],
        items: [['DOG', 'perro', '🐶'], ['CAT', 'gato', '🐱'], ['TREE', 'árbol', '🌳'], ['HOUSE', 'casa', '🏠']] },
      { id: 'painter', type: 'plates', npc: '👩', name: 'Painter Lily',
        intro: ['I painted these magic stones. Step on the colours in the right order!', 'Yo pinté estas piedras mágicas. ¡Pisa los colores en el orden correcto!'],
        done: ['Beautiful! You know your colours.', '¡Precioso! Te sabes los colores.'],
        task: ['Step on the colours in this order: yellow, red, blue.', 'Pisa los colores en este orden: amarillo, rojo, azul.'],
        plates: ['red', 'green', 'yellow', 'blue', 'purple'], seq: ['yellow', 'red', 'blue'] },
      { id: 'teacher', type: 'order', npc: '👴', name: 'Teacher Ben',
        intro: ['My sentences are broken! Please put the words in the correct order.', '¡Mis frases están rotas! Por favor, pon las palabras en el orden correcto.'],
        done: ['Excellent! You are a good student.', '¡Excelente! Eres un buen estudiante.'],
        items: [['My name is Ben', 'Me llamo Ben'], ['I am a teacher', 'Soy profesor'], ['Nice to meet you', 'Encantado de conocerte'], ['How are you today', '¿Cómo estás hoy?']] },
      { id: 'mia', type: 'memory', npc: '👧', name: 'Little Mia',
        intro: ['Hi! Do you want to play? Find the number pairs!', '¡Hola! ¿Quieres jugar? ¡Encuentra las parejas de números!'],
        done: ['Yay! You win! One, two, three… rune for you!', '¡Bien! ¡Ganaste! Uno, dos, tres… ¡runa para ti!'],
        pairs: [['one', '1'], ['two', '2'], ['three', '3'], ['four', '4'], ['five', '5'], ['six', '6']] },
      { id: 'bard', type: 'listen', npc: '🧔', name: 'Bard Finn',
        intro: ['Listen to my song of words. What word do you hear?', 'Escucha mi canción de palabras. ¿Qué palabra oyes?'],
        done: ['You have good ears, my friend!', '¡Tienes buen oído, amigo mío!'],
        items: [['three', 'tree', 'free'], ['cat', 'hat', 'cut'], ['blue', 'glue', 'two'], ['house', 'horse', 'mouse']] },
      { id: 'baker', type: 'mc', npc: '👦', name: 'Baker Sam',
        intro: ['I am, you are, she is… I always forget! Help me, please.', 'I am, you are, she is… ¡siempre se me olvida! Ayúdame, por favor.'],
        done: ['Now I remember! Thank you, friend.', '¡Ya me acuerdo! Gracias, amigo.'],
        items: [
          ['I ___ happy.', 'am', 'is', 'are'],
          ['She ___ my mother.', 'is', 'am', 'are'],
          ['They ___ my friends.', 'are', 'is', 'am'],
          ['___ name is Sam.', 'My', 'I', 'Me']
        ] }
    ],
    chests: [
      ['I am yellow and hot. I am in the sky. What am I?', 'the sun', 'the water', 'a tree'],
      ["I say 'woof'. I am your best friend. What am I?", 'a dog', 'a cat', 'a book']
    ]
  },

  /* ───────────────────────── 2. SUNNY SANDS ───────────────────────── */
  {
    key: 'sands', name: 'Sunny Sands', es: 'Arenas del Mercado', icon: '🏜️',
    level: 'A1+ · Comida, animales y compras',
    crystal: ['Crystal of Flavours', 'Cristal de los Sabores'],
    house: '⛺', mob: '🦂', seed: 21, rooms: 6, need: 5,
    pal: { g: ['#ecd08a', '#e8ca80'], speck: '#d9b76a', flower: ['#c9a55a', '#b8944d', '#f5e3ae'],
      path: '#cfa762', pathSpeck: '#b98f4b', tree: 'cactus', leaf: '#3f9a4a', leaf2: '#6cc276', trunk: '#3f9a4a',
      rock: '#b98a55', water: '#35a7c9', water2: '#7fd4e8', floor: '#d6b676', wall: '#7a5a2e' },
    owl: [
      ['Welcome to Sunny Sands! It is very hot here.', '¡Bienvenido a las Arenas del Mercado! Aquí hace mucho calor.'],
      ['The market people forgot the names of food and animals.', 'La gente del mercado olvidó los nombres de la comida y los animales.'],
      ['Chef Omar needs help. Read his list carefully!', 'El chef Omar necesita ayuda. ¡Lee su lista con atención!']
    ],
    mazeIntro: ['This is the Pyramid Maze. Here you turn left, turn right or go straight. Left and right depend on the direction you walk INTO the room. Follow the arrow on the floor!',
      'Este es el Laberinto de la Pirámide. Aquí giras a la izquierda, a la derecha o sigues recto. Izquierda y derecha dependen de la dirección en la que ENTRAS a la sala. ¡Fíjate en la flecha del suelo!'],
    vocab: [
      ['apple', 'manzana', '🍎'], ['bread', 'pan', '🍞'], ['cheese', 'queso', '🧀'], ['milk', 'leche', '🥛'],
      ['fish', 'pescado', '🐟'], ['egg', 'huevo', '🥚'], ['banana', 'plátano', '🍌'], ['orange', 'naranja', '🍊'],
      ['camel', 'camello', '🐫'], ['snake', 'serpiente', '🐍'], ['bird', 'pájaro', '🐦'], ['horse', 'caballo', '🐴'],
      ['hot', 'caliente', '🥵'], ['hungry', 'hambriento', ''], ['thirsty', 'sediento', ''], ['money', 'dinero', '💰'],
      ['market', 'mercado', ''], ['eat', 'comer', '🍽️'], ['drink', 'beber', '🥤'], ['big', 'grande', ''], ['small', 'pequeño', '']
    ],
    quests: [
      { id: 'chef', type: 'fetch', npc: '👳', name: 'Chef Omar',
        intro: ['I am cooking soup, but my kitchen is empty! Bring me three things: an egg, some cheese and a fish. They are around the market.',
          '¡Estoy cocinando sopa, pero mi cocina está vacía! Tráeme tres cosas: un huevo, queso y un pescado. Están por los alrededores del mercado.'],
        done: ['Mmm! The soup is delicious. Thank you!', '¡Mmm! La sopa está deliciosa. ¡Gracias!'],
        task: ['Bring Chef Omar: an egg, some cheese and a fish.', 'Lleva al chef Omar: un huevo, queso y un pescado.'],
        need: ['egg', 'cheese', 'fish'],
        things: [['apple', '🍎'], ['bread', '🍞'], ['cheese', '🧀'], ['milk', '🥛'], ['fish', '🐟'], ['egg', '🥚'], ['banana', '🍌'], ['orange', '🍊']] },
      { id: 'merchant', type: 'mc', npc: '🧕', name: 'Merchant Zara',
        intro: ['Welcome to my shop! Do you know how to buy things in English?', '¡Bienvenido a mi tienda! ¿Sabes comprar cosas en inglés?'],
        done: ['You are a great customer! Here you are.', '¡Eres un gran cliente! Aquí tienes.'],
        items: [
          ["'¿Cuánto cuesta?' in English is…", 'How much is it?', 'How are you?', 'How old is it?'],
          ['You want an apple. You say…', 'Can I have an apple, please?', 'I am an apple, please.', 'Give apple me.'],
          ["The shopkeeper says 'Here you are.' You say…", 'Thank you!', 'Goodbye!', 'I am hungry!'],
          ['The bread is two coins and the milk is three coins. How much is it?', 'Five coins', 'Four coins', 'Six coins']
        ] },
      { id: 'rider', type: 'scramble', npc: '🤠', name: 'Rider Sol',
        intro: ['A sandstorm mixed the names of my animals! Help me!', '¡Una tormenta de arena mezcló los nombres de mis animales! ¡Ayúdame!'],
        done: ['Yes! Those are my animals. Thank you!', '¡Sí! Esos son mis animales. ¡Gracias!'],
        items: [['CAMEL', 'camello', '🐫'], ['SNAKE', 'serpiente', '🐍'], ['HORSE', 'caballo', '🐴'], ['BIRD', 'pájaro', '🐦']] },
      { id: 'scribe', type: 'mc', npc: '👲', name: 'Scribe Lin',
        intro: ['I write the market signs, but some words are missing. Choose the right word.', 'Yo escribo los letreros del mercado, pero faltan palabras. Elige la palabra correcta.'],
        done: ['Perfect grammar! The signs are ready.', '¡Gramática perfecta! Los letreros están listos.'],
        items: [
          ['I have ___ apple.', 'an', 'a', 'some'],
          ['There are three ___ in the basket.', 'eggs', 'egg', 'an egg'],
          ['She ___ bananas.', 'likes', 'like', 'liking'],
          ['There ___ a snake in the sand!', 'is', 'are', 'am']
        ] },
      { id: 'kid', type: 'memory', npc: '👦', name: 'Little Ali',
        intro: ['I am hungry! Play with me. Find the food pairs!', '¡Tengo hambre! Juega conmigo. ¡Encuentra las parejas de comida!'],
        done: ['That was fun! Now I am very hungry…', '¡Qué divertido! Ahora tengo muchísima hambre…'],
        pairs: [['apple', '🍎'], ['bread', '🍞'], ['cheese', '🧀'], ['milk', '🥛'], ['fish', '🐟'], ['egg', '🥚']] },
      { id: 'nomad', type: 'order', npc: '🧔', name: 'Nomad Kareem',
        intro: ['The desert wind broke my sentences. Can you fix them?', 'El viento del desierto rompió mis frases. ¿Puedes arreglarlas?'],
        done: ['Now my words are strong again. Take this rune.', 'Ahora mis palabras vuelven a ser fuertes. Toma esta runa.'],
        items: [['I would like some water', 'Quisiera un poco de agua'], ['The camel is very big', 'El camello es muy grande'], ['Do you like fish', '¿Te gusta el pescado?'], ['I am hungry and thirsty', 'Tengo hambre y sed']] },
      { id: 'singer', type: 'listen', npc: '👸', name: 'Singer Nala',
        intro: ['Listen carefully to my voice. Which word do I say?', 'Escucha mi voz con atención. ¿Qué palabra digo?'],
        done: ['You listen very well!', '¡Escuchas muy bien!'],
        items: [['hungry', 'angry', 'hurry'], ['desert', 'dessert', 'dentist'], ['fish', 'dish', 'wish'], ['bread', 'bed', 'red']] }
    ],
    chests: [
      ["I have no legs. I live in the sand. I say 'ssss'. What am I?", 'a snake', 'a camel', 'a bird'],
      ['I am white. You drink me. I come from a cow. What am I?', 'milk', 'bread', 'cheese']
    ]
  },

  /* ───────────────────────── 3. FROST PEAKS ───────────────────────── */
  {
    key: 'peaks', name: 'Frost Peaks', es: 'Picos Helados', icon: '🏔️',
    level: 'A2 · Clima, ropa y acciones',
    crystal: ['Crystal of Action', 'Cristal de la Acción'],
    house: '🛖', mob: '🐺', seed: 33, rooms: 7, need: 5,
    pal: { g: ['#f2f6fb', '#e8eff7'], speck: '#d5e0ee', flower: ['#cfe3f7', '#ffffff', '#b9d3ee'],
      path: '#c3cfdd', pathSpeck: '#aab8c9', tree: 'pine', leaf: '#2f6b4f', leaf2: '#ffffff', trunk: '#5d4126',
      rock: '#7c8794', water: '#4a78b8', water2: '#8fb4e4', floor: '#b7cde0', wall: '#4a6787', snow: true },
    owl: [
      ['Brrr! Welcome to Frost Peaks. It is very cold today.', '¡Brrr! Bienvenido a los Picos Helados. Hoy hace mucho frío.'],
      ['Here you must follow instructions: walk, dig, jump!', 'Aquí debes seguir instrucciones: ¡camina, cava, salta!'],
      ['Be careful on the frozen lake. Read the sign first!', 'Ten cuidado en el lago helado. ¡Lee primero el letrero!']
    ],
    mazeIntro: ['This is the Ice Cave Maze. Every door has a colour. Read the instruction and find the right colour!',
      'Este es el Laberinto de la Cueva de Hielo. Cada puerta tiene un color. ¡Lee la instrucción y encuentra el color correcto!'],
    vocab: [
      ['snow', 'nieve', '❄️'], ['cold', 'frío', '🥶'], ['wind', 'viento', '💨'], ['rain', 'lluvia', '🌧️'],
      ['coat', 'abrigo', '🧥'], ['hat', 'sombrero', '🎩'], ['boots', 'botas', '🥾'], ['gloves', 'guantes', '🧤'],
      ['scarf', 'bufanda', '🧣'], ['mountain', 'montaña', '⛰️'], ['ice', 'hielo', '🧊'], ['fire', 'fuego', '🔥'],
      ['hand', 'mano', '✋'], ['foot', 'pie', '🦶'], ['eyes', 'ojos', '👀'], ['run', 'correr', '🏃'],
      ['sleep', 'dormir', '😴'], ['climb', 'escalar', '🧗'], ['walk', 'caminar', '🚶'], ['jump', 'saltar', '']
    ],
    quests: [
      { id: 'explorer', type: 'dig', npc: '👩', name: 'Explorer Ada',
        intro: ['I buried my golden compass in the snow, and now I cannot find it! Follow my notes: stand on the red flag. Walk four steps north. Then walk five steps east. Then walk two steps south. Dig there!',
          '¡Enterré mi brújula dorada en la nieve y ya no la encuentro! Sigue mis notas: ponte sobre la bandera roja. Camina cuatro pasos al norte. Luego cinco pasos al este. Luego dos pasos al sur. ¡Cava ahí!'],
        done: ['My compass! You followed every step. Thank you!', '¡Mi brújula! Seguiste cada paso. ¡Gracias!'],
        task: ['Stand on the red flag. Walk four steps north, then five steps east, then two steps south. Dig there! (action button)',
          'Ponte sobre la bandera roja. Camina cuatro pasos al norte, cinco al este y dos al sur. ¡Cava ahí! (botón de acción)'],
        steps: [['N', 4], ['E', 5], ['S', 2]] },
      { id: 'lake', type: 'bridge', npc: '', name: 'Frozen Lake',
        rule: ['DANGER! Thin ice! Step only on the CLOTHES.', '¡PELIGRO! ¡Hielo fino! Pisa solo la ROPA.'],
        done: ['You crossed the frozen lake! An ancient rune shines on the altar.', '¡Cruzaste el lago helado! Una runa antigua brilla en el altar.'],
        rows: [['coat', 'apple', 'dog'], ['boots', 'fish', 'sun'], ['hat', 'tree', 'milk'], ['gloves', 'bread', 'water'], ['scarf', 'camel', 'book']] },
      { id: 'weather', type: 'mc', npc: '👴', name: 'Old Yorick',
        intro: ['I look at the sky every day. Let us talk about the weather!', 'Miro el cielo todos los días. ¡Hablemos del tiempo!'],
        done: ['You understand the weather. You will survive the mountain!', 'Entiendes el tiempo. ¡Sobrevivirás a la montaña!'],
        items: [
          ['It is snowing ❄️. What do you wear?', 'A coat and gloves', 'A swimsuit', 'Sunglasses only'],
          ['🌧️ What is the weather like?', 'It is raining.', 'It is sunny.', 'It is hot.'],
          ["'Tengo frío' in English is…", 'I am cold.', 'I have cold.', 'I do cold.'],
          ['💨 Today it is very…', 'windy', 'sunny', 'hungry']
        ] },
      { id: 'climber', type: 'mc', npc: '🧔', name: 'Climber Bjorn',
        intro: ['Look at the mountain! What is happening right now? Choose the right word.', '¡Mira la montaña! ¿Qué está pasando ahora mismo? Elige la palabra correcta.'],
        done: ['Yes! You can speak about actions now.', '¡Sí! Ya puedes hablar de acciones.'],
        items: [
          ['The bear ___ sleeping in the cave.', 'is', 'are', 'am'],
          ['I ___ climbing the mountain now.', 'am', 'is', 'are'],
          ['Penguins ___ fly, but they can swim.', "can't", 'can', 'are'],
          ['Look! The children ___ playing in the snow.', 'are', 'is', 'am']
        ] },
      { id: 'tailor', type: 'scramble', npc: '👵', name: 'Tailor Olga',
        intro: ['My fingers are frozen and my letters fell on the floor!', '¡Tengo los dedos congelados y mis letras se cayeron al suelo!'],
        done: ['Lovely! Keep warm, dear.', '¡Qué bien! Abrígate, cariño.'],
        items: [['SNOW', 'nieve', '❄️'], ['SCARF', 'bufanda', '🧣'], ['GLOVES', 'guantes', '🧤'], ['MOUNTAIN', 'montaña', '⛰️']] },
      { id: 'twin', type: 'memory', npc: '👧', name: 'Little Freya',
        intro: ['Let us play a game by the fire! Find the pairs.', '¡Juguemos junto al fuego! Encuentra las parejas.'],
        done: ['You have a great memory!', '¡Tienes una memoria genial!'],
        pairs: [['coat', '🧥'], ['boots', '🥾'], ['gloves', '🧤'], ['scarf', '🧣'], ['hand', '✋'], ['eyes', '👀']] },
      { id: 'guide', type: 'order', npc: '👨', name: 'Guide Sven',
        intro: ['My words are frozen in the wrong order. Please help!', 'Mis palabras se congelaron en el orden equivocado. ¡Ayuda, por favor!'],
        done: ['Perfect! The path to the maze is safer with you.', '¡Perfecto! El camino al laberinto es más seguro contigo.'],
        items: [['It is very cold today', 'Hoy hace mucho frío'], ['She is wearing a red scarf', 'Ella lleva una bufanda roja'], ['Can you climb the mountain', '¿Puedes escalar la montaña?'], ['We are walking in the snow', 'Estamos caminando por la nieve']] }
    ],
    chests: [
      ['You wear me on your hands when it is cold. What am I?', 'gloves', 'boots', 'a hat'],
      ['I am white and cold. I fall from the sky. What am I?', 'snow', 'fire', 'rain']
    ]
  },

  /* ───────────────────────── 4. WHISPERING MARSH ───────────────────────── */
  {
    key: 'marsh', name: 'Whispering Marsh', es: 'Pantano de los Susurros', icon: '🌙',
    level: 'A2+ · Lugares, preposiciones y pasado',
    crystal: ['Crystal of Memory', 'Cristal de la Memoria'],
    house: '🏚️', mob: '🦇', seed: 48, rooms: 8, need: 5,
    pal: { g: ['#4a6b4a', '#456546'], speck: '#3a573c', flower: ['#b06bd6', '#e0564f', '#d8d06a'],
      path: '#8a6a45', pathSpeck: '#735636', tree: 'dead', leaf: '#6b5a86', leaf2: '#8572a6', trunk: '#3b2b22',
      rock: '#5c6068', water: '#2d5a55', water2: '#4a8177', floor: '#5d5a6e', wall: '#2b2836',
      tint: 'rgba(25,12,50,.22)', flies: true },
    owl: [
      ['Shh… this is the Whispering Marsh. It is dark and old.', 'Shh… este es el Pantano de los Susurros. Es oscuro y antiguo.'],
      ['The people here talk about the past: what they saw, what they found.', 'La gente de aquí habla del pasado: lo que vieron, lo que encontraron.'],
      ['A friendly ghost hid three keys. Read her clues: next to, between, in front of…', 'Una fantasma amistosa escondió tres llaves. Lee sus pistas: al lado de, entre, delante de…']
    ],
    mazeIntro: ['This is the Crypt Maze. Every door has an object next to it: a statue, a barrel, a torch… Read carefully!',
      'Este es el Laberinto de la Cripta. Cada puerta tiene un objeto al lado: una estatua, un barril, una antorcha… ¡Lee con atención!'],
    vocab: [
      ['bridge', 'puente', '🌉'], ['key', 'llave', '🔑'], ['door', 'puerta', '🚪'], ['box', 'caja', '📦'],
      ['frog', 'rana', '🐸'], ['moon', 'luna', '🌙'], ['night', 'noche', '🌃'], ['ghost', 'fantasma', '👻'],
      ['dark', 'oscuro', ''], ['old', 'viejo', ''], ['boat', 'barco', '⛵'], ['under', 'debajo de', ''],
      ['behind', 'detrás de', ''], ['between', 'entre', ''], ['next to', 'al lado de', ''], ['in front of', 'delante de', ''],
      ['went', 'fue (pasado de go)', ''], ['saw', 'vio (pasado de see)', ''], ['found', 'encontró (pasado de find)', ''], ['yesterday', 'ayer', '']
    ],
    quests: [
      { id: 'ghost', type: 'boxes', npc: '👻', name: 'Ghost Greta',
        intro: ['Boo! Do not be afraid. Long ago I hid three keys in these boxes, but be careful: shadows live in the wrong boxes!',
          '¡Buu! No tengas miedo. Hace mucho escondí tres llaves en estas cajas, pero cuidado: ¡en las cajas equivocadas viven sombras!'],
        done: ['You found all three keys! You read very well.', '¡Encontraste las tres llaves! Lees muy bien.'],
        clues: [
          { id: 'between', en: 'The first key is in the box between the two rocks.', es: 'La primera llave está en la caja que hay entre las dos rocas.' },
          { id: 'fountain', en: 'The second key is in the box next to the fountain.', es: 'La segunda llave está en la caja que hay al lado de la fuente.' },
          { id: 'front', en: 'The third key is in the box in front of the tree. (Not behind it!)', es: 'La tercera llave está en la caja que hay delante del árbol (debajo en el mapa). ¡No detrás!' }
        ] },
      { id: 'poet', type: 'plates', npc: '🧛', name: 'Poet Vlad',
        intro: ['I want to say "Yo vi un fantasma" in English, in the PAST. Step on the word stones in the right order!',
          'Quiero decir "Yo vi un fantasma" en inglés, en PASADO. ¡Pisa las piedras de palabras en el orden correcto!'],
        done: ['"I saw a ghost." What a perfect, spooky sentence!', '"I saw a ghost." ¡Qué frase tan perfecta y escalofriante!'],
        task: ['Step on the word stones to say "Yo vi un fantasma" in the past.', 'Pisa las piedras para decir "Yo vi un fantasma" en pasado (4 palabras).'],
        plates: ['see', 'a', 'I', 'ghost', 'saw', 'an'], seq: ['I', 'saw', 'a', 'ghost'] },
      { id: 'fisher', type: 'mc', npc: '👴', name: 'Fisher Mort',
        intro: ['Let me tell you what happened yesterday…', 'Déjame contarte lo que pasó ayer…'],
        done: ['Yes, that is exactly what happened!', '¡Sí, eso es exactamente lo que pasó!'],
        items: [
          ['Yesterday I ___ to the old bridge.', 'went', 'go', 'goes'],
          ['I ___ a big frog in the water.', 'saw', 'see', 'seed'],
          ['Then I ___ a golden key under my boat.', 'found', 'find', 'finded'],
          ['___ you see the ghost last night?', 'Did', 'Do', 'Does']
        ] },
      { id: 'witch', type: 'mc', npc: '🧙', name: 'Witch Hazel',
        intro: ['Where are my things? Help me finish my spell of places!', '¿Dónde están mis cosas? ¡Ayúdame a terminar mi hechizo de lugares!'],
        done: ['Hee hee! Everything is in its place.', '¡Ji, ji! Todo está en su sitio.'],
        items: [
          ['The moon is ___ the sky.', 'in', 'under', 'between'],
          ['The boat goes ___ the bridge.', 'under', 'on', 'behind of'],
          ['B is ___ A and C.', 'between', 'under', 'in front'],
          ['The ghost is hiding ___ the door. I cannot see her!', 'behind', 'between', 'in']
        ] },
      { id: 'frogman', type: 'scramble', npc: '🐸', name: 'Sir Croak',
        intro: ['Ribbit! The marsh swallowed my words. Put the letters in order!', '¡Croac! El pantano se tragó mis palabras. ¡Ordena las letras!'],
        done: ['Ribbit! Thank you, brave traveller.', '¡Croac! Gracias, valiente viajero.'],
        items: [['GHOST', 'fantasma', '👻'], ['BRIDGE', 'puente', '🌉'], ['BEHIND', 'detrás de', ''], ['YESTERDAY', 'ayer', '']] },
      { id: 'keeper', type: 'order', npc: '👵', name: 'Keeper Edna',
        intro: ['My old diary is torn. Can you fix the sentences?', 'Mi viejo diario está roto. ¿Puedes arreglar las frases?'],
        done: ['My memories are back. Bless you!', 'Mis recuerdos han vuelto. ¡Bendito seas!'],
        items: [['I found a key yesterday', 'Ayer encontré una llave'], ['The frog is under the bridge', 'La rana está debajo del puente'], ['Did you see the ghost', '¿Viste al fantasma?'], ['We went to the marsh last night', 'Anoche fuimos al pantano']] },
      { id: 'child', type: 'memory', npc: '👦', name: 'Little Tim',
        intro: ['I am learning verbs in the past. Match each verb with its past!', 'Estoy aprendiendo verbos en pasado. ¡Une cada verbo con su pasado!'],
        done: ['Go – went, see – saw… I remember now!', 'Go – went, see – saw… ¡ya me acuerdo!'],
        pairs: [['go', 'went'], ['see', 'saw'], ['find', 'found'], ['eat', 'ate'], ['have', 'had'], ['come', 'came']] }
    ],
    chests: [
      ['I come out at night. I am in the sky. I am not the sun. What am I?', 'the moon', 'a frog', 'a boat'],
      ['I am small and made of metal. I open doors. What am I?', 'a key', 'a box', 'a bridge']
    ]
  },

  /* ───────────────────────── 5. SKY CITADEL ───────────────────────── */
  {
    key: 'sky', name: 'Sky Citadel', es: 'Ciudadela del Cielo', icon: '🏰',
    level: 'B1 · Reto final: todo mezclado',
    crystal: ['Crystal of Voice', 'Cristal de la Voz'],
    house: '🏛️', mob: '👾', seed: 59, rooms: 10, need: 5,
    pal: { g: ['#f4ecff', '#ece2fb'], speck: '#dccdf5', flower: ['#ffd86b', '#ffffff', '#ffb3e6'],
      path: '#f0cf6a', pathSpeck: '#d9b44c', tree: 'pillar', leaf: '#b9a7e8', leaf2: '#efe8ff', trunk: '#9d8ad6',
      rock: '#a79ad0', water: '#27306b', water2: '#ffffff', floor: '#cdbff0', wall: '#5a4a98', stars: true },
    owl: [
      ['This is the Sky Citadel, the home of Lord Hush.', 'Esta es la Ciudadela del Cielo, el hogar de Lord Hush.'],
      ['Everything you have learned will be useful here.', 'Todo lo que has aprendido te será útil aquí.'],
      ['Get five runes, cross the last maze and defeat him with your words!', '¡Consigue cinco runas, cruza el último laberinto y derrótalo con tus palabras!']
    ],
    mazeIntro: ['This is the Tower of Silence. The stones use everything: directions, colours, objects… and some instructions are for TWO rooms. Remember them!',
      'Esta es la Torre del Silencio. Las piedras lo usan todo: direcciones, colores, objetos… y algunas instrucciones valen para DOS salas. ¡Recuérdalas!'],
    vocab: [
      ['cloud', 'nube', '☁️'], ['star', 'estrella', '⭐'], ['castle', 'castillo', '🏰'], ['king', 'rey', '👑'],
      ['sword', 'espada', '🗡️'], ['shield', 'escudo', '🛡️'], ['dragon', 'dragón', '🐉'], ['wizard', 'mago', '🧙'],
      ['voice', 'voz', '🗣️'], ['silence', 'silencio', '🤫'], ['brave', 'valiente', '🦁'], ['strong', 'fuerte', '💪'],
      ['fast', 'rápido', '⚡'], ['remember', 'recordar', '🧠'], ['word', 'palabra', '💬'], ['win', 'ganar', '🏆'],
      ['light', 'luz', '💡'], ['fly', 'volar', '🕊️'], ['magic', 'magia', '✨'], ['knowledge', 'conocimiento', '📚']
    ],
    quests: [
      { id: 'clouds', type: 'bridge', npc: '', name: 'Cloud Bridge',
        rule: ['The clouds are weak! Step only on verbs in the PAST.', '¡Las nubes son frágiles! Pisa solo los verbos en PASADO.'],
        done: ['You crossed the Cloud Bridge! A rune of light waits on the altar.', '¡Cruzaste el Puente de Nubes! Una runa de luz espera en el altar.'],
        rows: [['went', 'go', 'goes'], ['saw', 'see', 'sees'], ['ate', 'eat', 'eats'], ['found', 'find', 'finds'], ['had', 'has', 'have'], ['flew', 'fly', 'flies']] },
      { id: 'knight', type: 'mc', npc: '🤴', name: 'Prince Leo',
        intro: ['A knight must compare things well. Bigger, better, the best!', 'Un caballero debe comparar bien las cosas. ¡Más grande, mejor, el mejor!'],
        done: ['You are the bravest traveller I know!', '¡Eres el viajero más valiente que conozco!'],
        items: [
          ['A dragon is ___ than a frog.', 'bigger', 'big', 'more big'],
          ['This is the ___ castle in the world.', 'most beautiful', 'more beautiful', 'beautifulest'],
          ['My sword is good, but your sword is ___.', 'better', 'gooder', 'more good'],
          ["The opposite of 'weak' is…", 'strong', 'slow', 'small']
        ] },
      { id: 'oracle', type: 'mc', npc: '🧝', name: 'Oracle Ayla',
        intro: ['I can see the future. Can you speak about it?', 'Yo puedo ver el futuro. ¿Puedes tú hablar de él?'],
        done: ['I see it now: you will win.', 'Ahora lo veo: ganarás.'],
        items: [
          ['Tomorrow we ___ fight the wizard.', 'will', 'did', 'are'],
          ['If you study every day, you ___ learn English.', 'will', 'would', 'did'],
          ['I have ___ seen a dragon. This is my first time!', 'never', 'ever', 'yesterday'],
          ['She is very good ___ magic.', 'at', 'in', 'on']
        ] },
      { id: 'herald', type: 'order', npc: '👨', name: 'Herald Marcus',
        intro: ['I must read the royal message, but the words are mixed!', '¡Debo leer el mensaje real, pero las palabras están mezcladas!'],
        done: ['Hear ye! The message is clear at last!', '¡Oíd! ¡El mensaje por fin está claro!'],
        items: [['The wizard stole all the words', 'El mago robó todas las palabras'], ['We will bring the voices back', 'Traeremos de vuelta las voces'], ['If you are brave you will win', 'Si eres valiente, ganarás'], ['I have never seen a bigger castle', 'Nunca he visto un castillo más grande']] },
      { id: 'smith', type: 'scramble', npc: '🧔', name: 'Smith Bram',
        intro: ['My hammer broke these words into letters. Forge them again!', 'Mi martillo rompió estas palabras en letras. ¡Fórjalas de nuevo!'],
        done: ['Strong words for a strong hero!', '¡Palabras fuertes para un héroe fuerte!'],
        items: [['DRAGON', 'dragón', '🐉'], ['SILENCE', 'silencio', '🤫'], ['REMEMBER', 'recordar', '🧠'], ['KNOWLEDGE', 'conocimiento', '📚']] },
      { id: 'siren', type: 'listen', npc: '👸', name: 'Queen Aria',
        intro: ['Lord Hush stole my voice, but a little is left. Listen very carefully!', 'Lord Hush robó mi voz, pero aún queda un poco. ¡Escucha con mucha atención!'],
        done: ['You can hear even a whisper. Thank you, hero.', 'Puedes oír hasta un susurro. Gracias, héroe.'],
        items: [['thirteen', 'thirty', 'thirsty'], ['ship', 'sheep', 'shop'], ['walk', 'work', 'woke'], ['leave', 'live', 'love']] },
      { id: 'sage', type: 'memory', npc: '👴', name: 'Sage Orin',
        intro: ['Every word has an opposite. Find the pairs of opposites!', 'Cada palabra tiene un opuesto. ¡Encuentra las parejas de opuestos!'],
        done: ['Light and dark, strong and weak… you know them all.', 'Luz y oscuridad, fuerte y débil… te los sabes todos.'],
        pairs: [['big', 'small'], ['hot', 'cold'], ['old', 'young'], ['fast', 'slow'], ['dark', 'light'], ['strong', 'weak']] }
    ],
    chests: [
      ['I am white and soft. I live in the sky. Rain comes from me. What am I?', 'a cloud', 'a star', 'a castle'],
      ['I breathe fire and I can fly. Knights are afraid of me. What am I?', 'a dragon', 'a wizard', 'a king']
    ]
  }
];

/* Preguntas del jefe final */
const BOSS = [
  ["How do you say 'gracias' in English?", 'Thank you', 'Please', 'Goodbye'],
  ['She ___ my best friend.', 'is', 'are', 'am'],
  ['There ___ three eggs in the box.', 'are', 'is', 'am'],
  ['Yesterday I ___ a ghost in the marsh.', 'saw', 'see', 'seen'],
  ['It is snowing. You wear a ___.', 'coat', 'fish', 'bridge'],
  ['The frog is ___ the bridge. (debajo de)', 'under', 'between', 'behind'],
  ['A camel is ___ than a cat.', 'bigger', 'big', 'biggest'],
  ['Tomorrow I ___ visit the castle.', 'will', 'did', 'was'],
  ["The opposite of 'cold' is…", 'hot', 'dark', 'old'],
  ['Look! The children ___ playing.', 'are', 'is', 'be'],
  ['I would like ___ apple, please.', 'an', 'a', 'any'],
  ["'Silencio' in English is…", 'silence', 'voice', 'word'],
  ['Turn ___ means "gira a la izquierda".', 'left', 'right', 'back'],
  ['Did you ___ the key?', 'find', 'found', 'finds']
];

const STORY = [
  { es: 'Hace mucho tiempo, el reino de LEXARA era famoso por sus palabras. Cada aldea cantaba, contaba historias y saludaba al sol en inglés, la lengua antigua del reino.' },
  { es: 'Pero una noche, Lord Hush, el Mago del Silencio, robó los Cinco Cristales de la Palabra… y la gente empezó a olvidar cómo hablar.' },
  { es: 'Tú eres un viajero llegado de tierras lejanas. No hablas la lengua de Lexara… todavía.' },
  { n: 'Ollie', e: '🦉', en: 'Hoot hoot! Hello, traveller! My name is Ollie. I will be your guide.', es: '¡Uuh, uuh! ¡Hola, viajero! Me llamo Ollie. Seré tu guía.' },
  { n: 'Ollie', e: '🦉', en: 'Find the five crystals and bring the words back to Lexara!', es: '¡Encuentra los cinco cristales y devuelve las palabras a Lexara!' },
  { es: '💡 Consejo: intenta leer primero en inglés. Si no entiendes, pulsa «ES» (o la tecla T) para ver la traducción, y 🔊 para escuchar la pronunciación.' },
  { es: '🎮 Muévete con las flechas o WASD (o el mando táctil). Pulsa ESPACIO / botón A para hablar con la gente, abrir cofres y leer letreros. Habla con Ollie 🦉 si no sabes qué hacer.' }
];
