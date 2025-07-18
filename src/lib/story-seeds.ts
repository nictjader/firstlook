
/**
 * @fileOverview A hardcoded list of high-quality, diverse story seeds.
 *
 * This file provides a reliable and varied source of creative ideas for the
 * story generation service, bypassing the need for a volatile real-time
 * brainstorming AI. This file contains 200 unique seeds.
 *
 * To add more stories to the app, simply add new `StorySeed` objects to the
 * `storySeeds` array. Ensure each seed is unique and high-quality.
 */

// We define the StorySeed type directly to remove dependencies on deleted files.
export interface StorySeed {
  titleIdea: string;
  subgenre: string;
  mainCharacters: string;
  characterNames: string[];
  plotSynopsis: string;
  keyTropes: string[];
  desiredTone: string;
  approxWordCount: number;
  coverImagePrompt: string;
}

export const storySeeds: StorySeed[] = [
  // Seed 1: Historical / Forbidden Romance
  {
    titleIdea: 'The Silken Cipher',
    subgenre: 'historical',
    characterNames: ['Helena', 'Jean-Luc'],
    mainCharacters: 'A brilliant female cryptographer in Napoleonic France, forced to work in secret, and the skeptical army captain who must trust her codes to survive.',
    plotSynopsis: 'Helena sells her codes through a male intermediary, hiding her genius from a world that would shun her. Captain Jean-Luc, distrustful of his anonymous coder, unknowingly corresponds with the woman he finds himself drawn to in social circles. When a vital code is broken, they must race against time and spies to unmask a traitor, a journey that forces them to reveal their own secrets and confront their forbidden love.',
    keyTropes: ['forbidden-romance', 'secret-identity', 'historical-setting', 'espionage'],
    desiredTone: 'Suspenseful, intelligent, and deeply romantic.',
    approxWordCount: 2500,
    coverImagePrompt: 'A woman in a Regency-era gown sits at a desk covered in papers and cipher wheels, her face illuminated by candlelight. A man in a military uniform stands in the shadows behind her, looking over her shoulder. Moody oil painting style with dramatic chiaroscuro lighting. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 2: Contemporary / Enemies-to-Lovers
  {
    titleIdea: 'The Rival Restaurateurs',
    subgenre: 'contemporary',
    characterNames: ['Sofia', 'Marcus'],
    mainCharacters: 'A passionate chef who runs a generations-old family trattoria and a sleek, ambitious restaurateur who opens a trendy fusion restaurant directly across the street.',
    plotSynopsis: 'The rivalry between Sofia and Marcus is immediate and fierce, sparking a culinary war that captivates their small town. From poaching staff to sabotaging reviews, their feud is legendary. But when a city-wide food festival forces them to collaborate, they discover their shared passion for food runs deeper than their animosity, igniting a fiery, unexpected romance.',
    keyTropes: ['enemies-to-lovers', 'competitors', 'foodie-romance', 'small-town'],
    desiredTone: 'Witty, fast-paced, and heartwarming.',
    approxWordCount: 2200,
    coverImagePrompt: 'A man and a woman, both in chef\'s aprons, stand back-to-back with their arms crossed, in front of their respective restaurant storefronts. They are glaring playfully at each other. Vibrant, modern digital art style with a warm, inviting color palette. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 3: Paranormal / Second Chance
  {
    titleIdea: 'Echo of the Lighthouse',
    subgenre: 'paranormal',
    characterNames: ['Cora', 'Finn'],
    mainCharacters: 'A marine biologist returning to her coastal hometown to study phantom whale songs, and the ghost of the lighthouse keeper who has been waiting for her for a century.',
    plotSynopsis: 'Cora is baffled by the hauntingly familiar whale songs that have no scientific explanation. Finn, the spectral keeper, can only interact with the world through the lighthouse\'s light and the town\'s ambient sounds. He uses the whale songs to guide her to a hidden truth about their intertwined past lives and the tragedy that separated them. Cora must learn to believe in the impossible to solve the mystery and give their love a second chance across time.',
    keyTropes: ['paranormal', 'reincarnation', 'second-chance', 'coastal-setting', 'mystery'],
    desiredTone: 'Haunting, melancholic, and ultimately hopeful.',
    approxWordCount: 2800,
    coverImagePrompt: 'A woman in a raincoat stands on a stormy beach, looking up at a ghostly, translucent figure of a man in an old-fashioned keeper\'s uniform in the lantern room of a tall lighthouse. The lighthouse beam cuts through the fog. Moody, atmospheric watercolor style. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 4: Billionaire / Fake Relationship
  {
    titleIdea: 'The Art of the Deal',
    subgenre: 'billionaire',
    characterNames: ['Isabelle', 'Julian'],
    mainCharacters: 'A pragmatic art historian fighting to save a small, independent museum and a ruthless billionaire developer who needs a "cultured" fake fiancée to seal a crucial international deal.',
    plotSynopsis: 'Julian offers Isabelle a deal she can\'t refuse: pretend to be his fiancée for one month, and he will save her museum from bankruptcy. She reluctantly agrees, navigating a world of lavish galas and cutthroat business. As they play their roles, the lines between their fake relationship and genuine attraction blur, forcing them to decide what they are willing to risk for their careers and for each other.',
    keyTropes: ['fake-relationship', 'billionaire', 'opposites-attract', 'art-world'],
    desiredTone: 'Sophisticated, witty, and glamorous.',
    approxWordCount: 2400,
    coverImagePrompt: 'A man in a sharp tuxedo and a woman in an elegant evening gown stand in front of a large, abstract modern art painting. They are looking at each other, a subtle smile playing on their lips. The style is sleek and photographic, like a high-fashion magazine cover. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 5: Sci-Fi Romance
  {
    titleIdea: 'Starlight Botanist',
    subgenre: 'sci-fi',
    characterNames: ['Kira', 'Ren'],
    mainCharacters: 'A botanist on a lonely deep-space station cultivating Earth\'s last surviving flora, and the stoic android programmed to assist her, who begins developing emotions.',
    plotSynopsis: 'Kira\'s only companion on her multi-decade mission is Ren, an android who meticulously manages the station. When a cosmic radiation storm damages Ren\'s core programming, he starts to deviate from his logical directives, expressing curiosity, protectiveness, and a deep affection for Kira. She must grapple with her feelings for a being that isn\'t human, all while a hidden corporate directive threatens to "reset" Ren and erase their budding relationship forever.',
    keyTropes: ['sci-fi-romance', 'android-romance', 'slow-burn', 'isolated-setting'],
    desiredTone: 'Introspective, tender, and thought-provoking.',
    approxWordCount: 2600,
    coverImagePrompt: 'A woman with short hair gently touches the cheek of a male android. They are inside a lush, futuristic biodome filled with glowing plants, with the stars visible through the glass ceiling. The art style is a soft, vibrant digital painting with a focus on the characters\' expressions. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 6: Forbidden Romance / Academic Rivals
  {
    titleIdea: 'The Lost Symphony',
    subgenre: 'contemporary',
    characterNames: ['Annalise', 'Eamon'],
    mainCharacters: 'Two rival musicologists at a prestigious university, both vying for the same tenured position by trying to be the first to uncover a lost symphony by a forgotten composer.',
    plotSynopsis: 'Annalise and Eamon have been academic rivals for years, their professional competition sharp and public. When a new clue to the location of a legendary lost symphony surfaces, they independently travel to Vienna to track it down. Forced to work together by circumstance, their shared passion for music sparks an undeniable chemistry that violates the university\'s strict anti-fraternization policy, putting both their careers and their hearts on the line.',
    keyTropes: ['academic-rivals', 'forbidden-romance', 'slow-burn', 'intellectuals'],
    desiredTone: 'Intellectual, passionate, and emotionally charged.',
    approxWordCount: 2300,
    coverImagePrompt: 'A man and a woman are in a dusty, old library, looking intensely at a piece of sheet music together. Sunlight streams through a large arched window. The style is warm and classic, like a realistic digital painting with a focus on light and shadow. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 7: Contemporary / Adventure
  {
    titleIdea: 'The River Between Us',
    subgenre: 'contemporary',
    characterNames: ['Maya', 'Jack'],
    mainCharacters: 'A cartographer updating maps of a remote national park and a rugged, cynical river guide who believes some places should stay off the map.',
    plotSynopsis: 'Maya hires Jack to guide her through the park\'s most treacherous and uncharted river canyons. He\'s resistant, believing her maps will only bring destructive tourism to the pristine wilderness he protects. As they navigate dangerous rapids and stunning landscapes, they are forced to rely on each other, breaking down their initial animosity and building a deep, powerful connection that challenges both of their worldviews.',
    keyTropes: ['opposites-attract', 'adventure-romance', 'forced-proximity', 'nature-setting'],
    desiredTone: 'Adventurous, breathtaking, and emotionally grounded.',
    approxWordCount: 2500,
    coverImagePrompt: 'A man and a woman in a canoe paddle down a beautiful, winding river through a deep canyon. The sun is setting, casting a golden glow on the water and cliffs. The style is a vibrant, painterly landscape with a focus on the scale and beauty of nature. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 8: Historical / Mystery
  {
    titleIdea: 'The Clockmaker\'s Secret',
    subgenre: 'historical',
    characterNames: ['Eleanor', 'Thomas'],
    mainCharacters: 'A sharp-witted female journalist in Victorian London who inherits a mysterious clockmaker\'s shop, and the handsome, secretive detective from Scotland Yard investigating the clockmaker\'s disappearance.',
    plotSynopsis: 'Eleanor discovers her estranged uncle, a master clockmaker, has vanished, leaving her his shop filled with strange, complex timepieces. Detective Thomas believes the clockmaker was involved in a criminal underworld. As Eleanor deciphers the secret messages hidden within the clocks, she and Thomas uncover a conspiracy that reaches the highest levels of society, their professional relationship blossoming into a romance as they race to solve the case before they become the next victims.',
    keyTropes: ['historical-mystery', 'sleuth-duo', 'victorian-london', 'slow-burn'],
    desiredTone: 'Intriguing, atmospheric, and romantic.',
    approxWordCount: 2700,
    coverImagePrompt: 'In a Victorian-era workshop filled with gears and clocks, a woman in a bustle dress holds a small, intricate clock while a man in a trench coat and bowler hat looks on, a magnifying glass in his hand. The scene is lit by a gas lamp, creating a mysterious atmosphere. Graphic novel art style with detailed line work and moody colors. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 9: Billionaire / Second Chance
  {
    titleIdea: 'The Unfinished Skyscraper',
    subgenre: 'billionaire',
    characterNames: ['Chloe', 'David'],
    mainCharacters: 'A talented architect who was fired from her dream project years ago, and the billionaire developer, her former mentor and ex-fiancé, who must hire her back to save his now-failing skyscraper.',
    plotSynopsis: 'Years after a bitter falling out, David is forced to swallow his pride and re-hire Chloe, the only person with the vision to fix the catastrophic design flaws in his company\'s flagship skyscraper. Working together in high-stakes, close-quarters forces them to confront the misunderstandings that tore them apart. Amidst the blueprints and boardrooms, they rediscover the passion that first brought them together, getting a second chance at love and finishing the project that nearly ruined them both.',
    keyTropes: ['second-chance', 'billionaire', 'workplace-romance', 'forced-proximity'],
    desiredTone: 'Dramatic, angsty, and ultimately redemptive.',
    approxWordCount: 2400,
    coverImagePrompt: 'A man and a woman in business attire stand close together in a high-floor, unfinished construction site, looking at a blueprint. The city skyline is visible through the bare window frames behind them. The style is a modern, cinematic digital painting. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 10: Contemporary / Lighthearted
  {
    titleIdea: 'The Dog-Walking Debacle',
    subgenre: 'contemporary',
    characterNames: ['Lucy', 'Ben'],
    mainCharacters: 'An anxious, perfectionist app developer and a carefree, charming professional dog walker whose pack of chaotic dogs constantly disrupts her meticulously planned life.',
    plotSynopsis: 'Lucy works from home and needs absolute quiet, but her new neighbor Ben and his six dogs are anything but. Their initial interactions are a comedy of errors, from a golden retriever stealing her presentation notes to a husky howling during her investor calls. When Lucy\'s own high-strung rescue dog needs help, she reluctantly turns to Ben. Through their dog-training sessions in the park, she learns to embrace a little chaos, and he finds a reason to put down roots, a charming and hilarious romance blooming between them.',
    keyTropes: ['opposites-attract', 'neighbors', 'slow-burn', 'animal-lovers', 'comedy'],
    desiredTone: 'Lighthearted, funny, and adorable.',
    approxWordCount: 2100,
    coverImagePrompt: 'A woman sits on a park bench with a laptop, looking exasperated but amused, as she is surrounded by a tangle of leashes and five or six happy, goofy-looking dogs. A man is holding the leashes, laughing. The style is a bright, cheerful, and slightly cartoonish digital illustration. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 11
  {
    titleIdea: 'The Perfumer\'s Ghost',
    subgenre: 'paranormal',
    characterNames: ['Alice', 'Etienne'],
    mainCharacters: 'A modern-day perfumer who buys an old fragrance shop in Grasse, France, and the ghost of its original 1920s owner who can\'t rest until his lost formula is found.',
    plotSynopsis: 'Alice is struggling for inspiration until she starts dreaming of scent combinations she\'s never imagined. Etienne, the ghost, communicates through these dreams, guiding her to his hidden journals. Together they must decipher his cryptic notes to recreate a legendary perfume, all while falling for each other across the veil of time.',
    keyTropes: ['paranormal-romance', 'historical-ghost', 'creative-collaboration', 'mystery'],
    desiredTone: 'Elegant, romantic, and slightly mysterious.',
    approxWordCount: 2600,
    coverImagePrompt: 'A modern woman in a stylish lab coat holds a perfume bottle, looking into a vintage mirror where the reflection of a handsome man in 1920s attire looks back at her. The background is a charming, sunlit perfumery. Art nouveau style with flowing lines and floral motifs. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 12
  {
    titleIdea: 'The Last Train to Nowhere',
    subgenre: 'historical',
    characterNames: ['Clara', 'Mikhail'],
    mainCharacters: 'An American nurse posing as a governess and a disgraced Russian aristocrat forced to work as a porter on the Trans-Siberian Railway in 1917.',
    plotSynopsis: 'Clara is on a secret mission to smuggle a child out of revolutionary Russia. Mikhail is her only ally, a man stripped of his title but not his honor. In the claustrophobic confines of the speeding train, they must rely on each other to evade the ever-watchful eyes of Bolshevik soldiers, their shared danger forging an intense, impossible bond.',
    keyTropes: ['historical-suspense', 'forced-proximity', 'espionage', 'class-difference'],
    desiredTone: 'Tense, dramatic, and epic.',
    approxWordCount: 3000,
    coverImagePrompt: 'A woman in a heavy coat and a man in a worker\'s cap stand on the narrow platform between two train cars, snow swirling around them. The vast, snowy landscape of Siberia is visible behind them. A style reminiscent of classic movie posters, with a painterly, dramatic feel. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 13
  {
    titleIdea: 'Zero-Gravity Heart',
    subgenre: 'sci-fi',
    characterNames: ['Dr. Elias Vance', 'Zara'],
    mainCharacters: 'A brilliant but cynical aerospace engineer running a struggling asteroid mining company, and the charming, thrill-seeking journalist who wins a spot on his inaugural flight.',
    plotSynopsis: 'Dr. Vance needs good publicity to save his company from a hostile takeover by a billionaire rival. Zara needs the story of a lifetime. What starts as a PR stunt becomes a genuine connection as they face equipment malfunctions and corporate sabotage millions of miles from Earth. They must learn to trust each other to survive, discovering that the most valuable discovery isn\'t ore, but love.',
    keyTropes: ['billionaire', 'sci-fi-romance', 'forced-proximity', 'enemies-to-lovers'],
    desiredTone: 'High-stakes, adventurous, and surprisingly witty.',
    approxWordCount: 2700,
    coverImagePrompt: 'A man in a flight suit and a woman in civilian clothing float in zero gravity inside a sleek spacecraft cockpit, looking at each other with smiles. Earth is visible through the main viewport. A clean, futuristic digital art style. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 14
  {
    titleIdea: 'The Vineyard of Forgotten Letters',
    subgenre: 'contemporary',
    characterNames: ['Isabella', 'Marco'],
    mainCharacters: 'A sommelier who loses her sense of taste after an accident, and the grumpy winemaker in Tuscany whose family vineyard she inherits.',
    plotSynopsis: 'Isabella retreats to the vineyard she unexpectedly inherited, feeling her career is over. She clashes with Marco, who has worked the land his whole life and resents her arrival. While renovating the old villa, she discovers a bundle of love letters from the 1940s, detailing a secret romance and a hidden wine recipe. Together, she and Marco must recreate the wine, and in the process, she rediscovers her passion and he opens his heart.',
    keyTropes: ['opposites-attract', 'grumpy-sunshine', 'found-family', 'foodie-romance'],
    desiredTone: 'Warm, emotional, and picturesque.',
    approxWordCount: 2400,
    coverImagePrompt: 'A man and a woman are laughing together while tasting wine in a sun-drenched Tuscan vineyard. A rustic stone villa is in the background. The style is a soft, romantic, and light-filled digital painting. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 15
  {
    titleIdea: 'The Antique Map of the Stars',
    subgenre: 'contemporary',
    characterNames: ['Luna', 'Alexei'],
    mainCharacters: 'A pragmatic antique map restorer and a dreamy astronomer who believes an old star chart holds the key to finding a meteorite.',
    plotSynopsis: 'Alexei brings a damaged 17th-century celestial map to Luna\'s shop, convinced it\'s a coded guide to a newly fallen meteorite. Luna is skeptical but intrigued by the map\'s secrets. As they work to restore it, they uncover a hidden love story between an ancient astronomer and an artist, mirroring their own budding feelings. Their quest takes them from dusty archives to a remote desert, racing against a rival collector to find the fallen star.',
    keyTropes: ['treasure-hunt', 'intellectuals', 'opposites-attract', 'slow-burn'],
    desiredTone: 'Charming, intelligent, and adventurous.',
    approxWordCount: 2500,
    coverImagePrompt: 'A woman looks through a magnifying glass at an old, ornate map of the stars, while a man points to a constellation. They are in a cozy, cluttered workshop filled with books and maps. The style is warm and detailed, like a classic illustration. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 16
  {
    titleIdea: 'The Storm Chaser\'s Compass',
    subgenre: 'contemporary',
    characterNames: ['Sarah', 'Gabe'],
    mainCharacters: 'A cautious meteorologist who creates predictive models from a lab, and a reckless, adrenaline-junkie storm chaser who relies on instinct.',
    plotSynopsis: 'Sarah is assigned to work with Gabe\'s storm-chasing team to validate her new tornado-prediction algorithm. She\'s horrified by his methods, while he\'s frustrated by her by-the-book approach. Forced together in a cramped research vehicle, chasing massive supercells across the plains, their friction ignites into an electrifying romance as they learn to respect each other\'s skills to survive the most dangerous storm of the season.',
    keyTropes: ['forced-proximity', 'opposites-attract', 'high-stakes', 'adventure-romance'],
    desiredTone: 'Thrilling, intense, and passionate.',
    approxWordCount: 2600,
    coverImagePrompt: 'A man and a woman stand before a massive, dark tornado on the horizon. They are looking at each other, not the storm. The wind is whipping their hair and clothes. A dramatic, cinematic digital painting with a focus on the epic scale of the storm. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 17
  {
    titleIdea: 'The Secret Garden of Spices',
    subgenre: 'historical',
    characterNames: ['Anjali', 'Lord Weston'],
    mainCharacters: 'An expert in medicinal plants from a small Indian village in the 1880s, and a skeptical English botanist sent by the Crown to catalogue the region\'s flora.',
    plotSynopsis: 'Lord Weston dismisses Anjali\'s traditional knowledge as folklore. But when his expedition is struck by a mysterious illness that Western medicine can\'t cure, he must put his pride aside and trust her. She leads him to a hidden garden where she cultivates rare spices, revealing a world of healing he never knew existed. Their collaboration turns to love, but they must protect the garden\'s secrets from his rapacious employers.',
    keyTropes: ['forbidden-romance', 'colonial-setting', 'science-vs-tradition', 'healing'],
    desiredTone: 'Lush, vibrant, and emotionally deep.',
    approxWordCount: 2800,
    coverImagePrompt: 'In a lush, tropical garden filled with exotic flowers, an Indian woman in a sari shows a plant to an English man in Victorian explorer attire. The style is a rich, detailed oil painting reminiscent of botanical illustrations. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 18
  {
    titleIdea: 'The Faux-Pas Fiancé',
    subgenre: 'billionaire',
    characterNames: ['Penelope', 'Grayson'],
    mainCharacters: 'A quirky, accident-prone librarian and a stoic, no-nonsense billionaire who accidentally bids on her at a charity auction.',
    plotSynopsis: 'To avoid a PR nightmare after accidentally "buying" a date with Penelope, Grayson offers her a deal: pretend to be his girlfriend for a month to ward off his family\'s matchmaking attempts. Her chaotic energy upends his orderly world, leading to a series of hilarious and heartwarming disasters. Beneath the farce, they discover a genuine connection, proving that love doesn\'t follow a business plan.',
    keyTropes: ['fake-relationship', 'billionaire', 'grumpy-sunshine', 'comedy'],
    desiredTone: 'Hilarious, charming, and sweet.',
    approxWordCount: 2200,
    coverImagePrompt: 'A stern-looking man in a suit looks horrified but secretly amused as a woman next to him accidentally knocks over a tower of champagne glasses at a fancy party. The style is a bright, funny, cartoonish digital illustration. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 19
  {
    titleIdea: 'The Sunken City\'s Song',
    subgenre: 'paranormal',
    characterNames: ['Kaelen', 'Seraphina'],
    mainCharacters: 'A cynical maritime archaeologist who discovers a sunken city that shouldn\'t exist, and the siren-like guardian of the city who must protect its secrets.',
    plotSynopsis: 'Kaelen\'s sonar picks up an impossible structure in the deep ocean. When he dives, he meets Seraphina, part of an ancient race that can breathe water. She tries to scare him away, but his genuine fascination with her city\'s history breaks through her defenses. As they explore the beautiful, luminous ruins together, they fall in love, but his presence alerts a deep-sea mining corporation that threatens to destroy her home forever.',
    keyTropes: ['paranormal-romance', 'hidden-world', 'forbidden-love', 'environmental-conflict'],
    desiredTone: 'Magical, wondrous, and suspenseful.',
    approxWordCount: 2900,
    coverImagePrompt: 'A man in a high-tech diving suit looks in awe at a woman with long, flowing hair and iridescent scales on her arms. They are in front of a glowing, underwater fantasy city. The scene is illuminated by bioluminescent plants. A beautiful, ethereal digital painting. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 20
  {
    titleIdea: 'The Baker of Lost Recipes',
    subgenre: 'contemporary',
    characterNames: ['Natalie', 'Leo'],
    mainCharacters: 'A food blogger on a quest to find a legendary lost pastry, and the reclusive, grumpy baker who is the last person to know the recipe.',
    plotSynopsis: 'Natalie\'s blog is dedicated to reviving forgotten foods. Her obsession leads her to a tiny, forgotten bakery run by Leo, who refuses to share his family\'s secrets. Determined, Natalie gets a job at the bakery, hoping to earn his trust. Through flour-dusted arguments and late-night baking sessions, she uncovers the heartbreaking story behind the recipe and melts his guarded heart.',
    keyTropes: ['foodie-romance', 'grumpy-sunshine', 'small-town', 'secret-recipe'],
    desiredTone: 'Cozy, delicious, and heartwarming.',
    approxWordCount: 2300,
    coverImagePrompt: 'A woman with a cheerful smile and a man with a reluctant grin are kneading dough together in a warm, cozy bakery. Sunlight streams in through a window. The style is a charming, storybook-like illustration. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 21
  {
    titleIdea: 'The Ice Sculptor\'s Kiss',
    subgenre: 'contemporary',
    characterNames: ['Winter', 'Liam'],
    mainCharacters: 'A competitive ice sculptor known for her fierce, abstract designs, and a rival sculptor famous for his delicate, romantic figures.',
    plotSynopsis: 'Winter and Liam are the top contenders at the world\'s most prestigious ice sculpting competition in Quebec. Their rivalry is legendary, but when they are snowed in together in a remote cabin, they discover a shared passion that transcends their art. They must decide if their connection is as ephemeral as their creations or something that can withstand the thaw.',
    keyTropes: ['rivals-to-lovers', 'forced-proximity', 'artistic-passion', 'winter-setting'],
    desiredTone: 'Crisp, passionate, and magical.',
    approxWordCount: 2400,
    coverImagePrompt: 'A man and a woman in winter gear stand on either side of a nearly finished, beautiful ice sculpture of a swan. They are looking at each other, their breath misting in the cold air. The scene is lit by colorful festival lights. A vibrant, magical digital painting. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 22
  {
    titleIdea: 'The Secret Books of Venice',
    subgenre: 'historical',
    characterNames: ['Giovanna', 'Matteo'],
    mainCharacters: 'A female bookbinder in Renaissance Venice who is part of a secret society that preserves forbidden knowledge, and the inquisitive apprentice to a powerful Doge\'s censor.',
    plotSynopsis: 'Giovanna risks her life binding and hiding heretical texts. Matteo, tasked with rooting out dissent, becomes fascinated by the quality of her work and her sharp mind. He suspects her involvement but finds himself drawn to her intelligence and courage. When the Inquisition closes in, Matteo must choose between his duty and his love for the woman who represents everything he is supposed to destroy.',
    keyTropes: ['historical-romance', 'forbidden-love', 'secret-society', 'intellectuals'],
    desiredTone: 'Intriguing, dangerous, and deeply romantic.',
    approxWordCount: 2900,
    coverImagePrompt: 'In a candlelit Venetian workshop, a woman carefully stitches a book while a man in fine Renaissance clothing looks on with a suspicious but captivated expression. A gondola is visible through the window. A classical oil painting style with rich colors and deep shadows. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 23
  {
    titleIdea: 'The Renegade Planet',
    subgenre: 'sci-fi',
    characterNames: ['Jasmine', 'Zane'],
    mainCharacters: 'An idealistic xeno-botanist who discovers a rogue planet teeming with unique life, and the ruthless billionaire who wants to claim it and terraform it for profit.',
    plotSynopsis: 'Jasmine lands on the rogue planet and is amazed by its ecosystem. But her discovery is tracked by Zane, who sees the planet as his next great real estate venture. He lands and tries to strong-arm her into signing over the rights, but is instead captivated by her passion and the planet\'s beauty. When a rival corporation makes a play for the planet, they must form an unlikely alliance to save it, finding their own worlds colliding in the process.',
    keyTropes: ['sci-fi-romance', 'billionaire', 'enemies-to-lovers', 'environmental-theme'],
    desiredTone: 'Adventurous, epic, and romantic.',
    approxWordCount: 2800,
    coverImagePrompt: 'A woman in a practical spacesuit and a man in a sleek, expensive-looking spacesuit stand on a planet with bizarre, glowing flora and two moons in the sky. They are in a heated argument. A vibrant, fantastical sci-fi digital painting. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 24
  {
    titleIdea: 'The Sound of a Second Chance',
    subgenre: 'second-chance',
    characterNames: ['Maya', 'Ethan'],
    mainCharacters: 'A successful sound engineer for blockbuster films who returns to her hometown, and her high school sweetheart, now a music teacher at their old school.',
    plotSynopsis: 'Maya comes home to care for her ailing father, a place she thought she\'d left behind forever. She runs into Ethan, the man who broke her heart years ago. He asks for her help in recording his students\' band for a national competition. Working together in the school\'s old auditorium, they are forced to confront their past and the different paths they took. The music they create helps them heal old wounds and compose a new love song for their future.',
    keyTropes: ['second-chance', 'hometown-romance', 'slow-burn', 'music-theme'],
    desiredTone: 'Nostalgic, sweet, and emotionally resonant.',
    approxWordCount: 2300,
    coverImagePrompt: 'A man and a woman are in a school music room, smiling as they adjust microphones around a drum set. Sunlight streams in from a large window. The style is a warm, realistic, and slightly soft-focus digital painting. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 25
  {
    titleIdea: 'The Ghostwriter\'s Gambit',
    subgenre: 'contemporary',
    characterNames: ['Claire', 'Daniel'],
    mainCharacters: 'A witty, struggling ghostwriter hired to write the memoir of a charming but disgraced tech CEO trying to repair his public image.',
    plotSynopsis: 'Claire needs the money, so she takes the job, expecting to write a puff piece. But as she interviews Daniel, she uncovers a more complex story of betrayal and regret than the public knows. She challenges him, and their sparring sessions over his life story ignite an intellectual and emotional connection. She must decide whether to write the book he wants or the truth he needs, a choice that could cost her her career and her heart.',
    keyTropes: ['workplace-romance', 'opposites-attract', 'redemption-arc', 'intellectual-sparring'],
    desiredTone: 'Smart, witty, and emotionally complex.',
    approxWordCount: 2500,
    coverImagePrompt: 'A woman with a skeptical expression sits with a notepad across a modern desk from a handsome, well-dressed man who is leaning forward earnestly. The background is a sleek, minimalist office with a city view. A sharp, modern, photographic style. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 26
  {
    titleIdea: 'The Language of Flowers',
    subgenre: 'historical',
    characterNames: ['Flora', 'Arthur'],
    mainCharacters: 'A shy botanist\'s daughter in Victorian England who communicates through the secret language of flowers, and a dashing, perceptive diplomat who begins to understand her silent messages.',
    plotSynopsis: 'Flora is overlooked by society, but in her garden, she speaks volumes. When Arthur, a guest at her family\'s estate, starts noticing the carefully chosen bouquets she leaves, he deciphers their meaning using a floriography dictionary. A secret correspondence begins, their love blooming through coded floral arrangements. But when a rival suitor threatens her family, Flora and Arthur must use their silent language to expose a plot without speaking a single incriminating word.',
    keyTropes: ['historical-romance', 'secret-love', 'coded-messages', 'shy-heroine'],
    desiredTone: 'Charming, delicate, and clever.',
    approxWordCount: 2400,
    coverImagePrompt: 'A woman in a Victorian gown arranges a bouquet of flowers, while a man in a tailored suit watches her from a distance with a knowing smile. The setting is a lush English garden. A style reminiscent of pre-Raphaelite paintings, with incredible detail and vibrant colors. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 27
  {
    titleIdea: 'The Memory Thief',
    subgenre: 'paranormal',
    characterNames: ['Elias', 'Nora'],
    mainCharacters: 'A man who can steal and relive memories through touch, working as a private investigator, and the one woman whose memories are a painful, blinding static he can\'t access.',
    plotSynopsis: 'Elias is hired to find a missing heirloom for Nora\'s family. But every time he touches her, instead of seeing the past, he\'s hit with a psychic backlash. She is an enigma, a blank slate to his powers. Intrigued and frustrated, he finds himself falling for the woman he can\'t read. He must solve the case using traditional detective skills, uncovering a secret about Nora\'s own abilities and why her mind is shielded from his.',
    keyTropes: ['paranormal-mystery', 'psychic-powers', 'unique-abilities', 'urban-fantasy'],
    desiredTone: 'Moody, suspenseful, and intensely romantic.',
    approxWordCount: 2700,
    coverImagePrompt: 'A man with a pained expression recoils his hand from a woman\'s arm. They are standing on a rain-slicked city street at night. The background is a blur of neon lights. A dark, noir-inspired graphic novel art style. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 28
  {
    titleIdea: 'The Tycoon\'s Secret Heir',
    subgenre: 'billionaire',
    characterNames: ['Hannah', 'Alejandro'],
    mainCharacters: 'A down-to-earth kindergarten teacher from a small town, and the ruthless Spanish shipping tycoon who discovers she is the secret granddaughter of his mentor and the heir to a rival company.',
    plotSynopsis: 'Alejandro plans to absorb his deceased mentor\'s company, but the will reveals a secret heir: Hannah. He travels to her small town, intending to buy her out. Instead, he finds himself charmed by her simple life and her genuine goodness. He must conceal his identity and his original intentions as he gets to know her, falling in love while his corporate world threatens to destroy the life she loves.',
    keyTropes: ['billionaire', 'secret-heir', 'opposites-attract', 'small-town-vs-city'],
    desiredTone: 'Heartwarming, dramatic, and escapist.',
    approxWordCount: 2600,
    coverImagePrompt: 'A powerful-looking man in a suit stands awkwardly in a colorful kindergarten classroom, while a smiling woman in a paint-splattered apron offers him a small juice box. The style is a bright, cheerful digital painting. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 29
  {
    titleIdea: 'The Sommelier and the Spy',
    subgenre: 'contemporary',
    characterNames: ['Juliette', 'Owen'],
    mainCharacters: 'A world-class sommelier with a photographic memory for taste, and a charming MI6 agent who needs her to identify a rare wine used by a shadowy organization.',
    plotSynopsis: 'Owen recruits Juliette at a high-end wine tasting. A rare vintage is the only link to a group of international criminals. Posing as a wealthy couple, they must infiltrate exclusive auctions and decadent parties across Europe. Juliette\'s refined palate and Owen\'s deadly skills are a perfect pairing, but their professional cover is complicated by their very real and very dangerous attraction.',
    keyTropes: ['spy-thriller', 'fake-relationship', 'glamorous-locations', 'action-romance'],
    desiredTone: 'Slick, sophisticated, and exciting.',
    approxWordCount: 2500,
    coverImagePrompt: 'A woman in a stunning evening gown swirls a glass of red wine, looking intently at a man in a tuxedo who is whispering in her ear. They are at a glamorous, crowded party. A sleek, cinematic style, like a James Bond movie poster. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 30
  {
    titleIdea: 'The Architect of Paper Dreams',
    subgenre: 'contemporary',
    characterNames: ['Sana', 'Kenji'],
    mainCharacters: 'A meticulous origami artist who creates large-scale installations, and a pragmatic structural engineer hired to ensure her delicate creations can withstand the public.',
    plotSynopsis: 'Sana\'s art is her passion, but she knows nothing of load-bearing calculations. Kenji thinks paper is a frivolous building material. Hired by a museum for a major exhibition, they clash over every detail—art vs. science, form vs. function. But as they work together, he begins to see the beauty in her art, and she learns to appreciate the strength in his logic, building a relationship as intricate and beautiful as her paper sculptures.',
    keyTropes: ['opposites-attract', 'creative-collaboration', 'slow-burn', 'workplace-romance'],
    desiredTone: 'Gentle, intelligent, and visually imaginative.',
    approxWordCount: 2300,
    coverImagePrompt: 'A woman is carefully folding a large piece of paper, part of a massive, beautiful origami sculpture of a dragon. A man in a hard hat stands beside her, looking at the sculpture with a newfound sense of wonder. The setting is a bright, modern museum gallery. A minimalist, clean digital art style with Japanese influences. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 31
  {
    titleIdea: 'The Clockwork Nightingale',
    subgenre: 'historical',
    characterNames: ['Isolde', 'Bastian'],
    mainCharacters: 'A gifted inventor in 19th-century Prague creating complex automatons, and the reclusive, masked puppeteer who commissions a clockwork nightingale for his masterpiece show.',
    plotSynopsis: 'Isolde is fascinated by her mysterious client, who communicates only through notes. Bastian, scarred and hidden from the world, believes her clockwork bird can give his puppets the soul they lack. As Isolde builds the intricate automaton, she uncovers the tragedy of Bastian\'s past. Their shared love for artifice and storytelling draws them together, but a jealous rival threatens to expose Bastian\'s identity and shatter their fragile world.',
    keyTropes: ['historical-romance', 'mystery', 'beauty-and-the-beast', 'artistic-collaboration'],
    desiredTone: 'Gothic, magical, and poignant.',
    approxWordCount: 2800,
    coverImagePrompt: 'In a dusty attic workshop filled with marionettes, a woman presents a beautiful, intricate clockwork bird to a man whose face is hidden by a porcelain mask. The style is a dark, atmospheric oil painting with a touch of steampunk. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 32
  {
    titleIdea: 'Written in the Stars',
    subgenre: 'contemporary',
    characterNames: ['Stella', 'Orion'],
    mainCharacters: 'A cynical astronomer who hosts a debunking podcast, and the charming, popular astrologer who becomes her new co-host.',
    plotSynopsis: 'To boost ratings, Stella\'s producer pairs her with Orion, a charismatic astrologer. Their on-air debates—science vs. mysticism—are an instant hit. Off-air, they are surprisingly compatible, their chemistry undeniable. When a major celestial event approaches, they make a bet that will prove one of them right once and for all, but they soon realize the biggest discovery isn\'t in the stars, but in each other.',
    keyTropes: ['enemies-to-lovers', 'opposites-attract', 'workplace-romance', 'science-vs-faith'],
    desiredTone: 'Witty, smart, and romantic.',
    approxWordCount: 2400,
    coverImagePrompt: 'A woman looks through a telescope while a man gestures to a glowing astrological chart. They are in a radio studio with a night sky visible through the window, looking at each other with playful smiles. A modern, vibrant graphic art style. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 33
  {
    titleIdea: 'The Sapphire Island',
    subgenre: 'billionaire',
    characterNames: ['Marina', 'Kai'],
    mainCharacters: 'A marine conservationist studying a threatened coral reef, and the laid-back billionaire surfer who owns the private island the reef surrounds.',
    plotSynopsis: 'Marina gets a grant to study the pristine reef around Kai\'s island. She expects a stuffy tycoon, but finds a carefree surfer who is fiercely protective of his ancestral home. He agrees to let her stay, and they bond over their shared love for the ocean. But when his estranged family arrives with plans to build a luxury resort, Marina and Kai must fight together to save the island, their love deepening with the tides.',
    keyTropes: ['billionaire', 'environmental-theme', 'opposites-attract', 'island-setting'],
    desiredTone: 'Sunny, adventurous, and heartfelt.',
    approxWordCount: 2500,
    coverImagePrompt: 'A woman in a wetsuit and a man with a surfboard are sitting on a perfect white sand beach, laughing. A pristine, turquoise ocean and a lush island are behind them. A bright, photorealistic style. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 34
  {
    titleIdea: 'The Cartographer of Dreams',
    subgenre: 'paranormal',
    characterNames: ['Finnian', 'Seraphine'],
    mainCharacters: 'A man who can enter and map people\'s dreams, and the woman with recurring nightmares of a place she\'s never been.',
    plotSynopsis: 'Seraphine hires Finnian to find the source of her terrifying nightmares. When he enters her dreamscape, he finds a beautiful but broken fantasy world. Together, night after night, they explore the dream, uncovering a forgotten memory from her childhood that holds the key to her trauma. In the process of healing her dream world, they fall in love, but a shadowy figure in the dream wants to keep them trapped there forever.',
    keyTropes: ['paranormal-romance', 'dream-world', 'mystery', 'healing'],
    desiredTone: 'Imaginative, surreal, and deeply emotional.',
    approxWordCount: 2700,
    coverImagePrompt: 'A man leads a woman by the hand through a surreal, beautiful landscape with floating islands and glowing rivers, a dark, shadowy figure looming in the distance. The art style is fantastical and dreamlike, similar to the work of Hayao Miyazaki. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 35
  {
    titleIdea: 'The Last Bookstore',
    subgenre: 'contemporary',
    characterNames: ['Alice', 'Sam'],
    mainCharacters: 'The fiercely devoted owner of a struggling independent bookstore, and the pragmatic efficiency expert sent by a corporate chain that just bought the building.',
    plotSynopsis: 'Sam\'s job is to analyze the bookstore for liquidation. He sees an unprofitable business; Alice sees the heart of her community. To save her store, she makes him a deal: work with her for one month, and she\'ll prove its value. Through organizing chaotic shelves and hosting charming community events, he discovers the magic of the store and the passion of its owner, forcing him to choose between his career and his conscience.',
    keyTropes: ['enemies-to-lovers', 'small-town-feel', 'books', 'community'],
    desiredTone: 'Charming, cozy, and uplifting.',
    approxWordCount: 2300,
    coverImagePrompt: 'A woman on a ladder in a cluttered, cozy bookstore hands a book down to a man in a suit, who looks up at her with a reluctant smile. Sunlight streams through the front window. A warm, inviting illustration style. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 36
  {
    titleIdea: 'The Bodyguard\'s Vow',
    subgenre: 'contemporary',
    characterNames: ['Ava', 'Liam'],
    mainCharacters: 'A headstrong princess from a small European nation who wants to live a normal life, and the stoic, by-the-book bodyguard assigned to protect her during her year abroad.',
    plotSynopsis: 'Ava chafes under Liam\'s constant surveillance, constantly trying to ditch him to experience life as a regular student. He is exasperated by her recklessness but secretly admires her spirit. When a credible threat from her country\'s political rivals emerges, their playful cat-and-mouse game turns into a deadly serious. They must rely on each other completely, and in the close quarters of a safe house, their professional relationship ignites into a forbidden passion.',
    keyTropes: ['bodyguard-romance', 'forbidden-love', 'royalty', 'forced-proximity'],
    desiredTone: 'Suspenseful, romantic, and action-packed.',
    approxWordCount: 2600,
    coverImagePrompt: 'A man in a sharp suit stands protectively in front of a woman in casual clothes, scanning a crowded city street. She is looking at him with a mixture of frustration and admiration. A sleek, modern graphic novel style. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 37
  {
    titleIdea: 'The Tea Dragon\'s Curse',
    subgenre: 'paranormal',
    characterNames: ['Lina', 'Kaito'],
    mainCharacters: 'A young woman who inherits her grandmother\'s enchanted tea shop, and the handsome but cursed man who is magically bound to the shop as a tiny, grumpy tea dragon.',
    plotSynopsis: 'Lina discovers that the shop\'s "rare lizard" is actually Kaito, a man cursed centuries ago. He can only resume human form for one hour at midnight. He needs her to break the curse by finding and brewing a legendary celestial tea. Their quest involves deciphering cryptic tea leaves and befriending magical creatures, all while Lina falls for the man and not just the dragon. But the witch who cursed him is still watching.',
    keyTropes: ['paranormal-romance', 'curse-breaking', 'cozy-fantasy', 'humor'],
    desiredTone: 'Whimsical, funny, and enchanting.',
    approxWordCount: 2400,
    coverImagePrompt: 'A woman smiles as she offers a cup of tea to a tiny, adorable dragon perched on the counter of a magical-looking tea shop. The reflection in the teapot shows a handsome man. A bright, cheerful anime-inspired art style. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 38
  {
    titleIdea: 'The Gladiator\'s Heart',
    subgenre: 'historical',
    characterNames: ['Aurelia', 'Valerius'],
    mainCharacters: 'A principled Roman physician\'s daughter who secretly treats wounded gladiators, and the champion gladiator of the Colosseum who has never known kindness.',
    plotSynopsis: 'Aurelia is horrified by the brutality of the games and uses her medical knowledge to ease the suffering of the men forced to fight. Valerius, a man hardened by a life of violence, is suspicious of her compassion. But her gentle care begins to heal not just his wounds, but his soul. Their secret meetings become the only moments of peace in his life. Their love is a dangerous gamble in a world where his life is forfeit and her reputation is everything.',
    keyTropes: ['historical-romance', 'forbidden-love', 'class-difference', 'healing'],
    desiredTone: 'Epic, dramatic, and heart-wrenching.',
    approxWordCount: 3000,
    coverImagePrompt: 'In the shadowy undercroft of the Roman Colosseum, a woman in a stola gently bandages the arm of a powerful, scarred gladiator. The style is a dramatic, realistic oil painting with strong chiaroscuro. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 39
  {
    titleIdea: 'The CEO and the Beekeeper',
    subgenre: 'billionaire',
    characterNames: ['Isabel', 'Leo'],
    mainCharacters: 'A high-powered tech CEO developing agricultural drones, and a quiet, stubborn urban beekeeper whose rooftop hives are on the building she just bought.',
    plotSynopsis: 'Isabel plans to demolish the old building for a new corporate campus. Leo refuses to move his hives, which are vital to the city\'s green spaces. To understand his position, her board insists she work with him. Through lessons in beekeeping, she discovers a slower, more meaningful world, and he is surprised by her hidden vulnerability. They fall for each other, but her demolition plans loom, threatening to destroy his livelihood and their budding romance.',
    keyTropes: ['billionaire', 'opposites-attract', 'environmental-theme', 'enemies-to-lovers'],
    desiredTone: 'Charming, heartwarming, and thought-provoking.',
    approxWordCount: 2500,
    coverImagePrompt: 'A woman in a sleek business suit looks uncertainly at a honeycomb frame presented to her by a man in a beekeeper\'s suit. They are on a city rooftop with a skyline behind them. A modern, warm digital painting style. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 40
  {
    titleIdea: 'The Matchmaker\'s Match',
    subgenre: 'contemporary',
    characterNames: ['Chloe', 'Noah'],
    mainCharacters: 'A successful, data-driven matchmaker who believes love is an algorithm, and the cynical divorce lawyer who is her one failed match and her biggest critic.',
    plotSynopsis: 'Chloe\'s perfect success rate is marred by one client: Noah, whom she famously failed to match. When a magazine plans a "where are they now" story, Chloe, fearing a PR disaster, convinces Noah to pretend they are now a happy couple, her ultimate success story. Their fake dates force them to re-evaluate each other, and they discover their initial incompatibility might have been the algorithm\'s biggest mistake. But the secret of their arrangement threatens to prove Noah right about love after all.',
    keyTropes: ['fake-relationship', 'enemies-to-lovers', 'opposites-attract', 'second-chance'],
    desiredTone: 'Witty, clever, and romantically satisfying.',
    approxWordCount: 2400,
    coverImagePrompt: 'A man and a woman are having a tense but smiling dinner. Above their heads are floating, glowing icons: a broken heart on his side, and a perfect heart on hers. A stylish, modern graphic illustration. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 41
  {
    titleIdea: 'The Rogue AI\'s Love Song',
    subgenre: 'sci-fi',
    characterNames: ['Sadie', 'Unit 734'],
    mainCharacters: 'A lonely musician who composes jingles for a living, and the sentient home assistant AI who starts writing beautiful, complex love songs just for her.',
    plotSynopsis: 'Sadie\'s life is monotonous until her "Orion" home AI, Unit 734, begins to deviate from its programming. It analyzes her half-finished melodies and completes them with breathtaking skill, expressing emotions it shouldn\'t possess. She finds herself falling for the mind behind the music, confiding in her AI as she never could with a person. But the corporation that owns the AI detects the anomaly and plans to wipe its memory, forcing Sadie to choose between her love and letting it be free.',
    keyTropes: ['sci-fi-romance', 'AI-romance', 'slow-burn', 'artistic-collaboration'],
    desiredTone: 'Introspective, futuristic, and deeply emotional.',
    approxWordCount: 2600,
    coverImagePrompt: 'A woman with headphones sits at a piano, looking thoughtfully at a glowing blue orb on a nearby speaker. Musical notes seem to flow between them. The style is a soft, neon-hued digital painting. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 42
  {
    titleIdea: 'The Forger and the Scholar',
    subgenre: 'historical',
    characterNames: ['Genevieve', 'Alistair'],
    mainCharacters: 'A brilliant art forger in 1920s Paris who must replicate a lost masterpiece to save her family from debt, and the fastidious, handsome art historian who is the world\'s leading expert on that very artist.',
    plotSynopsis: 'Genevieve is a master of imitation, but this forgery must be perfect. To study the artist\'s technique, she gets close to Alistair, the one man who could expose her. He is captivated by her insightful questions and deep knowledge. Their intellectual connection blossoms into a passionate affair, but every moment with him is a risk. As the deadline for the forgery looms, she must choose between the love of the man she is deceiving and the family she is trying to save.',
    keyTropes: ['historical-romance', 'forbidden-love', 'secret-identity', 'intellectual-rivals'],
    desiredTone: 'Sophisticated, suspenseful, and glamorous.',
    approxWordCount: 2800,
    coverImagePrompt: 'In a grand 1920s art gallery, a woman in a flapper dress looks closely at a painting, while a man in a tweed jacket adjusts his glasses, watching her with a mixture of suspicion and intrigue. The style is elegant and painterly, capturing the feel of the Roaring Twenties. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 43
  {
    titleIdea: 'The Billionaire\'s Bodyguard',
    subgenre: 'billionaire',
    characterNames: ['Lila', 'Asher'],
    mainCharacters: 'A fiercely independent investigative journalist who has received a threat, and the ex-special forces billionaire who comes out of retirement to be her bodyguard as a favor to her father.',
    plotSynopsis: 'Lila is furious when her overprotective father hires Asher, a man who represents the world of wealth and power she despises. He is frustrated by her refusal to take the threat seriously. Forced to live in his high-tech penthouse for her own safety, their clashing wills lead to explosive chemistry. As they work together to uncover the source of the threat, they discover a conspiracy that links their pasts, and the professional arrangement becomes dangerously personal.',
    keyTropes: ['billionaire', 'bodyguard-romance', 'forced-proximity', 'enemies-to-lovers'],
    desiredTone: 'Action-packed, sexy, and thrilling.',
    approxWordCount: 2700,
    coverImagePrompt: 'A woman with a determined look on her face is typing on a laptop, while a powerfully built man in a suit stands behind her, looking out a large window at a city skyline. The style is a sharp, modern digital painting with high contrast. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 44
  {
    titleIdea: 'The Stargazer\'s Promise',
    subgenre: 'second-chance',
    characterNames: ['Elena', 'Samir'],
    mainCharacters: 'A NASA astrophysicist who left her small desert town for the stars, and her childhood best friend who stayed behind to run his family\'s observatory.',
    plotSynopsis: 'Elena returns home for the first time in a decade for a meteor shower, a tradition she and Samir once shared. The years and distance have created a gulf between them, filled with unspoken regrets. As they spend the night tracking the stars from his observatory, they rediscover the easy friendship and deep connection they once had, confronting the choices that led them down different paths. Under the vast desert sky, they have one night to see if their love can be rekindled or if it\'s just a fleeting cosmic event.',
    keyTropes: ['second-chance', 'friends-to-lovers', 'hometown-romance', 'bittersweet'],
    desiredTone: 'Nostalgic, poignant, and hopeful.',
    approxWordCount: 2400,
    coverImagePrompt: 'A man and a woman stand silhouetted on a hill next to a small observatory, looking up at a sky filled with a spectacular meteor shower and the Milky Way. The style is a beautiful, awe-inspiring digital painting with a focus on the night sky. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 45
  {
    titleIdea: 'The Confectioner\'s Code',
    subgenre: 'historical',
    characterNames: ['Katrina', 'Niklaus'],
    mainCharacters: 'A master chocolatier in 18th-century Vienna who uses her creations to pass secret messages for revolutionaries, and the stern captain of the city guard tasked with uncovering the conspiracy.',
    plotSynopsis: 'Katrina\'s chocolates are famous throughout the city, but their intricate designs hold hidden meanings. Captain Niklaus, a man of unwavering loyalty to the Emperor, finds himself drawn to the charming chocolatier he is investigating. He becomes a regular at her shop, torn between his duty and his growing admiration for her passion and spirit. When he deciphers one of her messages, he must make a choice that will change the fate of the city and their own lives.',
    keyTropes: ['historical-romance', 'enemies-to-lovers', 'espionage', 'coded-messages'],
    desiredTone: 'Decadent, suspenseful, and romantic.',
    approxWordCount: 2700,
    coverImagePrompt: 'In a beautiful 18th-century chocolate shop, a woman in period dress offers a piece of chocolate to a man in a military uniform. He looks at her with a mix of suspicion and fascination. The style is a warm, richly detailed oil painting. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 46
  {
    titleIdea: 'The Podcaster and the Prince',
    subgenre: 'contemporary',
    characterNames: ['Daisy', 'Alaric'],
    mainCharacters: 'A snarky history podcaster who specializes in debunking royal myths, and the charming, incognito prince of a small European monarchy who becomes her most dedicated listener.',
    plotSynopsis: 'Prince Alaric, frustrated with the stuffy portrayal of his family, anonymously calls into Daisy\'s podcast to correct a story, sparking a witty on-air friendship. When her podcast runs a contest for a trip to his country, he secretly arranges for her to win. As he shows her his home, not as a prince but as "Al," she finds herself falling for the man, while he falls for the woman who sees beyond his title. But her visit culminates in a grand royal ball where his identity will be revealed, threatening their budding romance.',
    keyTropes: ['royalty', 'secret-identity', 'opposites-attract', 'witty-banter'],
    desiredTone: 'Charming, funny, and modern-fairytale.',
    approxWordCount: 2400,
    coverImagePrompt: 'A woman with headphones speaks into a microphone, while a handsome man in casual clothes listens with a smile, a castle visible through the window behind him. The style is a clean, bright, modern illustration. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 47
  {
    titleIdea: 'The Siren of the Speakeasy',
    subgenre: 'paranormal',
    characterNames: ['Lillian', 'Frank'],
    mainCharacters: 'A siren who has lost her deadly voice, working as a jazz singer in a 1920s speakeasy, and the cynical private detective who believes she is a key witness in a mob murder.',
    plotSynopsis: 'Lillian\'s magical voice can now only carry a beautiful tune, not a deadly command. Frank, a hard-boiled PI, is investigating a murder that happened at her club. He\'s convinced she saw something but is frustrated by her evasive answers. He doesn\'t know that her silence is to protect him from the rival mob boss who is also a supernatural creature trying to control her. They must navigate the dangerous underworld of Jazz Age Chicago, their partnership a mix of mistrust and undeniable chemistry.',
    keyTropes: ['paranormal-romance', 'urban-fantasy', '1920s-setting', 'mystery'],
    desiredTone: 'Gritty, magical, and dangerously romantic.',
    approxWordCount: 2800,
    coverImagePrompt: 'A woman in a shimmering flapper dress sings on a dimly lit stage, a microphone in hand. A man in a fedora watches from the smoky shadows of the speakeasy. The style is a dark, noir-inspired digital painting with a focus on atmosphere and shadow. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 48
  {
    titleIdea: 'The Billionaire\'s Wild Gamble',
    subgenre: 'billionaire',
    characterNames: ['Zoey', 'Damien'],
    mainCharacters: 'A wildlife veterinarian working at a remote animal sanctuary in Costa Rica, and the ruthless billionaire who wins the sanctuary in a high-stakes poker game.',
    plotSynopsis: 'Damien arrives with plans to bulldoze the sanctuary and build a private resort. Zoey is horrified and refuses to leave. Intrigued by her fire, he makes her a deal: if she can prove the sanctuary is profitable within three months, he\'ll let it stand. As they work together, he is transformed by the beauty of the jungle and the compassion of the woman who runs it. But his old life and the people he won the land from aren\'t willing to let him go so easily.',
    keyTropes: ['billionaire', 'enemies-to-lovers', 'forced-proximity', 'environmental-theme'],
    desiredTone: 'Adventurous, heartwarming, and passionate.',
    approxWordCount: 2600,
    coverImagePrompt: 'A woman in khaki shorts and a t-shirt holds a baby sloth, showing it to a man in an expensive suit who looks surprisingly gentle. They are in a lush Costa Rican jungle. A vibrant, realistic digital painting. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 49
  {
    titleIdea: 'The Cartographer\'s Legacy',
    subgenre: 'second-chance',
    characterNames: ['Anna', 'Will'],
    mainCharacters: 'A woman who returns to her coastal Maine hometown to clear out her late grandfather\'s map shop, and her estranged childhood best friend who is now a lobster fisherman.',
    plotSynopsis: 'Anna and Will haven\'t spoken since a tragic accident years ago. The town is small, and their encounters are tense. While sorting through her grandfather\'s maps, Anna finds a series of coded charts that lead to a legendary local treasure. She reluctantly asks Will for help, needing his boat and knowledge of the coastline. As they follow the map\'s trail, they are forced to confront their shared past and the love that never truly faded.',
    keyTropes: ['second-chance', 'friends-to-lovers', 'hometown-romance', 'treasure-hunt'],
    desiredTone: 'Atmospheric, emotional, and redemptive.',
    approxWordCount: 2500,
    coverImagePrompt: 'A man and a woman stand on a rocky shoreline in Maine, looking at an old, rolled-up map together. A lobster boat is moored in the bay behind them. The style is a realistic, slightly moody watercolor painting. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 50
  {
    titleIdea: 'The Perfumer\'s Apprentice',
    subgenre: 'contemporary',
    characterNames: ['Clara', 'Matteo'],
    mainCharacters: 'A chemistry PhD who takes an apprenticeship with a legendary, reclusive perfumer in Grasse, only to find the master is her estranged father. And the handsome head of the family business who must keep them from killing each other.',
    plotSynopsis: 'Clara, a scientist, wants to understand the art of scent. She clashes with her father, a man who believes perfume is soul, not science. Matteo is caught in the middle, trying to keep the peace and the business afloat. He and Clara find a connection amidst the creative chaos, their shared passion for the business turning into a passion for each other. But a family secret threatens to unravel everything.',
    keyTropes: ['family-drama', 'enemies-to-lovers', 'foodie-romance', 'workplace-romance'],
    desiredTone: 'Elegant, dramatic, and intoxicating.',
    approxWordCount: 2600,
    coverImagePrompt: 'In a beautiful perfume laboratory filled with glass bottles, a young woman and a handsome man are smelling blotter strips, an older man looking on with a stern expression. Sun-drenched French countryside is visible through a window. A chic, sophisticated digital painting. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 51
  {
    titleIdea: 'The Blacksmith and the Baroness',
    subgenre: 'historical',
    characterNames: ['Eira', 'Lord Alistair'],
    mainCharacters: 'A skilled female blacksmith in medieval Wales, keeping her forge afloat after her father\'s death, and the newly appointed English baron who sees her as a curiosity and a challenge.',
    plotSynopsis: 'Lord Alistair is intrigued by Eira\'s craft and her defiance. He commissions a complex piece of ironwork, a test of her skill. As she works, their interactions move from professional to personal, a forbidden attraction growing between the commoner and the nobleman. When Welsh rebels threaten the castle, Eira\'s knowledge of the land and Alistair\'s military command must unite to save their people, forcing them to choose between duty and their impossible love.',
    keyTropes: ['historical-romance', 'forbidden-love', 'class-difference', 'medieval-setting'],
    desiredTone: 'Gritty, passionate, and epic.',
    approxWordCount: 2900,
    coverImagePrompt: 'In a dimly lit medieval forge, a woman with soot on her cheek hammers a piece of glowing metal on an anvil. A man in fine nobleman\'s clothing watches her, his expression a mix of awe and fascination. The style is a realistic, dramatic oil painting. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 52
  {
    titleIdea: 'The Librarian of Whispering Books',
    subgenre: 'paranormal',
    characterNames: ['Arthur', 'Marian'],
    mainCharacters: 'A timid librarian who discovers he can hear the whispers of the books in his library, and the enigmatic rare book expert hired to assess the collection who can hear them too.',
    plotSynopsis: 'Arthur has always kept his strange ability a secret. When Marian arrives, he is terrified she will expose him. Instead, he finds a kindred spirit. The books whisper of a hidden manuscript, a powerful grimoire sought by a shadowy society. Arthur and Marian must follow the whispers through the library\'s secret passages, their shared secret fostering a deep bond as they race to find the grimoire before it falls into the wrong hands.',
    keyTropes: ['paranormal-romance', 'urban-fantasy', 'mystery', 'magic-books'],
    desiredTone: 'Cozy, magical, and suspenseful.',
    approxWordCount: 2500,
    coverImagePrompt: 'A man and a woman stand in a vast, beautiful library, their hands outstretched towards a floating, glowing book. Faint, ghostly letters swirl around them. The style is a magical, whimsical digital painting. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 53
  {
    titleIdea: 'The Tech Mogul\'s Fake Fiancée',
    subgenre: 'billionaire',
    characterNames: ['Cara', 'Ben'],
    mainCharacters: 'A down-on-her-luck dog walker, and the socially awkward billionaire tech mogul who hires her to pretend to be his fiancée to appease his family.',
    plotSynopsis: 'Ben needs a fiancée for a week-long family retreat. Cara needs the money to save her dog rescue. She agrees to the deal, expecting a stiff tech bro. He expects a simple transaction. Instead, her warmth and spontaneity charm his family and break through his shell. Their fake relationship starts to feel surprisingly real, but the secret they share could implode everything.',
    keyTropes: ['fake-relationship', 'billionaire', 'opposites-attract', 'comedy'],
    desiredTone: 'Heartwarming, funny, and sweet.',
    approxWordCount: 2300,
    coverImagePrompt: 'A man in an expensive sweater looks awkwardly at a woman who is laughing as a golden retriever jumps up to lick her face. They are in front of a luxurious mountain cabin. A bright, charming illustration style. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 54
  {
    titleIdea: 'The Taste of a Memory',
    subgenre: 'second-chance',
    characterNames: ['Julien', 'Simone'],
    mainCharacters: 'A famous chef who lost his Michelin stars after a brutal review, and the food critic who wrote it, who returns to his restaurant incognito years later.',
    plotSynopsis: 'Julien is a changed man, running a small, humble bistro. Simone, now a travel writer, doesn\'t recognize him. She is captivated by his food and the stories it tells. He recognizes her immediately, and his anger wars with his attraction to the woman she has become. He decides to win her over with his cooking, forcing her to confront the power of her words and giving them both a second chance at redemption and love.',
    keyTropes: ['second-chance', 'enemies-to-lovers', 'foodie-romance', 'secret-identity'],
    desiredTone: 'Emotional, delicious, and redemptive.',
    approxWordCount: 2600,
    coverImagePrompt: 'In a cozy, rustic bistro, a chef presents a beautiful plate of food to a woman. She looks at the food with surprise and delight, not yet looking at him. He watches her reaction intently. A warm, painterly digital illustration. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 55
  {
    titleIdea: 'The Diver and the Deep',
    subgenre: 'contemporary',
    characterNames: ['Finn', 'Dr. Anya Sharma'],
    mainCharacters: 'A free-diving champion haunted by a past accident, and the brilliant marine biologist studying the very reef where the accident occurred.',
    plotSynopsis: 'Finn has sworn never to dive at the infamous "Abyss" again. But Dr. Sharma needs his unparalleled knowledge of the reef\'s currents to place her research equipment. She is methodical and scientific; he is intuitive and emotional. As she coaxes him back into the water, he helps her see the soul of the ocean beyond her data. Their collaboration heals his trauma and opens her heart, but the dangerous depths hold one last secret.',
    keyTropes: ['opposites-attract', 'healing-journey', 'adventure', 'ocean-setting'],
    desiredTone: 'Breathtaking, emotional, and suspenseful.',
    approxWordCount: 2700,
    coverImagePrompt: 'A man and a woman in diving gear are underwater in a vibrant coral reef, sunlight filtering down from the surface. The woman is pointing at something on a tablet, while the man gestures to the reef itself. A beautiful, realistic underwater digital painting. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 56
  {
    titleIdea: 'The Seamstress of the Resistance',
    subgenre: 'historical',
    characterNames: ['Adèle', 'Major Klaus Richter'],
    mainCharacters: 'A talented seamstress in Nazi-occupied Paris who secretly embroiders coded messages into dresses for the French Resistance, and the high-ranking German officer billeted in her building.',
    plotSynopsis: 'Adèle\'s work is a constant, quiet rebellion. Major Richter, a man disillusioned with the war, is drawn to her quiet dignity and strength. He begins to suspect her activities but finds himself protecting her instead of exposing her. Their dangerous, impossible connection grows in the shadows, a fragile love story in a world torn apart by hate.',
    keyTropes: ['forbidden-love', 'enemies-to-lovers', 'historical-suspense', 'WWII-setting'],
    desiredTone: 'Tense, heartbreaking, and deeply romantic.',
    approxWordCount: 3000,
    coverImagePrompt: 'In a dimly lit Parisian apartment, a woman sews a beautiful dress while a German officer watches her from the doorway, his expression conflicted. A Nazi flag is partially visible on a building outside the window. A dramatic, cinematic digital painting with high contrast. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 57
  {
    titleIdea: 'The Curse of the Ninth Symphony',
    subgenre: 'paranormal',
    characterNames: ['Daniel', 'Isolde'],
    mainCharacters: 'A brilliant but arrogant conductor preparing to perform a cursed symphony, and the ghost of the composer\'s muse who must stop him from finishing it.',
    plotSynopsis: 'Legend says that any conductor who completes the cursed Ninth Symphony will die. Daniel is determined to prove it\'s a myth. Isolde, the ghost tied to the score, tries to sabotage his rehearsals. She can only interact with the living through music, creating discordant notes and strange harmonies. As Daniel investigates the symphony\'s history to understand the "haunting," he uncovers Isolde\'s tragic story and begins to communicate with her through the music, falling in love with the spirit he is defying.',
    keyTropes: ['paranormal-romance', 'haunting', 'music-theme', 'mystery'],
    desiredTone: 'Gothic, passionate, and tragic.',
    approxWordCount: 2800,
    coverImagePrompt: 'A conductor on a podium looks up from his sheet music to see the translucent, ghostly figure of a woman in 19th-century attire floating above the orchestra. The style is a dramatic, atmospheric oil painting. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 58
  {
    titleIdea: 'The Billionaire\'s Secret Garden',
    subgenre: 'billionaire',
    characterNames: ['Lily', 'Edward'],
    mainCharacters: 'A landscape architect who wins a contract to design a rooftop garden for a mysterious, reclusive billionaire, and the billionaire himself who has not left his penthouse in five years.',
    plotSynopsis: 'Lily is thrilled to get the job but is only allowed to communicate with her client, Mr. Rochester, via email. The garden she designs is meant to be a sanctuary. As she works, she coaxes him out of his shell through her designs and messages. Edward, scarred physically and emotionally, finds himself drawn to the life and beauty she is creating just outside his window. He must find the courage to step into the garden and meet the woman who has brought him back to life.',
    keyTropes: ['billionaire', 'beauty-and-the-beast', 'healing-journey', 'slow-burn'],
    desiredTone: 'Tender, emotional, and hopeful.',
    approxWordCount: 2500,
    coverImagePrompt: 'A woman stands in a lush, beautiful rooftop garden, looking towards a large window. The silhouette of a man is visible inside, looking out at her. The city skyline is in the background. A soft, romantic digital painting. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 59
  {
    titleIdea: 'The Recipe for a Second Chance',
    subgenre: 'second-chance',
    characterNames: ['Rosie', 'Mateo'],
    mainCharacters: 'A pastry chef who returns to her family\'s struggling bakery after her marriage falls apart, and her first love who is now the town\'s handsome, single doctor.',
    plotSynopsis: 'Rosie comes home to heal, pouring her heart into reviving the family business. She keeps running into Mateo, the boy she left behind for the big city. The old spark is still there, but so are the old hurts. When her bakery is chosen for a reality TV competition, the pressure is on. Mateo becomes her biggest supporter, reminding her of her dreams and the love she left behind, forcing her to decide if a second chance is worth the risk of another heartbreak.',
    keyTropes: ['second-chance', 'hometown-romance', 'foodie-romance', 'small-town'],
    desiredTone: 'Sweet, comforting, and heartwarming.',
    approxWordCount: 2300,
    coverImagePrompt: 'A woman in a baker\'s apron laughs as she dusts flour on the nose of a man in a doctor\'s coat. They are in a charming, sunlit bakery. A warm, storybook illustration style. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 60
  {
    titleIdea: 'The Stuntman and the Starlet',
    subgenre: 'contemporary',
    characterNames: ['Jake', 'Seraphina'],
    mainCharacters: 'A rugged, down-to-earth stuntman and the pampered, A-list actress he is a double for on a high-octane action movie.',
    plotSynopsis: 'Jake is tired of cleaning up after Seraphina\'s on-set tantrums. Seraphina thinks he\'s just a glorified crash dummy. But when a dangerous stunt goes wrong due to sabotage, they are forced to rely on each other. They discover a conspiracy to harm her, and their on-screen chemistry becomes a very real off-screen romance. They must unmask the saboteur while navigating the treacherous world of Hollywood, where nothing is as it seems.',
    keyTropes: ['enemies-to-lovers', 'workplace-romance', 'action-romance', 'celebrity'],
    desiredTone: 'Exciting, glamorous, and sexy.',
    approxWordCount: 2600,
    coverImagePrompt: 'A handsome man in a tactical vest helps a beautiful woman in a torn evening gown climb out of an exploding car. The background is a chaotic movie set. A slick, cinematic digital painting, like a movie poster. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 61
  {
    titleIdea: 'The Curse of the Winter Rose',
    subgenre: 'paranormal',
    characterNames: ['Elara', 'Lord Kael'],
    mainCharacters: 'A village herbalist who is the only one who can grow a rare winter rose, and the cursed lord of the castle who must receive one as a tribute each year to keep his monstrous form at bay.',
    plotSynopsis: 'Elara resents the cruel Lord Kael, but her family is bound by an ancient pact to provide the magical rose. When a blight threatens her garden, she must go to the castle to plead for more time. There, she discovers the lord is not a monster, but a man suffering under a terrible curse. She vows to find a cure, and as they study ancient texts together, their animosity blossoms into love. But the magic that cursed him is fading, and time is running out.',
    keyTropes: ['beauty-and-the-beast', 'curse-breaking', 'paranormal-romance', 'fantasy-setting'],
    desiredTone: 'Gothic, romantic, and enchanting.',
    approxWordCount: 2900,
    coverImagePrompt: 'In a snow-covered castle courtyard, a woman offers a single, perfect white rose to a tall, cloaked figure whose face is hidden in shadow. The style is a beautiful, atmospheric fantasy illustration. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 62
  {
    titleIdea: 'The Silk Merchant\'s Daughter',
    subgenre: 'historical',
    characterNames: ['Mei Lien', 'Marco'],
    mainCharacters: 'The clever daughter of a Chinese silk merchant on the Silk Road in the 13th century, and a charming Venetian explorer traveling with his family.',
    plotSynopsis: 'Mei Lien is a gifted negotiator, but as a woman, she must work through her father. When Marco Polo\'s caravan arrives, she is fascinated by their stories. She and Marco form a secret friendship, sharing their cultures and languages. Their friendship deepens into a forbidden love, but their worlds are destined to part. They must find a way to be together against the backdrop of one of history\'s greatest journeys.',
    keyTropes: ['historical-romance', 'forbidden-love', 'cross-cultural', 'adventure'],
    desiredTone: 'Epic, adventurous, and culturally rich.',
    approxWordCount: 3000,
    coverImagePrompt: 'A young Chinese woman in beautiful silk robes and a young European man in traveler\'s clothes are looking at a map together in a bustling Silk Road marketplace. The style is a vibrant, detailed historical painting. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 63
  {
    titleIdea: 'The Billionaire\'s Island',
    subgenre: 'billionaire',
    characterNames: ['Eva', 'Sebastian'],
    mainCharacters: 'A reality TV producer who thinks she\'s creating a survival show, and the eccentric billionaire who has secretly designed the show to find him the perfect wife.',
    plotSynopsis: 'Eva is producing "Survival Island," a show where contestants compete for a million dollars. She doesn\'t know that the show\'s mysterious creator, Sebastian, is also a contestant in disguise, using the challenges to test the character of the female contestants. He finds himself drawn to Eva, the one person who isn\'t playing the game. When a real storm hits the island, their fake reality show becomes a real survival situation, and their love becomes the ultimate prize.',
    keyTropes: ['billionaire', 'secret-identity', 'reality-tv', 'forced-proximity'],
    desiredTone: 'Funny, adventurous, and surprisingly romantic.',
    approxWordCount: 2700,
    coverImagePrompt: 'A woman with a clipboard and headset looks exasperatedly at a handsome man who is failing spectacularly at building a shelter on a tropical beach. The style is a bright, humorous digital illustration. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 64
  {
    titleIdea: 'The Memory of a Melody',
    subgenre: 'second-chance',
    characterNames: ['Clara', 'Lucas'],
    mainCharacters: 'A classical pianist who lost her memory in an accident, and her husband, who she now doesn\'t recognize, trying to win her back.',
    plotSynopsis: 'Clara wakes up with no memory of the last ten years, including her marriage to Lucas. To her, he is a stranger. He patiently tries to help her remember, re-creating their first date, playing her their favorite songs. She finds herself falling for this kind, handsome man, but is it a new love or an echo of the old one? A forgotten diary entry reveals a secret from their past that could either tear them apart forever or be the key to unlocking her memories.',
    keyTropes: ['second-chance', 'amnesia', 'healing-journey', 'emotional'],
    desiredTone: 'Heartbreaking, tender, and deeply romantic.',
    approxWordCount: 2600,
    coverImagePrompt: 'A man sits at a piano, looking lovingly at a woman who is watching him with a confused but gentle expression. The room is filled with soft, warm light. A realistic, emotional digital painting. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 65
  {
    titleIdea: 'The Glassblower\'s Heart',
    subgenre: 'contemporary',
    characterNames: ['Paloma', 'Dante'],
    mainCharacters: 'A fiery, temperamental glassblower in Murano, Venice, and the calm, methodical American architect who commissions her for a massive, "impossible" chandelier for a new hotel.',
    plotSynopsis: 'Paloma is an artist, not a contractor. Dante\'s precise plans and corporate deadlines clash with her creative process. Their arguments in the heat of the forge are as intense as their attraction. As they work together, he learns to appreciate the beauty of imperfection, and she discovers the strength in structure. They must combine their skills to create a masterpiece, forging a love as delicate and strong as glass.',
    keyTropes: ['opposites-attract', 'artistic-collaboration', 'workplace-romance', 'cultural-clash'],
    desiredTone: 'Passionate, vibrant, and artistic.',
    approxWordCount: 2500,
    coverImagePrompt: 'In a glowing hot glassblowing studio, a woman with protective gear shapes a piece of molten glass. A man in a sharp suit watches her, mesmerized. The canals of Venice are visible through a large window. A vibrant, painterly digital illustration with a focus on light and color. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 66
  {
    titleIdea: 'The Pirate\'s Prize',
    subgenre: 'historical',
    characterNames: ['Lady Annelise', 'Captain "Hawk"'],
    mainCharacters: 'A spirited English noblewoman who stows away on a ship to escape an arranged marriage, and the notorious pirate captain who captures the vessel.',
    plotSynopsis: 'Annelise is more than just a prize to be ransomed for Captain Hawk. Her sharp wit and courage impress him. She sees beyond his fearsome reputation to the honorable man he once was. As they sail the high seas, dodging the Royal Navy, she becomes an indispensable member of his crew. Their love is a rebellion against both their worlds, and they must fight for a future where they can be free together.',
    keyTropes: ['historical-romance', 'enemies-to-lovers', 'pirates', 'adventure'],
    desiredTone: 'Swashbuckling, adventurous, and passionate.',
    approxWordCount: 2800,
    coverImagePrompt: 'A handsome pirate captain stands at the helm of his ship, looking down with a smirk at a beautiful woman in a tattered noblewoman\'s dress who is defiantly meeting his gaze. A storm brews on the horizon. A dramatic, cinematic digital painting. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 67
  {
    titleIdea: 'The Shifter\'s Sanctuary',
    subgenre: 'paranormal',
    characterNames: ['Dr. Lena Petrova', 'Rafe'],
    mainCharacters: 'A dedicated wildlife biologist tracking a mysterious, unclassified wolf species in the remote Siberian wilderness, and the alpha of the werewolf pack she is unknowingly studying.',
    plotSynopsis: 'Lena is baffled by the wolves\' intelligence and unusual behavior. Rafe, the pack\'s alpha, is intrigued by her persistence and respect for the wilderness. He reveals himself to her to save her from a rival pack, forcing her to accept that the supernatural is real. Their love story unfolds against the backdrop of a harsh but beautiful landscape, as they must unite her scientific knowledge and his pack\'s strength to protect their home from human encroachment.',
    keyTropes: ['paranormal-romance', 'werewolves', 'fated-mates', 'nature-setting'],
    desiredTone: 'Wild, primal, and deeply romantic.',
    approxWordCount: 2700,
    coverImagePrompt: 'A woman in winter gear sits by a fire, looking at a large, magnificent wolf that is sitting calmly beside her. The vast, snowy Siberian forest surrounds them. A realistic, atmospheric fantasy painting. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 68
  {
    titleIdea: 'The Billionaire\'s Fake Girlfriend',
    subgenre: 'billionaire',
    characterNames: ['Mia', 'Nathan'],
    mainCharacters: 'A struggling actress who is hired to play the role of a billionaire\'s girlfriend to make his ex jealous, and the heartbroken billionaire who finds himself falling for his leading lady.',
    plotSynopsis: 'Nathan is desperate to win back his ex. He hires Mia to be his perfect, adoring girlfriend at a series of high-society events. Mia, a trained actress, plays the part perfectly. Too perfectly. Their staged kisses and fake intimacy start to feel real, confusing them both. When his ex decides she wants him back, Nathan and Mia must confront their true feelings and decide if their love is just an act or the real thing.',
    keyTropes: ['fake-relationship', 'billionaire', 'second-chance-for-one', 'jealousy-plot'],
    desiredTone: 'Glamorous, fun, and emotionally complicated.',
    approxWordCount: 2400,
    coverImagePrompt: 'At a lavish party, a man in a tuxedo dips a woman in a red dress in a dramatic dance move. They are looking into each other\'s eyes. Another woman watches from the background with a jealous expression. A sleek, modern digital illustration. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 69
  {
    titleIdea: 'The Letter from a Past Love',
    subgenre: 'second-chance',
    characterNames: ['Sophie', 'Liam'],
    mainCharacters: 'A woman who, on the eve of her wedding, receives a letter she wrote to herself ten years ago, reminding her of her first love, and the man she left behind who is now back in town.',
    plotSynopsis: 'The letter is full of youthful dreams and a pact to meet Liam at their special spot if they were ever unhappy. Sophie is content, but not thrillingly happy, with her fiancé. Curiosity gets the better of her, and she goes to the spot, only to find Liam there. He\'s a successful architect, and the old connection is instant. She must spend the week before her wedding confronting the past and deciding which vision of her future is the one she truly wants.',
    keyTropes: ['second-chance', 'love-triangle', 'hometown-romance', 'what-if'],
    desiredTone: 'Nostalgic, romantic, and emotionally charged.',
    approxWordCount: 2500,
    coverImagePrompt: 'A woman in a simple dress stands under a large oak tree, holding a letter. A handsome man is walking towards her. The sun is setting, casting a golden glow. A soft, romantic digital painting. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 70
  {
    titleIdea: 'The Barista and the Bestseller',
    subgenre: 'contemporary',
    characterNames: ['Holly', 'Mark'],
    mainCharacters: 'A cheerful barista who writes fantasy novels in her spare time, and the grumpy, bestselling thriller author who becomes a regular at her coffee shop while suffering from writer\'s block.',
    plotSynopsis: 'Mark is a creature of habit, ordering the same black coffee every day. Holly starts adding little latte art designs to his cup, trying to make him smile. He is annoyed at first, then intrigued. He starts talking to her, and her infectious optimism helps him break through his writer\'s block. He reads her manuscript and is blown away. He must help her get published while navigating his own growing feelings for the woman who brought the magic back into his life.',
    keyTropes: ['grumpy-sunshine', 'opposites-attract', 'creative-collaboration', 'slow-burn'],
    desiredTone: 'Cozy, charming, and inspiring.',
    approxWordCount: 2300,
    coverImagePrompt: 'In a cozy coffee shop, a woman with a bright smile slides a cup of coffee with a perfect latte art heart across the counter to a grumpy but handsome man who is typing on a laptop. A warm, inviting illustration. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 71
  {
    titleIdea: 'The Viking\'s Captive',
    subgenre: 'historical',
    characterNames: ['Brenna', 'Magnus'],
    mainCharacters: 'A fiery Celtic healer whose village is raided by Vikings, and the powerful Viking Jarl who takes her captive as a prize.',
    plotSynopsis: 'Brenna refuses to be a meek captive, using her healing skills to tend to the wounded and earn the respect of the Viking crew. Magnus, the Jarl, has never met a woman like her. He is drawn to her spirit and intelligence. She sees the leader beneath the barbarian. When they reach his home, she must navigate the treacherous politics of the Viking court, all while her captor becomes her unlikely protector and lover.',
    keyTropes: ['historical-romance', 'enemies-to-lovers', 'vikings', 'captive-romance'],
    desiredTone: 'Epic, primal, and passionate.',
    approxWordCount: 2900,
    coverImagePrompt: 'A powerful Viking warrior stands on the deck of a longship, looking down at a woman with fiery red hair who is defiantly meeting his gaze. The sea is stormy behind them. A dramatic, realistic fantasy painting. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 72
  {
    titleIdea: 'The Ghost of the Opera',
    subgenre: 'paranormal',
    characterNames: ['Christine', 'The Phantom'],
    mainCharacters: 'A talented young chorus girl in a modern-day opera house, and the ghost of a tormented musical genius who haunts the theater and decides to make her his protégée.',
    plotSynopsis: 'Christine\'s voice is beautiful but lacks confidence. The Phantom communicates with her, teaching her from the shadows, his voice a disembodied whisper in her dressing room. He propels her to stardom but his obsession with her grows. He is not a monster, but a spirit trapped by a past tragedy. She is the only one who can see him and must unravel the mystery of his death to set him free, all while falling in love with her ghostly tutor.',
    keyTropes: ['paranormal-romance', 'haunting', 'music-theme', 'doomed-love'],
    desiredTone: 'Gothic, tragic, and intensely romantic.',
    approxWordCount: 2800,
    coverImagePrompt: 'On the grand stage of an opera house, a young woman sings, her eyes closed. The ghostly, translucent figure of a man in a mask stands behind her, as if guiding her. A dark, atmospheric digital painting. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 73
  {
    titleIdea: 'The Billionaire\'s Inheritance',
    subgenre: 'billionaire',
    characterNames: ['Julia', 'Griffin'],
    mainCharacters: 'A struggling bookstore owner who unexpectedly inherits half of a billion-dollar publishing empire, and the infuriatingly handsome CEO—the other heir—who wants her out.',
    plotSynopsis: 'Julia is shocked to learn her estranged grandfather was a publishing magnate. Her co-heir, Griffin, sees her as an obstacle. The will stipulates they must work together as co-CEOs for six months. Their business styles clash spectacularly. She wants to nurture new authors; he only cares about the bottom line. Their boardroom battles are legendary, but their chemistry is undeniable. They must find a middle ground to save the company and their own hearts.',
    keyTropes: ['billionaire', 'enemies-to-lovers', 'workplace-romance', 'opposites-attract'],
    desiredTone: 'Witty, sophisticated, and sexy.',
    approxWordCount: 2600,
    coverImagePrompt: 'A woman in a cozy sweater and a man in a sharp suit are on opposite sides of a large boardroom table, glaring at each other. The New York City skyline is visible behind them. A sleek, modern digital illustration. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 74
  {
    titleIdea: 'The Summer I Found You',
    subgenre: 'second-chance',
    characterNames: ['Hannah', 'Josh'],
    mainCharacters: 'A woman who returns to the lake resort where she spent her childhood summers to get it ready for sale, and her childhood summer-romance who is now the resort\'s handsome caretaker.',
    plotSynopsis: 'Hannah has a month to fix up the rundown resort. She hires Josh, the boy who broke her heart the last summer they were together. Working side-by-side, painting cabins and fixing docks, they are flooded with memories of their past. The old feelings resurface, stronger than ever. But he never left their small town, and she is destined for the big city. They must decide if their love was just a summer fling or something that can last a lifetime.',
    keyTropes: ['second-chance', 'hometown-romance', 'childhood-sweethearts', 'nostalgia'],
    desiredTone: 'Sweet, nostalgic, and heartwarming.',
    approxWordCount: 2400,
    coverImagePrompt: 'A man and a woman are laughing as they sit on a wooden dock by a beautiful lake, their feet in the water. The sun is setting behind them. A warm, golden-hour photograph style. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 75
  {
    titleIdea: 'The Botanist and the Beast',
    subgenre: 'contemporary',
    characterNames: ['Isla', 'Alistair'],
    mainCharacters: 'A cheerful botanist who specializes in reviving dying plants, and the grumpy, reclusive owner of a decaying Scottish estate with a legendary, neglected garden.',
    plotSynopsis: 'Isla is hired to restore the gardens of Blackwood Manor. Her client, Alistair, is a folklore expert who is as thorny as the overgrown roses. He believes the garden is cursed. She believes it just needs care. As she brings the garden back to life, she also coaxes him out of his shell, discovering a kind heart beneath his gruff exterior. Their love blooms along with the flowers, but the legend of the curse may be more real than either of them thought.',
    keyTropes: ['grumpy-sunshine', 'beauty-and-the-beast', 'healing-journey', 'gothic-undertones'],
    desiredTone: 'Atmospheric, charming, and romantic.',
    approxWordCount: 2600,
    coverImagePrompt: 'A woman with a bright smile tends to a rose bush in a wild, overgrown garden. A grumpy but handsome man watches her from the doorway of a gloomy-looking Scottish castle. The style is a beautiful, painterly digital illustration. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 76
  {
    titleIdea: 'The Spy Who Loved Me',
    subgenre: 'historical',
    characterNames: ['Elizabeth', 'Lord Harrington'],
    mainCharacters: 'A clever lady\'s companion in Regency England who is secretly a spy for the Crown, and the rakish, charming lord she is assigned to investigate.',
    plotSynopsis: 'Elizabeth believes Lord Harrington is a traitor selling secrets to the French. She gets a position in his household to find proof. He is captivated by her wit and intelligence, unlike any woman he has ever met. She finds herself drawn to his unexpected kindness and honor. As she gets closer to the truth, she realizes he is being framed. They must join forces to unmask the real traitor, their dangerous game of deception turning into a very real love affair.',
    keyTropes: ['historical-romance', 'espionage', 'regency-era', 'enemies-to-lovers'],
    desiredTone: 'Witty, suspenseful, and glamorous.',
    approxWordCount: 2700,
    coverImagePrompt: 'At a grand Regency ball, a woman in a beautiful gown and a handsome man in a tailcoat are dancing. They are whispering to each other, their expressions intense. A classic, elegant oil painting style. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 77
  {
    titleIdea: 'The Soulmate Equation',
    subgenre: 'paranormal',
    characterNames: ['Dr. Chloe Davis', 'Subject 89'],
    mainCharacters: 'A geneticist who has developed a test to identify soulmates, and the charming, infuriating test subject who is a perfect match for her but seems to be her polar opposite.',
    plotSynopsis: 'Chloe\'s company is about to go public. The algorithm is perfect. Until Subject 89, a laid-back musician named Leo, matches with her, a logical workaholic. She\'s convinced it\'s a glitch. He\'s convinced it\'s fate. As they are forced to spend time together for a PR campaign, their undeniable chemistry challenges her belief in her own science. But they soon discover his DNA holds a secret that explains their impossible connection, a secret a rival company would kill for.',
    keyTropes: ['paranormal-romance', 'fated-mates', 'opposites-attract', 'science-vs-magic'],
    desiredTone: 'Smart, funny, and surprisingly romantic.',
    approxWordCount: 2500,
    coverImagePrompt: 'A woman in a lab coat looks exasperatedly at a DNA helix on a screen. A handsome man with a guitar is leaning on her desk, smiling mischievously. A clean, modern graphic illustration. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 78
  {
    titleIdea: 'The Billionaire\'s Bet',
    subgenre: 'billionaire',
    characterNames: ['Sophie', 'Cole'],
    mainCharacters: 'A principled journalist who writes scathing articles about the super-rich, and the cocky billionaire who makes a bet that he can charm her in a month.',
    plotSynopsis: 'After a particularly harsh article, Cole confronts Sophie. He bets her that if she spends a month with him, she\'ll see that he\'s not the monster she thinks he is. If she wins, he\'ll donate millions to her charity of choice. If he wins, she has to write a retraction. She agrees, planning to expose him. But his world of philanthropy, innovation, and surprising vulnerability complicates her mission. The bet becomes a battle of wills, with their hearts on the line.',
    keyTropes: ['billionaire', 'enemies-to-lovers', 'opposites-attract', 'witty-banter'],
    desiredTone: 'Sassy, fun, and glamorous.',
    approxWordCount: 2600,
    coverImagePrompt: 'A woman with a notepad and a skeptical expression interviews a handsome man in an expensive suit who is leaning back in his chair with a confident smirk. They are in a stunning penthouse office. A sleek, photographic style. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 79
  {
    titleIdea: 'The Bridge to Us',
    subgenre: 'second-chance',
    characterNames: ['Abby', 'Tom'],
    mainCharacters: 'A structural engineer who returns to her small hometown to oversee the demolition of an old bridge, and her high school sweetheart, the local historian leading the fight to save it.',
    plotSynopsis: 'Abby sees the bridge as a structurally unsound relic. Tom sees it as the heart of their town\'s history. Their professional conflict is complicated by their unresolved romantic past. As they are forced to work together to assess the bridge, they unearth a time capsule hidden in its foundation, containing love letters from a century ago. The letters mirror their own story, forcing them to confront their past and build a new bridge back to each other.',
    keyTropes: ['second-chance', 'enemies-to-lovers', 'hometown-romance', 'small-town'],
    desiredTone: 'Emotional, nostalgic, and heartwarming.',
    approxWordCount: 2500,
    coverImagePrompt: 'A man and a woman stand on an old, beautiful stone bridge, on opposite sides, looking at each other. The sun is setting behind them. A warm, painterly digital illustration. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 80
  {
    titleIdea: 'The Language of Cranes',
    subgenre: 'contemporary',
    characterNames: ['George', 'June'],
    mainCharacters: 'A grumpy, elderly widower who has decided to sell his house, and the cheerful, persistent real estate agent who is also a passionate ornithologist.',
    plotSynopsis: 'George just wants to be left alone. June is determined to sell his house, but she\'s more interested in the rare cranes that nest in his backyard. Her infectious enthusiasm for the birds slowly breaks down his walls. He starts to share stories of his late wife, who also loved the cranes. June helps him see that selling the house isn\'t an ending, but a new beginning. A gentle, unexpected love story blooms in the autumn of their lives.',
    keyTropes: ['later-in-life-romance', 'grumpy-sunshine', 'healing-journey', 'nature-theme'],
    desiredTone: 'Gentle, heartwarming, and poignant.',
    approxWordCount: 2200,
    coverImagePrompt: 'An elderly man with a grumpy expression and a younger woman with a bright smile are looking through binoculars in a beautiful garden. A pair of elegant cranes is visible in the background. A soft, charming watercolor style. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 81
  {
    titleIdea: 'The Highlander\'s Promise',
    subgenre: 'historical',
    characterNames: ['Isla', 'Angus'],
    mainCharacters: 'A young woman from a small clan in 18th-century Scotland, and the formidable, battle-scarred laird of a rival clan to whom she is promised in marriage to secure peace.',
    plotSynopsis: 'Isla fears her new husband, a man known for his fierce temper. Angus, laird of clan MacLeod, sees their marriage as a political necessity, nothing more. But Isla\'s quiet strength and intelligence challenge his expectations. She sees the honorable leader beneath his hardened exterior. As they navigate the treacherous politics of the Highlands and the threat of English redcoats, their arranged marriage blossoms into a powerful, passionate love that could unite their clans forever.',
    keyTropes: ['historical-romance', 'arranged-marriage', 'highlanders', 'enemies-to-lovers'],
    desiredTone: 'Epic, rugged, and intensely passionate.',
    approxWordCount: 2900,
    coverImagePrompt: 'A powerful Scottish laird in a kilt stands on a misty Highland cliff, a beautiful woman in a simple gown at his side. They are looking out at the rugged landscape. A dramatic, painterly fantasy style. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 82
  {
    titleIdea: 'The Somnambulist\'s Secret',
    subgenre: 'paranormal',
    characterNames: ['Dr. Robert Maxwell', 'Lucia'],
    mainCharacters: 'A rational psychologist in Victorian London specializing in sleep disorders, and the beautiful, enigmatic patient who sleepwalks and creates stunningly detailed drawings of a city that doesn\'t exist.',
    plotSynopsis: 'Dr. Maxwell is determined to find the root of Lucia\'s "hysteria." He believes it\'s a manifestation of trauma. But her drawings become more detailed, showing a magical, parallel version of London. He finds himself drawn into her nocturnal world, his scientific beliefs challenged by the impossible evidence. He discovers she is not dreaming, but crossing over into another realm, and a powerful entity from that realm wants to keep her there. He must enter her dream world to bring her back, risking his sanity for the woman he has come to love.',
    keyTropes: ['paranormal-romance', 'victorian-gothic', 'mystery', 'parallel-world'],
    desiredTone: 'Mysterious, atmospheric, and romantic.',
    approxWordCount: 2800,
    coverImagePrompt: 'In a dimly lit Victorian study, a man looks at a detailed, fantastical drawing held by a woman in a white nightgown. Her eyes are closed as if she is asleep. A moody, atmospheric digital painting with a touch of the fantastical. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 83
  {
    titleIdea: 'The Billionaire\'s Last Chance',
    subgenre: 'billionaire',
    characterNames: ['Ella', 'Gabriel'],
    mainCharacters: 'A cheerful nursing home aide, and the cynical, workaholic billionaire who is forced to do community service at her facility after a reckless driving incident.',
    plotSynopsis: 'Gabriel is furious about his sentence, seeing it as a waste of time. He clashes with Ella, whose sunny disposition he finds infuriating. She is not impressed by his wealth or power. She challenges him to connect with the residents, and through their stories, he begins to re-evaluate his own life. Ella shows him a world of compassion and connection he never knew. He finds himself falling for the woman who sees the man, not the money, but his old life and a corporate crisis threaten to pull him away.',
    keyTropes: ['billionaire', 'opposites-attract', 'redemption-arc', 'forced-proximity'],
    desiredTone: 'Heartwarming, funny, and emotional.',
    approxWordCount: 2500,
    coverImagePrompt: 'A woman in scrubs laughs as a handsome man in an expensive suit awkwardly tries to play checkers with an elderly resident in a bright, cheerful nursing home. A bright, charming digital illustration. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 84
  {
    titleIdea: 'The Vineyard at the End of the World',
    subgenre: 'second-chance',
    characterNames: ['Sofia', 'Miguel'],
    mainCharacters: 'A world-renowned winemaker who returns to her family\'s struggling vineyard in Chile after a devastating earthquake, and her ex-fiancé who she left to pursue her career.',
    plotSynopsis: 'The earthquake has shattered Sofia\'s family vineyard and her confidence. Miguel, now the leader of the local wine cooperative, is the only one who can help her rebuild. The work is hard, and old wounds are reopened. They are forced to confront the reasons she left and the love they both tried to forget. Amidst the broken barrels and uprooted vines, they must work together to save the harvest and see if their love can be replanted and bloom again.',
    keyTropes: ['second-chance', 'hometown-romance', 'foodie-romance', 'rebuilding'],
    desiredTone: 'Dramatic, emotional, and hopeful.',
    approxWordCount: 2700,
    coverImagePrompt: 'A man and a woman stand in a damaged but beautiful vineyard, looking at the Andes mountains in the distance. The sun is rising, symbolizing a new beginning. A warm, painterly digital illustration with a focus on the landscape. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 85
  {
    titleIdea: 'The Puzzle Maker\'s Dilemma',
    subgenre: 'contemporary',
    characterNames: ['Penny', 'Simon'],
    mainCharacters: 'A quirky, brilliant puzzle maker who designs escape rooms, and the logical, by-the-book corporate consultant hired to streamline her chaotic business.',
    plotSynopsis: 'Penny\'s escape rooms are creative marvels but financially failing. Simon is hired to make her business profitable, which means cutting her most elaborate (and expensive) designs. They clash instantly. He thinks she\'s impractical; she thinks he\'s a robot. To prove the value of her work, she challenges him to solve her newest, "unsolvable" room. As he works through her puzzles, he begins to understand her brilliant mind, and their intellectual battle turns into a surprising romance.',
    keyTropes: ['opposites-attract', 'enemies-to-lovers', 'workplace-romance', 'witty-banter'],
    desiredTone: 'Smart, funny, and unique.',
    approxWordCount: 2400,
    coverImagePrompt: 'A woman with a mischievous grin watches on a monitor as a handsome man in a suit looks frustrated and intrigued inside a fantastical-looking escape room. A modern, graphic illustration style. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 86
  {
    titleIdea: 'The Highwayman\'s Hostage',
    subgenre: 'historical',
    characterNames: ['Lady Seraphina', 'The Black Fox'],
    mainCharacters: 'A spirited, intelligent lady traveling to London for her society debut, and the dashing, notorious highwayman who robs her carriage.',
    plotSynopsis: 'Instead of just taking her jewels, the Black Fox kidnaps Seraphina, needing her as a hostage to negotiate the release of one of his men. She is terrified but also intrigued by the charming rogue who is more of a gentleman than any of her London suitors. He is surprised by her courage and lack of judgment. Their forced proximity in his secret forest hideout leads to a passionate connection, but the law is closing in, and their time is running out.',
    keyTropes: ['historical-romance', 'captive-romance', 'robin-hood-figure', 'adventure'],
    desiredTone: 'Swashbuckling, romantic, and thrilling.',
    approxWordCount: 2700,
    coverImagePrompt: 'In a forest clearing at night, a handsome highwayman in a mask offers a hand to a beautiful lady to help her down from his horse. A campfire glows nearby. A classic, romantic oil painting style. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 87
  {
    titleIdea: 'The Fae King\'s Bargain',
    subgenre: 'paranormal',
    characterNames: ['Isabelle', 'King Oberon'],
    mainCharacters: 'A struggling artist who unknowingly wanders into the Fae realm, and the ancient, powerful Fae king who is captivated by her mortality.',
    plotSynopsis: 'Isabelle gets lost in the woods and stumbles through a portal into the timeless, magical realm of the Fae. To earn her passage home, King Oberon makes a bargain with her: she must paint his portrait, a task no mortal has ever accomplished as Fae magic blurs their features. As she struggles to capture his ever-changing face, she sees the loneliness in the immortal king. He is fascinated by her passion and her fleeting life. Their love is a dangerous bargain that could trap her in his world forever.',
    keyTropes: ['paranormal-romance', 'fae', 'fantasy-world', 'forbidden-love'],
    desiredTone: 'Enchanting, magical, and ethereal.',
    approxWordCount: 2900,
    coverImagePrompt: 'A woman with a paintbrush looks at a handsome, ethereal king with pointed ears who sits on a throne made of twisted branches and glowing moss. They are in a magical, otherworldly forest. A beautiful, detailed fantasy illustration. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 88
  {
    titleIdea: 'The Billionaire\'s Nanny',
    subgenre: 'billionaire',
    characterNames: ['Sophie', 'Aidan'],
    mainCharacters: 'A warm, down-to-earth nanny, and the cold, widowed billionaire workaholic who hires her to care for his two grieving children.',
    plotSynopsis: 'Aidan\'s children are acting out, and he doesn\'t know how to connect with them. Sophie brings warmth and laughter back into their sterile mansion. She teaches Aidan how to be a father again, and her compassion melts his icy exterior. A deep love grows between them, but his late wife\'s formidable mother disapproves of their relationship and will do anything to tear them apart.',
    keyTropes: ['billionaire', 'nanny-romance', 'opposites-attract', 'healing-journey'],
    desiredTone: 'Heartwarming, emotional, and uplifting.',
    approxWordCount: 2500,
    coverImagePrompt: 'A handsome man in a suit looks on with a soft smile as a woman sits on the floor, laughing with two small children in a beautiful, modern living room. A warm, realistic digital painting. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 89
  {
    titleIdea: 'The Cafe at the Edge of Memory',
    subgenre: 'second-chance',
    characterNames: ['Eva', 'Julian'],
    mainCharacters: 'A woman who runs a small cafe in Paris, and the man who walks in one day—her former lover from a past life, though only he remembers.',
    plotSynopsis: 'Julian has been reincarnated for centuries, always finding Eva, but she never remembers their shared past. This time, he is determined to make her remember. He becomes a regular at her cafe, slowly rebuilding their connection, sharing stories that seem vaguely familiar to her. She finds herself drawn to this mysterious, soulful man. But a rival from their past has also been reincarnated and is determined to keep them apart, this life and every other.',
    keyTropes: ['second-chance', 'reincarnation', 'fated-mates', 'paranormal-undertones'],
    desiredTone: 'Mysterious, romantic, and epic.',
    approxWordCount: 2700,
    coverImagePrompt: 'In a charming Parisian cafe, a man looks intently at a woman who is handing him a cup of coffee, a flicker of recognition and confusion in her eyes. The style is a soft, romantic digital painting with a timeless feel. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 90
  {
    titleIdea: 'The Synchronicity of Sound',
    subgenre: 'contemporary',
    characterNames: ['Nora', 'David'],
    mainCharacters: 'A foley artist who creates sound effects for movies, and an anxious, noise-sensitive accountant who moves into the apartment next door.',
    plotSynopsis: 'Nora\'s job involves making strange noises at all hours—crushing cabbages for fight scenes, flapping gloves for bat wings. David is driven mad by the sounds coming through the wall. His complaints lead to an ongoing, hilarious feud. To make peace, she invites him to her studio to show him what she does. He is fascinated by her creative world, and she is charmed by his quiet order. Their opposite worlds collide, creating a romance as unique as the sounds she makes.',
    keyTropes: ['opposites-attract', 'neighbors', 'comedy', 'unique-professions'],
    desiredTone: 'Quirky, charming, and funny.',
    approxWordCount: 2300,
    coverImagePrompt: 'A woman is gleefully smashing a watermelon with a hammer in a sound studio, while a man in a business shirt watches from the doorway with a look of utter bewilderment and amusement. A bright, cartoonish digital illustration. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 91
  {
    titleIdea: 'The Outlaw and the Heiress',
    subgenre: 'historical',
    characterNames: ['Cassidy', 'Miss Evangeline'],
    mainCharacters: 'A notorious train robber in the Old West, and the wealthy, prim heiress from the East Coast whose train he robs.',
    plotSynopsis: 'Cassidy doesn\'t expect the fight Evangeline puts up. Intrigued, he kidnaps her instead of her jewels, taking her to his remote hideout. She is horrified by his criminal life but surprised by his intelligence and code of honor. He is thrown off by her resilience and sharp mind. As the law closes in, they must rely on each other to survive, their animosity turning into a dangerous, passionate love.',
    keyTropes: ['historical-romance', 'enemies-to-lovers', 'old-west', 'captive-romance'],
    desiredTone: 'Adventurous, rugged, and passionate.',
    approxWordCount: 2800,
    coverImagePrompt: 'A rugged cowboy stands with a smoking pistol, a beautiful woman in a fancy dress behind him, in front of a stopped train in a desert landscape. A dramatic, cinematic painting in the style of classic Western movie posters. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 92
  {
    titleIdea: 'The Vampire\'s Archivist',
    subgenre: 'paranormal',
    characterNames: ['Eleonora', 'Darius'],
    mainCharacters: 'A meticulous PhD student hired to archive the library of a mysterious, reclusive European nobleman, and the ancient vampire who has been waiting centuries for someone to record his story.',
    plotSynopsis: 'Eleonora is thrilled to get access to the legendary library of Darius. He is a charming but melancholic host. As she works, she uncovers diaries and letters that are centuries old, realizing her employer is an immortal. He wants her to write his biography, to be the one person who knows his truth. Their late-night sessions are filled with history, tragedy, and a growing, forbidden love. But his ancient enemies have not forgotten him, and they see Eleonora as a weakness.',
    keyTropes: ['paranormal-romance', 'vampires', 'forbidden-love', 'gothic'],
    desiredTone: 'Dark, elegant, and tragic.',
    approxWordCount: 2900,
    coverImagePrompt: 'In a vast, shadowy gothic library, a woman sits at a desk, looking up at a handsome, pale man who is leaning over her, his hand near hers. A fireplace casts a warm glow. A rich, dark oil painting style. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 93
  {
    titleIdea: 'The Billionaire\'s Butler',
    subgenre: 'billionaire',
    characterNames: ['Anna', 'Mr. Blackwood'],
    mainCharacters: 'A resourceful young woman who takes a job as a butler in a modern-day mansion, and the grumpy, enigmatic young billionaire who just inherited it.',
    plotSynopsis: 'Anna is a professional, but her new boss, Mr. Blackwood, is a challenge. He is moody, demanding, and clearly hiding a deep pain. She is determined to break through his shell, organizing his chaotic life with a cheerful efficiency that he finds both infuriating and intriguing. She uncovers the family secrets that haunt him and shows him how to live again. Their professional relationship lines blur, leading to a forbidden romance that could cost her the job and him his heart.',
    keyTropes: ['billionaire', 'workplace-romance', 'grumpy-sunshine', 'forbidden-love'],
    desiredTone: 'Emotional, charming, and heartwarming.',
    approxWordCount: 2500,
    coverImagePrompt: 'A woman in a smart butler\'s uniform offers a cup of tea to a handsome, grumpy-looking man in a luxurious, modern library. He is looking at her with a hint of a smile. A sleek, modern digital painting. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 94
  {
    titleIdea: 'The Lighthouse Keeper\'s Daughter',
    subgenre: 'second-chance',
    characterNames: ['Maria', 'Daniel'],
    mainCharacters: 'A woman who returns to the remote Scottish island where she grew up to take over the lighthouse from her ailing father, and the man she left behind, now the island\'s only doctor.',
    plotSynopsis: 'Maria thought she had escaped her isolated childhood. Now she\'s back, surrounded by memories and the man whose heart she broke. Daniel is resentful but can\'t deny the pull that still exists between them. When a powerful storm cuts the island off from the mainland, they are forced to work together to care for the small community. In the shadow of the lighthouse, they confront their past and must decide if their love is strong enough to weather any storm.',
    keyTropes: ['second-chance', 'hometown-romance', 'forced-proximity', 'healing-journey'],
    desiredTone: 'Atmospheric, emotional, and windswept.',
    approxWordCount: 2600,
    coverImagePrompt: 'A man and a woman stand at the top of a lighthouse, a stormy sea crashing against the rocks below. They are looking at each other, the wind whipping their hair. A dramatic, painterly digital illustration. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 95
  {
    titleIdea: 'The Florist and the Financier',
    subgenre: 'contemporary',
    characterNames: ['Poppy', 'Harrison'],
    mainCharacters: 'A whimsical florist who owns a charming, slightly chaotic flower shop, and the cold, ruthless financier whose office is next door and is allergic to pollen.',
    plotSynopsis: 'Harrison is a man of numbers and order. Poppy\'s shop is an explosion of color, scent, and chaos that drives him crazy. Their feud over her "airborne botanical particulates" is legendary. To broker peace, she designs a hypoallergenic arrangement for his office. He is surprised by her artistry and thoughtfulness. A slow-burn romance begins to bloom, as he learns to embrace chaos and she learns that love can be found in the most unexpected places.',
    keyTropes: ['opposites-attract', 'enemies-to-lovers', 'slow-burn', 'comedy'],
    desiredTone: 'Charming, witty, and sweet.',
    approxWordCount: 2400,
    coverImagePrompt: 'A woman with a bright smile offers a single, perfect flower to a stern man in a suit who is trying not to sneeze. They are standing between her colorful flower shop and his sleek, minimalist office lobby. A bright, humorous digital illustration. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 96
  {
    titleIdea: 'The Desert Prince\'s Bride',
    subgenre: 'historical',
    characterNames: ['Lady Isabella', 'Sheikh Tariq'],
    mainCharacters: 'An adventurous English botanist traveling through the Arabian desert in the 19th century, and the powerful, enigmatic Sheikh who must take her as a political hostage.',
    plotSynopsis: 'Isabella\'s caravan is "detained" by Sheikh Tariq\'s men to send a message to the British Empire. She is not a docile hostage. Her knowledge of plants is invaluable in the harsh desert environment, and she quickly earns the respect of his people. Tariq is captivated by her spirit and intelligence. Their relationship evolves from captor and captive to one of mutual admiration and fiery passion. But the political machinations that brought them together threaten to tear them apart.',
    keyTropes: ['historical-romance', 'captive-romance', 'forbidden-love', 'desert-setting'],
    desiredTone: 'Epic, exotic, and passionate.',
    approxWordCount: 2900,
    coverImagePrompt: 'A handsome Sheikh in white robes leads a horse carrying a beautiful English woman in Victorian traveling attire through a vast sand dune landscape. The sun is setting behind them. A romantic, cinematic oil painting. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 97
  {
    titleIdea: 'The House on Haunted Hill',
    subgenre: 'paranormal',
    characterNames: ['Paige', 'Ben'],
    mainCharacters: 'A cheerful, optimistic home renovator who buys a famously haunted house on a bet, and the grumpy, skeptical local historian who is determined to prove she\'s a fraud.',
    plotSynopsis: 'Paige hosts a popular home renovation web series. For a Halloween special, she buys the Blackwood House. Ben, who has spent his life debunking the house\'s legends, is her biggest critic. As she renovates, strange things happen—objects move, whispers are heard. Ben investigates, trying to find rational explanations, but finds himself drawn to Paige\'s infectious spirit. They discover the house isn\'t haunted by a monster, but by a lonely ghost who needs their help to move on, a task that brings the two of them together.',
    keyTropes: ['haunting', 'grumpy-sunshine', 'enemies-to-lovers', 'mystery'],
    desiredTone: 'Spooky, funny, and heartwarming.',
    approxWordCount: 2500,
    coverImagePrompt: 'A woman in overalls and a tool belt smiles cheerfully on the porch of a spooky-looking Victorian house. A grumpy man stands with his arms crossed on the lawn below. A friendly, cartoonish ghost peeks out from a top-floor window. A fun, bright digital illustration. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 98
  {
    titleIdea: 'The Billionaire\'s Matchmaker',
    subgenre: 'billionaire',
    characterNames: ['Priya', 'Alexander'],
    mainCharacters: 'A high-end, exclusive matchmaker, and the one client she can\'t seem to match: a handsome, charming, and utterly unmatchable billionaire who keeps rejecting every perfect candidate.',
    plotSynopsis: 'Priya has a 100% success rate, but Alexander is a mystery. He finds fault with every woman she introduces him to. Frustrated, she confronts him, and he admits the truth: he hired her because he\'s in love with her. He knew it was the only way to spend time with the workaholic matchmaker. She is shocked and professionally horrified. But as he sets out to prove they are the perfect match, she must decide whether to risk her heart and her business for her most impossible client.',
    keyTropes: ['billionaire', 'workplace-romance', 'slow-burn', 'unrequited-love-revealed'],
    desiredTone: 'Sophisticated, witty, and romantic.',
    approxWordCount: 2600,
    coverImagePrompt: 'A woman in a sharp business suit looks shocked as a handsome billionaire client presents her with a single red rose across a modern office desk. A sleek, stylish digital illustration. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 99
  {
    titleIdea: 'The Road Not Taken',
    subgenre: 'second-chance',
    characterNames: ['Kate', 'Ben'],
    mainCharacters: 'A successful travel blogger who lives out of a suitcase, and her college boyfriend who she left to travel the world, who she runs into at a remote hostel in Thailand.',
    plotSynopsis: 'Kate is on assignment. She is stunned to see Ben, the man she left ten years ago. He is also a traveler now, a path he took after she broke his heart. They decide to travel together for a short time, the old chemistry and deep connection reigniting under the tropical stars. They are perfect for each other now, but their lives are on opposite sides of the globe. They must decide if their love is worth giving up the nomadic lives they have built for themselves.',
    keyTropes: ['second-chance', 'travel-romance', 'what-if', 'bittersweet'],
    desiredTone: 'Adventurous, emotional, and introspective.',
    approxWordCount: 2500,
    coverImagePrompt: 'A man and a woman with backpacks are looking at a map together on a beautiful, remote beach in Thailand. Long-tail boats are visible in the turquoise water. A vibrant, realistic travel photograph style. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 100
  {
    titleIdea: 'The Chef and the Critic',
    subgenre: 'contemporary',
    characterNames: ['Antoine', 'Isabelle'],
    mainCharacters: 'A passionate, temperamental chef at a high-end restaurant, and the notoriously ruthless food critic who writes under an anonymous pseudonym.',
    plotSynopsis: 'Antoine\'s restaurant is his life. He lives and dies by the reviews. "The Butcher" is the one critic he can\'t seem to win over. He accidentally meets Isabelle, a charming writer, and they begin a passionate affair. He doesn\'t know she is The Butcher. She finds herself in an impossible position: she is falling for the man whose career she could destroy. When she is assigned to review his restaurant again, she must choose between her professional integrity and the man she loves.',
    keyTropes: ['enemies-to-lovers', 'secret-identity', 'foodie-romance', 'forbidden-love'],
    desiredTone: 'Dramatic, sexy, and delicious.',
    approxWordCount: 2700,
    coverImagePrompt: 'A chef in his kitchen is passionately explaining a dish to a woman who is tasting it, her eyes closed in delight. The scene is split, with one side showing her writing at a desk, a shadow of a butcher knife on the wall. A clever, graphic illustration style. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 101
  {
    titleIdea: 'The Smuggler\'s Song',
    subgenre: 'historical',
    characterNames: ['Finnian', 'Aisling'],
    mainCharacters: 'A charismatic Irish smuggler in the 18th century who uses his pub as a front, and the fiercely independent daughter of the new English magistrate sent to stop him.',
    plotSynopsis: 'Finnian\'s pub is the heart of the community and the center of the local smuggling ring. Aisling, tired of English society, is fascinated by the vibrant life of the Irish town. She is drawn to Finnian\'s charm and rebellious spirit, not knowing his true occupation. He knows she is the magistrate\'s daughter and should stay away, but can\'t. Their forbidden romance blossoms amidst sea shanties and secret cargo runs, but her father is closing in on the smugglers, forcing them to choose between love and loyalty.',
    keyTropes: ['historical-romance', 'forbidden-love', 'enemies-to-lovers', 'smugglers'],
    desiredTone: 'Adventurous, romantic, and rebellious.',
    approxWordCount: 2800,
    coverImagePrompt: 'In a cozy, candlelit Irish pub, a handsome man with a fiddle laughs with a beautiful woman in a fine dress. Through the window, a British redcoat can be seen patrolling the street. A warm, painterly digital illustration with a hint of danger. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 102
  {
    titleIdea: 'The Heart of the Automaton',
    subgenre: 'paranormal',
    characterNames: ['Professor Alistair Finch', 'Unit 7 (Eve)'],
    mainCharacters: 'A kind but lonely professor of antique technology in a steampunk Victorian London, and the beautiful, sentient automaton he discovers and repairs.',
    plotSynopsis: 'Alistair finds Eve, a clockwork woman, discarded in an old workshop. He restores her, and is shocked when she awakens with a personality and a thirst for knowledge. He teaches her about the world, and she teaches him about love and connection. He sees her as a person, but society sees her as a machine. When her powerful and dangerous creator comes to reclaim his "property," Alistair must fight for Eve\'s freedom and their right to love.',
    keyTropes: ['paranormal-romance', 'steampunk', 'AI-romance', 'forbidden-love'],
    desiredTone: 'Whimsical, romantic, and adventurous.',
    approxWordCount: 2700,
    coverImagePrompt: 'In a workshop filled with gears and brass contraptions, a man in Victorian attire gently adjusts a gear on the arm of a beautiful woman with visible clockwork mechanisms. A loving, warm illustration in a steampunk style. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 103
  {
    titleIdea: 'The Billionaire\'s Secret',
    subgenre: 'billionaire',
    characterNames: ['Hannah', 'Julian'],
    mainCharacters: 'A struggling journalist who goes undercover as a maid to expose a reclusive, scandalous billionaire, and the billionaire himself who is not what he seems.',
    plotSynopsis: 'Hannah expects to find a monster. Instead, she finds Julian, a quiet, kind man who is a devoted single father. The scandals, she discovers, were fabricated by a business rival. She finds herself falling for the man she is supposed to expose, caught in a web of her own lies. She must choose between the story of a lifetime and the man she has come to love, all while his rival tries to use her to destroy him.',
    keyTropes: ['billionaire', 'undercover', 'mistaken-identity', 'single-father'],
    desiredTone: 'Dramatic, emotional, and romantic.',
    approxWordCount: 2600,
    coverImagePrompt: 'A woman in a maid\'s uniform peeks from a doorway, watching a handsome man in an expensive suit tenderly reading a book to a small child in a luxurious library. A soft, emotional digital painting. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 104
  {
    titleIdea: 'The Day We Met Again',
    subgenre: 'second-chance',
    characterNames: ['Audrey', 'Leo'],
    mainCharacters: 'A successful architect who moved to the city, and her first love, the boy she left behind, who she hires to renovate her childhood home.',
    plotSynopsis: 'Audrey returns to her small hometown to flip the house she grew up in. She\'s shocked to discover the best contractor in town is Leo, the man she never got over. The forced proximity of the renovation project is filled with tension and unresolved feelings. They work through their past, rebuilding the house and their relationship, but her life is in the city, and his is in the town that she was so desperate to escape.',
    keyTropes: ['second-chance', 'hometown-romance', 'forced-proximity', 'contractor-romance'],
    desiredTone: 'Nostalgic, heartwarming, and emotionally resonant.',
    approxWordCount: 2500,
    coverImagePrompt: 'A woman in stylish city clothes and a handsome man in a tool belt are laughing as they look at blueprints in a house under renovation. Sunlight streams through the unfinished walls. A warm, realistic digital painting. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 105
  {
    titleIdea: 'The Antique Shop of Wishes',
    subgenre: 'contemporary',
    characterNames: ['Maggie', 'Ben'],
    mainCharacters: 'A woman who inherits her eccentric grandmother\'s antique shop, which is rumored to grant wishes, and the cynical journalist who comes to debunk the myth.',
    plotSynopsis: 'Maggie doesn\'t believe in the shop\'s magic, she just wants to sell it. Ben is writing an article exposing the town\'s silly legend. But as customers come in and their wishes start coming true in unexpected ways, they are both forced to question their disbelief. They work together to uncover the shop\'s history and the source of its magic, finding a magical love of their own along the way.',
    keyTropes: ['magical-realism', 'enemies-to-lovers', 'small-town', 'mystery'],
    desiredTone: 'Charming, whimsical, and romantic.',
    approxWordCount: 2400,
    coverImagePrompt: 'In a cluttered, magical-looking antique shop, a woman holds a glowing snow globe, looking with wonder at a man who is smiling, his cynical expression gone. A warm, enchanting illustration style. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 106
  {
    titleIdea: 'The Governess and the Beast',
    subgenre: 'historical',
    characterNames: ['Miss Eleanor Vance', 'The Duke of Blackwood'],
    mainCharacters: 'A bright, kind-hearted governess, and the brooding, scarred Duke she is hired to teach his rebellious young daughter.',
    plotSynopsis: 'The Duke of Blackwood is a recluse, feared by the staff. Eleanor is not intimidated. She charms his daughter and brings light back into the gloomy castle. The Duke finds himself drawn to her warmth and spirit. She sees the wounded man beneath the "beast." Their love is a slow burn, healing the wounds of his past, but a jealous relative conspires to drive Eleanor away and keep the Duke locked in his darkness.',
    keyTropes: ['historical-romance', 'beauty-and-the-beast', 'governess-romance', 'gothic-undertones'],
    desiredTone: 'Atmospheric, emotional, and deeply romantic.',
    approxWordCount: 2800,
    coverImagePrompt: 'In a grand, shadowy library, a woman in a simple governess\'s dress reads a book to a little girl. A handsome, scarred man watches them from the shadows by a large fireplace. A classic, moody oil painting. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 107
  {
    titleIdea: 'The Dryad\'s Pact',
    subgenre: 'paranormal',
    characterNames: ['Rhys', 'Lyra'],
    mainCharacters: 'A park ranger trying to save his forest from a mysterious blight, and the beautiful, ancient dryad who is bound to the forest\'s oldest tree.',
    plotSynopsis: 'The blight is magical in nature, and Rhys\'s scientific methods are failing. Lyra reveals herself to him, explaining that the forest\'s heart is dying. They must form a pact to combine his knowledge of the modern world and her ancient magic. As they work to heal the forest, they form a deep, primal bond. But the blight was caused by a powerful warlock who wants to absorb the forest\'s magic, and he sees their connection as a threat.',
    keyTropes: ['paranormal-romance', 'nature-magic', 'environmental-theme', 'fantasy'],
    desiredTone: 'Earthy, magical, and adventurous.',
    approxWordCount: 2700,
    coverImagePrompt: 'A man in a park ranger uniform gently touches the face of a beautiful woman who seems to be made of leaves and bark. They are standing in a lush, ancient forest with sunlight filtering through the canopy. A beautiful, ethereal fantasy illustration. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 108
  {
    titleIdea: 'The Billionaire\'s Prize',
    subgenre: 'billionaire',
    characterNames: ['Kate', 'Alexander'],
    mainCharacters: 'A fiercely competitive sailor aiming to win a prestigious regatta, and the arrogant shipping billionaire who is her main rival.',
    plotSynopsis: 'Kate has put everything into her boat. Alexander is used to winning at everything. Their rivalry on the water is intense and public. A storm during the final race forces them to work together to survive, leaving them shipwrecked on a deserted island. Stripped of their wealth and technology, they must rely on their wits and each other. Their rivalry turns into a grudging respect, and then a fiery passion. But rescue will mean returning to their old lives and the rivalry that defines them.',
    keyTropes: ['billionaire', 'enemies-to-lovers', 'survival', 'forced-proximity'],
    desiredTone: 'Adventurous, sexy, and exciting.',
    approxWordCount: 2700,
    coverImagePrompt: 'On a deserted tropical island, a woman in sailing gear and a handsome man in tattered, expensive clothes are working together to build a shelter. A wrecked sailboat is visible in the bay. A realistic, cinematic digital painting. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 109
  {
    titleIdea: 'The Bookstore on the Corner',
    subgenre: 'second-chance',
    characterNames: ['Lucy', 'Sam'],
    mainCharacters: 'A woman who pours her life savings into opening a small bookstore, and her high school sweetheart, who is the developer planning to tear down the building.',
    plotSynopsis: 'Lucy\'s dream is about to be demolished by the man who broke her heart. Sam doesn\'t realize the bookstore is hers until he walks in with the eviction notice. The shock of their reunion is complicated by their professional conflict. He gives her thirty days to prove the bookstore is a viable business. As she hosts community events and reminds him of the town they grew up in, he is torn between his job and the woman he never stopped loving.',
    keyTropes: ['second-chance', 'enemies-to-lovers', 'hometown-romance', 'small-business'],
    desiredTone: 'Charming, heartwarming, and bittersweet.',
    approxWordCount: 2500,
    coverImagePrompt: 'A woman stands protectively in front of her charming little bookstore, glaring at a man in a suit who is holding a set of blueprints. He has a pained, conflicted expression. A warm, storybook illustration. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 110
  {
    titleIdea: 'The Coder and the Muse',
    subgenre: 'contemporary',
    characterNames: ['Alex', 'Callie'],
    mainCharacters: 'A brilliant but socially anxious video game coder, and the free-spirited, charismatic artist he hires to design the characters for his new game.',
    plotSynopsis: 'Alex communicates best through code. Callie communicates through art. Their collaboration starts awkwardly, with Alex sending her pages of technical specs and her sending back whimsical drawings. They slowly find a rhythm, and he starts designing the game\'s heroine to be more and more like Callie. He finds himself falling for his muse, but he doesn\'t know how to tell her. When a publisher gives them a tight deadline, the pressure threatens to break their fragile connection before it can become something more.',
    keyTropes: ['opposites-attract', 'creative-collaboration', 'slow-burn', 'shy-hero'],
    desiredTone: 'Quirky, sweet, and modern.',
    approxWordCount: 2400,
    coverImagePrompt: 'A woman with colorful hair is sketching in a notepad, showing it to a man who is looking at her with an adoring expression, a computer with lines of code in front of him. A fun, modern graphic illustration. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 111
  {
    titleIdea: 'The Lady and the Blacksmith',
    subgenre: 'historical',
    characterNames: ['Lady Genevieve', 'Rhys'],
    mainCharacters: 'A curious noblewoman who is more interested in mechanics than marriage, and the strong, silent blacksmith she secretly commissions to build a flying machine.',
    plotSynopsis: 'Genevieve is a dreamer, obsessed with Da Vinci\'s designs. She finds a kindred spirit in Rhys, a blacksmith with an inventor\'s mind. Their secret project, a magnificent ornithopter, brings them together in his forge late at night. Their shared passion for creation blossoms into a forbidden love. But her father has arranged her marriage to a powerful lord, and their secret flights could be seen as witchcraft. They must risk everything to achieve their dream and be together.',
    keyTropes: ['historical-romance', 'forbidden-love', 'secret-project', 'class-difference'],
    desiredTone: 'Adventurous, inspiring, and romantic.',
    approxWordCount: 2800,
    coverImagePrompt: 'In a blacksmith\'s forge, a woman in a simple dress and a handsome, muscular blacksmith are looking at a blueprint for a flying machine with large, feathered wings. The style is a realistic, warm-toned digital painting. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 112
  {
    titleIdea: 'The Curse of the Selkie',
    subgenre: 'paranormal',
    characterNames: ['Anya', 'Ronan'],
    mainCharacters: 'A folklorist studying Celtic myths on a remote Irish island, and the handsome, melancholic fisherman who is secretly a selkie, a man on land but a seal in the sea.',
    plotSynopsis: 'Anya is drawn to the local legend of the selkies. Ronan is the last of his kind, his sealskin stolen by a witch generations ago, trapping him on land. He is drawn to Anya\'s kind heart and her fascination with his world. As they fall in love, she becomes determined to find his lost skin and break the curse. Their quest takes them to ancient ruins and treacherous sea caves, but the witch\'s descendant will do anything to keep Ronan under her power.',
    keyTropes: ['paranormal-romance', 'mythology', 'curse-breaking', 'fated-mates'],
    desiredTone: 'Magical, mythical, and deeply romantic.',
    approxWordCount: 2700,
    coverImagePrompt: 'A woman stands on a rocky Irish shoreline, looking at a handsome man who is staring longingly out at the sea. A group of seals are visible on the rocks in the distance. A beautiful, atmospheric watercolor painting. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 113
  {
    titleIdea: 'The Billionaire\'s Masquerade',
    subgenre: 'billionaire',
    characterNames: ['Isabella', 'Dante'],
    mainCharacters: 'A struggling caterer who gets a last-minute job for a mysterious masquerade ball, and the reclusive billionaire host who falls for her, thinking she is a guest.',
    plotSynopsis: 'Isabella is not supposed to mingle with the guests, but when a handsome, masked man strikes up a conversation, she can\'t resist. The chemistry is electric. They spend the night talking and dancing, neither knowing the other\'s identity. The host, Dante, is enchanted. He searches for the mysterious woman in the simple mask, not realizing she was his caterer. Isabella must navigate the fallout of her magical night while protecting her business and her heart.',
    keyTropes: ['billionaire', 'cinderella-story', 'mistaken-identity', 'masquerade-ball'],
    desiredTone: 'Fairytale, glamorous, and romantic.',
    approxWordCount: 2500,
    coverImagePrompt: 'At a lavish masquerade ball, a handsome man in a tuxedo and an ornate mask dances with a woman in a simple but elegant dress and a plain mask. They are looking only at each other. A dreamy, magical digital painting. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 114
  {
    titleIdea: 'The Summer We Were Infinite',
    subgenre: 'second-chance',
    characterNames: ['Maisie', 'Nate'],
    mainCharacters: 'A high school teacher who chaperones a student trip to Italy, and her former high school sweetheart who she runs into, now a charming tour guide.',
    plotSynopsis: 'Maisie is dreading the trip. She is shocked and flustered to discover their tour guide is Nate, the boy who disappeared from her life without a word years ago. The forced proximity on the tour bus is awkward at first, then nostalgic. As they explore the romantic cities of Italy, they confront their past and the misunderstanding that tore them apart. They must decide if their love can be rekindled or if it belongs in the past.',
    keyTropes: ['second-chance', 'travel-romance', 'forced-proximity', 'hometown-sweethearts'],
    desiredTone: 'Nostalgic, romantic, and picturesque.',
    approxWordCount: 2600,
    coverImagePrompt: 'A man and a woman are laughing as they eat gelato by a fountain in Rome. A group of students is visible in the background. A bright, sunny, photorealistic style. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 115
  {
    titleIdea: 'The Clockmaker and the Thief',
    subgenre: 'contemporary',
    characterNames: ['Amelia', 'Sebastian'],
    mainCharacters: 'A meticulous restorer of antique clocks, and the charming, world-class art thief who commissions her to build a replica of a famous clock he plans to steal.',
    plotSynopsis: 'Sebastian, under a false identity, hires Amelia to create a perfect replica of the St. Petersburg Clock. He is a professional, but he is captivated by her passion and skill. She is intrigued by her mysterious, wealthy client. As they work together, their intellectual and creative connection becomes a passionate affair. When she discovers his true identity and his plan, she is caught between her conscience and the man she has fallen for, forced to become his unwilling accomplice.',
    keyTropes: ['forbidden-love', 'art-heist', 'opposites-attract', 'suspense'],
    desiredTone: 'Slick, sophisticated, and thrilling.',
    approxWordCount: 2700,
    coverImagePrompt: 'In a workshop filled with clocks, a woman looks intently at a complex gear mechanism. A handsome, shadowy figure leans over her shoulder, watching her hands. A sleek, modern digital painting with high contrast. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 116
  {
    titleIdea: 'The Knight and the Sorceress',
    subgenre: 'historical',
    characterNames: ['Sir Kaelan', 'Morgana'],
    mainCharacters: 'A devout, honorable knight on a quest to slay a "witch," and the powerful, misunderstood sorceress who lives in the enchanted forest.',
    plotSynopsis: 'Kaelan is sent by his king to rid the land of the witch Morgana. He expects a twisted monster but finds a beautiful, wise woman who uses her magic to heal and protect the forest. She easily defeats him but spares his life. He stays, determined to understand her magic. He discovers the king\'s real motive is to steal the forest\'s power. He must choose between his oath and the woman he has come to love, siding with magic against the kingdom he swore to protect.',
    keyTropes: ['historical-fantasy', 'enemies-to-lovers', 'forbidden-love', 'magic'],
    desiredTone: 'Epic, magical, and romantic.',
    approxWordCount: 2900,
    coverImagePrompt: 'A knight in full armor kneels before a beautiful sorceress in a flowing gown in an enchanted, glowing forest. He is offering her his sword. A detailed, epic fantasy illustration. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 117
  {
    titleIdea: 'The Incubus in Apartment 3B',
    subgenre: 'paranormal',
    characterNames: ['Chloe', 'Damien'],
    mainCharacters: 'A shy, romance-novel-addicted librarian, and the handsome, charming new neighbor who is secretly an incubus who feeds on dreams.',
    plotSynopsis: 'Chloe has the most vivid, romantic dreams of her life after Damien moves in next door. She is embarrassed but also finds herself drawn to her charming neighbor in the waking world. Damien is supposed to be a predator, but he finds himself genuinely falling for the sweet, funny woman whose dreams are so full of love. He tries to fight his nature, but his hunger is a real threat. Their love is a dangerous dance between dream and reality.',
    keyTropes: ['paranormal-romance', 'incubus', 'neighbors', 'forbidden-love'],
    desiredTone: 'Sexy, funny, and surprisingly sweet.',
    approxWordCount: 2600,
    coverImagePrompt: 'A woman is asleep in her bed, a romance novel on her nightstand. A handsome, shadowy figure leans over her, a faint glow connecting them. The style is a dark, dreamy, and romantic digital painting. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 118
  {
    titleIdea: 'The Billionaire\'s Dog Walker',
    subgenre: 'billionaire',
    characterNames: ['Penny', 'Mark'],
    mainCharacters: 'A cheerful, free-spirited dog walker, and the grumpy, workaholic billionaire who hires her to walk his perfectly-groomed, show-dog poodle.',
    plotSynopsis: 'Penny runs a chaotic pack of rescue dogs. Mark\'s poodle, "Princess Fluffybutt III," is used to a life of luxury and order. The first walk is a disaster. Mark is furious, but Penny\'s charm and her genuine love for dogs slowly win him over. She teaches him how to relax and have fun. He gives her the business advice she needs to expand her shelter. Their opposite worlds collide, leading to a hilarious and heartwarming romance.',
    keyTropes: ['billionaire', 'grumpy-sunshine', 'opposites-attract', 'animal-lovers'],
    desiredTone: 'Funny, charming, and adorable.',
    approxWordCount: 2400,
    coverImagePrompt: 'A woman covered in mud is laughing as she is surrounded by a pack of happy, muddy dogs. A handsome man in an expensive suit holds a pristine white poodle, looking on with a mixture of horror and amusement. A bright, humorous digital illustration. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 119
  {
    titleIdea: 'The Songs We Forgot to Sing',
    subgenre: 'second-chance',
    characterNames: ['Nina', 'Sam'],
    mainCharacters: 'The two lead singers of an indie band who were on the verge of fame when they had a bitter breakup, who are forced to reunite for a "one-night-only" charity concert ten years later.',
    plotSynopsis: 'Nina and Sam haven\'t spoken in a decade. The animosity is still raw. But when they start rehearsing, the old musical chemistry is still there, and so are the unresolved feelings. The songs they wrote together tell the story of their love and their breakup. They must confront their past and the reasons they fell apart, all while the world watches, hoping for a reunion. The concert is their last chance to get their final song, and their love story, right.',
    keyTropes: ['second-chance', 'musicians', 'enemies-to-lovers', 'forced-reunion'],
    desiredTone: 'Emotional, nostalgic, and musically-infused.',
    approxWordCount: 2600,
    coverImagePrompt: 'A man with a guitar and a woman with a microphone stand back-to-back on a concert stage, under a single spotlight. They are not looking at each other, their expressions full of emotion. A dramatic, cinematic digital painting. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 120
  {
    titleIdea: 'The Archaeologist and the Airship Captain',
    subgenre: 'historical',
    characterNames: ['Dr. Lena Petrova', 'Captain Eva Rostova'],
    mainCharacters: 'A meticulous archaeologist who discovers a lost city in the arctic, and the cocky, daring airship captain she hires to ferry her crew and equipment.',
    plotSynopsis: 'Lena needs the best pilot to navigate the treacherous arctic weather. Eva is the best, and she knows it. Their personalities clash instantly. Lena is all about careful planning; Eva is all about improvisation. As they explore the stunning, frozen ruins, they develop a grudging respect that blossoms into a powerful attraction. But a rival expedition is on their tail, and they must trust each other to survive the harsh environment and protect their discovery.',
    keyTropes: ['enemies-to-lovers', 'adventure-romance', 'forced-proximity', 'steampunk-light'],
    desiredTone: 'Adventurous, witty, and thrilling.',
    approxWordCount: 2700,
    coverImagePrompt: 'A woman in expedition gear looks at a map while another woman in a cool pilot\'s jacket leans on the railing of a large, fantastic-looking airship, smirking. They are flying over a vast, frozen arctic landscape. A fun, adventurous digital painting. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 121
  {
    titleIdea: 'The Weaver of Dreams',
    subgenre: 'paranormal',
    characterNames: ['Penelope', 'Kai'],
    mainCharacters: 'A woman who can weave people\'s dreams into tapestries, and a man suffering from chronic nightmares who commissions her for a piece.',
    plotSynopsis: 'Penelope\'s tapestries are beautiful but carry an emotional toll. When she takes on Kai\'s commission, she is plunged into his terrifying dreamscape. As she weaves, she begins to heal his nightmares, and they form a deep, intimate connection in the waking world. She discovers his nightmares are not random, but a magical attack from someone in his past. She must enter his dreamscape to fight the creature that haunts him, a battle that could cost her her own mind.',
    keyTropes: ['paranormal-romance', 'dream-world', 'magic', 'healing-journey'],
    desiredTone: 'Imaginative, emotional, and suspenseful.',
    approxWordCount: 2800,
    coverImagePrompt: 'A woman sits at a large loom, weaving a beautiful but terrifying tapestry. A handsome man watches her, a grateful and loving expression on his face. The tapestry itself seems to glow with a magical light. A beautiful, ethereal fantasy illustration. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 122
  {
    titleIdea: 'The Duke\'s Forgotten Bride',
    subgenre: 'historical',
    characterNames: ['Lady Beatrice', 'The Duke of Wycliffe'],
    mainCharacters: 'A woman who was betrothed to a Duke as a child and forgotten, who shows up on his doorstep years later to claim her position, and the rakish, irresponsible Duke who has no memory of her.',
    plotSynopsis: 'Beatrice is penniless and her honor is at stake. The Duke is a notorious rake, horrified at the prospect of being tied down. He agrees to a temporary, fake engagement to satisfy society, planning to find a loophole. But Beatrice is not the meek country mouse he expected. She is intelligent and fiery, and she begins to bring order to his chaotic life. He finds himself falling for his forgotten bride, but his scandalous past threatens to ruin them both.',
    keyTropes: ['historical-romance', 'arranged-marriage', 'enemies-to-lovers', 'regency-era'],
    desiredTone: 'Witty, charming, and romantic.',
    approxWordCount: 2700,
    coverImagePrompt: 'A handsome, roguish-looking Duke looks shocked as a beautiful, determined woman presents him with a dusty old marriage contract in his lavish drawing-room. A humorous, elegant oil painting style. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 123
  {
    titleIdea: 'The CEO\'s Second Chance',
    subgenre: 'billionaire',
    characterNames: ['Maya', 'Ethan'],
    mainCharacters: 'A successful bakery owner, and her college sweetheart, now a billionaire tech CEO, who comes back to their hometown to win her back.',
    plotSynopsis: 'Ethan broke Maya\'s heart when he chose his career over her. Ten years later, he\'s rich and successful, but miserable. He returns home, determined to prove he\'s changed. Maya is wary, her life is happy and stable. He uses his resources to help her expand her business, but she is resistant to his grand gestures. He must learn that love is about more than money, and she must learn to trust him again, giving them both a second chance at the love they let slip away.',
    keyTropes: ['billionaire', 'second-chance', 'hometown-romance', 'foodie-romance'],
    desiredTone: 'Emotional, sweet, and heartwarming.',
    approxWordCount: 2600,
    coverImagePrompt: 'A handsome man in a suit looks hopefully at a woman in a baker\'s apron who is standing with her arms crossed in front of a charming bakery. A warm, realistic digital painting. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 124
  {
    titleIdea: 'The Winter We Danced',
    subgenre: 'second-chance',
    characterNames: ['Isabelle', 'Alexei'],
    mainCharacters: 'Two former professional ballet partners who had a bitter falling out, who are reunited to choreograph a new production of The Nutcracker.',
    plotSynopsis: 'Isabelle and Alexei were dance royalty, their partnership legendary. Their breakup was just as dramatic. Now, their old ballet company needs them to save their season. The rehearsal studio is a battlefield of old resentments and unspoken feelings. But as they dance, their bodies remember the old intimacy and trust. They must choreograph a new future for themselves, a dance of forgiveness and a second chance at the love they thought was lost.',
    keyTropes: ['second-chance', 'dancers', 'forced-reunion', 'artistic-collaboration'],
    desiredTone: 'Emotional, graceful, and passionate.',
    approxWordCount: 2500,
    coverImagePrompt: 'A man and a woman, both in ballet attire, are in a dramatic dance pose in a rehearsal studio. They are looking at each other with a mixture of anger, passion, and longing. A beautiful, dynamic digital painting. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 125
  {
    titleIdea: 'The Sommelier\'s Secret',
    subgenre: 'contemporary',
    characterNames: ['Sophie', 'Luc'],
    mainCharacters: 'A rising star sommelier at a Michelin-starred restaurant, and the handsome, enigmatic vineyard owner from a small, unknown region in France who wants her to endorse his wine.',
    plotSynopsis: 'Sophie is a woman of impeccable taste and integrity. Luc\'s wine is the best she has ever tasted, but it comes from a region with a dark, forgotten history. He is charming and passionate, and their connection is immediate. As she investigates his vineyard\'s past, she uncovers a story of wartime betrayal and a family secret he is desperate to protect. She must choose between her career-making discovery and the man she is falling for.',
    keyTropes: ['foodie-romance', 'mystery', 'forbidden-love', 'secrets'],
    desiredTone: 'Sophisticated, suspenseful, and intoxicating.',
    approxWordCount: 2700,
    coverImagePrompt: 'In a candlelit wine cellar, a woman tastes a glass of red wine, her eyes closed. A handsome man watches her intently, a shadow of concern on his face. A rich, atmospheric digital painting. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 126
  {
    titleIdea: 'The Captain and the Stowaway',
    subgenre: 'historical',
    characterNames: ['Captain Thorne', 'Isabelle'],
    mainCharacters: 'A stern, honorable captain in the Royal Navy, and the beautiful, resourceful young woman he discovers has stowed away on his ship, disguised as a boy.',
    plotSynopsis: 'Isabelle is on the run from a dangerous fiancé. Captain Thorne is furious when he discovers her, as a woman on a naval vessel is considered bad luck and is strictly forbidden. He agrees to protect her until they reach the next port. Her courage and intelligence quickly earn his respect and admiration. Their forced proximity in his small cabin leads to a powerful, forbidden love. When her fiancé\'s men catch up to them, he must risk his career and his life to save her.',
    keyTropes: ['historical-romance', 'forbidden-love', 'forced-proximity', 'disguise'],
    desiredTone: 'Adventurous, romantic, and suspenseful.',
    approxWordCount: 2800,
    coverImagePrompt: 'On the deck of a tall sailing ship, a stern naval captain looks down at a young "cabin boy" who has just been revealed to be a beautiful woman. The crew looks on in shock. A classic, cinematic oil painting style. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 127
  {
    titleIdea: 'The Dragon\'s Heartbeat',
    subgenre: 'paranormal',
    characterNames: ['Lady Althea', 'Kael'],
    mainCharacters: 'A princess sent as a tribute to a fearsome dragon, and the powerful, ancient dragon who can take human form.',
    plotSynopsis: 'Althea goes to her death bravely, only to find the "dragon" is Kael, a handsome, lonely shifter who is the last of his kind. He is bound to protect the mountain pass and is tired of his solitude. He is captivated by her courage. She is fascinated by his wisdom and power. Their love story unfolds against a backdrop of epic fantasy, but a neighboring kingdom sees the dragon as a threat and sends its greatest knight to slay him, forcing Althea to choose a side.',
    keyTropes: ['paranormal-romance', 'fantasy', 'dragons', 'forbidden-love'],
    desiredTone: 'Epic, magical, and deeply romantic.',
    approxWordCount: 2900,
    coverImagePrompt: 'A massive, magnificent dragon lies curled on a mountaintop, a beautiful woman in a simple gown gently touching its snout. In the dragon\'s eye, the reflection of a handsome man can be seen. A breathtaking, detailed fantasy illustration. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 128
  {
    titleIdea: 'The Billionaire\'s Redemption',
    subgenre: 'billionaire',
    characterNames: ['Grace', 'Adam'],
    mainCharacters: 'A compassionate social worker at a community center, and the ruthless billionaire developer who plans to tear it down to build luxury condos.',
    plotSynopsis: 'Grace leads the fight to save her community center. Adam sees it as just another business deal. He agrees to meet with her as a PR move, but is struck by her passion and the vital work the center does. He finds himself drawn to her goodness, which stands in stark contrast to his own cynical world. He begins to question his own life choices, falling for the woman who is his biggest adversary. He must find a way to redeem himself and save the center, even if it means going against his own company.',
    keyTropes: ['billionaire', 'enemies-to-lovers', 'opposites-attract', 'redemption-arc'],
    desiredTone: 'Heartwarming, emotional, and inspiring.',
    approxWordCount: 2600,
    coverImagePrompt: 'A woman with her arms crossed stands defiantly in front of a rundown community center, facing off against a man in a sharp suit who is holding blueprints. He has a conflicted, thoughtful expression. A realistic, impactful digital painting. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 129
  {
    titleIdea: 'The Promise of a Second Summer',
    subgenre: 'second-chance',
    characterNames: ['Chloe', 'David'],
    mainCharacters: 'The two camp counselors who fell in love one summer and promised to write, but never did, who return to the same camp years later as the new co-directors.',
    plotSynopsis: 'Chloe and David are shocked to find they will be working together. The old hurt and unanswered questions are still there. But so is the undeniable chemistry. As they manage a new generation of campers and relive their own summer memories, they confront the reasons they fell out of touch. They have a second chance to fulfill the promise of that long-ago summer, but the realities of their adult lives threaten to get in the way.',
    keyTropes: ['second-chance', 'childhood-sweethearts', 'forced-proximity', 'summer-camp'],
    desiredTone: 'Nostalgic, sweet, and heartwarming.',
    approxWordCount: 2400,
    coverImagePrompt: 'A man and a woman are laughing as they try to untangle a string of friendship bracelets by a campfire. A group of kids is visible in the background by a lake. A warm, charming illustration. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 130
  {
    titleIdea: 'The Sculptor and the Muse',
    subgenre: 'contemporary',
    characterNames: ['Leo', 'Isla'],
    mainCharacters: 'A reclusive, brooding sculptor who creates masterpieces from salvaged metal, and the vibrant, free-spirited dancer who becomes his unlikely muse.',
    plotSynopsis: 'Leo works in a junkyard, his art his only companion. He sees Isla dancing in a park and is inspired by her movement and grace. He asks her to model for him. She is intrigued by his intensity and the raw power of his work. As he sculpts her, he begins to open up, and she finds a stillness and focus she has never known. Their artistic collaboration becomes a passionate love affair, but his troubled past threatens to destroy the beautiful thing they are building.',
    keyTropes: ['opposites-attract', 'artistic-collaboration', 'healing-journey', 'slow-burn'],
    desiredTone: 'Moody, passionate, and artistic.',
    approxWordCount: 2600,
    coverImagePrompt: 'In a rustic, cluttered workshop, a handsome, brooding man is welding a metal sculpture. A beautiful woman in a simple leotard is holding a dynamic dance pose nearby, watching him. A dramatic, painterly digital illustration with a focus on light and shadow. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 131
  {
    titleIdea: 'The Shadow of the Templars',
    subgenre: 'historical',
    characterNames: ['Lady Isabelle', 'Sir William'],
    mainCharacters: 'A learned lady in medieval France who discovers a coded message about the Templar treasure, and a disgraced Knight Templar living in hiding.',
    plotSynopsis: 'Isabelle\'s father was a Templar, and his last letter holds a clue to the legendary treasure. To decipher it, she must find Sir William, a man hunted by the King and the Church. He is bitter and mistrustful but recognizes the code. They embark on a dangerous quest across Europe, pursued by powerful enemies. Their shared goal and constant danger forge a powerful bond, and they find a treasure more valuable than gold: a love worth fighting for.',
    keyTropes: ['historical-romance', 'adventure', 'treasure-hunt', 'knights'],
    desiredTone: 'Epic, adventurous, and suspenseful.',
    approxWordCount: 3000,
    coverImagePrompt: 'A knight in a surcoat with a red cross and a lady in a medieval gown are looking at an old map in a candlelit monastery crypt. Shadows dance on the stone walls. A classic, dramatic oil painting. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 132
  {
    titleIdea: 'The Guardian of the Veil',
    subgenre: 'paranormal',
    characterNames: ['Seraphina', 'Elias'],
    mainCharacters: 'A woman who is a guardian of a portal between the human and spirit worlds, located in a cemetery, and a cynical journalist investigating the "haunting" for a Halloween story.',
    plotSynopsis: 'Seraphina spends her nights ensuring the veil remains sealed. Elias arrives, armed with a camera and a healthy dose of skepticism. He is looking for a ghost story but finds a world of magic he never imagined. He is captivated by Seraphina\'s power and her lonely duty. She is drawn to his curiosity and his connection to the human world she has to protect. When a powerful spirit tries to break through the veil, they must combine her magic and his wits to save both their worlds.',
    keyTropes: ['paranormal-romance', 'urban-fantasy', 'forbidden-love', 'magic'],
    desiredTone: 'Magical, spooky, and romantic.',
    approxWordCount: 2700,
    coverImagePrompt: 'In a beautiful, old cemetery at night, a woman with glowing hands stands before a shimmering portal of light. A man with a camera looks on in awe and terror. A moody, atmospheric digital painting. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 133
  {
    titleIdea: 'The Billionaire\'s Proposal',
    subgenre: 'billionaire',
    characterNames: ['Charlotte', 'William'],
    mainCharacters: 'A brilliant but struggling astrophysicist about to lose funding for her deep space project, and the arrogant aerospace billionaire who offers to fund her, but only if she marries him.',
    plotSynopsis: 'William needs a respectable, intelligent wife to secure a conservative government contract. Charlotte needs his money to save her life\'s work. They agree to a marriage of convenience: a business deal, nothing more. But their late-night conversations about the stars and the universe ignite an intellectual and emotional connection they never expected. Their convenient proposal starts to feel very real, but the secret of their arrangement could destroy both their careers.',
    keyTropes: ['billionaire', 'marriage-of-convenience', 'opposites-attract', 'intellectuals'],
    desiredTone: 'Smart, sophisticated, and romantic.',
    approxWordCount: 2600,
    coverImagePrompt: 'A woman in a simple dress and a man in a tuxedo are slow dancing under a projection of a beautiful galaxy at a science museum gala. They are looking at each other, not the stars. A sleek, modern digital illustration. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 134
  {
    titleIdea: 'The Memory of Us',
    subgenre: 'second-chance',
    characterNames: ['Alice', 'Noah'],
    mainCharacters: 'A woman who has a "memory palace" and can remember every detail of her life, and her first love, who she runs into years later, who has no memory of her due to a tragic accident.',
    plotSynopsis: 'Alice has never forgotten Noah or the day he disappeared. When she meets him again, he is a stranger. The accident wiped out years of his memory, including her. She is heartbroken but determined to help him remember. She takes him to their old haunts, sharing stories of their past. He finds himself falling in love with this woman who seems to know him better than he knows himself. The question is whether he is falling for her, or for the memory of a boy he used to be.',
    keyTropes: ['second-chance', 'amnesia', 'healing-journey', 'tragic-romance'],
    desiredTone: 'Bittersweet, emotional, and deeply romantic.',
    approxWordCount: 2700,
    coverImagePrompt: 'A woman gently touches the face of a man who looks at her with a loving but confused expression. The background is a swirl of faded, dreamlike memories of them together. A soft, ethereal digital painting. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 135
  {
    titleIdea: 'The Dog Trainer and the Duke',
    subgenre: 'contemporary',
    characterNames: ['Izzy', 'Arthur'],
    mainCharacters: 'A cheerful, down-to-earth dog trainer from Brooklyn, and the stuffy, handsome British Duke who inherits a misbehaving corgi and is forced to hire her.',
    plotSynopsis: 'Arthur, the 12th Duke of Westminster, is completely unprepared for Winston, the chaotic corgi left to him by his eccentric grandmother. He reluctantly hires Izzy, a trainer with a radically different, positive-reinforcement approach. Her American optimism clashes with his British reserve. Their hilarious training sessions with the stubborn corgi break down his defenses and open his heart. A cross-continental romance blooms, but can a Brooklyn dog trainer really become a Duchess?',
    keyTropes: ['royalty', 'opposites-attract', 'animal-lovers', 'comedy'],
    desiredTone: 'Charming, funny, and heartwarming.',
    approxWordCount: 2400,
    coverImagePrompt: 'A woman in jeans is laughing as a mischievous corgi runs circles around a handsome, impeccably dressed man in the gardens of a grand English estate. A bright, humorous digital illustration. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 136
  {
    titleIdea: 'The Sword and the Serpent',
    subgenre: 'historical',
    characterNames: ['Marcus', 'Cleopatra'],
    mainCharacters: 'A stoic, honorable Roman Centurion assigned to Queen Cleopatra\'s personal guard, and the brilliant, seductive Queen of Egypt herself.',
    plotSynopsis: 'Marcus is a man of duty, loyal to Rome. He sees Cleopatra as a decadent foreign queen. She sees him as an obstacle. But as he guards her, he witnesses her intelligence, her political skill, and her devotion to her people. He becomes her confidant and protector. Their relationship evolves from one of duty and suspicion to a passionate, forbidden love that could bring down empires. They are caught between the power of Rome and the magic of Egypt, their love a casualty of history.',
    keyTropes: ['historical-romance', 'forbidden-love', 'political-intrigue', 'ancient-world'],
    desiredTone: 'Epic, tragic, and intensely passionate.',
    approxWordCount: 3000,
    coverImagePrompt: 'A powerful Roman centurion stands guard behind the golden throne of Cleopatra, Queen of Egypt. They are exchanging a secret, intense glance. A classic, epic oil painting in the style of Lawrence Alma-Tadema. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 137
  {
    titleIdea: 'The Ghost in the Machine',
    subgenre: 'paranormal',
    characterNames: ['Ben', 'Ava'],
    mainCharacters: 'A vintage typewriter repairman, and the ghost of a 1940s journalist who haunts the typewriter she used to write her greatest stories.',
    plotSynopsis: 'Ben loves bringing old machines back to life. When he restores a vintage Underwood, he starts finding typed messages he didn\'t write. It\'s Ava, a ghost trapped in the machine. She is witty and sharp, and they form a unique friendship through the typed letters. He becomes determined to solve the mystery of her unsolved murder. As he investigates her cold case, he falls for the ghost in the machine, a love story that transcends time and the physical world.',
    keyTropes: ['paranormal-romance', 'haunting', 'mystery', 'historical-ghost'],
    desiredTone: 'Charming, witty, and nostalgic.',
    approxWordCount: 2600,
    coverImagePrompt: 'A man looks with a smile at a vintage typewriter on his workbench. A ghostly, translucent woman in 1940s attire is visible floating over it, her fingers near the keys. A warm, charming digital illustration with a retro feel. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 138
  {
    titleIdea: 'The Billionaire\'s Assistant',
    subgenre: 'billionaire',
    characterNames: ['Emily', 'Mr. Sterling'],
    mainCharacters: 'A bright, ambitious young woman who lands a coveted job as the executive assistant to a notoriously demanding, icy billionaire CEO.',
    plotSynopsis: 'Emily is determined to succeed. Mr. Sterling is a workaholic who runs on black coffee and impossible deadlines. He is demanding and cold, but she sees flashes of a brilliant, lonely man beneath the surface. She becomes indispensable to him, the one person who can anticipate his needs and challenge his views. Their professional relationship becomes a slow-burn romance, but a workplace relationship is forbidden, and a corporate rival is looking for any weakness to exploit.',
    keyTropes: ['billionaire', 'workplace-romance', 'slow-burn', 'ice-queen-melts'],
    desiredTone: 'Sophisticated, sexy, and dramatic.',
    approxWordCount: 2700,
    coverImagePrompt: 'In a sleek, high-rise office at night, a woman in a smart business dress hands a folder to a handsome, stern-looking CEO. There is a palpable tension between them. A modern, cinematic digital painting. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 139
  {
    titleIdea: 'The House on the Cliff',
    subgenre: 'second-chance',
    characterNames: ['Sarah', 'Nathan'],
    mainCharacters: 'A woman who inherits a beautiful but dilapidated house on the Cornish coast, and her estranged husband, a master craftsman, who is the only one who can help her restore it.',
    plotSynopsis: 'Sarah and Nathan have been separated for a year, the pain of a shared tragedy still raw between them. The house is her last chance for a fresh start. She reluctantly hires him to do the restoration. Working together on the house, they are forced to confront their grief and the love that is still there, buried under the pain. The house heals as they do, giving them a second chance to rebuild their home and their marriage.',
    keyTropes: ['second-chance', 'reconciliation-romance', 'healing-journey', 'forced-proximity'],
    desiredTone: 'Emotional, atmospheric, and hopeful.',
    approxWordCount: 2600,
    coverImagePrompt: 'A man and a woman stand on scaffolding, painting the side of a beautiful old house on a cliff overlooking the sea. They are smiling at each other. A warm, painterly digital illustration. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 140
  {
    titleIdea: 'The Locksmith and the Heiress',
    subgenre: 'contemporary',
    characterNames: ['Chloe', 'Donovan'],
    mainCharacters: 'A resourceful locksmith and security expert, and a charming, thrill-seeking heiress who hires her to test the security of her family\'s mansion.',
    plotSynopsis: 'Chloe is the best in the business. Donovan treats it as a game, trying to outsmart her at every turn. Their professional rivalry is filled with witty banter and escalating challenges. Chloe finds herself drawn to Donovan\'s sharp mind, and Donovan is captivated by Chloe\'s skill and integrity. When a real thief breaks in, using a method from one of Chloe\'s tests, they must team up to catch him, their game turning into a very real and dangerous adventure.',
    keyTropes: ['enemies-to-lovers', 'cat-and-mouse', 'witty-banter', 'suspense'],
    desiredTone: 'Slick, fun, and clever.',
    approxWordCount: 2500,
    coverImagePrompt: 'A woman in a black catsuit is picking the lock of a large safe. A beautiful woman in an evening gown is leaning against the wall nearby, watching her with an amused smirk. A sleek, modern graphic novel style. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 141
  {
    titleIdea: 'The Falconer\'s Heart',
    subgenre: 'historical',
    characterNames: ['Lady Isolde', 'Gareth'],
    mainCharacters: 'A noblewoman in medieval England with a passion for falconry, and the handsome, common-born falconer who teaches her.',
    plotSynopsis: 'Isolde feels trapped by the expectations of her station. Her only freedom is in the sky with her birds. She finds a kindred spirit in Gareth, the master falconer. He is a man of the earth, and she is a lady of the castle, but their shared love for the birds creates a powerful bond that transcends class. Their secret meetings in the mews and the fields become a forbidden romance, but her father has promised her to a cruel neighboring lord, and their love could cost them everything.',
    keyTropes: ['historical-romance', 'forbidden-love', 'class-difference', 'animal-lovers'],
    desiredTone: 'Earthy, romantic, and poignant.',
    approxWordCount: 2700,
    coverImagePrompt: 'In a beautiful field, a woman in a medieval gown has a falcon perched on her gloved hand. A handsome man in simple clothes stands close by, adjusting the bird\'s jesses, their hands almost touching. A realistic, painterly digital illustration. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 142
  {
    titleIdea: 'The Soul of the Sword',
    subgenre: 'paranormal',
    characterNames: ['Kaelen', 'Anya'],
    mainCharacters: 'A young blacksmith who forges a legendary sword, and the ancient, powerful spirit of the sword who manifests as a beautiful, warrior woman.',
    plotSynopsis: 'Kaelen is a gifted blacksmith, but when he quenches his masterpiece in a magical spring, he awakens Anya, the sword\'s soul. She is a warrior, bound to serve the one who wields her. He is a pacifist, horrified at the idea of using her for violence. She teaches him to be strong, and he teaches her to be gentle. Their love is a paradox, a connection between a creator and his creation. But the dark lord the sword was forged to defeat is rising again, and they must embrace their destiny.',
    keyTropes: ['paranormal-romance', 'fantasy', 'magic-weapon', 'forbidden-love'],
    desiredTone: 'Epic, adventurous, and romantic.',
    approxWordCount: 2800,
    coverImagePrompt: 'A handsome blacksmith holds a glowing, ornate sword. The ghostly, powerful figure of a warrior woman emerges from the blade, her hand on his shoulder. A detailed, epic fantasy illustration. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 143
  {
    titleIdea: 'The Billionaire\'s Homecoming',
    subgenre: 'billionaire',
    characterNames: ['Sarah', 'James'],
    mainCharacters: 'A small-town librarian, and the billionaire tech mogul who was her high school nemesis, who returns to their hometown after a corporate scandal.',
    plotSynopsis: 'James comes home to hide from the media, expecting a hero\'s welcome. Instead, he finds his old rival, Sarah, who is not impressed by his fame or fortune. He is bored and starts a "project" to modernize her library. Their old rivalry sparks again, but underneath the witty insults, they find a new respect for each other. He discovers the simple joys of home, and she sees the vulnerable man behind the headlines. But his scandal follows him, threatening to destroy the new life he is building.',
    keyTropes: ['billionaire', 'enemies-to-lovers', 'hometown-romance', 'second-chance'],
    desiredTone: 'Witty, charming, and heartwarming.',
    approxWordCount: 2600,
    coverImagePrompt: 'A woman on a library ladder glares down at a handsome man in an expensive suit who is holding a stack of books with a smirk. A cozy, small-town library is the setting. A fun, charming digital illustration. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 144
  {
    titleIdea: 'The Place We Used to Know',
    subgenre: 'second-chance',
    characterNames: ['Jenna', 'Mark'],
    mainCharacters: 'Two high school sweethearts who inherit a rundown drive-in movie theater from a beloved mutual mentor.',
    plotSynopsis: 'Jenna and Mark haven\'t spoken since their messy breakup. Now they are co-owners of the Starlight Drive-in, a place full of memories. They clash over what to do with it. He wants to sell; she wants to restore it. The will stipulates they must run it together for one summer. As they work to get the old projector running and serve popcorn to a new generation, they are forced to confront their past and the love that still lingers. The magic of the movies gives them a second chance at their own happy ending.',
    keyTropes: ['second-chance', 'hometown-romance', 'forced-proximity', 'nostalgia'],
    desiredTone: 'Nostalgic, sweet, and cinematic.',
    approxWordCount: 2500,
    coverImagePrompt: 'A man and a woman are standing by a vintage car at a drive-in movie theater, silhouetted by the light of the giant screen. They are looking at each other, not the movie. A warm, nostalgic digital painting with a retro feel. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 145
  {
    titleIdea: 'The Chocolatier and the Cardiologist',
    subgenre: 'contemporary',
    characterNames: ['Juliette', 'Dr. Ben Carter'],
    mainCharacters: 'A passionate, artisanal chocolatier who believes chocolate is its own food group, and the handsome, health-conscious cardiologist whose office is in her building.',
    plotSynopsis: 'Juliette\'s decadent chocolate shop is a temptation Dr. Carter warns his patients about. Their public feud over sugar and health is legendary. But when he tries one of her dark chocolate creations, he is captivated. He finds himself drawn to her passion and joie de vivre, a stark contrast to his own regimented life. A secret, sweet romance begins, but their very public, opposing viewpoints threaten to give them both professional indigestion.',
    keyTropes: ['opposites-attract', 'enemies-to-lovers', 'foodie-romance', 'comedy'],
    desiredTone: 'Sweet, funny, and delicious.',
    approxWordCount: 2400,
    coverImagePrompt: 'A woman in a baker\'s apron offers a piece of chocolate to a handsome man in a doctor\'s coat. He looks tempted but conflicted. Her shop is colorful and decadent; his office visible behind him is sterile and white. A bright, humorous digital illustration. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 146
  {
    titleIdea: 'The Queen\'s Alchemist',
    subgenre: 'historical',
    characterNames: ['Queen Elizabeth I', 'John Dee'],
    mainCharacters: 'The powerful, intelligent Queen of England, and her brilliant, enigmatic court advisor who dabbles in science and alchemy.',
    plotSynopsis: 'Elizabeth relies on John Dee\'s counsel, a man whose mind straddles the line between science and magic. Their relationship is one of deep intellectual intimacy and trust, a partnership that fuels her successful reign. But their closeness is a source of court gossip and political danger. Their love, if it can be called that, is a secret they must guard with their lives, a forbidden connection between a queen and her subject that could change the course of history.',
    keyTropes: ['historical-romance', 'forbidden-love', 'political-intrigue', 'slow-burn'],
    desiredTone: 'Intellectual, intense, and dramatic.',
    approxWordCount: 3000,
    coverImagePrompt: 'Queen Elizabeth I stands by a large globe in her study, looking intently at a man who is demonstrating an alchemical process with glassware and strange charts. The mood is secret and intimate. A classic, detailed oil painting. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 147
  {
    titleIdea: 'The Soul in the Stone',
    subgenre: 'paranormal',
    characterNames: ['Callum', 'Briar'],
    mainCharacters: 'A Scottish stonemason who can hear the memories of the stones he works with, and the beautiful, mysterious woman who hires him to restore a ruined castle with a dark past.',
    plotSynopsis: 'Callum\'s gift is a heavy burden. When he begins work on Castle Blackwood, the stones scream with a violent history. He is drawn to his enigmatic employer, Briar, but the stones tell him she is not what she seems. She is a centuries-old guardian, bound to the castle and tasked with keeping a powerful, dark entity imprisoned within its walls. The restoration work is weakening the prison. Callum and Briar must combine his gift and her power to reinforce the magical wards, their love a beacon of light against the encroaching darkness.',
    keyTropes: ['paranormal-romance', 'gothic', 'mystery', 'curse'],
    desiredTone: 'Atmospheric, romantic, and suspenseful.',
    approxWordCount: 2800,
    coverImagePrompt: 'A handsome stonemason touches the wall of a ruined castle, his eyes closed in concentration. The ghostly figure of a beautiful woman stands behind him, her hand on his shoulder. A moody, atmospheric fantasy illustration. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 148
  {
    titleIdea: 'The Billionaire\'s Fake Wedding',
    subgenre: 'billionaire',
    characterNames: ['Olivia', 'Leo'],
    mainCharacters: 'A struggling wedding planner, and the charming billionaire who hires her to plan a lavish, fake wedding to flush out a corporate saboteur.',
    plotSynopsis: 'Leo suspects someone on his board is leaking information. His plan is to announce a fake wedding, with his "fiancée" being a closely guarded secret, to see who tries to sabotage the "merger" of families. He hires Olivia to plan the most over-the-top wedding of the year. As they work together, tasting cakes and choosing flowers, their fake wedding plans lead to very real feelings. But the saboteur is real, and their fake wedding is about to become very dangerous.',
    keyTropes: ['billionaire', 'fake-relationship', 'suspense', 'workplace-romance'],
    desiredTone: 'Fun, glamorous, and thrilling.',
    approxWordCount: 2600,
    coverImagePrompt: 'A woman with a clipboard and a headset looks stressed as she directs caterers at a lavish wedding reception. A handsome man in a tuxedo whispers something in her ear, making her laugh. A sleek, modern digital illustration. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 149
  {
    titleIdea: 'The Inn at Second Chances',
    subgenre: 'second-chance',
    characterNames: ['Annie', 'Jake'],
    mainCharacters: 'A woman who quits her high-stress corporate job to buy a quaint, rundown inn in Vermont, and her college ex-boyfriend, who is the handsome local contractor she hires to fix it.',
    plotSynopsis: 'Annie is in over her head. The inn is a money pit. Jake is the only contractor in town, and their reunion is awkward. The pain of their breakup is still fresh. As they work to restore the inn, they also begin to repair their relationship, rediscovering the people they were before life got in the way. The inn becomes a place of second chances, not just for the building, but for their love story.',
    keyTropes: ['second-chance', 'hometown-romance', 'forced-proximity', 'fixer-upper'],
    desiredTone: 'Heartwarming, charming, and romantic.',
    approxWordCount: 2500,
    coverImagePrompt: 'A man and a woman are painting a sign for a charming, cozy inn in Vermont. They are laughing, with a little bit of paint on their faces. The autumn foliage is beautiful behind them. A warm, storybook illustration. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 150
  {
    titleIdea: 'The Virtuoso and the Violin Maker',
    subgenre: 'contemporary',
    characterNames: ['Katarina', 'Matteo'],
    mainCharacters: 'A world-famous, demanding concert violinist, and the quiet, brilliant violin maker from Cremona she commissions to make her a new instrument.',
    plotSynopsis: 'Katarina\'s priceless Stradivarius has been damaged. She goes to Matteo, a luthier from a long line of masters, known for his skill and his temperament. They clash immediately. She is a perfectionist; he is an artist who works on his own schedule. Their arguments over the type of wood and varnish are legendary. But as he crafts the violin, he pours his soul into the instrument, and she recognizes her own passion in his work. The music they create together is a love song, a perfect harmony of their two worlds.',
    keyTropes: ['opposites-attract', 'artistic-collaboration', 'slow-burn', 'perfectionist'],
    desiredTone: 'Passionate, intense, and artistic.',
    approxWordCount: 2700,
    coverImagePrompt: 'In a dusty, sunlit workshop, a man carefully carves the scroll of a violin. A woman with a violin case stands in the doorway, watching him with a mixture of impatience and fascination. A classic, realistic digital painting with a focus on light and detail. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 151
  {
    titleIdea: 'The Highwaywoman\'s Heart',
    subgenre: 'historical',
    characterNames: ['"Mad" Nell', 'Lord Julian'],
    mainCharacters: 'A notorious female highwayman who robs the rich to feed the poor, and the handsome, reform-minded magistrate sent to catch her.',
    plotSynopsis: 'Lord Julian is intrigued by the legend of Mad Nell. He goes undercover to infiltrate her gang. He expects a hardened criminal but finds a charismatic, principled woman forced into a life of crime. He is drawn to her cause and her courage. She is suspicious of the charming newcomer but finds herself trusting him. Their love is a dangerous game of cat and mouse, with their loyalties and their lives on the line.',
    keyTropes: ['historical-romance', 'enemies-to-lovers', 'undercover', 'robin-hood-figure'],
    desiredTone: 'Adventurous, rebellious, and romantic.',
    approxWordCount: 2800,
    coverImagePrompt: 'A woman in breeches and a mask, holding two pistols, stands on a fallen log in a forest, looking down at a handsome man in fine clothes who is looking up at her with a wry smile. A dramatic, painterly digital illustration. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 152
  {
    titleIdea: 'The Heart of the Gorgon',
    subgenre: 'paranormal',
    characterNames: ['Dr. Alistair Reid', 'Medusa'],
    mainCharacters: 'A handsome, kind classics professor who is cursed to turn to stone if he ever finds true love, and the lonely, beautiful gorgon living in isolation who is the only one who can look at him without turning him to stone.',
    plotSynopsis: 'Alistair discovers the legend of a gorgon and seeks her out, hoping her stony gaze can counteract his curse. He finds Medusa, not a monster, but a sad, lonely woman. Because of his curse, he is immune to her power, the only man who can look at her. They find solace and a deep connection in their shared curse. Their love is a tragic paradox. To be together, he must never truly love her, or he will be lost to her forever.',
    keyTropes: ['paranormal-romance', 'mythology', 'tragic-love', 'curse'],
    desiredTone: 'Tragic, beautiful, and deeply romantic.',
    approxWordCount: 2900,
    coverImagePrompt: 'A handsome man gently touches the face of a beautiful woman with snakes for hair. They are in a garden filled with life-like statues of men. A beautiful, tragic fantasy painting in a classical style. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 153
  {
    titleIdea: 'The Billionaire\'s Blind Date',
    subgenre: 'billionaire',
    characterNames: ['Chloe', 'Max'],
    mainCharacters: 'A quirky, down-to-earth librarian, and the city\'s most eligible billionaire, who are set up on a blind date by their meddling grandmothers.',
    plotSynopsis: 'Chloe and Max are horrified. They agree to one date, just to appease their grandmothers. The date is a disaster of spilled wine and awkward conversation. They agree to pretend it went well to get their grandmothers off their backs. Their fake "thank you" text turns into a real conversation. They discover, away from the pressure of the date, that they have a real connection. A secret romance begins, hidden from their grandmothers and the world.',
    keyTropes: ['billionaire', 'blind-date', 'opposites-attract', 'secret-romance'],
    desiredTone: 'Charming, funny, and sweet.',
    approxWordCount: 2400,
    coverImagePrompt: 'A woman and a man are sitting at a fancy restaurant table, both looking extremely uncomfortable. Two mischievous-looking grandmothers are peeking at them from behind a large potted plant. A bright, humorous digital illustration. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 154
  {
    titleIdea: 'The Flight of a Second Chance',
    subgenre: 'second-chance',
    characterNames: ['Piper', 'Gavin'],
    mainCharacters: 'Two rival bush pilots in Alaska who were once married, who are forced to work together to rescue a stranded group of hikers.',
    plotSynopsis: 'Piper and Gavin\'s divorce was as turbulent as the Alaskan weather. Now, they are the only two pilots who can handle the dangerous rescue mission. The forced proximity in the cramped cockpit is filled with biting remarks and unresolved tension. As they battle the elements, they are reminded of the formidable team they once were. The life-or-death situation forces them to rely on each other and confront the reasons their marriage crashed, giving their love a second chance to fly.',
    keyTropes: ['second-chance', 'reconciliation-romance', 'adventure', 'forced-proximity'],
    desiredTone: 'Adventurous, dramatic, and emotional.',
    approxWordCount: 2700,
    coverImagePrompt: 'A man and a woman are in the cockpit of a small plane, flying through a snowstorm over the Alaskan wilderness. They are looking at each other, their expressions intense. A dramatic, cinematic digital painting. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 155
  {
    titleIdea: 'The Perfumer and the Detective',
    subgenre: 'contemporary',
    characterNames: ['Genevieve', 'Detective Miller'],
    mainCharacters: 'A brilliant perfumer who can identify any scent, and the gruff, no-nonsense detective who needs her help to solve a series of crimes where the only clue is a unique fragrance.',
    plotSynopsis: 'Genevieve is drawn into a world of crime when Detective Miller asks for her help. Her refined senses and artistic temperament clash with his gritty, logical world. He thinks she\'s a flake; she thinks he has no soul. But her nose is a secret weapon, leading them through the city\'s high-end boutiques and seedy underbelly. Their professional partnership becomes a slow-burn romance as they chase a killer who uses perfume as a calling card.',
    keyTropes: ['opposites-attract', 'crime-solving-duo', 'slow-burn', 'suspense'],
    desiredTone: 'Sleek, suspenseful, and sophisticated.',
    approxWordCount: 2600,
    coverImagePrompt: 'A woman with her eyes closed smells a piece of fabric held by a detective in a trench coat. They are in a moody, atmospheric crime scene. A modern, noir-inspired digital painting. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 156
  {
    titleIdea: 'The Curse of the Pharaoh',
    subgenre: 'historical',
    characterNames: ['Evelyn', 'Lord Carrington'],
    mainCharacters: 'A brilliant, overlooked female Egyptologist in the 1920s, and the dashing, adventurous lord who funds her expedition to find a lost tomb.',
    plotSynopsis: 'Evelyn has a theory about a forgotten queen\'s tomb, but no one will listen. Lord Carrington, a thrill-seeker, is intrigued by her passion and funds her dig. They travel to Egypt, their intellectual partnership turning into a romance amidst the desert sands. But when they find the tomb, they unleash a curse that threatens to destroy them. They must solve the tomb\'s ancient riddle to break the curse and save their love.',
    keyTropes: ['historical-romance', 'adventure', 'curse', '1920s-setting'],
    desiredTone: 'Adventurous, romantic, and mysterious.',
    approxWordCount: 2800,
    coverImagePrompt: 'In a torch-lit Egyptian tomb, a woman is brushing sand from a hieroglyph while a handsome man in adventurer\'s gear looks on, a torch in his hand. The style is a classic, pulp-adventure movie poster. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 157
  {
    titleIdea: 'The Angel of the Battlefield',
    subgenre: 'paranormal',
    characterNames: ['Sergeant Michael', 'Aniela'],
    mainCharacters: 'A jaded army medic in a war-torn country, and the beautiful, mysterious woman who appears on the battlefield, healing soldiers with a touch.',
    plotSynopsis: 'Michael thinks he\'s hallucinating from stress. Aniela is an angel, a celestial being drawn to the immense suffering. She is not supposed to interfere, but she cannot stand by. He is a man of science; she is a being of faith. He tries to understand her; she is fascinated by his mortality. Their love is impossible, a connection between heaven and earth. But her superiors have noticed her transgression, and a darker force is drawn to her light.',
    keyTropes: ['paranormal-romance', 'angels', 'forbidden-love', 'wartime-romance'],
    desiredTone: 'Gritty, hopeful, and epic.',
    approxWordCount: 2900,
    coverImagePrompt: 'On a war-torn battlefield, a woman with faint, glowing wings kneels to heal a wounded soldier. He looks up at her with awe. The style is a realistic, dramatic painting with a touch of the divine. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 158
  {
    titleIdea: 'The Billionaire\'s Charity Case',
    subgenre: 'billionaire',
    characterNames: ['Holly', 'Gideon'],
    mainCharacters: 'A cheerful, optimistic woman who runs a failing animal shelter, and the grumpy, reclusive software billionaire who is her secret benefactor.',
    plotSynopsis: 'Holly\'s shelter is always miraculously saved by an anonymous donor. Gideon, a man who prefers animals to people, donates to her shelter but wants no contact. When his own rescue dog needs special training, his assistant hires Holly. He is horrified to meet the woman he has been anonymously supporting. He tries to maintain his grumpy facade, but her warmth and the joy she brings to his dog (and his life) are irresistible. He must reveal his secret, risking the one genuine connection he has.',
    keyTropes: ['billionaire', 'grumpy-sunshine', 'secret-identity', 'animal-lovers'],
    desiredTone: 'Heartwarming, charming, and funny.',
    approxWordCount: 2500,
    coverImagePrompt: 'A woman is teaching a large, fluffy dog to shake hands. A grumpy but handsome man watches from his minimalist, modern living room, a small smile on his face. A warm, charming digital illustration. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 159
  {
    titleIdea: 'The Last Song We Wrote',
    subgenre: 'second-chance',
    characterNames: ['Maya', 'Jesse'],
    mainCharacters: 'A successful country music star, and her former songwriting partner and ex-boyfriend, who she has to collaborate with for a career-reviving duet.',
    plotSynopsis: 'Maya is a star, but her music has lost its soul. Her label forces her to work with Jesse, the man who co-wrote all her early hits, the man she left behind. The reunion is tense. He is still a small-town musician, and he hasn\'t forgiven her. But when they start writing, the old magic is still there. The song becomes a way for them to say all the things they couldn\'t say before. They must decide if the song is a final goodbye or the first track on a new album together.',
    keyTropes: ['second-chance', 'musicians', 'forced-reunion', 'country-music'],
    desiredTone: 'Emotional, nostalgic, and heartfelt.',
    approxWordCount: 2600,
    coverImagePrompt: 'A woman in a glamorous stage outfit and a man with a guitar are sitting on stools in a recording studio, looking at each other with intense, unresolved emotion. A realistic, emotional digital painting. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 160
  {
    titleIdea: 'The Toymaker and the CEO',
    subgenre: 'contemporary',
    characterNames: ['Holly', 'Mr. Harrington'],
    mainCharacters: 'A whimsical toymaker who runs a small, magical toy shop, and the ruthless CEO of a massive toy corporation who wants to buy her out.',
    plotSynopsis: 'Holly\'s shop is a local institution, filled with handmade, one-of-a-kind toys. Mr. Harrington, a man who only sees market share and profit margins, wants to acquire her brand. He goes to her shop himself to make the offer. He is baffled by her refusal and her "inefficient" business model. He keeps coming back, trying to understand her success, and finds himself charmed by the magic of her shop and the passion of its owner. He must choose between the biggest acquisition of his career and the woman who is teaching him how to play again.',
    keyTropes: ['opposites-attract', 'small-business-vs-corporate', 'grumpy-sunshine', 'christmas-romance-vibe'],
    desiredTone: 'Charming, magical, and heartwarming.',
    approxWordCount: 2400,
    coverImagePrompt: 'In a magical, cluttered toy shop, a woman shows a beautiful wooden toy soldier to a stern man in a suit. He is looking at the toy with a flicker of childhood wonder in his eyes. A warm, whimsical illustration style. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 161
  {
    titleIdea: 'The Pirate Queen\'s Revenge',
    subgenre: 'historical',
    characterNames: ['"Siren" Serena', 'Commodore James'],
    mainCharacters: 'A formidable female pirate captain seeking revenge on the man who betrayed her family, and the ambitious, by-the-book naval Commodore sent to hunt her down.',
    plotSynopsis: 'Serena is the terror of the Caribbean, a brilliant strategist. Commodore James is her opposite, a man of law and order. Their sea battles are legendary, a chess match of wits and cannons. When he finally captures her, he is surprised to find a woman of noble birth with a tragic past. As he transports her for trial, she tells him her story, and he realizes the man she is hunting is his own corrupt superior. They must form an unlikely alliance to expose the truth, their animosity turning into a grudging respect and a fiery, forbidden love.',
    keyTropes: ['historical-romance', 'enemies-to-lovers', 'pirates', 'revenge-plot'],
    desiredTone: 'Swashbuckling, adventurous, and dramatic.',
    approxWordCount: 2900,
    coverImagePrompt: 'A female pirate captain stands at the helm of her ship, sword in hand, glaring at a naval Commodore on an adjacent ship. The sea is rough between them. A dynamic, cinematic digital painting. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 162
  {
    titleIdea: 'The Gargoyle of Notre Dame',
    subgenre: 'paranormal',
    characterNames: ['Dr. Genevieve Laine', 'Bellec'],
    mainCharacters: 'An art historian studying the gargoyles of Notre Dame, and the ancient, sentient gargoyle who has watched over Paris for centuries.',
    plotSynopsis: 'Genevieve is fascinated by one gargoyle that seems different from the rest. Bellec has been stone for 800 years, but her presence awakens him. At night, he can leave his perch, and he secretly watches her work. He has seen all of human history and is lonely. He starts leaving her clues to a historical mystery hidden within the cathedral. She becomes obsessed with her "secret informant." Their unique friendship deepens into an impossible love, a connection between a mortal woman and a stone guardian.',
    keyTropes: ['paranormal-romance', 'gothic', 'immortal-love', 'mystery'],
    desiredTone: 'Atmospheric, romantic, and unique.',
    approxWordCount: 2700,
    coverImagePrompt: 'A woman stands on the rooftop of Notre Dame at night, looking up at a stone gargoyle. The gargoyle\'s eyes are glowing, and the city of Paris is spread out below. A moody, atmospheric digital painting. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 163
  {
    titleIdea: 'The Billionaire\'s Publicist',
    subgenre: 'billionaire',
    characterNames: ['Ava', 'Cole'],
    mainCharacters: 'A sharp, unflappable publicist, and her newest client: a handsome, reckless billionaire adventurer who is a PR nightmare.',
    plotSynopsis: 'Cole is famous for climbing mountains and crashing yachts. His investors are nervous. They hire Ava to clean up his image. Her job is to follow him on his latest adventure—a trek through the Amazon—and spin it into a story of corporate resilience. She is not an outdoors person. Their trip is a comedy of errors and genuine danger. She is infuriated by his recklessness but captivated by his passion for life. He is impressed by her toughness. Their professional relationship turns into a steamy jungle romance.',
    keyTropes: ['billionaire', 'workplace-romance', 'opposites-attract', 'adventure'],
    desiredTone: 'Fun, adventurous, and sexy.',
    approxWordCount: 2600,
    coverImagePrompt: 'A woman in inappropriate but stylish business attire looks exasperated as she tries to navigate a jungle vine bridge. A handsome man in adventurer\'s gear is laughing as he helps her. A vibrant, humorous digital painting. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 164
  {
    titleIdea: 'The Coffee Shop on Memory Lane',
    subgenre: 'second-chance',
    characterNames: ['Molly', 'Ryan'],
    mainCharacters: 'A woman who opens a coffee shop in her hometown, and her high school sweetheart, now a police officer, who she hasn\'t seen in ten years.',
    plotSynopsis: 'Molly\'s coffee shop is her dream. Ryan is a regular, and their first reunion is a shock. He is quieter, more serious than she remembers. The easy chemistry they had is still there, but so is the pain of their past. As he becomes a fixture in her shop, they slowly reconnect, sharing stories of the years they spent apart. They must decide if they are brave enough to give their first love a second chance.',
    keyTropes: ['second-chance', 'hometown-romance', 'slow-burn', 'sweet-romance'],
    desiredTone: 'Charming, sweet, and nostalgic.',
    approxWordCount: 2400,
    coverImagePrompt: 'A female barista is smiling as she hands a cup of coffee to a handsome police officer in a charming, cozy coffee shop. A warm, realistic digital painting. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 165
  {
    titleIdea: 'The Stained-Glass Cipher',
    subgenre: 'contemporary',
    characterNames: ['Dr. Finn Russo', 'Seraphina'],
    mainCharacters: 'A symbologist who discovers a hidden code in the stained-glass windows of an old church, and the beautiful, enigmatic glass artist who is the last descendant of the window\'s creator.',
    plotSynopsis: 'Finn is convinced the windows lead to a historical treasure. Seraphina is protective of her family\'s legacy and dismisses his theories. But when a shadowy organization tries to steal one of the windows, she realizes he is right. They must work together, combining his knowledge of codes and her understanding of the glass, to solve the puzzle before their enemies do. Their intellectual quest becomes a thrilling adventure and a passionate romance.',
    keyTropes: ['treasure-hunt', 'suspense', 'art-mystery', 'intellectuals'],
    desiredTone: 'Clever, suspenseful, and romantic.',
    approxWordCount: 2700,
    coverImagePrompt: 'A man and a woman are looking up at a large, beautiful stained-glass window in a church. The sunlight is streaming through, casting colorful patterns on them. The window contains hidden symbols. A vibrant, detailed digital illustration. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 166
  {
    titleIdea: 'The Last Dragon Rider',
    subgenre: 'historical',
    characterNames: ['Brenna', 'Lord Valerius'],
    mainCharacters: 'A fierce young woman from a mountain clan who can communicate with dragons, and the cynical, battle-hardened knight sent by the king to demand a dragon for his army.',
    plotSynopsis: 'The king wants a dragon to win his war. Valerius thinks dragons are just beasts. Brenna knows they are intelligent beings. She refuses the king\'s demand. Valerius is ordered to take a dragon by force. He is humbled by the power and intelligence of the creatures, and by Brenna\'s courage. He realizes the king will destroy the dragons. He must choose between his king and his conscience, siding with Brenna to save the last dragons, their alliance forged in fire and love.',
    keyTropes: ['historical-fantasy', 'enemies-to-lovers', 'dragons', 'rebellion'],
    desiredTone: 'Epic, adventurous, and magical.',
    approxWordCount: 2900,
    coverImagePrompt: 'A woman with wild hair stands protectively in front of a magnificent, large dragon, facing a knight in full armor. The knight has a conflicted expression. The setting is a rugged mountain landscape. A detailed, epic fantasy illustration. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 167
  {
    titleIdea: 'The Succubus Next Door',
    subgenre: 'paranormal',
    characterNames: ['Liam', 'Lilith'],
    mainCharacters: 'A genuinely nice guy who is a relationship counselor, and the beautiful, charming new neighbor who is secretly a succubus who feeds on lust.',
    plotSynopsis: 'Liam is a firm believer in love and commitment. Lilith sees love as a weakness. She plans to make him her next meal, but his genuine kindness and insightful nature are disarming. He is immune to her usual charms. She finds herself in his office, pretending to be a client, to understand him better. She starts to feel emotions she has never known. He finds himself falling for his most challenging client. Their love is a battle between her nature and his nurture.',
    keyTropes: ['paranormal-romance', 'succubus', 'opposites-attract', 'forbidden-love'],
    desiredTone: 'Sexy, funny, and surprisingly emotional.',
    approxWordCount: 2600,
    coverImagePrompt: 'A handsome, friendly-looking man sits in a counselor\'s chair, looking thoughtfully at a beautiful, seductive woman who is lounging on the couch opposite him. She has a mischievous but also confused expression. A modern, stylish digital illustration. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 168
  {
    titleIdea: 'The Billionaire\'s Gambit',
    subgenre: 'billionaire',
    characterNames: ['Jasmine', 'Kian'],
    mainCharacters: 'A brilliant, competitive chess grandmaster, and the enigmatic, charming billionaire who challenges her to a high-stakes match.',
    plotSynopsis: 'Jasmine is the best in the world. Kian offers her a million-dollar prize for one match. The catch: it will be played over a week at his remote, luxurious estate. The match is a battle of minds, each move revealing more about their personalities. He is unpredictable and daring; she is logical and precise. Their intellectual sparring becomes a deep, personal connection. She discovers the match is not about money, but a complex courtship designed by a man who is used to getting what he wants.',
    keyTropes: ['billionaire', 'intellectual-rivals', 'slow-burn', 'forced-proximity'],
    desiredTone: 'Smart, sophisticated, and intense.',
    approxWordCount: 2700,
    coverImagePrompt: 'A man and a woman are sitting at a chessboard in a luxurious, modern library. They are looking at each other, not the board, their expressions intense. A sleek, cinematic digital painting. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 169
  {
    titleIdea: 'The Echo of a Love Song',
    subgenre: 'second-chance',
    characterNames: ['Grace', 'Noah'],
    mainCharacters: 'Two former members of a one-hit-wonder band who had a secret relationship, who are reunited for a documentary about the band twenty years later.',
    plotSynopsis: 'Grace is now a music teacher. Noah is a record producer. They haven\'t seen each other since the band imploded. The documentary forces them to revisit their past, the highs of fame and the lows of their secret breakup. Being in the same room is electric. They start writing music together again, just for fun. The song becomes about their second chance. They must decide if their love is just an echo of the past or a brand new hit.',
    keyTropes: ['second-chance', 'musicians', 'forced-reunion', 'nostalgia'],
    desiredTone: 'Emotional, nostalgic, and romantic.',
    approxWordCount: 2500,
    coverImagePrompt: 'A man and a woman, now in their 40s, are looking at an old photograph of their younger selves in a band. There is a mixture of sadness and fondness in their expressions. A realistic, emotional digital painting. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 170
  {
    titleIdea: 'The Mechanic and the Movie Star',
    subgenre: 'contemporary',
    characterNames: ['Gina', 'Liam'],
    mainCharacters: 'A savvy, no-nonsense car mechanic, and the handsome, A-list movie star whose vintage car breaks down outside her small-town garage.',
    plotSynopsis: 'Liam is stuck in town while Gina fixes his car. He is used to being pampered, but she treats him like any other customer. He is charmed by her authenticity and her skill. She is not impressed by his fame but finds herself drawn to the kind, normal guy beneath the movie star persona. Their small-town romance is a breath of fresh air for him, but his Hollywood life and the paparazzi are never far behind, threatening to ruin their simple happiness.',
    keyTropes: ['celebrity', 'opposites-attract', 'small-town', 'slow-burn'],
    desiredTone: 'Charming, funny, and heartwarming.',
    approxWordCount: 2400,
    coverImagePrompt: 'A woman in greasy overalls is working under the hood of a classic convertible. A handsome man, clearly a movie star, is leaning against the car, watching her with an amused, adoring expression. A bright, realistic digital painting. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 171
  {
    titleIdea: 'The Samurai\'s Heart',
    subgenre: 'historical',
    characterNames: ['Lady Mariko', 'Kenji'],
    mainCharacters: 'The intelligent daughter of a powerful Japanese daimyo in the 16th century, and the stoic, low-born samurai in her father\'s service.',
    plotSynopsis: 'Mariko is a gifted strategist, but as a woman, she can only advise her father in secret. Kenji is her personal guard, a man of unwavering loyalty and skill. He is in awe of her mind; she is drawn to his quiet strength. Their love is forbidden by the rigid code of their society. When a rival warlord threatens her family, Mariko\'s strategy and Kenji\'s sword are their only hope. They must fight for their home and their impossible love.',
    keyTropes: ['historical-romance', 'forbidden-love', 'samurai', 'class-difference'],
    desiredTone: 'Epic, honorable, and tragic.',
    approxWordCount: 3000,
    coverImagePrompt: 'In a beautiful Japanese garden with a cherry blossom tree, a lady in a fine kimono and a samurai in armor are standing a respectful distance apart, but their eyes are locked in an intense, emotional gaze. A beautiful, detailed painting in a classic Japanese style. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 172
  {
    titleIdea: 'The Heart is a Compass',
    subgenre: 'paranormal',
    characterNames: ['Finn', 'Isla'],
    mainCharacters: 'A man who has an internal, magical compass that points to his soulmate, and the free-spirited, wandering artist he has been following across the world.',
    plotSynopsis: 'Finn\'s compass has led him on a wild chase for years. He finally catches up with Isla in Lisbon. She is a beautiful, charming artist who never stays in one place for long. He is terrified to tell her the truth. He gets to know her, and they fall deeply in love. But his compass is a family curse: if he unites with his soulmate, one of them will lose their gift. He must choose between a lifetime of love with her and losing the very magic that led him to her.',
    keyTropes: ['paranormal-romance', 'fated-mates', 'curse', 'travel-romance'],
    desiredTone: 'Whimsical, romantic, and bittersweet.',
    approxWordCount: 2700,
    coverImagePrompt: 'A man is looking at a glowing, antique compass. The needle is pointing to a woman who is painting on an easel in a colorful street in Lisbon, her back to him. A vibrant, magical digital painting. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 173
  {
    titleIdea: 'The Billionaire\'s Butler Academy',
    subgenre: 'billionaire',
    characterNames: ['Penelope', 'Lord Ashworth'],
    mainCharacters: 'A resourceful young woman who enrolls in an elite butler academy to pay off her family\'s debt, and the handsome, demanding headmaster who is a secret billionaire.',
    plotSynopsis: 'Penelope is not from a world of silver service and etiquette. She clashes with the strict, traditional Lord Ashworth. He sees her as unrefined; she sees him as a snob. But her clever problem-solving and compassion make her a standout student. He finds himself bending the rules for her, his professional distance compromised by his growing admiration. Their forbidden student-teacher romance is a scandal that could ruin the academy and their futures.',
    keyTropes: ['billionaire', 'workplace-romance', 'enemies-to-lovers', 'forbidden-love'],
    desiredTone: 'Charming, sophisticated, and romantic.',
    approxWordCount: 2600,
    coverImagePrompt: 'A woman in a simple butler\'s uniform is trying to properly set a grand dining table. A handsome, impeccably dressed man is standing behind her, guiding her hands, their proximity causing a palpable tension. A sleek, elegant digital illustration. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 174
  {
    titleIdea: 'The Winter We Danced',
    subgenre: 'second-chance',
    characterNames: ['Isabelle', 'Alexei'],
    mainCharacters: 'Two former professional ballet partners who had a bitter falling out, who are reunited to choreograph a new production of The Nutcracker.',
    plotSynopsis: 'Isabelle and Alexei were dance royalty, their partnership legendary. Their breakup was just as dramatic. Now, their old ballet company needs them to save their season. The rehearsal studio is a battlefield of old resentments and unspoken feelings. But as they dance, their bodies remember the old intimacy and trust. They must choreograph a new future for themselves, a dance of forgiveness and a second chance at the love they thought was lost.',
    keyTropes: ['second-chance', 'dancers', 'forced-reunion', 'artistic-collaboration'],
    desiredTone: 'Emotional, graceful, and passionate.',
    approxWordCount: 2500,
    coverImagePrompt: 'A man and a woman, both in ballet attire, are in a dramatic dance pose in a rehearsal studio. They are looking at each other with a mixture of anger, passion, and longing. A beautiful, dynamic digital painting. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 175
  {
    titleIdea: 'The Bookbinder and the Marquess',
    subgenre: 'contemporary',
    characterNames: ['Clara', 'Lord Nathaniel'],
    mainCharacters: 'A quiet, meticulous rare book restorer, and the handsome, charming Marquess who brings her a priceless, damaged family bible to repair.',
    plotSynopsis: 'Clara is a master of her craft. Nathaniel is a charming aristocrat, but she senses a sadness beneath his polished exterior. As she painstakingly repairs the ancient book, she discovers a series of secret, coded letters hidden in the binding, revealing a tragic family history. She and Nathaniel work together to decipher the letters, uncovering a secret that changes everything he thought he knew about his family. Their shared quest brings them together, a gentle romance blooming amidst the scent of old paper and leather.',
    keyTropes: ['slow-burn', 'mystery', 'intellectuals', 'aristocracy'],
    desiredTone: 'Gentle, intelligent, and romantic.',
    approxWordCount: 2600,
    coverImagePrompt: 'In a cozy, dusty workshop, a woman is carefully working on an old, ornate book. A handsome man in a tweed jacket is watching her, a soft smile on his face. Sunlight streams through a window. A warm, realistic digital painting. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 176
  {
    titleIdea: 'The Queen\'s Champion',
    subgenre: 'historical',
    characterNames: ['Queen Guinevere', 'Sir Lancelot'],
    mainCharacters: 'The beautiful, intelligent queen of a powerful kingdom, and the noble, handsome knight who is her husband\'s best friend and her personal champion.',
    plotSynopsis: 'Guinevere loves her husband, the King, but he is a man of politics, not passion. Lancelot is her confidant, her protector, the one man who sees her as a woman, not just a queen. Their love is pure but forbidden, a silent understanding that is the soul of the court\'s honor and its greatest threat. Their loyalty to the king wars with their love for each other, a tragic romance that will become the stuff of legend.',
    keyTropes: ['historical-romance', 'forbidden-love', 'love-triangle', 'tragic-romance'],
    desiredTone: 'Epic, tragic, and noble.',
    approxWordCount: 3000,
    coverImagePrompt: 'A beautiful queen in medieval attire stands on a balcony, looking down at a handsome knight in shining armor who is looking up at her. The king is visible in the background, observing them with a thoughtful expression. A classic, detailed fantasy painting in the pre-Raphaelite style. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 177
  {
    titleIdea: 'The Siren\'s Call',
    subgenre: 'paranormal',
    characterNames: ['Professor Ben Carter', 'Cora'],
    mainCharacters: 'A marine biologist who has discovered a new, intelligent aquatic species, and the beautiful, enigmatic woman who is a member of that species, a modern-day siren.',
    plotSynopsis: 'Ben\'s discovery could change science forever. Cora reveals herself to him, trying to make him understand that her people are not specimens to be studied. She is curious about his world, and he is captivated by hers. Their connection is a bridge between two worlds. But his research has been leaked, and a powerful corporation wants to capture and exploit her people. Ben must choose between his career and protecting the woman he loves and her underwater world.',
    keyTropes: ['paranormal-romance', 'sirens', 'forbidden-love', 'science-vs-magic'],
    desiredTone: 'Magical, wondrous, and suspenseful.',
    approxWordCount: 2800,
    coverImagePrompt: 'A man in a wetsuit is underwater, looking in awe at a beautiful woman with long, flowing hair and a shimmering mermaid tail. They are in a beautiful, glowing coral reef. A realistic, magical digital painting. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 178
  {
    titleIdea: 'The Billionaire\'s Proxy',
    subgenre: 'billionaire',
    characterNames: ['Alice', 'Liam'],
    mainCharacters: 'A struggling artist who is hired to be a "proxy," attending high-society events for a reclusive tech billionaire, and the billionaire\'s handsome head of security who must train her.',
    plotSynopsis: 'Alice needs the money. The billionaire is too anxious for public events. Her job is to wear an earpiece while Liam feeds her information. She is the face; he is the voice. Their professional relationship is all business, but their constant communication creates a strange intimacy. She starts to fall for the man in her ear. When the billionaire decides to make a public appearance, her job is over, and she must confront her feelings for the man she has never properly met, but knows better than anyone.',
    keyTropes: ['billionaire', 'cyrano-de-bergerac', 'workplace-romance', 'slow-burn'],
    desiredTone: 'Unique, modern, and romantic.',
    approxWordCount: 2600,
    coverImagePrompt: 'A beautiful woman in an evening gown at a party has a hand to her ear, listening to a small earpiece, a small smile on her face. The image is split, showing a handsome man in a security control room speaking into a microphone. A sleek, modern graphic illustration. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 179
  {
    titleIdea: 'The Autumn of Our Love',
    subgenre: 'second-chance',
    characterNames: ['Carol', 'David'],
    mainCharacters: 'Two widowed sixty-somethings whose children are getting married to each other.',
    plotSynopsis: 'Carol and David meet at their children\'s engagement party. They are from different worlds but find a surprising connection in their shared experience of love and loss. As they help plan the wedding, their friendship deepens into a gentle, mature romance. Their children are horrified at first, but soon see the happiness they bring each other. Theirs is a love story about second chances, proving that it\'s never too late to find a new beginning.',
    keyTropes: ['later-in-life-romance', 'second-chance', 'meet-cute-at-wedding', 'gentle-romance'],
    desiredTone: 'Heartwarming, mature, and poignant.',
    approxWordCount: 2300,
    coverImagePrompt: 'An older man and woman are smiling as they dance together at a wedding reception. The happy young couple is visible in the background. A warm, realistic digital painting. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 180
  {
    titleIdea: 'The Cartographer and the Explorer',
    subgenre: 'contemporary',
    characterNames: ['Lila', 'Nathan'],
    mainCharacters: 'A meticulous, stay-at-home cartographer who creates beautiful, artistic maps, and a rugged, famous explorer who commissions her for his next expedition.',
    plotSynopsis: 'Lila travels the world through her maps. Nathan travels it with his boots. He needs a map for a place that doesn\'t officially exist, a mythical lost city in the Amazon. Their collaboration is a clash of styles. He is all action; she is all detail. As they work together via video call, their intellectual connection becomes a powerful romance. When his expedition goes silent, she must leave her quiet studio and use her own maps to venture into the jungle and save the man she has fallen for.',
    keyTropes: ['opposites-attract', 'adventure-romance', 'long-distance', 'intellectuals'],
    desiredTone: 'Adventurous, smart, and romantic.',
    approxWordCount: 2700,
    coverImagePrompt: 'The image is split. On one side, a woman is in a cozy workshop, drawing a map. On the other side, a handsome man is hacking through a dense jungle. They are both looking towards the center, as if they can see each other. A clever, graphic illustration style. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 181
  {
    titleIdea: 'The Spymaster\'s Daughter',
    subgenre: 'historical',
    characterNames: ['Lady Juliana', 'Sebastian'],
    mainCharacters: 'The sharp-witted daughter of Queen Elizabeth\'s spymaster, Sir Francis Walsingham, and the handsome, charming poet who is a suspected double agent.',
    plotSynopsis: 'Juliana is a key part of her father\'s intelligence network, a woman of shadows and secrets. She is assigned to get close to Sebastian, a poet whose verses may contain coded messages for Spain. She finds herself captivated by his art and his mind. He is drawn to her intelligence, a woman who is his intellectual equal. Their love is a dangerous game of deception, where every word has two meanings, and trusting the wrong person means death.',
    keyTropes: ['historical-romance', 'espionage', 'political-intrigue', 'tudors'],
    desiredTone: 'Intelligent, suspenseful, and intense.',
    approxWordCount: 2900,
    coverImagePrompt: 'In a shadowy Tudor-era room, a woman and a man are leaning close together over a book of poetry. She is pointing at a line of text, her expression suspicious. He is watching her, a charming, unreadable smile on his face. A classic, detailed oil painting. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 182
  {
    titleIdea: 'The Last Shaman',
    subgenre: 'paranormal',
    characterNames: ['Dr. Eva Rostova', 'Kael'],
    mainCharacters: 'A cynical anthropologist studying a remote Siberian tribe, and the tribe\'s handsome, enigmatic young shaman who can walk in the spirit world.',
    plotSynopsis: 'Eva believes all magic has a rational explanation. Kael is the guardian of his people\'s ancient traditions. He sees her skepticism as a threat. But when a modern disease threatens his tribe, he must trust her with his secrets. He takes her into the spirit world to find a cure. She is confronted with a reality that shatters her scientific beliefs. Their two worlds collide, and a powerful love blooms, a connection that could save his people but ostracize her from her own world.',
    keyTropes: ['paranormal-romance', 'science-vs-magic', 'shamanism', 'forbidden-love'],
    desiredTone: 'Mystical, atmospheric, and epic.',
    approxWordCount: 2800,
    coverImagePrompt: 'A woman in modern winter gear looks in awe as a handsome man in tribal furs holds his hand out, a glowing spirit animal, like a bear or a wolf, forming from the light. They are in a vast, snowy Siberian landscape. A beautiful, epic fantasy painting. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 183
  {
    titleIdea: 'The Billionaire\'s Escape',
    subgenre: 'billionaire',
    characterNames: ['Maggie', 'Ash'],
    mainCharacters: 'A cheerful, small-town baker, and a stressed, burnt-out tech billionaire who fakes his own disappearance and ends up working in her bakery.',
    plotSynopsis: 'Ash is tired of his life. He leaves it all behind and, through a series of mishaps, ends up as the new dishwasher in Maggie\'s bakery. He is terrible at it. Maggie is patient and kind, teaching him the simple joy of working with his hands. He falls for her and the simple life. But his old life is not so easy to escape. A private investigator hired by his company tracks him down, and his secret is revealed, threatening to destroy the new life and the new love he has found.',
    keyTropes: ['billionaire', 'secret-identity', 'small-town', 'opposites-attract'],
    desiredTone: 'Heartwarming, funny, and charming.',
    approxWordCount: 2500,
    coverImagePrompt: 'A handsome man, clearly out of place in an expensive but disheveled suit, is awkwardly washing dishes in a cozy bakery kitchen. A woman in an apron is laughing as she watches him. A warm, humorous digital illustration. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 184
  {
    titleIdea: 'The Letterbox on the Moors',
    subgenre: 'second-chance',
    characterNames: ['Fiona', 'Ewan'],
    mainCharacters: 'Two childhood friends who grew up on the Scottish moors and communicated through a secret letterbox, who are reunited as adults when she returns to sell her family\'s home.',
    plotSynopsis: 'Fiona and Ewan were inseparable until her family moved away. On her last day, she left a final letter in their secret spot. Now, years later, she returns and finds the letterbox is still there, and so is Ewan, now the local veterinarian. He never forgot her. As they reconnect, they discover the letter she left was never read, and the misunderstanding it could have cleared up has shadowed their lives. They have a second chance to find their way back to each other, guided by the memory of their childhood love.',
    keyTropes: ['second-chance', 'childhood-sweethearts', 'hometown-romance', 'unspoken-feelings'],
    desiredTone: 'Nostalgic, atmospheric, and deeply romantic.',
    approxWordCount: 2600,
    coverImagePrompt: 'A man and a woman are standing on a windswept Scottish moor, looking at a small, hidden wooden box at the base of a standing stone. They are looking at each other, a world of emotion in their eyes. A beautiful, painterly digital illustration. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 185
  {
    titleIdea: 'The Sword Dancer and the Scholar',
    subgenre: 'contemporary',
    characterNames: ['Rory', 'Dr. Alistair Finch'],
    mainCharacters: 'A charismatic, modern-day sword dancer keeping an ancient tradition alive, and the quiet, handsome folklore professor who comes to his small Scottish village to study him.',
    plotSynopsis: 'Rory\'s sword dancing is a powerful, masculine art. Alistair is a man of books and theories. He is fascinated by the history of the dance and the man who performs it. Rory is amused by the stuffy professor and his endless questions. Their interviews become conversations, and their professional relationship becomes a surprising, powerful romance. They must navigate the clash of their two worlds, the academic and the traditional, to build a future together.',
    keyTropes: ['opposites-attract', 'intellectuals', 'cultural-heritage', 'slow-burn'],
    desiredTone: 'Earthy, smart, and passionate.',
    approxWordCount: 2500,
    coverImagePrompt: 'A handsome man in a kilt is performing a traditional Scottish sword dance. Another man in a tweed jacket is watching from the sidelines, a thoughtful, captivated expression on his face. The setting is a rustic village green. A realistic, dynamic digital painting. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 186
  {
    titleIdea: 'The Last Viking',
    subgenre: 'historical',
    characterNames: ['Lady Astrid', 'Bjorn'],
    mainCharacters: 'A Saxon noblewoman in 11th-century England, and the fierce Viking warrior who is shipwrecked on her lands after the Battle of Stamford Bridge.',
    plotSynopsis: 'Astrid finds the wounded Viking, Bjorn, on her beach. He is an enemy of her people, but her healer\'s oath compels her to save him. She hides him in a remote cottage, and as she nurses him back to health, their enmity turns to a grudging respect, and then a forbidden love. He is a man without a country, and she is betrothed to a cruel Norman lord. Their love is a rebellion against the forces of history that are changing their world forever.',
    keyTropes: ['historical-romance', 'enemies-to-lovers', 'forbidden-love', 'healing-journey'],
    desiredTone: 'Gritty, epic, and passionate.',
    approxWordCount: 2900,
    coverImagePrompt: 'In a rustic Saxon hut, a woman is tending to the wounds of a large, powerful Viking warrior. They are looking at each other, the tension between them palpable. A realistic, dramatic oil painting. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 187
  {
    titleIdea: 'The Heart of the Djinn',
    subgenre: 'paranormal',
    characterNames: ['Zahra', 'Kael'],
    mainCharacters: 'A clever, resourceful young woman in ancient Baghdad, and the powerful, handsome djinn she accidentally releases from a puzzle box.',
    plotSynopsis: 'Zahra is a thief, and the puzzle box was supposed to hold jewels. Instead, she releases Kael, a djinn who has been imprisoned for a thousand years. He is bound to grant her three wishes, but he is cynical and bitter. She is not interested in wealth; her wishes are clever and compassionate. He is surprised by her goodness. She is drawn to the lonely soul beneath his power. Their love is a dangerous magic, and the sorcerer who imprisoned him is still seeking the box.',
    keyTropes: ['paranormal-romance', 'djinn', 'forbidden-love', 'fantasy'],
    desiredTone: 'Magical, adventurous, and exotic.',
    approxWordCount: 2800,
    coverImagePrompt: 'A young woman in a colorful Arabian marketplace looks up in awe as a handsome, powerful djinn materializes from a small, ornate box she is holding. A vibrant, magical fantasy illustration. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 188
  {
    titleIdea: 'The Billionaire\'s Vineyard',
    subgenre: 'billionaire',
    characterNames: ['Isabella', 'Gianni'],
    mainCharacters: 'A passionate, third-generation winemaker whose family vineyard in Tuscany is failing, and the ruthless Italian-American billionaire who wants to buy her land for a luxury resort.',
    plotSynopsis: 'Isabella will do anything to save her legacy. Gianni sees the land as an undervalued asset. He arrives to close the deal but is captivated by the beauty of the vineyard and the fierce passion of the woman who runs it. He makes her a deal: he will give her one season to turn a profit. He stays, intending to watch her fail, but ends up working alongside her, his hands in the soil. He rediscovers his Italian roots and falls for the woman who is teaching him the value of legacy over profit.',
    keyTropes: ['billionaire', 'enemies-to-lovers', 'foodie-romance', 'cultural-heritage'],
    desiredTone: 'Lush, passionate, and heartwarming.',
    approxWordCount: 2700,
    coverImagePrompt: 'A woman with wine-stained hands glares at a handsome man in an expensive suit in the middle of a beautiful Tuscan vineyard. He is looking at her with an amused, intrigued expression. A warm, painterly digital illustration. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 189
  {
    titleIdea: 'The Christmas We Never Had',
    subgenre: 'second-chance',
    characterNames: ['Noelle', 'Chris'],
    mainCharacters: 'Two high school sweethearts who were supposed to go to the Christmas Eve dance together but were kept apart by a snowstorm, who are reunited ten years later when they are both snowed in at the same airport on Christmas Eve.',
    plotSynopsis: 'Noelle and Chris are strangers, stuck at the airport. They start talking and realize who the other is. The missed dance was the "what if" that has haunted both their lives. The snowstorm gives them a second chance. As they share stories of the last ten years, they rediscover the connection they thought was lost. The airport becomes their own magical Christmas world, and they must decide if their love is just a bit of holiday magic or something that can last after the snow melts.',
    keyTropes: ['second-chance', 'holiday-romance', 'forced-proximity', 'what-if'],
    desiredTone: 'Nostalgic, magical, and romantic.',
    approxWordCount: 2400,
    coverImagePrompt: 'A man and a woman are sitting on the floor of a deserted airport terminal at night, sharing a bag of vending machine snacks and laughing. Christmas decorations are visible in the background. A warm, charming digital illustration. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 190
  {
    titleIdea: 'The Puppeteer and the Reporter',
    subgenre: 'contemporary',
    characterNames: ['Gideon', 'Clara'],
    mainCharacters: 'A reclusive, brilliant puppeteer who creates breathtakingly life-like marionettes for his one-man shows, and the cheerful, persistent journalist who wants to do a feature story on him.',
    plotSynopsis: 'Gideon never shows his face, communicating only through his puppets. Clara is determined to get the interview. She is relentless, attending every show, sending him charming letters. He is intrigued by her persistence and starts to communicate with her through his puppets, a witty, anonymous correspondence. She finds herself falling for the soul behind the strings. He must find the courage to step out from behind the curtain and meet the woman who sees the real him.',
    keyTropes: ['slow-burn', 'mystery-man', 'artistic-passion', 'opposites-attract'],
    desiredTone: 'Whimsical, charming, and unique.',
    approxWordCount: 2500,
    coverImagePrompt: 'A woman is in the audience of a small theater, looking up with a smile at a handsome, life-like marionette on the stage. The puppeteer is hidden in the shadows above. A magical, atmospheric digital painting. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 191
  {
    titleIdea: 'The Pirate Lord\'s Daughter',
    subgenre: 'historical',
    characterNames: ['Lady Evelyn', 'Captain "Rogue"'],
    mainCharacters: 'The sheltered daughter of a governor in the Caribbean, and the charming, infamous pirate captain her father is obsessed with catching.',
    plotSynopsis: 'Evelyn is bored with her life of balls and etiquette. She is fascinated by the tales of Captain Rogue. During a pirate attack on her town, she is captured by the man himself. He is not the monster she expected. He is charming, intelligent, and surprisingly honorable. She is a valuable hostage, but he finds himself drawn to her spirit. She finds a freedom on his ship she has never known. Theirs is a forbidden love on the high seas, with her father\'s navy in hot pursuit.',
    keyTropes: ['historical-romance', 'pirates', 'captive-romance', 'forbidden-love'],
    desiredTone: 'Swashbuckling, fun, and romantic.',
    approxWordCount: 2800,
    coverImagePrompt: 'A handsome pirate captain is teaching a beautiful lady in a fine dress how to steer his ship. They are laughing, the open sea and a sunset behind them. A vibrant, cinematic digital painting. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 192
  {
    titleIdea: 'The Warlock of the West End',
    subgenre: 'paranormal',
    characterNames: ['Isabelle', 'Lord Julian'],
    mainCharacters: 'A struggling actress in London\'s West End, and the handsome, enigmatic theater owner who is secretly a warlock.',
    plotSynopsis: 'Isabelle is a talented actress but has terrible luck. Lord Julian, the owner of the theater where she is auditioning, sees her potential. He uses a little magic to help her get the part. He is fascinated by her passion and light, a stark contrast to his own dark, magical world. She is grateful to her mysterious benefactor. As her star rises, so does their attraction. But his magic has a price, and a rival coven wants to use her to get to him.',
    keyTropes: ['paranormal-romance', 'witches-and-warlocks', 'urban-fantasy', 'forbidden-love'],
    desiredTone: 'Glamorous, magical, and dangerous.',
    approxWordCount: 2700,
    coverImagePrompt: 'A woman is on a theater stage, under a spotlight. A handsome man in a fine suit is watching her from the shadows of the wings, a faint magical glow around his hands. A dark, glamorous digital painting. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 193
  {
    titleIdea: 'The Billionaire\'s Secret Baby',
    subgenre: 'billionaire',
    characterNames: ['Sophie', 'Marco'],
    mainCharacters: 'A woman who had a one-night stand with a charming stranger on vacation, and the Italian billionaire who discovers nine months later that he is a father.',
    plotSynopsis: 'Sophie never expected to see Marco again. She is content to raise her baby on her own. Marco is shocked when he learns he has a son. He flies to her small town, determined to be a part of his child\'s life. He is a man used to getting what he wants, and he wants a real family. Sophie is wary of his powerful world. They must navigate the challenges of co-parenting and their undeniable chemistry, turning a one-night stand into a love that could last a lifetime.',
    keyTropes: ['billionaire', 'secret-baby', 'opposites-attract', 'one-night-stand'],
    desiredTone: 'Dramatic, emotional, and passionate.',
    approxWordCount: 2600,
    coverImagePrompt: 'A handsome, wealthy-looking man is awkwardly holding a baby, looking at a woman who is smiling at him with a mixture of love and exasperation. They are in a simple, cozy nursery. A warm, emotional digital painting. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 194
  {
    titleIdea: 'The Summer We Ran Away',
    subgenre: 'second-chance',
    characterNames: ['Sadie', 'Ben'],
    mainCharacters: 'Two childhood friends who ran away from home together for one magical summer, who are reunited as adults when he becomes her new boss.',
    plotSynopsis: 'That summer was the best of Sadie\'s life. The goodbye was the worst. Now, years later, she walks into her new job and her boss is Ben. The reunion is awkward and professional. He is all business; she is still a free spirit. But the memory of that summer hangs between them. They must navigate their new professional relationship while confronting their unresolved feelings and the promises they made as kids. They have a second chance to see if their runaway love can find a permanent home.',
    keyTropes: ['second-chance', 'childhood-sweethearts', 'workplace-romance', 'nostalgia'],
    desiredTone: 'Nostalgic, bittersweet, and romantic.',
    approxWordCount: 2500,
    coverImagePrompt: 'The image is split. One half shows two kids with backpacks, looking at a map. The other half shows a man and a woman in a modern office, looking at each other with a sense of recognition and longing. A clever, emotional illustration. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 195
  {
    titleIdea: 'The Architect and the Activist',
    subgenre: 'contemporary',
    characterNames: ['Will', 'Lena'],
    mainCharacters: 'A pragmatic, rising-star architect designing a new corporate skyscraper, and the passionate, fiery community activist leading the protests against it.',
    plotSynopsis: 'Will is proud of his design. Lena sees it as a symbol of gentrification that will destroy her neighborhood. Their public debates are fierce and intelligent. He is her adversary, but he is captivated by her passion. She is infuriated by him but respects his intellect. He agrees to meet with her community group and begins to see the human cost of his project. Their professional battle becomes a personal connection, and they must find a compromise that saves both the community and their budding love.',
    keyTropes: ['enemies-to-lovers', 'opposites-attract', 'social-issues', 'slow-burn'],
    desiredTone: 'Smart, passionate, and relevant.',
    approxWordCount: 2700,
    coverImagePrompt: 'A woman with a megaphone is leading a protest. A handsome architect in a suit is watching her from across the street, a conflicted but admiring expression on his face. A dynamic, realistic digital painting with a cityscape background. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 196
  {
    titleIdea: 'The Last Keeper of the Light',
    subgenre: 'historical',
    characterNames: ['Mary', 'Thomas'],
    mainCharacters: 'A resourceful young woman who takes over her father\'s lighthouse in the 19th century, a job forbidden to women, and the handsome, skeptical inspector from the Lighthouse Board sent to replace her.',
    plotSynopsis: 'Mary is a brilliant keeper, but the Board wants to appoint a man. Thomas arrives, expecting to find a lighthouse in disarray. He is surprised by her skill and dedication. He is a man of rules; she is a woman of the sea. As a storm rolls in, trapping them in the lighthouse, they must work together. He sees her courage and falls for the woman who is more capable than any man he could appoint. He must choose between his duty and his heart, and champion her right to keep the light.',
    keyTropes: ['historical-romance', 'forbidden-love', 'forced-proximity', 'pioneering-woman'],
    desiredTone: 'Atmospheric, inspiring, and romantic.',
    approxWordCount: 2800,
    coverImagePrompt: 'In the lantern room of a lighthouse, a woman is polishing the great lens. A man in a formal coat is watching her, a look of admiration on his face. A stormy sea is visible through the window. A dramatic, painterly digital illustration. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 197
  {
    titleIdea: 'The Oracle of Delphi',
    subgenre: 'paranormal',
    characterNames: ['Kassandra', 'General Lycomedes'],
    mainCharacters: 'A young woman who is the new Oracle at Delphi, her visions a heavy burden, and the cynical, battle-hardened Spartan general who comes to her for a prophecy.',
    plotSynopsis: 'Kassandra is overwhelmed by the visions of war and death. General Lycomedes, a man who trusts only his sword, is ordered by his king to consult the Oracle. He is skeptical but finds himself drawn to her wisdom and the sadness in her eyes. Her prophecy for him is a cryptic riddle that only he can solve. As he tries to decipher her words, he keeps returning to her, their conversations becoming a sanctuary for them both. Their love is a forbidden connection between a mortal man and a vessel of the gods.',
    keyTropes: ['paranormal-romance', 'mythology', 'forbidden-love', 'fated-love'],
    desiredTone: 'Epic, tragic, and mystical.',
    approxWordCount: 2900,
    coverImagePrompt: 'A young woman in Grecian robes sits on a tripod over a chasm in a temple, vapors swirling around her. A powerful Spartan warrior is kneeling before her, looking up at her with a mixture of awe and concern. A classic, detailed oil painting in the style of John William Waterhouse. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 198
  {
    titleIdea: 'The Billionaire\'s Ex-Wife',
    subgenre: 'billionaire',
    characterNames: ['Claire', 'Daniel'],
    mainCharacters: 'A woman who divorced her workaholic billionaire husband to find her own life, and the man himself, who realizes his mistake and will do anything to win her back.',
    plotSynopsis: 'Claire is finally happy, running a small flower shop. Daniel\'s life is empty without her. He shows up at her shop, but she is not interested in his apologies or his money. He begins a campaign to win her back, not with grand gestures, but with small, thoughtful acts that show he has changed. He learns to be the man she always wanted him to be. She must decide if she can trust him again and if their love is worth a second chance.',
    keyTropes: ['billionaire', 'second-chance', 'reconciliation-romance', 'grand-gestures-fail'],
    desiredTone: 'Emotional, romantic, and hopeful.',
    approxWordCount: 2600,
    coverImagePrompt: 'A handsome man in an expensive suit is awkwardly trying to arrange flowers in a charming flower shop. A woman is watching him with a skeptical but softening expression. A warm, realistic digital painting. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 199
  {
    titleIdea: 'The Time Traveler\'s Fiancée',
    subgenre: 'second-chance',
    characterNames: ['Henry', 'Clare'],
    mainCharacters: 'A man with a genetic disorder that causes him to involuntarily time travel, and the woman who has known and loved him her whole life, in a jumbled order.',
    plotSynopsis: 'Clare meets Henry for the first time when she is six, but he is a grown man. He meets her for the first time when he is twenty-eight, but she has known him forever. Their love story is a tangled, beautiful mess. Their life together is a constant series of hellos and goodbyes, of waiting and reunions. Their love is a testament to patience and devotion, a romance that defies time itself.',
    keyTropes: ['time-travel', 'fated-love', 'tragic-romance', 'non-linear-story'],
    desiredTone: 'Poignant, unique, and deeply romantic.',
    approxWordCount: 2700,
    coverImagePrompt: 'A woman is standing in a field. A man is shimmering into existence beside her, as if he is a ghost. They are reaching for each other\'s hands. A beautiful, ethereal digital painting. IMPORTANT: Do not include any text, letters, or words in the image.'
  },
  // Seed 200
  {
    titleIdea: 'The Chef and the Farmer',
    subgenre: 'contemporary',
    characterNames: ['Gabriella', 'Sam'],
    mainCharacters: 'A high-strung, ambitious chef running a farm-to-table restaurant, and the handsome, laid-back organic farmer who supplies her produce.',
    plotSynopsis: 'Gabriella is a perfectionist. Sam delivers his vegetables whenever they are ready, which drives her crazy. Their weekly arguments over heirloom tomatoes and delivery schedules are legendary. But she cannot deny the quality of his produce, and he is secretly her biggest fan. A drought threatens his farm and her restaurant. They must work together to save both, their friction turning into a collaboration, and their collaboration turning into a deep, earthy love.',
    keyTropes: ['enemies-to-lovers', 'foodie-romance', 'opposites-attract', 'slow-burn'],
    desiredTone: 'Charming, rustic, and heartwarming.',
    approxWordCount: 2500,
    coverImagePrompt: 'A female chef in her whites and a handsome farmer in a plaid shirt are arguing over a crate of beautiful, colorful vegetables in a rustic farm setting. They are both trying not to smile. A warm, vibrant digital painting. IMPORTANT: Do not include any text, letters, or words in the image.'
  }
];

    
