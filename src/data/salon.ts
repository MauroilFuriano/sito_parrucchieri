export type ServiceId =
  | 'piega_donna'
  | 'taglio_donna'
  | 'colore_donna'
  | 'balayage_donna'
  | 'taglio_uomo'
  | 'barba_uomo'
  | 'rituel_uomo'
  | 'consulenza';

export interface SalonService {
  id: ServiceId;
  name: string;
  description: string;
  priceFrom: number;
  photo: string;
  photoPosition: string;
}

export interface ServiceCategory {
  name: string;
  services: SalonService[];
}

export const salon = {
  name: 'Aura Style Studio',
  address: { street: 'Via della Moda, 42', city: '00100 Roma' },
  phone: '06 12345678',
  phoneHref: 'tel:+390612345678',
  openingDays: [2, 3, 4, 5, 6],
  hoursLabel: 'Martedì–sabato 9:00–19:00',
  closedLabel: 'Domenica e lunedì chiuso',
  slots: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'],
};

export const serviceCategories: ServiceCategory[] = [
  {
    name: 'Donna',
    services: [
      { id: 'piega_donna', name: 'Piega', description: 'Lavaggio specifico e styling.', priceFrom: 20, photo: '/donna_3.png', photoPosition: '50% 30%' },
      { id: 'taglio_donna', name: 'Taglio', description: "Consulenza d'immagine e taglio.", priceFrom: 35, photo: '/donna_2.png', photoPosition: '50% 35%' },
      { id: 'colore_donna', name: 'Colore', description: 'Colorazione completa senza ammoniaca.', priceFrom: 45, photo: '/donna_1.png', photoPosition: '50% 25%' },
      { id: 'balayage_donna', name: 'Balayage', description: 'Schiariture personalizzate e tonalizzazione.', priceFrom: 80, photo: '/donna_3.png', photoPosition: '50% 60%' },
    ],
  },
  {
    name: 'Uomo',
    services: [
      { id: 'taglio_uomo', name: 'Taglio classico', description: 'Lavaggio, taglio a forbice e styling.', priceFrom: 25, photo: '/uomo_1.png', photoPosition: '50% 25%' },
      { id: 'taglio_uomo', name: 'Taglio sfumato', description: 'Skin fade con macchinetta e rasoio.', priceFrom: 30, photo: '/uomo_3.png', photoPosition: '50% 30%' },
      { id: 'barba_uomo', name: 'Regolazione barba', description: 'Modellatura con panno caldo e oli essenziali.', priceFrom: 15, photo: '/uomo_2.png', photoPosition: '50% 30%' },
      { id: 'rituel_uomo', name: 'Rituel uomo', description: 'Taglio, barba e trattamento della cute.', priceFrom: 45, photo: '/uomo_1.png', photoPosition: '50% 55%' },
    ],
  },
];

export const bookableServices: { id: ServiceId; label: string; group: string }[] = [
  { id: 'piega_donna', label: 'Piega', group: 'Donna' },
  { id: 'taglio_donna', label: 'Taglio', group: 'Donna' },
  { id: 'colore_donna', label: 'Colore', group: 'Donna' },
  { id: 'balayage_donna', label: 'Balayage', group: 'Donna' },
  { id: 'taglio_uomo', label: 'Taglio classico o sfumato', group: 'Uomo' },
  { id: 'barba_uomo', label: 'Regolazione barba', group: 'Uomo' },
  { id: 'rituel_uomo', label: 'Rituel uomo', group: 'Uomo' },
  { id: 'consulenza', label: "Consulenza d'immagine", group: 'Altro' },
];

export interface Promotion {
  name: string;
  price: string;
  lines: string[];
  action: string;
  service: ServiceId | '';
}

export const promotions: Promotion[] = [
  {
    name: 'Porta un amico',
    price: 'Omaggio',
    lines: ['Un trattamento ristrutturante per te e per chi porti, se è la sua prima volta da noi.', 'Sempre valido.'],
    action: 'Prenota in due',
    service: '',
  },
  {
    name: 'Martedì studenti',
    price: '−20%',
    lines: ['Su taglio e piega, mostrando il badge universitario.', 'Valido ogni martedì.'],
    action: 'Prenota di martedì',
    service: 'taglio_donna',
  },
  {
    name: 'Pacchetto sposa',
    price: 'da 250 €',
    lines: [
      'Prova acconciatura prima del giorno.',
      'Trucco e acconciatura il giorno del matrimonio.',
      "Consulenza d'immagine inclusa.",
    ],
    action: 'Prenota la prova',
    service: 'consulenza',
  },
];

export const formatPrice = (euro: number) => `da ${euro} €`;
