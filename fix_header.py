with open('src/components/InventoryModal.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

replacement = """          </div>
          <CloseButton onClick={() => {
            soundEngine.play('click');
            setActiveModal('none');
          }} />
        </div>

        {/* TAB CONTENT */}"""

content = content.replace("          </div>\n\n          {/* TAB CONTENT */}", replacement)

with open('src/components/InventoryModal.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
