const fs = require('fs');
const path = require('path');

const MAX_AGE_DAYS = 7; // Keep videos for 7 days
const RESULTS_DIR = path.join(__dirname, 'test-results');

function cleanOldVideos() {
  if (!fs.existsSync(RESULTS_DIR)) {
    console.log('No test-results directory found');
    return;
  }

  const now = new Date();
  let deletedCount = 0;

  fs.readdirSync(RESULTS_DIR).forEach(testDir => {
    const testPath = path.join(RESULTS_DIR, testDir);
    const videoPath = path.join(testPath, 'video.webm');
    
    if (fs.existsSync(videoPath)) {
      const stats = fs.statSync(videoPath);
      const ageDays = (now - stats.mtime) / (1000 * 60 * 60 * 24);
      
      if (ageDays > MAX_AGE_DAYS) {
        fs.unlinkSync(videoPath);
        deletedCount++;
        
        // Remove empty test directory
        if (fs.readdirSync(testPath).length === 0) {
          fs.rmdirSync(testPath);
        }
      }
    }
  });

  console.log(`Deleted ${deletedCount} old video files`);
}

cleanOldVideos();
