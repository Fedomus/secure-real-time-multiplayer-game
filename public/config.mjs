const 
    containerHeight = 480,
    containerWidth = 640,
    padding = 5, 
    headlineHeight = 50;

const config = {
    containerHeight,
    containerWidth,
    padding, 
    headlineHeight,
    playFieldHeight: containerHeight - padding - headlineHeight,
    playFieldWidth: containerWidth - 2*padding,
    avatarHeight: 207/6,
    avatarWidth: 270/6,
    coinWidth: 15,
    coinHeight: 15,
    speed: 2,
}

export default config