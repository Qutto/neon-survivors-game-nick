# NEON//SURVIVORS 2199 — Product Requirements Document v2

**Document type:** Product Requirements (for development)
**Version:** v2 — updated after the Dev Lead review (`NeonSurvivors_PRD_Review.md`). Every review item is resolved; see **Appendix A** for the ID → section map.
**Platforms:** iOS App Store + Google Play
**Orientation:** Portrait only
**Languages:** English (P0), Russian (P1)
**Primary market:** Global first; Russia is a secondary market
**Target age:** 13+ (not directed at children; no Google Families program)
**Monetization:** Ads only (no IAP)
**Engine:** Godot (dev decision D1)

> **This PRD is the source of truth.** The web prototype is a reference only for visuals, enemy/boss designs and game feel. Where a number is given here it is a **starting value** for the config; where a **rule** is given here it is binding.
>
> **Note on the prototype version:** every content item in this document (19 weapons, 17 passives, 13 pilots, 10 modules, 8 protocols, 5 bosses) exists in the **merged prototype build** (`neon-survivors-merged`). If your handoff has only 12 passives and 10 weapons, it is the older pre-merge build — ask the designer for the merged source. Its data tables can seed the placeholder config.

---

## Table of contents

1. Product in one paragraph
2. Product pillars
3. Design rules: what we DO and what we DON'T
4. Core loop (the run)
5. Build system
6. Pilots and awakenings
7. Threats, enemies and bosses
8. Planets
9. Meta loop
10. High-level balance, formulas and the balance config
11. Monetization (ad placements)
12. Development phases P0 / P1 / P2
13. Tutorial / FTUE
14. App lifecycle, save and time rules
15. Feature filter
16. Open items (owner + deadline)
17. Glossary

Appendix A — Review resolution log

---

## 1. Product in one paragraph

NEON//SURVIVORS 2199 is a **mobile, portrait, one-finger survivor roguelite** in a cyberpunk neon setting. The ship fires on its own; the player only moves and makes decisions. A run lasts **5 minutes** and ends with a final boss; after the win the player may evacuate or push into **Endless mode** for a record. The depth of the game is **in the choice of weapons, perks and their combinations — not in movement or reflexes**. Between runs the player progresses through a linear chain of planets, upgrades the ship in the Laboratory, collects modules in the Hangar and unlocks pilots. The game is monetized **only through ads**; every rewarded ad is optional and player-initiated.

---

## 2. Product pillars

| # | Pillar | What it means in practice |
|---|---|---|
| 1 | **One finger** | The whole game, including combat, is playable with one thumb. No in-combat buttons. |
| 2 | **Portrait** | Every screen is designed for portrait first. Nothing requires landscape. |
| 3 | **Decisions, not reflexes** | The skill expression is the build. The level-up screen is the most important screen of the game. |
| 4 | **Short sessions** | One run = 5 minutes to the final boss. A meaningful session = one run. |
| 5 | **Readable chaos** | The screen can be full of enemies and effects, but threats are always readable. |
| 6 | **Visible power growth** | Every few seconds the player feels stronger: more projectiles, bigger areas, evolutions. |
| 7 | **Run variety** | 19 weapons × mods × passives × protocols × 13 pilots → no two runs alike. |
| 8 | **Fair meta** | Meta progression accelerates the player but never replaces build decisions. |
| 9 | **Ads only, never in combat** | Rewarded ads are optional; the only interstitial is between runs, rarely. |
| 10 | **Content as data, mechanics as components** | Numbers and combinations of existing mechanics live in config. A **new mechanic** (a new awakening, protocol or planet rule) is code — built as a reusable behavior component. A reskin must not break the game. |

---

## 3. Design rules: what we DO and what we DON'T

These rules are **hard constraints**. If a task contradicts a rule, the rule wins; raise it with the designer before implementing.

### 3.1 Combat and controls

