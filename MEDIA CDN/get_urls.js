const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'dqcdbdt4v',
  api_key: '535413243343953',
  api_secret: '3JLrgzrSQyT5mYpiSj704C_n80g'
});

async function getResourceUrls(folderName, resourceType) {
  try {
    let tempUrls = [];
    let tempCursor = null;
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
        let tempUrlsForPrefix = [];
        let tempCursorForPrefix = null;
        
        do {
          const options = {
            type: 'upload',
            resource_type: resourceType,
            max_results: 500
          };
          
          if (prefix) {
            options.prefix = prefix;
          }
          
          if (tempCursorForPrefix) {
            options.next_cursor = tempCursorForPrefix;
          }
          
          const result = await cloudinary.api.resources(options);
          
          if (result.resources && result.resources.length > 0) {
            result.resources.forEach(resource => {
              let url;
              if (resourceType === 'image') {
                url = `https://res.cloudinary.com/dqcdbdt4v/image/upload/${resource.public_id}.${resource.format}`;
              } else if (resourceType === 'video') {
                url = `https://res.cloudinary.com/dqcdbdt4v/video/upload/${resource.public_id}.${resource.format}`;
              } else if (resourceType === 'raw') {
                url = `https://res.cloudinary.com/dqcdbdt4v/raw/upload/${resource.public_id}.${resource.format}`;
              }
              if (url) {
                tempUrlsForPrefix.push(url);
              }
            });
          }
          
          tempCursorForPrefix = result.next_cursor;
        } while (tempCursorForPrefix);
        
        if (tempUrlsForPrefix.length > 0) {
          tempUrls = tempUrlsForPrefix;
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
    
    return tempUrls;
  } catch (error) {
    console.error(`❌ Fehler beim Holen von ${resourceType}:`, error.message);
    return [];
  }
}

async function getAllUrls(folderName) {
  try {
    if (folderName) {
      console.log(`📁 Hole alle Dateien aus Ordner: '${folderName}'...\n`);
    } else {
      console.log('🔍 Hole alle Dateien...\n');
    }
    
    // Hole alle Resource-Typen
    const resourceTypes = ['image', 'video', 'raw'];
    let allUrls = [];
    
    for (const resourceType of resourceTypes) {
      console.log(`📦 Lade ${resourceType}...`);
      const urls = await getResourceUrls(folderName, resourceType);
      allUrls = allUrls.concat(urls);
      if (urls.length > 0) {
        console.log(`   ✅ ${urls.length} ${resourceType}(s) gefunden\n`);
      }
    }
    
    if (allUrls.length === 0) {
      console.log(`⚠️  Keine Dateien im Ordner '${folderName}' gefunden!`);
      console.log(`\n💡 Versuche es mit: 'home/${folderName}' oder 'Home/${folderName}'`);
      return;
    }
    
    console.log(`✅ Gesamt gefunden: ${allUrls.length} Dateien\n`);
    console.log('='.repeat(60));
    console.log('ALLE URLS:');
    console.log('='.repeat(60));
    
    allUrls.forEach(url => {
      console.log(url);
    });
    
    // Speichere in Datei
    const fs = require('fs');
    const fileName = folderName 
      ? `urls_${folderName.replace(/\//g, '_')}.txt` 
      : 'all_urls.txt';
    fs.writeFileSync(fileName, allUrls.join('\n'), 'utf-8');
    console.log(`\n💾 URLs wurden in '${fileName}' gespeichert`);
    
  } catch (error) {
    console.error('❌ Fehler:', error.message);
  }
}

// Ordner-Name aus Kommandozeilen-Argument (optional)
const folderName = process.argv[2];

// Hole alle Dateitypen (Bilder, Videos, SVG, etc.)
getAllUrls(folderName);
