const path = require('path');
const player_path = path.join(__dirname, '../..', 'KMPlayer/KMPlayer.exe');
const player = require('play-sound')({ player: player_path });
const soundPath = path.join(__dirname, '..', '..', 'assets', 'sounds');
let audio;
module.exports = {
  wrong: () => {
    let file = path.join(soundPath, 'beep-wrong2.mp3');
    audio = player.play(file);
    return audio;
  },
  success: () => {
    let file = path.join(soundPath, 'beep-true.mp3');
    audio = player.play(file);
    return audio;
  },
  error: () => {
    let file = path.join(soundPath, 'error.mp3');
    audio = player.play(file);
    return audio;
  },
  kill: () => {
    audio.kill();
  }
};
