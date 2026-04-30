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

        console.log(time)

        const [date, timeStr] = time.split(' ')

        return timeStr.trim()

    }

    // format: HH:mm
    inRange({
        start,
        end,
        whenInRange
    }: inRange) {

        this.interval({
            min: checkInterval,
            duringInterval: () => {

                const time = this.getCurrentSimple()

                const isTrue = time >= start && time <= end

                if (isTrue) {
                    whenInRange()
                }

            }
        })


    }

    // format: dd/mm/yyyy hh:mm
    inRangeComplex({
        start,
        end,
        whenInRange
    }: inRange) {

        this.interval({
            min: checkInterval,
            duringInterval: () => {

                const time = this.getCurrentTime()

                const isTrue = time >= start && time <= end

                if (isTrue) {
                    whenInRange()
                }

            }
        })
    }

    // format: hh:mm
    atTime({
        time,
        whenTime
    }: atTime) {

        this.interval({
            min: checkInterval,
            duringInterval: () => {

                const currentTime = this.getCurrentSimple()

                if (currentTime === time) {
                    whenTime()
                }

            }
        })


    }

    // format: dd/mm/yyyy hh:mm
    atTimeComplex({
        time,
        whenTime
    }: atTime) {

        this.interval({
            min: checkInterval,
            duringInterval: () => {

                const currentTime = this.getCurrentTime()

                if (currentTime === time) {
                    whenTime()
                }

            }
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

        }, 1000 * hr * 60 * 60 + 1000 * min * 60 + 1000 * sec)

        const stop = () => {

            clearInterval(interval)

        }

        return { stop: stop }

    }

}