// src/app/features/patient-profile/dental-chart/tooth-asset.map.ts

export interface ToothAsset {
  imagePath: string;
  mirror: boolean;
}

const TOOTH_ASSET_MAP: Record<number, ToothAsset> = {

  // ── Upper arch ──────────────────────────────────────
  11: { imagePath: 'teeth/upper/tooth-11-21.png', mirror: false },
  21: { imagePath: 'teeth/upper/tooth-11-21.png', mirror: true  },

  12: { imagePath: 'teeth/upper/tooth-12-22.png', mirror: false },
  22: { imagePath: 'teeth/upper/tooth-12-22.png', mirror: true  },

  13: { imagePath: 'teeth/upper/tooth-13-23.png', mirror: false },
  23: { imagePath: 'teeth/upper/tooth-13-23.png', mirror: true  },

  14: { imagePath: 'teeth/upper/tooth-14-24.png', mirror: false },
  24: { imagePath: 'teeth/upper/tooth-14-24.png', mirror: true  },

  15: { imagePath: 'teeth/upper/tooth-15-25.png', mirror: false },
  25: { imagePath: 'teeth/upper/tooth-15-25.png', mirror: true  },

  16: { imagePath: 'teeth/upper/tooth-16-26.png', mirror: false },
  26: { imagePath: 'teeth/upper/tooth-16-26.png', mirror: true  },

  17: { imagePath: 'teeth/upper/tooth-17-27.png', mirror: false },
  27: { imagePath: 'teeth/upper/tooth-17-27.png', mirror: true  },

  18: { imagePath: 'teeth/upper/tooth-18-28.png', mirror: false },
  28: { imagePath: 'teeth/upper/tooth-18-28.png', mirror: true  },

  // ── Lower arch ──────────────────────────────────────
  41: { imagePath: 'teeth/lower/tooth-41-31.png', mirror: false },
  31: { imagePath: 'teeth/lower/tooth-41-31.png', mirror: true  },

  42: { imagePath: 'teeth/lower/tooth-42-32.png', mirror: false },
  32: { imagePath: 'teeth/lower/tooth-42-32.png', mirror: true  },

  43: { imagePath: 'teeth/lower/tooth-43-33.png', mirror: false },
  33: { imagePath: 'teeth/lower/tooth-43-33.png', mirror: true  },

  44: { imagePath: 'teeth/lower/tooth-44-34.png', mirror: false },
  34: { imagePath: 'teeth/lower/tooth-44-34.png', mirror: true  },

  45: { imagePath: 'teeth/lower/tooth-45-35.png', mirror: false },
  35: { imagePath: 'teeth/lower/tooth-45-35.png', mirror: true  },

  46: { imagePath: 'teeth/lower/tooth-46-36.png', mirror: false },
  36: { imagePath: 'teeth/lower/tooth-46-36.png', mirror: true  },

  47: { imagePath: 'teeth/lower/tooth-47-37.png', mirror: false },
  37: { imagePath: 'teeth/lower/tooth-47-37.png', mirror: true  },

  48: { imagePath: 'teeth/lower/tooth-48-38.png', mirror: false },
  38: { imagePath: 'teeth/lower/tooth-48-38.png', mirror: true  },
};

export function getToothAsset(toothNumber: number): ToothAsset {
  return (
    TOOTH_ASSET_MAP[toothNumber] ?? {
      imagePath: 'teeth/upper/tooth-11-21.png',
      mirror: false,
    }
  );
}