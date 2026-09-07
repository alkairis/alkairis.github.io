import Typewriter from "typewriter-effect";

type TypingProps = {
  /** Strings to cycle through, typed out one after another on a loop. */
  titles: string[];
};

const Typing = ({ titles }: TypingProps) => (
  <Typewriter
    options={{
      strings: titles,
      autoStart: true,
      loop: true,
      pauseFor: 2000,
    }}
  />
);

export default Typing;
