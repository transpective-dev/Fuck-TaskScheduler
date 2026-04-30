import { spawn } from 'child_process'

interface inRange {
    start: string
    end: string
    whenInRange: () => void
}

interface atTime {
    time: string
    whenTime: () => void
}

interface interval {
    hr?: number
    min?: number
    sec?: number
    duringInterval: () => void
}

// checkInterval is the interval to dynamically observe the time.
const checkInterval = 1

export class API {

    getCurrentTime(): string {

        const date = new Date()

        const formatter = new Intl.DateTimeFormat('en-GB', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });

        return formatter.format(date).replace(',', '')

    }

    getCurrentSimple(): string {

        const time = this.getCurrentTime()

        const [_, timeStr] = time.split(' ')

        return timeStr.trim()

    }

    // format: HH:mm
    inRange({
        start,
        end,
        whenInRange
    }: inRange) {

        // immediate

        const func = () => {

            const time = this.getCurrentSimple()

            const isTrue = time >= start && time <= end

            if (isTrue) {
                whenInRange()
            }

        }

        func()

        this.interval({
            min: checkInterval,
            duringInterval: func
        })


    }

    // format: dd/mm/yyyy hh:mm
    inRangeComplex({
        start,
        end,
        whenInRange
    }: inRange) {

        const func = () => {

            const time = this.getCurrentTime()

            const isTrue = time >= start && time <= end

            if (isTrue) {
                whenInRange()
            }

        }

        func()

        this.interval({
            min: checkInterval,
            duringInterval: func
        })
    }

    // format: hh:mm
    atTime({
        time,
        whenTime
    }: atTime) {

        const func = () => {

            const currentTime = this.getCurrentSimple()

            if (currentTime === time) {
                whenTime()
            }

        }

        func()

        this.interval({
            min: checkInterval,
            duringInterval: func
        })


    }

    // format: dd/mm/yyyy hh:mm
    atTimeComplex({
        time,
        whenTime
    }: atTime) {

        const func = () => {

            const currentTime = this.getCurrentTime()

            if (currentTime === time) {
                whenTime()
            }

        }

        func()

        this.interval({
            min: checkInterval,
            duringInterval: func
        })

    }

    interval({
        hr = 0,
        min = 0,
        sec = 0,
        duringInterval
    }: interval): { stop: () => void } {

        const interval = setInterval(() => {

            duringInterval()

            // prevent Event Loop Starvation
        }, Math.max(1000 * hr * 60 * 60 + 1000 * min * 60 + 1000 * sec, 1000))

        const stop = () => {

            clearInterval(interval)

        }

        return { stop: stop }

    }

    spawnChild = (cmd: string) => {
    
        return new Promise((resolve, reject) => {
    
            const kill = (status: boolean) => {
                child.kill();
                status ? resolve(true) : reject(false)
            }
    
            const child = spawn(cmd, {
                shell: 'powershell.exe',
                stdio: 'inherit',
            });
    
            child.on('exit', (code) => {
                code === 0 ? kill(true) : kill(false)
            });
    
            child.on('error', (err) => {
                kill(false)
            });
    
        })
    }
}