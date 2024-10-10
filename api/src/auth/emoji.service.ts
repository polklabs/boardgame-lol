import { Injectable } from '@nestjs/common';

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
      toReturn = this.shuffle(toReturn);
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
    return this.shuffle(toReturn);
  }

  private getRandomNumber(min: number, max: number) {
    return Math.floor(Math.random() * (max - min) + min);
  }

  private shuffle<T>(array: T[]): T[] {
    let currentIndex = array.length;
    let randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }

    return array;
  }
}
