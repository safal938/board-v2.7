const fs = require('fs');

// Read the board items
const boardItems = JSON.parse(fs.readFileSync('api/data/boardItems.json', 'utf8'));

// Shift items in dili-analysis-zone down by 1000px
boardItems.forEach(item => {
  if (item.y >= 6000 && item.y < 12000) {
    const oldY = item.y;
    item.y = item.y + 1000;
    console.log(`Shifted ${item.id}: y ${oldY} → ${item.y}`);
  }
});

// Write back
fs.writeFileSync('api/data/boardItems.json', JSON.stringify(boardItems, null, 2));
console.log('\n✅ Updated api/data/boardItems.json');
