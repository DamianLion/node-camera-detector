const { spawn } = require("child_process");
const chalk = require('chalk');
const find = require('find-process');

// log stream --predicate 'subsystem == "com.apple.VDCAssistant"'

const logStream = spawn("log", ["stream", "--color", "none", "--predicate", "subsystem == \"com.apple.VDCAssistant\""]);

logStream.stdout.on("data", async data => {
    let logLine = data.toString()

    if (logLine.includes("Post event kCameraStream")) {
        let logLineReduceWhitespace = logLine.replace(/\s+/g, ' ');
        let splitLogLine = logLineReduceWhitespace.split(" ");
        let date = `${splitLogLine[0]} ${splitLogLine[1]}`;
        let pid = splitLogLine[5];
        const processes = await find('pid', pid);
        const started = logLineReduceWhitespace.toLowerCase().includes('start')
        const action = started ? 'started' : 'stopped';
        processes.map (process => {
            let out = chalk.black(`${date} - ${chalk.bold(process.name)}[${process.pid}] has ${chalk.bold(action)} accessing your camera`)
            console.log(started ? chalk.bgGreenBright(out) : chalk.bgRedBright(out))
        })
    }
});

logStream.stderr.on("data", data => {
    console.log(`stderr: ${data}`);
});

logStream.on('error', (error) => {
    console.log(`error: ${error.message}`);
});

logStream.on("close", code => {
    console.log(`child process exited with code ${code}`);
});
