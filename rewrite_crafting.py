import re

with open('src/components/CraftingModal.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Change initialTab type
content = content.replace("initialTab?: InventoryTab", "initialTab?: 'forge' | 'discovery' | 'log'")
content = content.replace("const [activeTab, setActiveTab] = useState<InventoryTab>(initialTab);", "const [activeTab, setActiveTab] = useState<'forge' | 'discovery' | 'log'>(initialTab as any || 'forge');")

# Remove the inventory tab button from Desktop Navigation
desktop_inv_btn_pattern = r'<button\s*id="tab-btn-inventory"\s*type="button"\s*onClick=\{\(\) => \{\s*soundEngine\.play\(\'click\'\);\s*setActiveTab\(\'inventory\'\);\s*\}\}\s*className=\{.*?\}\s*>\s*<Package className="w-3\.5 h-3\.5" />\s*<span>Kho Đồ</span>\s*</button>'
content = re.sub(desktop_inv_btn_pattern, "", content, flags=re.DOTALL)

# Remove the inventory tab button from Mobile Navigation
mobile_inv_btn_pattern = r'<button\s*id="tab-btn-inventory-mobile"\s*type="button"\s*onClick=\{\(\) => \{\s*soundEngine\.play\(\'click\'\);\s*setActiveTab\(\'inventory\'\);\s*\}\}\s*className=\{.*?\}\s*>\s*<Package className="w-3\.5 h-3\.5" />\s*<span>Kho Đồ</span>\s*</button>'
content = re.sub(mobile_inv_btn_pattern, "", content, flags=re.DOTALL)

# Remove the activeTab === 'inventory' content
inv_content_pattern = r"\{activeTab === 'inventory' \? \(\s*/\* ========================================================================= \*/\s*/\* TAB 1: INVENTORY & EQUIPMENT\s+\*/\s*/\* ========================================================================= \*/\s*<div className=\"flex-1 flex flex-col md:flex-row overflow-hidden min-h-0\">.*?</div>\s*\)\s*:\s*activeTab === 'forge' \? \("
content = re.sub(inv_content_pattern, "{activeTab === 'forge' ? (", content, flags=re.DOTALL)

# Update the Header title logic to exclude inventory
content = content.replace("{activeTab === 'inventory' ? 'Kho Đồ RPG' : activeTab === 'forge' ? 'Lò Rèn Ma Thuật' : activeTab === 'discovery' ? 'Khám Phá Công Thức' : 'Nhật Ký Lò Rèn'}", "{activeTab === 'forge' ? 'Lò Rèn Ma Thuật' : activeTab === 'discovery' ? 'Khám Phá Công Thức' : 'Nhật Ký Lò Rèn'}")
content = content.replace("{activeTab === 'inventory' ? 'Backpack' : activeTab === 'forge' ? 'Alchemy' : activeTab === 'discovery' ? 'Recipes' : 'Logs'}", "{activeTab === 'forge' ? 'Alchemy' : activeTab === 'discovery' ? 'Recipes' : 'Logs'}")
content = content.replace("{activeTab === 'inventory' ? 'Quản lý trang bị, chiến lợi phẩm và mở rương báu' : activeTab === 'forge' ? 'Chạm vào ô để chọn vật phẩm và dung hợp nâng cấp' : activeTab === 'discovery' ? 'Thử nghiệm công thức bí mật để tìm bảo vật' : 'Lịch sử chế tác và đột biến trang bị'}", "{activeTab === 'forge' ? 'Chạm vào ô để chọn vật phẩm và dung hợp nâng cấp' : activeTab === 'discovery' ? 'Thử nghiệm công thức bí mật để tìm bảo vật' : 'Lịch sử chế tác và đột biến trang bị'}")
content = content.replace("{activeTab === 'inventory' ? (\n                <Package className=\"w-5 h-5 text-indigo-400\" />\n              ) : activeTab === 'forge' ? (\n                <Hammer className=\"w-5 h-5 text-purple-400\" />\n              ) : activeTab === 'discovery' ? (\n                <FlaskConical className=\"w-5 h-5 text-amber-400\" />\n              ) : (\n                <History className=\"w-5 h-5 text-slate-300\" />\n              )}", "{activeTab === 'forge' ? (\n                <Hammer className=\"w-5 h-5 text-purple-400\" />\n              ) : activeTab === 'discovery' ? (\n                <FlaskConical className=\"w-5 h-5 text-amber-400\" />\n              ) : (\n                <History className=\"w-5 h-5 text-slate-300\" />\n              )}")

with open('src/components/CraftingModal.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
