import React, { createContext, useContext } from "react";
import useForm from "./UseForm";

const FormContext = createContext<any>(null);

export const FormProvider = ({ children }: { children: React.ReactNode }) => {
  const form = useForm(); // use your hook here
  return <FormContext.Provider value={form}>{children}</FormContext.Provider>;
};

export const useFormContext = () => useContext(FormContext);
