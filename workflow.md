# 🌷 Flower Valley

## Interactive Virtual World — A-Frame

> โลกเสมือนขนาดเล็กแนว Cozy Farming / Life Simulation
> ผู้เล่นสามารถปลูกดอกไม้ ตกปลา สร้างช่อดอกไม้ ทำงานศิลปะ สำรวจโลก พูดคุยกับ NPC และบริหารเงินกับพลังงานของตัวเอง

---

# 1. Project Overview

**Flower Valley** เป็น Interactive Virtual World ที่สร้างด้วย A-Frame โดยผู้เล่นจะเข้ามาใช้ชีวิตในสวนดอกไม้ขนาดเล็ก

ผู้เล่นสามารถ:

* 🌱 ซื้อเมล็ดพันธุ์จาก NPC
* 🌷 ปลูกดอกไม้
* 💧 รดน้ำดอกไม้
* ☔ ดูแลดอกไม้ตามสภาพอากาศ
* 🌸 รอให้ดอกไม้เติบโต
* ✂️ เก็บดอกไม้
* 💐 ทำช่อดอกไม้
* 🏪 ขายดอกไม้และช่อดอกไม้
* 🎣 ตกปลา
* 🎮 เล่น Mini Game ตกปลา A / D
* 🐟 ขายปลาให้ NPC
* 🎨 ทำงานศิลปะใน Workshop
* 🧱 สร้างงาน 3D จาก Primitive
* 🪑 นั่งพักชมวิว
* ⚡ ฟื้น Energy
* 🌙 นอนเพื่อข้ามวัน
* 🏪 ซื้อเมล็ดพันธุ์และ Upgrade
* 🌦️ พบสภาพอากาศที่แตกต่างกัน
* 🌞 เล่นในช่วงกลางวันและกลางคืน
* 📖 ดูข้อมูลของดอกไม้แต่ละชนิด

---

# 2. Main Gameplay Loop

```text
                    ┌─────────────────┐
                    │    START DAY    │
                    │ Energy = 100    │
                    │ Money = 500     │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   EXPLORE WORLD │
                    └────────┬────────┘
                             │
       ┌─────────────────────┼─────────────────────┐
       │                     │                     │
       ▼                     ▼                     ▼
 ┌────────────┐        ┌────────────┐       ┌────────────┐
 │ 🌱 FARM    │        │ 🎣 FISHING │       │ 🎨 WORKSHOP│
 └─────┬──────┘        └─────┬──────┘       └─────┬──────┘
       │                     │                     │
       ▼                     ▼                     ▼
   Flowers                  Fish                  Art
       │                     │                     │
       └──────────────┬──────┴─────────────────────┘
                      │
                      ▼
                ┌──────────────┐
                │     SELL     │
                └──────┬───────┘
                       │
                       ▼
                 💰 EARN MONEY
                       │
          ┌────────────┼─────────────┐
          │            │             │
          ▼            ▼             ▼
      🌱 Seeds     ⚡ Energy      🏡 Farm
      Purchase      Upgrade       Upgrade
          │
          ▼
      👨‍🌾 Seed Seller
          │
          ▼
      Plant Flowers
          │
          ▼
       🌙 NIGHT
          │
      ┌───┴────┐
      ▼        ▼
    🪑 Rest   🛏️ Sleep
      │        │
      ▼        ▼
   Energy   Next Day
    +20
```

---

# 3. World Map

```text
                         NORTH
                           ↑

               🌲 🌲 🌲 🌲 🌲 🌲
          ┌──────────────────────────┐
          │                          │
          │      🌊 FISHING LAKE     │
          │                          │
          │        🎣  🐟            │
          │                          │
          └────────────┬─────────────┘
                       │
                       │
                 🌳 RELAX AREA
                    🪑 🪵
                       │
     ┌─────────────────┼──────────────────┐
     │                 │                  │
     │    🌷 FARM      │      🏡 HOUSE   │
     │                 │                  │
     │ 🌱 🌱 🌱 🌱     │                  │
     │ 🌷 🌻 🌹 🌼     │                  │
     │                 │                  │
     └──────────┬──────┴──────┬───────────┘
                │             │
                ▼             ▼
       🏪 FLOWER SHOP    🎨 WORKSHOP
                │             │
                │             │
                ▼             ▼
       👨‍🌾 SEED SHOP     🧑‍🎨 ART NPC
                │
                │
                ▼
             MAIN ROAD
                │
                ▼
              🚪 EXIT
```

