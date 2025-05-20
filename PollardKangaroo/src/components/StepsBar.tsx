import React from "react";
import Step from "./Step";
import "../styles/StepBar.css";
import type { KangarooResult } from "../core/PollardKangaroo";

interface StepData {
  type: "wild" | "tame";
  position: string | number;
  period: string | number;
  stepSize: string | number;
}

interface StepsBarProps {
  result: KangarooResult | null;
}

const StepsBar: React.FC<StepsBarProps> = ({ result }) => {
  if (!result) {
    return <div className="steps-bar">No result found.</div>;
  }

  // Display all steps for both tame and wild
  const tameSteps: StepData[] = Object.entries(result.tameMap || {}).map(
    ([position, period]) => ({
      type: "tame",
      position,
      period: period.toString(),
      stepSize: "-", // Step size not tracked in KangarooResult
    })
  );
  const wildSteps: StepData[] = Object.entries(result.wildMap || {}).map(
    ([position, period]) => ({
      type: "wild",
      position,
      period: period.toString(),
      stepSize: "-", // Step size not tracked in KangarooResult
    })
  );

  return (
    <div className="steps-bar">
      <div style={{ width: "100%", marginBottom: 12 }}>
        <strong>Result:</strong> {result.result.toString()}
        <br />
        <strong>Collision Position:</strong> {result.position.toString()}
      </div>
      {tameSteps.map((step, index) => (
        <Step
          key={`tame-${index}`}
          type={step.type}
          position={step.position}
          period={step.period}
          stepSize={step.stepSize}
        />
      ))}
      {wildSteps.map((step, index) => (
        <Step
          key={`wild-${index}`}
          type={step.type}
          position={step.position}
          period={step.period}
          stepSize={step.stepSize}
        />
      ))}
    </div>
  );
};

export default StepsBar;
