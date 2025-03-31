export async function enterTransition(element, transitionName = null) {
    await transition('enter', element, transitionName, 'leave')
    element.dataset.transitioned = true
}

export async function leaveTransition(element, transitionName = null) {
    if (!element.hasAttribute('data-transition-leave-final')) {
        element.dataset.leaveFinal = 'hidden'
    }

    await transition('leave', element, transitionName, 'enter')
    element.dataset.transitioned = false
}

export async function toggleTransition(element, transitionName = null) {
    if (element.dataset.transitioned === 'true') {
        await enterTransition(element, transitionName)
    } else {
        await leaveTransition(element, transitionName)
    }
}

async function transition(direction, element, animation, previousDirection) {
    const dataset = element.dataset
    const animationClass = animation ? `${animation}-${direction}` : direction
    const genesis = dataset[animationClass] ? dataset[animationClass].split(" ") : [animationClass]
    const start = dataset[`${animationClass}From`] ? dataset[`${animationClass}From`].split(" ") : [`${animationClass}-from`]
    const end = dataset[`${animationClass}To`] ? dataset[`${animationClass}To`].split(" ") : [`${animationClass}-to`]
    const final = dataset[`${animationClass}Final`] ? dataset[`${animationClass}Final`].split(" ") : [`${animationClass}-final`]
    const previousAnimationClass = animation ? `${animation}-${previousDirection}` : previousDirection
    const previousFinal = dataset[`${previousAnimationClass}Final`] ? dataset[`${previousAnimationClass}Final`].split(" ") : [`${previousAnimationClass}-final`]

    removeClasses(element, previousFinal)
    addClasses(element, genesis)
    addClasses(element, start)
    await nextFrame()
    removeClasses(element, start)
    addClasses(element, end);
    await afterTransition(element)
    addClasses(element, final)
    removeClasses(element, end)
    removeClasses(element, genesis)
    element.dispatchEvent(new Event(`${animationClass}:finished`))
}

function addClasses(element, classes) {
    element.classList.add(...classes)
}

function removeClasses(element, classes) {
    element.classList.remove(...classes)
}

function nextFrame() {
    return new Promise(resolve => {
        requestAnimationFrame(() => {
            requestAnimationFrame(resolve)
        });
    });
}

function afterTransition(element) {
    return Promise.all(element.getAnimations().map(animation => animation.finished));
}