import { spawn } from 'child_process'
import fs, { statSync } from 'fs'
import path from 'path'
import { EventEmitter } from 'events'

const root = process.env.ROOTPATH!

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

interface logger {
    message: string
}

interface immediate {
    whenUsed: () => void
}

// checkInterval is the interval to dynamically observe the time.
const checkInterval = 0.1

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
                try {
                    const result = whenInRange() as any;

                    // check is result promise
                    if (result instanceof Promise) {

                        // if result was promise, use catch to prevent crash
                        result.catch(err => console.error('[Schedule Error in inRange]:', err))

                    }
                } catch (error) {
                    console.error('[Schedule Sync Error in inRange]:', error)
                }
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
                try {
                    const result = whenInRange() as any;
                    if (result instanceof Promise) {
                        result.catch(err => console.error('[Schedule Error in inRangeComplex]:', err))
                    }
                } catch (error) {
                    console.error('[Schedule Sync Error in inRangeComplex]:', error)
                }
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
                try {
                    const result = whenTime() as any;
                    if (result instanceof Promise) {
                        result.catch(err => console.error('[Schedule Error in atTime]:', err))
                    }
                } catch (error) {
                    console.error('[Schedule Sync Error in atTime]:', error)
                }
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
                try {
                    const result = whenTime() as any;
                    if (result instanceof Promise) {
                        result.catch(err => console.error('[Schedule Error in atTimeComplex]:', err))
                    }
                } catch (error) {
                    console.error('[Schedule Sync Error in atTimeComplex]:', error)
                }
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

    immediate({
        whenUsed
    }: immediate): {
        status: boolean,
        message: string | null
    } {

        try {
            whenUsed()
            return { status: true, message: null }
        } catch (error) {
            return { status: false, message: error as string }
        }

    }

    logger({
        message
    }: logger): {
        status: boolean,
        message: string | null
    } {

        try {

            const log = path.join(root, 'log.txt')

            const isExist = fs.existsSync(log)

            message = this.getCurrentTime() + ': ' + message

            const append = (m: string) => fs.appendFileSync(log, `${message}\n`)
            const create = (m: string) => fs.writeFileSync(log, `${message}\n`)

            isExist ? append(message) : create(message)

            return { status: true, message: null }

        } catch (error) {

            return { status: false, message: error as string }

        }
    }

    public emitter = new EventEmitter()

    spawnChild = (cmd: string) => {

        return new Promise((resolve, reject) => {

            const kill = (status: boolean, errorCode?: number) => {
                child.kill();
                status ? resolve(true) : reject(new Error(`Process exited with code ${errorCode ?? 'unknown'}`))
            }

            const psPath = `${process.env.SystemRoot || 'C:\\Windows'}\\System32\\WindowsPowerShell\\v1.0\\powershell.exe`;

            const child = spawn(psPath, ['-NoProfile', '-Command', cmd], {
                stdio: 'pipe',
                cwd: process.env.USERPROFILE || process.env.SystemRoot || 'C:\\Windows',
                env: process.env,
            });

            child.stdout.on('data', (data) => {

                const text = data.toString()

                console.log(text) 

                this.emitter.emit('stdout', text)

            })

            child.stderr.on('data', (data) => {

                const text = data.toString()

                console.error(text) 

                this.emitter.emit('stderr', text)

            })

            child.on('exit', (code) => {
                code === 0 ? kill(true) : kill(false, code ?? undefined)
            });

            child.on('error', (err) => {
                kill(false)
            });

        })
    }
}