---

# 4. World Zones

## 4.1 🌱 Flower Farm

พื้นที่หลักสำหรับทำการเกษตร

Activities:

* ปลูกเมล็ด
* รดน้ำ
* ตรวจสอบการเติบโต
* เก็บดอกไม้
* ขยายแปลง
* Upgrade Farm

Workflow:

```text
Farm Plot
    ↓
Choose Seed
    ↓
Plant
    ↓
Water
    ↓
Growing
    ↓
Ready
    ↓
Harvest
    ↓
Inventory
```

---

# 5. 👨‍🌾 Seed Seller / Seed Shop

## หน้าที่

NPC คนขายเมล็ดพันธุ์เป็น NPC สำคัญของระบบ Farming

ผู้เล่นต้องหาเงินก่อนจึงสามารถซื้อเมล็ดพันธุ์ได้

```text
💰 Money
    ↓
👨‍🌾 Seed Seller
    ↓
Open Seed Shop
    ↓
Choose Seed
    ↓
Check Money
    ├── ❌ Money Not Enough
    │       ↓
    │   "เงินไม่พอ"
    │
    └── ✅ Money Enough
            ↓
        Buy Seed
            ↓
        Money -
            ↓
        Seed +
            ↓
        Inventory
```

## Seed Shop UI

```text
┌──────────────────────────────┐
│       🌱 SEED SHOP           │
├──────────────────────────────┤
│ 🌼 Daisy        10 Coins     │
│ 🌷 Tulip        15 Coins     │
│ 🌻 Sunflower    25 Coins     │
│ 🌹 Rose         40 Coins     │
│ 💜 Lavender     60 Coins     │
├──────────────────────────────┤
│ 💰 Money: 250                │
│                              │
│ [ Buy ]       [ Close ]      │
└──────────────────────────────┘
```

---

# 6. 🌷 Flower System

ดอกไม้แต่ละชนิดมีข้อมูลของตัวเอง

| Flower    | Growth | Seed Price | Sell Price |
| --------- | -----: | ---------: | ---------: |
| Daisy     | 2 Days |         10 |         25 |
| Tulip     | 2 Days |         15 |         30 |
| Sunflower | 3 Days |         25 |         50 |
| Rose      | 4 Days |         40 |         80 |
| Lavender  | 5 Days |         60 |        120 |

Data:

```ts
type Flower = {
  id: string;
  name: string;
  seedPrice: number;
  sellPrice: number;
  growthDays: number;
  color: string;
  description: string;
};
```

---

# 7. 🌱 Farming State

```text
EMPTY
  ↓
SEEDED
  ↓
GROWING
  ↓
READY
  ↓
HARVESTED
  ↓
EMPTY
```

ตัวอย่าง:

```text
🌱 Seed
 ↓
🌿 Growing
 ↓
🌷 Ready
 ↓
✂️ Harvest
 ↓
🎒 Inventory
```

---

# 8. 💧 Water System

วันที่อากาศปกติ:

```text
☀️ Sunny
   ↓
Check Crop
   ↓
Need Water?
   ├── YES → 💧 Water
   └── NO  → Continue
```

วันที่ฝนตก:

```text
🌧️ Rain
   ↓
Automatic Water
   ↓
ไม่ต้องรดน้ำ
```

---

# 9. ☔ Weather System

Weather หลัก:

```text
☀️ SUNNY
🌧️ RAIN
```

อนาคตสามารถเพิ่ม:

