// utils/fetchCommodity.ts
import apiClient from "../Service/apiInterceptors";

// Fetch all commodity types (first dropdown)
export const fetchCommodityTypes = async () => {
  try {
    const res = await apiClient.get(
      "/api/mobile/commoditytype/get/list?ApprovalStatus=PENDING&ApprovalStatus=APPROVED&ApprovalStatus=REJECTED"
    );



    return res.data.map((item: any) => ({
      label: item.name,
      value: item.id, // this will be used in next API
    }));
  } catch (error: any) {
    
    return [];
  }
};

// Fetch commodities based on selected Commodity Type
export const fetchCommoditiesByType = async (commodityTypeId: string) => {
  try {
    const res = await apiClient.get(
      `/api/mobile/commodity/get/list?CommodityTypesId=${commodityTypeId}&ApprovalStatus=PENDING&ApprovalStatus=APPROVED&ApprovalStatus=REJECTED`
    );


    console.log("response" , res)



    return res.data.map((item: any) => ({
      label: item.name,
      value: item.id,
    }));
  } catch (error: any) {
  
    return [];
  }
};







// Fetch all farmers (for dropdown)
// Fetch all farmers (for dropdown)

export const farmer = async (selectedCommodity: string) => {
  if (!selectedCommodity) return [];

  try {
   
    const url = `/api/mobile/farmer/distribution${selectedCommodity}`;

    const res = await apiClient.get(url);
 // ✅ Directly map res.data
    const dropdownData = res.data.map((item: any) => ({
      label: item.targetassignfarmername,  // dropdown me dikhayega
      value: item.farmerid,                 // select hone par milega
      varietyId: item.varietyid,
      Id : item.id,
      centertargetid : item.centertargetid
    }));

   
    console.log("Dropdown Farmer List:", dropdownData);

    return dropdownData;
  } catch (error: any) {
    console.log("Error fetching farmers:", error.response?.data || error.message);
    return [];
  }
};



// export const farmer = async (selectedCommodity: string) => {
//   if (!selectedCommodity) return [];

//   try {
    
//     const url = `/api/mobile/farmer/distribution${selectedCommodity}`;
//     const res = await apiClient.get(url);

//     console.log("Farmer List:", res.data);

//     // Map the API data to { label, value } format for dropdown
//     const dropdownData = res.data.map((farmer: any) => ({
//       label: farmer.targetassignfarmername || "N/A", // fallback if null
//       value: farmer.farmerid,
//     }));

//     return dropdownData;

//   } catch (error: any) {
//     console.log("Error fetching farmers:", error);
//     return [];
//   }
// };



export const getFarmerLandDetail = async (farmerId: string) => {
  if (!farmerId) return null;
  console.log("Fetching land detail for Farmer ID:", farmerId);

  try {
    const url = `/api/mobile/farmer/${farmerId}/landdetail`;
    const res = await apiClient.get(url);

    console.log("Farmer Land Detail:", res.data);

    return res.data;

  } catch (error: any) {
    console.log("Error fetching farmer land detail:", error);
    return null;
  }
};






// Fetch farmer details by farmerId
export const farmerDetails = async (farmerId: string) => {
  try {
    const res = await apiClient.get(
      `/api/mobile/farmer/${farmerId}`
    );

    console.log("Farmer Details:", res.data);

    // Agar API single object return kare, to usko array me wrap karke map karo
    const data = [res.data];

    return data.map((item: any) => ({
      label: item.name,
      value: item.id,
      ...item, // baki details bhi rakh sakte ho
    }));
  } catch (error: any) {
    return [];
  }
};



export const fetchSeedOptions = async () => {
  try {
    const res = await apiClient.get(
      `/api/class/seed?ApprovalStatus=PENDING&ApprovalStatus=APPROVED&ApprovalStatus=REJECTED`
    );

    const data = Array.isArray(res.data) ? res.data : [res.data];

    return data.map((item: any) => ({
      label: item.name,
      value: item.id,
      ...item,
    }));
  } catch (error: any) {
    console.error("Seed fetch error:", error);
    return [];
  }
};
