import p, { join } from 'node:path';
import r from 'node:process';
import c from 'node:child_process';
import f from 'node:fs';
import e from 'fs-extra';

const b = './build';
const o = './single';
const s = './.single';

function RM(path) {
	f.rmSync(path, {
		recursive: true,
		force: true
	});
}

if (f.existsSync(s)) {
	RM(s);
} else {
	f.mkdirSync(s);
}

RM(p.join(o, 'node_modules'));

f.cpSync(o, s, { recursive: true });
f.cpSync(b, p.join(s, 'public'), { recursive: true });
e.moveSync(p.join(s, 'public', '_app'), p.join(s, '_app'), { overwrite: true });
f.renameSync(p.join(s, 'public', 'index.html'), p.join(s, 'index.html'));
r.chdir(s);

function EXEC(command) {
	console.log(`Running ${command}`);
	c.execSync(command, (err, stdout, stderr) => {
		if (err) {
			console.error(`exec error: ${err}`);
			return;
		}
		console.log(`stdout: ${stdout}`);
		console.log(`stderr: ${stderr}`);
	});
}

['pnpm i', 'pnpm run build'].forEach((v) => EXEC(v));