```text
☁️ CLOUDY
⛈️ STORM
```

Weather ส่งผลต่อ:

* การรดน้ำ
* Sky
* Lighting
* Particle
* Environment
* Gameplay

Flow:

```text
Game Time
    ↓
Weather Check
    ↓
 ┌──┴─────┐
 ▼        ▼
Sunny    Rain
 │         │
 ▼         ▼
Manual    Auto
Water     Water
```

---

# 10. ✂️ Harvest System

เมื่อดอกไม้โตเต็มที่:

```text
Flower READY
      ↓
Player Near
      ↓
[E] Interact
      ↓
Harvest
      ↓
Flower disappears
      ↓
Inventory +1
      ↓
Farm Plot = EMPTY
```

---

# 11. 🎒 Inventory System

Inventory เก็บ:

```text
Seeds
Flowers
Fish
Bouquets
Artwork
```

ตัวอย่าง:

```text
┌─────────────────────────────┐
│          INVENTORY          │
├─────────────────────────────┤
│ 🌱 Tulip Seed × 3           │
│ 🌷 Tulip × 2                │
│ 🌹 Rose × 1                 │
│ 🌻 Sunflower × 5            │
│ 🐟 Fish × 2                 │
│ 💐 Bouquet × 1              │
└─────────────────────────────┘
```

---

# 12. 💐 Bouquet System

ผู้เล่นสามารถนำดอกไม้หลายชนิดมาทำเป็นช่อ

```text
🎒 Flowers
      ↓
💐 Bouquet Table
      ↓
Select Flowers
      ↓
Combine
      ↓
Calculate Price
      ↓
Create Bouquet
      ↓
Inventory
```

ตัวอย่าง:

```text
🌹 Rose
+
🌷 Tulip
+
🌻 Sunflower
      ↓
💐 Mixed Bouquet
      ↓
160 Coins
```

---

# 13. 🏪 Flower Shop

ร้านดอกไม้เป็นพื้นที่ขายสินค้า

NPC:

```text
🧑 Customer
👩 Customer
🧔 Customer
```

Workflow:

```text
Customer Arrives
      ↓
Customer Request
      ↓
Player Checks Inventory
      ↓
Choose Flower / Bouquet
      ↓
Sell
      ↓
💰 Money +
```

ตัวอย่าง Order:

```text
"ฉันต้องการช่อดอกไม้สีแดง"
```

---

# 14. 💰 Economy System

เงินสามารถได้รับจาก:

```text
Sell Flowers
Sell Bouquets
Sell Fish
Sell Artwork
```

เงินสามารถใช้:

```text
Buy Seeds
Upgrade Energy
Upgrade Farm
Buy Decorations
```

Flow:

```text
                  💰 MONEY
                      │
          ┌───────────┼────────────┐
          │           │            │
          ▼           ▼            ▼
       🌱 Seeds    ⚡ Energy    🌷 Farm
       Purchase     Upgrade      Upgrade
```

---

# 15. ⚡ Energy System

เริ่มต้น:

```text
Energy = 100
MaxEnergy = 100
```

กิจกรรม:

| Activity | Energy |
| -------- | -----: |
| Plant    |     -5 |
| Water    |     -3 |
| Harvest  |     -5 |
| Fishing  |    -10 |
| Workshop |    -15 |
| Running  |     -1 |

เมื่อ Energy ต่ำ:

```text
Energy < 20
      ↓
⚠️ Tired
```

เมื่อ Energy = 0:

```text
Energy = 0
      ↓
Heavy Activities Disabled
      ↓
Rest Required
```

---

# 16. 🪑 Relax Area

ผู้เล่นสามารถนั่งพักในสวน

```text
Player
 ↓
Approach Chair
 ↓
[E]
 ↓
Sit
 ↓
Camera Changes
 ↓
Energy +20
```

สามารถเพิ่ม:

* เสียงธรรมชาติ
* เสียงนก
* ลม
* เพลงเบา ๆ
* กล้องชมวิว

---

