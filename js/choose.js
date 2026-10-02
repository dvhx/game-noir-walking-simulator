// Show dialog where user chooses from few options one item
// linter: ngspicejs-lint --browser
// global:
"use strict";

export function choose(options) {
    // Show dialog where user chooses from few options one item
    // example: choose(['apple','banana']).then(fruit => console.log(fruit));
    // example: var fruit = await choose(['apple','banana']);
    return new Promise((resolve) => {
        var d = document.createElement('dialog');
        d.style.cssText = 'border: 1px solid silver; border-radius: 1ex; display: flex; background: #white; gap: 1ex; flex-direction: column;';
        for (const opt of options) {
            const btn = document.createElement('button');
            btn.textContent = opt;
            btn.onclick = () => {
                d.close();
                d.remove();
                resolve(opt);
            };
            d.appendChild(btn);
        }
        document.body.appendChild(d);
        d.showModal();
    });
}
