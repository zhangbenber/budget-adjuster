class Item {
    constructor({ name, univalent, amount, grading }) {
        Object.assign(this, { name, univalent, amount, grading }, {
            total: univalent * amount,
            preferredSteps: 0,
            acceptable: [],
            preferred: [],
            maxCost: 0
        })
    }
}


export default function (mat, target) {
    let items = mat.map(item => new Item(item))
    let total = 0
    items.forEach(item => {
        total += item.total
    })
    let ratio = target / total

    items.forEach(item => {
        let grading = item.grading
        let preferredSteps = item.amount * ratio / grading
        item.preferredSteps = preferredSteps
        let minSteps = Math.max(1, Math.floor(preferredSteps * 0.5))
        let maxSteps = Math.ceil(preferredSteps * 1.5)
        for (let steps = minSteps; steps <= maxSteps; steps++) {
            let amount = steps * grading
            let ratioCost = Math.pow(1 - amount / (item.amount * ratio), 2) * 500
            let roundCost = getRoundCost(amount)
            item.acceptable.push({
                amount,
                cost: ratioCost + roundCost
            })
        }
        item.acceptable.sort((a, b) => a.cost - b.cost)
        pickPossibility(item)
        console.log(item)
    })

    let solution = tryCombinations()
    while (!solution) {
        let newChoosen = getNextPossibility()
        if (!newChoosen) {
            console.log('No solutions')
            return null
        } else {
            let { item, choosen } = newChoosen
            let preferred = item.preferred
            item.preferred = [choosen]
            solution = tryCombinations()
            item.preferred = preferred
        }
    }

    console.log(solution)
    return solution


    function getRoundCost(num) {
        let digs = (num + '').replace('.', '').split('')
        return digs.reduce((v, dig, index) => {
            return (v + ([
                // 0,           1,  2,  3,  4,  5,  6,  7,  8,  9
                0, index ? 16 : 1, 6, 12, 8, 2, 8, 12, 8, 16
            ][dig] || 0) * Math.pow(index + 1, 2))
        }, 0)
    }

    function tryCombinations(callback) {
        let solutions = []
        let sorted = items.slice()
        sorted.sort((a, b) => b.preferred.length - a.preferred.length)
        console.log(sorted.map(item => item.preferred.length))
        console.log(sorted.map(item => item.acceptable.length))
        let indexes = Array(sorted.length + 1).fill(0)
        while (sorted.find((item, i) => {
            if (indexes[i] >= item.preferred.length) {
                indexes[i] = 0
                indexes[i + 1] += 1
                return false
            } else {
                return true
            }
        })) {
            let total = 0, cost = 0
            sorted.forEach((item, i) => {
                let preferred = item.preferred[indexes[i]]
                total += preferred.amount * item.univalent
                cost += preferred.cost
            })
            if (total == target) {
                let solution = {
                    cost,
                    solution: items.map(item => {
                        let { name, univalent } = item
                        let i = sorted.indexOf(item)
                        let preferred = item.preferred[indexes[i]]
                        return {
                            name, univalent,
                            amount: preferred.amount
                        }
                    })
                }
                callback && callback(solution)
                solutions.push(solution)
            }
            indexes[0] += 1
        }
        if (solutions.length) {
            solutions.sort((a, b) => a.cost - b.cost)
            return solutions[0]
        } else {
            return null
        }
    }

    function getNextPossibility() {
        let oldItem = null, oldDeltaCost = Infinity
        items.forEach(item => {
            if (!item.acceptable.length) {
                return
            }
            let deltaCost = item.acceptable[0].cost - item.maxCost
            if (deltaCost < oldDeltaCost) {
                oldItem = item
                oldDeltaCost = deltaCost
            }
        })
        if (oldItem) {
            return pickPossibility(oldItem)
        } else {
            return null
        }
    }

    function pickPossibility(item) {
        let nextAcceptable = item.acceptable.shift()
        item.maxCost = nextAcceptable.cost
        item.preferred.push(nextAcceptable)
        return { item, choosen: nextAcceptable }
    }

}