# 17. 🛏️ Sleep System

เมื่อถึงช่วงกลางคืน:

```text
🌙 Night
    ↓
Go Home
    ↓
Bed
    ↓
[E] Sleep
    ↓
Save Game
    ↓
Next Day
    ↓
Energy = MaxEnergy
    ↓
Morning
```

---

# 18. 🌞 Day / Night System

ตัวอย่างเวลา:

```text
06:00 → Morning
10:00 → Day
15:00 → Afternoon
18:00 → Sunset
20:00 → Night
24:00 → End Day
```

สิ่งที่เปลี่ยน:

```text
Time
 ↓
Sky
 ↓
Lighting
 ↓
Fog
 ↓
Stars
 ↓
NPC Schedule
 ↓
Weather
```

---

# 19. 🎣 Fishing System

พื้นที่:

```text
🌊 Fishing Lake
```

Workflow:

```text
Go to Lake
    ↓
Fishing Spot
    ↓
[E] Fish
    ↓
Cast Rod
    ↓
Wait
    ↓
🐟 Fish Bites
    ↓
Fishing Mini Game
```

---

# 20. 🎮 Fishing Mini Game

หน้าจอ:

```text
┌─────────────────────────┐
│      🎣 FISHING         │
│                         │
│          🐟             │
│                         │
│ Fish HP ███████░░░      │
│                         │
│        [ A ] [ D ]      │
└─────────────────────────┘
```

Flow:

```text
Fish Bites
    ↓
Generate Input
    ↓
Player Press A / D
    ↓
Correct?
 ┌──┴─────┐
 ▼        ▼
YES       NO
 │         │
 ▼         ▼
Fish HP   Fish Escape
  ↓
HP = 0
  ↓
Catch Fish
  ↓
Inventory
```

---

# 21. 🐟 Fish Buyer NPC

NPC รับซื้อปลาโดยเฉพาะ

```text
Player
 ↓
Fish Inventory
 ↓
🐟 Fish Buyer
 ↓
[E]
 ↓
Sell Fish
 ↓
💰 Money +
```

ตัวอย่าง:

| Fish         | Price |
| ------------ | ----: |
| 🐟 Carp      |    40 |
| 🐠 Goldfish  |    60 |
| 🐡 Rare Fish |   150 |

---

# 22. 🎨 Workshop

Workshop มี 3 ส่วน

```text
          🎨 WORKSHOP
               │
       ┌───────┼────────┐
       ▼       ▼        ▼
   🖌️ Paint  🧱 3D    🖼️ Display
```

---

# 23. 🖌️ Painting

```text
Enter Workshop
      ↓
Choose Canvas
      ↓
Choose Color
      ↓
Paint
      ↓
Finish
      ↓
Artwork
```

---

# 24. 🧱 3D Art

Primitive:

```text
Cube
Sphere
Cylinder
Cone
```

ผู้เล่นสามารถ:

```text
Select Object
      ↓
Position
      ↓
Rotation
      ↓
Scale
      ↓
Color
      ↓
Save
```

จุดนี้ช่วยแสดง Requirement:

* Position
* Rotation
* Scale
* Color
* Material

---

# 25. 📖 Flower Encyclopedia

ผู้เล่นสามารถดูข้อมูลดอกไม้

```text
Flower
  ↓
[E] / Click
  ↓
Info Card
```

ตัวอย่าง:

```text
┌──────────────────────┐
│ 🌹 ROSE              │
│                      │
│ Growth: 4 Days       │
│ Seed: 40 Coins       │
│ Sell: 80 Coins       │
│ Water: Required      │
│                      │
│ A beautiful flower   │
│ often used in        │
│ bouquets.            │
│                      │
│ [ CLOSE ]            │
└──────────────────────┘
```

---

# 26. 👨‍🌾 NPC System

NPC หลัก:

| NPC               | หน้าที่        |
| ----------------- | -------------- |
| 👨‍🌾 Seed Seller | ขายเมล็ดพันธุ์ |
| 🧑 Flower Buyer   | รับซื้อดอกไม้  |
| 🐟 Fish Buyer     | รับซื้อปลา     |
| 🧑 Customer       | ซื้อช่อดอกไม้  |
| 🎨 Workshop NPC   | แนะนำ Workshop |

NPC ต้องมี:

* Position
* Rotation
* Animation
* Dialogue
* Interaction
* Schedule

---

# 27. 🗣️ NPC Interaction

```text
Player Near NPC
      ↓
Show [E] Interact
      ↓
Press E
      ↓
Open Dialogue
      ↓
Show NPC Options
```

ตัวอย่าง Seed Seller:

```text
┌──────────────────────────┐
│ 👨‍🌾 Seed Seller          │
│                          │
│ "ต้องการเมล็ดพันธุ์ไหม?" │
│                          │
│ [ Buy Seeds ]            │
│ [ Talk ]                 │
│ [ Close ]                │
└──────────────────────────┘
```

---

# 28. 🧑 Customer System

ลูกค้าอาจมีความต้องการแตกต่างกัน

```text
Customer
   ↓
Generate Request
   ↓
"ต้องการ Rose Bouquet"
   ↓
Check Inventory
   ↓
Create / Select Bouquet
   ↓
Sell
   ↓
💰 Reward
```

---

# 29. 🎮 Player Controls

```text
W
↑
Move Forward

S
↓
Move Backward

A
←
Move Left

D
→
Move Right

Mouse
→
Look Around

E
→
Interact
```

สำหรับ Fishing Mini Game:

```text
A / D
→
Control Fishing
```

---

# 30. 🌍 A-Frame Environment

ต้องมี:

```text
Ground
Sky
Lighting
Trees
Flowers
House
Shop
Lake
Workshop
NPC
Props
```

ตัวอย่าง:

```html
<a-scene>

  <a-sky></a-sky>

  <a-plane
    position="0 0 0"
    rotation="-90 0 0">
  </a-plane>

</a-scene>
```

---

# 31. 🧱 Primitive Objects

ใช้ Primitive ของ A-Frame:

```text
<a-box>
<a-sphere>
<a-cylinder>
<a-cone>
<a-plane>
<a-ring>
```

ใช้สร้าง:

```text
บ้าน
โต๊ะ
เก้าอี้
ป้าย
รั้ว
กระถาง
แปลงปลูก
ของตกแต่ง
```

---

# 32. 🧩 3D Models

โฟลเดอร์:

```text
models/
├── environment/
│   ├── house.glb
│   ├── shop.glb
│   ├── workshop.glb
│   └── tree.glb
│
├── characters/
│   ├── farmer.glb
│   └── customer.glb
│
├── flowers/
│   ├── rose.glb
│   ├── tulip.glb
│   ├── sunflower.glb
│   └── lavender.glb
│
└── props/
    ├── chair.glb
    ├── table.glb
    └── fishing_rod.glb
```

---

# 33. 📁 Assets

```text
public/
├── images/
│   ├── flowers/
│   ├── ui/
│   └── backgrounds/
│
├── models/
│   ├── environment/
│   ├── characters/
│   ├── flowers/
│   └── props/
│
└── textures/
    ├── ground/
    ├── wood/
    ├── water/
    └── sky/
```

Assets สามารถเรียกใช้จาก HTML หรือ TSX

---

# 34. ✨ Animation

Animation ที่ควรมี:

## Flowers

```text
Idle
 ↓
Gentle Sway
```

## Trees

```text
Wind
 ↓
Slight Movement
```

## NPC

```text
Idle
Walk
Talk
```

## Fish

```text
Swim
```

## Environment

```text
Day
 ↓
Sunset
 ↓
Night
```

---

# 35. 🖥️ Main HUD

```text
┌─────────────────────────────────────────┐
│ Day 3      ☀️ Sunny       14:35         │
│                                         │
│                          💰 1,250       │
│                          ⚡ 75 / 100     │
│                                         │
│                                         │
│               3D WORLD                  │
│                                         │
│                                         │
│                                         │
│             [E] Interact                │
└─────────────────────────────────────────┘
```