| ✅ We DO | ❌ We DON'T |
|---|---|
| Auto-fire with auto-aim for every weapon | Manual aiming, aim sticks, tap-to-shoot |
| A floating virtual joystick under the finger anywhere on screen | A fixed joystick in a corner; any second on-screen control |
| Active effects that trigger **by themselves** (e.g. the Repulsor module fires when the ship is surrounded; Buffalo's Ram dashes automatically) | Dash, ultimate, bomb or any button the player has to press in combat |
| Releasing the finger is a valid action (some bonuses reward standing still) | Mechanics that require precise timing (parry, perfect dodge, i-frames on input) |
| Threat = the crowd, positioning and void zones on the ground | Bullet-hell: dense bullet patterns to weave through |
| Rare, slow, telegraphed enemy bullets that **hurt** when they land | Many fast bullets that are each harmless |
| Telegraph every boss attack (zones show a warning before they deal damage; charges have a wind-up) | Instant, unreadable damage sources |
| The game is winnable without kiting; movement is for positioning and pickup | Mandatory kiting as the main skill |
| Planet movement modifiers (e.g. Cryo-7 ice) stay **mild**: they make the player plan position earlier | Movement modifiers that kill instantly or demand twitch precision (pits, instant-death hazards) |

### 3.2 Decisions and build

| ✅ We DO | ❌ We DON'T |
|---|---|
| Pause the game on every choice screen — the choice is a calm, deliberate moment | Choices on a timer or while enemies keep moving |
| Cards show the weapon's **role**, what it evolves into and which passive it needs | Hidden recipes the player has to google |
| Passive cards say which owned weapon they unlock an evolution for | Passives whose build role is invisible |
| Limited slots (4 weapons, 4 passives) so every pick costs something | Unlimited slots where you eventually take everything |
| One Protocol (rule-changing perk) per run, chosen 1 of 3 after the mid-boss | Rule-changing perks dropping as random cards |
| Rerolls and skips as a limited resource | Free unlimited rerolls |
| Power spikes the player can see (evolutions, awakenings) | Invisible +1% upgrades as the main reward |
| Risky protocols (Monolith, Chaos) are allowed to cost the player something — the card states the risk | Protocols that silently break the build |

### 3.3 Session and pacing

| ✅ We DO | ❌ We DON'T |
|---|---|
| 5-minute run to the final boss | Runs of 15–30 minutes |
| Mid-boss at 2:30, final boss at 5:00 | Long stretches without a landmark |
| Endless mode as an opt-in **challenge for a record** after the win | Endless mode as a farm that out-earns normal play (reward multiplier is capped, §4.5) |
| Death in Endless mode still counts as a win | Losing run rewards because the player chose to push further |
| Pause when the app goes to the background | Losing a run because of a notification or app switch |

### 3.4 Meta and economy

| ✅ We DO | ❌ We DON'T |
|---|---|
| Meta that speeds up the player a bit every run | Meta walls that force grinding a planet 10+ times |
| Two currencies: Credits and Fragments | A third "premium" currency |
| Something to buy after almost every run (1–2 meta purchases) | Long saving periods with nothing to spend on |
| Pilots unlocked by Credits **or** by in-game achievements | Pilots locked behind ads or payment |
| A loss still pays: collected loot is kept (§4.7) | "All or nothing" runs |
| Boss power is fixed per planet and does not scale with player level | Bosses that scale with the player and make meta pointless |

### 3.5 Monetization

| ✅ We DO | ❌ We DON'T |
|---|---|
| Rewarded ads that are optional and clearly labeled with the reward | In-app purchases, premium currency, battle pass, subscriptions |
| One interstitial after a run, at most once every 3 runs | Interstitials during a run, on app launch, or in menus |
| Hide an ad button when no ad is available | Showing a button that leads to an error; giving the reward for free when there is no ad |
| Rewards that are nice-to-have | Content or progress available **only** through ads |

### 3.6 Presentation and tech

| ✅ We DO | ❌ We DON'T |
|---|---|
| Neon cyberpunk style, high contrast, readable silhouettes | Visual noise that hides threats |
| All gameplay numbers in the balance config (§10.5) | Magic numbers hardcoded in gameplay code |
| Content as data; new mechanics as reusable behavior components | A one-off hardcoded script per content item |
| Systems that survive a full reskin | Mechanics that only work with a specific art style |
| Every screen works on tall phones (16:9 to 21:9 portrait) | Desktop-only or one-aspect layouts |
| A test/god mode in **dev builds only** | Any cheat or god mode in release builds |

---

## 4. Core loop (the run)

### 4.1 Loop in one line

**Move → kill → collect XP → level up → choose (pause) → become stronger → face the boss → win / push into Endless.**

### 4.2 Run timeline

| Time | Event |
|---|---|
| 0:00 | Spawn with the pilot's home weapon. Waves begin. A magnet pickup is guaranteed near the player at 0:30, 1:00, 1:30 and 2:00 so new players learn to collect. |
| from ~0:30 | Elites start on a fixed schedule (planet-specific, §8). Every elite drops a chest. |
| **2:30** | **Mid-boss.** After it dies → **Protocol** screen: choose 1 of 3 rule-changing perks (once per run). |
| 2:30–5:00 | Harder waves, planet events (rings, rushes, blizzards, nests). |
| **5:00** | **Final boss.** Killing it = planet cleared. |
| After the win | Choice screen: **Evacuate** (take rewards) or **Continue → Endless mode**. |

### 4.3 Boss-fight rules

- **Waves keep spawning during boss fights**, including after 5:00. Enemy growth keeps scaling with time after 5:00 (linearly), so stalling the final boss gets harder by itself. **No enrage timer.**
- If the mid-boss is still alive when the final boss arrives, **both stay** on the field. The Protocol is offered when the mid-boss dies, whenever that happens.
- The run ends only when the final boss dies (win), the player dies (loss) or the player quits (loss).
- Bosses enter from outside the screen and are invulnerable for their first **3 s** (entry shield).

### 4.4 Level-up

- Each level-up pauses the game and offers **3 cards** (4 cards when the player's Luck ≥ 1.25).
- **Card pool** (weighted random without repeats):

| Card | Offered when | Weight |
|---|---|---|
| Weapon level +1 | owned, not maxed, not evolved | 1.3 |
| New weapon | a free weapon slot exists | 0.85 |
| Weapon mod | owned weapon is at max level **or** evolved, and has < 3 mods (one random mod it doesn't have yet) | 0.9 |
| Passive level +1 | owned, not maxed | 1.0 |
| New passive | a free passive slot exists | 0.75 |
| Barrel Overload (+15% damage, infinite) | only with the **Monolith** protocol, for the remaining weapon once it's maxed/evolved | 1.3 |

- If the pool has fewer items than the card count, show fewer cards.
- **"Fully maxed"** = the card pool is empty: all 4 weapon slots filled, each weapon maxed or evolved and carrying 3/3 mods, all 4 passive slots filled and maxed. Only then the level-up shows **super-upgrades** (2 random of 4) **+ a Nano-Medkit card** (+40 HP). With Monolith the pool is never empty (Barrel Overload), so super-upgrades don't appear — by design.
- **Super-upgrades** (infinite, each repeat is 10% weaker than the previous one):

| Super-upgrade | First take | Total limit (geometric) |
|---|---|---|
| Core Overheat | +8% damage | +80% |
| Superconductor | −4% cooldown | −40% (global cooldown floor ×0.35) |
| Armor Plates | +1 armor | +10 |
| Energy Capsule | +25 max HP | +250 |

  After the build is fully maxed, the XP needed per level additionally grows ×1.12 per super-level.
- **Reroll**: redraws the cards. Base 2 per run (+Laboratory). When normal rerolls run out, a rewarded-ad reroll is offered (§11).
- **Skip**: takes nothing, heals 10 HP. Base 2 per run.
- Cards show: icon, name, level, **role tag**, evolution hint ("Evolution: max level + ‹passive›") and, on passive cards, "Needed to evolve: ‹weapon›".

### 4.5 Endless mode

- Entered only after killing the final boss, by explicit choice.
- Entry: a ring of 40 enemies + 1 elite per step; threat starts at **step 2**.
- **Every 10 s the threat goes up one step.** For enemies spawned after that: HP ×1.35 per step and damage ×1.25 per step (compounding), spawn minimum +20% per step. Each new step also spawns one elite.
- **Enemy cap:** in Endless the planet cap is ×1.6 (still limited by the device performance cap). **When the cap is hit, normal spawns pause, elites and bosses ignore the cap, and the per-step HP/damage growth keeps going** — difficulty keeps rising through enemy strength, not count.
- **Endless bosses:** every 60 s a boss spawns — a random one of the planet's own two bosses (mid or final). Boss HP = boss base HP × planet boss multiplier × (0.6 + 0.4 × n), where n is the Endless boss count this run. The per-step **HP** multiplier does **not** apply to bosses; the per-step **damage** multiplier does. (The "boss HP fixed per planet" rule means "independent of player level"; Endless has its own boss ladder.)
- **Rewards:** the Endless credit multiplier = 1 + 0.15 × step, **capped at ×2.0**. Above the cap the player plays only for the record. Plus the Endless time bonus (§10.3).
- Death in Endless = the run is still a **win**; all rewards are kept.
- Target: a fresh build dies in ~30–40 s; a strong build survives minutes.
- The best Endless time per planet is saved and shown (the endgame record).

### 4.6 Revive

Two independent sources; at most **2 revives per run**:

1. **Reserve Clone** (Laboratory upgrade, +1 revive per run). Triggers **automatically first**: revive at 50% HP, 3 s invulnerability, enemies pushed away.
2. **Ad revive** — **1 per run**. After the Reserve Clone is spent (or if the player doesn't own it), death opens a revive offer for 9 s; a rewarded ad grants the same revive. If no ad is available, the offer is **not shown** and the run ends.

### 4.7 End of run and rewards

| Outcome | Player keeps |
|---|---|
| **Win** (final boss killed, evacuated) | Collected Credits + survival bonus + **victory bonus** + Fragments + modules found |
| **Win via Endless death** | Same as win + Endless time bonus |
| **Loss** (died before the final boss) | Collected Credits + survival bonus + Fragments + modules found. **No victory bonus.** |
| **Quit** from the pause menu | Same as Loss |
| **App killed by the OS** mid-run | Same as Loss, settled on next launch (§14) |

Results screen: time, kills, level, bosses killed, Credits/Fragments earned, new records, achievements unlocked, build (weapons with damage). Offer: ×2 Credits for an ad (§11).

### 4.8 Chests

**Sources:** every elite (guaranteed), every boss (guaranteed), Hive nests (30%). Elites follow a fixed schedule per planet (§8), so the first chest arrives at ~0:30 in every run — **the elite schedule is the pity timer**; no extra pity system is needed.

**Resolution order** — one chest resolves exactly one of these, top to bottom:

1. **Evolution** — if any owned weapon is at max level **and** its required passive is owned: the first such weapon (by slot order) evolves. Its mods carry over. Tier shown: *Evolution*.
2. **Awakening** — else, if the pilot's home weapon is evolved and the pilot is not yet awakened: awaken. Tier shown: *Awakening*.
3. **Normal roll** — else: roll = random(0..1) × Luck → **Legendary** (> 0.95): 5 items; **Rare** (> 0.7): 3 items; **Common**: 1 item. Each item = +1 level to a random owned weapon or passive that isn't maxed. If nothing can be leveled → Nano-Medkit (+40 HP).

Every chest also gives 15–40 Credits × the credit multiplier. Opening is an **animated lootbox moment** (the key dopamine beat of the run).

**"Open again" (ad):** opens one more full chest, resolved by the same order. It **adds**, never replaces: if the first roll was an evolution, the second can evolve another eligible weapon or awaken the pilot. 2 per run.

---

## 5. Build system

The depth of the game lives here. Every system below exists to create **meaningful, readable choices**.

### 5.1 Slots

| Slot type | Count |
|---|---|
| Weapons | **4** (1 with Monolith) |
| Passives | **4** |
| Mods per weapon | up to **3** |
| Protocol | **1** per run |

**SLOT_DMG_MUL = 1.3** is a **flat global multiplier on all weapon damage**, always on. It compensates for the 4-slot limit (the genre standard is 6) so that a 4-weapon build kills as fast as the genre norm. It does **not** depend on empty slots and does not stack.

### 5.2 Weapon damage formula

```
weapon_damage = base_damage(level)
              × player_might
              × SLOT_DMG_MUL
              × pilot_signature_dmg_mul (home weapon only)
              × (1 + 0.25 × Overclock_mods)
              × protocol multipliers (Monolith ×2 × (1 + 0.15 × overload levels), Heavy Caliber ×2.5)
weapon_cooldown = base_cd(level) × player_cooldown × signature_cd_mul × 0.85^RapidFire_mods
                × (Monolith 0.75) × (Heavy Caliber 2) × (Mirror 1.4)        floor: 0.08 s
```

At hit time:

```
hit = weapon_damage × random(0.9..1.1) × dynamic_mul
dynamic_mul = 1 + Adrenal (if HP < 50%) + Anchor (if standing still > 0.4 s)
              × 2 if Last Stand and HP < 30%,  × 1.25 if Chaos Protocol
crit chance  = 0.05 × Luck + Optics + 0.15 × Precise_mods      crit = ×2 damage
branded target (Death Brand) takes ×1.5 from other weapons (×1.75 for Raven)
frozen target takes ×1.3
vs elite/boss: × (1 + Tactical AI) and then armor (§5.7)
```

### 5.3 Weapons (19), roles (11) and evolutions

> **Evolution rule:** weapon at max level + its required passive owned → the next chest evolves it (§4.8).

| # | Role | Weapon | Behavior | Required passive | Evolution | Evolved behavior |
|---|---|---|---|---|---|---|
| 1 | Point damage | **Plasma Blaster** | Fires plasma bolts at the nearest enemies | Particle Accelerator | **Plasma Storm** | Continuous stream of piercing plasma |
| 2 | Point damage | **Railgun** | Supersonic slug that pierces every enemy on the line | Neuro-Amplifier | **Annihilator** | Triple antimatter beam |
| 3 | Close range | **Energy Blade** | Laser arc slashing in front of the ship | Nano-Regenerator | **Nano Reaper** | Giant arc; every slash that hits heals 1 HP |
| 4 | Close range | **Orbital Drones** | Drones orbit the ship in bursts and ram enemies | Field Amplifier | **Halo Swarm** | Six drones orbit nonstop |
| 5 | Close range | **EMP Field** | Pulsing aura damages everything around the ship | Nanocomposite | **Quantum Barrier** | Huge aura that damages and slows enemies by 50% |
| 6 | Close range | **Shotgun** | Pellet fan at the nearest enemy; brutal point-blank, falls off with distance | Nanocomposite | **Ripper** | 12 pellets + a shockwave every shot |
| 7 | Area | **Missile Pod** | Homing micro-missiles that explode on impact | Multiplier | **Cluster Salvo** | Each missile splits into cluster bomblets |
| 8 | Area | **Orbital Strike** | Satellite beam strikes random targets on screen | Quantum Scanner | **Spear of Heaven** | A barrage of beams from an orbital group |
| 9 | Chain | **Tesla Coil** | Chain lightning jumps between enemies | Energy Cell | **Storm Reactor** | Stronger arcs that stun every target in the chain |
| 10 | Chain | **Plasma Disc** | Disc flies to an enemy and returns (boomerang) | Gyroscope | **Vortex Blades** | Four huge discs grind through everything |
| 11 | Control | **Singularity** | Gravity well that pulls enemies in (bosses are not pulled) | Chrono-Drive | **Event Horizon** | Powerful black holes pull whole crowds and collapse in an explosion (collapse = well damage ×10) |
| 12 | Control | **Cryo Beam** | Ice beam rotates around the ship and freezes enemies; frozen take +30% damage | Armor Breaker | **Absolute Zero** | Two long beams; frozen enemies shatter into shards on death; frozen elites/bosses have **0 armor** |
| 13 | Anti-boss | **Sniper Rifle** | Shoots the toughest enemy; on a kill, leftover damage ricochets on (up to 3 times) | Optics | **God's Scope** | Two bullets per shot, every bullet is a crit |
| 14 | Anti-boss | **Harpoon-Destroyer** | Hits the toughest nearby target; vs elites/bosses also deals % of their HP | Tactical AI | **Titan Breaker** | Two harpoons that shred the armor of the toughest targets |
| 15 | Course fire | **Machine Gun "Squall"** | Bullet stream along the movement direction; aim assist: nearest enemy within ±35° of heading and 420 px. **Standing still:** fires at the nearest enemy within 520 px (or along the last heading if none) | Servo Drives | **Lead Storm** | Solid stream; the faster the ship moves, the faster it fires |
| 16 | Traps | **Gravimines** | Drops mines behind the ship; they explode when an enemy steps on them | Gravimagnet | **Minefield** | Mines pull enemies in and explode as a group |
| 17 | Defense point | **Sentry Turret** | Deploys a turret that fires at the nearest enemies on its own | Stabilization Anchor | **Firing Point** | Two heavy turrets, 3-shot spreads |
| 18 | Support | **Shield Projector (Aegis)** | Periodic pulse heals the ship and knocks back enemies around | Adrenal Circuit | **Bastion** | Strong pulse: heals, knocks back the crowd and grants a one-hit barrier |
| 19 | Amplify | **Death Brand** | Brands an enemy: it burns, and branded enemies take +50% damage from all other weapons | Tactical AI | **Verdict** | Burn never expires; the death of a burning enemy ignites everyone around |

Per-level stats, cooldowns, projectile counts and ranges: config (placeholders from the merged prototype tables).

### 5.4 Weapon mods (6)

Offered only for weapons at **max level or evolved**; up to 3 per weapon, no duplicates on one weapon. Mods carry over through evolution.

| Mod | Effect (starting value) |
|---|---|
| Overclock | +25% damage of this weapon |
| Rapid Fire | −15% cooldown of this weapon |
| Twin | +1 projectile of this weapon |
| Expander | +25% area and radius of this weapon |
| Precise | +15% crit chance of this weapon |
| Armor-Piercing | +1 pierce; ignores 3 armor of elites and bosses |

### 5.5 Passives (17)

Max 4 per run. Each passive is also the **evolution key** for one or two weapons (§5.3).

| Passive | Effect per level | Max lvl | Evolution key for |
|---|---|---|---|
| Neuro-Amplifier | +10% damage | 5 | Railgun |
| Particle Accelerator | −8% weapon cooldown | 5 | Plasma Blaster |
| Servo Drives | +10% move speed | 5 | Machine Gun |
| Nanocomposite | +1 armor | 5 | EMP Field, Shotgun |
| Nano-Regenerator | +0.15 HP/s | 5 | Energy Blade |
| Gravimagnet | +30% pickup radius | 5 | Gravimines |
| Field Amplifier | +10% attack area | 5 | Orbital Drones |
| Multiplier | +1 projectile for all weapons | 2 | Missile Pod |
| Gyroscope | +10% projectile speed | 5 | Plasma Disc |
| Chrono-Drive | +10% effect duration | 5 | Singularity |
| Energy Cell | +20 max HP | 5 | Tesla Coil |
| Quantum Scanner | +8% XP gained | 5 | Orbital Strike |
| Optics | +5% crit chance | 5 | Sniper Rifle |
| Armor Breaker | ignores 2 armor of elites/bosses | 5 | Cryo Beam |
| Tactical AI | +10% damage vs elites and bosses | 5 | Harpoon, Death Brand |
| Adrenal Circuit | +12% damage while HP < 50% | 5 | Shield Projector |
| Stabilization Anchor | +10% damage while the ship stands still | 5 | Sentry Turret |

**Area soft cap:** total area up to ×1.5 counts fully, above that at half rate, hard cap ×2.2 (area scales the number of targets quadratically).

### 5.6 Crit

Sources: Luck (5% × Luck), the Optics passive, the Precise mod; God's Scope bullets always crit. Crit = ×2 damage.

### 5.7 Armor

There are **two different armor rules**:

| Who | Formula | Order |
|---|---|---|
| **Player** takes damage | `taken = max(1, hit × 0.25, hit − player_armor)` | Flat subtraction; result never below 25% of the hit (armor can never block more than 75%) |
| **Elite / boss** takes damage | `effective_armor = max(0, enemy_armor − Armor Breaker − 3 × Armor-Piercing mods)`; `dealt = max(hit × 0.30, hit − effective_armor)` | Penetration first, then flat subtraction; the hit is never below 30% |

Elite armor = 1 + planet_time / 150; boss armor = 2 + planet_time / 150 (planet time, §10.2). Frozen elites/bosses while Absolute Zero is owned: armor 0. Result: **many small hits are weak against bosses** → the player needs anti-boss coverage.

### 5.8 Protocols (8) — rule-changing perks

Offered once per run, 1 of 3 (random from the 8), right after the mid-boss dies. All 8 are in P0.

| Protocol | Effect | Exact rules |
|---|---|---|
| **Monolith** | Only one weapon remains: damage ×2, cooldown −25%, +1 projectile, levels past max | Kept weapon = **highest total damage dealt this run**. The other weapons are removed with all their projectiles, mines and turrets. Weapon slots become 1 — no new weapon cards. When the kept weapon is maxed/evolved, cards offer **Barrel Overload** (+15% damage each, infinite). If the home weapon is removed, the awakening is no longer possible this run (if already awakened, it is lost) — the card warns: "Your home weapon may be removed." |
| **Glass Core** | Damage ×1.8, max HP ×0.5 | Current HP is **clamped** to the new max (at full HP it is effectively halved; if current HP is already below the new max, it is unchanged). |
| **Heavy Caliber** | Cooldown ×2, damage ×2.5, area ×1.25 | All weapons. |
| **Greedy Contract** | +30% enemies, +50% XP and Credits | Spawn rate and the enemy cap are raised by 30% (design floor: the extra enemies must be visible, so the cap rises with it, within the device cap). |
| **Chaos Protocol** | Damage +25%; every 45 s one weapon is swapped | Swaps one random **non-evolved** weapon (the home weapon is **not** protected) for a random weapon the player doesn't own, at the same level (capped at that weapon's max). The new weapon comes **without mods** and is **never evolved**. Evolved weapons are never swapped. |
| **Magnet Anchor** | Pickup radius ×3, ship speed −20% | — |
| **Last Stand** | Damage ×2 while HP < 30% | — |
| **Mirror** | Weapons also fire backwards; cooldown +40% | **Directional shooters** (Plasma Blaster, Railgun, Plasma Disc) fire an extra copy in the opposite direction. **All other weapons** (orbitals, auras, traps, turrets, beams, homing, chain) get **+1 projectile/instance** instead. The +40% cooldown applies to all weapons. |

### 5.9 Why depth is in choices

The intended decision space per run:

1. **Which pilot** (home weapon, signature bonus, awakening target).
2. **Which 3 extra weapons** (role coverage: crowd vs. boss vs. defense).
3. **Which 4 passives** (stats vs. evolution keys — two weapons can share a key).
4. **When to stop widening and start deepening** (mods, Monolith).
5. **Which Protocol** fits the build at 2:30.
6. **Evacuate or push Endless.**

Movement is secondary: position, collect, step out of zones. A good build with average movement must beat a bad build with perfect movement.

---

## 6. Pilots and awakenings (13)

Each pilot has:
- a **home weapon** (starts with it),
- **stat bonuses** (always on),
- a **signature bonus** on the home weapon,
- an **awakening**: once the home weapon has evolved, the **next chest awakens it** (§4.8) — a unique, run-defining upgrade. One awakening per run.

| Pilot | Home weapon | Stat bonuses | Signature bonus | Awakening | Unlock |
|---|---|---|---|---|---|
| **Kai** | Plasma Blaster | +10% proj. speed, +10 HP | Plasma cooldown −15% | **Supernova** — every 8th volley explodes as a supernova at the target | Free (starter) |
| **Reiji** | Energy Blade | +15% damage, +5% speed, −10 HP | +1 slash | **Thousand Cuts** — every slash also hits 2 more enemies nearby | Free (starter) |
| **Nova** | Orbital Drones | +10% area, +10% duration | +1 drone | **Swarm Mother** — +1 drone per 100 kills (max +6) | 250 Credits |
| **Volt** | Tesla Coil | −8% cooldown, +0.1 HP/s | Lightning jumps 2 more targets | **Storm Front** — lightning leaves charged damage puddles on the ground | 450 Credits |
| **Titan** | Missile Pod | +50 HP, +2 armor, −12% speed | +1 missile per salvo | **Carpet Bombing** — every 15 s, 10 explosions across the screen | 700 Credits |
| **Ghost** | Singularity | +12% speed, +10% XP, +30% pickup radius | Well radius +25% | **Black Star** — wells slow even bosses; the final collapse explosion is ×2 | 1000 Credits |
| **Echo** | Railgun | +10% damage, +20% luck, −4% cooldown | Railgun damage +20% | **Shot Through Worlds** — every shot fires forward and backward | 1400 Credits |
| **Bulldog** | Machine Gun | +15% speed, −10 HP | +1 bullet per burst | **Carousel** — release the finger: while standing still the ship spins and fires in all directions | 1600 Credits |
| **Mole** | Gravimines | +20% area, +10% duration | +1 mine per drop | **Mine Belt** — a ring of 6 self-restoring mines orbits the ship | 2200 Credits |
| **Jay** | Sniper Rifle | +25% damage vs elites/bosses, −10 HP | Rifle charges 30% faster | **Contract** — killing an elite or boss instantly reloads the rifle; the next shot deals ×2 | Achievement: kill 10 bosses (total) |
| **Whaler** | Cryo Beam | +2 armor, −10% cooldown | Freeze lasts +1 s | **Ice Age** — every 10 s an ice wave freezes all enemies on screen | Achievement: win on Cryo-7 |
| **Raven** | Death Brand | +15% luck, −15 HP | Branded take +75% instead of +50% | **Death List** — twice as many brands; killing a burning enemy heals 1 HP | Achievement: kill 100 elites (total) |
| **Buffalo** | Shotgun | +30 HP, +10% damage, −10% pickup radius | Every shot also pushes enemies back with a wave | **Ram** — every 6 s the ship **automatically** dashes to an enemy and fires point-blank, knocking down everything on the path | Achievement: on Neo-Terra, stay inside the dome **continuously from the start of the run for 2:30** (leaving the dome fails the attempt) |

Prices are starting values; target pace is ~1 pilot per day (§10.1). The pilot select screen shows: home weapon, stat bonuses, signature bonus, awakening description, unlock condition and progress.

---

## 7. Threats, enemies and bosses

### 7.1 Threat types

- **Crowd** — the main threat: density, surrounding, blocking paths to XP.
- **Elites** — scaled-up versions of normal enemies (≈5–14× HP, ×1.4 damage, ×1.6 size), armored, drop a guaranteed chest. 50% of elites have the **Void** affix and leave small void zones.
- **Void zones** — ground areas with a **1.2 s warning**, then a slowly drifting damage zone that ticks every 0.5 s. The main boss mechanic.
- **Bullets** — rare (ring density ×0.3), slow (×0.7 speed), each hit painful (×2.2 damage). Gunners fire every 7–10 s.
- **Kamikazes / chargers** — fast, telegraphed, high single-hit damage.

### 7.2 Enemy roster (MVP planets 1–3)

Enemy archetypes: **chaser** (drone, swarm mite, trooper, crawler, brute, mech), **gunner** (slow bullets), **kamikaze** (fast suicide), **phantom** (short teleport-jumps), **nest** (static spawner, Hive), **crate** (breakable loot container). Each planet reskins the archetypes (e.g. Cryo-7: frost drone, snow mite, cryo trooper, ice crawler, frost gunner, ice golem; Hive: xeno drone, larva, xeno warrior, xeno crawler, spitter, bloater, carapace, stalker, xeno brute). Stats: config.

Enemy scaling over a run: HP × (1 + T/150 + (T/600)²) × planet HP mul; damage × (1 + T/360) × planet damage mul; speed × (1 + T/1800), where T is planet time (§10.2).

### 7.3 Bosses (planets 1–3)

Boss HP = base HP × planet boss multiplier × event multiplier. **Never scales with player level.** Phase 2 starts below 50% HP where noted. Every attack is telegraphed.

| Planet | Slot | Boss | Pattern |
|---|---|---|---|
| Neo-Terra | Mid (2:30) | **SENTINEL-01** | Ring of 14 slow bullets every 4.5 s · telegraphed charge every 7 s · 2 void zones around the player every 6.5 s |
| Neo-Terra | Final (5:00) | **SIEGE DREADNOUGHT** | Aimed 3-bullet fan every 5.5 s (phase 2: 4.4 s + bullet ring) · drops 6 drones + 2 void zones every 5.5 s (phase 2: 3 zones) · charge every 8 s |
| Cryo-7 | Mid (HP ×0.4) | **HIVE QUEEN** | Spawns 6 snow mites every 3 s · alternates bullet ring / 3-shot spread every 6 s · 3 void zones every 7 s |
| Cryo-7 | Final (HP ×0.45) | **OMEGA CORE** | Sparse 2-arm bullet spiral · ring of 8 kamikazes around the player every 8 s (phase 2: 6 s) · charge + 2 void zones every 6 s (phase 2: 3) |
| Xenos Hive | Mid (HP ×0.15) | **OMEGA CORE** (Hive variant: bloaters instead of kamikazes) | As above |
| Xenos Hive | Final (HP ×0.35) | **XENOS PROGENITOR** | Spawns 8 larvae every 3.4 s (phase 2: 2.6 s) · alternates bullet ring and 3 void zones (phase 2: 4) · charge every 8 s |

**Boss reuse across planets is allowed** (with a different HP multiplier and themed minions). Bosses for planets 4–10: delivered with the planet content plan (§16).

---

## 8. Planets

- **Linear chain.** Winning a planet unlocks the next one. Cleared planets stay replayable (farming, Endless record).
- Final game: **15+ planets**. **MVP: 10 planets.**
- Each planet: its own arena, palette, waves, events, mid-boss and final boss, difficulty/reward multipliers and **one new mechanic**.

### 8.1 Planets 1–3 (P1 scope)

| | **1. Neo-Terra** | **2. Cryo-7** | **3. Xenos Hive** |
|---|---|---|---|
| Role | Beginner planet, best place to farm Credits | First real test; Fragments start | Hardest of the first three |
| Mechanic | **Healing dome** in the center (radius ~190): heals the player, enemies slow down inside | **Ice inertia** (mild — §3.1) + **blizzards** that hide enemies (3 per run) | **Nests** spawn larvae (destroy them; 30% chest), enemies **split** into 2 larvae on death (18%), **square arena** with corner traps |
| Arena | Circle, r 2500 | Circle, r 2000 | Square, half-size 1600 |
| Elites | Every 45 s from 0:30 | Every 30 s from 0:30 | Every 25 s from 0:25 |
| Enemy HP / DMG mul | ×1.2 / ×1.0 | ×1.3 / ×1.05 | ×1.6 / ×1.3 |
| Boss HP mul | ×0.8 | ×2 | ×3 |
| Credit mul | ×1 | ×2 | ×3.5 |
| XP mul | ×1.15 | ×1.0 | ×0.8 |
| Victory bonus | 150 | 400 | 900 |
| Fragments | — | 4 per boss, 35% per elite | 8 per boss, 60% per elite, 40% per nest |
| Module drop chance per boss | 35% | 60% | 85% |
| Enemy cap (design) | 150 | 300 | 460 |
| Time scale | 1.5 | 1.6 | 1.7 |

### 8.2 Planets 4–10 (P2 scope)

Delivered by the designer as a content plan **before P2 starts** (§16). Each planet follows the "one new mechanic" rule and uses the same data structure as planets 1–3.

---

## 9. Meta loop

### 9.1 Loop in one line

**Run → earn Credits/Fragments/modules → spend in Laboratory / Hangar / Pilots → stronger next run → next planet.**

### 9.2 Laboratory (permanent upgrades, Credits)

Cost of level L (0-based) = base × (1 + 0.9 × L).

| Upgrade | Per level | Max | Base cost | Overload |
|---|---|---|---|---|
| Combat Stimulants | +5% damage | 5 | 100 | ✔ |
| Extended Battery | +10 max HP | 5 | 80 | ✔ |
| Reinforced Frame | +1 armor | 3 | 160 | ✔ |
| Nanosurgery | +0.05 HP/s | 5 | 120 | ✔ |
| CPU Overclock | −2.5% cooldown | 4 | 180 | ✔ |
| Focusing Lenses | +5% area | 4 | 150 | ✔ |
| Servomotors | +5% move speed | 4 | 100 | ✔ |
| Magnetic Accelerators | +5% projectile speed | 3 | 90 | ✔ |
| Field Stabilizer | +5% duration | 3 | 120 | ✔ |
| Data Collector | +15% pickup radius | 4 | 80 | ✔ |
| Neural Net | +4% XP | 5 | 150 | ✔ |
| Trade Protocol | +10% Credits | 5 | 100 | ✔ |
| Quantum Luck | +8% luck (drops, crits, chests) | 3 | 200 | ✔ |
| Reflash | +1 reroll per run | 4 | 120 | ✘ |
| Duplicate Circuit | +1 projectile for all weapons | 1 | 1500 | ✘ |
| Reserve Clone | +1 revive per run (§4.6) | 1 | 1200 | ✘ |

- **Overload:** after an upgrade is maxed it continues infinitely at **50% effect** per level; price = last level price × 1.3 × 1.22ⁿ. Not available for Reflash, Duplicate Circuit and Reserve Clone.
- Target: the full Laboratory (pre-Overload) takes **~2–3 weeks**.
- Respec (refund all) is allowed.

### 9.3 Hangar (modules)

- **10 ship modules**, rarities Common / Rare / Epic / Legendary, levels 1–5.
- **A module works from level 1 as soon as it is installed.** Fragments are needed only to **upgrade** modules and buy extra slots — so the first module found on Neo-Terra on day 1 is immediately useful.
- Drop: from bosses, with the planet's module chance (§8.1); rarity weights per planet — Neo-Terra 80/20/0/0, Cryo-7 45/35/18/2, Hive 20/35/35/10 (C/R/E/L).
- Upgrade cost to level L: Credits = rarity base × L (200 / 350 / 600 / 1000), Fragments = rarity mul × L (1 / 2 / 3 / 5).
- Duplicates are disassembled into Fragments: 2 / 4 / 8 / 15 by rarity.
- **Slots:** 3 base; 4th slot = 1500 Credits + 10 Fragments; 5th slot = 4000 Credits + 40 Fragments.

| Module | Rarity | Effect per level L | Type |
|---|---|---|---|
| Combat Overclock | Common | +5% × L damage | Passive |
| Nano-Plating | Common | +8 × L max HP; +1 armor per 2 levels | Passive |
| Grav-Core | Common | +12% × L pickup radius, +3% × L XP | Passive |
| Salvager | Common | +6% × L Credits | Passive |
| Collector Drone | Rare | Every 4 s pulls all XP within 260 + 40 × L px | Auto-active |
| Scanner | Rare | Shows enemies on the minimap even in blizzards; +5% × L luck | Passive |
| Repulsor | Rare | Triggers itself when ≥ 7 enemies are within 120 px: knocks the crowd back + brief invulnerability. Cooldown 9 − 0.75 × (L−1) s | Auto-active |
| Shield Generator | Epic | Absorbs one hit; recharge 14 − 1.5 × (L−1) s | Auto-active |
| Retaliation Pulse | Epic | When hit: explosion of 60 × (1 + 0.5 × (L−1)) damage around | Auto-active |
| Chrono-Core | Legendary | Every 32 − 2 × L s stops time for enemies for 2 + 0.3 × L s | Auto-active |

No module ever requires a button.

### 9.4 Daily Container

- Free once per day from the main menu, **7-day streak** with growing rewards (table in config); missing a day resets the streak.
- ×2 for a rewarded ad.
- Day boundary: §14.

### 9.5 Pilots

Bought with Credits or unlocked by achievements (§6). Target pace **~1 new pilot per day**.

### 9.6 Achievements

MVP achievements = the 4 pilot unlocks (10 bosses, win on Cryo-7, 100 elites, 2:30 in the dome). Achievement counters (bosses killed, elites killed, best dome stay) are lifetime totals. Extra achievements: before beta (§16).

### 9.7 Currencies

| Currency | Source | Sink |
|---|---|---|
| **Credits** | Every run (§10.3), chests, Daily Container, ads | Laboratory, Overload, pilots, module upgrades, slots |
| **Fragments** | Cryo-7 onward (bosses, elites, nests), duplicate modules | Module upgrades, slots |

No premium currency.

### 9.8 Endgame

1. **Endless record** per planet.
2. **Replay** of cleared planets for farming.
3. **Difficulty modes** (post-MVP).
4. Laboratory Overload as the infinite sink.

### 9.9 Codex

In-game reference: weapons and evolutions (with recipes), passives, protocols, awakenings, weapon mods, enemies, modules. Entries unlock when first seen. **Phase P2.**

---

## 10. High-level balance, formulas and the balance config

### 10.1 Target player day

| Metric | Target |
|---|---|
| Run length (to final boss) | **5:00** |
| Endless extension | 0:30–3:00 (optional) |
| Full run incl. choices, chests, results | ~6–7 min |
| Daily playtime | **25–35 min** |
| Runs per day | **~4–6** |
| Planet progress | **~1 new planet per day** |
| Attempts per planet | **1–2** for planets 1–3, growing later (3–5 for late planets) |
| Meta purchases | **1–2 after every run** (~6–10 per day) |
| New pilot | **~1 per day** (13 pilots ≈ 2 weeks) |
| Laboratory fully upgraded (pre-Overload) | **~2–3 weeks** |
| MVP content (10 planets) cleared | **~10–14 days** |

### 10.2 Run-level targets and time model

- **Planet time** T: enemies and waves grow by T, which accelerates toward the final boss: `T = t + ((timeScale − 1) / 300) × t²` for t ≤ 300 s, then linear `T = 300 × timeScale + timeScale × (t − 300)`. The start feels gentle, the finale dense.
- A fresh player with no meta clears Neo-Terra on attempt 1–2.
- A player who skips meta purchases stalls by planet ~4–5 (meta must matter, but a good build can beat one planet "above" its meta).
- First evolution around minute 2–3 in a focused build; an awakening is reachable before the final boss.
- A fresh player closes the build (all slots maxed) around the final boss; a meta-strong player around minute 4.
- Endless: a fresh build dies in ~30–40 s.
- No single protocol or weapon should be a strict "always pick".

### 10.3 Reward formulas

```
credit_mul      = Trade Protocol/greed × planet_credit_mul × (Greedy Contract 1.5) × endless_mul
endless_mul     = min(2.0, 1 + 0.15 × endless_step)          (1 outside Endless)
collected       = coins (1 each) + big coins (10 each) + chest credits, all × credit_mul
survival_bonus  = 8 × full_minutes_survived × planet_timeScale × planet_credit_mul
victory_bonus   = planet value (win only)
endless_bonus   = 40 × endless_minutes × planet_credit_mul × endless_mul
run_credits     = collected + survival_bonus + victory_bonus + endless_bonus
```

×2 Credits ad doubles `run_credits`. Fragments are never multiplied by `endless_mul`.

### 10.4 XP curve

```
base(L) = 5 + 6 × (L − 1)                 for L < 20
        = 140 + 10 × (L − 20)             for 20 ≤ L < 40
        = 345 + 13 × (L − 40)             for L ≥ 40
if L ≥ 30:  base × 1.06^(L − 29)           (late growth)
k = clamp((L − 10) / 15, 0, 1)
xp_to_next(L) = round(base × (1 + 0.3 × k))   (first 10 levels unchanged, full +30% from level 25)
after full max: × 1.12 per super-level
```

XP per gem × planet XP mul × player Growth.

### 10.5 Balance config

- **MVP:** all gameplay numbers live in **config files (JSON/CSV) in the repo** — the single source of truth for balance in the build. No number is hardcoded in gameplay code (enforced in code review).
- **Designer workflow:** the designer keeps the balance in a **Google Sheet** whose tabs mirror the config files and exports to CSV into the repo. An automated Sheet → config sync is post-MVP.
- Initial numbers are placeholders (seeded from the merged prototype); the tuning pass comes before beta (§16).

Suggested tabs/files:

| File | Contents |
|---|---|
| `global` | Run length, boss timings, slot counts, SLOT_DMG_MUL, armor floors, bullet/void constants, magnet schedule, enemy caps, area soft cap |
| `weapons` | Per-level stats, role, required passive, evolution |
| `evolutions` | Evolved weapon stats |
| `mods` | Weapon mod effects, max per weapon |
| `passives` | Per-level effect, max level |
| `protocols` | Effect values |
| `supers` | Super-upgrade values, decay, XP growth |
| `pilots` | Home weapon, stat bonuses, signature, awakening values, price / unlock condition |
| `enemies` | HP, speed, damage, XP, radius, knockback resist, behavior |
| `bosses` | HP, attack timings, phase thresholds |
| `waves` / `events` | Spawn tables and scripted events per planet |
| `planets` | Order, arena, multipliers, rewards, fragments, module chance, cap, time scale |
| `endless` | Step interval, HP/DMG/density per step, boss interval and ladder, reward step and cap, entry ring |
| `lab` | Upgrades, per-level effect, costs, Overload factor and price growth |
| `modules` | Rarities, effects, upgrade costs, drop weights, slots |
| `economy` | Run rewards, chest credits, Daily Container streak table, ad reward multipliers |
| `ads` | Rewarded limits per run, interstitial frequency |
| `xp` | XP curve parameters |

---

## 11. Monetization

Ads only. Ad SDK behind an abstraction (dev-owned). **Network:** global-first mediation (e.g. AppLovin MAX or AdMob); Russia is secondary — a Yandex Ads adapter for RU traffic can be added later without touching gameplay code. Audience 13+, no Families program.

| # | Placement | Type | Reward / rule |
|---|---|---|---|
| 1 | **Revive** on death | Rewarded | Revive; **1 per run** (on top of the Laboratory Reserve Clone, §4.6) |
| 2 | **Extra reroll** on level-up, when free rerolls run out | Rewarded | +1 reroll, up to **3 per run** |
| 3 | **Open the chest again** | Rewarded | One more full chest (adds, never replaces — §4.8), up to **2 per run** |
| 4 | **Daily Container ×2** | Rewarded | Doubles the daily reward, once per day |
| 5 | **×2 Credits** on the results screen | Rewarded | Doubles run Credits, once per run |
| 6 | **After a run** | Interstitial | At most **once every 3 completed runs** |

Rules:
- **No ad available** (no fill, offline): the button is **hidden**. The revive offer is not shown at all; the run ends normally. No free rewards instead of ads.
- **Interstitial after a rewarded ad:** if the player watched any rewarded ad on that results screen (e.g. ×2 Credits), the interstitial is **skipped** for that run; the counter is not reset, so it shows after the next completed run.
- No IAP, no ads during gameplay, no ads on launch or in menus.

---

## 12. Development phases P0 / P1 / P2

| Phase | Content | Goal |
|---|---|---|
| **P0 — core loop** | Full run on **Neo-Terra** (with dome, both bosses): movement, auto-fire, level-up with rerolls/skips, chests (all tiers), evolutions, weapon mods, super-upgrades, mid-boss → Protocol, final boss, results, rewards on win/loss/quit. **Content:** pilots **Kai + Reiji** (both free) with signature bonuses and awakenings (Supernova, Thousand Cuts); **6 weapons + evolutions:** Plasma Blaster, Energy Blade, Orbital Drones, Missile Pod, Tesla Coil, Sniper Rifle; **8 passives:** Particle Accelerator, Nano-Regenerator, Field Amplifier, Multiplier, Energy Cell, Optics, Neuro-Amplifier, Gravimagnet; **all 6 mods; all 8 protocols.** Laboratory (no Overload). Local save. Settings. EN only. | The core loop is fun and readable on a phone |
| **P1 — full systems** | Planets 1–3 (Neo-Terra, Cryo-7, Xenos Hive) with their mechanics and bosses; Endless mode; revive (Reserve Clone + ad); Hangar + all 10 modules + slots + Fragments; Daily Container; Overload; achievements + achievement pilots (Jay, Whaler, Raven, Buffalo); all 6 ad placements; tutorial; RU localization; core analytics events. | **Soft launch** build |
| **P2 — MVP content** | Remaining weapons/evolutions to 19, remaining passives to 17, pilots to 13 (all awakenings), planets 4–10 (per content plan), Codex. | **Store release** |
| Post-MVP | Planets 11–15+, difficulty modes, Sheet → config sync, extra achievements. | — |

Note: the achievement pilots in P1 need their home weapons (Sniper is in P0; Cryo Beam, Death Brand and Shotgun move into P1 with them).

---

## 13. Tutorial / FTUE (P1)

Short, in-play, no walls of text. Covers exactly three things:

1. **Controls:** "Drag anywhere to move. Your ship fires on its own."
2. **Level-up choice and evolution:** the first level-up explains cards and roles; the first time an evolution becomes possible, one line explains it (max level + passive → chest).
3. **Meta:** after the first run — Laboratory (spend Credits) and Hangar (install a module).

Everything else (protocols, mods, awakenings, Endless) is explained in context the first time it appears, with one line of text (and in the Codex from P2).

---

## 14. App lifecycle, save and time rules

- **Save:** local only, no accounts or cloud save (MVP). Save migration between versions is required (dev-owned).
- **App goes to background:** the run pauses immediately and shows the pause screen on return.
- **App killed by the OS mid-run:** the run is lost; on the next launch it is settled as a **Loss** — the Credits/Fragments/modules earned up to the last autosave are kept (§4.7). Run resume is not required for MVP.
- **Daily Container reset:** device local midnight. Clock manipulation is accepted as low-stakes (local save, no competitive features).
- **Max enemies on screen:** dev sets a performance cap per device tier. Design floors: the planet caps in §8.1; Greedy Contract and Endless must visibly add enemies when the device allows it.

---

## 15. Feature filter

Every new feature, content piece or change must pass **all** of these questions. One "no" = the feature is redesigned or cut.

1. Is it playable with **one finger**?
2. Does it work in **portrait**?
3. Does it add a **decision**, not a reflex?
4. Does it fit into a **5-minute run**?
5. Is it monetized with **ads only** (or not at all)?
6. Will it **survive a reskin** (does it depend on data, not art)?
7. Is every number it needs in the **balance config**?

---

## 16. Open items (owner + deadline)

| ID | Item | Owner | Needed by |
|---|---|---|---|
| L1 | Economy model: income per run vs. all sinks, checked against §10.1 targets | Designer | Before beta |
| L2 | Analytics questions (5–10) on top of the core P1 events | Designer | Before beta |
| L3 | Balance tuning pass on top of the placeholder config | Designer + dev | Before beta |
| L4 | Screen list / UX flows (start from the prototype layouts: Main menu, Pilots, Planets, Laboratory, Hangar, Results, Endless choice, Settings, Codex) | Designer | Before beta |
| L5 | Achievements beyond the 4 pilot unlocks | Designer | Before beta |
| P2-1 | Content plan for planets 4–10: mechanic, arena, waves/events, mid + final boss each | Designer | Before P2 starts |

---

## 17. Glossary

| Term | Meaning |
|---|---|
| Run | One attempt at a planet, 5 minutes to the final boss |
| Planet time | Accelerated time that drives enemy growth and waves (§10.2) |
| Endless | Optional post-win mode with growing threat; a record challenge |
| Protocol | Rule-changing perk, 1 of 3, once per run after the mid-boss |
| Evolution | Upgraded form of a weapon: max level + required passive → chest |
| Awakening | Pilot-specific upgrade of the evolved home weapon, from the next chest |
| Mod | Weapon modifier for maxed/evolved weapons, up to 3 per weapon |
| Super-upgrade | Infinite diminishing stat card after the build is fully maxed |
| Laboratory | Permanent stat upgrades for Credits |
| Overload | Infinite post-max Laboratory levels at 50% effect |
| Hangar | Module collection, slots and upgrades |
| Void zone | Telegraphed damaging ground area |
| Credits / Fragments | The two currencies |

---

## Appendix A — Review resolution log

| ID | Resolution | Where |
|---|---|---|
| D1–D6 | Accepted. Engine Godot; PRD = source of truth; config in repo; local save; phased delivery; generated/free assets | Header, §10.5, §12, §14 |
| B1 | Dev Lead's P0/P1/P2 split accepted; P1 = soft launch, P2 = store release. P0 content fixed | §12 |
| B2 passives | Full list of 17 with effects | §5.5 |
| B2 evolution map | Required passive for all 19 weapons | §5.3, §5.5 |
| B2 weapon behavior | All 19 weapons + evolutions described (all exist in the merged prototype) | §5.3 |
| B2 awakenings | Behavior of all 13 | §6 |
| B2 signatures | All 13 + stat bonuses | §6 |
| B2 modules | All 10 + effects + slots | §9.3 |
| B2 bosses | Mid + final for planets 1–3 with patterns; 4–10 in content plan | §7.3, §16 |
| B2 planets 4–10 | Content plan before P2 | §8.2, §16 |
| U1 | SLOT_DMG_MUL = flat global ×1.3 on all weapon damage | §5.1, §5.2 |
| U2 | Two armor rules with order of operations | §5.7 |
| U3 | No enrage; waves continue; both bosses can coexist | §4.3 |
| U4 | Loss/quit keep collected loot + survival bonus, no victory bonus | §4.7 |
| U5 | Chest resolution order and tier contents | §4.8 |
| U6 | Elite schedule is the pity timer | §4.8, §8.1 |
| U7 | Card pool, "fully maxed" definition, empty-pool behavior | §4.4 |
| U8 | Endless bosses: planet's own bosses, own HP ladder | §4.5 |
| U9 | Cap hit → spawns pause, HP/DMG growth continues | §4.5 |
| U10 | Glass Core clamps current HP to new max | §5.8 |
| U11 | Mirror: directional shooters fire backwards, others +1 instance | §5.8 |
| U12 | XP curve formula | §10.4 |
| C1 | Ghost's awakening renamed to **Black Star** | §6 |
| C2 | Endless credit multiplier capped at ×2.0 | §4.5, §10.3 |
| C3 | Both revives exist: Reserve Clone (auto, first) + 1 ad revive; max 2 per run | §4.6 |
| C4 | Accepted: new mechanics need code as behavior components; combinations are config | §2 pillar 10, §3.6 |
| C5 | Monolith: top total damage this run; home weapon not protected (card warns); Barrel Overload instead of super-upgrades | §5.8, §4.4 |
| C6 | Chaos: only non-evolved weapons, home not protected, replacement same level, no mods, never evolved | §5.8 |
| C7 | "Open again" adds a full chest, can evolve another weapon / awaken | §4.8 |
| C8 | MG standing still: nearest enemy within 520 px, else last heading | §5.3 |
| C9 | Ice inertia kept, intentionally mild | §3.1, §8.1 |
| C11 | Modules work from level 1 on install; Fragments only for upgrades/slots | §9.3 |
| Q1 | Global-first, RU secondary | Header, §11 |
| Q2 | 13+, not directed at children | Header, §11 |
| Q3 | No ad → hide button; revive offer not shown | §11, §4.6 |
| Q4 | Yes: skip interstitial after a rewarded ad on the results screen | §11 |
| Q5 | Buffalo: continuous 2:30 in the dome from run start | §6 |
| Q6 | Accepted: run lost, earned loot kept as Loss | §14 |
| Q7 | Accepted: device local midnight, clock cheating accepted | §14 |
| Q8 | Dev perf cap; design floors = planet caps, Greedy/Endless must visibly add enemies | §14, §5.8 |
| Q9 | Codex in P2 | §9.9, §12 |
| L1–L5 | Open items with owners | §16 |
| §5 Dev-owned | Accepted; aspect ratios 16:9–21:9 portrait reflected | §3.6 |
