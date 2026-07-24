import { Injectable } from '@nestjs/common';
import { shuffle } from 'libs/index';

const emojiChoices = [
  '🐥',
  '⚓',
  '🧋',
  '📺',
  '📦',
  '🍓',
  '🍫',
  '🍵',
  '🏀',
  '💾',
  '🛸',
  '👖',
  '👌',
  '👀',
  '🦷',
  '🍂',
  '👻',
  '🌭',
  '🐳',
  '🚲',
  '💥',
  '📖',
  '🦝',
  '👑',
  '💸',
  '💭',
  '🖼️',
  '🦖',
  '🍩',
  '🏆',
  '🌴',
  '⌛',
  '❄️',
  '🏈',
  '🍑',
  '🦴',
  '⚽',
  '👎',
  '🐷',
  '🎃',
  '🎈',
  '🤠',
  '🔑',
  '⚾',
  '🍌',
  '🍉',
  '🌚',
  '🍇',
  '🍕',
  '♻️',
  '🎬',
  '🔒',
  '💧',
  '🐝',
  '🐸',
  '👍',
  '💰',
  '📞',
  '✈️',
  '💻',
  '🦁',
  '🧊',
  '🌈',
  '🧲',
  '🐰',
  '🎥',
  '🍿',
  '👽',
  '🏠',
  '🌦️',
  '🎲',
  '🌞',
  '🦜',
  '🧠',
  '🥝',
  '🧩',
  '🔥',
  '🦄',
  '🪥',
  '♨️',
  '⚡',
  '☢️',
  '🚀',
  '🌎',
  '😺',
  '🍔',
  '🐬',
  '📌',
  '👟',
  '🍒',
  '🥶',
  '🎵',
  '🐵',
  '🔔',
  '🏔️',
  '💙',
  '🤖',
  '🌻',
  '🦒',
];

@Injectable()
export class EmojiService {
  getEmojiToChoose(verificationEmojis: string[]) {
    let toReturn = [...verificationEmojis];
    for (let i = 0; i < 8; i++) {
      let choice = emojiChoices[this.getRandomNumber(0, emojiChoices.length)];
      while (toReturn.includes(choice)) {
        choice = emojiChoices[this.getRandomNumber(0, emojiChoices.length)];
      }
      toReturn.push(choice);
    }

    while (toReturn.join('').includes(verificationEmojis.join(''))) {
      toReturn = shuffle(toReturn);
    }

    return toReturn;
  }

  getEmojis() {
    const toReturn: string[] = [];
    for (let i = 0; i < 4; i++) {
      let choice = emojiChoices[this.getRandomNumber(0, emojiChoices.length)];
      while (toReturn.includes(choice)) {
        choice = emojiChoices[this.getRandomNumber(0, emojiChoices.length)];
      }
      toReturn.push(choice);
    }
    return shuffle(toReturn);
  }

  private getRandomNumber(min: number, max: number) {
    return Math.floor(Math.random() * (max - min) + min);
  }
}
