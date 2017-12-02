import solve from './solver'

onmessage = e => {
    let { items, target } = e.data
    let solution = solve(items, target)
    postMessage(solution)
    close()
}