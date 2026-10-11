# XCPETS Play Demo: How It Works

Everything in the demo uses play XCPETS: fake money saved in your browser. It isn't real XCPETS and nothing goes on-chain. The pets and art come from the real game's generator, except that the demo locks each species to one rarity tier, so species odds differ from the real game (see section 1). Stages, care and evolving run on the real game's rules code. The costs are the demo's own, much cheaper than the real game, and gear rolling, tokens and Slot Keys are demo-only.

## Your play wallet
- You start with 69,000 play XCPETS, exactly enough to raise one pet from Egg to Mythic.
- Tap **Refill** any time for a free +345,000.
- **Reset demo** wipes your wallet, pets and gear and starts over.

## Hatching
- Hatching costs **69** play XCPETS. Each hatch rolls a brand-new pet from a random fake block hash and burn id, using the game's own generator, exactly as in the real game.
- The reveal shows your pet's species and rarity, e.g. "It's a Rare Doge!"
- **Hatch Again** rolls another pet right away, so you can reroll cheaply for Rare and Legendary pets.
- **Release** deletes a pet you don't want. There's no refund, and its gear goes back to your inventory.

### Bulk egg buys
| Pack | Eggs | Price (play XCPETS) | Per egg | Saving vs single hatches |
|---|---|---|---|---|
| Single hatch | 1 | 69 | 69 | none |
| **Dozen eggs** | 12 | 690 | 57.5 | 12 for the price of 10 (about 17% off) |
| **Case of eggs** (a gross) | 144 | 6,900 | about 47.9 | about 31% off (9,936 as singles) |

- Every egg in a pack is a normal, independent hatch: the same generator, its own random fake block hash and burn id, and the same species and rarity odds as a single hatch.
- In the burn log each egg is a normal 69 hatch (so it lands on Hatchling and feeds the shared pet 69). The pack discount is refunded to your wallet straight away.
- Each egg counts as a stage-up (Egg to Hatchling), so each one has its own 25% chance of a free roll token.
- The pack buttons sit next to **Hatch** and are greyed out when your balance is too low.
- After a pack you get a **batch reveal**: a grid of every new pet, with Rare and Legendary pets highlighted, and counts per rarity and per species. **Release all Commons from this batch** deletes that batch's Commons in one go, after a confirm, with no refund.
- **My pets** shows 12 pets per page, with a rarity filter and a sort (newest, rarest, highest stage), so big batches stay fast. Your save stores each pet's seed, not images: 3 cases (432 pets) take about 136 KB of browser storage.

### Species (12)
Pepe, Wojak, Chud, Bobo, Mumu, Snibby, Dodo, KEVIN, Peepo, Sarutobi, Doge and Lenny. The pet's tier is rolled first, then a species. Each species has a minimum tier and can roll at that tier or any higher one, with 4x weight at its own minimum tier (KEVIN, Peepo, Sarutobi, Doge and Lenny use fixed weights in every tier instead). Pepe and Wojak are the most common (about 22% each); Dodo is the rarest (under 1%, Legendary only). Full odds are in the reference below.

### Rarity tiers
| Tier | Chance |
|---|---|
| Common | 60% |
| Uncommon | 27% |
| Rare | 10% |
| Legendary | 3% |

Rarity decides which palettes, patterns, eyes and backgrounds your pet can roll, and how fancy they can be. It also shifts the species odds (see the reference) and decides how many gear slots your pet has.

## Stages: Egg to Mythic
Every pet grows through six stages: **Egg, Hatchling, Juvenile, Adult, Elder, Mythic**. From Hatchling on, each stage changes its expression. A minimum hatch skips the Egg and lands on Hatchling.

| Step | Cost (play XCPETS) |
|---|---|
| Hatch (straight to Hatchling) | 69 |
| Hatchling to Juvenile | 10,350 (care 10,419) |
| Juvenile to Adult | 13,800 (care 24,219) |
| Adult to Elder | 17,250 (care 41,469) |
| Elder to Mythic (Evolve) | 27,531 |
| **Total, Egg to Mythic** | **69,000** |

## Feeding (care)
- Feeding burns play XCPETS into your pet as **care**. When its care reaches the next threshold, it moves up a stage.
- The big orange **Feed** button on each pet card feeds exactly enough to reach the next stage, so it's one tap per stage. You can also type any amount (minimum 7) and tap **Feed amount**.
- **Daily limit: each pet can be fed at most 3 times per day**, counted by your device's local calendar day and reset at local midnight. Both the orange **Feed** button and **Feed amount** count. Evolving, hatching, gear rolls and feeding the shared pet don't count. Each card shows **Feeds today: n/3**. After the third feed the feed buttons are greyed out with "Fed 3/3 today, back tomorrow", and a blocked feed costs nothing. With one-tap stage feeds, a pet can still go from Hatchling to Elder in one day (3 feeds), then to Mythic with Evolve.
- At Elder, tap **Evolve to Mythic** to ascend. The button stays greyed out until your pet reaches Elder.

