const fs = require('fs');
function optimizeFile(file) {
    if (!fs.existsSync(file)) return;
    let f = fs.readFileSync(file, 'utf8');
    // Add lazy loading to images
    f = f.replace(/<img(?![^>]*loading=)[^>]*src="?assets\/img\/portfolio\/(.*?)"?[^>]*>/g, match => {
        return match.replace('<img', '<img loading="lazy"');
    });
    f = f.replace(/<img(?![^>]*loading=)[^>]*src="?assets\/img\/echip.png"?[^>]*>/g, match => {
        return match.replace('<img', '<img loading="lazy"');
    });
    // Blog article images
    f = f.replace(/<img(?![^>]*loading=)[^>]*src="?assets\/img\/blog\/(.*?)"?[^>]*>/g, match => {
        return match.replace('<img', '<img loading="lazy"');
    });
    // Robot images
    f = f.replace(/<img(?![^>]*loading=)[^>]*src="?assets\/roboti\/(.*?)"?[^>]*>/g, match => {
        return match.replace('<img', '<img loading="lazy"');
    });

    // Script tags
    f = f.replace(/<script src="(?!.*defer)(.*?)"/g, '<script defer src="$1"');

    fs.writeFileSync(file, f);
    console.log('Optimized', file);
}

optimizeFile('index.html');
optimizeFile('blog.html');
optimizeFile('ftc-decode-1v1.html');
