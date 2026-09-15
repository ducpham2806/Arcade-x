with open('src/components/InventoryModal.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

while lines and lines[-1].strip() != "})}":
    lines.pop()

# at this point, we are right after `})}`
# Now we close the tags.
# How many tags do we need to close? 
# The trace before `})}` was 8 at line 841.
# So we need 8 `</div>`s.
# wait, gridSlots.map returns JSX. The 8 divs are:
# 1. flex-1 grid
# 2. right pane
# 3. pb-8
# 4. grid cols
# 5. modal box
# 6. fixed inset-0
# wait, that's 6 divs!
# Why was the count 8? 
# Oh! Because `gridSlots.map` is inside `{` so it doesn't close them.
# The trace was 9 at line 820 inside map, and 8 after map ends.

lines.extend([
    "                </div>\n", # closes grid
    "              </div>\n",   # closes pb-8
    "            </div>\n",     # closes right pane
    "          </div>\n",       # closes flex-1 grid wrapper
    "        </div>\n",         # closes w-full max-w-5xl
    "      </div>\n",           # closes fixed inset-0
    "  );\n",
    "};\n"
])

with open('src/components/InventoryModal.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)
