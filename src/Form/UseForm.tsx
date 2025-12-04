import { useState } from "react";
import { defaultValue } from "../Constants/constants";
import { State } from "../Type/type";

const deepClone = (obj: any) => JSON.parse(JSON.stringify(obj));

export default function useForm() {
    const [state, setState] = useState<State>(() => deepClone(defaultValue));

    const updateNestedState = <K extends keyof State>(key: K, data: State[K]) => {
        setState(prev => ({
            ...prev,
            [key]: { ...prev[key], ...data }
        }));
    };

    const updateState = (data: Partial<State> | null) => {
        if (data === null) {
            setState(deepClone(defaultValue));
            return;
        }

        setState(prev => {
            const newState = { ...prev };
            for (const key in data) {
                const value = data[key as keyof State];
                if (value === null || value === undefined) continue;
                
                if (Array.isArray(value)) {
                    newState[key as keyof State] = [
                        ...(prev[key as keyof State] as any[] || []),
                        ...value,
                    ] as any;
                } else if (typeof value === 'object') {
                    newState[key as keyof State] = {
                        ...(prev[key as keyof State] || {}),
                        ...value,
                    };
                } else {
                    newState[key as keyof State] = value;
                }
            }
            return newState;
        });
    };

    return {
        state,
        updateForm: (data: State['form']) => updateNestedState('form', data),
        updateData: (data: State['fielddata']) => updateNestedState('fielddata', data),
        updateHidden: (data: State['hidden']) => updateNestedState('hidden', data),
        updateDisable: (data: State['disable']) => updateNestedState('disable', data),
        updateRef: (data: State['refs']) => updateNestedState('refs', data),
        updateState,
    };
}
