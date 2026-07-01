const play = require('play-dl');

async function testPlayDlLatency() {
  const videoId = 'dQw4w9WgXcQ';
  console.log(`Starting play-dl extraction for: ${videoId}`);
  
  const startTime = Date.now();
  
  try {
    const stream = await play.stream(videoId, { discordPlayerCompatibility: true, quality: 2 });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`\n✅ play-dl Extraction Successful!`);
    console.log(`Time taken: ${duration} ms (${(duration / 1000).toFixed(2)} seconds)`);
    console.log(`\nStream URL (First 100 chars): \n${stream.url.substring(0, 100)}...`);
    
  } catch (error) {
    console.error('Error extracting stream:', error);
  }
}

testPlayDlLatency();
