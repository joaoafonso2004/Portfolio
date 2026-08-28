import type { ImageMetadata } from 'astro';
import redbullImg from '../assets/images/work_redbull.png';
import pizzariaImg from '../assets/images/work_pizzaria.png';
import sirocoImg from '../assets/images/work_siroco.png';
import duotoneImg from '../assets/images/work_duotone_phones.jpg';
import duotoneOriginalImg from '../assets/images/work_duotone.png';
import td1 from '../assets/images/3DWebsite1.png';
import td2 from '../assets/images/3DWebsite2.png';
import duo1 from '../assets/images/Duotone1.png';
import duo2 from '../assets/images/Duotone2.png';
import duo3 from '../assets/images/Duotone3.png';
import duo4 from '../assets/images/Duotone4.png';
import duo5 from '../assets/images/Duotone5.png';
import mog1 from '../assets/images/mog1.png';
import mog2 from '../assets/images/mog2.png';
import mog3 from '../assets/images/mog3.png';
import mog4 from '../assets/images/mog4.png';
import radarImg from '../assets/images/work_radar.png';
import jarvisImg from '../assets/images/work_jarvis.png';
import liminal1 from '../assets/images/liminal1_up.jpg';
import liminal2 from '../assets/images/liminal2_up.jpg';
import liminal3 from '../assets/images/liminal3.jpg';

export interface Project {
  slug: string;
  title: string;
  category: string;
  description: string;
  github?: string;
  live?: string;
  /** Imagem de cartaz. Idealmente o primeiro frame do vídeo, para a troca
   *  entre os dois ser invisível. */
  img: ImageMetadata;
  /** Galeria de imagens adicionais para a página do projeto. */
  gallery: ImageMetadata[];
  /** Opcional, em `public/work/`. Sem ficheiro, fica só a imagem. */
  video?: string;
  /** Layout da galeria. Default é grid-2 com Bento Box. grid-3 é melhor para imagens verticais. */
  galleryLayout?: 'default' | 'grid-3';
  /**
   * A galeria é feita de capturas de ecrã de telemóvel. Só afecta o telemóvel:
   * a moldura de dispositivo e o carrossel horizontal evitam que uma captura
   * de um telemóvel, vista num telemóvel, se confunda com a própria página.
   * No desktop a grelha mantém-se exactamente como está.
   */
  galleryDevice?: boolean;
  /**
   * Proporção da imagem de cartaz em ecrãs pequenos. `tall` é para posters e
   * renders com o assunto ao centro — um 16:9 encolhido para 188px de altura
   * não é um herói, é uma miniatura. Vídeos ficam em `wide`: recortar uma
   * gravação de ecrã esconde justamente aquilo que ela mostra.
   */
  heroCrop?: 'wide' | 'tall';
  /** Estatísticas de destaque para exibir na página do projeto */
  stats?: { label: string; value: string }[];
  /** Peso visual no anel — nem todos os projetos merecem o mesmo espaço. */
  weight?: number;
}

export const PROJECTS: Project[] = [
  {
    slug: 'red-bull-editions',
    title: 'Red Bull Editions',
    category: 'Brand Concept — Interactive',
    description: 'A dynamic interactive experience showcasing the vibrant energy of Red Bull Editions. Designed with fluid animations and a bold visual style.',
    github: 'https://github.com/joaoafonso2004/RedBull-Website',
    live: 'https://redbullja.vercel.app/',
    img: redbullImg,
    gallery: [],
    video: '/work/RedBull.mp4',
    weight: 1.15,
  },
  {
    slug: 'jarvis',
    title: 'JARVIS',
    category: 'AI Assistant — Windows Desktop',
    description:
      'A Windows desktop assistant that listens for a wake word, holds conversation memory and operates the machine itself. Tauri and React on the surface, with a Node agent server, local Whisper transcription and Piper speech underneath.',
    github: 'https://github.com/joaoafonso2004/JARVIS',
    img: jarvisImg,
    gallery: [],
    weight: 1.1,
  },
  {
    slug: 'neapolitan-space',
    title: 'Neapolitan Space',
    category: 'Restaurant — Web Experience',
    description: 'An immersive web experience for an authentic Neapolitan pizzeria, featuring mouth-watering visuals and smooth scroll-driven storytelling.',
    github: 'https://github.com/joaoafonso2004/Pizzaria-',
    live: 'https://pizzaja.vercel.app/',
    img: pizzariaImg,
    gallery: [],
    video: '/work/pizzaria.mp4',
  },
  {
    slug: 'siroco-tours',
    title: 'Siroco Tours',
    category: 'Tourism — Booking Platform',
    description: 'A clean and fast booking platform for Siroco Tours. Designed for seamless user experience, helping travelers explore and book adventures effortlessly.',
    live: 'https://siroco-tours-sandy.vercel.app/',
    img: sirocoImg,
    gallery: [],
    video: '/work/Siroco.mp4',
  },
  {
    slug: 'duotone',
    title: 'Duotone',
    category: 'Music App — iOS & PC',
    description: 'A cross-platform music application concept built with a sleek, minimalist UI. Focuses on intuitive navigation and high-quality aesthetics.',
    github: 'https://github.com/joaoafonso2004/duotone',
    img: duotoneImg,
    gallery: [duo1, duo2, duo3, duo4, duo5],
    galleryLayout: 'grid-3',
    galleryDevice: true,
    heroCrop: 'tall',
    weight: 1.15,
  },
  {
    slug: 'liminal',
    title: 'Liminal',
    category: 'Psychological Horror — Godot',
    description: 'A psychological horror game developed in Godot Engine. Features atmospheric environments and tense, immersive gameplay.',
    github: 'https://github.com/joaoafonso2004/LIMINAL',
    live: 'https://joaoafonso.itch.io/liminal',
    img: liminal1,
    gallery: [liminal1, liminal2, liminal3],
    video: '/work/LIMINAL.mp4',
    stats: [
      { label: 'Impressions', value: '3.4k' },
      { label: 'Views', value: '270' },
      { label: 'Downloads', value: '35' }
    ],
    weight: 1.1,
  },
  {
    slug: '3d-asset-website',
    title: '3D Asset Website',
    category: 'Experimental — Scroll-driven 3D',
    description: 'An experimental showcase utilizing Three.js and scroll-driven animations to present 3D models in an engaging, interactive web space.',
    github: 'https://github.com/joaoafonso2004/3DAssetWebsite',
    live: 'https://3dassetwebsiteja.vercel.app/',
    img: td1,
    gallery: [],
    video: '/work/3DWebsite.mp4',
  },
  {
    slug: 'mog',
    title: 'MOG',
    category: 'Facial Analysis — Computer Vision',
    description: 'A computer vision tool built to analyze facial features. Features a modern, data-driven interface to display complex analytical results clearly.',
    github: 'https://github.com/joaoafonso2004/MOG',
    live: 'https://mog-lab.vercel.app/',
    img: mog1,
    gallery: [mog2, mog3, mog4],
    galleryLayout: 'grid-3',
  },
  {
    slug: 'radar-local',
    title: 'Google Maps Scraper',
    category: 'B2B Prospecting — Tool',
    description: 'A powerful tool for B2B prospecting using Google Maps data scraping. Simplifies the lead generation process through an intuitive UI.',
    github: 'https://github.com/joaoafonso2004/Google-Maps-Scraper',
    img: radarImg,
    gallery: [],
  },
];
