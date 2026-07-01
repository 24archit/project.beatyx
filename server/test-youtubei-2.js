const { Innertube } = require('youtubei.js');

async function testFastExtraction() {
  const videoId = 'dQw4w9WgXcQ';
  console.log(`Starting real-time extraction for: ${videoId}`);
  
  const startTime = Date.now();
  
  try {
    const yt = await Innertube.create();
    const info = await yt.getBasicInfo(videoId);
    
    const format = info.chooseFormat({ type: 'audio', quality: 'best' });
    
    // In youtubei.js, the URL is usually in format.decipher(yt.session.player) or format.url
    let streamUrl = format.url;
    if (!streamUrl) {
        streamUrl = format.signature_cipher ? yt.session.player.decipher(format.signature_cipher) : "Cannot decipher";
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`\n✅ Extraction Successful!`);
    console.log(`Time taken: ${duration} ms`);
    console.log(`\nStream URL:\n${streamUrl ? streamUrl.substring(0, 150) : "N/A"}...`);
    
  } catch (error) {
    console.error('Error extracting stream:', error);
  }
}

testFastExtraction();
