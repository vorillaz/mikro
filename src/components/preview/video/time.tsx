import { a } from "react-spring";

export const Time = ({ time }) => {
  return (
    <span>
      {/* {formatTime(time * 1000)} */}
      {time}
    </span>
  );
};

export const AnimatedTime = a(Time);
