// --- in src/components/StepsBar.tsx ---
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

  // Build a list of “tame” steps from result.tameMap
  const tameSteps: StepData[] = Object.entries(result.tameMap).map(
    ([posStr, periodBig]) => ({
      type: "tame",
      position: posStr,
      period: periodBig.toString(),
      stepSize: "-", // we didn’t explicitly store each stepSize separately
    })
  );

  // Build a list of “wild” steps from result.wildMap
  const wildSteps: StepData[] = Object.entries(result.wildMap).map(
    ([posStr, periodBig]) => ({
      type: "wild",
      position: posStr,
      period: periodBig.toString(),
      stepSize: "-",
    })
  );

  return (
    <div className="steps-bar">
      <div style={{ width: "100%", marginBottom: 12 }}>
        <strong>Result:</strong> {result.result.toString()}
        <br />
        <strong>Collision Position:</strong>{" "}
        {result.collisionPosition.toString()}
      </div>

      {tameSteps.map((step, idx) => (
        <Step
          key={`tame-${step.position}-${idx}`}
          type={step.type}
          position={step.position}
          period={step.period}
          stepSize={step.stepSize}
        />
      ))}

      {wildSteps.map((step, idx) => (
        <Step
          key={`wild-${step.position}-${idx}`}
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
