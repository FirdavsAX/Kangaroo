import React from "react";
import "./../styles/Step.css";

interface StepProps {
  type: "wild" | "tame";
  position: string | number;
  period: string | number;
  stepSize: string | number;
}

const Step: React.FC<StepProps> = ({ type, position, period }) => {
  return (
    <div className={`step-container ${type}`}>
      <div className="step-position">Position: {position}</div>
      <div className="step-period">Period: {period}</div>
    </div>
  );
};

export default Step;
