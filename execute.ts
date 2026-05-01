import fs from 'fs-extra';
import path from 'path';

const root = process.env.ROOTPATH!;

const script_loader = async () => {

    console.log(root)

    const scripts = path.join(root, 'scripts');

    await fs.ensureDir(scripts);

    let res = await fs.readdir(scripts)

    res = res.filter((i) => i.includes('.sche.ts'))

    for (const i of res) {
        await import(path.join(scripts, i))
    }

}

script_loader();


