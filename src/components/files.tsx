import { getFiles } from "src/ctx/selectors";

export const Files = () => {
  const files = getFiles();
  return (
    <div className="bg-gray-400">
      <h2>Files</h2>
      <pre>{JSON.stringify(files, null, 2)}</pre>
    </div>
  );
};
