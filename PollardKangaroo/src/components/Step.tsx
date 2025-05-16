import React from "react";
import "./../styles/Step.css";

interface StepProps {
  type: "wild" | "tame"; // Determines the type of step
}

const Step: React.FC<StepProps> = ({ type }) => {
  return (
    <div className={`step-container ${type}`}>
      <div className="step-position">Position</div>
      <div className="step-period">Period</div>
      <div className="step-size">Step Size</div>
    </div>
  );
};

export default Step;