---

# 36. 💾 Save System

Prototype ใช้ `localStorage`

```ts
type GameState = {
  day: number;
  time: number;
  weather: "sunny" | "rain";

  money: number;

  energy: number;
  maxEnergy: number;

  inventory: Record<string, number>;

  farm: FarmPlot[];

  upgrades: {
    farmLevel: number;
    energyLevel: number;
  };
};
```

Save:

```text
Game State
    ↓
localStorage
    ↓
Save
```

Load:

```text
Start Game
    ↓
Check Save
    ↓
Load Game
    ↓
Continue
```

---

# 37. 📁 Recommended Project Structure

```text
src/
├── components/
│   ├── World.tsx
│   ├── Player.tsx
│   ├── Farm.tsx
│   ├── Flower.tsx
│   ├── SeedShop.tsx
│   ├── FlowerShop.tsx
│   ├── FishingLake.tsx
│   ├── FishingGame.tsx
│   ├── Workshop.tsx
│   ├── NPC.tsx
│   ├── Customer.tsx
│   ├── Inventory.tsx
│   ├── InfoCard.tsx
│   └── HUD.tsx
│
├── systems/
│   ├── gameTime.ts
│   ├── weather.ts
│   ├── farming.ts
│   ├── fishing.ts
│   ├── energy.ts
│   ├── economy.ts
│   ├── npc.ts
│   └── interaction.ts
│
├── data/
│   ├── flowers.ts
│   ├── seeds.ts
│   ├── fishes.ts
│   ├── bouquets.ts
│   └── npcs.ts
│
├── assets/
│   ├── images/
│   ├── models/
│   └── textures/
│
└── App.tsx
```

---

# 38. 🚀 Development Workflow

## Phase 1 — Project Setup

```text
Create Project
      ↓
Install A-Frame
      ↓
Create Scene
      ↓
Setup Camera
      ↓
Setup WASD
      ↓
Test Movement
```

---

## Phase 2 — Build World

```text
Ground
 ↓
Sky
 ↓
Lighting
 ↓
Trees
 ↓
House
 ↓
Farm
 ↓
Flower Shop
 ↓
Seed Shop
 ↓
Fishing Lake
 ↓
Workshop
 ↓
Relax Area
```

---

## Phase 3 — Player Interaction

```text
Player
 ↓
Interaction Detection
 ↓
[E]
 ↓
Find Object
 ↓
Execute Action
```

---

## Phase 4 — Farming

```text
Seed Shop
 ↓
Buy Seed
 ↓
Inventory
 ↓
Farm
 ↓
Plant
 ↓
Water
 ↓
Growth
 ↓
Harvest
```

---

## Phase 5 — Economy

```text
Harvest
 ↓
Inventory
 ↓
Flower Shop
 ↓
Sell
 ↓
Money
 ↓
Seed Shop
 ↓
Buy More Seeds
```

---

## Phase 6 — Fishing

```text
Lake
 ↓
Cast Rod
 ↓
Fish Bites
 ↓
Mini Game
 ↓
A / D
 ↓
Catch
 ↓
Fish Inventory
 ↓
Fish Buyer
 ↓
Money
```

---

## Phase 7 — Time & Weather

```text
Game Clock
 ↓
Day / Night
 ↓
Lighting
 ↓
Weather
 ↓
Crop Water
 ↓
NPC Schedule
```

---

## Phase 8 — Workshop

```text
Workshop
 ↓
Painting
 ↓
3D Primitive
 ↓
Transform
 ↓
Artwork
```

---

## Phase 9 — NPC

```text
Seed Seller
 ↓
Customer
 ↓
Flower Buyer
 ↓
Fish Buyer
 ↓
Workshop NPC
 ↓
Dialogue
 ↓
Interaction
```

---

## Phase 10 — Polish

