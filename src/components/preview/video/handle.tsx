import { a } from "react-spring";
import { formatTime } from "src/utils/helpers";

export const Time = ({ time }) => {
  return <span>{formatTime(time)}</span>;
};

export const AnimatedTime = a(Time);
export const HandleStrip = () => {
  return (
    <div data-id="handle-strip" className="h-5 rounded-md w-[3px] bg-[#fff]" />
  );
};

const H = ({ position, children, ...rest }) => {
  return (
    <div
      data-dir={position}
      className="absolute top-0 h-full flex items-center justify-center cursor-w-resize bg-[#ffcd02] w-[var(--handle)] data-[dir=left]:left-0 data-[dir=right]:right-0"
      {...rest}
    >
      <HandleStrip />

      <span
        className="timed absolute top-[-100%] z-20 px-3 py-1 rounded-lg bg-[#ffcd02] text-black text-xs"
        style={{
          display: "var(--vis)",
        }}
      >
        {children}
      </span>
    </div>
  );
};

export const Handle = a(H);
