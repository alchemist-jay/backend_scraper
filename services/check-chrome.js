import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function checkChrome() {
    try {
        // Check if Chrome is installed
        const { stdout: chromeVersion } = await execAsync('google-chrome-stable --version');
        console.log('Chrome version:', chromeVersion);

        // Check Chrome executable path
        const { stdout: chromePath } = await execAsync('which google-chrome-stable');
        console.log('Chrome path:', chromePath);

        // Check if the file exists and is executable
        const { stdout: fileInfo } = await execAsync(`ls -l ${chromePath}`);
        console.log('Chrome file info:', fileInfo);
    } catch (error) {
        console.error('Error checking Chrome:', error);
    }
}

checkChrome();