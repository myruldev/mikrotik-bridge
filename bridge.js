const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const os = require('os');
const RouterOSClient = require('routeros-client').RouterOSClient;

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;

// --- UTILS: Get SSID & Local Network Info (Cross-Platform) ---
const getNetworkInfo = () => {
    return new Promise((resolve) => {
        const isWindows = os.platform() === 'win32';
        
        if (isWindows) {
            // Windows Logic
            exec('netsh wlan show interfaces', (err, stdout) => {
                let ssid = "Ethernet / Unknown";
                if (!err) {
                    const ssidMatch = stdout.match(/SSID\s+:\s(.+)/);
                    if (ssidMatch) ssid = ssidMatch[1].trim();
                }

                exec('ipconfig', (err, stdout) => {
                    let localIp = "0.0.0.0";
                    let gateway = "0.0.0.0";
                    const lines = stdout.split('\n');
                    for (let i = 0; i < lines.length; i++) {
                        if (lines[i].includes('IPv4 Address') && localIp === "0.0.0.0") {
                            localIp = lines[i].split(':')[1].trim();
                        }
                        if (lines[i].includes('Default Gateway') && gateway === "0.0.0.0") {
                            const val = lines[i].split(':')[1].trim();
                            if (val && val !== '::') gateway = val;
                        }
                    }
                    resolve({ ssid, localIp, gateway, platform: 'windows' });
                });
            });
        } else {
            // Linux / Android (Termux) Logic
            exec('ip addr show', (err, stdout) => {
                let localIp = "0.0.0.0";
                const ipMatch = stdout.match(/inet\s(\d+\.\d+\.\d+\.\d+)\/24\sbrd/);
                if (ipMatch) localIp = ipMatch[1];

                exec('ip route show', (err, stdout) => {
                    let gateway = "0.0.0.0";
                    const gwMatch = stdout.match(/default\svia\s(\d+\.\d+\.\d+\.\d+)/);
                    if (gwMatch) gateway = gwMatch[1];

                    // SSID Detection on Linux requires wireless-tools or similar, 
                    // on Android it's restricted, so we use dummy/best effort
                    let ssid = "Linux/Android Device";
                    resolve({ ssid, localIp, gateway, platform: 'linux' });
                });
            });
        }
    });
};

// --- API: Get Technician Status ---
app.get('/api/status', async (req, res) => {
    const info = await getNetworkInfo();
    res.json(info);
});

// --- API: Mikrotik Interactions ---
app.post('/api/mikrotik/fetch', async (req, res) => {
    const { host, user, password } = req.body;
    
    const client = new RouterOSClient({
        host: host || '10.10.10.1',
        user: user || 'admin',
        password: password || '',
        port: 8728,
        keepalive: true
    });

    try {
        const api = await client.connect();
        const active = await api.write('/ip/hotspot/active/print');
        const bindings = await api.write('/ip/hotspot/ip-binding/print');
        await client.close();
        res.json({ active, bindings });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- API: Bypass User ---
app.post('/api/mikrotik/bypass', async (req, res) => {
    const { host, user, password, mac, comment } = req.body;
    const client = new RouterOSClient({ host, user, password });
    try {
        const api = await client.connect();
        await api.write('/ip/hotspot/ip-binding/add', [
            `=mac-address=${mac}`,
            `=type=bypassed`,
            `=comment=${comment || 'Bypassed via Mobile Tool'}`
        ]);
        await client.close();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- API: Ping Test ---
app.get('/api/ping', (req, res) => {
    const target = req.query.host || '8.8.8.8';
    const isWindows = os.platform() === 'win32';
    const cmd = isWindows ? `ping -n 4 ${target}` : `ping -c 4 ${target}`;
    
    exec(cmd, (err, stdout) => {
        res.json({ output: stdout || "Ping timeout or error." });
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Bridge Multi-Platform jalan di http://localhost:${PORT}`);
    console.log(`OS Detected: ${os.platform()}`);
});
