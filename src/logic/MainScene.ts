import Phaser from "phaser";

/**
 * Reef Keeper Idle — cozy idle aquarium; rewarded ads are diegetic ("sponsor a fish").
 */

interface Fish {
  sprite: Phaser.GameObjects.Image;
  speed: number;
  dir: number;
  yBase: number;
}

export class MainScene extends Phaser.Scene {
  private coins = 0;
  private fishCount = 1;
  private tankLevel = 1;
  private hud!: Phaser.GameObjects.Text;
  private fish: Fish[] = [];
  private lastTick = 0;
  private sponsorReady = true;

  constructor() {
    super("MainScene");
  }

  preload() {
    const g = this.make.graphics({ x: 0, y: 0 });
    // water bg is rectangle; fish textures
    const colors = [0xf472b6, 0x38bdf8, 0xfbbf24, 0x34d399, 0xa78bfa];
    colors.forEach((c, i) => {
      g.clear();
      g.fillStyle(c);
      g.fillEllipse(16, 10, 28, 16);
      g.fillTriangle(2, 10, 0, 4, 0, 16);
      g.generateTexture(`fish${i}`, 32, 20);
    });
    g.clear();
    g.fillStyle(0xfbbf24);
    g.fillCircle(6, 6, 6);
    g.generateTexture("coin", 12, 12);
    g.destroy();
  }

  create() {
    const w = this.scale.width;
    const h = this.scale.height;

    // tank
    this.add.rectangle(w / 2, h / 2, w, h, 0x0c4a6e);
    this.add.rectangle(w / 2, h / 2 + 40, w - 20, h - 100, 0x0369a1, 0.55);
    // sand
    this.add.rectangle(w / 2, h - 30, w, 60, 0xd6b370);
    // coral blobs
    this.add.ellipse(100, h - 70, 50, 70, 0xfb7185, 0.8);
    this.add.ellipse(w - 120, h - 80, 60, 90, 0xc084fc, 0.75);

    this.add
      .text(16, 10, "Reef Keeper Idle", {
        fontFamily: "system-ui",
        fontSize: "22px",
        color: "#e0f2fe",
        fontStyle: "bold",
      });

    this.hud = this.add.text(16, 40, "", {
      fontFamily: "system-ui",
      fontSize: "15px",
      color: "#bae6fd",
    });

    this.spawnFish();

    // UI buttons
    this.makeBtn(16, h - 52, "Feed (+1 coin/s)", () => {
      if (this.coins >= 5) {
        this.coins -= 5;
        this.tankLevel += 1;
      }
    });
    this.makeBtn(200, h - 52, "Buy fish (12🪙)", () => {
      if (this.coins >= 12) {
        this.coins -= 12;
        this.fishCount += 1;
        this.spawnFish();
      }
    });
    this.makeBtn(400, h - 52, "Sponsor a fish 🎬", () => {
      // Diegetic rewarded ad stand-in
      if (!this.sponsorReady) return;
      this.sponsorReady = false;
      this.coins += 25;
      this.fishCount += 1;
      this.spawnFish();
      const banner = this.add
        .text(w / 2, h / 2, "Thanks, OceanCola!\n(+25 coins + 1 fish)", {
          fontFamily: "system-ui",
          fontSize: "20px",
          color: "#0f172a",
          backgroundColor: "#fde68a",
          padding: { x: 14, y: 10 },
          align: "center",
        })
        .setOrigin(0.5);
      this.time.delayedCall(1800, () => {
        banner.destroy();
        this.sponsorReady = true;
      });
    });

    this.input.on("pointerdown", (p: Phaser.Input.Pointer) => {
      // tap fish for bonus
      this.fish.forEach((f) => {
        if (
          Phaser.Math.Distance.Between(p.x, p.y, f.sprite.x, f.sprite.y) < 28
        ) {
          this.coins += 1;
          const c = this.add.image(f.sprite.x, f.sprite.y, "coin");
          this.tweens.add({
            targets: c,
            y: c.y - 40,
            alpha: 0,
            duration: 500,
            onComplete: () => c.destroy(),
          });
        }
      });
    });
  }

  private makeBtn(x: number, y: number, label: string, onClick: () => void) {
    const t = this.add
      .text(x, y, label, {
        fontFamily: "system-ui",
        fontSize: "14px",
        color: "#0f172a",
        backgroundColor: "#7dd3fc",
        padding: { x: 10, y: 8 },
      })
      .setInteractive({ useHandCursor: true });
    t.on("pointerdown", onClick);
  }

  private spawnFish() {
    const i = this.fish.length % 5;
    const y = 120 + Math.random() * (this.scale.height - 220);
    const sprite = this.add.image(
      40 + Math.random() * (this.scale.width - 80),
      y,
      `fish${i}`,
    );
    sprite.setScale(1.2);
    this.fish.push({
      sprite,
      speed: 30 + Math.random() * 40,
      dir: Math.random() > 0.5 ? 1 : -1,
      yBase: y,
    });
  }

  update(time: number, delta: number) {
    // passive income
    if (time - this.lastTick > 1000) {
      this.lastTick = time;
      this.coins += this.fishCount * this.tankLevel;
    }

    this.hud.setText(
      `🪙 ${this.coins} · 🐟 ${this.fishCount} · tank lv ${this.tankLevel} · +${this.fishCount * this.tankLevel}/s · tap fish · sponsor = rewarded ad`,
    );

    const w = this.scale.width;
    this.fish.forEach((f) => {
      f.sprite.x += f.dir * f.speed * (delta / 1000);
      f.sprite.y = f.yBase + Math.sin(time / 400 + f.sprite.x * 0.02) * 8;
      f.sprite.setFlipX(f.dir < 0);
      if (f.sprite.x > w - 30) f.dir = -1;
      if (f.sprite.x < 30) f.dir = 1;
    });
  }
}