```text
Animation
 ↓
Sound
 ↓
Particle
 ↓
UI
 ↓
Transitions
 ↓
Performance
 ↓
Bug Fix
```

---

# 39. 🎯 MVP — Minimum Viable Project

หากเวลาพัฒนาไม่มาก ให้ทำระบบเหล่านี้ก่อน:

### Must Have

* [ ] A-Frame Scene
* [ ] Ground
* [ ] Sky
* [ ] Player Movement
* [ ] Camera
* [ ] Farm
* [ ] Flower
* [ ] Seed Seller NPC
* [ ] ซื้อเมล็ด
* [ ] ปลูก
* [ ] รดน้ำ
* [ ] Flower Growth
* [ ] Harvest
* [ ] Inventory
* [ ] Sell Flower
* [ ] Money
* [ ] Energy
* [ ] Day / Night
* [ ] Weather
* [ ] Fishing
* [ ] A/D Fishing Mini Game
* [ ] Fish Buyer
* [ ] Relax Area
* [ ] Sleep
* [NPC Interaction]
* [Animation]

### Nice to Have

* [ ] Bouquet System
* [ ] Customer Orders
* [ ] Workshop
* [ ] Painting
* [ ] 3D Art
* [ ] Farm Upgrade
* [ ] Energy Upgrade
* [Flower Encyclopedia]
* [Sound
* [Particle Effects]
* [Save System]

---

# 40. 🧪 Testing Checklist

## Movement

* [ ] W/A/S/D ทำงาน
* [ ] Mouse Look ทำงาน
* [ ] ไม่สามารถเดินทะลุ Object สำคัญ

## Farming

* [ ] ซื้อเมล็ดได้
* [ ] เงินลดหลังซื้อ
* [ ] เมล็ดเพิ่มใน Inventory
* [ ] ปลูกได้
* [ ] รดน้ำได้
* [ ] ฝนตกแล้วไม่ต้องรดน้ำ
* [ ] ดอกไม้เติบโต
* [ ] เก็บดอกไม้ได้

## Economy

* [ ] ขายดอกไม้ได้
* [ ] เงินเพิ่ม
* [ ] เงินไม่พอซื้อของไม่ได้
* [ ] Upgrade หักเงินถูกต้อง

## Fishing

* [ ] ตกปลาได้
* [ ] Mini Game ทำงาน
* [ ] A/D ตรวจจับถูกต้อง
* [ ] จับปลาได้
* [ ] ปลาเข้ากระเป๋า
* [ ] ขายปลาได้

## Time

* [ ] เวลาเดิน
* [ ] กลางวัน
* [ ] Sunset
* [ ] กลางคืน
* [ ] นอนได้
* [ ] วันใหม่
* [ ] Energy Reset

## NPC

* [ ] Seed Seller
* [ ] Flower Buyer
* [ ] Fish Buyer
* [ ] Customer
* [ ] Dialogue
* [ ] Interaction

## A-Frame

* [ ] Primitive Objects
* [ ] 3D Models
* [ ] Position
* [ ] Rotation
* [ ] Scale
* [ ] Material
* [ ] Texture
* [ ] Animation
* [ ] Interaction

---

# 41. 🏁 Final User Experience

ผู้เล่นควรสามารถเล่นตาม Flow นี้ได้ตั้งแต่ต้นจนจบ:

```text
                    🌅 START
                       │
                       ▼
                  🏡 บ้าน
                       │
                       ▼
                  💰 เงินเริ่มต้น
                       │
                       ▼
              👨‍🌾 Seed Seller
                       │
                       ▼
                 🌱 ซื้อเมล็ด
                       │
                       ▼
                  🌷 ปลูก
                       │
                       ▼
                  💧 รดน้ำ
                       │
              ┌────────┴────────┐
              │                 │
            ☀️ Sunny           🌧️ Rain
              │                 │
           รดน้ำเอง          Auto Water
              │                 │
              └────────┬────────┘
                       ▼
                  🌸 เติบโต
                       │
                       ▼
                    ✂️ เก็บ
                       │
                       ▼
                  🎒 Inventory
                       │
              ┌────────┴─────────┐
              │                  │
              ▼                  ▼
        🏪 Flower Shop       💐 Bouquet
              │                  │
              └────────┬─────────┘
                       ▼
                    💰 เงิน
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
      🌱 Seeds      ⚡ Energy    🏡 Farm
          │
          ▼
       ปลูกต่อ

                       +

                  🌊 Fishing
                       │
                       ▼
                   🎣 Fish
                       │
                       ▼
                 A / D Mini Game
                       │
                       ▼
                    🐟 Fish
                       │
                       ▼
                 🐟 Fish Buyer
                       │
                       ▼
                    💰 เงิน

                       +

                  🎨 Workshop
                       │
              ┌────────┼────────┐
              ▼        ▼        ▼
           🖌️ Paint   🧱 3D   🖼️ Art
              │        │        │
              └────────┼────────┘
                       ▼
                    Reward

                       ↓

                   ⚡ ENERGY
                       ↓
                 🪑 Relax Area
                       ↓
                   Rest / +Energy
                       ↓
                    🌙 NIGHT
                       ↓
                    🛏️ Sleep
                       ↓
                  🌅 NEXT DAY
                       ↓
                 🔄 GAME LOOP
```

---

# 42. Final Project Requirements Mapping

| อาจารย์กำหนด  | Flower Valley                      |
| ------------- | ---------------------------------- |
| Environment   | 🌳 Garden / Farm / Lake / Shop     |
| Ground        | 🌱 Farm Ground                     |
| Sky / 360°    | 🌌 Day/Night Sky                   |
| Primitive     | Box / Sphere / Cylinder / Cone     |
| 3D Model      | House / NPC / Flower / Tree        |
| Position      | Objects / Farm / NPC               |
| Rotation      | Player / NPC / Objects             |
| Scale         | Flowers / Objects / 3D Art         |
| Appearance    | Color / Material / Texture         |
| Movement      | WASD                               |
| Look Around   | Mouse                              |
| Animation     | Flower / NPC / Fish / Environment  |
| Interaction   | E / Click                          |
| Activity      | Farming / Fishing / Workshop       |
| Goal          | Earn Money / Upgrade Farm          |
| Exploration   | Explore Garden / Lake / Shop       |
| Selection     | Seeds / Flowers / Fish / Art       |
| Time          | Day / Night                        |
| Weather       | Sunny / Rain                       |
| Game System   | Energy / Money / Inventory         |
| NPC           | Seed Seller / Buyers / Customers   |
| Mini Game     | Fishing A/D                        |
| Information   | Flower Encyclopedia                |
| Rest          | Relax Area                         |
| Progression   | Energy / Farm Upgrade              |
| Gameplay Loop | Earn → Buy → Farm → Sell → Upgrade |

---

# 43. Core Concept Summary

```text
🌷 FLOWER VALLEY

Explore
   ↓
Buy Seeds
   ↓
Plant
   ↓
Water
   ↓
Grow
   ↓
Harvest
   ↓
Create Bouquet
   ↓
Sell
   ↓
Earn Money
   ↓
Buy Seeds / Upgrade
   ↓
Fishing
   ↓
Sell Fish
   ↓
Workshop
   ↓
Rest
   ↓
Sleep
   ↓
Next Day
   ↓
Repeat
```

**เป้าหมายหลักของผู้เล่น:**
สร้างสวนดอกไม้ของตัวเอง หาเงินจากดอกไม้และปลา พัฒนาพื้นที่ และใช้ชีวิตสำรวจโลกเสมือนให้ได้มากที่สุด

**จุดสำคัญของโปรเจกต์:** โลก 3D ไม่ได้มีไว้สำหรับดูเพียงอย่างเดียว แต่ทุกพื้นที่มีหน้าที่และ Interaction ที่เชื่อมต่อกันเป็น Gameplay Loop เดียว
