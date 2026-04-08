export const AVATAR_STYLES = [
  'avataaars',
  'bottts',
  'micah',
  'lorelei',
  'adventurer',
  'adventurer-neutral',
  'big-ears',
  'big-ears-neutral',
  'big-smile',
  'croodles',
  'croodles-neutral',
  'fun-emoji',
  'icons',
  'identicon',
  'initials',
  'miniavs',
  'open-peeps',
  'personas',
  'pixel-art',
  'pixel-art-neutral',
  'shapes',
  'thumbs',
];

export const AVATAR_SEEDS = [
  'Felix', 'Aneka', 'Jocelyn', 'Nala', 'Leo', 'Mia', 'Sam', 'Zoe', 'Max', 'Luna', 'Kiki', 'Bear',
  'Toby', 'Bella', 'Charlie', 'Lucy', 'Oscar', 'Chloe', 'Buddy', 'Lily', 'Milo', 'Sophie', 'Rocky', 'Daisy',
  'Jack', 'Millie', 'Simba', 'Rosie', 'Dexter', 'Ruby', 'Loki', 'Sasha', 'Finn', 'Penny', 'Cooper', 'Lola'
];

export function getRandomAvatar() {
  const style = AVATAR_STYLES[Math.floor(Math.random() * AVATAR_STYLES.length)];
  const seed = AVATAR_SEEDS[Math.floor(Math.random() * AVATAR_SEEDS.length)];
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}`;
}

export function generateAvatarsList(count: number = 30) {
  const list = [];
  for (let i = 0; i < count; i++) {
    const style = 'avataaars'; // Preferimos avataaars para consistencia humana, o mix.
    const seed = AVATAR_SEEDS[i % AVATAR_SEEDS.length] + i.toString(); // unique seed
    list.push(`https://api.dicebear.com/7.x/${style}/svg?seed=${seed}`);
  }
  return list;
}

export const PRESET_AVATARS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka&backgroundColor=c0aede',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Jocelyn&backgroundColor=d1d4f9',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Nala&backgroundColor=ffd5dc',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Leo&backgroundColor=ffdfbf',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Mia&backgroundColor=d1d4f9',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Sam&backgroundColor=b6e3f4',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Zoe&backgroundColor=c0aede',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Max&backgroundColor=ffd5dc',
  
  'https://api.dicebear.com/7.x/bottts/svg?seed=Pepper&backgroundColor=b6e3f4',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Shadow&backgroundColor=c0aede',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Gizmo&backgroundColor=ffdfbf',
  
  'https://api.dicebear.com/7.x/micah/svg?seed=Bear&backgroundColor=d1d4f9',
  'https://api.dicebear.com/7.x/micah/svg?seed=Kiki&backgroundColor=ffdfbf',
  'https://api.dicebear.com/7.x/micah/svg?seed=Luna&backgroundColor=ffd5dc',
  
  'https://api.dicebear.com/7.x/lorelei/svg?seed=Ruby&backgroundColor=b6e3f4',
  'https://api.dicebear.com/7.x/lorelei/svg?seed=Sasha&backgroundColor=c0aede',
  'https://api.dicebear.com/7.x/lorelei/svg?seed=Penny&backgroundColor=ffdfbf'
];
