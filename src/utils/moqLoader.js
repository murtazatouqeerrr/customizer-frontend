// Parse CSV text to MOQ rules object - Updated for your CSV structure
export function parseCSVToMOQ(csvText) {
  const lines = csvText.trim().split('\n');
  const glassTypes = {};
  
  for (let i = 0; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const glassType = values[0]; // Column A
    
    if (glassType && glassType.startsWith('GL')) {
      glassTypes[glassType] = {
        moq: 1, // Base MOQ is always 1 according to row 6
        extraColors: parseInt(values[5]) || 0,     // Column F
        anyColor: parseInt(values[6]) || 0,       // Column G  
        extraFragrances: parseInt(values[13]) || 0, // Column N
        ownFragrance: parseInt(values[14]) || 0,   // Column O
        extraWaxColors: parseInt(values[18]) || 0, // Column S
        gummy: parseInt(values[21]) || 0,         // Column V
        uvPrint: parseInt(values[22]) || 0,       // Column W
        standardBox: parseInt(values[25]) || 1,   // Column Z
        printedBox: parseInt(values[26]) || 0,    // Column AA
        bottomLidBox: parseInt(values[27]) || 0   // Column AB
      };
    }
  }
  
  return glassTypes;
}

// Fallback MOQ rules - COMMENTED OUT FOR TESTING
// export const FALLBACK_MOQ_RULES = {
//   'GL80': { moq: 1, extraColors: 350, anyColor: 3500, extraFragrances: 350, ownFragrance: 1750, extraWaxColors: 350, gummy: 30, uvPrint: 350, standardBox: 1, printedBox: 20, bottomLidBox: 350 },
//   'GL84': { moq: 1, extraColors: 288, anyColor: 2880, extraFragrances: 288, ownFragrance: 1440, extraWaxColors: 288, gummy: 30, uvPrint: 288, standardBox: 1, printedBox: 20, bottomLidBox: 288 },
//   'GL110': { moq: 1, extraColors: 150, anyColor: 1500, extraFragrances: 150, ownFragrance: 750, extraWaxColors: 150, gummy: 30, uvPrint: 150, standardBox: 1, printedBox: 20, bottomLidBox: 150 },
//   'GL140': { moq: 1, extraColors: 108, anyColor: 1080, extraFragrances: 108, ownFragrance: 540, extraWaxColors: 108, gummy: 30, uvPrint: 108, standardBox: 1, printedBox: 20, bottomLidBox: 108 },
//   'GL170': { moq: 1, extraColors: 60, anyColor: 600, extraFragrances: 60, ownFragrance: 300, extraWaxColors: 60, gummy: 30, uvPrint: 60, standardBox: 1, printedBox: 20, bottomLidBox: 60 }
// };

// Empty fallback for testing CSV loading
export const FALLBACK_MOQ_RULES = {};

// Load MOQ rules from CSV URL
export async function loadMOQFromCSV(csvUrl) {
  try {
    const response = await fetch(csvUrl);
    if (!response.ok) throw new Error('Failed to fetch CSV');
    
    const csvText = await response.text();
    const moqRules = parseCSVToMOQ(csvText);
    
    if (Object.keys(moqRules).length > 0) {
      console.log('MOQ rules loaded from CSV:', Object.keys(moqRules));
      return moqRules;
    }
  } catch (error) {
    console.error('Error loading MOQ from CSV:', error);
  }
  
  console.log('Using fallback MOQ rules');
  return FALLBACK_MOQ_RULES;
}
