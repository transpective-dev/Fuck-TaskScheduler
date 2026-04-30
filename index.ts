const SysTray = require('systray2').default || require('systray2');

const trayConfig = {
  menu: {
    title: "timer.js",
    tooltip: "running...",
    icon: "E:\\WSL-Kali\\LSFP\\Just play\\timer.js\\icon.ico",
    items: [
      {
        title: "Close current process",
        tooltip: "Close the current process",
        checked: false,
        enabled: true,
        click: () => {
          systray.kill(); // close systray process
          process.exit();  // close bun process
        }
      }
    ]
  },
  debug: false,
  copyDir: false 
};

const systray = new SysTray(trayConfig);

systray.onClick((action: any) => {
  if (action.item.click) {
    action.item.click();
  }
});

systray.ready().then(async () => {
  await import('./execute.ts');
});

// 3. keep process alive
setInterval(() => {
}, 1000*60*60);
