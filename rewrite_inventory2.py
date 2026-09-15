import re

with open('src/components/InventoryModal.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the tabs state
content = re.sub(r"const \[activeTab, setActiveTab\] = useState<InventoryTab>\(initialTab\);\n", "", content)

# Remove the header tabs entirely
header_pattern = r"\{/\* Desktop Navigation Tabs \(Hidden on Mobile\) \*/\}.*?\{/\* TAB CONTENT \*/\}"
content = re.sub(header_pattern, "{/* TAB CONTENT */}", content, flags=re.DOTALL)

# Remove the Mobile Header tabs
mobile_pattern = r"\{/\* Mobile Navigation Tabs \*/\}.*?\{/\* TAB CONTENT \*/\}"
content = re.sub(mobile_pattern, "{/* TAB CONTENT */}", content, flags=re.DOTALL)

# Remove activeTab wrapper
# Instead of {activeTab === 'inventory' ? ( ... ) : activeTab === 'forge' ? ...
# We just want the inventory part and close it.

inventory_content_match = re.search(r"\{/\* TAB 1: INVENTORY & EQUIPMENT\s+\*/\}\n\s+/\* ========================================================================= \*/\}(.*?)\{/\* ========================================================================= \*/\}\n\s+/\* TAB 2: REIMAGINED FORGE & ALCHEMY", content, flags=re.DOTALL)

if inventory_content_match:
    print("Found inventory content!")
else:
    print("Could not find inventory content")

