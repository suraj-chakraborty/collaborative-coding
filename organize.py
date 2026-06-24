import re

file_path = 'components/practice/complexity-data.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

header_match = re.search(r'(.*?concepts:\s*\[)(.*)', content, re.DOTALL)
header = header_match.group(1)
rest = header_match.group(2)

def extract_objects(text):
    objs = []
    idx = 0
    while True:
        start = text.find('{', idx)
        if start == -1: break
        
        title_idx = text.find("title: 'Q", start)
        if title_idx != -1 and title_idx < start + 50:
            stack = 0
            for i in range(start, len(text)):
                if text[i] == '{': stack += 1
                elif text[i] == '}':
                    stack -= 1
                    if stack == 0:
                        objs.append(text[start:i+1])
                        idx = i + 1
                        break
        else:
            idx = start + 1
    return objs

question_objs = extract_objects(rest)
print(f'Found {len(question_objs)} questions.')

def get_q_num(obj_str):
    m = re.search(r"title:\s*'Q(\d+):", obj_str)
    return int(m.group(1)) if m else 999

question_objs.sort(key=get_q_num)

for i in range(len(question_objs)):
    old_num = get_q_num(question_objs[i])
    question_objs[i] = re.sub(r"title:\s*'Q\d+:", f"title: 'Q{i+1}:", question_objs[i], 1)

levels = [
    ('Level 1: Basic Loops & Arrays (O(N) & O(N²))', 'Understanding fundamental linear and quadratic patterns.'),
    ('Level 2: Logarithmic & Binary Search (O(log N))', 'Algorithms that cut the search space in half each step.'),
    ('Level 3: Recursion, Trees & Sorting', 'Understanding the Call Stack, Branching factors, and divide-and-conquer.'),
    ('Level 4: Strings, Matrices & Two Pointers', 'Complexities involving multiple variables and dimensions.'),
    ('Level 5: Graphs & Dynamic Programming', 'Tricky traversals, built-in functions, and memoization.')
]

new_content = header + '\n'
for lvl_idx, (lvl_title, lvl_def) in enumerate(levels):
    new_content += f"""    {{
      title: '{lvl_title}',
      definition: '{lvl_def}',
      category: 6,
      subTopics: [
"""
    batch = question_objs[lvl_idx*10 : (lvl_idx+1)*10]
    new_content += ',\n'.join(['        ' + q.replace('\n', '\n        ') for q in batch])
    new_content += '\n      ]\n    }'
    if lvl_idx < 4:
        new_content += ',\n'

new_content += '\n  ]\n};\n'

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print('Successfully re-organized into 5 levels of exactly 10 questions each.')
