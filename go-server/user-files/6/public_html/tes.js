import https from "https";

const TEST_URL = "https://speed.hetzner.de/100MB.bin"; // file test publik
const TEST_DURATION = 10; // detik

let downloaded = 0;
const start = Date.now();

console.log("🚀 Mulai speed test...\n");

https.get(TEST_URL, res => {
    res.on("data", chunk => {
        downloaded += chunk.length;

        const elapsed = (Date.now() - start) / 1000;
        const mb = downloaded / 1024 / 1024;
        const speed = (mb / elapsed).toFixed(2);

        process.stdout.write(
            `\r⬇️  ${mb.toFixed(2)} MB | ${speed} MB/s`
        );

        if (elapsed >= TEST_DURATION) {
            res.destroy();
            console.log("\n\n✅ Speed test selesai");
            console.log(`📊 Rata-rata: ${speed} MB/s`);
        }
    });
});
