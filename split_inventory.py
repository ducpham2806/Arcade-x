import re

with open('src/components/InventoryModal.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the tabs state
content = re.sub(r"const \[activeTab, setActiveTab\] = useState<InventoryTab>\(initialTab\);\n", "", content)

# Remove the header tabs entirely
header_pattern = r"\{/\* Desktop Navigation Tabs \(Hidden on Mobile\) \*/\}.*?\{/\* TAB CONTENT \*/\}"
content = re.sub(header_pattern, "{/* TAB CONTENT */}", content, flags=re.DOTALL)

# Keep only the inventory part
part1 = content.split("{/* TAB CONTENT */}")[0]

# Find the start of the inventory part (after TAB 1)
part2_match = re.search(r"/\* ========================================================================= \*/\s*<div className=\"flex-1 flex flex-col md:flex-row overflow-hidden min-h-0\">(.*?)</div>\s*\)\s*:\s*activeTab === 'forge'", content, flags=re.DOTALL)

if part2_match:
    inventory_html = part2_match.group(1)
    
    # Restructure CSS Grid:
    # From: <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
    # To: <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden min-h-0">
    
    # Change the left sidebar from: w-full md:w-76 lg:w-80 border-b md:border-b-0 md:border-r border-white/10 bg-[#090a12] flex flex-col shrink-0 md:overflow-y-auto md:scrollbar-thin
    # To: md:col-span-4 lg:col-span-3 border-b md:border-b-0 md:border-r border-white/10 bg-[#090a12] flex flex-col md:overflow-y-auto md:scrollbar-thin
    
    inventory_html = inventory_html.replace('className="w-full md:w-76 lg:w-80 border-b md:border-b-0 md:border-r border-white/10 bg-[#090a12] flex flex-col shrink-0 md:overflow-y-auto md:scrollbar-thin"', 'className="md:col-span-5 lg:col-span-4 xl:col-span-3 border-b md:border-b-0 md:border-r border-white/10 bg-[#090a12] flex flex-col md:overflow-y-auto md:scrollbar-thin"')
    
    # Change the right main content from: flex-1 flex flex-col min-w-0 bg-[#0b0c14] md:overflow-hidden
    # To: md:col-span-7 lg:col-span-8 xl:col-span-9 flex flex-col min-w-0 bg-[#0b0c14] md:overflow-hidden
    inventory_html = inventory_html.replace('className="flex-1 flex flex-col min-w-0 bg-[#0b0c14] md:overflow-hidden"', 'className="md:col-span-7 lg:col-span-8 xl:col-span-9 flex flex-col min-w-0 bg-[#0b0c14] md:overflow-hidden"')
    
    # Wrap in grid
    final_content = part1 + f'{{/* TAB CONTENT */}}\n        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden min-h-0">\n{inventory_html}</div>\n      </div>\n    </div>\n  );\n}};\n'
    
    # Also we should change the header Title since it's hardcoded to check activeTab
    final_content = final_content.replace("{activeTab === 'inventory' ? 'Kho Đồ RPG' : activeTab === 'forge' ? 'Lò Rèn Ma Thuật' : activeTab === 'discovery' ? 'Khám Phá Công Thức' : 'Nhật Ký Lò Rèn'}", "'Kho Đồ RPG'")
    final_content = final_content.replace("{activeTab === 'inventory' ? 'Backpack' : activeTab === 'forge' ? 'Alchemy' : activeTab === 'discovery' ? 'Recipes' : 'Logs'}", "'Backpack'")
    final_content = final_content.replace("{activeTab === 'inventory' ? 'Quản lý trang bị, chiến lợi phẩm và mở rương báu' : activeTab === 'forge' ? 'Chạm vào ô để chọn vật phẩm và dung hợp nâng cấp' : activeTab === 'discovery' ? 'Thử nghiệm công thức bí mật để tìm bảo vật' : 'Lịch sử chế tác và đột biến trang bị'}", "'Quản lý trang bị, chiến lợi phẩm và mở rương báu'")
    final_content = final_content.replace("{activeTab === 'inventory' ? (\n                <Package className=\"w-5 h-5 text-indigo-400\" />\n              ) : activeTab === 'forge' ? (\n                <Hammer className=\"w-5 h-5 text-purple-400\" />\n              ) : activeTab === 'discovery' ? (\n                <FlaskConical className=\"w-5 h-5 text-amber-400\" />\n              ) : (\n                <History className=\"w-5 h-5 text-slate-300\" />\n              )}", "<Package className=\"w-5 h-5 text-indigo-400\" />")

    with open('src/components/InventoryModal.tsx', 'w', encoding='utf-8') as f:
        f.write(final_content)
    print("Done restructuring InventoryModal!")
else:
    print("Could not match the inventory html part.")
