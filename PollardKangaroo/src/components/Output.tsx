import "./../styles/Output.css";

interface OutputProps {
  result: string | undefined;
}

const Output: React.FC<OutputProps> = ({ result }) => {
  return (
    <div className="output">
      {result ? (
        <div>
          <h2>Result</h2>
          <p>{result}</p>
        </div>
      ) : (
        <p>No result to display.</p>
      )}
    </div>
  );
};

export default Output;
