import { Center } from '@mantine/core'
import Lottie from 'lottie-react'
import helloAnimation from './hello.json'

const style = {
    height: 500,
}

export default function LoginAnimation() {
    return (
        <Center>
            <Lottie
                animationData={helloAnimation}
                style={style}
                loop={true}
                autoplay={true}
            />
        </Center>
    )
}