## Gear
Gear slots come from **rarity**, using the game's own rule (each tier's gear-slot count), and they are all open from Hatchling:

| Rarity | Gear slots |
|---|---|
| Common | 0 (no base gear) |
| Uncommon | 2: headband/scarf, armor |
| Rare | 4: + cape, weapon |
| Legendary | 5: + crown |

### Rolling for gear
- Pick one of your pet's slots on its card and tap **Roll (345)**. You get a random item for that slot.
- Every item goes into your inventory. If the slot was empty, it is also equipped right away.
- A paid roll is a play burn of 345. It adds no care to your pet, but it does count toward the shared pet.
- Each slot's pool also has new hand-drawn items: shared ones for every pet, and signature items that only roll for (and can only be worn by) their own species. Examples: Pepe's pimp hat, Wojak's hard hat, Bobo's red-candle dagger. The full list is in the reference below.
- Roll odds use the game's own gear rule: a pet rolls items **up to its own rarity**, and items of its own rarity are **4x as likely** (every item has the same base weight). The pet's stage doesn't matter. For example, on the headband/scarf slot (no signature items):

| Pet rarity | Common / Uncommon / Rare / Legendary items |
|---|---|
| Uncommon | 33 / 67 / 0 / 0 |
| Rare | 40 / 20 / 40 / 0 |
| Legendary | 36 / 18 / 9 / 36 |

Other slots differ a little because their pools have different sizes; exact per-item chances are in the reference below.

### Free roll tokens
Each burn that raises a pet's stage (a hatch, a feed or the Evolve) has a 25% chance to drop a free roll token. Otherwise, each feed of 690 or more has a 2% chance. At most one token drops per action. Rolling with a token costs no play XCPETS. Spend a token on any of a pet's slots with **Use token**.

### Swapping gear
Your items live in the inventory panel. On any pet card you can **Equip**, **Swap** or **Unequip** an item in one of its slots. Each item can be on only one pet at a time.

### Bonus slots
Every roll has a 1% chance to drop a **Slot Key**. Using a key permanently opens a bonus slot on that pet, in this order: face, then back, then feet. Bonus slots work on every pet, Commons included, so a key is the only way to put gear on a Common.

Bonus-slot rolls cost the same 345 (or a token) and use the same rule, limited to that slot's items. If a slot has nothing at or below your pet's rarity, you get the slot's lowest-rarity item (exact odds in the reference below).

| Slot | Items |
|---|---|
| Face | Hard-wallet amulet (Rare), Beam eyes (Legendary); Mumu also Gold nose ring (Rare), Lenny also Lenny-face monocle (Rare) |
| Back | HODL banner (Uncommon), Paper-hands cape (Rare) |
| Feet | Counterparty coin (Common), Stack of sats (Uncommon); Sarutobi also Smoke-bomb sandals (Rare) |

## Hunger meter
Each pet card has a hunger meter. It is full right after a meal and drains evenly to empty 24 hours after the last one. Every feed refills it, and a hatch counts as the first meal. It's cosmetic only: an empty meter changes nothing.

## WAGMI to NGMI (power ranking)
All your pets in this browser are ranked in one list, with **WAGMI** at the top and **NGMI** at the bottom. It's cosmetic only.

1. **Pets on a streak** come first, by streak score. A streak counts consecutive days with at least one feed. It ends today, or yesterday if you haven't fed the pet yet today. Each fed day is worth 1, and a full 3/3 day is worth 1.5.
2. **Neutral pets** come next: no streak, but not neglected yet.
3. **Neglected pets** (at least one full calendar day missed since the last meal) come last, sorted by days missed, so the most neglected pet is dead last. One feed clears neglect.

With more than 20 pets, the list shows the top 10 and bottom 10, with a **Show all** toggle.

| Badge | Earned by |
|---|---|
| Fire takes | A streak of 3+ days |
| Roast mode | A streak of 7+ days. The pet roasts one of the bottom 3 other pets in this browser by name (target and line rotate daily) |
| Legendary drip | A streak of 14+ days. The row gets a gold glow |
| Cursed tweet thread | 1 to 2 full days missed since the last meal |
| Flop era | 3 to 6 days missed |
| Shitpost encounters | 7+ days missed, with a daily flavor line such as "found a suspicious hat", "argued with a pigeon" or "declared itself a final boss" |

