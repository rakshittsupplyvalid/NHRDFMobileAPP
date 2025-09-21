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