<template>
	<div id="app">
        <table>
            <thead>
                <tr>
                    <th rowspan="2">Name</th>
                    <th rowspan="2">Univalent</th>
                    <th rowspan="2">Grading</th>
                    <th colspan="2">Original</th>
                    <th colspan="2">Solution</th>
                    <th rowspan="2">Ratio</th>
                </tr>
                <tr>
                    <th>Amount</th>
                    <th>Total</th>
                    <th>Amount</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(item, i) in items" :key="i">
                    <td>{{ item.name }}</td>
                    <td>{{ item.univalent }}</td>
                    <td>{{ item.grading }}</td>
                    <td>{{ item.amount }}</td>
                    <td>{{ item.univalent * item.amount }}</td>
                    <td>{{ item.newAmount }}</td>
                    <td>{{ item.univalent * item.newAmount }}</td>
                    <td>{{ (item.newAmount / item.amount * 100).toFixed(2) }}%</td>
                </tr>
                <tr>
                    <th colspan="3">Total</th>
                    <td colspan="2">{{ sum.original }}</td>
                    <td colspan="2">{{ sum.solution }}</td>
                    <td>{{ (sum.solution / sum.original * 100).toFixed(2) }}%</td>
                </tr>
            </tbody>
        </table>
        <p>
		    Target Budget: <input type="text" v-model="target" />
        </p>
        <p>
            <button @click="solve()">Solve</button>
            <span v-if="worker">Solving...</span>
        </p>
	</div>
</template>

<script>
import Worker from 'worker-loader!./worker.js'
export default {
	data () {
		return {
			items: [
                { name: "Item A", univalent: 5, amount: 200, grading: 5 },
                { name: "Item B", univalent: 120, amount: 20, grading: 1 },
                { name: "Item C", univalent: 500, amount: 5, grading: 1 },
			],
			target: 10000,
            worker: null
		}
	},
	methods: {
		solve () {
            if (this.worker) {
                this.stopSolve()
            }
			this.worker = new Worker()
			let { items, target } = this
			this.worker.onmessage = e => {
                if (e.data === null) {
                    alert('No solutions.')
                } else {
                    e.data.solution.forEach((item, i) => {
                        this.$set(this.items, i, Object.assign({}, this.items[i], {
                            newAmount: item.amount
                        }))
                    })
                }
                this.worker = null
			}
			this.worker.postMessage({ items, target })
		},
		stopSolve () {
			this.worker.terminate()
            this.worker = null
		}
    },
    computed: {
        sum () {
            let original = 0, solution = 0
            this.items.forEach(item => {
                original += item.univalent * item.amount
                solution += item.univalent * item.newAmount
            })
            return { original, solution }
        }
    }
}
</script>

<style>
table {
    border-collapse: collapse;
    border-spacing: 0;
}
td, th {
    border: 1px solid #aaa;
    font-size: 14px;
    padding: 5px;
}
input {
    font-size: 13px;
}
button {
    font-size: 16px;
    padding: 5px 20px;
}
</style>