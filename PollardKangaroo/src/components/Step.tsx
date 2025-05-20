import React from "react";
import "./../styles/Step.css";

interface StepProps {
  type: "wild" | "tame";
  position: string | number;
  period: string | number;
  stepSize: string | number;
}

const Step: React.FC<StepProps> = ({ type, position, period, stepSize }) => {
  return (
    <div className={`step-container ${type}`}>
      <div className="step-position">Position: {position}</div>
      <div className="step-period">Period: {period}</div>
      <div className="step-size">Step Size: {stepSize}</div>
    </div>
  );
};

export default Step;
