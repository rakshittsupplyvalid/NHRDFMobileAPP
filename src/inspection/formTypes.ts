export interface FormDataType {
  InspectionNo: string;
  ShowingDate: string;
  InspectionDate: string;
  HarvestingDate: string;
  DurationFrom: string;
  DurationTo: string;
  SourceOfSeed: string;
  StageofCrop : string;
  
  InspectedArea: number;
  DamagedArea: number;
  PreviousCrop: string;
  FieldCount: number;
  CropCondition: string;
  StandardOfSeed: boolean;
  Reason: string;
  IsThisFinalReport: boolean;
  EstimatedSeedYield: string;
  GrowerRepresentative: string;
  Remarks: string;
  Latitude: number;
  Longitude: number;
  GeoImage: string | null;
  GeoLocation?: { latitude: number; longitude: number } | null;
  GrowerSignature: string | null;
  OfficerSignature: string | null;
  CenterInchargeSignature: string | null;
  VarietyId: string;
  CommodityId: string;
  FarmerId: string;
  FarmerDistributionId: string;
  StageofGrowthContaminant: string;
  StageofSeedAtInspection: string;
  IsolationDistance: string;
}

export interface OfftypeData {
   
  naturetype: string;
  numberofplants: string;
  discription: string;
   fieldCount: string;
}

export interface FormErrorsType {
  [key: string]: string;
}

export interface AgreementIdsType {
  VarietyId: string;
  CommodityId: string;
  FarmerId: string;
  FarmerDistributionId: string;
   VarietyName: string;
   SeedClass: string;
   CommodityName: string;
   Authorizedname: string;
   SourceSeed: string;
   Year: string;
   Season: string;
   Cropcode : string;
   Centercode : string;
}
