import React from "react";
import Step from "./Step";
import "../styles/StepBar.css";

interface StepData {
  type: "wild" | "tame";
}

interface StepsBarProps {
  steps: StepData[];
}

const StepsBar: React.FC<StepsBarProps> = ({ steps }) => {
  return (
    <div className="steps-bar">
      {steps.map((step, idx) => (
        <Step key={idx} type={step.type} />
      ))}
    </div>
  );
};

export default StepsBar;
