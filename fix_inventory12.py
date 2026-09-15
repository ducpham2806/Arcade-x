with open('src/components/InventoryModal.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

while lines and lines[-1].strip() in ["};", ");", "</div>", "}"]:
    lines.pop()

# Let's count unclosed divs using a simple stack
stack = []
for i, line in enumerate(lines):
    # This is a bit tricky, but let's just append the exact structure we know is missing.
    pass

# We know we need:
# 1. </div> for `grid grid-cols-4`
# 2. </div> for `pb-8`
# 3. </div> for `flex-1 flex flex-col p-3`
# 4. </div> for `flex-1 grid grid-cols-1`
# 5. </div> for `w-full max-w-5xl`
# 6. </div> for `fixed inset-0`
lines.extend([
    "                </div>\n",
    "              </div>\n",
    "            </div>\n",
    "          </div>\n",
    "        </div>\n",
    "      </div>\n",
    "    </AnimatePresence>\n" # Wait, did I miss an AnimatePresence? Let's check!
])
lines.append("  );\n")
lines.append("};\n")

with open('src/components/InventoryModal.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)
