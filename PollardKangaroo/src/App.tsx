import React, { useState } from "react";
import "./App.css";
import AlgorithmInput from "./components/Input";
import AlgorithmOutput from "./components/Output";
import solvePollardKangaroo from "./core/PollardKangaroo";
import logo from "./assets/image.png"; // Add your logo file to the assets folder

const App: React.FC = () => {
  const [result, setResult] = useState<string | null>(null);
  const [isSolving, setIsSolving] = useState(false);

  const handleSolve = async (params: {
    g: string;
    p: string;
    h: string;
    a: string;
    b: string;
    stepFunction: string;
  }) => {
    setIsSolving(true);
    setResult(null); // Clear previous result
    const solution = await solvePollardKangaroo(
      params.g,
      params.h,
      params.p,
      params.a,
      params.b,
      params.stepFunction
    );
    setResult(solution);
    setIsSolving(false);
  };
  return (
    <div className="app-container">
      <header>
        <img src={logo} alt="Logo" className="app-logo" />
        <h1>Pollard Kangaroo Algorithm</h1>
      </header>
      <div className="layout">
        <div className="left">
          <AlgorithmInput onSolve={handleSolve} />
        </div>
        <div className="center">
          {isSolving && <p>Solving...</p>}
          <AlgorithmOutput result={result} />
        </div>
        <div className="right">
          <p>Additional Information</p>
          <p>Use this space for extra content.</p>
        </div>
      </div>
      <footer>
        <p>© 2025 Firdavs Jumayev</p>
        <p>Course: Cryptology</p>
      </footer>
    </div>
  );
};

export default App;
