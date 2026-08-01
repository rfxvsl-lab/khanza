const fs = require('fs');
const path = require('path');

const iconMap = {
  'ArrowRight': 'cil:arrow-right',
  'ShieldCheck': 'cil:shield-alt',
  'Sparkles': 'cil:star',
  'Droplets': 'cil:drop',
  'CheckCircle': 'cil:check-circle',
  'Check': 'cil:check',
  'ClipboardList': 'cil:clipboard',
  'Wrench': 'cil:settings',
  'Car': 'cil:car-alt',
  'Loader2': 'cil:reload',
  'Copy': 'cil:copy',
  'X': 'cil:x',
  'Menu': 'cil:menu',
  'Phone': 'cil:phone',
  'Mail': 'cil:envelope-closed',
  'Instagram': 'cib:instagram',
  'Facebook': 'cib:facebook-f',
  'MapPin': 'cil:location-pin',
  'Edit': 'cil:pencil',
  'Trash2': 'cil:trash',
  'Plus': 'cil:plus',
  'ChevronDown': 'cil:chevron-bottom',
  'ChevronUp': 'cil:chevron-top',
  'ArrowUp': 'cil:arrow-top',
  'ArrowDown': 'cil:arrow-bottom',
  'UploadCloud': 'cil:cloud-upload',
  'Eye': 'cil:eye',
  'LayoutDashboard': 'cil:speedometer',
  'CalendarDays': 'cil:calendar',
  'Settings': 'cil:settings',
  'LogOut': 'cil:account-logout',
  'Star': 'cil:star',
  'Save': 'cil:save',
  'Search': 'cil:search',
  'Filter': 'cil:filter',
  'Download': 'cil:cloud-download',
  'Tag': 'cil:tag',
  'ToggleLeft': 'cil:toggle-off',
  'ToggleRight': 'cil:toggle-on',
  'Image': 'cil:image',
  'Monitor': 'cil:monitor',
  'HelpCircle': 'cil:info',
  'MessageSquare': 'cil:speech',
  'Users': 'cil:people',
  'User': 'cil:user',
  'Clock': 'cil:clock',
  'CreditCard': 'cil:credit-card',
  'RefreshCw': 'cil:loop-circular',
  'Printer': 'cil:print',
  'AlertCircle': 'cil:warning',
  'AlertTriangle': 'cil:warning',
  'FileText': 'cil:file',
  'MoreVertical': 'cil:options'
};

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.nuxt' && file !== '.output' && !file.startsWith('.')) {
        processDirectory(fullPath);
      }
    } else if (file.endsWith('.vue')) {
      processFile(fullPath);
    }
  }
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let hasLucide = false;

  // 1. Remove lucide-vue-next imports
  content = content.replace(/import\s+\{([^}]+)\}\s+from\s+['"]lucide-vue-next['"];?\n?/g, (match, imports) => {
    hasLucide = true;
    return '';
  });

  if (!hasLucide && !content.includes('lucide-vue-next')) {
    // maybe it was already removed, but still need to check for old components if it failed midway
  }

  // 2. Replace component usage
  Object.keys(iconMap).forEach(lucideIcon => {
    const coreuiIcon = iconMap[lucideIcon];
    
    // Self-closing tags: <Sparkles :size="20" /> => <Icon name="cil:star" size="20" />
    const selfClosingRegex = new RegExp(`<${lucideIcon}\\s*([^>]*)/>`, 'g');
    content = content.replace(selfClosingRegex, (match, props) => {
      hasLucide = true;
      // Replace :size="x" with size="x" if needed, or just keep props
      // nuxt-icon uses `size` or just passes it through
      return `<Icon name="${coreuiIcon}" ${props.trim()} />`;
    });

    // Opening and closing tags: <Sparkles>...</Sparkles> (rare for icons, but just in case)
    const openCloseRegex = new RegExp(`<${lucideIcon}\\s*([^>]*)>(.*?)<\\/${lucideIcon}>`, 'g');
    content = content.replace(openCloseRegex, (match, props, inner) => {
      hasLucide = true;
      return `<Icon name="${coreuiIcon}" ${props.trim()}>${inner}</Icon>`;
    });
    
    // Dynamic component: <component :is="item.icon" ... />
    // This is trickier if it's in a script. Let's look for `icon: Sparkles` in script and change it to `icon: 'cil:star'`
    const scriptRegex = new RegExp(`(?<!['"\`])\\b${lucideIcon}\\b(?!['"\`])`, 'g');
    
    // We only want to replace in script if it's outside of a string
    // This is a naive replace, but we only do it if the file had lucide imports
    if (hasLucide) {
      // Actually, it's safer to just replace `icon: Sparkles` with `icon: '${coreuiIcon}'`
      const objPropRegex = new RegExp(`\\bicon:\\s*${lucideIcon}\\b`, 'g');
      content = content.replace(objPropRegex, `icon: '${coreuiIcon}'`);
      
      // Also for <component :is="item.icon" ... /> we don't need to change if it passes string to <Icon>
      // But wait! <component :is="'cil:star'" /> won't work with <Icon> because <component> expects a Vue component.
      // In Nuxt, we should use <Icon :name="item.icon" /> instead of <component :is="item.icon" />
    }
  });

  // Replace <component :is="item.icon" ... /> with <Icon :name="item.icon" ... />
  if (hasLucide) {
    const componentRegex = /<component\s+:is="([^"]+)"([^>]*)(\/?)>/g;
    content = content.replace(componentRegex, (match, isProp, props, closing) => {
      // If it looks like it's used for icons
      if (isProp.includes('icon') || isProp.includes('Icon')) {
        return `<Icon :name="${isProp}"${props}${closing ? ' />' : '>'}`;
      }
      return match;
    });
    
    const componentCloseRegex = /<\/component>/g;
    // We can't safely replace all </component> without knowing if it was an icon, but usually they are self-closing.
    // If not, we just assume self-closing for icons in this project.
  }

  if (hasLucide) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

processDirectory(path.join(__dirname));
