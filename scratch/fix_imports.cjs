const fs = require('fs');
const p = require('path');

const scan = (dir) => {
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir).forEach(f => {
        const pf = p.join(dir, f);
        if (fs.statSync(pf).isDirectory()) {
            scan(pf);
        } else if (pf.endsWith('.tsx') || pf.endsWith('.ts')) {
            let c = fs.readFileSync(pf, 'utf8');
            const noc = c.replace(/import\s+\{\s*useAuth\s*\}\s+from\s+['"](\.\.?\/contexts\/AuthContext)['"]/g, "import { useAuth } from '$1Base'");
            if (c !== noc) {
                fs.writeFileSync(pf, noc);
                console.log('Fixed:', pf);
            }
        }
    });
};
scan('c:/Users/James Tsai/OneDrive/Documents/GitHub/PortsmouthCommon/src');
