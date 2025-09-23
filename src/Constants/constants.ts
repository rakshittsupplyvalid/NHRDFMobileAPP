export const NameofCenter = [
  { label: 'Center One', value: 'One' },
  { label: 'Center two', value: 'Two' },
  { label: 'Center Three', value: 'Three' },
  { label: 'Cenetr Four', value: 'Four' },
  { label: 'Center Five', value: 'Five' },

];


export const InspectionNo = [
  { label: 'First', value: '1' }, 
  { label: 'Second', value: '2' },
  { label: 'Third', value: '3' },
  { label: 'Fourth', value: '4' },
];








export const FarmerName = [
  { label: 'FarmerName1', value: 'FarmerName1' }, 
  { label: 'FarmerName2', value: 'FarmerName2' },
  { label: 'FarmerName3', value: 'FarmerName3' },
  { label: 'FarmerName4', value: 'FarmerName4' },
];



export const Season = [
  { label: 'kharif', value: 'khari' }, 
  { label: 'Sec', value: '2' },
  { label: 'Third', value: '3' },
  { label: 'Fourth', value: '4' },
];


export const crop = [
  { label: 'Crop 1', value: '1' }, 
  { label: 'Crop 2', value: '2' },
  { label: 'Crop 3', value: '3' },
  { label: 'Crop 4', value: '4' },
];


export const variety = [
  { label: 'variety 1', value: '1' }, 
  { label: 'variety 2', value: '2' },
  { label: 'variety 3', value: '3' },
  { label: 'variety 4', value: '4' },
];



export const  seedType = [
  { label: ' seedType 1', value: '1' }, 
  { label: ' seedType 2', value: '2' },
  { label: ' seedType 3', value: '3' },
  { label: ' seedType 4', value: '4' },
];



export const  produceseeds = [
  { label: ' seed blubs', value: '1' }, 
  { label: ' Seed Tuber of Variety', value: '2' },

];



export const  commodity = [
  { label: 'onion', value: 'onion' }, 
  { label: 'Garlic', value: 'Garlic' },
    { label: 'Potato', value: 'Potato' },

];



export const  Onion = [
  { label: 'onion one', value: '1' }, 
  { label: 'onion Two', value: '2' },
    { label: 'onion Three', value: '3' },

];



export const  Garlic = [
  { label: 'Garlic one', value: '1' }, 
  { label: 'Garlic Two', value: '2' },
    { label: 'Garlic Three', value: '3' },

];



export const  Potato = [
  { label: 'Potato one', value: '1' }, 
  { label: 'Potato Two', value: '2' },
    { label: 'Potato Three', value: '3' },

];



export const  District = [
  { label: 'dummy District', value: '1' }, 
  { label: 'dummy District two', value: '2' },

];


export const  State = [
  { label: 'dummy state', value: '1' }, 
  { label: 'dummy state two', value: '2' },

];


export const  Seeds = [
  { label: 'Breader', value: '1' }, 
  { label: 'Foundation', value: '2' },
    { label: 'Certified', value: '3' },
      { label: 'Truthful Seeds', value: '4' },

];


// Constants/constants.ts
export const relations = [
    { label: "Son of", value: "son" },
    { label: "Daughter of", value: "daughter" },
    { label: "Wife of", value: "wife" },
];

export const years = [
    { label: "2024", value: "2024" },
    { label: "2023", value: "2023" },
    { label: "2022", value: "2022" },
    { label: "2021", value: "2021" },
    { label: "2020", value: "2020" },
];

export const states = [
    { label: "Maharashtra", value: "maharashtra" },
    { label: "Gujarat", value: "gujarat" },
    { label: "Karnataka", value: "karnataka" },
    { label: "Tamil Nadu", value: "tamilnadu" },
    // Add more states as needed
];

export const districts = [
    { label: "Pune", value: "pune" },
    { label: "Mumbai", value: "mumbai" },
    { label: "Nashik", value: "nashik" },
    { label: "Nagpur", value: "nagpur" },
    // Add more districts as needed
];





// Define the State type if not already defined or import it from the correct module
type State = {
  form: Record<string, any>;
  hidden: Record<string, any>;
  fielddata: Record<string, any>;
  disable: Record<string, any>;
  status: Record<string, any>;
  refs: Record<string, any>;
};

export const defaultValue: State = {
  form: {},
  hidden: {},
  fielddata: {},
  disable: {},
  status: {},
  refs: {},
};