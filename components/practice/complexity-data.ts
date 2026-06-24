import { Layers } from 'lucide-react';

export const COMPLEXITY_MASTERY_CARD = {
  id: 'complexity-mastery',
  name: 'Complexity (50 Questions)',
  shortName: 'Complexity',
  desc: 'Master Time and Space Complexity through top-tier interview questions. Step-by-step breakdowns for every scenario.',
  icon: Layers,
  color: 'color-red',
  gradient: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
  concepts: [
    {
      title: 'Level 1: Basic Loops & Arrays (O(N) & O(N²))',
      definition: 'Understanding fundamental linear and quadratic patterns.',
      category: 6,
      subTopics: [
        {
                  title: 'Q1: Single Loop',
                  definition: 'Iterating through an array once.',
                  analogy: 'Reading every page of a book one by one.',
                  detailedExplanation: '**Time Complexity Process:**\n1. The loop runs from `i = 0` to `N-1`.\n2. Inside the loop, we do a constant O(1) operation (printing).\n3. N iterations * O(1) = O(N) Total Time.\n\n**Space Complexity Process:**\n1. We only allocate a single integer variable `i` for the loop.\n2. No additional data structures are created.\n3. Total Space is O(1).',
                  memoryTip: 'One loop over N items = O(N) Time.',
                  timeComplexity: 'O(N)',
                  spaceComplexity: 'O(1)',
                  complexityTable: 'Time: O(N)\nSpace: O(1)',
                  examples: {
                    python: `def print_all(arr):\n    for num in arr:\n        print(num)`,
                    javascript: `function printAll(arr) {\n    for (let num of arr) {\n        console.log(num);\n    }\n}`,
                    java: `public void printAll(int[] arr) {\n    for (int num : arr) {\n        System.out.println(num);\n    }\n}`,
                    cpp: `void printAll(vector<int>& arr) {\n    for (int num : arr) {\n        cout << num << endl;\n    }\n}`
                  }
                },
        {
                  title: 'Q2: Nested Loops (Every Pair)',
                  definition: 'Two nested loops iterating over the same array.',
                  analogy: 'Introducing every person in a room to every other person.',
                  detailedExplanation: '**Time Complexity Process:**\n1. Outer loop runs N times.\n2. Inner loop runs N times for EVERY outer iteration.\n3. Total operations = N * N = N².\n\n**Space Complexity Process:**\n1. Only primitive variables `i` and `j` are created.\n2. No dynamic memory allocation.\n3. Total Space is O(1).',
                  memoryTip: 'Nested loops over the same array = O(N²) Time.',
                  timeComplexity: 'O(N²)',
                  spaceComplexity: 'O(1)',
                  complexityTable: 'Time: O(N²)\nSpace: O(1)',
                  examples: {
                    python: `def print_pairs(arr):\n    for i in arr:\n        for j in arr:\n            print(i, j)`,
                    javascript: `function printPairs(arr) {\n    for (let i of arr) {\n        for (let j of arr) {\n            console.log(i, j);\n        }\n    }\n}`,
                    java: `public void printPairs(int[] arr) {\n    for (int i : arr) {\n        for (int j : arr) {\n            System.out.println(i + " " + j);\n        }\n    }\n}`,
                    cpp: `void printPairs(vector<int>& arr) {\n    for (int i : arr) {\n        for (int j : arr) {\n            cout << i << " " << j << endl;\n        }\n    }\n}`
                  }
                },
        {
                  title: 'Q3: Nested Loops (i to N, j from i to N)',
                  definition: 'Inner loop starts from the outer loop index.',
                  analogy: 'Handshakes in a room. You shake hands with everyone, then the next person shakes hands with everyone *except you*, and so on.',
                  detailedExplanation: '**Time Complexity Process:**\n1. When i=0, inner runs N times. When i=1, inner runs N-1 times...\n2. Total runs = N + (N-1) + (N-2) + ... + 1.\n3. This is an arithmetic series equal to N(N+1)/2.\n4. Drop constants and lower order terms: O(N²).\n\n**Space Complexity Process:**\n1. Still only using O(1) extra space for indices.',
                  memoryTip: 'N(N+1)/2 simplifies to O(N²).',
                  timeComplexity: 'O(N²)',
                  spaceComplexity: 'O(1)',
                  complexityTable: 'Time: O(N²)\nSpace: O(1)',
                  examples: {
                    python: `def unique_pairs(arr):\n    for i in range(len(arr)):\n        for j in range(i, len(arr)):\n            print(arr[i], arr[j])`,
                    javascript: `function uniquePairs(arr) {\n    for (let i=0; i<arr.length; i++) {\n        for (let j=i; j<arr.length; j++) {\n            console.log(arr[i], arr[j]);\n        }\n    }\n}`,
                    java: `public void uniquePairs(int[] arr) {\n    for (int i=0; i<arr.length; i++) {\n        for (int j=i; j<arr.length; j++) {\n            System.out.println(arr[i] + " " + arr[j]);\n        }\n    }\n}`,
                    cpp: `void uniquePairs(vector<int>& arr) {\n    for (int i=0; i<arr.size(); i++) {\n        for (int j=i; j<arr.size(); j++) {\n            cout << arr[i] << " " << arr[j] << endl;\n        }\n    }\n}`
                  }
                },
        {
                  title: 'Q4: Two Separate Sequential Loops',
                  definition: 'Two unnested loops running one after the other.',
                  analogy: 'Reading book A, then completely finishing it and reading book B.',
                  detailedExplanation: '**Time Complexity Process:**\n1. First loop takes O(N) time.\n2. Second loop takes O(N) time.\n3. Total Time = O(N) + O(N) = O(2N).\n4. We drop constants in Big-O notation, so it simplifies to O(N).\n\n**Space Complexity Process:**\n1. O(1) space used.',
                  memoryTip: 'Sequential loops add up: O(N) + O(N) = O(N).',
                  timeComplexity: 'O(N)',
                  spaceComplexity: 'O(1)',
                  complexityTable: 'Time: O(N)\nSpace: O(1)',
                  examples: {
                    python: `def two_loops(arr):\n    for x in arr: print(x)\n    for x in arr: print(x)`,
                    javascript: `function twoLoops(arr) {\n    for (let x of arr) console.log(x);\n    for (let x of arr) console.log(x);\n}`,
                    java: `public void twoLoops(int[] arr) {\n    for (int x : arr) System.out.println(x);\n    for (int x : arr) System.out.println(x);\n}`,
                    cpp: `void twoLoops(vector<int>& arr) {\n    for (int x : arr) cout << x << endl;\n    for (int x : arr) cout << x << endl;\n}`
                  }
                },
        {
                  title: 'Q5: Copying an Array',
                  definition: 'Creating a new array and copying elements over.',
                  analogy: 'Writing a complete copy of a book by hand onto blank pages.',
                  detailedExplanation: '**Time Complexity Process:**\n1. We loop N times to copy each element = O(N) time.\n\n**Space Complexity Process:**\n1. We create a NEW array of size N to hold the copies.\n2. This directly consumes memory proportional to the input size.\n3. Therefore, Space Complexity is O(N).',
                  memoryTip: 'Creating a new array of size N costs O(N) space.',
                  timeComplexity: 'O(N)',
                  spaceComplexity: 'O(N)',
                  complexityTable: 'Time: O(N)\nSpace: O(N)',
                  examples: {
                    python: `def copy_arr(arr):\n    res = []\n    for x in arr:\n        res.append(x)\n    return res`,
                    javascript: `function copyArr(arr) {\n    let res = [];\n    for (let x of arr) res.push(x);\n    return res;\n}`,
                    java: `public int[] copyArr(int[] arr) {\n    int[] res = new int[arr.length];\n    for(int i=0; i<arr.length; i++) res[i] = arr[i];\n    return res;\n}`,
                    cpp: `vector<int> copyArr(vector<int>& arr) {\n    vector<int> res;\n    for(int x : arr) res.push_back(x);\n    return res;\n}`
                  }
                },
        {
                  title: 'Q6: Binary Search',
                  definition: 'Finding an element in a sorted array by halving the range.',
                  analogy: 'Looking up a word in a dictionary by opening it to the middle, then determining which half to search next.',
                  detailedExplanation: '**Time Complexity Process:**\n1. Let array size be N.\n2. After 1 step, size is N/2.\n3. After 2 steps, size is N/4.\n4. After k steps, size is 1. N/(2^k) = 1 => 2^k = N => k = log2(N).\n5. Time is O(log N).\n\n**Space Complexity Process:**\n1. We use a few pointers (`left`, `right`, `mid`), taking O(1) space.',
                  memoryTip: 'Halving the problem space = O(log N) Time.',
                  timeComplexity: 'O(log N)',
                  spaceComplexity: 'O(1)',
                  complexityTable: 'Time: O(log N)\nSpace: O(1)',
                  examples: {
                    python: `def binary_search(arr, target):\n    l, r = 0, len(arr)-1\n    while l <= r:\n        m = (l+r)//2\n        if arr[m] == target: return m\n        elif arr[m] < target: l = m + 1\n        else: r = m - 1\n    return -1`,
                    javascript: `function binarySearch(arr, target) {\n    let l = 0, r = arr.length - 1;\n    while (l <= r) {\n        let m = Math.floor((l+r)/2);\n        if (arr[m] === target) return m;\n        if (arr[m] < target) l = m + 1;\n        else r = m - 1;\n    }\n    return -1;\n}`,
                    java: `public int binarySearch(int[] arr, int target) {\n    int l = 0, r = arr.length - 1;\n    while (l <= r) {\n        int m = l + (r-l)/2;\n        if (arr[m] == target) return m;\n        if (arr[m] < target) l = m + 1;\n        else r = m - 1;\n    }\n    return -1;\n}`,
                    cpp: `int binarySearch(vector<int>& arr, int target) {\n    int l = 0, r = arr.size() - 1;\n    while (l <= r) {\n        int m = l + (r-l)/2;\n        if (arr[m] == target) return m;\n        if (arr[m] < target) l = m + 1;\n        else r = m - 1;\n    }\n    return -1;\n}`
                  }
                },
        {
                  title: 'Q7: Finding Sum of Digits',
                  definition: 'Extracting digits from a number by dividing by 10.',
                  analogy: 'Peeling an onion one layer at a time.',
                  detailedExplanation: '**Time Complexity Process:**\n1. In each iteration, we do `N = N / 10`.\n2. The number of iterations equals the number of digits in N.\n3. The number of digits in N is exactly log10(N).\n4. Therefore, Time Complexity is O(log N).\n\n**Space Complexity Process:**\n1. Only a sum variable is used: O(1) space.',
                  memoryTip: 'Repeatedly dividing a number by 10 takes O(log N) operations.',
                  timeComplexity: 'O(log N)',
                  spaceComplexity: 'O(1)',
                  complexityTable: 'Time: O(log N)\nSpace: O(1)',
                  examples: {
                    python: `def digit_sum(n):\n    s = 0\n    while n > 0:\n        s += n % 10\n        n //= 10\n    return s`,
                    javascript: `function digitSum(n) {\n    let s = 0;\n    while (n > 0) {\n        s += n % 10;\n        n = Math.floor(n / 10);\n    }\n    return s;\n}`,
                    java: `public int digitSum(int n) {\n    int s = 0;\n    while (n > 0) {\n        s += n % 10;\n        n /= 10;\n    }\n    return s;\n}`,
                    cpp: `int digitSum(int n) {\n    int s = 0;\n    while (n > 0) {\n        s += n % 10;\n        n /= 10;\n    }\n    return s;\n}`
                  }
                },
        {
                  title: 'Q8: Loop incrementing by multiple (i *= 2)',
                  definition: 'A loop where the counter doubles each step.',
                  analogy: 'Taking steps that double in size: 1 meter, 2 meters, 4 meters, 8 meters.',
                  detailedExplanation: '**Time Complexity Process:**\n1. Loop counter `i` goes: 1, 2, 4, 8, 16... N.\n2. Let k be the number of steps. i = 2^k.\n3. The loop stops when 2^k >= N.\n4. Solving for k gives k = log2(N).\n5. Total operations = O(log N).\n\n**Space Complexity Process:**\n1. Single variable `i` = O(1) space.',
                  memoryTip: 'Doubling the counter = Halving the remaining distance = O(log N).',
                  timeComplexity: 'O(log N)',
                  spaceComplexity: 'O(1)',
                  complexityTable: 'Time: O(log N)\nSpace: O(1)',
                  examples: {
                    python: `def power_loop(n):\n    i = 1\n    while i < n:\n        print(i)\n        i *= 2`,
                    javascript: `function powerLoop(n) {\n    for (let i=1; i<n; i*=2) {\n        console.log(i);\n    }\n}`,
                    java: `public void powerLoop(int n) {\n    for (int i=1; i<n; i*=2) {\n        System.out.println(i);\n    }\n}`,
                    cpp: `void powerLoop(int n) {\n    for (int i=1; i<n; i*=2) {\n        cout << i << endl;\n    }\n}`
                  }
                },
        {
                  title: 'Q9: Recursive Factorial',
                  definition: 'A function calling itself N times.',
                  analogy: 'Russian nesting dolls. You must open N dolls to reach the center.',
                  detailedExplanation: '**Time Complexity Process:**\n1. The function `fact(N)` calls `fact(N-1)`.\n2. This creates a chain of N recursive calls.\n3. Each call does O(1) math. Total Time = O(N).\n\n**Space Complexity Process:**\n1. VERY IMPORTANT: Every recursive call adds a frame to the System Call Stack.\n2. Since the maximum depth of the recursion tree is N, there will be N frames in memory simultaneously.\n3. Total Space = O(N) due to the Call Stack!',
                  memoryTip: 'Depth of the recursion tree = Space complexity of the Call Stack.',
                  timeComplexity: 'O(N)',
                  spaceComplexity: 'O(N)',
                  complexityTable: 'Time: O(N)\nSpace: O(N) (Call Stack)',
                  examples: {
                    python: `def fact(n):\n    if n <= 1: return 1\n    return n * fact(n-1)`,
                    javascript: `function fact(n) {\n    if (n <= 1) return 1;\n    return n * fact(n-1);\n}`,
                    java: `public int fact(int n) {\n    if (n <= 1) return 1;\n    return n * fact(n-1);\n}`,
                    cpp: `int fact(int n) {\n    if (n <= 1) return 1;\n    return n * fact(n-1);\n}`
                  }
                },
        {
                  title: 'Q10: Basic Fibonacci (Exponential)',
                  definition: 'Function calls itself twice recursively.',
                  analogy: 'A bacteria that splits into two every second. 1 -> 2 -> 4 -> 8.',
                  detailedExplanation: '**Time Complexity Process:**\n1. `fib(N)` calls `fib(N-1)` and `fib(N-2)`.\n2. This creates a binary tree of recursive calls.\n3. The height of the tree is N. Total nodes in a binary tree of height N is 2^N.\n4. Time Complexity is exactly O(2^N).\n\n**Space Complexity Process:**\n1. Space is determined by the MAXIMUM depth of the Call Stack.\n2. The deepest branch goes down N levels.\n3. Therefore, Space Complexity is O(N), NOT O(2^N).',
                  memoryTip: 'Recursive branching: Time = BranchingFactor ^ Depth. Space = Depth.',
                  timeComplexity: 'O(2^N)',
                  spaceComplexity: 'O(N)',
                  complexityTable: 'Time: O(2^N)\nSpace: O(N)',
                  examples: {
                    python: `def fib(n):\n    if n <= 1: return n\n    return fib(n-1) + fib(n-2)`,
                    javascript: `function fib(n) {\n    if (n <= 1) return n;\n    return fib(n-1) + fib(n-2);\n}`,
                    java: `public int fib(int n) {\n    if (n <= 1) return n;\n    return fib(n-1) + fib(n-2);\n}`,
                    cpp: `int fib(int n) {\n    if (n <= 1) return n;\n    return fib(n-1) + fib(n-2);\n}`
                  }
                }
      ]
    },
    {
      title: 'Level 2: Logarithmic & Binary Search (O(log N))',
      definition: 'Algorithms that cut the search space in half each step.',
      category: 6,
      subTopics: [
        {
                  title: 'Q11: Binary Tree Inorder Traversal',
                  definition: 'Visiting every node in a Binary Tree.',
                  analogy: 'A mailman visiting every single house in a neighborhood exactly once.',
                  detailedExplanation: '**Time Complexity Process:**\n1. The algorithm visits every node exactly once.\n2. If there are N nodes, the time is O(N).\n\n**Space Complexity Process:**\n1. Space depends on the height of the tree (H) due to the recursive Call Stack.\n2. Worst case (a completely skewed tree/linked list): O(N) space.\n3. Average/Best case (a perfectly balanced tree): O(log N) space.',
                  memoryTip: 'Tree Traversals take O(N) Time and O(Height) Space.',
                  timeComplexity: 'O(N)',
                  spaceComplexity: 'O(H) (Worst: O(N), Best: O(log N))',
                  complexityTable: 'Time: O(N)\nSpace: O(H)',
                  examples: {
                    python: `def inorder(root):\n    if not root: return\n    inorder(root.left)\n    print(root.val)\n    inorder(root.right)`,
                    javascript: `function inorder(root) {\n    if (!root) return;\n    inorder(root.left);\n    console.log(root.val);\n    inorder(root.right);\n}`,
                    java: `public void inorder(TreeNode root) {\n    if (root == null) return;\n    inorder(root.left);\n    System.out.println(root.val);\n    inorder(root.right);\n}`,
                    cpp: `void inorder(TreeNode* root) {\n    if (!root) return;\n    inorder(root->left);\n    cout << root->val << endl;\n    inorder(root->right);\n}`
                  }
                },
        {
                  title: 'Q12: String Concatenation in a Loop',
                  definition: 'Adding characters to a string in a loop.',
                  analogy: 'Building a brick wall, but every time you add a brick, you have to tear the whole wall down and rebuild it with the new brick included.',
                  detailedExplanation: '**Time Complexity Process:**\n1. In languages with IMMUTABLE strings (Java, Python, C#), doing `str += "a"` creates a completely NEW string.\n2. It has to copy the old string (size 1) + new char.\n3. Next iteration: copies size 2 + new char.\n4. Total operations = 1 + 2 + 3 + ... + N = O(N²).\n\n**Space Complexity Process:**\n1. A new string is created every time, leading to O(N²) memory allocation churn (though garbage collected, peak memory can be O(N)).',
                  memoryTip: 'String concatenation in a loop is O(N²) in Java/Python. Always use StringBuilder / join()!',
                  timeComplexity: 'O(N²) (in Java/Python)',
                  spaceComplexity: 'O(N)',
                  complexityTable: 'Time: O(N²) (Immutable Strings)\nSpace: O(N)',
                  examples: {
                    python: `def bad_concat(n):\n    s = ""\n    for i in range(n):\n        s += "a"  # Slow!\n    return s`,
                    javascript: `function badConcat(n) {\n    let s = "";\n    for(let i=0; i<n; i++) {\n        s += "a"; // JS engines heavily optimize this, but conceptually it's O(N^2)\n    }\n    return s;\n}`,
                    java: `public String badConcat(int n) {\n    String s = "";\n    for(int i=0; i<n; i++) {\n        s += "a"; // O(N^2) in Java!\n    }\n    return s;\n}`,
                    cpp: `string badConcat(int n) {\n    string s = "";\n    for(int i=0; i<n; i++) {\n        s += "a"; // C++ strings are mutable, so this is amortized O(N)!\n    }\n    return s;\n}`
                  }
                },
        {
                  title: 'Q13: Traversing an N x M Matrix',
                  definition: 'Nested loops over a 2D grid.',
                  analogy: 'Mowing a rectangular lawn. You must walk across the entire width, then move down and do it again.',
                  detailedExplanation: '**Time Complexity Process:**\n1. Outer loop runs N times (Rows).\n2. Inner loop runs M times (Cols).\n3. Total cells visited = N * M.\n4. Time Complexity = O(N * M).\n\n**Space Complexity Process:**\n1. Only loop variables used. Space = O(1).',
                  memoryTip: 'Grid traversals are O(N * M), not O(N²), unless N and M are exactly the same size!',
                  timeComplexity: 'O(N * M)',
                  spaceComplexity: 'O(1)',
                  complexityTable: 'Time: O(N * M)\nSpace: O(1)',
                  examples: {
                    python: `def traverse_grid(grid):\n    for r in range(len(grid)):\n        for c in range(len(grid[0])):\n            print(grid[r][c])`,
                    javascript: `function traverseGrid(grid) {\n    for (let r=0; r<grid.length; r++) {\n        for (let c=0; c<grid[0].length; c++) {\n            console.log(grid[r][c]);\n        }\n    }\n}`,
                    java: `public void traverseGrid(int[][] grid) {\n    for (int r=0; r<grid.length; r++) {\n        for (int c=0; c<grid[0].length; c++) {\n            System.out.println(grid[r][c]);\n        }\n    }\n}`,
                    cpp: `void traverseGrid(vector<vector<int>>& grid) {\n    for (int r=0; r<grid.size(); r++) {\n        for (int c=0; c<grid[0].size(); c++) {\n            cout << grid[r][c] << endl;\n        }\n    }\n}`
                  }
                },
        {
                  title: 'Q14: Two Pointers (Left and Right)',
                  definition: 'Pointers moving towards the center.',
                  analogy: 'Two people starting at opposite ends of a long hallway and walking towards each other until they high-five in the middle.',
                  detailedExplanation: '**Time Complexity Process:**\n1. `left` pointer starts at 0, `right` starts at N-1.\n2. In every step of the loop, EITHER left moves right OR right moves left.\n3. The distance between them decreases by exactly 1 every step.\n4. They meet after exactly N steps.\n5. Time Complexity = O(N).\n\n**Space Complexity Process:**\n1. Two integer pointers used = O(1) space.',
                  memoryTip: 'While (left < right) loops process the array exactly once: O(N) time.',
                  timeComplexity: 'O(N)',
                  spaceComplexity: 'O(1)',
                  complexityTable: 'Time: O(N)\nSpace: O(1)',
                  examples: {
                    python: `def reverse_arr(arr):\n    l, r = 0, len(arr)-1\n    while l < r:\n        arr[l], arr[r] = arr[r], arr[l]\n        l += 1\n        r -= 1`,
                    javascript: `function reverseArr(arr) {\n    let l = 0, r = arr.length - 1;\n    while (l < r) {\n        [arr[l], arr[r]] = [arr[r], arr[l]];\n        l++; r--;\n    }\n}`,
                    java: `public void reverseArr(int[] arr) {\n    int l = 0, r = arr.length - 1;\n    while (l < r) {\n        int t = arr[l]; arr[l] = arr[r]; arr[r] = t;\n        l++; r--;\n    }\n}`,
                    cpp: `void reverseArr(vector<int>& arr) {\n    int l = 0, r = arr.size() - 1;\n    while (l < r) {\n        swap(arr[l], arr[r]);\n        l++; r--;\n    }\n}`
                  }
                },
        {
                  title: 'Q15: Slicing an Array inside a Loop',
                  definition: 'Creating a subarray repeatedly.',
                  analogy: 'Buying a whole pizza, throwing away one slice, buying a completely new slightly smaller pizza, and repeating.',
                  detailedExplanation: '**Time Complexity Process:**\n1. The loop runs N times.\n2. Inside the loop, `arr[1:]` (Python slice) creates a completely NEW array of size N-1, then N-2, etc.\n3. Copying an array takes O(K) time where K is the size.\n4. Total time = N + (N-1) + (N-2) ... = O(N²).\n\n**Space Complexity Process:**\n1. Each slice allocates O(N) memory. If not garbage collected immediately, peak memory could be O(N²).',
                  memoryTip: 'Slicing an array is NOT an O(1) operation. It is O(K) where K is the slice size!',
                  timeComplexity: 'O(N²)',
                  spaceComplexity: 'O(N)',
                  complexityTable: 'Time: O(N²)\nSpace: O(N)',
                  examples: {
                    python: `def bad_slice(arr):\n    while len(arr) > 0:\n        print(arr[0])\n        arr = arr[1:] # O(N) operation hidden here!`,
                    javascript: `function badSlice(arr) {\n    while(arr.length > 0) {\n        console.log(arr[0]);\n        arr = arr.slice(1); // O(N) hidden!\n    }\n}`,
                    java: `public void badSlice(int[] arr) {\n    // Arrays.copyOfRange is explicitly an O(N) operation.\n}`,
                    cpp: `void badSlice(vector<int> arr) {\n    // Creating sub-vectors in a loop is O(N^2) total.\n}`
                  }
                },
        {
                  title: 'Q16: Hash Map Lookups',
                  definition: 'Using a Dictionary/Hash Map inside a loop.',
                  analogy: 'Using the index at the back of a textbook to instantly jump to the right page.',
                  detailedExplanation: '**Time Complexity Process:**\n1. Loop runs N times.\n2. Inside the loop, looking up a key in a Hash Map `map[key]` takes O(1) AVERAGE time.\n3. Total time = N * O(1) = O(N).\n\n**Wait, what about the Worst Case?**\nIf the Hash Map suffers from heavy "collisions", lookup can degrade to O(N), making the total loop O(N²). However, in interviews, we almost always assume O(1) average time for Hash Maps.',
                  memoryTip: 'Hash Map lookups are assumed to be O(1) Time.',
                  timeComplexity: 'O(N)',
                  spaceComplexity: 'O(N)',
                  complexityTable: 'Time: O(N) Avg, O(N²) Worst\nSpace: O(N)',
                  examples: {
                    python: `def two_sum(arr, target):\n    seen = {}\n    for i, num in enumerate(arr):\n        if target - num in seen:\n            return [seen[target - num], i]\n        seen[num] = i`,
                    javascript: `function twoSum(arr, target) {\n    let seen = new Map();\n    for (let i=0; i<arr.length; i++) {\n        if (seen.has(target - arr[i])) return [seen.get(target - arr[i]), i];\n        seen.set(arr[i], i);\n    }\n}`,
                    java: `public int[] twoSum(int[] arr, int target) {\n    Map<Integer, Integer> seen = new HashMap<>();\n    for (int i=0; i<arr.length; i++) {\n        if (seen.containsKey(target - arr[i])) return new int[]{seen.get(target - arr[i]), i};\n        seen.put(arr[i], i);\n    }\n    return null;\n}`,
                    cpp: `vector<int> twoSum(vector<int>& arr, int target) {\n    unordered_map<int, int> seen;\n    for (int i=0; i<arr.size(); i++) {\n        if (seen.count(target - arr[i])) return {seen[target - arr[i]], i};\n        seen[arr[i]] = i;\n    }\n    return {};\n}`
                  }
                },
        {
                  title: 'Q17: Sorting + Binary Search',
                  definition: 'Sorting the array first, then doing binary search M times.',
                  analogy: 'Alphabetizing your entire library before looking up 5 specific books.',
                  detailedExplanation: '**Time Complexity Process:**\n1. Sorting an array of size N takes O(N log N) time.\n2. A single Binary Search takes O(log N) time.\n3. Doing M binary searches takes O(M log N) time.\n4. Total Time = O(N log N + M log N) = O((N + M) log N).\n\n**Space Complexity Process:**\n1. Sorting usually requires O(N) space (Merge Sort) or O(log N) (Quick Sort stack).',
                  memoryTip: 'Sorting completely dominates the time complexity if M is small!',
                  timeComplexity: 'O((N + M) log N)',
                  spaceComplexity: 'O(log N) to O(N)',
                  complexityTable: 'Time: O((N+M) log N)\nSpace: O(log N) to O(N)',
                  examples: {
                    python: `def sort_and_search(arr, queries):\n    arr.sort() # O(N log N)\n    for q in queries: # M times\n        binary_search(arr, q) # O(log N)`,
                    javascript: `function sortAndSearch(arr, queries) {\n    arr.sort((a,b) => a-b); // O(N log N)\n    for (let q of queries) {\n        binarySearch(arr, q); // O(log N)\n    }\n}`,
                    java: `public void sortAndSearch(int[] arr, int[] queries) {\n    Arrays.sort(arr); // O(N log N)\n    for (int q : queries) {\n        binarySearch(arr, q);\n    }\n}`,
                    cpp: `void sortAndSearch(vector<int>& arr, vector<int>& queries) {\n    sort(arr.begin(), arr.end()); // O(N log N)\n    for (int q : queries) {\n        binarySearch(arr, q);\n    }\n}`
                  }
                },
        {
                  title: 'Q18: Sequential Loops over Different Arrays',
                  definition: 'Looping through array A, then array B.',
                  analogy: 'Reading Book A completely, and then reading Book B completely.',
                  detailedExplanation: '**Time Complexity Process:**\n1. The first loop runs N times (length of A).\n2. The second loop runs M times (length of B).\n3. They are sequential, so we add them: O(N) + O(M).\n4. Since N and M are independent, we cannot simplify to O(N). The final answer is O(N + M).\n\n**Space Complexity Process:**\n1. O(1) extra space used.',
                  memoryTip: 'Sequential over different inputs = Addition O(N + M).',
                  timeComplexity: 'O(N + M)',
                  spaceComplexity: 'O(1)',
                  complexityTable: 'Time: O(N + M)\nSpace: O(1)',
                  examples: {
                    python: `def process_two(A, B):\n    for x in A: print(x)\n    for y in B: print(y)`,
                    javascript: `function processTwo(A, B) {\n    for (let x of A) console.log(x);\n    for (let y of B) console.log(y);\n}`,
                    java: `public void processTwo(int[] A, int[] B) {\n    for(int x: A) System.out.println(x);\n    for(int y: B) System.out.println(y);\n}`,
                    cpp: `void processTwo(vector<int>& A, vector<int>& B) {\n    for(int x: A) cout << x;\n    for(int y: B) cout << y;\n}`
                  }
                },
        {
                  title: 'Q19: Loop with Early Exit (Break)',
                  definition: 'A loop that stops searching once it finds the target.',
                  analogy: 'Looking for your keys in the house. Once you find them, you stop searching.',
                  detailedExplanation: '**Time Complexity Process:**\n1. In the BEST case, the target is at index 0. O(1) time.\n2. In the WORST case, the target is not in the array, so we check all N items. O(N) time.\n3. In Big-O notation, we always report the WORST-CASE scenario unless asked otherwise.\n\n**Space Complexity Process:**\n1. O(1) space.',
                  memoryTip: 'Big-O is about the worst-case scenario. Early exits do not change Big-O.',
                  timeComplexity: 'O(N)',
                  spaceComplexity: 'O(1)',
                  complexityTable: 'Time: O(N) Worst\nSpace: O(1)',
                  examples: {
                    python: `def contains(arr, t):\n    for x in arr:\n        if x == t: return True\n    return False`,
                    javascript: `function contains(arr, t) {\n    for (let x of arr) {\n        if (x === t) return true;\n    }\n    return false;\n}`,
                    java: `public boolean contains(int[] arr, int t) {\n    for(int x: arr) {\n        if (x == t) return true;\n    }\n    return false;\n}`,
                    cpp: `bool contains(vector<int>& arr, int t) {\n    for(int x: arr) {\n        if (x == t) return true;\n    }\n    return false;\n}`
                  }
                },
        {
                  title: 'Q20: Nested Loop with Constant Inner Bounds',
                  definition: 'An inner loop that always runs exactly K times, where K is a constant.',
                  analogy: 'For every person in a room (N), you shake their hand exactly 3 times.',
                  detailedExplanation: '**Time Complexity Process:**\n1. Outer loop runs N times.\n2. Inner loop runs exactly 5 times (constant).\n3. Total operations = 5 * N.\n4. We drop constants in Big-O, so O(5N) simplifies to O(N).',
                  memoryTip: 'A nested loop only causes O(N²) if both bounds scale with the input.',
                  timeComplexity: 'O(N)',
                  spaceComplexity: 'O(1)',
                  complexityTable: 'Time: O(N)\nSpace: O(1)',
                  examples: {
                    python: `def constant_inner(arr):\n    for x in arr:\n        for i in range(5):\n            print(x)`,
                    javascript: `function constantInner(arr) {\n    for (let x of arr) {\n        for(let i=0; i<5; i++) console.log(x);\n    }\n}`,
                    java: `public void constantInner(int[] arr) {\n    for(int x: arr) {\n        for(int i=0; i<5; i++) System.out.println(x);\n    }\n}`,
                    cpp: `void constantInner(vector<int>& arr) {\n    for(int x: arr) {\n        for(int i=0; i<5; i++) cout << x;\n    }\n}`
                  }
                }
      ]
    },
    {
      title: 'Level 3: Recursion, Trees & Sorting',
      definition: 'Understanding the Call Stack, Branching factors, and divide-and-conquer.',
      category: 6,
      subTopics: [
        {
                  title: 'Q21: Traversing Backwards',
                  definition: 'Looping from N-1 down to 0.',
                  analogy: 'Reading a book from the last page to the first.',
                  detailedExplanation: '**Time Complexity Process:**\n1. The direction of the loop does not matter.\n2. We still visit exactly N elements exactly 1 time.\n3. Time Complexity = O(N).',
                  memoryTip: 'Forward or backward, visiting every element is O(N).',
                  timeComplexity: 'O(N)',
                  spaceComplexity: 'O(1)',
                  complexityTable: 'Time: O(N)\nSpace: O(1)',
                  examples: {
                    python: `def reverse_print(arr):\n    for i in range(len(arr)-1, -1, -1):\n        print(arr[i])`,
                    javascript: `function reversePrint(arr) {\n    for (let i = arr.length-1; i >= 0; i--) {\n        console.log(arr[i]);\n    }\n}`,
                    java: `public void reversePrint(int[] arr) {\n    for (int i = arr.length-1; i >= 0; i--) {\n        System.out.println(arr[i]);\n    }\n}`,
                    cpp: `void reversePrint(vector<int>& arr) {\n    for (int i = arr.size()-1; i >= 0; i--) {\n        cout << arr[i];\n    }\n}`
                  }
                },
        {
                  title: 'Q22: Max and Min in One Pass',
                  definition: 'Finding two properties in a single loop.',
                  analogy: 'Walking down a line of people and asking both their height and age at the same time.',
                  detailedExplanation: '**Time Complexity Process:**\n1. We loop N times.\n2. In each iteration, we do TWO constant O(1) checks (is it > max? is it < min?).\n3. Total time = 2 * N. Dropping the constant gives O(N).',
                  memoryTip: 'Doing multiple O(1) things inside a loop is still just O(N).',
                  timeComplexity: 'O(N)',
                  spaceComplexity: 'O(1)',
                  complexityTable: 'Time: O(N)\nSpace: O(1)',
                  examples: {
                    python: `def min_max(arr):\n    mi, ma = arr[0], arr[0]\n    for x in arr:\n        mi = min(mi, x)\n        ma = max(ma, x)\n    return mi, ma`,
                    javascript: `function minMax(arr) {\n    let mi = arr[0], ma = arr[0];\n    for (let x of arr) {\n        if (x < mi) mi = x;\n        if (x > ma) ma = x;\n    }\n    return [mi, ma];\n}`,
                    java: `public int[] minMax(int[] arr) {\n    int mi = arr[0], ma = arr[0];\n    for (int x : arr) {\n        mi = Math.min(mi, x);\n        ma = Math.max(ma, x);\n    }\n    return new int[]{mi, ma};\n}`,
                    cpp: `vector<int> minMax(vector<int>& arr) {\n    int mi = arr[0], ma = arr[0];\n    for (int x : arr) {\n        mi = min(mi, x);\n        ma = max(ma, x);\n    }\n    return {mi, ma};\n}`
                  }
                },
        {
                  title: 'Q23: Binary Search on a 2D Matrix',
                  definition: 'Treating a sorted N x M matrix as a flattened 1D array.',
                  analogy: 'Finding a specific seat in a massive movie theater where all seats are numbered sequentially.',
                  detailedExplanation: '**Time Complexity Process:**\n1. Total elements in the grid = N * M.\n2. We do standard Binary Search on this total space.\n3. Binary Search halves the space each time, so time is O(log(Total Elements)).\n4. Therefore, Time = O(log(N * M)).\n*(Note: By logarithm rules, log(N*M) = log(N) + log(M))*',
                  memoryTip: 'Binary search on a matrix is O(log(N*M)).',
                  timeComplexity: 'O(log(N*M))',
                  spaceComplexity: 'O(1)',
                  complexityTable: 'Time: O(log(N*M))\nSpace: O(1)',
                  examples: {
                    python: `def search_matrix(mat, target):\n    R, C = len(mat), len(mat[0])\n    l, r = 0, R*C - 1\n    while l <= r:\n        m = (l+r)//2\n        val = mat[m // C][m % C]\n        if val == target: return True\n        elif val < target: l = m + 1\n        else: r = m - 1\n    return False`,
                    javascript: `function searchMatrix(mat, target) {\n    let R = mat.length, C = mat[0].length;\n    let l = 0, r = R*C - 1;\n    while(l <= r) {\n        let m = Math.floor((l+r)/2);\n        let val = mat[Math.floor(m/C)][m%C];\n        if (val === target) return true;\n        if (val < target) l = m+1; else r = m-1;\n    }\n    return false;\n}`,
                    java: `public boolean searchMatrix(int[][] mat, int target) {\n    int R = mat.length, C = mat[0].length;\n    int l = 0, r = R*C - 1;\n    while(l <= r) {\n        int m = l + (r-l)/2;\n        int val = mat[m/C][m%C];\n        if (val == target) return true;\n        if (val < target) l = m+1; else r = m-1;\n    }\n    return false;\n}`,
                    cpp: `bool searchMatrix(vector<vector<int>>& mat, int target) {\n    int R = mat.size(), C = mat[0].size();\n    int l = 0, r = R*C - 1;\n    while(l <= r) {\n        int m = l + (r-l)/2;\n        int val = mat[m/C][m%C];\n        if (val == target) return true;\n        if (val < target) l = m+1; else r = m-1;\n    }\n    return false;\n}`
                  }
                },
        {
                  title: 'Q24: Finding Square Root (Binary Search)',
                  definition: 'Finding the integer square root by binary searching answers from 1 to N.',
                  analogy: 'Guessing a number between 1 and N. If the square is too big, guess lower.',
                  detailedExplanation: '**Time Complexity Process:**\n1. The search space is from `1` to `N`.\n2. In each step, we pick the middle number `m` and check if `m * m == N`.\n3. We halve the search space each time.\n4. Therefore, time complexity is exactly O(log N).',
                  memoryTip: 'Searching a range of numbers 1 to N takes O(log N).',
                  timeComplexity: 'O(log N)',
                  spaceComplexity: 'O(1)',
                  complexityTable: 'Time: O(log N)\nSpace: O(1)',
                  examples: {
                    python: `def my_sqrt(x):\n    l, r = 1, x\n    res = 0\n    while l <= r:\n        m = (l+r)//2\n        if m*m <= x:\n            res = m\n            l = m + 1\n        else: r = m - 1\n    return res`,
                    javascript: `function mySqrt(x) {\n    let l=1, r=x, res=0;\n    while(l<=r) {\n        let m = Math.floor((l+r)/2);\n        if(m*m <= x) { res=m; l=m+1; } else { r=m-1; }\n    }\n    return res;\n}`,
                    java: `public int mySqrt(int x) {\n    long l=1, r=x, res=0;\n    while(l<=r) {\n        long m = l+(r-l)/2;\n        if(m*m <= x) { res=m; l=m+1; } else { r=m-1; }\n    }\n    return (int)res;\n}`,
                    cpp: `int mySqrt(int x) {\n    long long l=1, r=x, res=0;\n    while(l<=r) {\n        long long m = l+(r-l)/2;\n        if(m*m <= x) { res=m; l=m+1; } else { r=m-1; }\n    }\n    return res;\n}`
                  }
                },
        {
                  title: 'Q25: Loop Dividing by 2',
                  definition: 'A loop that starts at N and cuts in half down to 0.',
                  analogy: 'Cutting a piece of paper in half repeatedly until you cannot cut it anymore.',
                  detailedExplanation: '**Time Complexity Process:**\n1. `i` starts at N: N, N/2, N/4, N/8... 1.\n2. Just like doubling up to N, halving down from N takes log2(N) steps.\n3. Time Complexity = O(log N).',
                  memoryTip: 'Any loop that divides the counter by a constant > 1 is O(log N).',
                  timeComplexity: 'O(log N)',
                  spaceComplexity: 'O(1)',
                  complexityTable: 'Time: O(log N)\nSpace: O(1)',
                  examples: {
                    python: `def divide_loop(n):\n    while n > 0:\n        print(n)\n        n //= 2`,
                    javascript: `function divideLoop(n) {\n    while (n > 0) {\n        console.log(n);\n        n = Math.floor(n / 2);\n    }\n}`,
                    java: `public void divideLoop(int n) {\n    while (n > 0) {\n        System.out.println(n);\n        n /= 2;\n    }\n}`,
                    cpp: `void divideLoop(int n) {\n    while (n > 0) {\n        cout << n << endl;\n        n /= 2;\n    }\n}`
                  }
                },
        {
                  title: 'Q26: Loop Multiplying by 3',
                  definition: 'A loop where the counter triples each step.',
                  analogy: 'A rumor that starts with 1 person, who tells 3 people, who tell 9 people, etc.',
                  detailedExplanation: '**Time Complexity Process:**\n1. Counter sequence: 1, 3, 9, 27... N.\n2. This takes log3(N) steps.\n3. In Big-O, we ignore the base of the logarithm because all logs are proportional by a constant factor.\n4. So O(log3 N) is written simply as O(log N).',
                  memoryTip: 'All logarithmic bases reduce to O(log N).',
                  timeComplexity: 'O(log N)',
                  spaceComplexity: 'O(1)',
                  complexityTable: 'Time: O(log N)\nSpace: O(1)',
                  examples: {
                    python: `def triple_loop(n):\n    i = 1\n    while i < n:\n        print(i)\n        i *= 3`,
                    javascript: `function tripleLoop(n) {\n    for(let i=1; i<n; i*=3) console.log(i);\n}`,
                    java: `public void tripleLoop(int n) {\n    for(int i=1; i<n; i*=3) System.out.println(i);\n}`,
                    cpp: `void tripleLoop(int n) {\n    for(int i=1; i<n; i*=3) cout << i << endl;\n}`
                  }
                },
        {
                  title: 'Q27: Traversing a Binary Search Tree (BST)',
                  definition: 'Searching for a value in a balanced BST.',
                  analogy: 'Walking through a maze where at every fork, a sign tells you exactly which path to take, so you never go down the wrong path.',
                  detailedExplanation: '**Time Complexity Process:**\n1. At each node, you only go Left OR Right. You never search the other half.\n2. In a BALANCED tree, this halves the remaining nodes every step.\n3. Height of a balanced tree is log2(N).\n4. Time = O(log N).\n*(Note: If the tree is completely skewed like a linked list, Time = O(N). We assume balanced unless stated otherwise)*',
                  memoryTip: 'BST Search is O(log N) average, O(N) worst case.',
                  timeComplexity: 'O(log N)',
                  spaceComplexity: 'O(1)',
                  complexityTable: 'Time: O(log N) Avg, O(N) Worst\nSpace: O(1)',
                  examples: {
                    python: `def search_bst(root, target):\n    curr = root\n    while curr:\n        if curr.val == target: return True\n        elif curr.val < target: curr = curr.right\n        else: curr = curr.left\n    return False`,
                    javascript: `function searchBST(root, target) {\n    let curr = root;\n    while(curr) {\n        if(curr.val === target) return true;\n        if(curr.val < target) curr = curr.right; else curr = curr.left;\n    }\n    return false;\n}`,
                    java: `public boolean searchBST(TreeNode root, int target) {\n    TreeNode curr = root;\n    while(curr != null) {\n        if(curr.val == target) return true;\n        if(curr.val < target) curr = curr.right; else curr = curr.left;\n    }\n    return false;\n}`,
                    cpp: `bool searchBST(TreeNode* root, int target) {\n    TreeNode* curr = root;\n    while(curr) {\n        if(curr->val == target) return true;\n        if(curr->val < target) curr = curr->right; else curr = curr->left;\n    }\n    return false;\n}`
                  }
                },
        {
                  title: 'Q28: Triple Recursion (O(3^N))',
                  definition: 'A function that calls itself three times per frame.',
                  analogy: 'A rumor where every person tells exactly three new people.',
                  detailedExplanation: '**Time Complexity Process:**\n1. At level 0: 1 call.\n2. At level 1: 3 calls.\n3. At level 2: 9 calls.\n4. This forms a tree with a branching factor of 3.\n5. Total calls = O(3^N).\n\n**Space Complexity Process:**\n1. The maximum depth of the call stack is still N. Space = O(N).',
                  memoryTip: 'Branching Factor ^ Depth = Time Complexity.',
                  timeComplexity: 'O(3^N)',
                  spaceComplexity: 'O(N)',
                  complexityTable: 'Time: O(3^N)\nSpace: O(N)',
                  examples: {
                    python: `def f(n):\n    if n <= 0: return 1\n    return f(n-1) + f(n-1) + f(n-1)`,
                    javascript: `function f(n) {\n    if(n <= 0) return 1;\n    return f(n-1) + f(n-1) + f(n-1);\n}`,
                    java: `public int f(int n) {\n    if(n <= 0) return 1;\n    return f(n-1) + f(n-1) + f(n-1);\n}`,
                    cpp: `int f(int n) {\n    if(n <= 0) return 1;\n    return f(n-1) + f(n-1) + f(n-1);\n}`
                  }
                },
        {
                  title: 'Q29: Recursive Binary Search',
                  definition: 'Binary Search implemented via recursion instead of a while loop.',
                  analogy: 'Looking for a word in a dictionary, but asking a friend to look in the remaining half.',
                  detailedExplanation: '**Time Complexity Process:**\n1. The search space halves each time: O(log N) Time.\n\n**Space Complexity Process:**\n1. The recursion goes log N levels deep.\n2. Each level takes O(1) space on the Call Stack.\n3. Total Space = O(log N). (Note: Iterative Binary Search is O(1) space).',
                  memoryTip: 'Recursive functions ALWAYS cost Space = O(Maximum Depth).',
                  timeComplexity: 'O(log N)',
                  spaceComplexity: 'O(log N)',
                  complexityTable: 'Time: O(log N)\nSpace: O(log N) (Call Stack)',
                  examples: {
                    python: `def bs_rec(arr, t, l, r):\n    if l > r: return -1\n    m = (l+r)//2\n    if arr[m] == t: return m\n    if arr[m] < t: return bs_rec(arr, t, m+1, r)\n    return bs_rec(arr, t, l, m-1)`,
                    javascript: `function bsRec(arr, t, l, r) {\n    if (l > r) return -1;\n    let m = Math.floor((l+r)/2);\n    if (arr[m] === t) return m;\n    if (arr[m] < t) return bsRec(arr, t, m+1, r);\n    return bsRec(arr, t, l, m-1);\n}`,
                    java: `public int bsRec(int[] arr, int t, int l, int r) {\n    if(l > r) return -1;\n    int m = l + (r-l)/2;\n    if(arr[m] == t) return m;\n    if(arr[m] < t) return bsRec(arr, t, m+1, r);\n    return bsRec(arr, t, l, m-1);\n}`,
                    cpp: `int bsRec(vector<int>& arr, int t, int l, int r) {\n    if(l > r) return -1;\n    int m = l + (r-l)/2;\n    if(arr[m] == t) return m;\n    if(arr[m] < t) return bsRec(arr, t, m+1, r);\n    return bsRec(arr, t, l, m-1);\n}`
                  }
                },
        {
                  title: 'Q30: Merge Sort Tree',
                  definition: 'Splitting an array in half recursively, then merging.',
                  analogy: 'Dividing a massive deck of cards into single cards, then repeatedly combining them into sorted piles.',
                  detailedExplanation: '**Time Complexity Process:**\n1. The tree has log2(N) levels (splitting in half).\n2. At each level, merging the arrays takes O(N) total time across all nodes.\n3. N work per level * log N levels = O(N log N).\n\n**Space Complexity Process:**\n1. Merging requires creating temporary arrays to hold the sorted elements.\n2. Total extra space needed is O(N).',
                  memoryTip: 'Merge Sort is consistently O(N log N) Time and O(N) Space.',
                  timeComplexity: 'O(N log N)',
                  spaceComplexity: 'O(N)',
                  complexityTable: 'Time: O(N log N)\nSpace: O(N)',
                  examples: {
                    python: `def merge_sort(arr):\n    if len(arr) > 1:\n        mid = len(arr)//2\n        L = arr[:mid]\n        R = arr[mid:]\n        merge_sort(L)\n        merge_sort(R)\n        # merging logic omitted for brevity...`,
                    javascript: `function mergeSort(arr) {\n    if(arr.length <= 1) return arr;\n    let mid = Math.floor(arr.length/2);\n    let L = mergeSort(arr.slice(0, mid));\n    let R = mergeSort(arr.slice(mid));\n    // merging...\n}`,
                    java: `// standard java merge sort using temporary arrays...`,
                    cpp: `// standard cpp merge sort using temporary vectors...`
                  }
                }
      ]
    },
    {
      title: 'Level 4: Strings, Matrices & Two Pointers',
      definition: 'Complexities involving multiple variables and dimensions.',
      category: 6,
      subTopics: [
        {
                  title: 'Q31: Quick Sort (Worst vs Average)',
                  definition: 'Choosing a pivot and partitioning elements around it.',
                  analogy: 'Picking a random height, putting everyone shorter on the left, taller on the right, and repeating.',
                  detailedExplanation: '**Time Complexity Process:**\n1. Average case: The pivot roughly halves the array. Depth is log N. Work per level is N. Time = O(N log N).\n2. Worst case: Array is already sorted, and we pick the first element. It creates partitions of size 0 and N-1. Depth becomes N. Time = O(N²).\n\n**Space Complexity Process:**\n1. Sorting happens in-place, but the recursive Call Stack takes O(log N) space on average (O(N) worst case).',
                  memoryTip: 'Quick Sort is mostly O(N log N), but can degrade to O(N²) if you have a bad pivot strategy.',
                  timeComplexity: 'O(N log N) Avg, O(N²) Worst',
                  spaceComplexity: 'O(log N)',
                  complexityTable: 'Time: O(N log N) Avg\nSpace: O(log N)',
                  examples: {
                    python: `def quick_sort(arr):\n    if len(arr) <= 1: return arr\n    pivot = arr[len(arr)//2]\n    left = [x for x in arr if x < pivot]\n    mid = [x for x in arr if x == pivot]\n    right = [x for x in arr if x > pivot]\n    return quick_sort(left) + mid + quick_sort(right)`,
                    javascript: `// In-place Quick Sort algorithm...`,
                    java: `// standard Arrays.sort() for primitives uses Dual-Pivot Quicksort...`,
                    cpp: `// standard std::sort() uses Introsort (Quick Sort + Heap Sort)...`
                  }
                },
        {
                  title: 'Q32: Sliding Window (Fixed Size)',
                  definition: 'Moving a window of size K across an array.',
                  analogy: 'Looking through a small magnifying glass and sliding it across a page, one letter at a time.',
                  detailedExplanation: '**Time Complexity Process:**\n1. First, we compute the sum of the first K elements. (O(K) time).\n2. Then we slide the window from K to N.\n3. Each slide involves exactly two O(1) operations: subtract the element leaving the window, and add the element entering the window.\n4. We do this N-K times. Total Time = O(K) + O(N-K) = O(N).\n\n**Space Complexity Process:**\n1. O(1) space because we only store a few sum variables.',
                  memoryTip: 'Sliding window turns an O(N*K) brute force into an O(N) optimized pass.',
                  timeComplexity: 'O(N)',
                  spaceComplexity: 'O(1)',
                  complexityTable: 'Time: O(N)\nSpace: O(1)',
                  examples: {
                    python: `def max_sum(arr, k):\n    window_sum = sum(arr[:k])\n    max_s = window_sum\n    for i in range(k, len(arr)):\n        window_sum += arr[i] - arr[i-k]\n        max_s = max(max_s, window_sum)\n    return max_s`,
                    javascript: `// Slide the window by adding the new element and subtracting the old element.`,
                    java: `// Slide the window by adding the new element and subtracting the old element.`,
                    cpp: `// Slide the window by adding the new element and subtracting the old element.`
                  }
                },
        {
                  title: 'Q33: Matrix Transposition',
                  definition: 'Flipping an N x N matrix over its diagonal.',
                  analogy: 'Folding a square piece of paper perfectly diagonally.',
                  detailedExplanation: '**Time Complexity Process:**\n1. We loop over the rows `r` from 0 to N.\n2. We loop over the columns `c` from `r` to N (only half the matrix!).\n3. Total cells visited = N(N+1)/2. \n4. Time Complexity = O(N²).\n\n**Space Complexity Process:**\n1. Since we do `swap(mat[r][c], mat[c][r])`, we do it IN-PLACE.\n2. Space Complexity = O(1).',
                  memoryTip: 'In-place Matrix operations on N x N take O(N²) Time and O(1) Space.',
                  timeComplexity: 'O(N²)',
                  spaceComplexity: 'O(1)',
                  complexityTable: 'Time: O(N²)\nSpace: O(1)',
                  examples: {
                    python: `def transpose(mat):\n    N = len(mat)\n    for r in range(N):\n        for c in range(r, N):\n            mat[r][c], mat[c][r] = mat[c][r], mat[r][c]`,
                    javascript: `// swap(mat[r][c], mat[c][r]) in nested loops`,
                    java: `// int temp = mat[r][c]; mat[r][c] = mat[c][r]; mat[c][r] = temp;`,
                    cpp: `// swap(mat[r][c], mat[c][r]);`
                  }
                },
        {
                  title: 'Q34: Valid Palindrome',
                  definition: 'Checking if a string reads the same forwards and backwards.',
                  analogy: 'Starting at both ends of a word and moving to the middle, ensuring the letters always match.',
                  detailedExplanation: '**Time Complexity Process:**\n1. Two pointers: left at 0, right at N-1.\n2. In every step, we compare characters and move inward.\n3. The loop stops when they meet in the middle (N/2 steps).\n4. Dropping the constant gives O(N) Time.\n\n**Space Complexity Process:**\n1. Two pointers take O(1) Space.',
                  memoryTip: 'Two pointers moving to the middle = O(N) Time.',
                  timeComplexity: 'O(N)',
                  spaceComplexity: 'O(1)',
                  complexityTable: 'Time: O(N)\nSpace: O(1)',
                  examples: {
                    python: `def is_palindrome(s):\n    l, r = 0, len(s)-1\n    while l < r:\n        if s[l] != s[r]: return False\n        l += 1; r -= 1\n    return True`,
                    javascript: `// Two pointers while(l < r)`,
                    java: `// Two pointers while(l < r)`,
                    cpp: `// Two pointers while(l < r)`
                  }
                },
        {
                  title: 'Q35: String Reversal (In Place)',
                  definition: 'Reversing an array of characters.',
                  analogy: 'Swapping the first and last person in a line, then the second and second-to-last, etc.',
                  detailedExplanation: '**Time Complexity Process:**\n1. Two pointers: left at 0, right at N-1.\n2. Swap the characters and move pointers inward.\n3. Exact number of swaps = N/2.\n4. Time Complexity = O(N).\n\n**Space Complexity Process:**\n1. Swapping happens entirely in the original array.\n2. Space Complexity = O(1).',
                  memoryTip: 'Reversing takes O(N) Time and O(1) Space.',
                  timeComplexity: 'O(N)',
                  spaceComplexity: 'O(1)',
                  complexityTable: 'Time: O(N)\nSpace: O(1)',
                  examples: {
                    python: `def reverse_string(s):\n    l, r = 0, len(s)-1\n    while l < r:\n        s[l], s[r] = s[r], s[l]\n        l += 1; r -= 1`,
                    javascript: `// In-place swap`,
                    java: `// In-place swap`,
                    cpp: `// In-place swap`
                  }
                },
        {
                  title: 'Q36: Searching in Unsorted vs Sorted Arrays',
                  definition: 'Linear Search vs Binary Search.',
                  analogy: 'Looking for a book in a random pile vs looking for a book on an alphabetized shelf.',
                  detailedExplanation: '**Time Complexity Process:**\n1. If array is unsorted, we must check every element: Linear Search = O(N).\n2. If array is sorted, we can halve the search space: Binary Search = O(log N).\n\n**Space Complexity Process:**\n1. Both take O(1) Space if implemented iteratively.',
                  memoryTip: 'Unsorted = O(N). Sorted = O(log N).',
                  timeComplexity: 'O(N) / O(log N)',
                  spaceComplexity: 'O(1)',
                  complexityTable: 'Time: O(N) vs O(log N)\nSpace: O(1)',
                  examples: {
                    python: `// For sorted, use bisect. For unsorted, use 'in'.`,
                    javascript: `// For sorted, use Binary Search. For unsorted, use indexOf.`,
                    java: `// Arrays.binarySearch() vs linear loop.`,
                    cpp: `// std::binary_search vs std::find.`
                  }
                },
        {
                  title: 'Q37: String Concatenation using StringBuilder',
                  definition: 'Efficiently building strings inside a loop.',
                  analogy: 'Instead of rebuilding the brick wall each time, you just stick the new brick on the end of the existing wall.',
                  detailedExplanation: '**Time Complexity Process:**\n1. Using an array (or StringBuilder) avoids creating a new string every iteration.\n2. Appending to a dynamic array takes O(1) amortized time.\n3. Doing this N times takes O(N) time.\n4. Finally joining the array into a single string takes O(N) time.\n5. Total Time = O(N) + O(N) = O(N).',
                  memoryTip: 'StringBuilder / join() is O(N). `+=` is O(N²).',
                  timeComplexity: 'O(N)',
                  spaceComplexity: 'O(N)',
                  complexityTable: 'Time: O(N)\nSpace: O(N)',
                  examples: {
                    python: `def fast_concat(n):\n    res = []\n    for i in range(n):\n        res.append("a")\n    return "".join(res)`,
                    javascript: `function fastConcat(n) {\n    let res = [];\n    for(let i=0; i<n; i++) res.push("a");\n    return res.join("");\n}`,
                    java: `public String fastConcat(int n) {\n    StringBuilder sb = new StringBuilder();\n    for(int i=0; i<n; i++) sb.append("a");\n    return sb.toString();\n}`,
                    cpp: `// C++ strings are mutable, so s += "a" is already O(N).`
                  }
                },
        {
                  title: 'Q38: Graph BFS (Breadth-First Search)',
                  definition: 'Traversing a Graph level by level.',
                  analogy: 'Exploring a city block by block, making sure you see everything in a 1-mile radius before moving to 2 miles.',
                  detailedExplanation: '**Time Complexity Process:**\n1. We visit every Vertex exactly once. O(V).\n2. We inspect every Edge connected to that vertex. Over the whole traversal, every edge is inspected twice (once from each end).\n3. Total Time = O(V + E).\n\n**Space Complexity Process:**\n1. The Queue holds at most all vertices in the worst case (a star graph). Space = O(V).',
                  memoryTip: 'Graph Traversals are always O(V + E).',
                  timeComplexity: 'O(V + E)',
                  spaceComplexity: 'O(V)',
                  complexityTable: 'Time: O(V + E)\nSpace: O(V)',
                  examples: {
                    python: `// queue.append(node), visited.add(node)`,
                    javascript: `// queue.push(node), visited.add(node)`,
                    java: `// Queue<Node> q = new LinkedList<>();`,
                    cpp: `// std::queue<Node*> q;`
                  }
                },
        {
                  title: 'Q39: Graph DFS (Depth-First Search)',
                  definition: 'Traversing a Graph by diving as deep as possible.',
                  analogy: 'Running as deep into a maze as you can until you hit a dead end, then backtracking.',
                  detailedExplanation: '**Time Complexity Process:**\n1. Same as BFS. We visit every Vertex (V) and explore every Edge (E) exactly once.\n2. Total Time = O(V + E).\n\n**Space Complexity Process:**\n1. The recursive Call Stack can go as deep as the longest path in the graph.\n2. In the worst case (a straight line graph), this is O(V) space.',
                  memoryTip: 'DFS and BFS have the exact same time/space complexity!',
                  timeComplexity: 'O(V + E)',
                  spaceComplexity: 'O(V)',
                  complexityTable: 'Time: O(V + E)\nSpace: O(V) (Call Stack)',
                  examples: {
                    python: `// def dfs(node):\n//    for neighbor in graph[node]: dfs(neighbor)`,
                    javascript: `// function dfs(node) { ... }`,
                    java: `// void dfs(Node node) { ... }`,
                    cpp: `// void dfs(Node* node) { ... }`
                  }
                },
        {
                  title: 'Q40: Dijkstra\'s Algorithm',
                  definition: 'Finding the shortest path in a weighted graph.',
                  analogy: 'GPS calculating the fastest route by always expanding the currently known shortest path.',
                  detailedExplanation: '**Time Complexity Process:**\n1. We use a Priority Queue / Min-Heap to pick the closest node.\n2. Extracting from the heap takes O(log V).\n3. We do this for every Edge (updating distances). E operations * log V.\n4. Total Time = O(E log V).\n*(Note: With a Fibonacci heap, it can be mathematically reduced to O(V log V + E), but standard heaps are E log V).*',
                  memoryTip: 'Dijkstra = BFS + Priority Queue = O(E log V).',
                  timeComplexity: 'O(E log V)',
                  spaceComplexity: 'O(V)',
                  complexityTable: 'Time: O(E log V)\nSpace: O(V)',
                  examples: {
                    python: `// heapq.heappush(pq, (dist, node))`,
                    javascript: `// class MinHeap { ... }`,
                    java: `// PriorityQueue<Node> pq = new PriorityQueue<>();`,
                    cpp: `// priority_queue<pair<int, int>, vector<...>, greater<...>> pq;`
                  }
                }
      ]
    },
    {
      title: 'Level 5: Graphs & Dynamic Programming',
      definition: 'Tricky traversals, built-in functions, and memoization.',
      category: 6,
      subTopics: [
        {
                  title: 'Q41: Heap Insert/Extract',
                  definition: 'Adding or removing elements from a Min/Max Heap.',
                  analogy: 'A corporate ladder. When a new CEO is hired, they might bubble up from the bottom, replacing managers step-by-step.',
                  detailedExplanation: '**Time Complexity Process:**\n1. A Heap is a Complete Binary Tree, so its height is strictly log(N).\n2. Inserting requires adding to the bottom and "bubbling up" to the root.\n3. Extracting requires swapping root with bottom and "bubbling down".\n4. Both operations traverse the height of the tree: O(log N).',
                  memoryTip: 'Heaps are perfectly balanced trees. Height = log N.',
                  timeComplexity: 'O(log N)',
                  spaceComplexity: 'O(1)',
                  complexityTable: 'Time: O(log N)\nSpace: O(1) auxiliary',
                  examples: {
                    python: `// heapq.heappush(arr, val) -> O(log N)`,
                    javascript: `// Custom bubbling logic -> O(log N)`,
                    java: `// pq.offer(val) -> O(log N)`,
                    cpp: `// pq.push(val) -> O(log N)`
                  }
                },
        {
                  title: 'Q42: Heapify (Building a Heap)',
                  definition: 'Converting an unsorted array into a valid Heap.',
                  analogy: 'Organizing a messy room by starting at the smallest corners and slowly working outwards.',
                  detailedExplanation: '**Time Complexity Process:**\n1. You might think inserting N elements one-by-one takes O(N log N).\n2. HOWEVER, "Heapify" works bottom-up.\n3. Most nodes are at the bottom and barely move. Only the single root node travels log(N) steps.\n4. The math resolves to exactly O(N) time. This is a common trick question!',
                  memoryTip: 'Heapify is O(N). Inserting N items one-by-one is O(N log N).',
                  timeComplexity: 'O(N)',
                  spaceComplexity: 'O(1)',
                  complexityTable: 'Time: O(N)\nSpace: O(1)',
                  examples: {
                    python: `// heapq.heapify(arr) -> O(N)`,
                    javascript: `// Build-Heap bottom-up loop`,
                    java: `// PriorityQueue constructor takes Collection -> O(N)`,
                    cpp: `// make_heap(arr.begin(), arr.end()) -> O(N)`
                  }
                },
        {
                  title: 'Q43: Topological Sort',
                  definition: 'Ordering tasks with dependencies.',
                  analogy: 'Putting on your socks before your shoes.',
                  detailedExplanation: '**Time Complexity Process:**\n1. Using Kahn\'s Algorithm (BFS based) or DFS, we visit every node and edge exactly once.\n2. Time Complexity is identical to standard graph traversal: O(V + E).',
                  memoryTip: 'Topological Sort is just a modified Graph Traversal: O(V + E).',
                  timeComplexity: 'O(V + E)',
                  spaceComplexity: 'O(V)',
                  complexityTable: 'Time: O(V + E)\nSpace: O(V)',
                  examples: {
                    python: `// Queue with in-degrees, or DFS with a stack`,
                    javascript: `// Queue with in-degrees, or DFS with a stack`,
                    java: `// Queue with in-degrees, or DFS with a stack`,
                    cpp: `// Queue with in-degrees, or DFS with a stack`
                  }
                },
        {
                  title: 'Q44: Fibonacci with DP (Memoization)',
                  definition: 'Caching recursive results to prevent duplicate work.',
                  analogy: 'Solving a math problem once, writing the answer on a sticky note, and just reading the sticky note next time.',
                  detailedExplanation: '**Time Complexity Process:**\n1. Standard recursion does O(2^N) work because it recalculates `fib(5)` dozens of times.\n2. With Memoization, we only calculate each `fib(i)` exactly once.\n3. We solve N subproblems, each taking O(1) time.\n4. Total Time drops massively from O(2^N) to O(N).\n\n**Space Complexity Process:**\n1. The Cache/Dictionary takes O(N) space.\n2. The Call Stack takes O(N) space.',
                  memoryTip: 'DP reduces Exponential time down to Polynomial time!',
                  timeComplexity: 'O(N)',
                  spaceComplexity: 'O(N)',
                  complexityTable: 'Time: O(N)\nSpace: O(N)',
                  examples: {
                    python: `def fib_memo(n, memo={}):\n    if n in memo: return memo[n]\n    if n <= 1: return n\n    memo[n] = fib_memo(n-1) + fib_memo(n-2)\n    return memo[n]`,
                    javascript: `// Store answers in an array or map.`,
                    java: `// Store answers in an int[] array.`,
                    cpp: `// Store answers in a vector<int>.`
                  }
                },
        {
                  title: 'Q45: Knapsack Problem (0/1 DP)',
                  definition: 'Finding the most valuable subset of items that fit in a weight limit W.',
                  analogy: 'A thief fitting the most expensive items into a limited-size bag.',
                  detailedExplanation: '**Time Complexity Process:**\n1. We create a 2D DP grid of size N (items) by W (weight limit).\n2. We fill in every cell exactly once.\n3. Each cell takes O(1) constant time to compute (max of two previous cells).\n4. Total Time = O(N * W). This is called "Pseudo-Polynomial".',
                  memoryTip: '2D DP tables almost always take O(Rows * Cols) Time.',
                  timeComplexity: 'O(N * W)',
                  spaceComplexity: 'O(N * W)',
                  complexityTable: 'Time: O(N * W)\nSpace: O(N * W)',
                  examples: {
                    python: `// dp[i][w] = max(dp[i-1][w], val[i] + dp[i-1][w-wt[i]])`,
                    javascript: `// dp[i][w] = Math.max(...)`,
                    java: `// dp[i][w] = Math.max(...)`,
                    cpp: `// dp[i][w] = max(...)`
                  }
                },
        {
                  title: 'Q46: Longest Common Subsequence',
                  definition: 'Finding the longest sequence present in two strings.',
                  analogy: 'Finding the longest set of matching genetic markers in two DNA strands.',
                  detailedExplanation: '**Time Complexity Process:**\n1. DP table of size N (string 1 length) by M (string 2 length).\n2. Fill each cell in O(1) time.\n3. Total Time = O(N * M).',
                  memoryTip: 'Two strings in DP usually implies O(N * M) 2D Grid.',
                  timeComplexity: 'O(N * M)',
                  spaceComplexity: 'O(N * M)',
                  complexityTable: 'Time: O(N * M)\nSpace: O(N * M)',
                  examples: {
                    python: `// dp[i][j] = 1 + dp[i-1][j-1] if match else max(...)`,
                    javascript: `// dp[i][j] = ...`,
                    java: `// dp[i][j] = ...`,
                    cpp: `// dp[i][j] = ...`
                  }
                },
        {
                  title: 'Q47: Power Set (All Subsets)',
                  definition: 'Generating every possible combination of an array.',
                  analogy: 'Given an ice cream shop with N toppings, listing every possible sundae you could order.',
                  detailedExplanation: '**Time Complexity Process:**\n1. Each of the N items can either be IN the subset, or OUT (2 choices).\n2. Total number of subsets = 2 * 2 * 2 ... = 2^N.\n3. For each subset, it takes O(N) time to actually copy the elements into the result list.\n4. Total Time = O(N * 2^N).',
                  memoryTip: 'Combinations/Subsets = 2^N.',
                  timeComplexity: 'O(N * 2^N)',
                  spaceComplexity: 'O(N * 2^N)',
                  complexityTable: 'Time: O(N * 2^N)\nSpace: O(N * 2^N)',
                  examples: {
                    python: `// Backtracking: subset.append(val); dfs(); subset.pop()`,
                    javascript: `// Backtracking...`,
                    java: `// Backtracking...`,
                    cpp: `// Backtracking...`
                  }
                },
        {
                  title: 'Q48: All Permutations',
                  definition: 'Generating every possible ordering of an array.',
                  analogy: 'Trying every possible combination to crack a 4-digit lock.',
                  detailedExplanation: '**Time Complexity Process:**\n1. How many ways to arrange N items? N * (N-1) * (N-2) ... = N! (N-factorial).\n2. There are exactly N! permutations.\n3. Creating each permutation takes O(N) time to copy the array.\n4. Total Time = O(N * N!).',
                  memoryTip: 'Orderings/Permutations = N!',
                  timeComplexity: 'O(N * N!)',
                  spaceComplexity: 'O(N * N!)',
                  complexityTable: 'Time: O(N * N!)\nSpace: O(N * N!)',
                  examples: {
                    python: `// Backtracking loop over all unused elements.`,
                    javascript: `// Backtracking...`,
                    java: `// Backtracking...`,
                    cpp: `// Backtracking...`
                  }
                },
        {
                  title: 'Q49: Dynamic Array Resizing (ArrayList)',
                  definition: 'Appending to an array that has run out of space.',
                  analogy: 'Moving to a bigger house every time your current house fills up with furniture.',
                  detailedExplanation: '**Time Complexity Process:**\n1. When the array is full (size N), you must create a new array of size 2N and copy all N elements over. This single step is O(N).\n2. HOWEVER, because you doubled the size, the next N appends will be strictly O(1).\n3. When averaged out across all operations, the expensive O(N) cost is spread over N cheap operations.\n4. Result: O(1) Amortized Time.',
                  memoryTip: 'Amortized means "expensive sometimes, but averages out to fast".',
                  timeComplexity: 'O(1) Amortized',
                  spaceComplexity: 'O(N)',
                  complexityTable: 'Time: O(1) Amortized\nSpace: O(N)',
                  examples: {
                    python: `// list.append(val)`,
                    javascript: `// arr.push(val)`,
                    java: `// arrayList.add(val)`,
                    cpp: `// vector.push_back(val)`
                  }
                },
        {
                  title: 'Q50: Dijkstra with a Dense Graph',
                  definition: 'Running Dijkstra on a graph where every node connects to every other node.',
                  analogy: 'A flight map where every city has a direct flight to every other city.',
                  detailedExplanation: '**Time Complexity Process:**\n1. A dense graph has V² edges (E = V²).\n2. Standard Dijkstra is O(E log V).\n3. Plugging in V² gives O(V² log V).\n4. In this specific case, an unoptimized O(V²) Dijkstra without a heap is actually FASTER because V² < V² log V.',
                  memoryTip: 'E = V² for dense graphs. O(E) = O(V²).',
                  timeComplexity: 'O(V²)',
                  spaceComplexity: 'O(V²)',
                  complexityTable: 'Time: O(V²)\nSpace: O(V²)',
                  examples: {
                    python: `// Unoptimized O(V^2) loop to find min distance node.`,
                    javascript: `// ...`,
                    java: `// ...`,
                    cpp: `// ...`
                  }
                }
      ]
    }
  ]
};
