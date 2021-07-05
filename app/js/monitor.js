const path = require("path")
const osu = require("node-os-utils")
const remote = require('electron').remote
const cpu = osu.cpu
const mem = osu.mem
const proc = osu.proc
const os = osu.os
const cmd = osu.osCmd

const {
    ipcRenderer
} = require('electron')
const defaultIndicatorColor = '#3379FF'
const warningIndicatorColor = '#FF5D5D'

let cpuOverload
let alertFrequency

// get settings & values
ipcRenderer.on('settings:get', (e, settings) => {
    // with + you make sure that the value is a number
    cpuOverload = +settings.cpuOverload
    alertFrequency = +settings.alertFrequency
})

document.getElementById('exit').addEventListener("click", function() {
    let w = remote.getCurrentWindow()
    w.close()
});

// set interval to run every 2 seconds
setInterval(() => {
    cpu.usage().then((info) => {
        //CPU usage
        elementSetter("cpu-usage", info + "%")
        elementSetter("cpu-percent", Math.floor(info) + "%")

        // progressbar
        document.getElementById("cpu-progress").style.width = Math.floor(info) + "%"


        if (info >= cpuOverload) {
            document.getElementById("cpu-progress").style.background = warningIndicatorColor
        } else {
            document.getElementById("cpu-progress").style.background = defaultIndicatorColor
        }

        // notification
        if (info >= cpuOverload && runNotify(alertFrequency)) {
            notifyUser({
                title: "CPU overload",
                body: `CPU is over ${cpuOverload}%`,
                icon: path.join(__dirname, 'img', 'icon.png'),
            })
            localStorage.setItem('lastNotify', +new Date())
        }

        mem.free().then((info) => {
            document.getElementById("mem-free-percent").style.width = calcFreeMemPercent(info['freeMemMb'], info['totalMemMb']) + "%"
            elementSetter("mem-free-percent", calcFreeMemPercent(info['freeMemMb'], info['totalMemMb']) + "%")
            elementSetter("mem-free", `${Math.round(info.freeMemMb)} Mb`)
            elementSetter("mem-used", `${Math.round(info.totalMemMb - info.freeMemMb)} Mb`)
        })

    })

    //Uptime
    elementSetter("sys-uptime", secondsToDhms(os.uptime()))
}, 1000)

elementSetter('machine-ip', os.ip())
elementSetter('cpu-model', cpu.model())
elementSetter('cpu-vcores', cpu.count())
elementSetter('comp-name', os.hostname())
elementSetter('os', `${os.type().replace("_NT","")} ${os.arch()}`)

mem.info().then((info) => {
        elementSetter('mem-total', `${Math.ceil((info.totalMemMb/1024))} GB`)
    })
    //finds an updates an html/dom element
function elementSetter(element, value) {
    try {
        document.getElementById(element).innerText = value
    } catch (e) {}
}

// timestamp: caculate days, hours, mins, sec
function secondsToDhms(seconds) {
    seconds = +seconds
    const days = Math.floor(seconds / (3600 * 24))
    const hours = Math.floor((seconds % (3600 * 24)) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    return `${days} days, ${hours}:${minutes}:${secs}`
}

// notification - split title from options to call notification api
function notifyUser(options) {
    new Notification(options.title, options)
}

// notification system
function runNotify(frequency) {
    if (localStorage.getItem('lastNotify') === null) {
        // store timestamp
        localStorage.setItem('lastNotify', +new Date())
        return true
    }
    const notifyTime = new Date(parseInt(localStorage.getItem('lastNotify')))
    const now = new Date()
    const diffTime = Math.abs(now - notifyTime)
    const minutesPassed = Math.ceil(diffTime / (1000 * 60))

    if (minutesPassed > frequency) {
        return true
    } else {
        return false
    }
}

//caculate free memory
function calcFreeMemPercent(freeMemMb, totalMemMb) {
    let freeMemPercent = freeMemMb * 100 / totalMemMb
    return Math.floor((freeMemPercent.toFixed(2)))
}