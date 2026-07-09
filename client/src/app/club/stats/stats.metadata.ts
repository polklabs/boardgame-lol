import { StatNumbers, StatArrays } from '../../shared/models/stats.model';

export type Trophy = {
  emoji: string;
  title: string;
  info: string;
  arrayKey: StatArrays;
  array?: unknown[];
  valueKey: StatNumbers;
  value?: number;
};

export const TROPHIES: Trophy[] = [
  {
    emoji: '👑',
    title: 'The Game Master',
    info: 'Most Wins',
    arrayKey: 'MostWinsPlayers',
    valueKey: 'MostWins',
  },
  {
    emoji: '🧩',
    title: 'Jack Of All Trades',
    info: 'Most Unique BoardGame Wins',
    arrayKey: 'MaxUniqueWinsPlayers',
    valueKey: 'MaxUniqueWins',
  },
  {
    emoji: '🔥',
    title: 'The Hot Streak',
    info: 'Longest Win Streak',
    arrayKey: 'LongestWinStreakPlayers',
    valueKey: 'LongestWinStreak',
  },
  {
    emoji: '🕺',
    title: 'The Comeback Kid',
    info: 'Longest Streak Between Wins',
    arrayKey: 'BestComebackPlayers',
    valueKey: 'BestComeback',
  },
  {
    emoji: '🤝',
    title: 'The Great Compromiser',
    info: 'Most Ties',
    arrayKey: 'MostTiesPlayers',
    valueKey: 'MostTies',
  },
  {
    emoji: '🥋',
    title: 'The Weekend Warrior',
    info: 'Most Wins On the Weekend',
    arrayKey: 'MostWeekendWinsPlayers',
    valueKey: 'MostWeekendWins',
  },
  {
    emoji: '1️⃣',
    title: 'The One Hit Wonder',
    info: 'Only Win 1 Game',
    arrayKey: 'OnlyWon1Game',
    valueKey: 'OnlyWon1GameLength',
  },
  {
    emoji: '🥇',
    title: 'The Fan Favorite',
    info: 'Most Played Game',
    arrayKey: 'MostPlaysGames',
    valueKey: 'MostPlays',
  },
  {
    emoji: '🕹️',
    title: 'Just One More Game',
    info: 'Most Games Played In One Day',
    arrayKey: 'MostPlaysOneDayDate',
    valueKey: 'MostPlaysOneDay',
  },
  {
    emoji: 'U+003{FavXPlayerCount} U+FE0F U+20E3',
    title: 'Favorite {FavXPlayerCount} Player Game',
    info: 'Game played most with {FavXPlayerCount} players',
    arrayKey: 'FavXPlayerGame',
    valueKey: 'FavXPlayer',
  },
  {
    emoji: '📆',
    title: "We're All In This Together",
    info: 'Days since everyone playing the game won',
    arrayKey: 'LastGroupWinGame',
    valueKey: 'LastGroupWinDays',
  },
  {
    emoji: '🏅',
    title: 'Participation Trophy',
    info: 'Most Losses',
    arrayKey: 'MostLosses',
    valueKey: 'MostLosses',
  },
];