"Days missed" counts whole calendar days with no meal since the last one, so a pet fed yesterday has missed 0 and is still on its streak. A long streak earns all the streak badges it qualifies for.

## The shared community pet
There's also a mystery community pet that everyone grows together. Nobody knows what it is yet. Every play burn helps it grow, including hatches, feeds and rolls, and **Feed the shared pet** sends play XCPETS straight to it. It grows three times slower than a personal pet: 41,400 per stage, 207,000 total to Mythic. In the demo, its progress is saved in your browser only.

---

# Reference (generated from the code)

Everything below comes straight from the promo's `js/pet-core.js` (version `3.14.0-promo`), `js/demo-core.js` and `js/bonus-gear.js`. Percentages are computed from the weight tables in the code and rounded to two decimals. "Overall" means across all hatches, using the tier odds (Common 60%, Uncommon 27%, Rare 10%, Legendary 3%).

**How rolls work.** Each pet is rolled from a SHA-256 hash of its (fake) block hash and burn id. The rarity tier is rolled first, then each trait. An item can only roll at tiers at or above its own minimum tier. Items whose minimum tier equals the pet's tier get 4x weight, and the Classic palette always gets 4x. Species follow the same rule (see section 1).

## 1. Species

Species use the game's own rule: a species can roll at its minimum tier or any higher tier, with 4x its base weight at its minimum tier (base weights: Pepe/Wojak 12, Chud 8, Bobo/Mumu/Snibby/Dodo 10). KEVIN, Peepo, Sarutobi, Doge and Lenny instead have a fixed weight in every tier. Each tier column adds up to 100%.

| Species | Look (from the code comments) | Min tier | Common | Uncommon | Rare | Legendary | Overall |
|---|---|---|---|---|---|---|---|
| Pepe | Classic green frog: green body, blue accent, red-brown secondary colour | Common | 30.00% | 8.63% | 10.43% | 9.38% | 21.66% |
| Wojak | Tall oval bald head with forehead creases, eyes at mid-height looking aside, white eyes with an ink upper lid | Common | 30.00% | 8.63% | 10.43% | 9.38% | 21.66% |
| Chud | Wojak's head with a full dark-brown beard, near-black hair with a straight fringe, a level gaze behind always-on clear eyeglasses | Common | 20.00% | 5.76% | 6.96% | 6.25% | 14.44% |
| Bobo | Bitcoin-Stamp-style bear: big square head, round ears, dark muzzle and black nose, heavy half-lidded smug eyes, red shirt | Uncommon | - | 28.78% | 8.70% | 7.81% | 8.87% |
| Mumu | Burnt-orange bull: white blaze with a spiky tuft, wide peach snout, heavy smug lids, cream horns, green shirt | Uncommon | - | 28.78% | 8.70% | 7.81% | 8.87% |
| Snibby | Yellow blob crab: two tall eyestalks, wide duck-bill grin with orange lips, raised orange pincers, stubby legs | Rare | - | - | 34.78% | 7.81% | 3.71% |
| Dodo | Black swan in side view: S-curve neck, round head, spiky back feathers, long red wedge beak, one side-profile eye | Legendary | - | - | - | 31.25% | 0.94% |
| KEVIN | Grey jaw-length helmet of hair, long tan face, narrow green slit eyes under flat black brows, pale-blue shirt | Any (fixed per-tier weights) | 3.75% | 3.60% | 3.48% | 3.91% | 3.69% |
| Peepo | Wide round green head peeking up over a bright-blue shirt band, big glossy eyes, wide open mouth with brown lips and pink tongue | Any (fixed per-tier weights) | 4.38% | 4.32% | 4.35% | 3.91% | 4.34% |
| Sarutobi | The 8-bit SaruTobi monkey: brown body, big round tan face disc, two tall black oval eyes, round ears, curly tail | Any (fixed per-tier weights) | 3.75% | 3.60% | 3.48% | 3.91% | 3.69% |
| Doge | Kabosu-style Shiba: orange-tan fur, cream muzzle and chest, pale eyebrow dots, upright ears, the side-eye, seated | Any (fixed per-tier weights) | 4.38% | 4.32% | 4.35% | 4.69% | 4.37% |
| Lenny | Round warm-yellow Lenny face: raised arched brows over small ring eyes, sideways hook nose, smirk, tiny body | Any (fixed per-tier weights) | 3.75% | 3.60% | 4.35% | 3.91% | 3.77% |

Pepe and Wojak are the most common (about 1 in 5 each). Dodo is the rarest (about 1 in 106, Legendary only).

KEVIN, Peepo, Sarutobi, Doge and Lenny have their own coloured eggs. The other species use the shared egg drawn in the pet's palette.

