const T = process.argv[2], B = 'http://127.0.0.1:47900';
const call = async (m, p, b) => { const r = await fetch(B + p, { method: m, headers: { Authorization: `Bearer ${T}`, 'content-type': 'application/json' }, body: b ? JSON.stringify(b) : undefined }); const t = await r.text(); if (!r.ok) console.log(m, p, r.status, t.slice(0, 160)); try { return JSON.parse(t); } catch { return t; } };
const ing = (raw, quantity, unit, name, section = null) => ({ raw, quantity, quantityMax: null, unit, name, note: null, section });
const recipes = [
  { title: 'Weeknight mushroom risotto', description: 'Creamy, no stirring marathon: toast the rice, add stock in three goes, finish with butter and parmesan.', servings: 4, prepMinutes: 10, cookMinutes: 30, totalMinutes: 40, tags: ['dinner', 'vegetarian'],
    ingredients: [ing('300 g arborio rice', 300, 'g', 'arborio rice'), ing('400 g mushrooms, sliced', 400, 'g', 'mushrooms'), ing('1 litre vegetable stock', 1, 'l', 'vegetable stock'), ing('1 onion, diced', 1, null, 'onion'), ing('2 cloves garlic', 2, null, 'garlic'), ing('50 g parmesan, grated', 50, 'g', 'parmesan'), ing('30 g butter', 30, 'g', 'butter')],
    steps: ['Fry the onion and mushrooms in half the butter until golden, add the garlic.', 'Add the rice and toast for a minute.', 'Add hot stock a third at a time, stirring now and then, until the rice is tender, about 20 minutes.', 'Off the heat, stir in the rest of the butter and the parmesan. Rest two minutes.'], notes: '', imageUrl: null, sourceUrl: null, sourceName: null },
  { title: 'Sheet-pan chicken and potatoes', description: 'One tray, 45 minutes, nothing to wash but the tray.', servings: 4, prepMinutes: 10, cookMinutes: 40, totalMinutes: 50, tags: ['dinner', 'easy'],
    ingredients: [ing('8 chicken thighs', 8, null, 'chicken thighs'), ing('800 g potatoes, in chunks', 800, 'g', 'potatoes'), ing('2 lemons', 2, null, 'lemons'), ing('3 tbsp olive oil', 3, 'tbsp', 'olive oil'), ing('1 tsp smoked paprika', 1, 'tsp', 'smoked paprika')],
    steps: ['Heat the oven to 220 C.', 'Toss everything in oil, paprika, salt and the juice of one lemon.', 'Roast 40 minutes, turning the potatoes once. Serve with the other lemon.'], notes: '', imageUrl: null, sourceUrl: null, sourceName: null },
  { title: 'Banana oat pancakes', description: 'Three ingredients and a pinch of cinnamon.', servings: 2, prepMinutes: 5, cookMinutes: 10, totalMinutes: 15, tags: ['breakfast', 'quick'],
    ingredients: [ing('2 ripe bananas', 2, null, 'bananas'), ing('100 g rolled oats', 100, 'g', 'rolled oats'), ing('2 eggs', 2, null, 'eggs'), ing('1 tsp cinnamon', 1, 'tsp', 'cinnamon')],
    steps: ['Blend everything smooth.', 'Fry small pancakes on a medium pan, two minutes a side.'], notes: '', imageUrl: null, sourceUrl: null, sourceName: null },
  { title: 'Spaghetti aglio e olio', description: 'Garlic, chilli, oil, pasta water. That is the whole trick.', servings: 2, prepMinutes: 5, cookMinutes: 12, totalMinutes: 17, tags: ['dinner', 'pasta', 'quick'],
    ingredients: [ing('200 g spaghetti', 200, 'g', 'spaghetti'), ing('4 cloves garlic, sliced', 4, null, 'garlic'), ing('60 ml olive oil', 60, 'ml', 'olive oil'), ing('1 chilli, chopped', 1, null, 'chilli'), ing('a handful of parsley', null, null, 'parsley')],
    steps: ['Boil the spaghetti in well-salted water.', 'Warm the garlic and chilli gently in the oil until just golden.', 'Toss the drained pasta in the pan with a ladle of pasta water and the parsley.'], notes: '', imageUrl: null, sourceUrl: null, sourceName: null },
  { title: 'Red lentil dal', description: 'Weeknight staple that keeps for days.', servings: 4, prepMinutes: 10, cookMinutes: 25, totalMinutes: 35, tags: ['dinner', 'vegan', 'batch'],
    ingredients: [ing('250 g red lentils', 250, 'g', 'red lentils'), ing('1 tin coconut milk', 1, null, 'coconut milk'), ing('1 onion, diced', 1, null, 'onion'), ing('2 tsp curry powder', 2, 'tsp', 'curry powder'), ing('1 thumb of ginger, grated', 1, null, 'ginger')],
    steps: ['Soften the onion and ginger, stir in the curry powder.', 'Add lentils, coconut milk and 500 ml water, simmer 20 minutes.', 'Season and serve over rice.'], notes: '', imageUrl: null, sourceUrl: null, sourceName: null },
  { title: 'Greek salad', description: 'Summer, whenever you want it.', servings: 2, prepMinutes: 10, cookMinutes: 0, totalMinutes: 10, tags: ['lunch', 'vegetarian'],
    ingredients: [ing('4 tomatoes, wedged', 4, null, 'tomatoes'), ing('1 cucumber, chunked', 1, null, 'cucumber'), ing('150 g feta', 150, 'g', 'feta'), ing('2 tbsp olive oil', 2, 'tbsp', 'olive oil'), ing('1 red onion, thin slices', 1, null, 'red onion')],
    steps: ['Combine the vegetables, lay the feta on top, drizzle with oil and oregano.'], notes: '', imageUrl: null, sourceUrl: null, sourceName: null },
];
const items = [['arborio rice', 500, 'g'], ['mushrooms', 0, 'g'], ['vegetable stock', 1, 'l'], ['onion', 3, null], ['garlic', 6, null], ['parmesan', 80, 'g'], ['butter', 250, 'g'], ['eggs', 6, null], ['rolled oats', 400, 'g'], ['spaghetti', 500, 'g'], ['olive oil', 700, 'ml'], ['red lentils', 0, 'g'], ['coconut milk', 2, null], ['potatoes', 1500, 'g'], ['lemons', 1, null], ['bananas', 0, null], ['milk', 2, 'l'], ['feta', 0, 'g'], ['tomatoes', 2, null], ['cucumber', 0, null], ['smoked paprika', 1, 'tsp'], ['cinnamon', 8, 'tsp']];
for (const [name, qty, unit] of items) await call('POST', '/api/items', { name, qty, unit, minQty: qty === 0 ? 0 : undefined });
for (const r of recipes) await call('POST', '/api/recipes', r);
const list = await call('GET', '/api/recipes');
console.log('recipes', list.length ?? list);
await call('POST', '/api/list/from-recipe', { recipeId: list[0]?.id });
for (const n of [['bananas', 6], ['feta', 150], ['cucumber', 2], ['milk', 1], ['red lentils', 250], ['mushrooms', 400]]) await call('POST', '/api/list', { name: n[0], qty: n[1] });
console.log('list', JSON.stringify(await call('GET', '/api/list')).slice(0, 300));
