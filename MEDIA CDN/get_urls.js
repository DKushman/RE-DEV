const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'dqcdbdt4v',
  api_key: '535413243343953',
  api_secret: '3JLrgzrSQyT5mYpiSj704C_n80g'
});

async function getImageUrls(folderName) {
  try {
    if (folderName) {
      console.log(`📁 Hole Bild-URLs aus Ordner: '${folderName}'...\n`);
    } else {
      console.log('🔍 Hole alle Bild-URLs...\n');
    }
    
    let allUrls = [];
    let nextCursor = null;
    let foundPrefix = null;
    
    // Wenn ein Ordner angegeben wurde, teste verschiedene Präfix-Varianten
    const prefixesToTry = folderName ? [
      folderName,
      `home/${folderName}`,
      `Home/${folderName}`,
      `${folderName}/`,
      `home/${folderName}/`,
      `Home/${folderName}/`
    ] : [null];
    
    for (const prefix of prefixesToTry) {
      try {
        let tempUrls = [];
        let tempCursor = null;
        
        do {
          const options = {
            type: 'upload',
            resource_type: 'image',
            max_results: 500
          };
          
          if (prefix) {
            options.prefix = prefix;
          }
          
          if (tempCursor) {
            options.next_cursor = tempCursor;
          }
          
          const result = await cloudinary.api.resources(options);
          
          if (result.resources && result.resources.length > 0) {
            result.resources.forEach(img => {
              const url = `https://res.cloudinary.com/dqcdbdt4v/image/upload/${img.public_id}.${img.format}`;
              tempUrls.push(url);
            });
          }
          
          tempCursor = result.next_cursor;
        } while (tempCursor);
        
        if (tempUrls.length > 0) {
          allUrls = tempUrls;
          foundPrefix = prefix;
          if (prefix) {
            console.log(`✅ Gefunden mit Präfix: '${prefix}'\n`);
          }
          break;
        }
      } catch (err) {
        continue;
      }
    }
    
    if (allUrls.length === 0) {
      console.log(`⚠️  Keine Bilder im Ordner '${folderName}' gefunden!`);
      console.log(`\n💡 Versuche es mit: 'home/${folderName}' oder 'Home/${folderName}'`);
      return;
    }
    
    console.log(`✅ Gefunden: ${allUrls.length} Bilder\n`);
    console.log('='.repeat(60));
    console.log('BILD-URLS:');
    console.log('='.repeat(60));
    
    allUrls.forEach(url => {
      console.log(url);
    });
    
    // Speichere in Datei
    const fs = require('fs');
    const fileName = folderName 
      ? `urls_${folderName.replace(/\//g, '_')}.txt` 
      : 'image_urls.txt';
    fs.writeFileSync(fileName, allUrls.join('\n'), 'utf-8');
    console.log(`\n💾 URLs wurden in '${fileName}' gespeichert`);
    
  } catch (error) {
    console.error('❌ Fehler:', error.message);
  }
}

// Ordner-Name aus Kommandozeilen-Argument (optional)
const folderName = process.argv[2];

// Wenn kein Ordner angegeben, zeige alle Bilder
getImageUrls(folderName);