### Showcase kits
These are the signature kits used for the cast art and gallery (a Legendary in the Classic palette, so all 5 slots). In the demo you build your own kit by rolling, and these kits are not given out.

| Species | Band | Armor | Cape | Weapon | Crown |
|---|---|---|---|---|---|
| Pepe | Red headband | Gold armor | Royal cape | Golden sword | Jeweled crown |
| Wojak | Red scarf | Silver armor | Purple cape | Staff | Laurel wreath |
| Chud | Green scarf | Iron armor | Forest cape | Axe | Silver crown |
| Bobo (no shades) | Red headband | Iron armor | Purple cape | Wooden sword | Gold crown |
| Mumu | Gold headband | Gold armor | Golden cape | Spear | Gold crown |
| Snibby | Blue headband | Silver armor | Blue cape | Trident | Silver crown |
| Dodo | Royal scarf | Silver armor | Royal cape | Iron sword | Jeweled crown |
| KEVIN | White scarf | Iron armor | Red cape | Staff | Gold crown |
| Peepo | Red headband | Iron armor | Blue cape | Wooden sword | Gold crown |
| Sarutobi | Gold headband | Leather armor | Forest cape | Staff | Gold crown |
| Doge | Red scarf | Gold armor | Royal cape | Golden sword | Jeweled crown |
| Lenny | Black headband | Obsidian armor | Midnight cape | Trident | Silver crown |

## 2. Gear

**What gear does: it's cosmetic only.** No gear item changes stats, care, costs, stage-ups or drop odds anywhere in the code. It only changes how the pet looks.

