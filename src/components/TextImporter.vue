<template>
	<div>
        <textarea v-model="text"></textarea>
        <p>
            <button @click="analyze()">Analyse</button>
        </p>
	</div>
</template>

<script>
export default {
    data: () => ({
        text: ''
    }),
	methods: {
		analyze () {
            
            let lines = this.text.split('\n')
            let mat = lines.map(ln => {
                let fields = ln.split(/[,，]/)
                let name = '', univalent = 0, amount = 0
                fields.forEach(f => {
                    if (!univalent) {
                        let match = /^.*(?:单价|每[^0-9]+).*?([0-9\.]+)\s*(万?)元?/.exec(f)
                        if (match) {
                            univalent = +match[1]
                            if (match[2]) {
                                univalent *= 10000
                            } 
                        } else {
                        name += `${f}，`
                        }
                    } else if (!amount) {
                        let match = /([0-9\.]+)[^元]*$/.exec(f)
                        if (match) {
                            amount = match[1]
                        }
                    }
                })
                name = name.replace(/^[\s，,。]|[\s，,。]$/, '')
                let grading = [1000, 500, 250, 100, 50, 25, 10, 5, 1][
                    [25000, 10000, 5000, 2500, 1000, 500, 250, 100, 0].findIndex(n => amount >= n)
                ] || 1
                return amount ? {
                    name, univalent, amount, grading
                } : null
            })
            console.log(mat)

            this.$emit('import', mat.filter(t => t))
		}
    }
}
</script>

<style>
    textarea {
        width: 600px;
        height: 150px;
    }
</style>