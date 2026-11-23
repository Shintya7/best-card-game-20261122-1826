// Emberfall Court renderer: the green-baize table, both hands, the cards
// with readable values, the life and ember totals, and every screen.
// One layout function is shared by drawing and by hit-testing, so a click
// lands on the card the player sees.
import {
  ENEMY_NAME,
  GAME_TITLE,
  HOUSES,
  PLAYER_NAME,
  VIEW_HEIGHT,
  VIEW_WIDTH,
} from './config.js';
import { boostedEffect, cardText } from './world.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_OVER = 'over';

const CARD_W = 132;
const CARD_H = 186;
const BACK_W = 54;
const BACK_H = 76;

function roundRect(ctx, x, y, w, h, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function drawGlyph(ctx, kind, cx, cy, size, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(2, size * 0.08);
  if (kind === 'flame') {
    ctx.beginPath();
    ctx.moveTo(cx, cy - size);
    ctx.bezierCurveTo(cx + size * 0.85, cy - size * 0.25, cx + size * 0.6, cy + size * 0.55, cx, cy + size * 0.8);
    ctx.bezierCurveTo(cx - size * 0.6, cy + size * 0.55, cx - size * 0.85, cy - size * 0.25, cx, cy - size);
    ctx.fill();
    ctx.fillStyle = '#ffd23e';
    ctx.beginPath();
    ctx.moveTo(cx, cy - size * 0.35);
    ctx.bezierCurveTo(cx + size * 0.4, cy, cx + size * 0.28, cy + size * 0.45, cx, cy + size * 0.55);
    ctx.bezierCurveTo(cx - size * 0.28, cy + size * 0.45, cx - size * 0.4, cy, cx, cy - size * 0.35);
    ctx.fill();
  } else if (kind === 'drop') {
    ctx.beginPath();
    ctx.moveTo(cx, cy - size);
    ctx.bezierCurveTo(cx + size * 0.75, cy - size * 0.1, cx + size * 0.7, cy + size * 0.75, cx, cy + size * 0.85);
    ctx.bezierCurveTo(cx - size * 0.7, cy + size * 0.75, cx - size * 0.75, cy - size * 0.1, cx, cy - size);
    ctx.fill();
  } else if (kind === 'leaf') {
    ctx.beginPath();
    ctx.moveTo(cx, cy - size * 0.9);
    ctx.bezierCurveTo(cx + size * 0.9, cy - size * 0.3, cx + size * 0.7, cy + size * 0.8, cx, cy + size * 0.9);
    ctx.bezierCurveTo(cx - size * 0.7, cy + size * 0.8, cx - size * 0.9, cy - size * 0.3, cx, cy - size * 0.9);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.moveTo(cx, cy - size * 0.7);
    ctx.lineTo(cx, cy + size * 0.85);
    ctx.stroke();
  } else {
    ctx.beginPath();
    for (let point = 0; point < 10; point += 1) {
      const radius = point % 2 === 0 ? size : size * 0.45;
      const angle = -Math.PI / 2 + (point * Math.PI) / 5;
      const px = cx + Math.cos(angle) * radius;
      const py = cy + Math.sin(angle) * radius;
      if (point === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawCardBack(ctx, x, y, w, h) {
  roundRect(ctx, x, y, w, h, 8);
  ctx.fillStyle = '#3a2b5c';
  ctx.fill();
  ctx.strokeStyle = '#d9a53e';
  ctx.lineWidth = 2;
  ctx.stroke();
  roundRect(ctx, x + 6, y + 6, w - 12, h - 12, 5);
  ctx.strokeStyle = 'rgba(217,165,62,0.6)';
  ctx.stroke();
  drawGlyph(ctx, 'flame', x + w / 2, y + h / 2, Math.min(w, h) * 0.26, '#d9a53e');
}

function drawCard(ctx, card, x, y, w, h, side, selected, playable) {
  const house = HOUSES[card.house];
  const effect = boostedEffect(card, side);
  ctx.save();
  if (!playable) ctx.globalAlpha = 0.55;
  if (selected) {
    ctx.shadowColor = '#ffd23e';
    ctx.shadowBlur = 22;
  }
  roundRect(ctx, x, y, w, h, 10);
  ctx.fillStyle = '#f7efdd';
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.lineWidth = selected ? 3 : 2;
  ctx.strokeStyle = selected ? '#ffd23e' : house.dark;
  ctx.stroke();
  // House band with the card's name.
  roundRect(ctx, x + 2, y + 2, w - 4, 34, 8);
  ctx.fillStyle = house.color;
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 15px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(card.name.toUpperCase(), x + w / 2, y + 24);
  // Cost gem, top left.
  ctx.beginPath();
  ctx.arc(x + 20, y + 52, 15, 0, Math.PI * 2);
  ctx.fillStyle = '#2b6cb0';
  ctx.fill();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 17px Georgia, serif';
  ctx.fillText(String(card.cost), x + 20, y + 58);
  // House name, top right.
  ctx.fillStyle = house.dark;
  ctx.font = 'bold 11px Georgia, serif';
  ctx.textAlign = 'right';
  ctx.fillText(house.name.toUpperCase(), x + w - 10, y + 58);
  ctx.textAlign = 'center';
  // Art: the house glyph, large.
  drawGlyph(ctx, house.glyph, x + w / 2, y + 108, 30, house.color);
  // Effect text.
  ctx.fillStyle = '#2a2118';
  ctx.font = '12px Georgia, serif';
  const lines = wrapText(ctx, cardText(card), w - 18);
  lines.forEach((line, index) => ctx.fillText(line, x + w / 2, y + 146 + index * 14));
  // Power strip along the bottom: the big number, readable at a glance.
  const power = effect.attack > 0 ? effect.attack : effect.guard > 0 ? effect.guard : 0;
  const powerLabel = effect.attack > 0 ? 'DAMAGE' : 'GUARD';
  if (power > 0) {
    ctx.beginPath();
    ctx.moveTo(x + 10, y + h - 32);
    ctx.lineTo(x + w - 10, y + h - 32);
    ctx.lineTo(x + w - 10, y + h - 10);
    ctx.quadraticCurveTo(x + w - 10, y + h - 2, x + w - 18, y + h - 2);
    ctx.lineTo(x + 18, y + h - 2);
    ctx.quadraticCurveTo(x + 10, y + h - 2, x + 10, y + h - 10);
    ctx.closePath();
    ctx.fillStyle = house.dark;
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 15px Georgia, serif';
    ctx.fillText(`${power} ${powerLabel}`, x + w / 2, y + h - 11);
  }
  ctx.restore();
}

function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawLifeBar(ctx, x, y, w, life, maxLife, guard) {
  roundRect(ctx, x, y, w, 26, 13);
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fill();
  const frac = Math.max(0, life / maxLife);
  if (frac > 0) {
    roundRect(ctx, x + 2, y + 2, (w - 4) * frac, 22, 11);
    ctx.fillStyle = frac > 0.5 ? '#58b368' : frac > 0.25 ? '#e0a53e' : '#d94f3d';
    ctx.fill();
  }
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 15px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${life} / ${maxLife}  LIFE`, x + w / 2, y + 19);
  if (guard > 0) {
    const gx = x + w + 12;
    ctx.beginPath();
    ctx.moveTo(gx + 8, y + 2);
    ctx.lineTo(gx + 20, y + 2);
    ctx.lineTo(gx + 20, y + 12);
    ctx.bezierCurveTo(gx + 20, y + 20, gx + 14, y + 24, gx + 8, y + 26);
    ctx.bezierCurveTo(gx + 2, y + 24, gx - 4, y + 20, gx - 4, y + 12);
    ctx.lineTo(gx - 4, y + 2);
    ctx.closePath();
    ctx.fillStyle = '#9ecfff';
    ctx.fill();
    ctx.fillStyle = '#1c3a5c';
    ctx.font = 'bold 11px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(String(guard), gx + 8, y + 15);
    ctx.fillStyle = '#9ecfff';
    ctx.font = 'bold 13px Georgia, serif';
    ctx.textAlign = 'left';
    ctx.fillText('guard', gx + 26, y + 19);
  }
}

function drawEmber(ctx, x, y, ember, maxEmber) {
  ctx.fillStyle = '#ffd23e';
  ctx.font = 'bold 15px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.fillText('EMBER', x, y + 5);
  for (let pip = 0; pip < maxEmber; pip += 1) {
    ctx.beginPath();
    ctx.arc(x + 66 + pip * 20, y, 7, 0, Math.PI * 2);
    ctx.fillStyle = pip < ember ? '#ff8c2e' : 'rgba(255,255,255,0.18)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

function drawPortrait(ctx, x, y, radius, kind) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = kind === 'duchess' ? '#2c2438' : '#4a2c14';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#d9a53e';
  ctx.stroke();
  ctx.clip();
  // Face.
  ctx.beginPath();
  ctx.arc(x, y + 6, radius * 0.52, 0, Math.PI * 2);
  ctx.fillStyle = kind === 'duchess' ? '#e8d8c8' : '#c98d5f';
  ctx.fill();
  // Hood shading.
  ctx.beginPath();
  ctx.arc(x, y - radius * 0.35, radius * 0.62, Math.PI, 0);
  ctx.fillStyle = kind === 'duchess' ? '#241d30' : '#3a2110';
  ctx.fill();
  if (kind === 'duchess') {
    // Crown.
    ctx.fillStyle = '#d9a53e';
    ctx.beginPath();
    ctx.moveTo(x - radius * 0.5, y - radius * 0.42);
    ctx.lineTo(x - radius * 0.28, y - radius * 0.85);
    ctx.lineTo(x, y - radius * 0.5);
    ctx.lineTo(x + radius * 0.28, y - radius * 0.85);
    ctx.lineTo(x + radius * 0.5, y - radius * 0.42);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#1c1626';
    ctx.beginPath();
    ctx.arc(x - radius * 0.2, y + 2, 3, 0, Math.PI * 2);
    ctx.arc(x + radius * 0.2, y + 2, 3, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Ember flame above the warden's brow.
    drawGlyph(ctx, 'flame', x, y - radius * 0.55, radius * 0.28, '#ff8c2e');
    ctx.fillStyle = '#1c1210';
    ctx.beginPath();
    ctx.arc(x - radius * 0.2, y + 4, 3, 0, Math.PI * 2);
    ctx.arc(x + radius * 0.2, y + 4, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// Where everything sits, in canvas pixels. Shared by draw() and hitTest().
export function layout(state) {
  const playerCards = [];
  const hand = state.player.hand;
  const step = Math.min(140, hand.length > 1 ? 880 / (hand.length - 1) : 0);
  const startX = 640 - ((hand.length - 1) * step) / 2 - CARD_W / 2;
  hand.forEach((card, index) => {
    playerCards.push({ x: startX + index * step, y: 514, w: CARD_W, h: CARD_H, index });
  });
  const enemyBacks = [];
  const enemyCount = state.enemy.hand.length;
  const backStep = Math.min(62, enemyCount > 1 ? 420 / (enemyCount - 1) : 0);
  const backStart = 1050 - ((enemyCount - 1) * backStep) / 2 - BACK_W / 2;
  for (let index = 0; index < enemyCount; index += 1) {
    enemyBacks.push({ x: backStart + index * backStep, y: 24, w: BACK_W, h: BACK_H });
  }
  return {
    playerCards,
    enemyBacks,
    endTurn: { x: 1020, y: 296, w: 200, h: 56 },
    playArea: { x: 0, y: 0, w: VIEW_WIDTH, h: VIEW_HEIGHT },
  };
}

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');

  function drawTable() {
    const grad = ctx.createRadialGradient(640, 340, 80, 640, 360, 720);
    grad.addColorStop(0, '#2c6b46');
    grad.addColorStop(0.7, '#1d4a30');
    grad.addColorStop(1, '#12301e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
    ctx.strokeStyle = 'rgba(217,165,62,0.55)';
    ctx.lineWidth = 3;
    roundRect(ctx, 14, 14, VIEW_WIDTH - 28, VIEW_HEIGHT - 28, 18);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(640, 360, 520, 250, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  function drawSide(state, side, isPlayer, yTop) {
    const name = isPlayer ? PLAYER_NAME : ENEMY_NAME;
    drawPortrait(ctx, 74, yTop + 44, 40, isPlayer ? 'warden' : 'duchess');
    ctx.fillStyle = '#f7efdd';
    ctx.font = 'bold 19px Georgia, serif';
    ctx.textAlign = 'left';
    ctx.fillText(name, 128, yTop + 30);
    ctx.fillStyle = 'rgba(247,239,221,0.75)';
    ctx.font = '13px Georgia, serif';
    ctx.fillText(isPlayer ? 'You  ·  the Ember Warden' : 'Rival  ·  mistress of ash', 128, yTop + 52);
    drawLifeBar(ctx, 128, yTop + 62, 260, side.life, 30, side.guard);
    drawEmber(ctx, 520, yTop + 76, side.ember, Math.max(1, side.maxEmber));
    ctx.fillStyle = 'rgba(247,239,221,0.75)';
    ctx.font = '13px Georgia, serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Deck ${side.deck.length}  ·  Discard ${side.discard.length}`, 520, yTop + 100);
  }

  function drawLog(state) {
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    roundRect(ctx, 60, 252, 560, 132, 10);
    ctx.fill();
    ctx.fillStyle = '#ffd23e';
    ctx.font = 'bold 12px Georgia, serif';
    ctx.textAlign = 'left';
    ctx.fillText('THE COURT RECORD', 76, 274);
    ctx.fillStyle = '#f7efdd';
    ctx.font = '14px Georgia, serif';
    state.log.slice(-4).forEach((line, index) => {
      ctx.fillText(line, 76, 298 + index * 24);
    });
  }

  function drawCenter(state) {
    ctx.fillStyle = '#f7efdd';
    ctx.font = 'bold 17px Georgia, serif';
    ctx.textAlign = 'center';
    const turnText = state.phase === 'enemy' ? 'THE DUCHESS PLAYS…' : `TURN ${state.turn} — YOUR MOVE`;
    ctx.fillText(turnText, 640, 210);
    ctx.fillStyle = '#ffd23e';
    ctx.font = 'bold 15px Georgia, serif';
    ctx.fillText(`SCORE  ${state.score}`, 640, 236);
    drawLog(state);
    const button = layout(state).endTurn;
    const enabled = state.phase === 'player';
    roundRect(ctx, button.x, button.y, button.w, button.h, 10);
    ctx.fillStyle = enabled ? '#d9a53e' : 'rgba(255,255,255,0.15)';
    ctx.fill();
    ctx.strokeStyle = enabled ? '#fff' : 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = enabled ? '#241a08' : 'rgba(255,255,255,0.5)';
    ctx.font = 'bold 16px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('END TURN  [E]', button.x + button.w / 2, button.y + 35);
    ctx.fillStyle = 'rgba(247,239,221,0.7)';
    ctx.font = '12px Georgia, serif';
    ctx.textAlign = 'right';
    ctx.fillText('House bonus: a second card of the', 1252, 380);
    ctx.fillText('same house in one turn gains +2.', 1252, 398);
  }

  function drawFloats(state) {
    for (const float of state.floats) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - float.age / 1.4);
      ctx.fillStyle = float.color;
      ctx.font = 'bold 26px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText(float.text, float.x, float.y - float.age * 46);
      ctx.restore();
    }
  }

  function drawTitle(state, best) {
    ctx.fillStyle = 'rgba(8,14,10,0.82)';
    ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
    drawGlyph(ctx, 'flame', 640, 118, 34, '#ff8c2e');
    ctx.fillStyle = '#ffd23e';
    ctx.font = 'bold 64px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(GAME_TITLE, 640, 210);
    ctx.fillStyle = '#f7efdd';
    ctx.font = 'italic 22px Georgia, serif';
    ctx.fillText('A duel of cards against the Ashen Duchess', 640, 252);
    ctx.font = '17px Georgia, serif';
    ctx.fillStyle = 'rgba(247,239,221,0.9)';
    ctx.fillText('Spend ember to play cards. Bring the Duchess to 0 life before she does the same to you.', 640, 306);
    ctx.fillText('A second card of the same house in one turn gains +2. Guard soaks damage first.', 640, 334);
    ctx.fillText('Click a card or press 1–7 to play it · E ends your turn · P pauses · M mutes', 640, 362);
    if (best > 0) {
      ctx.fillStyle = '#ffd23e';
      ctx.font = 'bold 18px Georgia, serif';
      ctx.fillText(`Best score: ${best}`, 640, 404);
    }
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px Georgia, serif';
    ctx.fillText('— CLICK OR PRESS SPACE TO BEGIN —', 640, 470);
    ctx.font = '14px Georgia, serif';
    ctx.fillStyle = 'rgba(247,239,221,0.65)';
    ctx.fillText('An original game · Emberfall Court · no network, no account, just the duel', 640, 512);
  }

  function drawOver(state, best) {
    const won = state.winner === 'player';
    ctx.fillStyle = won ? 'rgba(20,40,16,0.95)' : 'rgba(40,14,10,0.95)';
    ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
    ctx.fillStyle = won ? '#ffd23e' : '#e2543e';
    ctx.font = 'bold 58px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(won ? 'VICTORY' : 'DEFEAT', 640, 220);
    ctx.fillStyle = '#f7efdd';
    ctx.font = 'italic 22px Georgia, serif';
    ctx.fillText(
      won ? 'The Ashen Duchess bows. The Court is yours.' : 'The Duchess prevails — the embers go cold.',
      640,
      264,
    );
    ctx.font = '19px Georgia, serif';
    ctx.fillText(`Score ${state.score}  ·  Damage dealt ${state.damageDealt}  ·  Cards played ${state.cardsPlayed}`, 640, 330);
    ctx.fillText(`The duel lasted ${state.turn} turn${state.turn === 1 ? '' : 's'}  ·  Best score ${Math.max(best, state.score)}`, 640, 360);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 22px Georgia, serif';
    ctx.fillText('— PRESS R OR CLICK TO DUEL AGAIN —', 640, 440);
  }

  function drawPaused() {
    ctx.fillStyle = 'rgba(8,14,10,0.78)';
    ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
    ctx.fillStyle = '#f7efdd';
    ctx.font = 'bold 44px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', 640, 340);
    ctx.font = '18px Georgia, serif';
    ctx.fillText('Press P or Space to return to the duel', 640, 384);
  }

  function draw(state, screen, best) {
    drawTable();
    if (screen === SCREEN_TITLE || state.phase === 'title') {
      drawTitle(state, best);
      return;
    }
    drawSide(state, state.enemy, false, 18);
    drawSide(state, state.player, true, 400);
    const placed = layout(state);
    for (const back of placed.enemyBacks) drawCardBack(ctx, back.x, back.y, back.w, back.h);
    ctx.fillStyle = 'rgba(247,239,221,0.8)';
    ctx.font = '13px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${state.enemy.hand.length} cards in hand`, 1050, 122);
    if (screen === SCREEN_OVER) {
      // The end screen stands on its own: no turn text, log or hand
      // showing through the overlay.
      drawOver(state, best);
      return;
    }
    drawCenter(state);
    const selected = state.selectedIndex ?? -1;
    placed.playerCards.forEach((rect) => {
      const card = state.player.hand[rect.index];
      const playable = state.phase === 'player' && card.cost <= state.player.ember;
      const y = rect.index === selected ? rect.y - 18 : rect.y;
      drawCard(ctx, card, rect.x, y, rect.w, rect.h, state.player, rect.index === selected, playable);
    });
    drawFloats(state);
    if (screen === SCREEN_PAUSED) drawPaused();
  }

  return { draw, layout };
}
