import Typewriter from 'typewriter-effect';

const Typing = ({titles}) => {
    return (
        <Typewriter
            options={{
                strings: titles,
                autoStart: true,
                loop: true,
                pauseFor: 2000
            }}
        />

    )
}

export default Typing