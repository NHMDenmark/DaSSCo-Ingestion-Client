import { useState } from "react";

type UseStep = {
    initialStep: number;
}

const useSteps = ( { initialStep } : UseStep) => {
    const [active, setActive] = useState<number>(initialStep);

    const nextStep = () => setActive(current => current + 1);

    const prevStep = () => setActive(current => current - 1);

    const setStep = (step: number) => setActive(step);

    return {
        nextStep,
        prevStep,
        setStep,
        active
    }
}

export default useSteps;