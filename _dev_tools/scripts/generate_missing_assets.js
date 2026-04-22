const fs = require('fs');
const execSync = require('child_process').execSync;

try {
  const output = execSync('grep -rhoI "assets/images/[a-zA-Z0-9_.-]*" --exclude-dir={node_modules,.next,.git,dist,out} . | grep -o "assets/images/[a-zA-Z0-9_.-]*" | sort | uniq').toString();
  const items = output.trim().split('\n');
  const dir = '/Users/zhoulin/Desktop/github/ai-playground/app/assets/images';
  
  if(!fs.existsSync(dir)) fs.mkdirSync(dir, {recursive:true});
  
  for(let item of items) {
    if(!item || !item.includes('.')) continue;
    const name = item.split('/').pop();
    if(!name || name === '') continue;
    
    let ext = name.split('.').pop().toLowerCase();
    let filepath = `${dir}/${name}`;
    
    if(!fs.existsSync(filepath)) {
        if(ext === 'svg') fs.writeFileSync(filepath, '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"></svg>');
        else if(ext === 'png') fs.writeFileSync(filepath, Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64'));
        else if(ext === 'jpg' || ext === 'jpeg') fs.writeFileSync(filepath, Buffer.from('/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=', 'base64'));
        else fs.writeFileSync(filepath, '');
        console.log('Generated mock file:', name);
    }
  }
  console.log('Done generating all dummy assets');
} catch (e) {
  console.error(e);
}
