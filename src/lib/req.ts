export const req = async (src, sourceBuffer, i = 0) => {
  const chunkCount = 100;
  const start = 100000;
  const length = 41927339;
  const segmentSize = Math.ceil(length / chunkCount);

  const range = `bytes=${start + segmentSize * i}-${
    start + segmentSize * (i + 1) - 1
  }`;

  const res = await fetch(src, {
    headers: {
      Range: range,
    },
  });
  const chunk = await res.arrayBuffer();

  // chunkList.push(`${chunk.byteLength * i} - ${chunk.byteLength * (i + 1) - 1}`);
  sourceBuffer.appendBuffer(new Uint8Array(chunk));

  return;
};
