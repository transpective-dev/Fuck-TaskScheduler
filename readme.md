## Welcome to Fuck!timeScheduler

### what can we do ?
- run your ts file on a specific time
- we support interval, atTime, and inRange

inRange: you can specify the range to run your script
atTime: you can specify the time to run your script
interval: you can specify the interval to run your script

format: {
    plain (e.g. inRange): hh:mm
    complex (e.g. atTime): dd/mm/yyyy hh:mm
}

check api.ts for more information

### how to use ?

1. create TS file in scripts folder with .sche.ts extension

2. create your script!

```
// import api from api.ts
import { API } from './api.ts'

// instantiate API
const timer = new API()

// example 1:

// call every 5 minutes

timer.interval({
    min: 5,
    func: () => {
        console.log('hello world')
    }
})

// example 2:

// call everyday at 10:00

timer.atTime({
    time: '10:00',
    func: () => {
        console.log('hello world')
    }
})

```

### few things you should know

1. if you want to startup with OS, use `alt+drag` to create shortcut and put it in `shell:startup`

2. if you need to use packages, you can initialize a npm project and install from bun or npm

3. you can change checkInterval in api.ts