**In the demo, pets don't wear their rolled gear.** Every pet's DNA still contains a rolled variant for each slot (the real game's look). The demo ignores it and draws only what you equip.

**In the demo, how a roll picks an item.** The game's own gear rule: every item in the slot's pool (pet-core variants plus the new items your species can get) has the same base weight; items above your pet's rarity can't roll, and items of exactly your pet's rarity get 4x weight. Your pet's stage doesn't matter.

**Where the new items come from.** Besides pet-core's own variants, each slot's pool now includes the hand-drawn items from the gear preview. Items marked (new) are drawn on top of the pet, so they follow the head and hands at every stage and move with the bounce. Shared items roll for every species. Signature items roll only for their own species and can only be equipped on it. When a new item fills a slot, the pet-core item for that slot isn't drawn, so a hat replaces the crown and never sits on top of one.

**Chance per roll.** The columns show the chance per roll for each pet rarity that has the slot (Commons have no base slots). A range means it depends on the species, because species with signature items in that slot have bigger pools. Bonus slots are open to every rarity once unlocked with a Slot Key; when nothing in a bonus slot is at or below your pet's rarity, the slot's lowest-rarity item(s) are rolled.

### Band (head/neck): Uncommon, Rare, Legendary pets

| Item | Rarity | Who can roll/wear it | Uncommon pet | Rare pet | Legendary pet |
|---|---|---|---|---|---|
| Red headband | Common | Every species | 6.25% to 8.33% | 7.14% to 10.00% | 8.33% to 9.09% |
| Blue headband | Common | Every species | 6.25% to 8.33% | 7.14% to 10.00% | 8.33% to 9.09% |
| Red scarf | Common | Every species | 6.25% to 8.33% | 7.14% to 10.00% | 8.33% to 9.09% |
| Green scarf | Common | Every species | 6.25% to 8.33% | 7.14% to 10.00% | 8.33% to 9.09% |
| Black headband | Uncommon | Every species | 25.00% to 33.33% | 7.14% to 10.00% | 8.33% to 9.09% |
| White scarf | Uncommon | Every species | 25.00% to 33.33% | 7.14% to 10.00% | 8.33% to 9.09% |
| KEVIN name tag (new) | Uncommon | KEVIN only | 25.00% | 9.09% | 8.33% |
| "Wow" bandana (new) | Uncommon | Doge only | 25.00% | 9.09% | 8.33% |
| Royal scarf | Rare | Every species | - | 28.57% to 40.00% | 8.33% to 9.09% |
| Ninja headband (new) | Rare | Sarutobi only | - | 28.57% | 8.33% |
| Gold headband | Legendary | Every species | - | - | 33.33% to 36.36% |

### Armor: Uncommon, Rare, Legendary pets

| Item | Rarity | Who can roll/wear it | Uncommon pet | Rare pet | Legendary pet |
|---|---|---|---|---|---|
| Leather armor | Common | Every species | 20.00% | 16.67% | 6.67% to 9.09% |
| Iron armor | Uncommon | Every species | 80.00% | 16.67% | 6.67% to 9.09% |
| Silver armor | Rare | Every species | - | 66.67% | 6.67% to 9.09% |
| Gold armor | Legendary | Every species | - | - | 26.67% to 36.36% |
| Obsidian armor | Legendary | Every species | - | - | 26.67% to 36.36% |
| Pink peeking sweater (new) | Legendary | Peepo only | - | - | 26.67% |

### Cape: Rare and Legendary pets

| Item | Rarity | Who can roll/wear it | Rare pet | Legendary pet |
|---|---|---|---|---|
| Red cape | Common | Every species | 12.50% | 7.69% |
| Blue cape | Common | Every species | 12.50% | 7.69% |
| Forest cape | Uncommon | Every species | 12.50% | 7.69% |
| Purple cape | Uncommon | Every species | 12.50% | 7.69% |
| Royal cape | Rare | Every species | 50.00% | 7.69% |
| Midnight cape | Legendary | Every species | - | 30.77% |
| Golden cape | Legendary | Every species | - | 30.77% |

### Weapon / held item: Rare and Legendary pets

| Item | Rarity | Who can roll/wear it | Rare pet | Legendary pet |
|---|---|---|---|---|
| Wooden sword | Common | Every species | 4.76% to 6.25% | 5.00% to 6.67% |
| Staff | Common | Every species | 4.76% to 6.25% | 5.00% to 6.67% |
| Stick (new) | Common | Doge only | 5.88% | 5.00% |
| Iron sword | Uncommon | Every species | 4.76% to 6.25% | 5.00% to 6.67% |
| Axe | Uncommon | Every species | 4.76% to 6.25% | 5.00% to 6.67% |
| "Feels good" mug (new) | Uncommon | Pepe only | 4.76% | 5.88% |
| Red "it's over" chart (new) | Uncommon | Wojak only | 5.88% | 6.25% |
| Energy-drink can (new) | Uncommon | Chud only | 5.88% | 6.25% |
| Trident | Rare | Every species | 19.05% to 25.00% | 5.00% to 6.67% |
| Spear | Rare | Every species | 19.05% to 25.00% | 5.00% to 6.67% |
| Diamond hands (new) | Rare | Every species | 19.05% to 25.00% | 5.00% to 6.67% |
| Rare Pepe card (new) | Rare | Pepe only | 19.05% | 5.88% |
| Bear claw (new) | Rare | Bobo only | 20.00% | 5.00% |
| Sideways-chart shield (new) | Rare | Snibby only | 20.00% | 6.25% |
| "?" event card (new) | Rare | Dodo only | 20.00% | 5.00% |
| Copy-paste stamp (new) | Rare | KEVIN only | 20.00% | 5.00% |
| Golden sword | Legendary | Every species | - | 20.00% to 26.67% |
| Burn torch | Legendary | Every species | - | 20.00% to 26.67% |
| Red-candle dagger (new) | Legendary | Bobo only | - | 20.00% |
| Green-candle staff (new) | Legendary | Mumu only | - | 21.05% |
| Black Swan quill (new) | Legendary | Dodo only | - | 20.00% |
| Clone mirror (new) | Legendary | KEVIN only | - | 20.00% |
| Banana katana (new) | Legendary | Sarutobi only | - | 21.05% |
| Moon rocket (new) | Legendary | Doge only | - | 20.00% |

### Crown / hat: Legendary pets only

| Item | Rarity | Who can roll/wear it | Legendary pet |
|---|---|---|---|
| Laurel wreath | Common | Every species | 5.88% to 9.09% |
| Silver crown | Uncommon | Every species | 5.88% to 9.09% |
| Hard hat (new) | Uncommon | Wojak only | 5.88% |
| Party hat (new) | Uncommon | Peepo only | 7.69% |
| Smug cap (new) | Uncommon | Lenny only | 8.33% |
| Gold crown | Rare | Every species | 5.88% to 9.09% |
| McDonald's visor (new) | Rare | Wojak only | 5.88% |
| Gamer headset (new) | Rare | Chud only | 6.25% |
| "To the moon" horn cap (new) | Rare | Mumu only | 8.33% |
| Binoculars hat (new) | Rare | Peepo only | 7.69% |
| Jeweled crown | Legendary | Every species | 23.53% to 36.36% |
| Flame crown | Legendary | Every species | 23.53% to 36.36% |
| Pepe Cash pimp hat (new) | Legendary | Pepe only | 26.67% |
| Doomer beanie + cig (new) | Legendary | Wojak only | 23.53% |
| "Based" trucker cap (new) | Legendary | Chud only | 25.00% |
| Short-seller top hat (new) | Legendary | Bobo only | 26.67% |
| Seashell helmet (new) | Legendary | Snibby only | 26.67% |

### Face (bonus): any pet, with Slot Key 1

| Item | Rarity | Who can roll/wear it | Common pet | Uncommon pet | Rare pet | Legendary pet |
|---|---|---|---|---|---|---|
| Hard-wallet amulet (new) | Rare | Every species | 50.00% to 100.00% | 50.00% to 100.00% | 50.00% to 100.00% | 16.67% to 20.00% |
| Gold nose ring (new) | Rare | Mumu only | 50.00% | 50.00% | 50.00% | 16.67% |
| Lenny-face monocle (new) | Rare | Lenny only | 50.00% | 50.00% | 50.00% | 16.67% |
| Beam eyes (new) | Legendary | Every species | - | - | - | 66.67% to 80.00% |

### Back (bonus): any pet, with Slot Key 2

| Item | Rarity | Who can roll/wear it | Common pet | Uncommon pet | Rare pet | Legendary pet |
|---|---|---|---|---|---|---|
| HODL banner (new) | Uncommon | Every species | 100.00% | 100.00% | 20.00% | 50.00% |
| Paper-hands cape (new) | Rare | Every species | - | - | 80.00% | 50.00% |

### Feet (bonus): any pet, with Slot Key 3

| Item | Rarity | Who can roll/wear it | Common pet | Uncommon pet | Rare pet | Legendary pet |
|---|---|---|---|---|---|---|
| Counterparty coin (new) | Common | Every species | 100.00% | 20.00% | 16.67% to 50.00% | 33.33% to 50.00% |
| Stack of sats (new) | Uncommon | Every species | - | 80.00% | 16.67% to 50.00% | 33.33% to 50.00% |
| Smoke-bomb sandals (new) | Rare | Sarutobi only | - | - | 66.67% | 33.33% |

Notes from the code:
- On Wojak, Chud, KEVIN and Peepo nothing is drawn on the head, so a pet-core headband is worn as a neck scarf in the same colour.
- Hats and other new head items are in the Crown slot, so only Legendary pets can wear them. The pet-core crown isn't drawn under them.
- Each species has its own gear placement: armor rows, scarf row, cape height, and how far a crown sinks onto the head. On off-centre heads (Dodo, Doge) the crown is centred over the head.
- The Flame crown's flame tips shift once per bounce cycle.
- The Beam eyes bonus item is different from the Beam eyes eye trait (section 6). The trait recolours the pet's own eyes, and the item draws big beams on top. A pet can have both. Beam eyes don't show on a stage whose expression closes the eyes.

## 3. Backgrounds

Every pet rolls a background pattern, plus a base colour picked evenly from 8 dark colours: navy `#1d2b53`, plum `#2b1d3f`, forest `#1f3b2f`, brown `#3b2a1f`, deep blue `#14213d`, wine `#2d1b2e`, slate blue `#203040`, maroon `#3a1f2b` (12.5% each, all tiers).

| Background | Look | Min tier | Common | Uncommon | Rare | Legendary | Overall |
|---|---|---|---|---|---|---|---|
| Solid | Flat base colour | Common | 62.50% | 11.36% | 9.43% | 7.58% | 41.74% |
| Dots | Base colour with a staggered grid of lighter dots | Common | 37.50% | 6.82% | 5.66% | 4.55% | 25.04% |
| Gradient | Base colour fading down toward a dark shade of the palette accent | Uncommon | n/a | 45.45% | 9.43% | 7.58% | 13.44% |
| Grid | Lighter grid lines every 8 px | Uncommon | n/a | 36.36% | 7.55% | 6.06% | 10.75% |
| Starfield | Darkened base colour with 8 twinkling white stars | Rare | n/a | n/a | 37.74% | 7.58% | 4.00% |
| Sunburst | Rotating rays mixing the base colour with the palette accent | Rare | n/a | n/a | 30.19% | 6.06% | 3.20% |
| Aurora | Moving wavy bands of dark navy, teal, green, indigo and purple (ignores the base colour) | Legendary | n/a | n/a | n/a | 30.30% | 0.91% |
| Cosmic | Deep space gradient (near-black to purple) with twinkling stars and an orange planet | Legendary | n/a | n/a | n/a | 30.30% | 0.91% |

The background colour is an even 1-in-8 roll, so "a blue background" on a pet is just its rolled background colour, not a bug.

## 4. Patterns (body markings)

Patterns are drawn on the body colour only. The face is never patterned.

| Pattern | Look | Min tier | Common | Uncommon | Rare | Legendary | Overall |
|---|---|---|---|---|---|---|---|
| Plain | No markings | Common | 38.89% | 10.00% | 11.11% | 9.86% | 27.44% |
| Belly patch | Oval belly patch in the secondary colour | Common | 33.33% | 8.57% | 9.52% | 8.45% | 23.52% |
| Spots | Up to 8 small 2x2 spots in the accent colour | Common | 27.78% | 7.14% | 7.94% | 7.04% | 19.60% |
| Stripes | Accent stripe on every third row | Uncommon | n/a | 28.57% | 7.94% | 7.04% | 8.72% |
| Socks | White bottom three rows (feet) | Uncommon | n/a | 22.86% | 6.35% | 5.63% | 6.98% |
| Bandit mask | Accent band across the eye rows | Uncommon | n/a | 22.86% | 6.35% | 5.63% | 6.98% |
| Checker | 2x2 accent checkerboard that moves with the bounce | Rare | n/a | n/a | 25.40% | 5.63% | 2.71% |
| Two-tone | Right half of the body in the secondary colour | Rare | n/a | n/a | 25.40% | 5.63% | 2.71% |
| Galaxy | Deep indigo body with white star pixels and accent sparkles, moves with the bounce | Legendary | n/a | n/a | n/a | 22.54% | 0.68% |
| Rainbow | Six-colour horizontal rainbow bands | Legendary | n/a | n/a | n/a | 22.54% | 0.68% |

## 5. Palettes

A palette replaces the pet's three main colours: **body**, **accent** and **belly/secondary**. Outlines, eyes, mouth and fixed details stay the same. **Classic** keeps the character's own canon colours, and it always gets 4x weight, so it's the most common palette at every tier.

| Palette | Body / accent / belly | Min tier | Common | Uncommon | Rare | Legendary | Overall |
|---|---|---|---|---|---|---|---|
| Classic | The species' canon colours | Common | 40.00% | 38.10% | 34.04% | 30.77% | 38.61% |
| Peach | `#f4a98a` / `#d9715a` / `#fde4d4` | Common | 10.00% | 2.38% | 2.13% | 1.92% | 6.91% |
| Moss | `#8fbf6a` / `#5b8c3e` / `#dff0c8` | Common | 10.00% | 2.38% | 2.13% | 1.92% | 6.91% |
| Sky | `#8ec5e8` / `#4f8fc0` / `#e3f3fc` | Common | 10.00% | 2.38% | 2.13% | 1.92% | 6.91% |
| Sand | `#e3c78f` / `#b8925a` / `#f7ecd2` | Common | 10.00% | 2.38% | 2.13% | 1.92% | 6.91% |
| Slate | `#9aa3b5` / `#6b7489` / `#e1e5ee` | Common | 10.00% | 2.38% | 2.13% | 1.92% | 6.91% |
| Rose | `#e89bb0` / `#c0607c` / `#fbe1e8` | Common | 10.00% | 2.38% | 2.13% | 1.92% | 6.91% |
| Mint | `#6fe3c1` / `#2fa98a` / `#e0fff5` | Uncommon | n/a | 9.52% | 2.13% | 1.92% | 2.84% |
| Lilac | `#b49cf0` / `#7d5fd1` / `#efe8ff` | Uncommon | n/a | 9.52% | 2.13% | 1.92% | 2.84% |
| Tangerine | `#ff9a3c` / `#d9601a` / `#ffe5c7` | Uncommon | n/a | 9.52% | 2.13% | 1.92% | 2.84% |
| Bubblegum | `#ff8fd0` / `#d94fa0` / `#ffe3f4` | Uncommon | n/a | 9.52% | 2.13% | 1.92% | 2.84% |
| Lime | `#b6e85a` / `#7cad25` / `#f0ffd6` | Uncommon | n/a | 9.52% | 2.13% | 1.92% | 2.84% |
| Neon | `#39ff9f` / `#00b3ff` / `#eafff5` | Rare | n/a | n/a | 8.51% | 1.92% | 0.91% |
| Ruby | `#e0314f` / `#8f1630` / `#ffd0d8` | Rare | n/a | n/a | 8.51% | 1.92% | 0.91% |
| Sapphire | `#2f6bff` / `#16318f` / `#d6e2ff` | Rare | n/a | n/a | 8.51% | 1.92% | 0.91% |
| Obsidian | `#4a4366` / `#8a5cff` / `#c9bfff` | Rare | n/a | n/a | 8.51% | 1.92% | 0.91% |
| Ice | `#c8f4ff` / `#5fc8ff` / `#ffffff` | Rare | n/a | n/a | 8.51% | 1.92% | 0.91% |
| Gold | `#ffcc33` / `#c98a00` / `#fff3c4` | Legendary | n/a | n/a | n/a | 7.69% | 0.23% |
| Cosmic | `#5b3fc4` / `#ff5ce1` / `#9fd8ff` | Legendary | n/a | n/a | n/a | 7.69% | 0.23% |
| Orange Coin | `#f7931a` / `#b35f00` / `#ffe2bd` | Legendary | n/a | n/a | n/a | 7.69% | 0.23% |
| Ember | `#ff4d1a` / `#ffd23f` / `#ffe9b0` | Legendary | n/a | n/a | n/a | 7.69% | 0.23% |
| Pearl | `#f3eefc` / `#c7a8ff` / `#ffffff` | Legendary | n/a | n/a | n/a | 7.69% | 0.23% |

The accent colour also tints the Gradient and Sunburst backgrounds, the Tinted eyes and most patterns.

## 6. Eyes

The eye trait is a colour/style variant of the species' own eyes. The stage still sets the expression (open, half-lidded, closed).

| Eye trait | Look | Min tier | Common | Uncommon | Rare | Legendary | Overall |
|---|---|---|---|---|---|---|---|
| Classic | The character's normal eyes | Common | 75.00% | 37.50% | 36.59% | 33.33% | 59.78% |
| Beady | Eye whites filled in with skin colour, leaving small dark dot eyes | Common | 25.00% | 12.50% | 12.20% | 11.11% | 19.93% |
| Tinted | Pupils take the palette's accent colour | Uncommon | n/a | 50.00% | 12.20% | 11.11% | 15.05% |
| Star | Gold pupils with pale-gold whites | Rare | n/a | n/a | 39.02% | 8.89% | 4.17% |
| Beam eyes | Red pupils with pink whites and a flickering red beam shooting sideways from each eye (no beam when the stage's expression closes the eyes) | Legendary | n/a | n/a | n/a | 35.56% | 1.07% |

**Species eye notes**
- **Dodo:** one side-profile eye (a white eye with the pupil pushed toward the beak and a grey lid), placed forward on the head. Eye traits recolour that single eye.
- **Chud:** clear eyeglasses are part of his base look, not a trait. They stay on at every stage, Mythic included, and both lenses are kept the same size.
- **Bobo:** about 25% of Bobos wear black pixel shades. The chance comes from the pet's DNA, so it is not an extra roll and changes no other trait. Shades show from Hatchling to Elder and come off at Mythic.
- **Wojak:** white eyes with an ink upper lid. At Mythic his tear sits on his cheek.
- **Doge:** the side-eye (dark pupils pushed to one side, whites showing).
- At Hatchling, Wojak's eyes are drawn as solid dark eyes, because the whites can't survive the smallest size.

## 7. Other traits

| Trait | How it's rolled |
|---|---|
| Blush cheeks | 40% of pets (all tiers): two pink pixels under each eye |
| Name | 2 syllables (2 in 3) or 3 syllables (1 in 3), each picked evenly from 24: mo, chi, pip, zu, ka, ri, po, lu, bo, ne, tik, fu, yo, mi, to, ba, zo, ki, pe, ru, sa, nu, gi, wa. First letter capitalised, e.g. "Powayo" |
| Base stats | Vigor, spark, grit, zoom and luck, each 1-20 plus a tier bonus (Common +0, Uncommon +3, Rare +6, Legendary +10). The generator scales them by stage (50% at Egg up to 400% at Mythic) and adds a small bonus from care. The play demo doesn't show or use stats. |
| Mythic pose | At Mythic every species does the smug hand-to-chin thinking pose |
| Size | The sprite grows with the stage: 62% at Hatchling, 78% Juvenile, 90% Adult, full size at Elder and Mythic |

### Expression by stage
| Species | Hatchling | Juvenile | Adult | Elder | Mythic |
|---|---|---|---|---|---|
| Pepe | Smug | Curious | Determined | Wise | Triumphant |
| Wojak | Sad | Doubtful | Calm | Hopeful | Enlightened |
| Chud | Stern | Smirking | Determined | Grinning | Proud |
| Bobo | Gloomy | Grumpy | Steady | Cheerful | Jolly |
| Mumu | Calm | Snorting | Charging | Confident | Triumphant |
| Snibby | Happy | Excited | Fierce | Smug | Triumphant |
| Dodo | Blank | Curious | Determined | Serene | Majestic |
| KEVIN | Deadpan | Suspicious | Amused | Grinning | Knowing |
| Peepo | Happy | Sad | Determined | Content | Overjoyed |
| Sarutobi | Cheeky | Hungry | Focused | Grinning | Triumphant |
| Doge | Skeptical | Suspicious | Wow | Such Calm | Much Wow |
| Lenny | Sly | Suggestive | Scheming | Delighted | Knowing |

The Egg stage has no expression: it's an egg that wobbles.
