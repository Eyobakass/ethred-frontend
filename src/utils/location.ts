// src/utils/location.ts

export interface SubCityOption {
  en: string;
  am: string;
  woredas: string[];
}

export interface RegionData {
  en: string;
  am: string;
  subCities: SubCityOption[];
}

export const ETHIOPIAN_LOCATIONS: Record<string, RegionData> = {
  'Addis Ababa': {
    en: 'Addis Ababa',
    am: 'አዲስ አበባ',
    subCities: [
      { en: 'Bole', am: 'ቦሌ', woredas: ['Woreda 01', 'Woreda 02', 'Woreda 03', 'Woreda 04', 'Woreda 05', 'Woreda 06'] },
      { en: 'Yeka', am: 'የካ', woredas: ['Woreda 01', 'Woreda 02', 'Woreda 03', 'Woreda 04', 'Woreda 05'] },
      { en: 'Kirkos', am: 'ኪርኮስ', woredas: ['Woreda 01', 'Woreda 02', 'Woreda 03', 'Woreda 04'] },
      { en: 'Arada', am: 'አራዳ', woredas: ['Woreda 01', 'Woreda 02', 'Woreda 03'] },
      { en: 'Nifas Silk-Lafto', am: 'ንፋስ ስልክ ላፍቶ', woredas: ['Woreda 01', 'Woreda 02', 'Woreda 03', 'Woreda 04'] },
      { en: 'Kolfe Keranio', am: 'ኮልፌ ቀራኒዮ', woredas: ['Woreda 01', 'Woreda 02', 'Woreda 03'] },
      { en: 'Lideta', am: 'ልደታ', woredas: ['Woreda 01', 'Woreda 02', 'Woreda 03'] },
      { en: 'Gullele', am: 'ጉለሌ', woredas: ['Woreda 01', 'Woreda 02', 'Woreda 03'] },
      { en: 'Akaky Kaliti', am: 'አቃቂ ቃሊቲ', woredas: ['Woreda 01', 'Woreda 02', 'Woreda 03'] },
      { en: 'Addis Ketema', am: 'አዲስ ከተማ', woredas: ['Woreda 01', 'Woreda 02', 'Woreda 03'] },
      { en: 'Lemi Kura', am: 'ለሚ ኩራ', woredas: ['Woreda 01', 'Woreda 02', 'Woreda 03'] },
    ],
  },
  'Hawassa': {
    en: 'Hawassa',
    am: 'ሀዋሳ',
    subCities: [
      { en: 'Tabor', am: 'ታቦር', woredas: ['Woreda 01', 'Woreda 02'] },
      { en: 'Haik Dar', am: 'ሐይቅ ዳር', woredas: ['Woreda 01', 'Woreda 02'] },
      { en: 'Mennehariya', am: 'መነሀሪያ', woredas: ['Woreda 01', 'Woreda 02'] },
    ],
  },
  'Adama': {
    en: 'Adama',
    am: 'አዳማ',
    subCities: [
      { en: 'Bole', am: 'ቦሌ', woredas: ['Woreda 01', 'Woreda 02'] },
      { en: 'Lugaha', am: 'ሉጋሃ', woredas: ['Woreda 01', 'Woreda 02'] },
    ],
  },
};
