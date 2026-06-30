const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, searchRegex, replaceWith) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(searchRegex, replaceWith);
    fs.writeFileSync(filePath, content, 'utf8');
}

// 1. AuthContext.tsx
const authContextPath = path.join('src', 'context', 'AuthContext.tsx');
replaceInFile(authContextPath, 
    /const res = await fetch\("\/api\/auth\/me", \{ credentials: "include" \}\);/,
    `const token = localStorage.getItem("token");
      if (!token) { setUser(null); setLoading(false); return; }
      const res = await fetch("http://localhost:5000/api/auth/me", { headers: { "Authorization": "Bearer " + token } });`
);

replaceInFile(authContextPath,
    /await fetch\("\/api\/auth\/logout", \{ method: "POST", credentials: "include" \}\);/,
    `localStorage.removeItem("token");`
);

// 2. Login Page
const loginPath = path.join('src', 'app', 'login', 'page.tsx');
replaceInFile(loginPath,
    /const data = await res\.json\(\);\s+if \(res\.ok\) \{/m,
    `const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem("token", data.token);`
);

// 3. Register Page
const registerPath = path.join('src', 'app', 'register', 'page.tsx');
replaceInFile(registerPath,
    /const data = await res\.json\(\);\s+if \(res\.ok\) \{/m,
    `const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem("token", data.token);`
);

// 4. Update all fetches to include the token header
function walkDir(dir) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            walkDir(dirPath);
        } else if (dirPath.endsWith('.tsx')) {
            let content = fs.readFileSync(dirPath, 'utf8');
            let original = content;
            // Replace fetches with credentials: "include" with headers: { Authorization: "Bearer " + localStorage.getItem("token") }
            content = content.replace(/\{ credentials: "include" \}/g, `{ headers: { "Authorization": "Bearer " + localStorage.getItem("token") } }`);
            
            // For dashboard.tsx which might have {credentials: "include"} (no space)
            content = content.replace(/\{credentials: "include"\}/g, `{ headers: { "Authorization": "Bearer " + localStorage.getItem("token") } }`);
            
            // For submit POST
            content = content.replace(/credentials: "include"/g, `headers: { "Content-Type": "application/json", "Authorization": "Bearer " + localStorage.getItem("token") }`);
            
            if (content !== original) {
                fs.writeFileSync(dirPath, content, 'utf8');
            }
        }
    });
}

walkDir(path.join('src', 'app'));

console.log("Frontend patched to use Token Auth successfully!");
