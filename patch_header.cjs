const fs = require('fs');
const path = './src/components/Header.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add isOnline state
if (!content.includes('const [isOnline, setIsOnline] = useState')) {
  content = content.replace(
    'const [isMoreDropdownOpen, setIsMoreDropdownOpen] = useState(false);',
    'const [isMoreDropdownOpen, setIsMoreDropdownOpen] = useState(false);\n  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== "undefined" ? navigator.onLine : true);\n\n  useEffect(() => {\n    const handleOnline = () => setIsOnline(true);\n    const handleOffline = () => setIsOnline(false);\n    window.addEventListener("online", handleOnline);\n    window.addEventListener("offline", handleOffline);\n    return () => {\n      window.removeEventListener("online", handleOnline);\n      window.removeEventListener("offline", handleOffline);\n    };\n  }, []);'
  );
}

// 2. Modify the avatar indicator
const searchAvatar = `{isLoggedIn && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#0a0a0a]" title="Tài khoản đã đăng nhập" />
              )}`;
const replaceAvatar = `{isOnline ? (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#0a0a0a]" title="Đang online (Đã kết nối)" />
              ) : (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-[#0a0a0a] animate-pulse" title="Đang offline (Mất kết nối mạng)" />
              )}`;

if (content.includes(searchAvatar)) {
  content = content.replace(searchAvatar, replaceAvatar);
} else {
    // try looser matching
    const looseSearch = `{isLoggedIn && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#0a0a0a]" title="Tài khoản đã đăng nhập" />
              )}`;
    content = content.replace(looseSearch, replaceAvatar);
}

fs.writeFileSync(path, content);
console.log('patched header');
