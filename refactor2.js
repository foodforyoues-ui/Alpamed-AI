const fs = require('fs');

const filePaths = [
    'c:/Users/walte/Desktop/proyectos/Nutria/frontend/src/app/page.tsx',
    'c:/Users/walte/Desktop/proyectos/Nutria/frontend/src/app/login/page.tsx',
    'c:/Users/walte/Desktop/proyectos/Nutria/frontend/src/app/components/PatientSummaryModal.tsx'
];

function replaceClasses(classesStr) {
    // Replace text strictly on words, regardless of surrounding punctuation
    let content = classesStr;
    content = content.replace(/\bemerald-\d+\b/g, 'primary');
    content = content.replace(/\bteal-\d+\b/g, 'primary');
    
    content = content.replace(/(?<!dark:)\bbg-slate-900\b/g, 'bg-white dark:bg-slate-900');
    content = content.replace(/(?<!dark:)\bbg-slate-950\b/g, 'bg-slate-50 dark:bg-slate-950');
    content = content.replace(/(?<!dark:)\bbg-slate-800\b/g, 'bg-slate-50 dark:bg-slate-800');
    content = content.replace(/(?<!dark:)\bbg-slate-700\b/g, 'bg-slate-200 dark:bg-slate-700');
    content = content.replace(/(?<!dark:)\btext-white\b/g, 'text-slate-900 dark:text-white');
    content = content.replace(/(?<!dark:)\btext-slate-400\b/g, 'text-slate-500 dark:text-slate-400');
    content = content.replace(/(?<!dark:)\btext-slate-300\b/g, 'text-slate-700 dark:text-slate-300');
    content = content.replace(/(?<!dark:)\bborder-slate-800\b/g, 'border-slate-200 dark:border-slate-800');
    content = content.replace(/(?<!dark:)\bborder-slate-700\b/g, 'border-slate-300 dark:border-slate-700');

    // Remove gradients
    content = content.replace(/\bbg-gradient-to-br\b/g, 'transition-colors');
    content = content.replace(/\bfrom-primary\b/g, '');
    content = content.replace(/\bvia-slate-50 dark:bg-slate-900\b/g, '');
    content = content.replace(/\bto-slate-50 dark:bg-slate-950\b/g, '');
    return content;
}

filePaths.forEach(file => {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');

        // Text changes
        content = content.replace(/\bNutria\b/g, 'Alpamed');
        content = content.replace(/#10b981/g, '#2CB7B3'); // Recharts

        // Avatar replacements strictly
        content = content.replace(
            /<span className="text-white text-sm">🥑<\/span>/g, 
            '<div className="bg-white p-1 rounded-md"><img src="/ALPAMED-nobg.png" alt="Alpamed" className="w-5 h-5 object-contain" /></div>'
        );
        content = content.replace(
            /<span className="text-white text-xl">🥑<\/span>/g, 
            '<div className="bg-white p-1 rounded-xl"><img src="/ALPAMED-nobg.png" alt="Alpamed" className="w-7 h-7 object-contain" /></div>'
        );

        // Apply class replacement only inside className attribute tags.
        // It covers className="..." and className={'...'}
        content = content.replace(/className=(["'])(.*?)\1/g, (match, quote, classes) => {
            return `className=${quote}${replaceClasses(classes)}${quote}`;
        });
        
        // Let's also do a safe pass for template literal inside expressions: className={`...`}
        content = content.replace(/className=\{`(.*?)`\}/gs, (match, classes) => {
            return `className={\`${replaceClasses(classes)}\`}`;
        });

        fs.writeFileSync(file, content);
        console.log(`Updated ${file}`);
    }
});
