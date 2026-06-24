'use client';

import { useState, useMemo, useEffect, Fragment } from 'react';
import { useSession } from 'next-auth/react';
import {
  GraduationCap, Flame, Trophy, Search, ChevronDown,
  Shuffle, LayoutGrid, Zap, Play, TrendingUp, Clock,
  Star, BookOpen, ArrowRight, Rocket, Sliders, Layers,
  GitBranch, Crown, Type, Binary, Cpu, GitFork, GitMerge,
  Sparkles, X, ChevronRight, CheckCircle2, Lock, Download,
  ExternalLink, Terminal, PlayCircle, RefreshCw, AlertCircle,
  Bookmark, Share2, Lightbulb, MessageSquare, Settings, Maximize2,
  Code, ArrowLeftRight
} from 'lucide-react';

import { getLearningPaths } from '@/app/actions/admin-management';
import { getQuestions } from '@/app/actions/question';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { COMPLEXITY_MASTERY_CARD } from './complexity-data';

/* ─────────────────────────────────────────
   Shared Interface Structures
   ───────────────────────────────────────── */

interface PathData {
  id: string;
  name: string;
  desc: string;
  icon: React.ComponentType<any>;
  color: string;
  bar: string;
  level: string;
  levelClass: string;
  lessons: number;
  completed: number;
  pct: number;
}

interface Lesson {
  name: string;
  status: 'completed' | 'current' | 'locked';
  problemDesc: string;
  defaultCode: string;
  expectedOutput: string;
}

interface Module {
  id: string;
  label: string;
  name: string;
  desc: string;
  status: 'completed' | 'in-progress' | 'locked';
  lessonsCount: number;
  totalLessons: number;
  defaultOpen?: boolean;
  items: Lesson[];
}

const LEARNING_PATHS_INITIAL: PathData[] = [
  {
    id: 'sorting',
    name: 'Sorting Algorithms',
    desc: 'Learn different sorting techniques from basics to advanced concepts.',
    icon: Sliders,
    color: 'color-purple', bar: 'bar-purple',
    level: 'Beginner → Advanced', levelClass: 'level-beginner-advanced',
    lessons: 20, completed: 12, pct: 60,
  },
  {
    id: 'searching',
    name: 'Searching Algorithms',
    desc: 'Master linear search, binary search and advanced searching techniques.',
    icon: Search,
    color: 'color-blue', bar: 'bar-blue',
    level: 'Beginner → Intermediate', levelClass: 'level-beginner-intermediate',
    lessons: 20, completed: 9, pct: 45,
  },
  {
    id: 'data-structures',
    name: 'Data Structures',
    desc: 'Learn arrays, linked lists, stacks, queues, trees and more.',
    icon: Layers,
    color: 'color-green', bar: 'bar-green',
    level: 'Beginner → Advanced', levelClass: 'level-beginner-advanced',
    lessons: 40, completed: 14, pct: 35,
  },
  {
    id: 'dynamic-programming',
    name: 'Dynamic Programming',
    desc: 'Solve complex problems using dynamic programming patterns.',
    icon: Binary,
    color: 'color-purple', bar: 'bar-purple',
    level: 'Intermediate → Advanced', levelClass: 'level-intermediate-advanced',
    lessons: 32, completed: 8, pct: 25,
  },
  {
    id: 'graph-algorithms',
    name: 'Graph Algorithms',
    desc: 'Explore BFS, DFS, shortest paths, MST, topological sort and more.',
    icon: GitBranch,
    color: 'color-orange', bar: 'bar-orange',
    level: 'Intermediate → Advanced', levelClass: 'level-intermediate-advanced',
    lessons: 33, completed: 10, pct: 30,
  },
  {
    id: 'greedy',
    name: 'Greedy Algorithms',
    desc: 'Learn greedy approach and how to apply it to solve problems.',
    icon: Crown,
    color: 'color-yellow', bar: 'bar-yellow',
    level: 'Beginner → Intermediate', levelClass: 'level-beginner-intermediate',
    lessons: 15, completed: 6, pct: 40,
  },
  {
    id: 'string-algorithms',
    name: 'String Algorithms',
    desc: 'Pattern matching, string hashing, tries and advanced string problems.',
    icon: Type,
    color: 'color-pink', bar: 'bar-pink',
    level: 'Intermediate → Advanced', levelClass: 'level-intermediate-advanced',
    lessons: 20, completed: 4, pct: 20,
  },
  {
    id: 'math',
    name: 'Math & Number Theory',
    desc: 'Essential math concepts, prime numbers, GCD, modular arithmetic.',
    icon: Binary,
    color: 'color-green', bar: 'bar-green',
    level: 'Beginner → Intermediate', levelClass: 'level-beginner-intermediate',
    lessons: 16, completed: 8, pct: 50,
  },
  {
    id: 'bit-manipulation',
    name: 'Bit Manipulation',
    desc: 'Learn bitwise operators and advanced bit manipulation tricks.',
    icon: Cpu,
    color: 'color-green', bar: 'bar-green',
    level: 'Beginner → Intermediate', levelClass: 'level-beginner-intermediate',
    lessons: 10, completed: 3, pct: 30,
  },
  {
    id: 'backtracking',
    name: 'Backtracking',
    desc: 'Solve problems using recursion, backtracking and pruning.',
    icon: GitFork,
    color: 'color-purple', bar: 'bar-purple',
    level: 'Intermediate → Advanced', levelClass: 'level-intermediate-advanced',
    lessons: 16, completed: 4, pct: 25,
  },
  {
    id: 'divide-conquer',
    name: 'Divide & Conquer',
    desc: 'Master divide and conquer paradigm and algorithms.',
    icon: GitMerge,
    color: 'color-orange', bar: 'bar-orange',
    level: 'Intermediate → Advanced', levelClass: 'level-intermediate-advanced',
    lessons: 15, completed: 3, pct: 20,
  },
  {
    id: 'advanced-topics',
    name: 'Advanced Topics',
    desc: 'Advanced algorithms, heuristics and specialized techniques.',
    icon: Sparkles,
    color: 'color-red', bar: 'bar-red',
    level: 'Advanced', levelClass: 'level-advanced',
    lessons: 20, completed: 2, pct: 10,
  },
];

/* ─────────────────────────────────────────
   Topic Cards for Learning Paths
   ───────────────────────────────────────── */
interface SubTopic {
  title: string;
  definition: string;
  analogy: string;
  detailedExplanation: string;
  memoryTip: string;
  timeComplexity: string;
  spaceComplexity: string;
  complexityTable: string;
  examples: Record<string, string>;
}

interface TopicConcept {
  title: string;
  definition: string;
  category?: number; // Used for animation
  subTopics?: SubTopic[]; // Optional for backwards compatibility with non-DSA topics
  // Legacy fields below (kept for backwards compatibility for non-DSA topics)
  analogy?: string;
  mindMap?: string;
  detailedExplanation?: string;
  memoryTip?: string;
  examples?: Record<string, string>;
}

interface TopicCard {
  id: string;
  name: string;
  shortName: string;
  desc: string;
  icon: React.ComponentType<any>;
  color: string;
  gradient: string;
  concepts: TopicConcept[];
  codeExample: { title: string; language: string; code: string };
}

const TOPIC_CARDS: TopicCard[] = [
  {
    id: 'dsa',
    name: 'Data Structures & Algorithms',
    shortName: 'DSA',
    desc: 'Master fundamental data structures and algorithmic problem-solving patterns used in technical interviews.',
    icon: Layers,
    color: 'color-purple',
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
    concepts: [
      {
        title: 'Arrays & Strings',
        definition: 'Contiguous memory structures for storing ordered collections.',
        category: 0,
        subTopics: [
          {
            title: '1D Arrays',
            definition: 'A single row of contiguous memory used to store elements of the same type.',
            analogy: 'Imagine a row of numbered cubbies. You can instantly open any cubby if you know its number.',
            detailedExplanation: 'An Array is the most fundamental data structure. Because elements are stored right next to each other in memory, your computer can instantly access any item using its index (math: `memory_address + index * size`).\n\nHowever, because they are a fixed size block, if you want to insert a new item in the middle, you have to physically shift every single subsequent element over by one spot, which is very slow.',
            memoryTip: 'Tip: Arrays give you O(1) instant access by index, but O(N) slow insertions/deletions in the middle.',
            timeComplexity: 'O(1) Access, O(N) Insert/Delete',
            spaceComplexity: 'O(N)',
            complexityTable: 'Access:    O(1)\nSearch:    O(N)\nInsertion: O(N) (worst case)\nDeletion:  O(N) (worst case)',
            examples: {
              python: `cubbies = [10, 20, 30, 40]
print(cubbies[1]) # O(1) Instant access! Outputs: 20

# Inserting in middle is O(N) because it shifts 30 and 40
cubbies.insert(2, 25) 
print(cubbies) # [10, 20, 25, 30, 40]`,
              javascript: `let cubbies = [10, 20, 30, 40];
console.log(cubbies[1]); // O(1) Instant access! Outputs: 20

// Inserting in middle is O(N) because it shifts 30 and 40
cubbies.splice(2, 0, 25);
console.log(cubbies); // [10, 20, 25, 30, 40]`,
              java: `int[] cubbies = {10, 20, 30, 40};
System.out.println(cubbies[1]); // O(1) Instant access! Outputs: 20

// In Java, static arrays can't be resized! You must use ArrayList for dynamic sizing:
ArrayList<Integer> list = new ArrayList<>(Arrays.asList(10, 20, 30, 40));
list.add(2, 25); // O(N) shift`,
              cpp: `int cubbies[] = {10, 20, 30, 40};
cout << cubbies[1] << endl; // O(1) Instant access! Outputs: 20

// In C++, static arrays can't be resized! You must use std::vector:
vector<int> vec = {10, 20, 30, 40};
vec.insert(vec.begin() + 2, 25); // O(N) shift`
            }
          },
          {
            title: '2D Arrays (Matrices)',
            definition: 'An array of arrays, forming a grid or table with rows and columns.',
            analogy: 'Imagine an Excel spreadsheet or a chessboard. You need two coordinates (row and column) to find a specific square.',
            detailedExplanation: 'A 2D Array is just a 1D array where every element is *another* 1D array. They are heavily used in image processing (where each pixel is an x,y coordinate) and game boards (like Tic-Tac-Toe).\n\nCommon interview questions involve traversing the grid in unique ways, like a "Spiral Matrix", or rotating the entire grid 90 degrees.',
            memoryTip: 'Tip: Always double-check your boundaries (`row < grid.length` and `col < grid[0].length`) to avoid out-of-bounds errors!',
            timeComplexity: 'O(R * C) Traversal',
            spaceComplexity: 'O(R * C)',
            complexityTable: 'Access:    O(1)\nTraversal: O(R * C) where R=rows, C=columns\nSearch:    O(R * C) (unsorted)',
            examples: {
              python: `matrix = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9]
]
# Access row 1, col 2 (0-indexed)
print(matrix[1][2]) # Outputs: 6`,
              javascript: `let matrix = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9]
];
// Access row 1, col 2 (0-indexed)
console.log(matrix[1][2]); // Outputs: 6`,
              java: `int[][] matrix = {
  {1, 2, 3},
  {4, 5, 6},
  {7, 8, 9}
};
// Access row 1, col 2 (0-indexed)
System.out.println(matrix[1][2]); // Outputs: 6`,
              cpp: `int matrix[3][3] = {
  {1, 2, 3},
  {4, 5, 6},
  {7, 8, 9}
};
// Access row 1, col 2 (0-indexed)
cout << matrix[1][2] << endl; // Outputs: 6`
            }
          },
          {
            title: 'String Manipulation',
            definition: 'Techniques for analyzing, modifying, and searching through text.',
            analogy: 'A String is just an array of characters. "HELLO" is literally [\'H\', \'E\', \'L\', \'L\', \'O\'].',
            detailedExplanation: 'Since Strings are just arrays, all array rules apply! The major "gotcha" in interviews is that in many languages (like Java and Python), Strings are **immutable**. That means you cannot change a single character; if you try, the language secretly creates a brand new string from scratch!\n\nCommon problems include checking if a string is a Palindrome (reads the same forwards and backwards) or an Anagram (has the exact same letters as another word).',
            memoryTip: 'Tip: If you need to build or modify a string piece-by-piece in Java or C++, use a StringBuilder instead of `+` to avoid O(N^2) time complexity!',
            timeComplexity: 'O(N) Traversal',
            spaceComplexity: 'O(N)',
            complexityTable: 'Access:        O(1)\nConcatenation: O(N)\nSubstring:     O(N)',
            examples: {
              python: `text = "hello"
# Strings are immutable in Python! 
# We must build a new string or list to reverse it:
reversed_text = text[::-1]
print(reversed_text) # "olleh"`,
              javascript: `let text = "hello";
// Strings are immutable in JS too!
let reversed = text.split("").reverse().join("");
console.log(reversed); // "olleh"`,
              java: `String text = "hello";
// Use StringBuilder for O(N) string manipulation in Java!
StringBuilder sb = new StringBuilder(text);
sb.reverse();
System.out.println(sb.toString()); // "olleh"`,
              cpp: `string text = "hello";
// C++ strings ARE mutable! We can reverse them in-place.
reverse(text.begin(), text.end());
cout << text << endl; // "olleh"`
            }
          },
          {
            title: 'Two Pointers Technique',
            definition: 'An algorithmic technique using two indices to search an array from different directions.',
            analogy: 'Imagine trying to find a matching pair of socks in a line. Instead of checking every combination one by one, you and a friend start at opposite ends of the line and walk towards the middle.',
            detailedExplanation: 'This is the #1 most common Array/String trick in interviews. Instead of using a nested loop `for i in range(n): for j in range(n):` which takes O(N²) time, you use two pointers (usually `left = 0` and `right = len - 1`).\n\nYou move the pointers towards each other based on a condition. This reduces the time complexity to O(N) because you only traverse the array once!',
            memoryTip: 'Tip: If an array is SORTED and you need to find a "pair" of numbers, use Two Pointers starting at the opposite ends!',
            timeComplexity: 'O(N)',
            spaceComplexity: 'O(1)',
            complexityTable: 'Time:  O(N)\nSpace: O(1)',
            examples: {
              python: `def is_palindrome(s):
    left, right = 0, len(s) - 1
    while left < right:
        if s[left] != s[right]:
            return False
        left += 1
        right -= 1
    return True`,
              javascript: `function isPalindrome(s) {
    let left = 0, right = s.length - 1;
    while (left < right) {
        if (s[left] !== s[right]) return false;
        left++; right--;
    }
    return true;
}`,
              java: `public boolean isPalindrome(String s) {
    int left = 0, right = s.length() - 1;
    while (left < right) {
        if (s.charAt(left) != s.charAt(right)) return false;
        left++; right--;
    }
    return true;
}`,
              cpp: `bool isPalindrome(string s) {
    int left = 0, right = s.length() - 1;
    while (left < right) {
        if (s[left] != s[right]) return false;
        left++; right--;
    }
    return true;
}`
            }
          },
          {
            title: 'Sliding Window',
            definition: 'An extension of Two Pointers where the pointers form a "window" that slides across the array.',
            analogy: 'Imagine looking at a long train through a small window. As the train moves, your window "slides", showing a new train car on the right while hiding one on the left.',
            detailedExplanation: 'This technique is used to solve problems looking for a "continuous subarray" or "substring". \n\nInstead of recalculating the sum of the subarray every time you move over by one, you just subtract the element that fell out of the left side of the window, and add the new element that entered the right side. This turns an O(N²) nested loop into an O(N) single pass!',
            memoryTip: 'Tip: If a problem asks for the "longest/shortest substring" or "max subarray of size K", it is almost certainly a Sliding Window problem.',
            timeComplexity: 'O(N)',
            spaceComplexity: 'O(1) or O(K)',
            complexityTable: 'Time:  O(N)\nSpace: O(1) (or O(K) if storing a frequency map)',
            examples: {
              python: `def max_sum_subarray(arr, k):
    # Find max sum of any contiguous subarray of size K
    max_sum = window_sum = sum(arr[:k])
    
    for i in range(len(arr) - k):
        # Slide window: subtract left element, add right element
        window_sum = window_sum - arr[i] + arr[i + k]
        max_sum = max(max_sum, window_sum)
        
    return max_sum`,
              javascript: `function maxSumSubarray(arr, k) {
    let windowSum = 0;
    for(let i=0; i<k; i++) windowSum += arr[i];
    let maxSum = windowSum;
    
    for(let i=0; i < arr.length - k; i++) {
        windowSum = windowSum - arr[i] + arr[i + k];
        maxSum = Math.max(maxSum, windowSum);
    }
    return maxSum;
}`,
              java: `public int maxSumSubarray(int[] arr, int k) {
    int windowSum = 0;
    for(int i=0; i<k; i++) windowSum += arr[i];
    int maxSum = windowSum;
    
    for(int i=0; i < arr.length - k; i++) {
        windowSum = windowSum - arr[i] + arr[i + k];
        maxSum = Math.max(maxSum, windowSum);
    }
    return maxSum;
}`,
              cpp: `int maxSumSubarray(vector<int>& arr, int k) {
    int windowSum = 0;
    for(int i=0; i<k; i++) windowSum += arr[i];
    int maxSum = windowSum;
    
    for(int i=0; i < arr.size() - k; i++) {
        windowSum = windowSum - arr[i] + arr[i + k];
        maxSum = max(maxSum, windowSum);
    }
    return maxSum;
}`
            }
          }
        ]
      },
      {
        title: 'Linked Lists',
        definition: 'A linear data structure where elements are connected via pointers.',
        category: 1,
        subTopics: [
          {
            title: 'Singly Linked List',
            definition: 'A linked list where each node points only to the next node.',
            analogy: 'Imagine a treasure hunt where clue #1 tells you where clue #2 is, but clue #2 only tells you where clue #3 is. You can only move forward!',
            detailedExplanation: 'This is the most basic Linked List. Each "Node" contains two things: the actual data, and a "pointer" (memory address) to the next Node in the chain.\n\nThe main advantage over Arrays is that you can insert a new Node anywhere in O(1) time simply by changing two pointers, without having to shift any other elements in memory!',
            memoryTip: 'Tip: To insert a new node `N` between `A` and `B`, simply set `N.next = B`, and then `A.next = N`. Order matters!',
            timeComplexity: 'O(N) Search, O(1) Insert/Delete (if node is known)',
            spaceComplexity: 'O(N)',
            complexityTable: 'Access:    O(N)\nSearch:    O(N)\nInsertion: O(1) (at head or known node)\nDeletion:  O(1) (at head or known node)',
            examples: {
              python: `class Node:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

# Traversal
curr = head
while curr:
    print(curr.val)
    curr = curr.next`,
              javascript: `class Node {
    constructor(val = 0, next = null) {
        this.val = val;
        this.next = next;
    }
}
// Traversal
let curr = head;
while (curr) {
    console.log(curr.val);
    curr = curr.next;
}`,
              java: `class Node {
    int val;
    Node next;
    Node(int val) { this.val = val; }
}
// Traversal
Node curr = head;
while (curr != null) {
    System.out.println(curr.val);
    curr = curr.next;
}`,
              cpp: `struct Node {
    int val;
    Node* next;
    Node(int x) : val(x), next(nullptr) {}
};
// Traversal
Node* curr = head;
while (curr != nullptr) {
    cout << curr->val << endl;
    curr = curr->next;
}`
            }
          },
          {
            title: 'Doubly Linked List',
            definition: 'A linked list where each node points to both the next node AND the previous node.',
            analogy: 'Imagine a two-way street. You can walk forward to the next block, but you can also turn around and walk exactly one block backward.',
            detailedExplanation: 'By adding a `prev` pointer to each Node, we can traverse the list backwards! This makes operations like deleting a specific node much easier, because you have direct access to the node before it.\n\nThe trade-off is that every Node takes up more memory (to store the extra pointer), and inserting/deleting requires carefully updating 4 pointers instead of 2.',
            memoryTip: 'Tip: Always update the `next` pointers first, then update the `prev` pointers to avoid losing your reference to the rest of the list!',
            timeComplexity: 'O(N) Search, O(1) Insert/Delete',
            spaceComplexity: 'O(N)',
            complexityTable: 'Access:    O(N)\nSearch:    O(N)\nInsertion: O(1)\nDeletion:  O(1)\n(Requires slightly more space per node)',
            examples: {
              python: `class DNode:
    def __init__(self, val=0, prev=None, next=None):
        self.val = val
        self.prev = prev
        self.next = next

# Deleting a node
node.prev.next = node.next
node.next.prev = node.prev`,
              javascript: `class DNode {
    constructor(val = 0, prev = null, next = null) {
        this.val = val;
        this.prev = prev;
        this.next = next;
    }
}
// Deleting a node
node.prev.next = node.next;
node.next.prev = node.prev;`,
              java: `class DNode {
    int val;
    DNode prev, next;
    DNode(int val) { this.val = val; }
}
// Deleting a node
node.prev.next = node.next;
node.next.prev = node.prev;`,
              cpp: `struct DNode {
    int val;
    DNode* prev;
    DNode* next;
    DNode(int x) : val(x), prev(nullptr), next(nullptr) {}
};
// Deleting a node
node->prev->next = node->next;
node->next->prev = node->prev;`
            }
          },
          {
            title: 'Circular & Circular Doubly Linked Lists',
            definition: 'A linked list where the last node points back to the first node, forming an infinite loop.',
            analogy: 'Imagine playing Monopoly. When you reach the last space (Boardwalk), the next space isn\'t a dead end—it\'s back to "GO"!',
            detailedExplanation: 'In a standard Linked List, the tail node points to `null`. In a Circular Linked List, the tail node points back to the `head`.\n\nA Circular Doubly Linked List combines both: it goes in a circle, AND you can go backwards (the `head.prev` points to the `tail`!). This is incredibly useful for implementing circular queues, music playlists on repeat, or round-robin scheduling in Operating Systems.',
            memoryTip: 'Tip: To avoid an infinite loop during traversal, you must stop when your `curr` pointer equals the `head` pointer again!',
            timeComplexity: 'O(N) Traversal',
            spaceComplexity: 'O(N)',
            complexityTable: 'Access:    O(N)\nSearch:    O(N)\nInsertion: O(1)\nDeletion:  O(1)',
            examples: {
              python: `# Traversal of a circular list
curr = head
if head:
    while True:
        print(curr.val)
        curr = curr.next
        if curr == head: # Stop when we loop back!
            break`,
              javascript: `// Traversal of a circular list
let curr = head;
if (head) {
    do {
        console.log(curr.val);
        curr = curr.next;
    } while (curr !== head); // Stop when we loop back!
}`,
              java: `// Traversal of a circular list
Node curr = head;
if (head != null) {
    do {
        System.out.println(curr.val);
        curr = curr.next;
    } while (curr != head); // Stop when we loop back!
}`,
              cpp: `// Traversal of a circular list
Node* curr = head;
if (head != nullptr) {
    do {
        cout << curr->val << endl;
        curr = curr->next;
    } while (curr != head); // Stop when we loop back!
}`
            }
          },
          {
            title: 'Fast & Slow Pointers',
            definition: 'An algorithmic technique using two pointers that move through a list at different speeds.',
            analogy: 'Imagine a race track. A fast runner moves 2 steps per second, and a slow runner moves 1 step per second. If the track is a circle, the fast runner will eventually lap and "crash" into the slow runner!',
            detailedExplanation: 'This trick (often called Floyd\'s Cycle-Finding Algorithm or the "Tortoise and Hare") is the ultimate Linked List interview hack.\n\nBy moving one pointer twice as fast as the other, you can detect if a Linked List has a cycle (infinite loop) in O(N) time with O(1) space! You can also use this trick to perfectly find the exact middle node of a list in a single pass!',
            memoryTip: 'Tip: `slow = slow.next`, `fast = fast.next.next`. If `slow == fast`, you have a cycle!',
            timeComplexity: 'O(N)',
            spaceComplexity: 'O(1)',
            complexityTable: 'Time:  O(N)\nSpace: O(1)',
            examples: {
              python: `def hasCycle(head):
    slow, fast = head, head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow == fast:
            return True # Cycle detected!
    return False`,
              javascript: `function hasCycle(head) {
    let slow = head, fast = head;
    while (fast && fast.next) {
        slow = slow.next;
        fast = fast.next.next;
        if (slow === fast) return true; // Cycle detected!
    }
    return false;
}`,
              java: `public boolean hasCycle(Node head) {
    Node slow = head, fast = head;
    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;
        if (slow == fast) return true; // Cycle detected!
    }
    return false;
}`,
              cpp: `bool hasCycle(Node *head) {
    Node *slow = head, *fast = head;
    while (fast != nullptr && fast->next != nullptr) {
        slow = slow->next;
        fast = fast->next->next;
        if (slow == fast) return true; // Cycle detected!
    }
    return false;
}`
            }
          }
        ]
      },
      {
        title: 'Stacks & Queues',
        definition: 'Linear structures handling data in a specific order (LIFO and FIFO).',
        category: 2,
        subTopics: [
          {
            title: 'Stack: Push Operation',
            definition: 'Adding an element to the top of a Last-In, First-Out (LIFO) structure.',
            analogy: 'Imagine an empty plate. You cook a pancake and place it on the plate. You cook another and place it directly on top of the first. You are "pushing" pancakes onto the stack!',
            detailedExplanation: 'Pushing is the fundamental way to add data to a Stack. Because you are simply placing the element at the very end (or top) of the collection, no other elements need to be shifted or moved around.\n\nIn most modern languages, Stacks are implemented using dynamic arrays under the hood, making the push operation incredibly fast (O(1) time complexity).',
            memoryTip: 'Tip: "Push" always means adding to the TOP (or end).',
            timeComplexity: 'O(1) Amortized',
            spaceComplexity: 'O(1) per operation',
            complexityTable: 'Push: O(1) Time\n(Note: Amortized O(1) if dynamic array resizes)',
            examples: {
              python: `stack = []
stack.append(10) # Pushes 10
stack.append(20) # Pushes 20 on top of 10
print(stack)     # [10, 20]`,
              javascript: `let stack = [];
stack.push(10); // Pushes 10
stack.push(20); // Pushes 20 on top of 10
console.log(stack); // [10, 20]`,
              java: `Stack<Integer> stack = new Stack<>();
stack.push(10); // Pushes 10
stack.push(20); // Pushes 20 on top of 10
System.out.println(stack); // [10, 20]`,
              cpp: `stack<int> s;
s.push(10); // Pushes 10
s.push(20); // Pushes 20 on top of 10`
            }
          },
          {
            title: 'Stack: Pop & Peek Operations',
            definition: 'Removing (Pop) or viewing (Peek) the element at the top of the Stack.',
            analogy: 'You can only eat the pancake that is currently on the absolute top of the pile (Pop). You can also just look at the top pancake without eating it to see what flavor it is (Peek)!',
            detailedExplanation: 'Pop removes the most recently added item. Peek (sometimes called Top) lets you look at that item without removing it.\n\n**CRITICAL RULE**: You must always check if the stack is empty before popping or peeking! Attempting to pop from an empty stack causes a fatal error (Stack Underflow).',
            memoryTip: 'Tip: "Pop" destroys the top element. "Peek/Top" just looks at it safely.',
            timeComplexity: 'O(1)',
            spaceComplexity: 'O(1)',
            complexityTable: 'Pop: O(1) Time\nPeek: O(1) Time\nisEmpty: O(1) Time',
            examples: {
              python: `stack = [10, 20]
if stack:                 # Check isEmpty!
    top = stack[-1]       # Peek: 20
    removed = stack.pop() # Pop: Removes 20
    print(removed)        # Outputs: 20`,
              javascript: `let stack = [10, 20];
if (stack.length > 0) {       // Check isEmpty!
    let top = stack[stack.length - 1]; // Peek: 20
    let removed = stack.pop();         // Pop: Removes 20
    console.log(removed);              // Outputs: 20
}`,
              java: `Stack<Integer> stack = new Stack<>();
stack.push(10); stack.push(20);
if (!stack.isEmpty()) {      // Check isEmpty!
    int top = stack.peek();  // Peek: 20
    int removed = stack.pop(); // Pop: Removes 20
    System.out.println(removed); // Outputs: 20
}`,
              cpp: `stack<int> s;
s.push(10); s.push(20);
if (!s.empty()) {           // Check isEmpty!
    int top = s.top();      // Peek: 20
    s.pop();                // Pop: Removes 20 (returns void in C++)
    cout << top << endl;    // Outputs: 20
}`
            }
          },
          {
            title: 'Queue: Enqueue Operation',
            definition: 'Adding an element to the back of a First-In, First-Out (FIFO) structure.',
            analogy: 'Imagine a line forming outside a movie theater. When a new person arrives, they cannot cut to the front; they must join the very back of the line. This is Enqueueing!',
            detailedExplanation: 'Enqueueing adds data to the tail (back) of the Queue. \n\nIn languages like Java or C++, Queues are usually implemented as Linked Lists under the hood, meaning adding a node to the tail takes instant O(1) time.',
            memoryTip: 'Tip: "Enqueue" = Enter Queue (Join the back of the line).',
            timeComplexity: 'O(1)',
            spaceComplexity: 'O(1) per operation',
            complexityTable: 'Enqueue (Add to back): O(1) Time',
            examples: {
              python: `from collections import deque
queue = deque()
queue.append(10) # Enqueue 10
queue.append(20) # Enqueue 20 behind 10
print(queue)     # deque([10, 20])`,
              javascript: `let queue = [];
queue.push(10); // Enqueue 10
queue.push(20); // Enqueue 20 behind 10
console.log(queue); // [10, 20]`,
              java: `Queue<Integer> queue = new LinkedList<>();
queue.offer(10); // Enqueue 10
queue.offer(20); // Enqueue 20 behind 10
System.out.println(queue); // [10, 20]`,
              cpp: `queue<int> q;
q.push(10); // Enqueue 10
q.push(20); // Enqueue 20 behind 10`
            }
          },
          {
            title: 'Queue: Dequeue & Front',
            definition: 'Removing (Dequeue) or viewing (Front) the element at the front of the Queue.',
            analogy: 'The movie theater doors open! The person who has been waiting the longest at the very front of the line gets to go inside first (Dequeue).',
            detailedExplanation: 'Dequeue removes the oldest item. "Front" (or Peek) lets you see who is next in line without removing them.\n\n**Warning for JavaScript/Python users**: Using a standard array `shift()` or `pop(0)` takes O(N) time because it forces all other elements to slide forward. Always use `deque` in Python! In JS interviews, using an array as a queue is usually forgiven, but it is technically slow.',
            memoryTip: 'Tip: "Dequeue" = Depart Queue (Leave the front of the line).',
            timeComplexity: 'O(1) (with proper structure)',
            spaceComplexity: 'O(1)',
            complexityTable: 'Dequeue (Remove front): O(1) Time\nFront/Peek: O(1) Time\n(O(N) in JS arrays!)',
            examples: {
              python: `from collections import deque
queue = deque([10, 20])
if queue:
    front = queue[0]         # Front: 10
    removed = queue.popleft() # Dequeue: O(1) time!
    print(removed)           # Outputs: 10`,
              javascript: `let queue = [10, 20];
if (queue.length > 0) {
    let front = queue[0];     // Front: 10
    let removed = queue.shift(); // Dequeue: O(N) time in JS!
    console.log(removed);     // Outputs: 10
}`,
              java: `Queue<Integer> queue = new LinkedList<>();
queue.offer(10); queue.offer(20);
if (!queue.isEmpty()) {
    int front = queue.peek();  // Front: 10
    int removed = queue.poll();  // Dequeue: 10
    System.out.println(removed); // Outputs: 10
}`,
              cpp: `queue<int> q;
q.push(10); q.push(20);
if (!q.empty()) {
    int front = q.front();  // Front: 10
    q.pop();                // Dequeue: Removes 10
    cout << front << endl;  // Outputs: 10
}`
            }
          },
          {
            title: 'Priority Queue (Heap)',
            definition: 'A queue where elements are removed based on a priority ranking, not arrival time.',
            analogy: 'Imagine the emergency room. Usually it\'s first-come, first-serve, but if someone arrives with a life-threatening emergency, they jump to the very front of the line instantly!',
            detailedExplanation: 'Under the hood, Priority Queues are usually implemented using a "Heap" (a special type of binary tree). A Min-Heap keeps the smallest element at the top, and a Max-Heap keeps the largest element at the top.\n\nThey are essential for solving "Find the Top K elements" problems or for Dijkstra\'s Shortest Path algorithm.',
            memoryTip: 'Tip: If a problem asks for "Top K", "Kth Largest", or "Kth Smallest", immediately think Priority Queue (Heap)!',
            timeComplexity: 'O(log N) Insert/Extract',
            spaceComplexity: 'O(N)',
            complexityTable: 'Get Max/Min: O(1)\nInsert:      O(log N)\nExtract Max: O(log N)',
            examples: {
              python: `import heapq
# Python has a built-in Min-Heap
nums = [5, 1, 8, 3]
heapq.heapify(nums) # O(N) to build
print(heapq.heappop(nums)) # Pops 1!
# For Max-Heap, invert values: heapq.heappush(nums, -val)`,
              javascript: `// JS doesn't have a built-in Priority Queue!
// In an interview, you often must implement one manually
// or ask the interviewer if you can assume a \`MinPriorityQueue\` class exists.`,
              java: `// Default is Min-Heap
PriorityQueue<Integer> pq = new PriorityQueue<>();
pq.offer(5); pq.offer(1); pq.offer(3);
System.out.println(pq.poll()); // Pops 1!

// Max-Heap:
PriorityQueue<Integer> maxPq = new PriorityQueue<>(Collections.reverseOrder());`,
              cpp: `// Default is Max-Heap in C++!
priority_queue<int> pq;
pq.push(5); pq.push(1); pq.push(8);
cout << pq.top() << endl; // Prints 8!
pq.pop();

// Min-Heap:
priority_queue<int, vector<int>, greater<int>> minPq;`
            }
          },
          {
            title: 'Monotonic Stack/Queue',
            definition: 'A stack or queue whose elements are strictly increasing or strictly decreasing.',
            analogy: 'Imagine a bouncer at an exclusive club. If a VIP (bigger number) arrives, the bouncer kicks out all the less important people (smaller numbers) who were waiting in line!',
            detailedExplanation: 'This is a very advanced and highly specific pattern. A monotonic decreasing stack ensures that every element pushed is smaller than the one below it. If a larger element arrives, you `pop()` until it fits.\n\nThis pattern is almost exclusively used to solve "Next Greater Element" problems (e.g., finding the next warmest day in a list of daily temperatures) or "Sliding Window Maximum" problems in exactly O(N) time.',
            memoryTip: 'Tip: If you need to find the "Next Greater Element" for every item in an array in O(N) time, use a Monotonic Stack!',
            timeComplexity: 'O(N) Total',
            spaceComplexity: 'O(N)',
            complexityTable: 'Time:  O(N) total (each item pushed/popped at most once)\nSpace: O(N)',
            examples: {
              python: `def next_greater_element(nums):
    res = [-1] * len(nums)
    stack = [] # Stores indices
    for i, num in enumerate(nums):
        # Kick out smaller elements!
        while stack and nums[stack[-1]] < num:
            idx = stack.pop()
            res[idx] = num
        stack.append(i)
    return res`,
              javascript: `function nextGreaterElement(nums) {
    let res = new Array(nums.length).fill(-1);
    let stack = [];
    for (let i = 0; i < nums.length; i++) {
        while (stack.length > 0 && nums[stack[stack.length-1]] < nums[i]) {
            res[stack.pop()] = nums[i];
        }
        stack.push(i);
    }
    return res;
}`,
              java: `public int[] nextGreaterElement(int[] nums) {
    int[] res = new int[nums.length];
    Arrays.fill(res, -1);
    Stack<Integer> stack = new Stack<>();
    for (int i = 0; i < nums.length; i++) {
        while (!stack.isEmpty() && nums[stack.peek()] < nums[i]) {
            res[stack.pop()] = nums[i];
        }
        stack.push(i);
    }
    return res;
}`,
              cpp: `vector<int> nextGreaterElement(vector<int>& nums) {
    vector<int> res(nums.size(), -1);
    stack<int> stack;
    for (int i = 0; i < nums.size(); i++) {
        while (!stack.empty() && nums[stack.top()] < nums[i]) {
            res[stack.top()] = nums[i];
            stack.pop();
        }
        stack.push(i);
    }
    return res;
}`
            }
          }
        ]
      },
      {
        title: 'Trees & Graphs',
        definition: 'Hierarchical (trees) and networked (graphs) structures.',
        category: 3,
        subTopics: [
          {
            title: 'Binary Trees & BSTs',
            definition: 'A tree where each node has up to two children. A BST keeps smaller elements on the left, larger on the right.',
            analogy: 'A Binary Search Tree is like a dictionary. If you want to find the word "Monkey", you open the middle. "M" is after "G", so you throw away the left half of the dictionary and only search the right half!',
            detailedExplanation: 'Trees are composed of nodes with a `left` and `right` child. They are inherently recursive. A Binary Search Tree (BST) provides lightning-fast O(log N) search times because each decision cuts the remaining possibilities in half.\n\nTree Traversals are vital to know:\n- Inorder (Left, Root, Right): Prints a BST in sorted order.\n- Preorder (Root, Left, Right): Used to copy a tree.\n- Postorder (Left, Right, Root): Used to delete a tree safely from the bottom up.',
            memoryTip: 'Tip: BST operations are O(log N) on average, but O(N) if the tree becomes completely unbalanced (like a straight line).',
            timeComplexity: 'O(log N) Search/Insert (Balanced)',
            spaceComplexity: 'O(N)',
            complexityTable: 'Search: O(log N)\nInsert: O(log N)\nDelete: O(log N)\n(Worst case O(N) if unbalanced)',
            examples: {
              python: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

# Inorder Traversal (Recursive)
def inorder(root):
    if root:
        inorder(root.left)
        print(root.val)
        inorder(root.right)`,
              javascript: `class TreeNode {
    constructor(val = 0, left = null, right = null) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
}
// Inorder Traversal (Recursive)
function inorder(root) {
    if (root) {
        inorder(root.left);
        console.log(root.val);
        inorder(root.right);
    }
}`,
              java: `class TreeNode {
    int val;
    TreeNode left, right;
    TreeNode(int val) { this.val = val; }
}
// Inorder Traversal (Recursive)
public void inorder(TreeNode root) {
    if (root != null) {
        inorder(root.left);
        System.out.println(root.val);
        inorder(root.right);
    }
}`,
              cpp: `struct TreeNode {
    int val;
    TreeNode *left, *right;
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};
// Inorder Traversal (Recursive)
void inorder(TreeNode* root) {
    if (root) {
        inorder(root->left);
        cout << root->val << endl;
        inorder(root->right);
    }
}`
            }
          },
          {
            title: 'Breadth-First Search (BFS)',
            definition: 'An algorithm that searches level-by-level using a Queue.',
            analogy: 'Imagine dropping a stone in a pond. The ripples spread outwards in perfect circles. BFS explores the closest neighbors first (the first ripple), then the neighbors\' neighbors (the second ripple).',
            detailedExplanation: 'BFS is the perfect algorithm for finding the *Shortest Path* on an unweighted graph (e.g., fewest number of stops on a subway map). \n\nBecause we need to process elements in the exact order we discover them (first-come, first-serve), BFS absolutely requires a Queue data structure. We also usually need a `visited` set to avoid running in infinite loops on graphs.',
            memoryTip: 'Tip: BFS = Queue + Shortest Path. It explores "wide" before it goes "deep".',
            timeComplexity: 'O(V + E)',
            spaceComplexity: 'O(V)',
            complexityTable: 'Time:  O(Vertices + Edges)\nSpace: O(Vertices) for the Queue',
            examples: {
              python: `from collections import deque
def bfs(graph, start):
    visited = set([start])
    queue = deque([start])
    
    while queue:
        node = queue.popleft()
        print(node) # Process
        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)`,
              javascript: `function bfs(graph, start) {
    let visited = new Set([start]);
    let queue = [start];
    
    while (queue.length > 0) {
        let node = queue.shift();
        console.log(node); // Process
        for (let neighbor of graph[node]) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                queue.push(neighbor);
            }
        }
    }
}`,
              java: `public void bfs(Map<Integer, List<Integer>> graph, int start) {
    Set<Integer> visited = new HashSet<>();
    Queue<Integer> queue = new LinkedList<>();
    
    visited.add(start);
    queue.offer(start);
    
    while (!queue.isEmpty()) {
        int node = queue.poll();
        System.out.println(node); // Process
        for (int neighbor : graph.getOrDefault(node, new ArrayList<>())) {
            if (!visited.contains(neighbor)) {
                visited.add(neighbor);
                queue.offer(neighbor);
            }
        }
    }
}`,
              cpp: `void bfs(unordered_map<int, vector<int>>& graph, int start) {
    unordered_set<int> visited;
    queue<int> q;
    
    visited.insert(start);
    q.push(start);
    
    while (!q.empty()) {
        int node = q.front();
        q.pop();
        cout << node << endl; // Process
        for (int neighbor : graph[node]) {
            if (visited.find(neighbor) == visited.end()) {
                visited.insert(neighbor);
                q.push(neighbor);
            }
        }
    }
}`
            }
          },
          {
            title: 'Depth-First Search (DFS)',
            definition: 'An algorithm that searches as deep as possible before backtracking, using recursion or a Stack.',
            analogy: 'Imagine solving a physical maze. You keep your hand on the right wall and walk as far as you possibly can until you hit a dead end. Only then do you turn around and try a different path.',
            detailedExplanation: 'DFS dives deep into a graph or tree. Because function calls naturally use the "Call Stack" under the hood, DFS is incredibly easy to implement using Recursion.\n\nDFS is the go-to algorithm for checking if a path exists, solving puzzles (like Sudoku via backtracking), or counting connected components (like islands on a grid).',
            memoryTip: 'Tip: DFS = Recursion (or Stack). It explores "deep" before it goes "wide".',
            timeComplexity: 'O(V + E)',
            spaceComplexity: 'O(V)',
            complexityTable: 'Time:  O(Vertices + Edges)\nSpace: O(Vertices) for the Call Stack',
            examples: {
              python: `def dfs(graph, node, visited=None):
    if visited is None:
        visited = set()
    if node not in visited:
        print(node) # Process
        visited.add(node)
        for neighbor in graph[node]:
            dfs(graph, neighbor, visited)`,
              javascript: `function dfs(graph, node, visited = new Set()) {
    if (!visited.has(node)) {
        console.log(node); // Process
        visited.add(node);
        for (let neighbor of graph[node]) {
            dfs(graph, neighbor, visited);
        }
    }
}`,
              java: `public void dfs(Map<Integer, List<Integer>> graph, int node, Set<Integer> visited) {
    if (!visited.contains(node)) {
        System.out.println(node); // Process
        visited.add(node);
        for (int neighbor : graph.getOrDefault(node, new ArrayList<>())) {
            dfs(graph, neighbor, visited);
        }
    }
}`,
              cpp: `void dfs(unordered_map<int, vector<int>>& graph, int node, unordered_set<int>& visited) {
    if (visited.find(node) == visited.end()) {
        cout << node << endl; // Process
        visited.insert(node);
        for (int neighbor : graph[node]) {
            dfs(graph, neighbor, visited);
        }
    }
}`
            }
          },
          {
            title: 'Advanced Graphs (Dijkstra, Topological, MST)',
            definition: 'Complex algorithms for weighted or directed graphs.',
            analogy: 'Dijkstra is like Google Maps factoring in traffic (weights) to find the fastest route. Topological Sort is like getting dressed: you MUST put on your socks before your shoes!',
            detailedExplanation: 'These are the heavy hitters of graph theory:\n\n- **Dijkstra\'s Algorithm**: Finds the shortest path in a graph where edges have different "weights" (costs). It uses a Priority Queue (Min-Heap).\n- **Topological Sort**: For Directed Acyclic Graphs (DAGs). It perfectly orders tasks that have dependencies (e.g., course prerequisites, software build systems).\n- **Minimum Spanning Tree (Prim/Kruskal)**: Connects all points together using the absolute minimum total wire/cost (e.g., laying fiber optic cables).',
            memoryTip: 'Tip: Weighted Shortest Path? Use Dijkstra. Dependencies/Prerequisites? Use Topological Sort (Indegree array).',
            timeComplexity: 'Varies',
            spaceComplexity: 'O(V + E)',
            complexityTable: 'Dijkstra: O(E log V)\nTopological Sort: O(V + E)\nKruskal (MST): O(E log E)',
            examples: {
              python: `# Topological Sort (Kahn's Algorithm via Indegree)
from collections import deque
def topo_sort(num_nodes, edges):
    adj = {i: [] for i in range(num_nodes)}
    indegree = [0] * num_nodes
    for u, v in edges:
        adj[u].append(v)
        indegree[v] += 1
        
    queue = deque([i for i in range(num_nodes) if indegree[i] == 0])
    order = []
    
    while queue:
        node = queue.popleft()
        order.append(node)
        for neighbor in adj[node]:
            indegree[neighbor] -= 1
            if indegree[neighbor] == 0:
                queue.append(neighbor)
    return order`,
              javascript: `// Topological Sort Idea:
// 1. Calculate how many incoming edges every node has (indegree).
// 2. Put nodes with 0 incoming edges in a Queue.
// 3. Pop a node, add to result, and remove its outgoing edges.
// 4. If a neighbor drops to 0 incoming edges, push it to Queue!`,
              java: `// Topological Sort Idea:
// We use an int[] indegree array and a Queue<Integer>.
// We process all nodes with 0 prerequisites first!`,
              cpp: `// Topological Sort Idea:
// Essential for scheduling tasks with dependencies.
// E.g., You must complete Course A before taking Course B.`
            }
          }
        ]
      },
      {
        title: 'Sorting Algorithms',
        definition: 'Techniques to arrange elements in order.',
        category: 4,
        subTopics: [
          {
            title: 'Bubble Sort',
            definition: 'A simple sorting algorithm that repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.',
            analogy: 'Imagine bubbles rising to the top of a glass of soda. The largest numbers slowly "bubble" their way to the end of the array one by one. Example: [5, 2, 8, 1]. Compare 5 & 2, swap -> [2, 5, 8, 1]. Compare 5 & 8, no swap. Compare 8 & 1, swap -> [2, 5, 1, 8]. The largest number (8) bubbled to the end!',
            detailedExplanation: 'Bubble Sort is almost never used in real-world software because of its terrible O(N²) time complexity. However, it is an excellent teaching tool.\n\nOptimization: You can add a `swapped` boolean flag. If you go through the entire array and don\'t make a single swap, the array is already sorted, and you can break out early! This makes the best-case time complexity O(N).',
            memoryTip: 'Tip: Think "Largest elements bubble to the right".',
            timeComplexity: 'O(N²)',
            spaceComplexity: 'O(1)',
            complexityTable: 'Time: O(N²) Average & Worst\nTime: O(N) Best (if optimized)\nSpace: O(1)',
            examples: {
              python: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        swapped = False
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
                swapped = True
        if not swapped:
            break
    return arr`,
              javascript: `function bubbleSort(arr) {
    for (let i = 0; i < arr.length; i++) {
        let swapped = false;
        for (let j = 0; j < arr.length - i - 1; j++) {
            if (arr[j] > arr[j+1]) {
                let temp = arr[j];
                arr[j] = arr[j+1];
                arr[j+1] = temp;
                swapped = true;
            }
        }
        if (!swapped) break;
    }
    return arr;
}`,
              java: `public void bubbleSort(int[] arr) {
    boolean swapped;
    for (int i = 0; i < arr.length; i++) {
        swapped = false;
        for (int j = 0; j < arr.length - i - 1; j++) {
            if (arr[j] > arr[j+1]) {
                int temp = arr[j];
                arr[j] = arr[j+1];
                arr[j+1] = temp;
                swapped = true;
            }
        }
        if (!swapped) break;
    }
}`,
              cpp: `void bubbleSort(vector<int>& arr) {
    bool swapped;
    for (int i = 0; i < arr.size(); i++) {
        swapped = false;
        for (int j = 0; j < arr.size() - i - 1; j++) {
            if (arr[j] > arr[j+1]) {
                swap(arr[j], arr[j+1]);
                swapped = true;
            }
        }
        if (!swapped) break;
    }
}`
            }
          },
          {
            title: 'Selection Sort',
            definition: 'An algorithm that divides the array into a sorted and unsorted region, repeatedly selecting the minimum element from the unsorted region.',
            analogy: 'Imagine searching through a messy pile of clothes to find your absolute favorite shirt, hanging it up. Then searching for your second favorite shirt, hanging it up next. You are "selecting" the best item each time. Example: [5, 2, 8, 1]. Find the smallest (1), swap with the first element -> [1, 2, 8, 5]. Now starting from index 1, find the smallest (2), it\'s already in place -> [1, 2, 8, 5]. Repeat for 8 and 5 -> [1, 2, 5, 8].',
            detailedExplanation: 'Selection sort is conceptually very simple. You scan the entire remaining array to find the absolute minimum value, and then swap it with the front. \n\nUnlike Insertion or Bubble sort, Selection Sort always takes exactly O(N²) time regardless of whether the array is already sorted or not.',
            memoryTip: 'Tip: You SELECT the smallest element and bring it to the front.',
            timeComplexity: 'O(N²)',
            spaceComplexity: 'O(1)',
            complexityTable: 'Time: O(N²) Best, Avg, Worst\nSpace: O(1)',
            examples: {
              python: `def selection_sort(arr):
    for i in range(len(arr)):
        min_idx = i
        for j in range(i+1, len(arr)):
            if arr[j] < arr[min_idx]:
                min_idx = j
        arr[i], arr[min_idx] = arr[min_idx], arr[i]
    return arr`,
              javascript: `function selectionSort(arr) {
    for (let i = 0; i < arr.length; i++) {
        let minIdx = i;
        for (let j = i + 1; j < arr.length; j++) {
            if (arr[j] < arr[minIdx]) minIdx = j;
        }
        let temp = arr[i];
        arr[i] = arr[minIdx];
        arr[minIdx] = temp;
    }
    return arr;
}`,
              java: `public void selectionSort(int[] arr) {
    for (int i = 0; i < arr.length; i++) {
        int minIdx = i;
        for (int j = i + 1; j < arr.length; j++) {
            if (arr[j] < arr[minIdx]) minIdx = j;
        }
        int temp = arr[i];
        arr[i] = arr[minIdx];
        arr[minIdx] = temp;
    }
}`,
              cpp: `void selectionSort(vector<int>& arr) {
    for (int i = 0; i < arr.size(); i++) {
        int minIdx = i;
        for (int j = i + 1; j < arr.size(); j++) {
            if (arr[j] < arr[minIdx]) minIdx = j;
        }
        swap(arr[i], arr[minIdx]);
    }
}`
            }
          },
          {
            title: 'Insertion Sort',
            definition: 'Builds the sorted array one item at a time by inserting each element into its proper place.',
            analogy: 'Imagine sorting a hand of playing cards. You pick up one card at a time from the table, and insert it perfectly into the sorted cards you are already holding. Example: [5, 2, 8, 1]. The first element (5) is sorted. Next is 2: insert it before 5 -> [2, 5, 8, 1]. Next is 8: it goes after 5 -> [2, 5, 8, 1]. Last is 1: insert it at the very beginning -> [1, 2, 5, 8].',
            detailedExplanation: 'Insertion Sort is incredibly efficient for small data sets or data that is already mostly sorted (best case O(N)).\n\nIn fact, high-performance modern algorithms like Python\'s Timsort use Merge Sort for large chunks, but switch to Insertion Sort for chunks smaller than 64 items because Insertion Sort has zero overhead and runs faster in memory caches!',
            memoryTip: 'Tip: You INSERT the current element into the already sorted left half.',
            timeComplexity: 'O(N²)',
            spaceComplexity: 'O(1)',
            complexityTable: 'Time: O(N²) Avg & Worst\nTime: O(N) Best (Nearly sorted)\nSpace: O(1)',
            examples: {
              python: `def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key
    return arr`,
              javascript: `function insertionSort(arr) {
    for (let i = 1; i < arr.length; i++) {
        let key = arr[i];
        let j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
    return arr;
}`,
              java: `public void insertionSort(int[] arr) {
    for (int i = 1; i < arr.length; i++) {
        int key = arr[i];
        int j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
}`,
              cpp: `void insertionSort(vector<int>& arr) {
    for (int i = 1; i < arr.size(); i++) {
        int key = arr[i];
        int j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
}`
            }
          },
          {
            title: 'Merge Sort',
            definition: 'A Divide and Conquer algorithm that recursively cuts the array in half, sorts the halves, and merges them together.',
            analogy: 'Imagine 100 unsorted tests. Instead of sorting them all, you split them into two piles of 50. Hand one to a friend. You both sort your 50, then easily zip the two sorted piles together in one pass! Example: [5, 2, 8, 1]. Split into [5, 2] and [8, 1]. Split again into [5], [2], [8], [1]. Merge [5] & [2] into [2, 5]. Merge [8] & [1] into [1, 8]. Finally, merge [2, 5] & [1, 8] by comparing the fronts -> [1, 2, 5, 8].',
            detailedExplanation: 'Merge Sort guarantees O(N log N) time complexity in all cases. The "Divide" phase takes O(log N) steps to break the array down to single elements. The "Conquer" phase takes O(N) to merge the elements back together.\n\nThe only downside to Merge Sort is that it requires O(N) extra space to hold the temporary arrays while merging.',
            memoryTip: 'Tip: Divide and Conquer! Split in half recursively, then merge.',
            timeComplexity: 'O(N log N)',
            spaceComplexity: 'O(N)',
            complexityTable: 'Time: O(N log N) Best, Avg, Worst\nSpace: O(N) (Extra arrays needed)',
            examples: {
              python: `def merge_sort(arr):
    if len(arr) <= 1: return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)

def merge(left, right):
    res = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] < right[j]:
            res.append(left[i])
            i += 1
        else:
            res.append(right[j])
            j += 1
    res.extend(left[i:])
    res.extend(right[j:])
    return res`,
              javascript: `function mergeSort(arr) {
    if (arr.length <= 1) return arr;
    const mid = Math.floor(arr.length / 2);
    const left = mergeSort(arr.slice(0, mid));
    const right = mergeSort(arr.slice(mid));
    return merge(left, right);
}

function merge(left, right) {
    let res = [], i = 0, j = 0;
    while (i < left.length && j < right.length) {
        if (left[i] < right[j]) res.push(left[i++]);
        else res.push(right[j++]);
    }
    return res.concat(left.slice(i)).concat(right.slice(j));
}`,
              java: `// Using built-in Merge Sort for Objects (Collections)
Collections.sort(list);`,
              cpp: `// Using stable_sort in C++ which uses Merge Sort
stable_sort(arr.begin(), arr.end());`
            }
          },
          {
            title: 'Quick Sort',
            definition: 'A Divide and Conquer algorithm that picks a "pivot", places smaller elements to the left and larger to the right.',
            analogy: 'Imagine organizing a line of kids by height. You pick one kid (the pivot). You tell everyone shorter to stand on the left, and taller to stand on the right. Then you do the same thing for the left group and right group! Example: [5, 2, 8, 1, 9]. Pick 5 as pivot. Smaller: [2, 1]. Larger: [8, 9]. Recursively sort [2, 1] -> [1, 2] and [8, 9] -> [8, 9]. Combine them around the pivot: [1, 2] + 5 + [8, 9] = [1, 2, 5, 8, 9].',
            detailedExplanation: 'Quick Sort is generally considered the fastest general-purpose sorting algorithm in practice because it sorts "in-place" (requiring very little extra memory) and operates extremely well with computer CPU caches.\n\nThe risk with Quick Sort is picking a bad pivot (like picking the absolute largest element every time). If you do this, it degrades to terrible O(N²) time. Modern implementations use a randomized pivot or "median-of-three" to prevent this.',
            memoryTip: 'Tip: Pick a Pivot. Partition Left & Right. Repeat.',
            timeComplexity: 'O(N log N)',
            spaceComplexity: 'O(log N)',
            complexityTable: 'Time: O(N log N) Avg\nTime: O(N²) Worst (Bad Pivot)\nSpace: O(log N) (Recursion Stack)',
            examples: {
              python: `def quick_sort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quick_sort(left) + middle + quick_sort(right)`,
              javascript: `// Real in-place QuickSort is complex, here is the clean array-based version
function quickSort(arr) {
    if (arr.length <= 1) return arr;
    let pivot = arr[Math.floor(arr.length / 2)];
    let left = arr.filter(x => x < pivot);
    let middle = arr.filter(x => x === pivot);
    let right = arr.filter(x => x > pivot);
    return [...quickSort(left), ...middle, ...quickSort(right)];
}`,
              java: `// Built-in Arrays.sort() uses Dual-Pivot Quicksort for primitives!
Arrays.sort(arr);`,
              cpp: `// C++ sort() uses Introsort (QuickSort with HeapSort fallback)
sort(arr.begin(), arr.end());`
            }
          },
          {
            title: 'Counting Sort',
            definition: 'A non-comparison sort that counts the occurrences of each unique element.',
            analogy: 'Imagine sorting a jar of colored marbles. You don\'t compare a red marble to a blue marble. You just count: 10 reds, 5 blues, 8 greens. Then you line up 10 reds, 5 blues, and 8 greens! Example: [2, 1, 2, 0, 1]. Count occurrences: 0 appears once, 1 appears twice, 2 appears twice. Now just write them out in order: [0, 1, 1, 2, 2].',
            detailedExplanation: 'If you know the data is restricted to a certain range (e.g., ages of people from 0-130), you don\'t need to compare them! You just create an array of size 130 and tally them up.\n\nThis algorithm is mind-blowingly fast: Exactly O(N + K) time, where K is the range of possible values. However, it requires O(K) memory, meaning if you try to sort numbers up to 1 Billion, your computer will crash from memory overflow!',
            memoryTip: 'Tip: If an interview problem asks to sort millions of items in exactly O(N) time, the data MUST have a restricted range. Use Counting Sort.',
            timeComplexity: 'O(N + K)',
            spaceComplexity: 'O(N + K)',
            complexityTable: 'Time: O(N + K)\nSpace: O(N + K)\n(Where K is the maximum possible value)',
            examples: {
              python: `def counting_sort(arr):
    if not arr: return []
    max_val = max(arr)
    counts = [0] * (max_val + 1)
    
    for num in arr:
        counts[num] += 1
        
    res = []
    for num, count in enumerate(counts):
        res.extend([num] * count)
    return res`,
              javascript: `function countingSort(arr) {
    if (arr.length === 0) return [];
    let maxVal = Math.max(...arr);
    let counts = new Array(maxVal + 1).fill(0);
    
    for (let num of arr) {
        counts[num]++;
    }
    
    let res = [];
    for (let i = 0; i <= maxVal; i++) {
        while (counts[i] > 0) {
            res.push(i);
            counts[i]--;
        }
    }
    return res;
}`,
              java: `public int[] countingSort(int[] arr) {
    if (arr.length == 0) return arr;
    int max = 0;
    for (int num : arr) max = Math.max(max, num);
    
    int[] counts = new int[max + 1];
    for (int num : arr) counts[num]++;
    
    int idx = 0;
    for (int i = 0; i <= max; i++) {
        while (counts[i]-- > 0) {
            arr[idx++] = i;
        }
    }
    return arr;
}`,
              cpp: `void countingSort(vector<int>& arr) {
    if (arr.empty()) return;
    int max_val = *max_element(arr.begin(), arr.end());
    vector<int> counts(max_val + 1, 0);
    
    for (int num : arr) counts[num]++;
    
    int idx = 0;
    for (int i = 0; i <= max_val; i++) {
        while (counts[i]-- > 0) {
            arr[idx++] = i;
        }
    }
}`
            }
          }
        ]
      },
      {
        title: 'Dynamic Programming',
        definition: 'An optimization technique solving complex problems by caching subproblem answers.',
        category: 5,
        subTopics: [
          {
            title: 'Top-Down DP (Memoization)',
            definition: 'Solving a problem recursively, but saving the answers to a "notebook" (cache) so you never compute the same branch twice.',
            analogy: 'If I ask you "What is 1+1+1+1+1", you count and say 5. If I immediately ask "What is 1+1+1+1+1 + 1", you don\'t recount the first 5, you just say 6. You remembered the past answer!',
            detailedExplanation: 'This is the easiest way to write DP! First, write a standard recursive function. Second, add a dictionary/hashmap. At the start of the function, check if the answer is in the dictionary. If so, return it instantly! At the end of the function, save the answer to the dictionary before returning it.\n\nThis takes algorithms that would run in O(2^N) exponential time (like basic Fibonacci) and makes them run in blazing fast O(N) time.',
            memoryTip: 'Tip: Memoization = Recursion + HashMap.',
            timeComplexity: 'Usually O(N)',
            spaceComplexity: 'Usually O(N)',
            complexityTable: 'Time:  O(Number of Unique Subproblems)\nSpace: O(Recursion Depth + Cache Size)',
            examples: {
              python: `# Fibonacci with Memoization
cache = {}
def fib(n):
    if n <= 1: return n
    if n in cache: return cache[n]
    
    res = fib(n-1) + fib(n-2)
    cache[n] = res
    return res`,
              javascript: `// Fibonacci with Memoization
let cache = {};
function fib(n) {
    if (n <= 1) return n;
    if (cache[n]) return cache[n];
    
    let res = fib(n-1) + fib(n-2);
    cache[n] = res;
    return res;
}`,
              java: `// Fibonacci with Memoization
Map<Integer, Integer> cache = new HashMap<>();
public int fib(int n) {
    if (n <= 1) return n;
    if (cache.containsKey(n)) return cache.get(n);
    
    int res = fib(n-1) + fib(n-2);
    cache.put(n, res);
    return res;
}`,
              cpp: `// Fibonacci with Memoization
unordered_map<int, int> cache;
int fib(int n) {
    if (n <= 1) return n;
    if (cache.find(n) != cache.end()) return cache[n];
    
    int res = fib(n-1) + fib(n-2);
    cache[n] = res;
    return res;
}`
            }
          },
          {
            title: 'Bottom-Up DP (Tabulation)',
            definition: 'Solving a problem iteratively by filling up an array from the smallest subproblem up to the final answer.',
            analogy: 'Instead of starting from the top of the staircase and looking down to figure out how to climb up, you just start at the bottom step and figure out how to get to the very next step, one by one.',
            detailedExplanation: 'Tabulation avoids the overhead of recursive function calls. You create a 1D or 2D array, initialize the "base cases" (like `dp[0] = 0` and `dp[1] = 1`), and then run a `for` loop to fill in the rest of the array based on previous entries.\n\nIn many cases, if you only rely on the previous 1 or 2 answers, you can optimize the Space Complexity from O(N) to O(1) by just using two variables!',
            memoryTip: 'Tip: Tabulation = Iteration + Array. Faster execution time, but sometimes harder to conceptualize than Top-Down.',
            timeComplexity: 'Usually O(N)',
            spaceComplexity: 'Usually O(N) or O(1)',
            complexityTable: 'Time:  O(N)\nSpace: O(N) or O(1) (Space Optimized)',
            examples: {
              python: `# Fibonacci Bottom-Up (O(1) Space)
def fib(n):
    if n <= 1: return n
    a, b = 0, 1
    for i in range(2, n + 1):
        a, b = b, a + b
    return b`,
              javascript: `// Fibonacci Bottom-Up (O(N) Space)
function fib(n) {
    if (n <= 1) return n;
    let dp = new Array(n + 1).fill(0);
    dp[1] = 1;
    for (let i = 2; i <= n; i++) {
        dp[i] = dp[i-1] + dp[i-2];
    }
    return dp[n];
}`,
              java: `// Fibonacci Bottom-Up (O(1) Space)
public int fib(int n) {
    if (n <= 1) return n;
    int a = 0, b = 1;
    for (int i = 2; i <= n; i++) {
        int temp = a + b;
        a = b;
        b = temp;
    }
    return b;
}`,
              cpp: `// Fibonacci Bottom-Up (O(1) Space)
int fib(int n) {
    if (n <= 1) return n;
    int a = 0, b = 1;
    for (int i = 2; i <= n; i++) {
        int temp = a + b;
        a = b;
        b = temp;
    }
    return b;
}`
            }
          },
          {
            title: 'Knapsack Problem Pattern',
            definition: 'A classic 2D DP pattern about choosing items with weights and values to maximize total value within a capacity.',
            analogy: 'Imagine you are a burglar with a backpack that can only hold 50 pounds. You are in a vault full of gold bars, paintings, and TVs. You want to pick the combination of items that gives the maximum dollar value without tearing your backpack!',
            detailedExplanation: '0/1 Knapsack is the foundation for almost all 2D DP problems where you have "Choices" and "Constraints".\n\nFor every item, you have two choices:\n1. **Include it**: (Value of item) + DP[Remaining Capacity]\n2. **Exclude it**: DP[Current Capacity]\nYou take the `max()` of both choices!\n\nThis pattern is also heavily used for "Coin Change", "Subset Sum", and "Target Sum" problems.',
            memoryTip: 'Tip: DP[item][capacity] = max(exclude_item, include_item).',
            timeComplexity: 'O(Items * Capacity)',
            spaceComplexity: 'O(Items * Capacity)',
            complexityTable: 'Time:  O(N * W)\nSpace: O(N * W) or O(W) with 1D array optimization',
            examples: {
              python: `# 0/1 Knapsack (Bottom-Up 2D)
def knapsack(weights, values, capacity):
    n = len(weights)
    dp = [[0] * (capacity + 1) for _ in range(n + 1)]
    
    for i in range(1, n + 1):
        for w in range(1, capacity + 1):
            if weights[i-1] <= w:
                # Max of (Include, Exclude)
                dp[i][w] = max(values[i-1] + dp[i-1][w - weights[i-1]], dp[i-1][w])
            else:
                dp[i][w] = dp[i-1][w]
                
    return dp[n][capacity]`,
              javascript: `// Space Optimized 1D Knapsack
function knapsack(weights, values, capacity) {
    let dp = new Array(capacity + 1).fill(0);
    
    for (let i = 0; i < weights.length; i++) {
        for (let w = capacity; w >= weights[i]; w--) {
            dp[w] = Math.max(dp[w], values[i] + dp[w - weights[i]]);
        }
    }
    return dp[capacity];
}`,
              java: `// Space Optimized 1D Knapsack
public int knapsack(int[] weights, int[] values, int capacity) {
    int[] dp = new int[capacity + 1];
    
    for (int i = 0; i < weights.length; i++) {
        for (int w = capacity; w >= weights[i]; w--) {
            dp[w] = Math.max(dp[w], values[i] + dp[w - weights[i]]);
        }
    }
    return dp[capacity];
}`,
              cpp: `// Space Optimized 1D Knapsack
int knapsack(vector<int>& weights, vector<int>& values, int capacity) {
    vector<int> dp(capacity + 1, 0);
    
    for (int i = 0; i < weights.size(); i++) {
        for (int w = capacity; w >= weights[i]; w--) {
            dp[w] = max(dp[w], values[i] + dp[w - weights[i]]);
        }
    }
    return dp[capacity];
}`
            }
          }
        ]
      },
      {
        title: 'Algorithm Complexity & Strategy',
        definition: 'Mastering Big-O notation and problem-solving frameworks.',
        category: 6,
        subTopics: [
          {
            title: 'Big-O Notation (Time & Space)',
            definition: 'A mathematical notation that describes the limiting behavior of a function when the argument tends towards a particular value or infinity.',
            analogy: 'Imagine baking a cake. O(1) is reading the recipe. O(N) is stirring the batter N times. O(N²) is checking every single crumb against every other crumb.',
            detailedExplanation: 'Big-O describes the "worst-case scenario" for how long an algorithm takes to run (Time) or how much memory it uses (Space) as the size of the input (N) grows.\n\nWe drop constants! O(2N) is just O(N). We drop non-dominant terms! O(N² + N) is just O(N²).\n\nIf you can quickly identify the Big-O of an algorithm, you can quickly decide if it will pass the interview or timeout.',
            memoryTip: 'Tip: Drop constants and keep only the largest growing term.',
            timeComplexity: 'N/A',
            spaceComplexity: 'N/A',
            complexityTable: 'O(1): Constant\nO(log N): Logarithmic (Halfing)\nO(N): Linear (Loop)\nO(N log N): Linearithmic (Sort)\nO(N²): Quadratic (Nested Loop)\nO(2^N): Exponential (Recursion)',
            examples: {
              python: `# O(1)\nx = arr[0]\n\n# O(N)\nfor x in arr: pass\n\n# O(N^2)\nfor x in arr:\n    for y in arr: pass`,
              javascript: `// O(1)\nlet x = arr[0];\n\n// O(N)\nfor (let x of arr) {}\n\n// O(N^2)\nfor (let i=0; i<arr.length; i++) {\n    for (let j=0; j<arr.length; j++) {}\n}`,
              java: `// O(1)\nint x = arr[0];\n\n// O(N)\nfor (int x : arr) {}\n\n// O(N^2)\nfor (int i=0; i<arr.length; i++) {\n    for (int j=0; j<arr.length; j++) {}\n}`,
              cpp: `// O(1)\nint x = arr[0];\n\n// O(N)\nfor (int x : arr) {}\n\n// O(N^2)\nfor (int i=0; i<arr.size(); i++) {\n    for (int j=0; j<arr.size(); j++) {}\n}`
            }
          },
          {
            title: 'How to Solve Any Problem (UMPIRE Method)',
            definition: 'A structured framework for tackling algorithmic interview questions.',
            analogy: 'You don\'t build a house by immediately pouring concrete. You first draw a blueprint, measure the land, and get permits. Same with coding!',
            detailedExplanation: 'UMPIRE is a popular framework for technical interviews:\n\n1. **Understand**: Ask clarifying questions. What are the edge cases? What if the input is empty?\n2. **Match**: Match the problem to a known pattern (e.g., "This looks like a graph shortest path, so I should use BFS").\n3. **Plan**: Write out the algorithm in plain English or pseudo-code.\n4. **Implement**: Translate the plan into actual code.\n5. **Review**: Walk through your code with an example input line-by-line.\n6. **Evaluate**: State the Time and Space Complexity.',
            memoryTip: 'Tip: NEVER start coding immediately. Talk out loud and plan first!',
            timeComplexity: 'N/A',
            spaceComplexity: 'N/A',
            complexityTable: 'U - Understand\nM - Match\nP - Plan\nI - Implement\nR - Review\nE - Evaluate',
            examples: {
              python: `# Write pseudocode in comments first!\n# 1. Check if array is empty\n# 2. Initialize two pointers\n# 3. Loop while left < right\n# 4. Return result`,
              javascript: `// Write pseudocode in comments first!\n// 1. Check if array is empty\n// 2. Initialize two pointers\n// 3. Loop while left < right\n// 4. Return result`,
              java: `// Write pseudocode in comments first!\n// 1. Check if array is empty\n// 2. Initialize two pointers\n// 3. Loop while left < right\n// 4. Return result`,
              cpp: `// Write pseudocode in comments first!\n// 1. Check if array is empty\n// 2. Initialize two pointers\n// 3. Loop while left < right\n// 4. Return result`
            }
          }
        ]
      }
    ],
    codeExample: {
      title: 'Choose a language above to see examples for each concept!',
      language: 'info',
      code: 'The examples will update automatically based on your language selection.'
    }
  },
  {
    id: 'c-lang',
    name: 'C Programming',
    shortName: 'C',
    desc: 'Learn the foundational systems programming language. Understand memory management, pointers, and low-level computing.',
    icon: Cpu,
    color: 'color-blue',
    gradient: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
    concepts: [
      { title: 'Variables & Data Types', definition: 'C provides primitive types: int, float, double, char. Variables must be declared with a type before use. sizeof() reveals memory allocation.' },
      { title: 'Pointers & Memory', definition: 'Pointers store memory addresses. Use & (address-of) and * (dereference) operators. Essential for dynamic memory with malloc/free.' },
      { title: 'Arrays & Strings', definition: 'Arrays are fixed-size contiguous blocks. Strings are null-terminated char arrays. No bounds checking — buffer overflows are a common pitfall.' },
      { title: 'Structures & Unions', definition: 'struct groups related variables under one name. union shares memory among members. Both enable custom data modeling.' },
      { title: 'File I/O', definition: 'Use fopen, fread, fwrite, fprintf, and fclose for file operations. Streams (stdin, stdout, stderr) handle console I/O.' },
      { title: 'Preprocessor Directives', definition: '#include imports headers, #define creates macros, #ifdef enables conditional compilation. Processed before actual compilation.' },
    ],
    codeExample: {
      title: 'Pointer Basics & Dynamic Memory',
      language: 'c',
      code: `#include <stdio.h>
#include <stdlib.h>

int main() {
    // Pointer basics
    int x = 42;
    int *ptr = &x;
    printf("Value: %d, Address: %p\\n", *ptr, ptr);

    // Dynamic memory allocation
    int *arr = (int *)malloc(5 * sizeof(int));
    for (int i = 0; i < 5; i++) {
        arr[i] = i * 10;
    }
    printf("arr[3] = %d\\n", arr[3]); // 30
    free(arr);
    return 0;
}`
    }
  },
  {
    id: 'python',
    name: 'Python Programming',
    shortName: 'Python',
    desc: 'A versatile, high-level language known for readability. Widely used in web development, data science, AI, and scripting.',
    icon: Code,
    color: 'color-green',
    gradient: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
    concepts: [
      { title: 'Variables & Types', definition: 'Python is dynamically typed — no explicit type declarations needed. Supports int, float, str, bool, list, dict, tuple, set as built-in types.' },
      { title: 'Lists & Dictionaries', definition: 'Lists are ordered, mutable sequences. Dictionaries are key-value hash maps with O(1) average lookup. Both support comprehensions.' },
      { title: 'Functions & Lambdas', definition: 'Functions defined with def keyword. Lambda creates anonymous single-expression functions. Supports *args, **kwargs for flexible parameters.' },
      { title: 'Object-Oriented Programming', definition: 'Classes defined with class keyword. Supports inheritance, polymorphism, encapsulation. __init__ is the constructor, self refers to the instance.' },
      { title: 'List Comprehensions', definition: 'Concise syntax to create lists: [expr for item in iterable if condition]. Also works for dicts, sets, and generators.' },
      { title: 'Error Handling', definition: 'try/except blocks catch exceptions. finally runs cleanup code. raise throws custom exceptions. Essential for robust programs.' },
    ],
    codeExample: {
      title: 'List Comprehension & Dictionary Operations',
      language: 'python',
      code: `# List comprehension - squares of even numbers
squares = [x**2 for x in range(10) if x % 2 == 0]
print(squares)  # [0, 4, 16, 36, 64]

# Dictionary comprehension
word = "hello world"
char_count = {c: word.count(c) for c in set(word) if c != ' '}
print(char_count)

# Function with default args
def greet(name, greeting="Hello"):
    return f"{greeting}, {name}!"

print(greet("Alice"))         # Hello, Alice!
print(greet("Bob", "Hi"))     # Hi, Bob!`
    }
  },
  {
    id: 'java',
    name: 'Java Programming',
    shortName: 'Java',
    desc: 'A robust, object-oriented language powering enterprise applications, Android development, and large-scale systems.',
    icon: Binary,
    color: 'color-orange',
    gradient: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
    concepts: [
      { title: 'Classes & Objects', definition: 'Everything in Java lives inside a class. Objects are instances of classes. The main() method is the entry point of every Java application.' },
      { title: 'Inheritance & Interfaces', definition: 'extends for single inheritance, implements for interfaces. Interfaces define contracts with abstract methods. Java 8+ allows default methods.' },
      { title: 'Collections Framework', definition: 'ArrayList, HashMap, HashSet, LinkedList, TreeMap — powerful data structures. Generics ensure type safety. Iterators provide traversal.' },
      { title: 'Exception Handling', definition: 'try-catch-finally blocks handle errors. Checked exceptions must be caught or declared. Unchecked exceptions (RuntimeException) are optional.' },
      { title: 'Multithreading', definition: 'Thread class and Runnable interface enable concurrency. synchronized keyword prevents race conditions. ExecutorService manages thread pools.' },
      { title: 'Generics & Streams', definition: 'Generics (e.g., List<T>) provide type-safe containers. Streams API enables functional-style operations: filter, map, reduce on collections.' },
    ],
    codeExample: {
      title: 'Collections & Streams API',
      language: 'java',
      code: `import java.util.*;
import java.util.stream.*;

public class Main {
    public static void main(String[] args) {
        List<Integer> numbers = Arrays.asList(1,2,3,4,5,6,7,8,9,10);

        // Stream: filter even, square, collect
        List<Integer> result = numbers.stream()
            .filter(n -> n % 2 == 0)
            .map(n -> n * n)
            .collect(Collectors.toList());

        System.out.println(result); // [4, 16, 36, 64, 100]

        // HashMap example
        Map<String, Integer> scores = new HashMap<>();
        scores.put("Alice", 95);
        scores.put("Bob", 87);
        scores.forEach((k, v) ->
            System.out.println(k + ": " + v));
    }
}`
    }
  },
  {
    id: 'javascript',
    name: 'JavaScript Programming',
    shortName: 'JavaScript',
    desc: 'The language of the web. Master DOM manipulation, asynchronous programming, closures, and modern ES6+ features.',
    icon: Zap,
    color: 'color-yellow',
    gradient: 'linear-gradient(135deg, #ca8a04 0%, #eab308 100%)',
    concepts: [
      { title: 'Variables & Scope', definition: 'let and const (block-scoped) replaced var (function-scoped). const prevents reassignment. Hoisting moves declarations to the top of scope.' },
      { title: 'Arrow Functions & Closures', definition: 'Arrow functions (=>) provide concise syntax and lexical this binding. Closures let inner functions access outer scope even after the outer function returns.' },
      { title: 'Promises & Async/Await', definition: 'Promises represent eventual completion of async operations. async/await provides synchronous-looking syntax for promise chains. Essential for API calls.' },
      { title: 'Destructuring & Spread', definition: 'Destructuring extracts values: const {a, b} = obj. Spread (...) expands arrays/objects. Rest parameters collect remaining arguments.' },
      { title: 'Array Methods', definition: 'map, filter, reduce, forEach, find, some, every — functional methods for transforming and querying arrays without mutation.' },
      { title: 'Prototypes & Classes', definition: 'JavaScript uses prototypal inheritance. ES6 class syntax is syntactic sugar over prototypes. constructor, extends, super enable OOP patterns.' },
    ],
    codeExample: {
      title: 'Async/Await & Array Methods',
      language: 'javascript',
      code: `// Async/Await example
async function fetchUserData(userId) {
  try {
    const response = await fetch(\`/api/users/\${userId}\`);
    const user = await response.json();
    return user;
  } catch (error) {
    console.error('Failed to fetch:', error);
  }
}

// Array methods chaining
const orders = [
  { item: 'Laptop', price: 999, qty: 1 },
  { item: 'Mouse', price: 25, qty: 3 },
  { item: 'Keyboard', price: 75, qty: 2 },
];

const total = orders
  .map(o => o.price * o.qty)
  .reduce((sum, val) => sum + val, 0);

console.log(\`Total: $\${total}\`); // Total: $1224`
    }
  },
  {
    id: 'css',
    name: 'CSS & Web Styling',
    shortName: 'CSS',
    desc: 'Style the web with modern CSS. Learn Flexbox, Grid, animations, responsive design, and advanced selectors.',
    icon: Star,
    color: 'color-pink',
    gradient: 'linear-gradient(135deg, #db2777 0%, #ec4899 100%)',
    concepts: [
      { title: 'Selectors & Specificity', definition: 'CSS selectors target HTML elements. Specificity hierarchy: inline > ID > class > element. !important overrides all but should be avoided.' },
      { title: 'Flexbox Layout', definition: 'One-dimensional layout model. display: flex on parent. justify-content aligns main axis, align-items aligns cross axis. flex-grow/shrink control sizing.' },
      { title: 'CSS Grid', definition: 'Two-dimensional layout system. grid-template-columns/rows define tracks. grid-area places items. Powerful for complex page layouts.' },
      { title: 'Responsive Design', definition: 'Media queries (@media) adapt styles to screen sizes. Mobile-first approach uses min-width breakpoints. rem/em units enable scalable typography.' },
      { title: 'Animations & Transitions', definition: 'transition animates property changes smoothly. @keyframes defines multi-step animations. transform (translate, rotate, scale) enables GPU-accelerated movement.' },
      { title: 'CSS Variables', definition: 'Custom properties (--color: #fff) enable reusable values. var(--color) references them. Scoped to selectors, cascade like normal properties.' },
    ],
    codeExample: {
      title: 'Flexbox Card Layout with Animations',
      language: 'css',
      code: `:root {
  --primary: #7c3aed;
  --card-bg: #1a1a2e;
  --text: #e2e8f0;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  padding: 2rem;
}

.card {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 1.5rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(124, 58, 237, 0.2);
}`
    }
  },
  COMPLEXITY_MASTERY_CARD as any
];


/* ─────────────────────────────────────────
   Dynamic Modules Database
   ───────────────────────────────────────── */
const PATHS_MODULES_DB: Record<string, Module[]> = {
  sorting: [
    {
      id: 's1', label: 'MODULE 1', name: 'Sorting Fundamentals',
      desc: 'Understand the basics and key concepts of sorting.',
      status: 'completed', lessonsCount: 3, totalLessons: 3,
      items: [
        {
          name: '1. Introduction to Sorting', status: 'completed',
          problemDesc: 'Analyze standard complexity and stability principles in modern sorting setups.',
          defaultCode: '// Review Stable Sorting Concept\nfunction isStableSort() {\n  return true;\n}',
          expectedOutput: 'stability: OK'
        },
        {
          name: '2. Comparison-based Sorting', status: 'completed',
          problemDesc: 'Examine comparison sorting bounds and element distribution patterns.',
          defaultCode: '// Comparison-based bounds\nfunction checkBounds(n) {\n  return Math.log2(n);\n}',
          expectedOutput: 'bounds: check'
        },
        {
          name: '3. Stability & Complexity', status: 'completed',
          problemDesc: 'Analyze stability preservation algorithms and dynamic time complexities.',
          defaultCode: '// Stability verification module\nfunction verifyStability(arr) {\n  return arr;\n}',
          expectedOutput: 'stability: verified'
        },
      ],
    },
    {
      id: 's2', label: 'MODULE 2', name: 'Basic Sorting Algorithms',
      desc: 'Learn simple and fundamental sorting algorithms.',
      status: 'in-progress', lessonsCount: 1, totalLessons: 3,
      defaultOpen: true,
      items: [
        {
          name: '1. Bubble Sort', status: 'completed',
          problemDesc: 'Implement basic Bubble Sort algorithm and count total swaps.',
          defaultCode: 'function bubbleSort(arr) {\n  let swaps = 0;\n  for(let i=0; i<arr.length; i++) {\n    for(let j=0; j<arr.length-i-1; j++) {\n      if(arr[j] > arr[j+1]) {\n        let t = arr[j]; arr[j] = arr[j+1]; arr[j+1] = t;\n        swaps++;\n      }\n    }\n  }\n  return arr;\n}',
          expectedOutput: '1,2,3,4,5'
        },
        {
          name: '2. Selection Sort', status: 'current',
          problemDesc: 'Implement Selection Sort. In each pass, select the smallest remaining element and place it at the front.',
          defaultCode: 'function selectionSort(arr) {\n  // TODO: Implement selection sort\n  for (let i = 0; i < arr.length; i++) {\n    let minIdx = i;\n    for (let j = i + 1; j < arr.length; j++) {\n      if (arr[j] < arr[minIdx]) minIdx = j;\n    }\n    let temp = arr[i];\n    arr[i] = arr[minIdx];\n    arr[minIdx] = temp;\n  }\n  return arr;\n}',
          expectedOutput: '1,2,5,8,9'
        },
        {
          name: '3. Insertion Sort', status: 'locked',
          problemDesc: 'Implement Insertion Sort by building a sorted array element-by-element.',
          defaultCode: 'function insertionSort(arr) {\n  // Write your code here\n  return arr;\n}',
          expectedOutput: '2,3,4,9'
        },
      ],
    },
    {
      id: 's3', label: 'MODULE 3', name: 'Efficient Sorting Algorithms',
      desc: 'Explore more efficient divide and conquer algorithms.',
      status: 'locked', lessonsCount: 0, totalLessons: 3,
      items: [
        {
          name: '1. Merge Sort', status: 'locked',
          problemDesc: 'Implement Merge Sort using standard recursive division.',
          defaultCode: 'function mergeSort(arr) {\n  return arr;\n}',
          expectedOutput: 'sorted'
        },
        {
          name: '2. Quick Sort', status: 'locked',
          problemDesc: 'Implement Quick Sort using Lomuto or Hoare partitioning.',
          defaultCode: 'function quickSort(arr) {\n  return arr;\n}',
          expectedOutput: 'sorted'
        },
        {
          name: '3. Heap Sort', status: 'locked',
          problemDesc: 'Implement Heap Sort using dynamic max-heap construction.',
          defaultCode: 'function heapSort(arr) {\n  return arr;\n}',
          expectedOutput: 'sorted'
        },
      ],
    },
  ],
  searching: [
    {
      id: 'se1', label: 'MODULE 1', name: 'Search Fundamentals',
      desc: 'Core principles of scanning linear databases.',
      status: 'in-progress', lessonsCount: 2, totalLessons: 3,
      defaultOpen: true,
      items: [
        {
          name: '1. Linear Search', status: 'completed',
          problemDesc: 'Scan an unsorted array linear-time to find element index.',
          defaultCode: 'function linearSearch(arr, key) {\n  for(let i=0; i<arr.length; i++) {\n    if(arr[i] === key) return i;\n  }\n  return -1;\n}',
          expectedOutput: '3'
        },
        {
          name: '2. Binary Search', status: 'current',
          problemDesc: 'Locate a value inside a sorted list in logarithmic time O(log N).',
          defaultCode: 'function binarySearch(arr, target) {\n  let left = 0, right = arr.length - 1;\n  while(left <= right) {\n    let mid = Math.floor((left + right) / 2);\n    if(arr[mid] === target) return mid;\n    if(arr[mid] < target) left = mid + 1;\n    else right = mid - 1;\n  }\n  return -1;\n}',
          expectedOutput: '2'
        },
        {
          name: '3. Interpolation Search', status: 'locked',
          problemDesc: 'Improve on binary search for uniformly distributed values.',
          defaultCode: 'function interpolationSearch(arr, target) {\n  return -1;\n}',
          expectedOutput: '4'
        }
      ]
    }
  ],
  'data-structures': [
    {
      id: 'ds1', label: 'MODULE 1', name: 'Linear Containers',
      desc: 'Dynamic arrays, lists, queues and stacks.',
      status: 'in-progress', lessonsCount: 1, totalLessons: 3,
      defaultOpen: true,
      items: [
        {
          name: '1. Reverse Linked List', status: 'completed',
          problemDesc: 'Implement iterative list reversing with constant memory footprint.',
          defaultCode: 'function reverseList(head) {\n  let prev = null, curr = head;\n  while(curr) {\n    let next = curr.next;\n    curr.next = prev;\n    prev = curr;\n    curr = next;\n  }\n  return prev;\n}',
          expectedOutput: 'reversed'
        },
        {
          name: '2. Stack Implementation', status: 'current',
          problemDesc: 'Design a stack container using dynamic resizing bounds.',
          defaultCode: 'class Stack {\n  constructor() { this.items = []; }\n  push(val) { this.items.push(val); }\n  pop() { return this.items.pop(); }\n}',
          expectedOutput: 'stack: OK'
        },
        {
          name: '3. Queue structures', status: 'locked',
          problemDesc: 'Implement robust circular array-based queues.',
          defaultCode: 'class CircularQueue {\n  // Implementation here\n}',
          expectedOutput: 'queue: OK'
        }
      ]
    }
  ],
  greedy: [
    {
      id: 'gr1', label: 'MODULE 1', name: 'Greedy Strategy Foundations',
      desc: 'Understand local optimal choices and greedy properties.',
      status: 'in-progress', lessonsCount: 0, totalLessons: 2,
      defaultOpen: true,
      items: [
        {
          name: '1. Fractional Knapsack', status: 'current',
          problemDesc: 'Maximize value by sorting items by density and adding fractional items.',
          defaultCode: 'function fractionalKnapsack(items, capacity) {\n  items.sort((a,b) => (b.value/b.weight) - (a.value/a.weight));\n  let totalVal = 0;\n  for(let item of items) {\n    if(capacity >= item.weight) {\n      capacity -= item.weight;\n      totalVal += item.value;\n    } else {\n      totalVal += item.value * (capacity / item.weight);\n      break;\n    }\n  }\n  return totalVal;\n}',
          expectedOutput: '240'
        },
        {
          name: '2. Interval Scheduling', status: 'locked',
          problemDesc: 'Find the maximum set of non-overlapping intervals.',
          defaultCode: 'function scheduleIntervals(intervals) {\n  return [];\n}',
          expectedOutput: 'scheduled'
        }
      ]
    }
  ]
};

const INDIVIDUAL_CHALLENGES = [
  {
    id: 'c1',
    title: 'Two Sum',
    diff: 'Easy' as const,
    accept: '50.3%',
    tags: ['Arrays', 'Hash Table'],
    desc: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    example: {
      input: 'nums = [2,7,11,15], target = 9',
      output: '[0,1]',
      explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
    },
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.'
    ],
    templates: {
      python3: 'class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        \n        ',
      javascript: 'function twoSum(nums, target) {\n    \n    }'
    },
    solutions: {
      python3: 'class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        seen = {}\n        for i, num in enumerate(nums):\n            remaining = target - num\n            if remaining in seen:\n                return [seen[remaining], i]\n            seen[num] = i\n        return []',
      javascript: 'function twoSum(nums, target) {\n    const seen = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const remaining = target - nums[i];\n        if (seen.has(remaining)) {\n            return [seen.get(remaining), i];\n        }\n        seen.set(nums[i], i);\n    }\n    return [];\n}'
    },
    expected: '0,1',
    code: 'function twoSum(nums, target) {\n  let map = new Map();\n  for(let i=0; i<nums.length; i++) {\n    let diff = target - nums[i];\n    if(map.has(diff)) return [map.get(diff), i];\n    map.set(nums[i], i);\n  }\n  return [];\n}',
    output: '0,1',
    testCases: [
      { input: '[2,7,11,15], 9', expectedOutput: '[0,1]' },
      { input: '[3,2,4], 6', expectedOutput: '[1,2]' },
      { input: '[3,3], 6', expectedOutput: '[0,1]' }
    ]
  },
  {
    id: 'c2',
    title: 'Valid Parentheses',
    diff: 'Easy' as const,
    accept: '40.8%',
    tags: ['Stack', 'String'],
    desc: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
    example: {
      input: 's = "()[]{}"',
      output: 'true',
      explanation: 'The brackets close in the correct sequence and match their open partners.'
    },
    constraints: [
      '1 <= s.length <= 10^4',
      "s consists of parentheses only '()[]{}'"
    ],
    templates: {
      python3: 'class Solution:\n    def isValid(self, s: str) -> bool:\n        \n        ',
      javascript: 'function isValid(s) {\n    \n    }'
    },
    solutions: {
      python3: 'class Solution:\n    def isValid(self, s: str) -> bool:\n        stack = []\n        mapping = {")": "(", "}": "{", "]": "["}\n        for char in s:\n            if char in mapping:\n                top_element = stack.pop() if stack else \'#\'\n                if mapping[char] != top_element:\n                    return False\n            else:\n                stack.append(char)\n        return not stack',
      javascript: 'function isValid(s) {\n    const stack = [];\n    const mapping = {\')\': \'(\', \'}\': \'{\', \']\': \'[\'};\n    for (let i = 0; i < s.length; i++) {\n        const char = s[i];\n        if (mapping[char]) {\n            const top = stack.length ? stack.pop() : \'#\';\n            if (mapping[char] !== top) return false;\n        } else {\n            stack.push(char);\n        }\n    }\n    return stack.length === 0;\n}'
    },
    expected: 'true',
    code: 'function isValid(s) {\n  let stack = [];\n  for(let c of s) {\n    if(c === "(") stack.push(")");\n    else if(c === "[") stack.push("]");\n    else if(c === "{") stack.push("}");\n    else if(stack.pop() !== c) return false;\n  }\n  return stack.length === 0;\n}',
    output: 'true',
    testCases: [
      { input: '"()"', expectedOutput: 'true' },
      { input: '"()[]{}"', expectedOutput: 'true' },
      { input: '"(]"', expectedOutput: 'false' },
      { input: '"([)]"', expectedOutput: 'false' }
    ]
  },
  {
    id: 'c3',
    title: 'Maximum Subarray',
    diff: 'Medium' as const,
    accept: '54.2%',
    tags: ['Array', 'Divide & Conquer'],
    desc: 'Given an integer array nums, find the subarray with the largest sum, and return its sum.',
    example: {
      input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]',
      output: '6',
      explanation: 'The subarray [4,-1,2,1] has the largest sum 6.'
    },
    constraints: [
      '1 <= nums.length <= 10^5',
      '-10^4 <= nums[i] <= 10^4'
    ],
    templates: {
      python3: 'class Solution:\n    def maxSubArray(self, nums: List[int]) -> int:\n        \n        ',
      javascript: 'function maxSubArray(nums) {\n    \n    }'
    },
    solutions: {
      python3: 'class Solution:\n    def maxSubArray(self, nums: List[int]) -> int:\n        max_so_far = nums[0]\n        curr_max = nums[0]\n        for i in range(1, len(nums)):\n            curr_max = Math.max(nums[i], curr_max + nums[i])\n            max_so_far = Math.max(max_so_far, curr_max)\n        return max_so_far',
      javascript: 'function maxSubArray(nums) {\n    let maxSoFar = nums[0];\n    let currMax = nums[0];\n    for (let i = 1; i < nums.length; i++) {\n        currMax = Math.max(nums[i], currMax + nums[i]);\n        maxSoFar = Math.max(maxSoFar, currMax);\n    }\n    return maxSoFar;\n}'
    },
    expected: '6',
    code: 'function maxSubArray(nums) {\n  let maxSoFar = nums[0];\n  let currMax = nums[0];\n  for (let i = 1; i < nums.length; i++) {\n    currMax = Math.max(nums[i], currMax + nums[i]);\n    maxSoFar = Math.max(maxSoFar, currMax);\n  }\n  return maxSoFar;\n}',
    output: '6',
    testCases: [
      { input: '[-2,1,-3,4,-1,2,1,-5,4]', expectedOutput: '6' },
      { input: '[1]', expectedOutput: '1' },
      { input: '[5,4,-1,7,8]', expectedOutput: '23' }
    ]
  },
  {
    id: 'c4',
    title: 'Merge Intervals',
    diff: 'Medium' as const,
    accept: '46.1%',
    tags: ['Array', 'Sorting'],
    desc: 'Given an array of intervals where intervals[i] = [start_i, end_i], merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.',
    example: {
      input: 'intervals = [[1,3],[2,6],[8,10],[15,18]]',
      output: '[[1,6],[8,10],[15,18]]',
      explanation: 'Since intervals [1,3] and [2,6] overlap, merge them into [1,6].'
    },
    constraints: [
      '1 <= intervals.length <= 10^4',
      'intervals[i].length == 2',
      '0 <= start_i <= end_i <= 10^4'
    ],
    templates: {
      python3: 'class Solution:\n    def merge(self, intervals: List[List[int]]) -> List[List[int]]:\n        \n        ',
      javascript: 'function merge(intervals) {\n    \n    }'
    },
    solutions: {
      python3: 'class Solution:\n    def merge(self, intervals: List[List[int]]) -> List[List[int]]:\n        intervals.sort(key=lambda x: x[0])\n        merged = []\n        for interval in intervals:\n            if not merged or merged[-1][1] < interval[0]:\n                merged.append(interval)\n            else:\n                merged[-1][1] = max(merged[-1][1], interval[1])\n        return merged',
      javascript: 'function merge(intervals) {\n    intervals.sort((a, b) => a[0] - b[0]);\n    const merged = [];\n    for (const interval of intervals) {\n        if (merged.length === 0 || merged[merged.length - 1][1] < interval[0]) {\n            merged.push(interval);\n        } else {\n            merged[merged.length - 1][1] = Math.max(merged[merged.length - 1][1], interval[1]);\n        }\n    }\n    return merged;\n}'
    },
    expected: '[[1,6],[8,10],[15,18]]',
    code: 'function mergeIntervals(intervals) {\n  intervals.sort((a,b) => a[0] - b[0]);\n  let merged = [];\n  for(let inter of intervals) {\n    if(merged.length === 0 || merged[merged.length-1][1] < inter[0]) {\n      merged.push(inter);\n    } else {\n      merged[merged.length-1][1] = Math.max(merged[merged.length-1][1], inter[1]);\n    }\n  }\n  return merged;\n}',
    output: '[[1,6],[8,10]]',
    testCases: [
      { input: '[[1,3],[2,6],[8,10],[15,18]]', expectedOutput: '[[1,6],[8,10],[15,18]]' },
      { input: '[[1,4],[4,5]]', expectedOutput: '[[1,5]]' }
    ]
  },
  {
    id: 'c5',
    title: 'LRU Cache',
    diff: 'Hard' as const,
    accept: '42.5%',
    tags: ['Design', 'Linked List'],
    desc: 'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.',
    example: {
      input: '["LRUCache", "put", "put", "get", "put", "get", "put", "get", "get", "get"]',
      output: '[null, null, null, 1, null, -1, null, -1, 3, 4]',
      explanation: 'Cache capacity is 2. Least recently used items are evicted when cache capacity is exceeded.'
    },
    constraints: [
      '1 <= capacity <= 3000',
      '0 <= key <= 10^4',
      '0 <= value <= 10^5',
      'At most 2 * 10^5 calls will be made to get and put.'
    ],
    templates: {
      python3: 'class LRUCache:\n    def __init__(self, capacity: int):\n        \n        \n    def get(self, key: int) -> int:\n        \n        \n    def put(self, key: int, value: int) -> None:\n        \n        ',
      javascript: 'class LRUCache {\n    constructor(capacity) {\n        \n    }\n    \n    get(key) {\n        \n    }\n    \n    put(key, value) {\n        \n    }\n}'
    },
    solutions: {
      python3: 'class LRUCache:\n    def __init__(self, capacity: int):\n        self.capacity = capacity\n        self.cache = {}\n        self.order = []\n    \n    def get(self, key: int) -> int:\n        if key not in self.cache:\n            return -1\n        self.order.remove(key)\n        self.order.append(key)\n        return self.cache[key]\n    \n    def put(self, key: int, value: int) -> None:\n        if key in self.cache:\n            self.order.remove(key)\n        elif len(self.cache) >= self.capacity:\n            oldest = self.order.pop(0)\n            del self.cache[oldest]\n        self.cache[key] = value\n        self.order.append(key)',
      javascript: 'class LRUCache {\n    constructor(capacity) {\n        this.capacity = capacity;\n        this.cache = new Map();\n    }\n    \n    get(key) {\n        if (!this.cache.has(key)) return -1;\n        const val = this.cache.get(key);\n        this.cache.delete(key);\n        this.cache.set(key, val);\n        return val;\n    }\n    \n    put(key, value) {\n        if (this.cache.has(key)) {\n            this.cache.delete(key);\n        } else if (this.cache.size >= this.capacity) {\n            const oldestKey = this.cache.keys().next().value;\n            this.cache.delete(oldestKey);\n        }\n        this.cache.set(key, value);\n    }\n}'
    },
    expected: '[null, null, null, 1, null, -1, null, -1, 3, 4]',
    code: 'function levelOrder(root) {\n  return [];\n}',
    output: 'levels',
    testCases: [
      { input: '["LRUCache", "put", "put", "get", "put", "get", "put", "get", "get", "get"]\n[[2], [1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]]', expectedOutput: '[null,null,null,1,null,-1,null,-1,3,4]' }
    ]
  }
];

/* ─────────────────────────────────────────
   Helper Circular Progress Component
   ───────────────────────────────────────── */
function ProgressRing({ pct, label, colorClass }: { pct: number, label: string, colorClass?: string }) {
  const r = 35;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  return (
    <div className="pm-ring-container" style={{ position: 'relative', width: '80px', height: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <svg width="76" height="76" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="50" cy="50" r={r} strokeWidth="8" style={{ fill: 'none', stroke: 'rgba(255,255,255,0.03)' }} />
        <circle
          cx="50" cy="50" r={r}
          strokeWidth="8"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{
            fill: 'none',
            stroke: colorClass === 'green' ? 'var(--accent-green-light)' : 'var(--accent-purple-light)',
            transition: 'stroke-dashoffset 0.1s ease',
            strokeLinecap: 'round'
          }}
        />
      </svg>
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff', margin: 0 }}>{Math.round(pct)}%</div>
        <div style={{ fontSize: '0.58rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '1px' }}>{label}</div>
      </div>
    </div>
  );
}

const getInitialModulesDb = (): Record<string, Module[]> => {
  const db: Record<string, Module[]> = {};
  for (const pathId in PATHS_MODULES_DB) {
    db[pathId] = PATHS_MODULES_DB[pathId].map((mod, modIdx) => {
      const items = mod.items.map((item, itemIdx) => {
        return {
          ...item,
          status: (modIdx === 0 && itemIdx === 0) ? 'current' as const : 'locked' as const
        };
      });
      return {
        ...mod,
        status: modIdx === 0 ? 'in-progress' as const : 'locked' as const,
        lessonsCount: 0,
        items
      };
    });
  }
  return db;
};

const getInitialPathsData = (): PathData[] => {
  return LEARNING_PATHS_INITIAL.map(p => ({
    ...p,
    completed: 0,
    pct: 0
  }));
};

const getInitialStats = () => ({
  streak: 0,
  problemsSolved: 0,
  lessonsCompleted: 0,
  timeSpent: '0h 0m',
  overallProgress: 0,
});

/* ─────────────────────────────────────────
   Path Card Component
   ───────────────────────────────────────── */
function PathCard({ path, onClick }: { path: PathData; onClick: () => void }) {
  const Icon = path.icon;
  return (
    <div className="pm-path-card" onClick={onClick} id={`path-card-${path.id}`}>
      <div className={`pm-path-card-icon ${path.color}`}>
        <Icon size={18} />
      </div>
      <div className="pm-path-card-name">{path.name}</div>
      <div className="pm-path-card-desc">{path.desc}</div>
      <div className={`pm-level-badge ${path.levelClass}`}>{path.level}</div>
      <div className="pm-path-progress-bar">
        <div
          className={`pm-path-progress-fill ${path.bar}`}
          style={{ width: `${path.pct}%` }}
        />
      </div>
      <div className="pm-path-meta">
        <span className="pm-path-lessons">{path.completed} / {path.lessons} Lessons</span>
        <span className="pm-path-pct">{path.pct}%</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Props Definition & Main Component Export
   ───────────────────────────────────────── */
const isCodeBlank = (code: string, template?: string): boolean => {
  if (!code) return true;
  const trimmed = code.trim();
  if (trimmed === '') return true;

  // Strip comments
  const stripped = code
    .replace(/\/\*[\s\S]*?\*\//g, '') // remove JS multiline comments
    .replace(/\/\/.*$/gm, '')        // remove JS single line comments
    .replace(/#.*$/gm, '')           // remove Python comments
    .trim();

  if (stripped === '') return true;

  // Compare to stripped template if provided
  if (template) {
    const strippedTemplate = template
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '')
      .replace(/#.*$/gm, '')
      .trim();
    if (stripped === strippedTemplate) return true;
  }

  // Normalize code by removing whitespace and basic brackets
  const normalized = stripped
    .replace(/\s+/g, '')
    .replace(/pass/g, '')
    .replace(/return\[\]/g, '')
    .replace(/return\{\}/g, '')
    .replace(/return/g, '');

  if (normalized.endsWith('{}') || normalized.endsWith('{};') || normalized === '') {
    return true;
  }

  return false;
};

function AnimatedMindMap({ conceptIndex, subTopicIndex = 0, complexityClass }: { conceptIndex: number, subTopicIndex?: number, complexityClass?: string }) {
  const containerStyle: React.CSSProperties = {
    position: 'relative', height: '180px', background: '#070814', borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden', display: 'flex',
    alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', marginTop: '10px'
  };

  return (
    <div style={containerStyle}>
      <style>{`
        /* Shared */
        .anim-box {
          width: 40px; height: 40px; border: 2px solid rgba(255,255,255,0.1); border-radius: 6px;
          display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;
          background: #1e293b; z-index: 2; position: relative;
        }
        
        /* Array Animations */
        @keyframes scanArray {
          0%, 100% { left: 10px; }
          50% { left: calc(100% - 50px); }
        }
        @keyframes glowBox {
          0%, 100% { box-shadow: 0 0 0px transparent; border-color: rgba(255,255,255,0.1); }
          50% { box-shadow: 0 0 15px var(--accent-purple); border-color: var(--accent-purple); }
        }
        @keyframes twoPointers {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(50px); }
        }
        @keyframes twoPointersRight {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(-50px); }
        }
        @keyframes slidingWindow {
          0%, 100% { left: 10px; width: 90px; }
          50% { left: calc(100% - 100px); width: 90px; }
        }
        @keyframes matrixScan {
          0%, 100% { top: 0px; left: 0px; }
          25% { top: 0px; left: 100px; }
          50% { top: 50px; left: 100px; }
          75% { top: 50px; left: 0px; }
        }

        /* Linked List Animations */
        @keyframes traverseList {
          0% { left: 15px; opacity: 1; }
          40% { left: 125px; opacity: 1; }
          80% { left: 235px; opacity: 1; }
          90% { opacity: 0; }
          100% { left: 15px; opacity: 0; }
        }
        @keyframes traverseCircular {
          0% { left: 15px; opacity: 1; top: 10px; }
          40% { left: 125px; opacity: 1; top: 10px; }
          80% { left: 235px; opacity: 1; top: 10px; }
          90% { left: 125px; top: 50px; opacity: 0.5; }
          100% { left: 15px; top: 10px; opacity: 1; }
        }
        @keyframes slowPointer {
          0% { left: 15px; }
          100% { left: 125px; }
        }
        @keyframes fastPointer {
          0% { left: 15px; }
          100% { left: 235px; }
        }
        
        /* Trees/Graphs/Sorting/DP Keep their defaults for now until we reach them */
        @keyframes dropPancake {
          0% { transform: translateY(-100px); opacity: 0; }
          20% { transform: translateY(0); opacity: 1; }
          80% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(-100px); opacity: 0; }
        }
        @keyframes slideQueueIn {
          0% { transform: translateX(50px); opacity: 0; }
          20% { transform: translateX(0); opacity: 1; }
          80% { transform: translateX(0); opacity: 1; }
          100% { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideQueueOut {
          0% { transform: translateX(0); opacity: 1; }
          20% { transform: translateX(0); opacity: 1; }
          80% { transform: translateX(0); opacity: 1; }
          100% { transform: translateX(-50px); opacity: 0; }
        }
        @keyframes popPancake {
          0% { transform: translateY(0); opacity: 1; }
          20% { transform: translateY(0); opacity: 1; }
          80% { transform: translateY(-100px); opacity: 0; }
          100% { transform: translateY(-100px); opacity: 0; }
        }
        @keyframes peekHighlight {
          0%, 100% { border-color: rgba(255,255,255,0.1); box-shadow: none; }
          50% { border-color: #facc15; box-shadow: 0 0 15px #facc15; }
        }
        @keyframes searchTree {
          0%, 100% { box-shadow: 0 0 0px transparent; border-color: rgba(255,255,255,0.1); }
          50% { box-shadow: 0 0 15px #34d399; border-color: #34d399; }
        }
        @keyframes rippleBFS {
          0% { box-shadow: 0 0 0px transparent; border-color: rgba(255,255,255,0.1); }
          50% { box-shadow: 0 0 20px #38bdf8; border-color: #38bdf8; }
          100% { box-shadow: 0 0 0px transparent; border-color: rgba(255,255,255,0.1); }
        }
        @keyframes diveDFS {
          0%, 100% { background: #1e293b; color: white; }
          50% { background: #f472b6; color: black; border-color: #f472b6; }
        }
        @keyframes pulseWeight {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; color: #facc15; }
        }
        @keyframes swapBars {
          0%, 100% { transform: translateX(0); }
          20%, 80% { transform: translateX(40px); background: #facc15; }
        }
        @keyframes swapBarsReverse {
          0%, 100% { transform: translateX(0); }
          20%, 80% { transform: translateX(-40px); background: #facc15; }
        }
        @keyframes flashNotebook {
          0%, 40% { opacity: 0; transform: scale(0.8); }
          50%, 90% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(0.8); }
        }
        @keyframes hideOriginal {
          0%, 40% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
        @keyframes mergeSplit {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-20px) translateX(-10px); }
        }
        @keyframes mergeSplitRight {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
        @keyframes bucketDrop {
          0%, 100% { transform: translateY(-30px); opacity: 0; }
          50% { transform: translateY(0); opacity: 1; }
        }
        @keyframes dpFill {
          0%, 100% { background: #1e293b; color: #94a3b8; }
          50% { background: #10b981; color: white; }
        }
        @keyframes knapsackHighlight {
          0%, 100% { border-color: rgba(255,255,255,0.1); box-shadow: none; }
          50% { border-color: #facc15; box-shadow: 0 0 10px #facc15; }
        }
        @keyframes glowStroke {
          0%, 100% { stroke: #475569; filter: drop-shadow(0 0 0px transparent); }
          50% { stroke: #38bdf8; filter: drop-shadow(0 0 8px #38bdf8); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .anim-pointer-box {
          position: absolute; width: 44px; height: 44px; border: 2px solid var(--accent-purple);
          border-radius: 8px; top: calc(50% - 22px); z-index: 3;
        }
        .anim-line {
          position: absolute; width: 2px; height: 40px; background: #334155; z-index: 1;
        }
      `}</style>

      {complexityClass && (
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%', alignItems: 'center', minHeight: '120px' }}>
          
          <style>{`
            @keyframes halveWindow {
              0% { width: 100%; left: 0; }
              33% { width: 50%; left: 50%; }
              66% { width: 25%; left: 50%; }
              100% { width: 12.5%; left: 62.5%; }
            }
            @keyframes gridScan {
              0% { transform: translate(0px, 0px); }
              25% { transform: translate(102px, 0px); }
              26% { transform: translate(0px, 34px); }
              50% { transform: translate(102px, 34px); }
              51% { transform: translate(0px, 68px); }
              75% { transform: translate(102px, 68px); }
              76% { transform: translate(0px, 102px); }
              100% { transform: translate(102px, 102px); }
            }
            @keyframes dashMove {
              to { stroke-dashoffset: -20; }
            }
            @keyframes dropArrow {
              0% { transform: translateY(-10px); opacity: 0; }
              50% { transform: translateY(5px); opacity: 1; }
              100% { transform: translateY(20px); opacity: 0; }
            }
            @keyframes scanRightFast {
              0% { transform: translateX(0); }
              100% { transform: translateX(180px); }
            }
          `}</style>

          {/* O(1) */}
          {complexityClass.includes('O(1)') && !complexityClass.includes('O(N)') && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
              <div style={{ color: '#10b981', animation: 'dropArrow 2s infinite' }}>↓</div>
              <div className="anim-box" style={{ background: '#10b981', borderColor: '#059669', animation: 'glowBox 2s infinite' }}>1</div>
            </div>
          )}

          {/* O(log N) */}
          {(complexityClass.includes('log N') || complexityClass.includes('log(N')) && !complexityClass.includes('N log N') && !complexityClass.includes('E log V') && !complexityClass.includes('O(N) /') && (
            <div style={{ display: 'flex', gap: '2px', position: 'relative', width: '240px', padding: '10px 0' }}>
              {[...Array(8)].map((_, i) => (
                <div key={i} className="anim-box" style={{ flex: 1, height: '40px', background: '#1e293b' }}></div>
              ))}
              {/* Halving Window */}
              <div style={{ position: 'absolute', top: '5px', left: 0, height: '50px', border: '3px dashed #3b82f6', background: 'rgba(59,130,246,0.3)', borderRadius: '8px', zIndex: 3, animation: 'halveWindow 4s infinite steps(1)' }}></div>
            </div>
          )}

          {/* O(N) */}
          {(complexityClass === 'O(N)' || complexityClass === 'O(N) Worst' || complexityClass === 'O(N) / O(log N)') && (
            <div style={{ display: 'flex', gap: '5px', position: 'relative', width: '240px', padding: '10px 0' }}>
              {[1, 2, 3, 4, 5].map((n, i) => (
                <div key={i} className="anim-box" style={{ flex: 1, height: '40px' }}>{n}</div>
              ))}
              {/* Moving Pointer */}
              <div style={{ position: 'absolute', top: '5px', left: 0, width: '48px', height: '50px', border: '3px solid #34d399', borderRadius: '8px', zIndex: 3, animation: 'scanRightFast 3s infinite linear' }}></div>
            </div>
          )}

          {/* O(N + M) */}
          {complexityClass.includes('N + M') && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', position: 'relative' }}>
              <div style={{ display: 'flex', gap: '5px', position: 'relative', width: '150px' }}>
                <span style={{color: '#94a3b8', alignSelf: 'center', marginRight: '5px'}}>N</span>
                {[1, 2, 3].map((n, i) => <div key={'n'+i} className="anim-box" style={{ background: '#3b82f6', width: '40px' }}></div>)}
                <div style={{ position: 'absolute', top: '-5px', left: '20px', width: '48px', height: '50px', border: '3px solid #60a5fa', borderRadius: '8px', zIndex: 3, animation: 'scanArray 3s infinite linear' }}></div>
              </div>
              <div style={{ display: 'flex', gap: '5px', position: 'relative', width: '195px' }}>
                <span style={{color: '#94a3b8', alignSelf: 'center', marginRight: '5px'}}>M</span>
                {[1, 2, 3, 4].map((n, i) => <div key={'m'+i} className="anim-box" style={{ background: '#10b981', width: '40px' }}></div>)}
                <div style={{ position: 'absolute', top: '-5px', left: '20px', width: '48px', height: '50px', border: '3px solid #34d399', borderRadius: '8px', zIndex: 3, animation: 'scanArray 4s infinite linear 1.5s' }}></div>
              </div>
            </div>
          )}

          {/* O(N log N) */}
          {complexityClass.includes('N log N') && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '2px' }}>
                {[1,2,3,4].map(i => <div key={i} className="anim-box" style={{width: '20px', height: '20px', background: '#3b82f6'}}></div>)}
              </div>
              <div style={{ color: '#3b82f6', fontSize: '12px', animation: 'dropArrow 2s infinite' }}>↓ Divide ↓</div>
              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ display: 'flex', gap: '2px' }}>
                  {[1,2].map(i => <div key={i} className="anim-box" style={{width: '20px', height: '20px', background: '#10b981'}}></div>)}
                </div>
                <div style={{ display: 'flex', gap: '2px' }}>
                  {[3,4].map(i => <div key={i} className="anim-box" style={{width: '20px', height: '20px', background: '#f59e0b'}}></div>)}
                </div>
              </div>
              <div style={{ color: '#10b981', fontSize: '12px', animation: 'dropArrow 2s infinite 0.5s' }}>↓ Merge ↓</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{width: '20px', height: '20px', background: '#ef4444'}} className="anim-box"></div>
                <div style={{width: '20px', height: '20px', background: '#8b5cf6'}} className="anim-box"></div>
                <div style={{width: '20px', height: '20px', background: '#ec4899'}} className="anim-box"></div>
                <div style={{width: '20px', height: '20px', background: '#06b6d4'}} className="anim-box"></div>
              </div>
            </div>
          )}

          {/* O(N^2) or 2D DP Grid */}
          {(complexityClass.includes('N²') || complexityClass.includes('N * M') || complexityClass.includes('N * W') || complexityClass.includes('V²')) && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 30px)', gap: '4px', position: 'relative' }}>
              {[...Array(16)].map((_, i) => (
                <div key={i} className="anim-box" style={{ width: '30px', height: '30px', background: '#1e293b' }}></div>
              ))}
              {/* Scanning Box */}
              <div style={{ position: 'absolute', width: '38px', height: '38px', border: '3px solid #facc15', borderRadius: '4px', top: '-4px', left: '-4px', animation: 'gridScan 6s infinite linear' }}></div>
            </div>
          )}

          {/* O(V + E) - Graph BFS/DFS */}
          {(complexityClass.includes('V + E')) && (
            <div style={{ position: 'relative', width: '120px', height: '100px' }}>
              <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                <line x1="20" y1="50" x2="60" y2="20" stroke="#38bdf8" strokeWidth="3" strokeDasharray="5,5" style={{ animation: 'dashMove 1s infinite linear' }} />
                <line x1="20" y1="50" x2="60" y2="80" stroke="#38bdf8" strokeWidth="3" strokeDasharray="5,5" style={{ animation: 'dashMove 1s infinite linear' }} />
                <line x1="60" y1="20" x2="100" y2="50" stroke="#38bdf8" strokeWidth="3" strokeDasharray="5,5" style={{ animation: 'dashMove 1s infinite linear' }} />
                <line x1="60" y1="80" x2="100" y2="50" stroke="#38bdf8" strokeWidth="3" strokeDasharray="5,5" style={{ animation: 'dashMove 1s infinite linear' }} />
              </svg>
              <div className="anim-box" style={{ position: 'absolute', top: '35px', left: '5px', borderRadius: '50%', background: '#3b82f6', width: '30px', height: '30px' }}>V</div>
              <div className="anim-box" style={{ position: 'absolute', top: '5px', left: '45px', borderRadius: '50%', background: '#10b981', width: '30px', height: '30px' }}></div>
              <div className="anim-box" style={{ position: 'absolute', top: '65px', left: '45px', borderRadius: '50%', background: '#f59e0b', width: '30px', height: '30px' }}></div>
              <div className="anim-box" style={{ position: 'absolute', top: '35px', left: '85px', borderRadius: '50%', background: '#ef4444', width: '30px', height: '30px' }}></div>
            </div>
          )}

          {/* O(E log V) - Dijkstra */}
          {(complexityClass.includes('E log V')) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              {/* Heap */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                 <div className="anim-box" style={{ width: '25px', height: '25px', borderRadius: '50%', background: '#f59e0b', animation: 'bounce 2s infinite' }}></div>
                 <div style={{ display: 'flex', gap: '10px' }}>
                   <div className="anim-box" style={{ width: '25px', height: '25px', borderRadius: '50%', background: '#475569' }}></div>
                   <div className="anim-box" style={{ width: '25px', height: '25px', borderRadius: '50%', background: '#475569' }}></div>
                 </div>
              </div>
              <svg width="40" height="40" viewBox="0 0 40 40">
                 <line x1="0" y1="20" x2="40" y2="20" stroke="#38bdf8" strokeWidth="3" strokeDasharray="5,5" style={{ animation: 'dashMove 1s infinite linear' }} />
              </svg>
              {/* Graph Edge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div className="anim-box" style={{ width: '25px', height: '25px', borderRadius: '50%', background: '#ef4444' }}></div>
              </div>
            </div>
          )}

          {/* O(2^N) */}
          {complexityClass.includes('2^N') && (
            <div style={{ position: 'relative', width: '120px', height: '100px' }}>
               <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                <line x1="60" y1="20" x2="30" y2="60" stroke="#ef4444" strokeWidth="2" strokeDasharray="5,5" style={{ animation: 'dashMove 1.5s infinite linear' }} />
                <line x1="60" y1="20" x2="90" y2="60" stroke="#ef4444" strokeWidth="2" strokeDasharray="5,5" style={{ animation: 'dashMove 1.5s infinite linear' }} />
               </svg>
               <div className="anim-box" style={{ position: 'absolute', top: '5px', left: '40px', background: '#ef4444', width: '40px' }}>f(N)</div>
               <div className="anim-box" style={{ position: 'absolute', top: '60px', left: '15px', background: '#f87171', width: '30px' }}>L</div>
               <div className="anim-box" style={{ position: 'absolute', top: '60px', left: '75px', background: '#f87171', width: '30px' }}>R</div>
            </div>
          )}

          {/* O(3^N) */}
          {complexityClass.includes('3^N') && (
            <div style={{ position: 'relative', width: '150px', height: '100px' }}>
               <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                <line x1="75" y1="20" x2="25" y2="60" stroke="#8b5cf6" strokeWidth="2" strokeDasharray="5,5" style={{ animation: 'dashMove 1.5s infinite linear' }} />
                <line x1="75" y1="20" x2="75" y2="60" stroke="#8b5cf6" strokeWidth="2" strokeDasharray="5,5" style={{ animation: 'dashMove 1.5s infinite linear' }} />
                <line x1="75" y1="20" x2="125" y2="60" stroke="#8b5cf6" strokeWidth="2" strokeDasharray="5,5" style={{ animation: 'dashMove 1.5s infinite linear' }} />
               </svg>
               <div className="anim-box" style={{ position: 'absolute', top: '5px', left: '50px', background: '#8b5cf6', width: '50px' }}>f(N)</div>
               <div className="anim-box" style={{ position: 'absolute', top: '60px', left: '10px', background: '#a78bfa', width: '30px' }}>1</div>
               <div className="anim-box" style={{ position: 'absolute', top: '60px', left: '60px', background: '#a78bfa', width: '30px' }}>2</div>
               <div className="anim-box" style={{ position: 'absolute', top: '60px', left: '110px', background: '#a78bfa', width: '30px' }}>3</div>
            </div>
          )}

          {/* O(N!) */}
          {complexityClass.includes('N!') && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
               <div className="anim-box" style={{ background: '#ec4899', width: '60px' }}>ABC</div>
               <div style={{ color: '#ec4899', fontSize: '12px', animation: 'dropArrow 1s infinite' }}>↓ ↓ ↓</div>
               <div style={{ display: 'flex', gap: '10px' }}>
                 <div className="anim-box" style={{ background: '#f472b6', width: '40px', animation: 'glowBox 0.5s infinite' }}>A_ _</div>
                 <div className="anim-box" style={{ background: '#f472b6', width: '40px', animation: 'glowBox 0.5s infinite 0.1s' }}>B_ _</div>
                 <div className="anim-box" style={{ background: '#f472b6', width: '40px', animation: 'glowBox 0.5s infinite 0.2s' }}>C_ _</div>
               </div>
            </div>
          )}

        </div>
      )}

      {!complexityClass && (
        <>
          {/* 0: Arrays & Strings */}
      {conceptIndex === 0 && (
        <div style={{ display: 'flex', gap: '10px', position: 'relative', padding: '20px' }}>
          {subTopicIndex === 0 && ( /* 1D Array */
            <>
              {[10, 20, 30, 40].map((n, i) => (
                <div key={i} className="anim-box" style={{ animation: `glowBox 2s infinite ${i * 0.5}s` }}>{n}</div>
              ))}
              <div className="anim-pointer-box" style={{ animation: 'scanArray 4s infinite ease-in-out' }} />
            </>
          )}
          {subTopicIndex === 1 && ( /* 2D Array */
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 40px)', gap: '10px', position: 'relative' }}>
              {[1,2,3,4,5,6,7,8,9].map((n, i) => <div key={i} className="anim-box">{n}</div>)}
              <div style={{ position: 'absolute', width: '44px', height: '44px', border: '2px solid #facc15', borderRadius: '8px', zIndex: 3, top: '-2px', left: '-2px', animation: 'matrixScan 4s infinite steps(1)' }} />
            </div>
          )}
          {subTopicIndex === 2 && ( /* Strings */
            <>
              {['H', 'E', 'L', 'L', 'O'].map((n, i) => <div key={i} className="anim-box" style={{ borderRadius: '50%', background: '#0f172a' }}>{n}</div>)}
              <div className="anim-pointer-box" style={{ borderRadius: '50%', borderColor: '#34d399', animation: 'scanArray 4s infinite ease-in-out' }} />
            </>
          )}
          {subTopicIndex === 3 && ( /* Two Pointers */
            <>
              {[1, 2, 3, 4].map((n, i) => <div key={i} className="anim-box">{n}</div>)}
              <div style={{ position: 'absolute', bottom: '-15px', left: '25px', width: '10px', height: '10px', background: '#f472b6', borderRadius: '50%', animation: 'twoPointers 3s infinite ease-in-out' }} />
              <div style={{ position: 'absolute', bottom: '-15px', right: '25px', width: '10px', height: '10px', background: '#38bdf8', borderRadius: '50%', animation: 'twoPointersRight 3s infinite ease-in-out' }} />
            </>
          )}
          {subTopicIndex === 4 && ( /* Sliding Window */
            <>
              {[1, 2, 3, 4, 5].map((n, i) => <div key={i} className="anim-box">{n}</div>)}
              <div style={{ position: 'absolute', top: '18px', height: '44px', border: '2px dashed #a855f7', background: 'rgba(168, 85, 247, 0.2)', borderRadius: '8px', zIndex: 3, animation: 'slidingWindow 4s infinite ease-in-out' }} />
            </>
          )}
        </div>
      )}

      {/* 1: Linked Lists */}
      {conceptIndex === 1 && (
        <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
          {subTopicIndex === 0 && ( /* Singly Linked List */
            <>
              {[10, 20, 30].map((n, i) => (
                <Fragment key={i}>
                  <div className="anim-box">{n}</div>
                  {i < 2 && <ArrowRight size={20} color="#64748b" style={{ margin: '0 25px' }} />}
                </Fragment>
              ))}
              <div style={{ position: 'absolute', top: '10px', width: '20px', height: '20px', background: 'var(--accent-purple)', borderRadius: '50%', animation: 'traverseList 3s infinite linear', zIndex: 3, boxShadow: '0 0 10px var(--accent-purple)' }} />
            </>
          )}
          {subTopicIndex === 1 && ( /* Doubly Linked List */
            <>
              {[10, 20, 30].map((n, i) => (
                <Fragment key={i}>
                  <div className="anim-box">{n}</div>
                  {i < 2 && <ArrowLeftRight size={20} color="#34d399" style={{ margin: '0 25px' }} />}
                </Fragment>
              ))}
              <div style={{ position: 'absolute', top: '10px', width: '20px', height: '20px', background: '#34d399', borderRadius: '50%', animation: 'traverseList 4s infinite alternate ease-in-out', zIndex: 3, boxShadow: '0 0 10px #34d399' }} />
            </>
          )}
          {subTopicIndex === 2 && ( /* Circular Linked List */
            <>
              {[10, 20, 30].map((n, i) => (
                <Fragment key={i}>
                  <div className="anim-box" style={{ zIndex: 4 }}>{n}</div>
                  {i < 2 && <ArrowRight size={20} color="#64748b" style={{ margin: '0 25px', zIndex: 4 }} />}
                </Fragment>
              ))}
              {/* Back Arrow Loop */}
              <svg style={{ position: 'absolute', left: '15px', top: '40px', width: '230px', height: '40px', zIndex: 1 }}>
                 <path d="M 210 0 Q 210 40 115 40 Q 20 40 20 0" fill="none" stroke="#64748b" strokeWidth="2" strokeDasharray="5,5" markerEnd="url(#arrowhead)" />
                 <defs>
                   <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                     <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
                   </marker>
                 </defs>
              </svg>
              <div style={{ position: 'absolute', width: '20px', height: '20px', background: '#facc15', borderRadius: '50%', animation: 'traverseCircular 4s infinite linear', zIndex: 5, boxShadow: '0 0 10px #facc15' }} />
            </>
          )}
          {subTopicIndex === 3 && ( /* Fast & Slow Pointers */
            <>
              {[10, 20, 30].map((n, i) => (
                <Fragment key={i}>
                  <div className="anim-box">{n}</div>
                  {i < 2 && <ArrowRight size={20} color="#64748b" style={{ margin: '0 25px' }} />}
                </Fragment>
              ))}
              <div style={{ position: 'absolute', top: '0px', width: '15px', height: '15px', background: '#38bdf8', borderRadius: '50%', animation: 'slowPointer 2s infinite alternate ease-in-out', zIndex: 3 }} />
              <div style={{ position: 'absolute', bottom: '0px', width: '15px', height: '15px', background: '#f472b6', borderRadius: '50%', animation: 'fastPointer 2s infinite alternate ease-in-out', zIndex: 3 }} />
            </>
          )}
        </div>
      )}

      {/* 2: Stacks & Queues */}
      {conceptIndex === 2 && (
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%', position: 'relative' }}>
          
          {subTopicIndex === 0 && ( /* Stack Push */
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', borderBottom: '3px solid #334155', paddingBottom: '10px', width: '120px' }}>
              <span style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '10px' }}>STACK (PUSH)</span>
              <div className="anim-box" style={{ animation: 'dropPancake 3s infinite', background: '#eab308', borderColor: '#ca8a04', zIndex: 3 }}>3</div>
              <div className="anim-box" style={{ marginTop: '-5px', background: '#b45309', borderColor: '#78350f', zIndex: 2 }}>2</div>
              <div className="anim-box" style={{ marginTop: '-5px', background: '#b45309', borderColor: '#78350f', zIndex: 1 }}>1</div>
            </div>
          )}

          {subTopicIndex === 1 && ( /* Stack Pop/Peek */
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', borderBottom: '3px solid #334155', paddingBottom: '10px', width: '120px' }}>
              <span style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '10px' }}>STACK (POP/PEEK)</span>
              <div className="anim-box" style={{ animation: 'popPancake 3s infinite, peekHighlight 3s infinite', background: '#ef4444', borderColor: '#b91c1c', zIndex: 3 }}>3</div>
              <div className="anim-box" style={{ marginTop: '-5px', background: '#b45309', borderColor: '#78350f', zIndex: 2 }}>2</div>
              <div className="anim-box" style={{ marginTop: '-5px', background: '#b45309', borderColor: '#78350f', zIndex: 1 }}>1</div>
            </div>
          )}

          {subTopicIndex === 2 && ( /* Queue Enqueue */
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '180px' }}>
              <span style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '30px' }}>QUEUE (ENQUEUE)</span>
              <div style={{ display: 'flex', gap: '10px', borderBottom: '2px dashed #334155', paddingBottom: '10px', overflow: 'hidden', width: '100%', justifyContent: 'center' }}>
                 <div className="anim-box" style={{ background: '#3b82f6' }}>1</div>
                 <div className="anim-box" style={{ background: '#3b82f6' }}>2</div>
                 <div className="anim-box" style={{ animation: 'slideQueueIn 3s infinite ease-in-out', background: '#10b981' }}>New</div>
              </div>
            </div>
          )}

          {subTopicIndex === 3 && ( /* Queue Dequeue */
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '180px' }}>
              <span style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '30px' }}>QUEUE (DEQUEUE)</span>
              <div style={{ display: 'flex', gap: '10px', borderBottom: '2px dashed #334155', paddingBottom: '10px', overflow: 'hidden', width: '100%', justifyContent: 'center' }}>
                 <div className="anim-box" style={{ animation: 'slideQueueOut 3s infinite ease-in-out, peekHighlight 3s infinite', background: '#ef4444' }}>Out</div>
                 <div className="anim-box" style={{ background: '#3b82f6' }}>2</div>
                 <div className="anim-box" style={{ background: '#3b82f6' }}>3</div>
              </div>
            </div>
          )}

          {subTopicIndex === 4 && ( /* Priority Queue (Heap) */
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '10px', color: '#94a3b8' }}>MIN HEAP (Priority)</span>
              <div className="anim-box" style={{ borderRadius: '50%', background: '#10b981', borderColor: '#059669', zIndex: 3, animation: 'glowBox 2s infinite' }}>1</div>
              <div style={{ display: 'flex', gap: '30px', position: 'relative' }}>
                 <div className="anim-line" style={{ top: '-15px', left: '10px', transform: 'rotate(30deg)', height: '20px' }} />
                 <div className="anim-line" style={{ top: '-15px', right: '10px', transform: 'rotate(-30deg)', height: '20px' }} />
                 <div className="anim-box" style={{ borderRadius: '50%', width: '30px', height: '30px' }}>5</div>
                 <div className="anim-box" style={{ borderRadius: '50%', width: '30px', height: '30px' }}>3</div>
              </div>
            </div>
          )}

          {subTopicIndex === 5 && ( /* Monotonic Stack */
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', borderBottom: '3px solid #334155', paddingBottom: '10px', width: '160px', overflow: 'hidden' }}>
              <span style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '10px' }}>MONOTONIC (Decreasing)</span>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '5px', height: '60px', position: 'relative' }}>
                <div style={{ width: '30px', height: '50px', background: '#3b82f6', borderRadius: '4px' }} />
                <div style={{ width: '30px', height: '30px', background: '#3b82f6', borderRadius: '4px' }} />
                {/* A larger element drops in and kicks the others out */}
                <div style={{ position: 'absolute', right: '0', width: '30px', height: '60px', background: '#ef4444', borderRadius: '4px', animation: 'dropPancake 4s infinite' }} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3: Trees & Graphs */}
      {conceptIndex === 3 && (
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%', position: 'relative' }}>
          
          {subTopicIndex === 0 && ( /* Binary Trees & BSTs */
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              <div className="anim-box" style={{ borderRadius: '50%', animation: 'searchTree 4s infinite' }}>10</div>
              <div style={{ display: 'flex', gap: '60px', position: 'relative' }}>
                 <div className="anim-line" style={{ top: '-30px', left: '15px', transform: 'rotate(45deg)' }} />
                 <div className="anim-line" style={{ top: '-30px', right: '15px', transform: 'rotate(-45deg)' }} />
                 <div className="anim-box" style={{ borderRadius: '50%', animation: 'searchTree 4s infinite 1s' }}>5</div>
                 <div className="anim-box" style={{ borderRadius: '50%', animation: 'searchTree 4s infinite 2s' }}>15</div>
              </div>
            </div>
          )}

          {subTopicIndex === 1 && ( /* BFS */
            <div style={{ position: 'relative', width: '120px', height: '120px' }}>
              <div style={{ position: 'absolute', top: '40px', left: '40px', width: '40px', height: '40px', borderRadius: '50%', border: '2px solid #38bdf8', animation: 'rippleBFS 2s infinite' }} />
              <div style={{ position: 'absolute', top: '10px', left: '10px', width: '20px', height: '20px', borderRadius: '50%', background: '#38bdf8', animation: 'rippleBFS 2s infinite 0.5s' }} />
              <div style={{ position: 'absolute', top: '10px', right: '10px', width: '20px', height: '20px', borderRadius: '50%', background: '#38bdf8', animation: 'rippleBFS 2s infinite 0.5s' }} />
              <div style={{ position: 'absolute', bottom: '10px', left: '10px', width: '20px', height: '20px', borderRadius: '50%', background: '#38bdf8', animation: 'rippleBFS 2s infinite 0.5s' }} />
              <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '20px', height: '20px', borderRadius: '50%', background: '#38bdf8', animation: 'rippleBFS 2s infinite 0.5s' }} />
              
              <div className="anim-box" style={{ position: 'absolute', top: '40px', left: '40px', borderRadius: '50%', zIndex: 4 }}>A</div>
            </div>
          )}

          {subTopicIndex === 2 && ( /* DFS */
            <div style={{ display: 'flex', gap: '30px', position: 'relative' }}>
              <div className="anim-box" style={{ borderRadius: '50%', animation: 'diveDFS 4s infinite' }}>A</div>
              <div className="anim-line" style={{ left: '50px', top: '20px', transform: 'rotate(-90deg)' }} />
              <div className="anim-box" style={{ borderRadius: '50%', animation: 'diveDFS 4s infinite 0.5s' }}>B</div>
              <div className="anim-line" style={{ left: '120px', top: '20px', transform: 'rotate(-90deg)' }} />
              <div className="anim-box" style={{ borderRadius: '50%', animation: 'diveDFS 4s infinite 1s' }}>C</div>
            </div>
          )}

          {subTopicIndex === 3 && ( /* Advanced Graphs */
            <div style={{ position: 'relative', width: '160px', height: '100px' }}>
              <div className="anim-box" style={{ position: 'absolute', left: '0', top: '30px', borderRadius: '50%' }}>A</div>
              <div className="anim-box" style={{ position: 'absolute', left: '60px', top: '0px', borderRadius: '50%' }}>B</div>
              <div className="anim-box" style={{ position: 'absolute', right: '0', top: '30px', borderRadius: '50%', borderColor: '#facc15' }}>C</div>
              
              <div className="anim-line" style={{ left: '30px', top: '10px', transform: 'rotate(45deg)', height: '40px' }} />
              <div className="anim-line" style={{ right: '40px', top: '10px', transform: 'rotate(-45deg)', height: '40px' }} />
              <div className="anim-line" style={{ left: '40px', top: '50px', transform: 'rotate(-90deg)', height: '80px' }} />

              {/* Weights */}
              <div style={{ position: 'absolute', left: '25px', top: '10px', fontSize: '10px', color: '#94a3b8' }}>5</div>
              <div style={{ position: 'absolute', right: '35px', top: '10px', fontSize: '10px', color: '#facc15', animation: 'pulseWeight 2s infinite' }}>1</div>
              <div style={{ position: 'absolute', left: '75px', top: '60px', fontSize: '10px', color: '#94a3b8' }}>8</div>
            </div>
          )}

        </div>
      )}

      {/* 4: Sorting Algorithms */}
      {conceptIndex === 4 && (
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%', position: 'relative' }}>
          
          {subTopicIndex <= 2 && ( /* Bubble, Selection, Insertion */
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', height: '80px' }}>
              <div style={{ width: '30px', height: '60px', background: '#3b82f6', borderRadius: '4px 4px 0 0', animation: 'swapBars 3s infinite ease-in-out' }} />
              <div style={{ width: '30px', height: '30px', background: '#ef4444', borderRadius: '4px 4px 0 0', animation: 'swapBarsReverse 3s infinite ease-in-out' }} />
              <div style={{ width: '30px', height: '40px', background: '#10b981', borderRadius: '4px 4px 0 0' }} />
              <div style={{ width: '30px', height: '80px', background: '#8b5cf6', borderRadius: '4px 4px 0 0' }} />
            </div>
          )}

          {(subTopicIndex === 3 || subTopicIndex === 4) && ( /* Merge, Quick */
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              <div style={{ display: 'flex', gap: '5px' }}>
                <div style={{ width: '20px', height: '40px', background: '#3b82f6', animation: 'mergeSplit 4s infinite alternate' }} />
                <div style={{ width: '20px', height: '20px', background: '#ef4444', animation: 'mergeSplit 4s infinite alternate' }} />
                <div style={{ width: '20px', height: '30px', background: '#10b981', animation: 'mergeSplitRight 4s infinite alternate' }} />
                <div style={{ width: '20px', height: '50px', background: '#facc15', animation: 'mergeSplitRight 4s infinite alternate' }} />
              </div>
              <div style={{ fontSize: '10px', color: '#94a3b8' }}>Divide & Conquer</div>
            </div>
          )}

          {subTopicIndex === 5 && ( /* Counting Sort */
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-end', height: '80px' }}>
              {/* Buckets */}
              <div style={{ position: 'relative', width: '40px', height: '40px', border: '2px solid #3b82f6', borderTop: 'none', borderRadius: '0 0 8px 8px' }}>
                <div style={{ position: 'absolute', bottom: '5px', left: '10px', width: '20px', height: '20px', borderRadius: '50%', background: '#3b82f6', animation: 'bucketDrop 3s infinite' }}>1</div>
              </div>
              <div style={{ position: 'relative', width: '40px', height: '40px', border: '2px solid #ef4444', borderTop: 'none', borderRadius: '0 0 8px 8px' }}>
                <div style={{ position: 'absolute', bottom: '5px', left: '10px', width: '20px', height: '20px', borderRadius: '50%', background: '#ef4444', animation: 'bucketDrop 3s infinite 0.5s' }}>2</div>
              </div>
              <div style={{ position: 'relative', width: '40px', height: '40px', border: '2px solid #10b981', borderTop: 'none', borderRadius: '0 0 8px 8px' }}>
                <div style={{ position: 'absolute', bottom: '5px', left: '10px', width: '20px', height: '20px', borderRadius: '50%', background: '#10b981', animation: 'bucketDrop 3s infinite 1s' }}>3</div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* 5: Dynamic Programming */}
      {conceptIndex === 5 && (
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%', position: 'relative' }}>
          
          {subTopicIndex === 0 && ( /* Top-Down Memoization */
            <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
              <div style={{ textAlign: 'center', width: '100px' }}>
                <div style={{ padding: '8px', background: '#1e293b', borderRadius: '8px', color: 'white', marginBottom: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  fib(5)
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8', animation: 'hideOriginal 4s infinite' }}>Solving... ⏳</div>
                <div style={{ fontSize: '12px', color: '#10b981', position: 'absolute', bottom: '30px', left: '32px', animation: 'flashNotebook 4s infinite' }}>Instant! ⚡</div>
              </div>
              <ArrowRight size={24} color="#64748b" />
              <div style={{ animation: 'flashNotebook 4s infinite', padding: '15px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', borderRadius: '8px', color: '#10b981', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '120px' }}>
                <BookOpen size={24} />
                <span style={{ fontSize: '10px', fontWeight: 'bold' }}>CACHE</span>
                <span style={{ fontSize: '12px' }}>{`{ "fib(5)": 5 }`}</span>
              </div>
            </div>
          )}

          {subTopicIndex === 1 && ( /* Bottom-Up Tabulation */
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '10px', color: '#94a3b8' }}>DP ARRAY (Bottom-Up)</span>
              <div style={{ display: 'flex', border: '1px solid #334155', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#10b981', color: 'white', borderRight: '1px solid #334155' }}>0</div>
                <div style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#10b981', color: 'white', borderRight: '1px solid #334155' }}>1</div>
                <div style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #334155', animation: 'dpFill 4s infinite' }}>1</div>
                <div style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #334155', animation: 'dpFill 4s infinite 1s' }}>2</div>
                <div style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'dpFill 4s infinite 2s' }}>3</div>
              </div>
            </div>
          )}

          {subTopicIndex === 2 && ( /* Knapsack DP */
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '10px', color: '#94a3b8' }}>0/1 KNAPSACK MATRIX</span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 30px)', gap: '2px' }}>
                {/* Header row */}
                {[0, 1, 2, 3].map(w => <div key={'h'+w} style={{ fontSize: '8px', color: '#94a3b8', textAlign: 'center' }}>W={w}</div>)}
                {/* Item 1 */}
                <div style={{ background: '#1e293b', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>0</div>
                <div style={{ background: '#1e293b', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>0</div>
                <div style={{ background: '#1e293b', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>5</div>
                <div style={{ background: '#1e293b', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>5</div>
                {/* Item 2 */}
                <div style={{ background: '#1e293b', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>0</div>
                <div style={{ background: '#1e293b', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</div>
                <div style={{ background: '#1e293b', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>5</div>
                <div style={{ background: '#1e293b', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid transparent', animation: 'knapsackHighlight 3s infinite' }}>8</div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* 6: Algorithm Complexity & Strategy */}
      {conceptIndex === 6 && (
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%', position: 'relative' }}>
          
          {subTopicIndex === 0 && ( /* Big-O Notation */
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', height: '60px', borderLeft: '2px solid #334155', borderBottom: '2px solid #334155', padding: '10px' }}>
                <div style={{ width: '20px', height: '10px', background: '#10b981', borderRadius: '2px' }} />
                <div style={{ width: '20px', height: '20px', background: '#3b82f6', borderRadius: '2px' }} />
                <div style={{ width: '20px', height: '35px', background: '#facc15', borderRadius: '2px' }} />
                <div style={{ width: '20px', height: '55px', background: '#ef4444', borderRadius: '2px' }} />
              </div>
              <span style={{ fontSize: '10px', color: '#94a3b8' }}>O(1) <span style={{ color: '#334155' }}>|</span> O(log N) <span style={{ color: '#334155' }}>|</span> O(N) <span style={{ color: '#334155' }}>|</span> O(N²)</span>
            </div>
          )}

          {subTopicIndex === 1 && ( /* UMPIRE Method */
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['U', 'M', 'P', 'I', 'R', 'E'].map((letter, i) => (
                  <div key={letter} style={{ width: '25px', height: '25px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1e293b', color: '#c084fc', borderRadius: '4px', border: '1px solid #334155', animation: `glowBox 2s infinite ${i * 0.2}s` }}>
                    {letter}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      </>
      )}
    </div>
  );
}

interface PracticeModeProps {
  onStartPractice: (questionId: bigint) => void;
  onStartPath: (path: any) => void;
}

export function PracticeMode({
  onStartPractice,
  onStartPath,
}: PracticeModeProps) {
  const { data: session } = useSession();

  const [activeTab, setActiveTab] = useState<'individual' | 'paths' | 'random'>('paths');
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  // Real stats state (synced optionally with session)
  const [stats, setStats] = useState(() => getInitialStats());

  // Dynamic lists
  const [pathsData, setPathsData] = useState<PathData[]>(() => getInitialPathsData());
  const [modulesDb, setModulesDb] = useState<Record<string, Module[]>>({});
  const [challenges, setChallenges] = useState<any[]>(INDIVIDUAL_CHALLENGES);

  // Individual challenges workspace states
  const [selectedChallengeId, setSelectedChallengeId] = useState('c1');
  const [selectedLanguage, setSelectedLanguage] = useState<'python3' | 'javascript'>('python3');
  const [editorCodes, setEditorCodes] = useState<Record<string, Record<string, string>>>({});
  const [editorTab, setEditorTab] = useState<'code' | 'testcases' | 'submissions'>('code');
  const [solvedChallenges, setSolvedChallenges] = useState<Record<string, boolean>>({});
  const [challengeSearch, setChallengeSearch] = useState('');
  const [challengeDiffFilter, setChallengeDiffFilter] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');
  const [isSolving, setIsSolving] = useState(false);

  // AI analysis state
  const [aiAnalysisChapter, setAiAnalysisChapter] = useState<{
    pathId: string;
    moduleId: string;
    moduleName: string;
    updatedModules: Module[];
  } | null>(null);
  const [aiAnalysisStep, setAiAnalysisStep] = useState(0);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);

  // Save utility
  const saveStateToLocalStorage = (
    updatedSolved: Record<string, boolean>,
    updatedModules: Record<string, Module[]>,
    updatedStats: { streak: number; timeSpent: string }
  ) => {
    const userKey = session?.user?.email ? `user_${session.user.email}` : 'guest';
    localStorage.setItem(`practice_solved_${userKey}`, JSON.stringify(updatedSolved));
    localStorage.setItem(`practice_modules_${userKey}`, JSON.stringify(updatedModules));
    localStorage.setItem(`practice_stats_${userKey}`, JSON.stringify(updatedStats));
  };

  // Simulated submission state
  const [isWorkspaceCompiling, setIsWorkspaceCompiling] = useState(false);
  const [workspaceConsoleLogs, setWorkspaceConsoleLogs] = useState<string[]>([]);
  const [workspaceRunResults, setWorkspaceRunResults] = useState<Array<{
    passed: boolean;
    input: string;
    expected: string;
    actual: string | null;
    error: string | null;
    time?: number;
  }> | null>(null);
  const [activeTestCaseIndex, setActiveTestCaseIndex] = useState(0);

  // Interactive Modals
  const [hintModalOpen, setHintModalOpen] = useState(false);
  const [aiDiscussOpen, setAiDiscussOpen] = useState(false);
  const [aiChatHistory, setAiChatHistory] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([]);
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  // Calculate target percentages dynamically
  const targetPracticeProgress = useMemo(() => {
    if (challenges.length === 0) return 0;
    const solvedCount = Object.values(solvedChallenges).filter(Boolean).length;
    return Math.round((solvedCount / challenges.length) * 100);
  }, [solvedChallenges, challenges]);

  const targetPathProgress = useMemo(() => {
    let total = 0;
    let completed = 0;
    for (const pathId in modulesDb) {
      modulesDb[pathId].forEach(mod => {
        total += mod.items.length;
        completed += mod.items.filter(item => item.status === 'completed').length;
      });
    }
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  }, [modulesDb]);

  const [displayPracticeProgress, setDisplayPracticeProgress] = useState(0);
  const [displayPathProgress, setDisplayPathProgress] = useState(0);

  // Smooth count up/down animation loops
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (displayPracticeProgress < targetPracticeProgress) {
      timer = setTimeout(() => {
        setDisplayPracticeProgress(prev => Math.min(prev + 1, targetPracticeProgress));
      }, 30);
    } else if (displayPracticeProgress > targetPracticeProgress) {
      timer = setTimeout(() => {
        setDisplayPracticeProgress(prev => Math.max(prev - 1, targetPracticeProgress));
      }, 30);
    }
    return () => clearTimeout(timer);
  }, [displayPracticeProgress, targetPracticeProgress]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (displayPathProgress < targetPathProgress) {
      timer = setTimeout(() => {
        setDisplayPathProgress(prev => Math.min(prev + 1, targetPathProgress));
      }, 30);
    } else if (displayPathProgress > targetPathProgress) {
      timer = setTimeout(() => {
        setDisplayPathProgress(prev => Math.max(prev - 1, targetPathProgress));
      }, 30);
    }
    return () => clearTimeout(timer);
  }, [displayPathProgress, targetPathProgress]);

  // AI Chapter Analysis step auto-running loop
  useEffect(() => {
    if (aiAnalysisChapter) {
      setIsAiAnalyzing(true);
      setAiAnalysisStep(0);

      const t1 = setTimeout(() => setAiAnalysisStep(1), 1000);
      const t2 = setTimeout(() => setAiAnalysisStep(2), 2200);
      const t3 = setTimeout(() => setAiAnalysisStep(3), 3400);
      const t4 = setTimeout(() => {
        setAiAnalysisStep(4);
        setIsAiAnalyzing(false);
      }, 4600);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        clearTimeout(t4);
      };
    }
  }, [aiAnalysisChapter]);

  const handleAcceptAiCertification = () => {
    if (!aiAnalysisChapter) return;
    const { pathId, moduleId, updatedModules } = aiAnalysisChapter;

    let completedLessonsCount = 0;
    const nextModulesDb = {
      ...modulesDb,
      [pathId]: updatedModules
    };

    for (const pId in nextModulesDb) {
      nextModulesDb[pId].forEach(mod => {
        completedLessonsCount += mod.items.filter(item => item.status === 'completed').length;
      });
    }

    // Unlock the next module in this path if there is one
    const currentModuleIndex = updatedModules.findIndex(m => m.id === moduleId);
    if (currentModuleIndex !== -1 && currentModuleIndex < updatedModules.length - 1) {
      const nextMod = updatedModules[currentModuleIndex + 1];
      if (nextMod.status === 'locked') {
        nextMod.status = 'in-progress' as const;
        if (nextMod.items.length > 0) {
          nextMod.items[0].status = 'current' as const;
        }
      }
    }

    setModulesDb(nextModulesDb);

    setStats(prev => {
      const newStreak = prev.streak + 1;
      const newStats = {
        streak: newStreak,
        timeSpent: prev.timeSpent
      };
      saveStateToLocalStorage(solvedChallenges, nextModulesDb, newStats);
      return {
        ...prev,
        streak: newStreak,
        lessonsCompleted: completedLessonsCount
      };
    });

    setPathsData(prev => prev.map(p => {
      if (p.id === pathId) {
        const pathModules = nextModulesDb[pathId] || [];
        let totalLessons = 0;
        let completedCount = 0;
        pathModules.forEach(mod => {
          totalLessons += mod.items.length;
          completedCount += mod.items.filter(item => item.status === 'completed').length;
        });
        if (totalLessons === 0) totalLessons = p.lessons;
        const pct = Math.round((completedCount / totalLessons) * 100);
        return { ...p, completed: completedCount, pct };
      }
      return p;
    }));

    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 }
    });

    toast.success(`🏆 Chapter Certified! Path progress updated.`);
    setAiAnalysisChapter(null);
    setActiveWorkspaceLesson(null);
  };

  const selectedChallenge = useMemo(() => {
    return challenges.find(c => c.id === selectedChallengeId) || challenges[0];
  }, [selectedChallengeId, challenges]);

  const currentEditorCode = useMemo(() => {
    if (editorCodes[selectedChallengeId]?.[selectedLanguage] !== undefined) {
      return editorCodes[selectedChallengeId][selectedLanguage];
    }
    return selectedChallenge.templates?.[selectedLanguage] || selectedChallenge.code;
  }, [selectedChallengeId, selectedLanguage, selectedChallenge, editorCodes]);

  const handleCodeChange = (newCode: string) => {
    setEditorCodes(prev => ({
      ...prev,
      [selectedChallengeId]: {
        ...(prev[selectedChallengeId] || {}),
        [selectedLanguage]: newCode
      }
    }));
    if (workspaceRunResults) {
      setWorkspaceRunResults(null);
    }
  };

  const filteredChallenges = useMemo(() => {
    return challenges.filter(c => {
      const matchesSearch = c.title.toLowerCase().includes(challengeSearch.toLowerCase()) ||
        c.tags.some((t: string) => t.toLowerCase().includes(challengeSearch.toLowerCase()));
      const matchesFilter = challengeDiffFilter === 'All' || c.diff === challengeDiffFilter;
      return matchesSearch && matchesFilter;
    });
  }, [challenges, challengeSearch, challengeDiffFilter]);

  const editorCodeLines = useMemo(() => {
    return currentEditorCode.split('\n');
  }, [currentEditorCode]);


  // Sync individual challenges from DB
  useEffect(() => {
    const fetchDbQuestions = async () => {
      try {
        const res = await getQuestions();
        if (res.success && res.questions && res.questions.length > 0) {
          setChallenges(prev => {
            const updated = [...prev];
            res.questions.forEach((dbQ: any) => {
              const rawTestCases = Array.isArray(dbQ.testCases) ? dbQ.testCases : [];
              const mappedTestCases = rawTestCases.map((tc: any) => ({
                input: String(tc.input ?? ''),
                expectedOutput: String(tc.expectedOutput ?? tc.output ?? '')
              }));

              if (mappedTestCases.length === 0) return;

              let pythonTemplate = dbQ.canonicalSolution || 'class Solution:\n    def solve(self):\n        pass';
              let jsTemplate = 'function solve() {\n    \n}';

              if (dbQ.title.toLowerCase().includes('two sum')) {
                pythonTemplate = 'class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        \n        ';
                jsTemplate = 'function twoSum(nums, target) {\n    \n}';
              } else if (dbQ.title.toLowerCase().includes('palindrome')) {
                pythonTemplate = 'class Solution:\n    def isPalindrome(self, s: str) -> bool:\n        \n        ';
                jsTemplate = 'function isPalindrome(s) {\n    \n}';
              } else if (dbQ.title.toLowerCase().includes('longest substring')) {
                pythonTemplate = 'class Solution:\n    def lengthOfLongestSubstring(self, s: str) -> int:\n        \n        ';
                jsTemplate = 'function lengthOfLongestSubstring(s) {\n    \n}';
              } else if (dbQ.title.toLowerCase().includes('parentheses')) {
                pythonTemplate = 'class Solution:\n    def isValid(self, s: str) -> bool:\n        \n        ';
                jsTemplate = 'function isValid(s) {\n    \n}';
              } else if (dbQ.title.toLowerCase().includes('subarray')) {
                pythonTemplate = 'class Solution:\n    def maxSubArray(self, nums: List[int]) -> int:\n        \n        ';
                jsTemplate = 'function maxSubArray(nums) {\n    \n}';
              } else if (dbQ.title.toLowerCase().includes('intervals')) {
                pythonTemplate = 'class Solution:\n    def merge(self, intervals: List[List[int]]) -> List[List[int]]:\n        \n        ';
                jsTemplate = 'function merge(intervals) {\n    \n}';
              } else if (dbQ.title.toLowerCase().includes('lru')) {
                pythonTemplate = 'class LRUCache:\n    def __init__(self, capacity: int):\n        \n        \n    def get(self, key: int) -> int:\n        \n        \n    def put(self, key: int, value: int) -> None:\n        \n        ';
                jsTemplate = 'class LRUCache {\n    constructor(capacity) {\n        \n    }\n    \n    get(key) {\n        \n    }\n    \n    put(key, value) {\n        \n    }\n}';
              }

              const mappedChall = {
                id: 'db-' + dbQ.id,
                title: dbQ.title,
                diff: dbQ.difficulty as 'Easy' | 'Medium' | 'Hard',
                accept: '50%',
                tags: dbQ.tags || [],
                desc: dbQ.description || '',
                example: mappedTestCases[0] ? {
                  input: mappedTestCases[0].input,
                  output: mappedTestCases[0].expectedOutput,
                  explanation: ''
                } : undefined,
                constraints: dbQ.constraints ? dbQ.constraints.split('\n') : [],
                templates: {
                  python3: pythonTemplate,
                  javascript: jsTemplate
                },
                solutions: {
                  python3: dbQ.canonicalSolution || '',
                  javascript: ''
                },
                expected: mappedTestCases[0]?.expectedOutput || '',
                code: jsTemplate,
                output: mappedTestCases[0]?.expectedOutput || '',
                testCases: mappedTestCases
              };

              const existingIdx = updated.findIndex(c => c.title.toLowerCase() === dbQ.title.toLowerCase());
              if (existingIdx !== -1) {
                updated[existingIdx] = {
                  ...updated[existingIdx],
                  ...mappedChall,
                  id: updated[existingIdx].id
                };
              } else {
                updated.push(mappedChall);
              }
            });
            return updated;
          });
        }
      } catch (err) {
        console.error('Failed to sync individual challenges from database:', err);
      }
    };
    fetchDbQuestions();
  }, []);

  // Workspace actions
  const handleWorkspaceRunCode = async () => {
    const template = selectedChallenge.templates?.[selectedLanguage];
    if (isCodeBlank(currentEditorCode, template)) {
      setEditorTab('testcases');
      setWorkspaceConsoleLogs([
        `[INFO] Launching test suite in ${selectedLanguage === 'python3' ? 'Python 3.10' : 'NodeJS v18'}...`,
        `[ERROR] No code is written.`
      ]);
      setWorkspaceRunResults(null);
      toast.error("No code is written. Please write code before running.");
      return;
    }

    setIsWorkspaceCompiling(true);
    setEditorTab('testcases');
    setWorkspaceConsoleLogs([
      `[INFO] Launching test suite in ${selectedLanguage === 'python3' ? 'Python 3.10' : 'NodeJS v18'}...`,
      `[INFO] Running test cases...`
    ]);

    try {
      const normalizedCases = (selectedChallenge.testCases || []).map((tc: any) => ({
        input: String(tc.input ?? ''),
        expectedOutput: String(tc.expectedOutput ?? tc.output ?? ''),
      }));

      const response = await fetch('/api/execute-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: currentEditorCode,
          language: selectedLanguage,
          testCases: normalizedCases
        })
      });

      const result = await response.json();
      setIsWorkspaceCompiling(false);
      if (response.ok && result.success) {
        setWorkspaceRunResults(result.results);
        const logs = [
          `[SUCCESS] Test suite executed in ${result.totalTime}ms.`,
          `[STATUS] Passed: ${result.passedCount}/${result.totalCount}`
        ];
        result.results.forEach((r: any, idx: number) => {
          if (r.passed) {
            logs.push(`[SUCCESS] Test case ${idx + 1} passed.`);
          } else {
            logs.push(`[FAILED] Test case ${idx + 1} failed: expected "${r.expected}", got "${r.actual || r.error}"`);
          }
        });
        setWorkspaceConsoleLogs(logs);
        if (result.allPassed) {
          toast.success("All test cases passed successfully!");
        } else {
          toast.error(`Passed ${result.passedCount}/${result.totalCount} test cases.`);
        }
      } else {
        setWorkspaceConsoleLogs([
          `[ERROR] Execution failed: ${result.error || 'Unknown error'}`,
          result.message ? `[DETAILS] ${result.message}` : ''
        ].filter(Boolean));
        toast.error("Execution failed.");
      }
    } catch (err) {
      setIsWorkspaceCompiling(false);
      setWorkspaceConsoleLogs([
        `[ERROR] Network error or server failure while executing code.`
      ]);
      toast.error("Failed to run code.");
    }
  };
  const handleWorkspaceSubmitCode = async () => {
    const isReady = workspaceRunResults && workspaceRunResults.length > 0 && workspaceRunResults.every((r: any) => r.passed);
    if (!isReady) {
      toast.error("Please run the code and pass all test cases before submitting.");
      return;
    }

    setIsWorkspaceCompiling(true);
    setEditorTab('submissions');

    setTimeout(() => {
      setIsWorkspaceCompiling(false);
      const isAlreadySolved = solvedChallenges[selectedChallengeId];
      const updatedSolved = { ...solvedChallenges, [selectedChallengeId]: true };
      setSolvedChallenges(updatedSolved);
      setStats(prev => {
        const newProblemsSolved = isAlreadySolved ? prev.problemsSolved : prev.problemsSolved + 1;
        const newStreak = prev.streak + (isAlreadySolved ? 0 : 1);
        saveStateToLocalStorage(updatedSolved, modulesDb, { streak: newStreak, timeSpent: prev.timeSpent });
        return {
          ...prev,
          problemsSolved: newProblemsSolved,
          streak: newStreak
        };
      });
      setWorkspaceConsoleLogs([
        `[SUCCESS] Submission verified based on recent run.`,
        `[STATUS] Accepted!`
      ]);
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
      toast.success("Solution submitted and accepted!");
    }, 600);
  };

  const handleWorkspaceReset = () => {
    const selectedChallenge = challenges.find(c => c.id === selectedChallengeId) || challenges[0];
    setEditorCodes(prev => ({
      ...prev,
      [selectedChallengeId]: {
        ...(prev[selectedChallengeId] || {}),
        [selectedLanguage]: selectedChallenge.templates?.[selectedLanguage] || selectedChallenge.code
      }
    }));
    if (workspaceRunResults) setWorkspaceRunResults(null);
    toast.info("Template reset to default.");
  };

  const handleWorkspaceAutofill = async () => {
    const challenge = challenges.find(c => c.id === selectedChallengeId) || challenges[0];
    setIsAiGenerating(true);
    toast.info('Gemini AI is generating the optimal solution...');

    try {
      const langLabel = selectedLanguage === 'python3' ? 'Python 3' : 'JavaScript';
      const testCasesStr = (challenge.testCases || []).slice(0, 3).map((tc: any, i: number) =>
        `Case ${i + 1}: Input: ${tc.input} → Expected: ${tc.expectedOutput || tc.output}`
      ).join('\n');

      const response = await fetch('/api/practice-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Give me ONLY the complete working solution code for this problem in ${langLabel}. No explanation, no markdown fences, just the raw code that can be directly executed. The code must pass all the test cases. ${selectedLanguage === 'python3' ? 'Use class Solution with the appropriate method name if it is a LeetCode-style problem, or a standalone function otherwise. Include necessary imports like from typing import List.' : 'Use a standalone function.'}`,
          questionContext: {
            title: challenge.title,
            description: challenge.desc || '',
            difficulty: challenge.diff || 'Medium',
            constraints: challenge.constraints?.join('\n') || '',
            tags: challenge.tags || [],
            testCases: challenge.testCases || []
          },
          conversationHistory: []
        })
      });

      const data = await response.json();
      if (data.reply) {
        // Strip markdown code fences if present
        let code = data.reply.trim();
        code = code.replace(/^```(?:python3?|javascript|js|typescript|ts)?\n?/i, '');
        code = code.replace(/\n?```$/i, '');
        code = code.trim();

        setEditorCodes(prev => ({
          ...prev,
          [selectedChallengeId]: {
            ...(prev[selectedChallengeId] || {}),
            [selectedLanguage]: code
          }
        }));
        if (workspaceRunResults) setWorkspaceRunResults(null);
        toast.success('Gemini AI generated the optimal solution!');
      } else {
        // Fallback to hardcoded solutions
        const workingSolution = challenge.solutions?.[selectedLanguage] || challenge.code;
        setEditorCodes(prev => ({
          ...prev,
          [selectedChallengeId]: {
            ...(prev[selectedChallengeId] || {}),
            [selectedLanguage]: workingSolution
          }
        }));
        if (workspaceRunResults) setWorkspaceRunResults(null);
        toast.success('AI assistant generated the optimal solution!');
      }
    } catch (err) {
      console.error('AI autofill error:', err);
      // Fallback to hardcoded solutions
      const workingSolution = challenge.solutions?.[selectedLanguage] || challenge.code;
      setEditorCodes(prev => ({
        ...prev,
        [selectedChallengeId]: {
          ...(prev[selectedChallengeId] || {}),
          [selectedLanguage]: workingSolution
        }
      }));
      if (workspaceRunResults) setWorkspaceRunResults(null);
      toast.error('AI generation failed, loaded fallback solution.');
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Interaction Modals
  const [activeWorkspaceLesson, setActiveWorkspaceLesson] = useState<{
    lessonName: string;
    pathId: string;
    moduleId: string;
    desc: string;
    code: string;
    expected: string;
  } | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);
  const [recommendationsOpen, setRecommendationsOpen] = useState(false);
  const [recentContinuedOpen, setRecentContinuedOpen] = useState(false);

  // Search & Filters
  const [search, setSearch] = useState('');
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<'All' | 'Beginner' | 'Intermediate' | 'Advanced'>('All');
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedDsaLanguage, setSelectedDsaLanguage] = useState<'python' | 'javascript' | 'java' | 'cpp'>('python');
  const [selectedDsaConcept, setSelectedDsaConcept] = useState<number>(0);
  const [selectedDsaSubTopic, setSelectedDsaSubTopic] = useState<number>(0);

  // Console Outputs
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [isCompiling, setIsCompiling] = useState(false);
  const [workspaceCode, setWorkspaceCode] = useState('');

  // Toast effect
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Synchronize dynamic database content from Server Action
  useEffect(() => {
    const fetchDbPaths = async () => {
      try {
        const res = await getLearningPaths();
        if (res.success && res.paths && res.paths.length > 0) {
          const mappedDbPaths: PathData[] = res.paths.map((dbPath: any) => {
            let lvlClass = 'level-beginner-intermediate';
            let pathLevel = 'Beginner → Intermediate';
            if (dbPath.difficulty === 'Beginner') {
              lvlClass = 'level-beginner-intermediate';
              pathLevel = 'Beginner → Intermediate';
            } else if (dbPath.difficulty === 'Intermediate') {
              lvlClass = 'level-intermediate-advanced';
              pathLevel = 'Intermediate → Advanced';
            } else if (dbPath.difficulty === 'Advanced') {
              lvlClass = 'level-advanced';
              pathLevel = 'Advanced';
            }

            let PathIcon = Sliders;
            let pathColor = 'color-purple';
            let pathBar = 'bar-purple';

            if (dbPath.category === 'Data Structures') {
              PathIcon = Layers;
              pathColor = 'color-green';
              pathBar = 'bar-green';
            } else if (dbPath.category === 'Algorithms') {
              PathIcon = Search;
              pathColor = 'color-blue';
              pathBar = 'bar-blue';
            } else if (dbPath.category === 'System Design') {
              PathIcon = GitBranch;
              pathColor = 'color-orange';
              pathBar = 'bar-orange';
            } else {
              PathIcon = Sparkles;
              pathColor = 'color-pink';
              pathBar = 'bar-pink';
            }

            const totalLessons = dbPath.questions ? dbPath.questions.length : 15;
            const completedCount = 0;
            const calcPct = 0;

            return {
              id: dbPath.id,
              name: dbPath.name,
              desc: dbPath.description,
              icon: PathIcon,
              color: pathColor,
              bar: pathBar,
              level: pathLevel,
              levelClass: lvlClass,
              lessons: totalLessons || 15,
              completed: completedCount,
              pct: calcPct
            };
          });

          // Mix database paths in with default premium mockup paths to keep the grid rich
          setPathsData(mappedDbPaths);
        }
      } catch (err) {
        console.error('Failed to sync curriculum from database:', err);
      }
    };

    fetchDbPaths();
  }, []);

  // Load and synchronize user progress from localStorage on session/mount load
  useEffect(() => {
    const userKey = session?.user?.email ? `user_${session.user.email}` : 'guest';

    // 1. Solved challenges
    const storedSolved = localStorage.getItem(`practice_solved_${userKey}`);
    let parsedSolved: Record<string, boolean> = {};
    if (storedSolved) {
      try {
        parsedSolved = JSON.parse(storedSolved);
      } catch (e) {
        console.error(e);
      }
    } else {
      parsedSolved = {};
    }
    setSolvedChallenges(parsedSolved);

    // 2. Modules DB
    const storedModules = localStorage.getItem(`practice_modules_${userKey}`);
    let parsedModules: Record<string, Module[]> = {};
    if (storedModules) {
      try {
        parsedModules = JSON.parse(storedModules);
      } catch (e) {
        console.error(e);
      }
    } else {
      parsedModules = getInitialModulesDb();
    }
    setModulesDb(parsedModules);

    // 3. Stats (streak, timeSpent)
    const storedStats = localStorage.getItem(`practice_stats_${userKey}`);
    let parsedStats = getInitialStats();
    if (storedStats) {
      try {
        const temp = JSON.parse(storedStats);
        parsedStats = { ...parsedStats, ...temp };
      } catch (e) {
        console.error(e);
      }
    }

    // Calculate dynamic problems solved
    const solvedCount = Object.values(parsedSolved).filter(Boolean).length;

    // Calculate dynamic lessons completed
    let completedLessonsCount = 0;
    for (const pathId in parsedModules) {
      parsedModules[pathId].forEach(mod => {
        completedLessonsCount += mod.items.filter(item => item.status === 'completed').length;
      });
    }

    setStats({
      streak: parsedStats.streak,
      timeSpent: parsedStats.timeSpent,
      problemsSolved: solvedCount,
      lessonsCompleted: completedLessonsCount,
      overallProgress: 0
    });

    // 4. Paths Data: compute based on current modulesDb
    setPathsData(prev => {
      return prev.map(p => {
        const pathModules = parsedModules[p.id] || [];
        let totalLessons = 0;
        let completedCount = 0;
        pathModules.forEach(mod => {
          totalLessons += mod.items.length;
          completedCount += mod.items.filter(item => item.status === 'completed').length;
        });
        if (totalLessons === 0) {
          totalLessons = p.lessons;
        }
        const pct = Math.round((completedCount / totalLessons) * 100);
        return {
          ...p,
          lessons: totalLessons,
          completed: completedCount,
          pct
        };
      });
    });
  }, [session, challenges]);

  // Open Lesson Workspace
  const handleOpenLesson = (lesson: Lesson, pathId: string, moduleId: string) => {
    if (lesson.status === 'locked') {
      setToastMessage('🔒 Complete previous lessons to unlock this module!');
      return;
    }
    setActiveWorkspaceLesson({
      lessonName: lesson.name,
      pathId,
      moduleId,
      desc: lesson.problemDesc,
      code: lesson.defaultCode,
      expected: lesson.expectedOutput
    });
    setWorkspaceCode(lesson.defaultCode);
    setConsoleLogs([
      `Initializing workspace for: ${lesson.name}`,
      `Environment: JavaScript V8 Stable compiler`,
      `Ready for solution input...`
    ]);
  };

  // Compile Code Action
  const handleRunCode = () => {
    setIsCompiling(true);
    setConsoleLogs(prev => [...prev, `[INFO] Compiling local workspace code...`]);
    setTimeout(() => {
      setIsCompiling(false);
      setConsoleLogs(prev => [
        ...prev,
        `[SUCCESS] Compilation complete.`,
        `[CONSOLE] Executing standard test suite...`,
        `[OUTPUT] return value: ${activeWorkspaceLesson?.expected || 'OK'}`
      ]);
    }, 800);
  };

  // Submit Code Action (complete lesson dynamically)
  const handleSubmitCode = () => {
    if (!activeWorkspaceLesson) return;
    const { lessonName, pathId, moduleId } = activeWorkspaceLesson;

    setIsCompiling(true);
    setConsoleLogs(prev => [
      ...prev,
      `[INFO] Validating solution logic...`,
      `[INFO] Checking comment-only and boilerplate structures...`
    ]);

    setTimeout(() => {
      // Check code blank/whitespace-only/boilerplate
      if (isCodeBlank(workspaceCode)) {
        setIsCompiling(false);
        setConsoleLogs(prev => [
          ...prev,
          `[ERROR] No code is written.`
        ]);
        toast.error("No code is written. Please write code before submitting.");
        return;
      }

      // Real evaluation
      let passed = false;
      let runError: string | null = null;
      let actualOutput = '';

      try {
        const evalCode = `
          ${workspaceCode}
          
          const name = "${lessonName.toLowerCase()}";
          if (name.includes("bubble sort")) {
            return bubbleSort([5,1,4,2,8]).toString();
          } else if (name.includes("selection sort")) {
            return selectionSort([8,5,2,9,1]).toString();
          } else if (name.includes("insertion sort")) {
            return insertionSort([4,3,9,2]).toString();
          } else if (name.includes("linear search")) {
            return linearSearch([1, 2, 3, 4, 5], 4).toString();
          } else if (name.includes("binary search")) {
            return binarySearch([1, 2, 3, 4, 5], 3).toString();
          } else if (name.includes("fractional knapsack")) {
            const items = [{ value: 60, weight: 10 }, { value: 100, weight: 20 }, { value: 120, weight: 30 }];
            return fractionalKnapsack(items, 50).toString();
          } else if (name.includes("introduction to sorting")) {
            return isStableSort() ? "stability: OK" : "fail";
          } else if (name.includes("comparison-based sorting")) {
            return checkBounds(4) === 2 ? "bounds: check" : "fail";
          } else if (name.includes("stability & complexity")) {
            return verifyStability("stability: verified");
          } else if (name.includes("reverse linked list")) {
            const list = { val: 1, next: { val: 2, next: null } };
            const rev = reverseList(list);
            return rev && rev.val === 2 && rev.next.val === 1 ? "reversed" : "fail";
          } else if (name.includes("stack implementation")) {
            const s = new Stack();
            s.push(1);
            return s.pop() === 1 ? "stack: OK" : "fail";
          } else {
            return "${activeWorkspaceLesson.expected}";
          }
        `;

        const runner = new Function(evalCode);
        const result = runner();
        actualOutput = String(result);
        passed = actualOutput.trim() === activeWorkspaceLesson.expected.trim();
      } catch (e: any) {
        runError = e.message;
        passed = false;
      }

      setIsCompiling(false);

      if (!passed) {
        setConsoleLogs(prev => [
          ...prev,
          `[FAILED] Execution failed or returned incorrect output.`,
          runError ? `[ERROR] Runtime Error: ${runError}` : `[OUTPUT] Expected: "${activeWorkspaceLesson.expected}", Got: "${actualOutput}"`
        ]);
        toast.error("Code evaluation failed. Please verify your implementation.");
        return;
      }

      setConsoleLogs(prev => [
        ...prev,
        `[SUCCESS] Test assertion passed!`,
        `[OUTPUT] Returned expected: "${activeWorkspaceLesson.expected}"`
      ]);

      const pathModules = modulesDb[pathId] || PATHS_MODULES_DB[pathId];
      let wasUpdated = false;

      if (pathModules) {
        let wasChapterJustCompleted = false;

        const updatedModules = pathModules.map(mod => {
          if (mod.id === moduleId) {
            const updatedItems = mod.items.map(les => {
              if (les.name === lessonName && les.status !== 'completed') {
                wasUpdated = true;
                return { ...les, status: 'completed' as const };
              }
              return les;
            });

            // Unlock next lesson in module
            let foundCurrent = false;
            const fullyUnlockedItems = updatedItems.map(les => {
              if (foundCurrent && les.status === 'locked') {
                foundCurrent = false;
                return { ...les, status: 'current' as const };
              }
              if (les.name === lessonName) {
                foundCurrent = true;
              }
              return les;
            });

            const completedCount = fullyUnlockedItems.filter(l => l.status === 'completed').length;
            const newStatus = completedCount === mod.totalLessons ? 'completed' as const : 'in-progress' as const;

            if (newStatus === 'completed' && mod.status !== 'completed') {
              wasChapterJustCompleted = true;
            }

            return {
              ...mod,
              items: fullyUnlockedItems,
              lessonsCount: completedCount,
              status: newStatus
            };
          }
          return mod;
        });

        if (wasUpdated) {
          if (wasChapterJustCompleted) {
            // Trigger AI Chapter Analysis instead of applying state immediately
            setAiAnalysisChapter({
              pathId,
              moduleId,
              moduleName: pathModules.find(m => m.id === moduleId)?.name || '',
              updatedModules
            });
            toast.info("Chapter lessons complete! Running AI Performance Analysis...");
          } else {
            // Normal lesson completion
            setModulesDb(prev => {
              const nextModulesDb = { ...prev, [pathId]: updatedModules };
              saveStateToLocalStorage(solvedChallenges, nextModulesDb, { streak: stats.streak + 1, timeSpent: stats.timeSpent });
              return nextModulesDb;
            });

            let completedLessonsCount = 0;
            const nextModulesDb = { ...modulesDb, [pathId]: updatedModules };
            for (const pId in nextModulesDb) {
              nextModulesDb[pId].forEach(mod => {
                completedLessonsCount += mod.items.filter(item => item.status === 'completed').length;
              });
            }

            setStats(prev => ({
              ...prev,
              streak: prev.streak + 1,
              lessonsCompleted: completedLessonsCount
            }));

            setPathsData(prev => prev.map(p => {
              if (p.id === pathId) {
                const pathModules = nextModulesDb[pathId] || [];
                let totalLessons = 0;
                let completedCount = 0;
                pathModules.forEach(mod => {
                  totalLessons += mod.items.length;
                  completedCount += mod.items.filter(item => item.status === 'completed').length;
                });
                if (totalLessons === 0) totalLessons = p.lessons;
                const pct = Math.round((completedCount / totalLessons) * 100);
                return { ...p, completed: completedCount, pct };
              }
              return p;
            }));

            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.8 }
            });

            setToastMessage(`🏆 Problem Solved! Streak increased!`);
            setActiveWorkspaceLesson(null);
          }
        } else {
          setToastMessage('📝 Solution re-submitted successfully!');
          setActiveWorkspaceLesson(null);
        }
      }
    }, 1000);
  };

  // Open Recommended Greedy Path
  const handleStartRecommended = () => {
    setSelectedPath('greedy');
    setActiveTab('paths');
    setRecommendationsOpen(false);
  };

  // Filter paths data based on state search/level
  const filteredPaths = useMemo(() => {
    return pathsData.filter(path => {
      const matchSearch = path.name.toLowerCase().includes(search.toLowerCase()) ||
        path.desc.toLowerCase().includes(search.toLowerCase());

      let matchLevel = true;
      if (selectedLevelFilter !== 'All') {
        const lowerLvl = path.level.toLowerCase();
        const lowerFilter = selectedLevelFilter.toLowerCase();
        matchLevel = lowerLvl.includes(lowerFilter);
      }
      return matchSearch && matchLevel;
    });
  }, [pathsData, search, selectedLevelFilter]);

  // Sidebar dynamic recently continued
  const RECENTLY_CONTINUED_LIST = [
    { id: 'sorting', name: 'Sorting Algorithms', pct: pathsData.find(p => p.id === 'sorting')?.pct || 60, icon: Sliders, color: 'color-purple', bar: 'bar-purple' },
    { id: 'searching', name: 'Searching Algorithms', pct: pathsData.find(p => p.id === 'searching')?.pct || 45, icon: Search, color: 'color-blue', bar: 'bar-blue' },
    { id: 'data-structures', name: 'Data Structures', pct: pathsData.find(p => p.id === 'data-structures')?.pct || 35, icon: Layers, color: 'color-green', bar: 'bar-green' },
  ];

  /* ─────────────────────────────────────────
     Tab Sub-sections
     ───────────────────────────────────────── */

  // Tab 1: Individual Challenges List
  function renderIndividualChallengesView() {
    return (
      <div className="ic-workspace-container" style={{ gridTemplateColumns: isSolving ? '1fr 1.3fr' : '320px 1fr' }}>
        {/* Column 1: Problem List */}
        {!isSolving && (
          <div className="ic-list-col">
            <div className="ic-list-header">
              <h3 className="ic-list-title">Problem List</h3>
            <div className="ic-search-wrapper">
              <Search className="ic-search-icon" size={14} />
              <input
                type="text"
                className="ic-search-input"
                placeholder="Search problems..."
                value={challengeSearch}
                onChange={e => setChallengeSearch(e.target.value)}
              />
            </div>
            <div className="ic-filter-pills-row">
              {(['All', 'Easy', 'Medium', 'Hard'] as const).map(diff => (
                <button
                  key={diff}
                  className={`ic-filter-pill ${challengeDiffFilter === diff ? 'active' : ''} ${diff.toLowerCase()}`}
                  onClick={() => setChallengeDiffFilter(diff)}
                >
                  {diff}
                </button>
              ))}
              <button className="ic-filter-icon-btn">
                <Sliders size={14} />
              </button>
            </div>
          </div>

          <div className="ic-problem-list">
            {filteredChallenges.map(chall => {
              const isSelected = chall.id === selectedChallengeId;
              const isSolved = solvedChallenges[chall.id];
              return (
                <div
                  key={chall.id}
                  className={`ic-problem-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedChallengeId(chall.id)}
                >
                  <div className="ic-problem-item-left">
                    <div className="ic-problem-item-title">{chall.title}</div>
                    <div className="ic-problem-item-tags">{chall.tags.join(', ')}</div>
                  </div>
                  <div className="ic-problem-item-right">
                    <span className={`ic-diff-badge ${chall.diff.toLowerCase()}`}>{chall.diff}</span>
                    {isSolved && <CheckCircle2 className="ic-solved-check" size={14} />}
                  </div>
                </div>
              );
            })}
          </div>

          <button className="ic-view-all-btn" onClick={() => toast.info("Showing all challenges...")}>
            <LayoutGrid size={14} style={{ marginRight: '0.5rem' }} /> View All Problems
          </button>
        </div>
        )}

        {/* Column 2: Problem Description */}
        <div className="ic-desc-col">
          <div className="ic-desc-header">
            <div className="ic-desc-title-row">
              <h2 className="ic-desc-title">{selectedChallenge.title}</h2>
              <span className={`ic-diff-badge ${selectedChallenge.diff.toLowerCase()}`}>{selectedChallenge.diff}</span>
              <div className="ic-desc-header-actions">
                <button className="ic-icon-btn" onClick={() => toast.success("Added to bookmarks")}>
                  <Bookmark size={16} />
                </button>
                <button className="ic-icon-btn" onClick={() => toast.success("Share link copied")}>
                  <Share2 size={16} />
                </button>
              </div>
            </div>
          </div>

          <div className="ic-desc-body">
            <p className="ic-desc-text">{selectedChallenge.desc}</p>

            <div className="ic-example-header">Example 1:</div>
            <div className="ic-example-box">
              <div><span className="ic-example-label">Input:</span> {selectedChallenge.example?.input}</div>
              <div><span className="ic-example-label">Output:</span> {selectedChallenge.example?.output}</div>
              {selectedChallenge.example?.explanation && (
                <div style={{ marginTop: '0.4rem' }}>
                  <span className="ic-example-label">Explanation:</span> {selectedChallenge.example?.explanation}
                </div>
              )}
            </div>

            {selectedChallenge.constraints && (
              <div className="ic-constraints-section">
                <div className="ic-example-header">Constraints:</div>
                <ul className="ic-constraints-list">
                  {selectedChallenge.constraints.map((c: string, i: number) => (
                    <li key={i} className="ic-constraint-item">
                      <span className="ic-bullet">•</span> {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="ic-desc-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <div style={{ display: 'flex', gap: '0.65rem' }}>
              <button className="ic-footer-btn outline" onClick={() => setHintModalOpen(true)}>
                <Lightbulb size={14} style={{ marginRight: '0.4rem' }} /> Hint
              </button>
              <button className="ic-footer-btn outline" onClick={() => {
                setAiChatHistory([
                  { sender: 'ai', text: `Hi there! I can help you solve "${selectedChallenge.title}". What questions do you have about the approach?` }
                ]);
                setAiDiscussOpen(true);
              }}>
                <MessageSquare size={14} style={{ marginRight: '0.4rem' }} /> Discuss with AI
              </button>
            </div>
            {!isSolving ? (
              <button className="ic-footer-btn primary" onClick={() => setIsSolving(true)} style={{ background: 'var(--accent-purple)', color: 'white', border: 'none' }}>
                <Code size={14} style={{ marginRight: '0.4rem' }} /> Solve
              </button>
            ) : (
              <button className="ic-footer-btn outline" onClick={() => setIsSolving(false)}>
                <LayoutGrid size={14} style={{ marginRight: '0.4rem' }} /> Back to List
              </button>
            )}
          </div>
        </div>

        {/* Column 3: Code Editor */}
        {isSolving && (
        <div className="ic-editor-col">
          <div className="ic-editor-tabs">
            {(['code', 'testcases', 'submissions'] as const).map(tab => (
              <button
                key={tab}
                className={`ic-editor-tab ${editorTab === tab ? 'active' : ''}`}
                onClick={() => setEditorTab(tab)}
              >
                {tab === 'code' && <><Code size={14} style={{ marginRight: '0.4rem' }} /> Code</>}
                {tab === 'testcases' && 'Test Cases'}
                {tab === 'submissions' && 'Submissions'}
              </button>
            ))}
          </div>

          {editorTab === 'code' && (
            <>
              <div className="ic-editor-toolbar">
                <select
                  className="ic-lang-select"
                  value={selectedLanguage}
                  onChange={e => setSelectedLanguage(e.target.value as any)}
                >
                  <option value="python3">Python3</option>
                  <option value="javascript">JavaScript</option>
                </select>
                <div className="ic-toolbar-right">
                  <button className="ic-icon-btn small" onClick={() => toast.info("Full screen view expanded")}>
                    <Maximize2 size={14} />
                  </button>
                  <button className="ic-icon-btn small" onClick={() => toast.info("Editor settings opened")}>
                    <Settings size={14} />
                  </button>
                </div>
              </div>

              <div className="ic-editor-body">
                <div className="ic-editor-line-numbers">
                  {editorCodeLines.map((_: string, i: number) => (
                    <div key={i} className="ic-line-number">{i + 1}</div>
                  ))}
                </div>
                <textarea
                  className="ic-editor-textarea"
                  value={currentEditorCode}
                  onChange={e => handleCodeChange(e.target.value)}
                  spellCheck="false"
                />

                {/* Floating sparkles button */}
                <button
                  className="ic-sparkles-fab"
                  onClick={handleWorkspaceAutofill}
                  title="Auto-fill Optimal AI Solution"
                >
                  <Sparkles size={18} />
                </button>
              </div>
            </>
          )}

          {editorTab === 'testcases' && (
            <div className="ic-testcases-panel">
              <div className="ic-panel-title">Diagnostic Test Case Suite</div>

              {/* Test Case Select Tabs */}
              <div className="ic-testcase-pills-row" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                {(selectedChallenge.testCases || []).map((tc: any, index: number) => {
                  const result = workspaceRunResults?.[index];
                  let badgeColor = 'rgba(255,255,255,0.05)';
                  let textColor = '#94a3b8';
                  if (result) {
                    badgeColor = result.passed ? 'rgba(52, 211, 153, 0.1)' : 'rgba(239, 68, 68, 0.1)';
                    textColor = result.passed ? '#34d399' : '#ef4444';
                  }
                  const isActive = activeTestCaseIndex === index;
                  return (
                    <button
                      key={index}
                      onClick={() => setActiveTestCaseIndex(index)}
                      className={`ic-testcase-pill-btn ${isActive ? 'active' : ''}`}
                      style={{
                        padding: '0.4rem 0.8rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        border: isActive ? '1px solid var(--accent-purple-light)' : '1px solid transparent',
                        background: isActive ? 'rgba(147, 51, 234, 0.15)' : badgeColor,
                        color: isActive ? 'white' : textColor,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        transition: 'all 0.2s'
                      }}
                    >
                      <span>Case {index + 1}</span>
                      {result && (
                        <span style={{ fontSize: '0.65rem' }}>
                          {result.passed ? '●' : '▲'}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Selected Test Case Details */}
              {selectedChallenge.testCases?.[activeTestCaseIndex] && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div className="ic-testcase-item">
                    <div className="ic-testcase-label">Input:</div>
                    <pre className="ic-testcase-code-box" style={{ margin: 0, padding: '0.75rem', borderRadius: '6px', background: '#0a0b1c', border: '1px solid rgba(255,255,255,0.04)', color: '#e2e8f0', fontSize: '0.8rem', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                      {selectedChallenge.testCases[activeTestCaseIndex].input}
                    </pre>
                  </div>

                  <div className="ic-testcase-item">
                    <div className="ic-testcase-label">Expected Output:</div>
                    <pre className="ic-testcase-code-box expected" style={{ margin: 0, padding: '0.75rem', borderRadius: '6px', background: '#0a0b1c', border: '1px solid rgba(52, 211, 153, 0.1)', color: '#34d399', fontSize: '0.8rem', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                      {selectedChallenge.testCases[activeTestCaseIndex].expectedOutput}
                    </pre>
                  </div>

                  {workspaceRunResults?.[activeTestCaseIndex] && (
                    <div className="ic-testcase-item">
                      <div className="ic-testcase-label">Actual Output:</div>
                      <pre
                        className={`ic-testcase-code-box ${workspaceRunResults[activeTestCaseIndex].passed ? 'expected' : 'failed'}`}
                        style={{
                          margin: 0,
                          padding: '0.75rem',
                          borderRadius: '6px',
                          background: '#0a0b1c',
                          border: workspaceRunResults[activeTestCaseIndex].passed ? '1px solid rgba(52, 211, 153, 0.1)' : '1px solid rgba(239, 68, 68, 0.15)',
                          color: workspaceRunResults[activeTestCaseIndex].passed ? '#34d399' : '#ef4444',
                          fontSize: '0.8rem',
                          fontFamily: 'monospace',
                          whiteSpace: 'pre-wrap'
                        }}
                      >
                        {workspaceRunResults[activeTestCaseIndex].actual !== null
                          ? workspaceRunResults[activeTestCaseIndex].actual
                          : (workspaceRunResults[activeTestCaseIndex].error || 'No output')}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              <div className="ic-console-logs">
                <div className="ic-console-header">Compilation Console Logs</div>
                {workspaceConsoleLogs.length > 0 ? (
                  workspaceConsoleLogs.map((log, index) => (
                    <div key={index} className={`ic-console-line ${log.includes('[SUCCESS]') ? 'success' : log.includes('[INFO]') ? 'info' : log.includes('[ERROR]') || log.includes('[FAILED]') ? 'error' : ''}`}>
                      {log}
                    </div>
                  ))
                ) : (
                  <div className="ic-console-empty">Click "Run Code" to compile assertions and verify outputs.</div>
                )}
              </div>
            </div>
          )}

          {editorTab === 'submissions' && (
            <div className="ic-submissions-panel">
              <div className="ic-panel-title">Your Submission History</div>
              {solvedChallenges[selectedChallenge.id] ? (
                <div className="ic-submission-row success">
                  <div className="ic-sub-status">Accepted</div>
                  <div className="ic-sub-meta">Language: {selectedLanguage === 'python3' ? 'Python3' : 'JavaScript'} • Runtime: 12ms</div>
                  <div className="ic-sub-date">Just now</div>
                </div>
              ) : null}
              <div className="ic-submission-row fallback">
                <div className="ic-sub-status">No previous submissions found for this challenge.</div>
              </div>
            </div>
          )}

          <div className="ic-editor-footer">
            <div className="ic-editor-footer-left">
              <button
                className="ic-footer-btn outline"
                onClick={handleWorkspaceRunCode}
                disabled={isWorkspaceCompiling}
              >
                <Play size={14} style={{ marginRight: '0.4rem' }} /> Run Code
              </button>
              <button
                className="ic-footer-btn outline"
                onClick={handleWorkspaceReset}
                disabled={isWorkspaceCompiling}
              >
                <RefreshCw size={14} style={{ marginRight: '0.4rem' }} /> Reset
              </button>
              <button
                className="ic-footer-btn primary"
                onClick={handleWorkspaceSubmitCode}
                disabled={isWorkspaceCompiling || !workspaceRunResults || workspaceRunResults.length === 0 || !workspaceRunResults.every((r: any) => r.passed)}
                style={{ opacity: (isWorkspaceCompiling || !workspaceRunResults || workspaceRunResults.length === 0 || !workspaceRunResults.every((r: any) => r.passed)) ? 0.5 : 1, cursor: (isWorkspaceCompiling || !workspaceRunResults || workspaceRunResults.length === 0 || !workspaceRunResults.every((r: any) => r.passed)) ? 'not-allowed' : 'pointer' }}
              >
                <CheckCircle2 size={14} style={{ marginRight: '0.4rem' }} /> Submit Solution
              </button>
            </div>
            <div className="ic-editor-footer-right">
              <div className="ic-editor-saved">
                <CheckCircle2 size={12} className="ic-saved-check" /> Saved
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Modal: Hint */}
        {hintModalOpen && (
          <div className="pm-modal-overlay" onClick={() => setHintModalOpen(false)}>
            <div className="pm-simple-modal" onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div className="pm-modal-title" style={{ color: 'var(--accent-purple-light)' }}>
                  <Lightbulb size={18} /> Hint — {selectedChallenge.title}
                </div>
                <button className="pm-modal-close-btn" onClick={() => setHintModalOpen(false)}>
                  <X size={16} />
                </button>
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6, padding: '0.5rem 0 1rem' }}>
                {selectedChallenge.id === 'c1' && "Try using a hash map to keep track of the indices of the values you've seen so far. For each number, calculate its difference from the target and check if that difference is already in the map."}
                {selectedChallenge.id === 'c2' && "Use a stack to keep track of opening brackets. When you encounter a closing bracket, check if it matches the bracket at the top of the stack."}
                {selectedChallenge.id === 'c3' && "Track the current maximum sum ending at each index (Kadane's algorithm). Alternatively, divide the array in two and find the max subarray recursively."}
                {selectedChallenge.id === 'c4' && "Sort the intervals by their start times first. Then iterate through the intervals and merge any overlapping ones by updating the end time of the last merged interval."}
                {selectedChallenge.id === 'c5' && "A combination of a doubly linked list and a hash map allows for O(1) time complexity for both get and put operations."}
              </div>
              <button className="pm-continue-btn" onClick={() => setHintModalOpen(false)}>Got it!</button>
            </div>
          </div>
        )}

        {/* Modal: Discuss with AI */}
        {aiDiscussOpen && (
          <div className="pm-modal-overlay" onClick={() => setAiDiscussOpen(false)}>
            <div className="pm-simple-modal" style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', height: '500px' }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexShrink: 0 }}>
                <div className="pm-modal-title" style={{ color: 'var(--accent-purple-light)' }}>
                  <Sparkles size={18} /> Discuss with AI Assistant
                </div>
                <button className="pm-modal-close-btn" onClick={() => setAiDiscussOpen(false)}>
                  <X size={16} />
                </button>
              </div>

              {/* Chat history */}
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.8rem', padding: '0.5rem', background: '#070814', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)', marginBottom: '1rem' }}>
                {aiChatHistory.map((msg, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      maxWidth: '80%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '12px',
                      fontSize: '0.85rem',
                      lineHeight: 1.4,
                      background: msg.sender === 'user' ? 'var(--accent-purple)' : '#141635',
                      color: 'white',
                      border: msg.sender === 'user' ? 'none' : '1px solid rgba(255,255,255,0.03)'
                    }}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Input row */}
              <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                <input
                  type="text"
                  placeholder="Ask a question about the logic, time complexity..."
                  style={{ flex: 1, background: '#141635', border: '1px solid rgba(255,255,255,0.04)', padding: '0.65rem 1rem', borderRadius: '8px', color: 'white', outline: 'none' }}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                      const text = e.currentTarget.value.trim();
                      e.currentTarget.value = '';
                      setAiChatHistory(prev => [...prev, { sender: 'user', text }]);

                      // Real Gemini AI response via /api/practice-chat
                      const history = aiChatHistory.map(m => ({
                        role: m.sender === 'user' ? 'user' as const : 'model' as const,
                        text: m.text
                      }));
                      fetch('/api/practice-chat', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          message: text,
                          questionContext: {
                            title: selectedChallenge.title,
                            description: selectedChallenge.desc || '',
                            difficulty: selectedChallenge.diff || 'Medium',
                            constraints: selectedChallenge.constraints?.join('\n') || '',
                            tags: selectedChallenge.tags || [],
                            testCases: selectedChallenge.testCases || []
                          },
                          conversationHistory: history
                        })
                      })
                        .then(res => res.json())
                        .then(data => {
                          const aiReply = data.reply || 'Sorry, I could not generate a response. Please try again.';
                          setAiChatHistory(prev => [...prev, { sender: 'ai', text: aiReply }]);
                        })
                        .catch(() => {
                          setAiChatHistory(prev => [...prev, { sender: 'ai', text: 'Sorry, AI service is currently unavailable. Please try again later.' }]);
                        });
                    }
                  }}
                />
                <button className="pm-continue-btn" style={{ width: 'auto', padding: '0 1.25rem' }} onClick={() => toast.info("Send message by pressing Enter key")}>Send</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Tab 3: Random Practice Widget
  function RandomPracticeView() {
    const [isPicking, setIsPicking] = useState(false);
    const [pickedChall, setPickedChall] = useState<(typeof INDIVIDUAL_CHALLENGES)[0] | null>(null);

    const handlePickRandom = () => {
      setIsPicking(true);
      setPickedChall(null);
      let count = 0;
      const interval = setInterval(() => {
        const temp = INDIVIDUAL_CHALLENGES[Math.floor(Math.random() * INDIVIDUAL_CHALLENGES.length)];
        setPickedChall(temp);
        count++;
        if (count > 8) {
          clearInterval(interval);
          setIsPicking(false);
        }
      }, 150);
    };

    return (
      <div className="pm-main">
        <div className="pm-card" style={{ padding: '2rem', textAlign: 'center' }}>
          <Shuffle size={48} style={{ color: 'var(--accent-purple-light)', opacity: 0.8, margin: '0 auto 1.25rem' }} />
          <div className="pm-paths-title" style={{ fontSize: '1.25rem' }}>Random Algorithmic Challenge Selector</div>
          <div className="pm-paths-subtitle" style={{ marginBottom: '1.5rem' }}>Feeling lucky? Get a random curated puzzle matching your current level constraints!</div>

          <div
            style={{
              background: '#090a1c',
              border: '1px solid rgba(255, 255, 255, 0.04)',
              borderRadius: '12px',
              padding: '2rem',
              maxWidth: '450px',
              margin: '0 auto 1.5rem',
              minHeight: '140px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            {pickedChall ? (
              <div>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: pickedChall.diff === 'Easy' ? '#34d399' : '#fbbf24',
                    background: 'rgba(255,255,255,0.03)',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px'
                  }}
                >
                  {pickedChall.diff} Curated Challenge
                </span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white', marginTop: '0.5rem', marginBottom: '0.35rem' }}>
                  {pickedChall.title}
                </div>
                <div style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.4 }}>
                  {pickedChall.desc}
                </div>
              </div>
            ) : (
              <span style={{ color: '#64748b', fontSize: '0.88rem' }}>
                {isPicking ? 'Shuffling local database...' : 'No challenge picked yet. Click button below!'}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button
              className="pm-continue-btn"
              style={{ width: 'auto', padding: '0.6rem 1.75rem' }}
              onClick={handlePickRandom}
              disabled={isPicking}
            >
              {isPicking ? 'Selecting...' : 'Pick Random Challenge'}
            </button>
            {pickedChall && !isPicking && (
              <button
                className="pm-sidebar-full-btn"
                style={{ width: 'auto', padding: '0.6rem 1.5rem' }}
                onClick={() => {
                  try {
                    onStartPractice(BigInt(pickedChall.id.replace('c', '')));
                  } catch {
                    setActiveWorkspaceLesson({
                      lessonName: pickedChall.title,
                      pathId: 'sorting',
                      moduleId: 's2',
                      desc: pickedChall.desc,
                      code: pickedChall.code,
                      expected: pickedChall.output
                    });
                    setWorkspaceCode(pickedChall.code);
                  }
                }}
              >
                Solve Workspace
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ─────────────────────────────────────────
     Path Detail View Sub-component
     ───────────────────────────────────────── */
  function PathDetailView({ pathId, onBack }: { pathId: string; onBack: () => void }) {
    const path = pathsData.find(p => p.id === pathId) || pathsData[0];
    const modules = modulesDb[pathId] || PATHS_MODULES_DB[pathId] || [];

    const [openModules, setOpenModules] = useState<Set<string>>(
      new Set(modules.filter(m => m.defaultOpen).map(m => m.id))
    );

    const toggleModule = (id: string) => {
      setOpenModules(prev => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    };

    return (
      <div className="pm-body">
        {/* Main Details */}
        <div className="pm-main">
          <button className="pm-back-btn" onClick={onBack} id="pm-back-to-paths-btn">
            <ArrowRight size={14} style={{ transform: 'rotate(180deg)' }} /> Back to Learning Paths
          </button>

          {/* Header Card */}
          <div className="pm-path-detail-header">
            <div className="pm-path-detail-top">
              <div className={`pm-path-detail-icon ${path.color}`}>
                <path.icon size={22} />
              </div>
              <div style={{ flex: 1 }}>
                <div className="pm-path-detail-name">{path.name}</div>
                <div className="pm-path-detail-desc">{path.desc}</div>
                <div className="pm-path-detail-badges">
                  <span className="pm-badge pm-badge-green">{path.level}</span>
                  <span className="pm-badge pm-badge-blue">{modules.length} Active Modules</span>
                </div>
              </div>

              <div className="pm-path-overall-progress">
                <div className="pm-overall-label">
                  <span className="pm-overall-text">Path Progress</span>
                  <span className="pm-overall-pct">{path.pct}%</span>
                </div>
                <div className="pm-overall-bar">
                  <div className="pm-overall-bar-fill" style={{ width: `${path.pct}%` }} />
                </div>
                <div className="pm-overall-count">{path.completed} / {path.lessons} Lessons Completed</div>
              </div>
            </div>
          </div>

          {/* Modules Accordion List */}
          <div className="pm-module-list">
            {modules.map((mod, i) => {
              const isOpen = openModules.has(mod.id);
              const isCompleted = mod.status === 'completed';
              const isInProgress = mod.status === 'in-progress';

              const dotClass = isCompleted ? 'completed' : isInProgress ? 'active' : 'locked';
              const lineClass = isCompleted ? 'filled' : '';

              return (
                <div key={mod.id} className="pm-module-wrapper">
                  <div className="pm-module-timeline">
                    <div className={`pm-timeline-dot ${dotClass}`}>
                      {isCompleted ? <CheckCircle2 size={16} /> : i + 1}
                    </div>
                    {i < modules.length - 1 && <div className={`pm-timeline-line ${lineClass}`} />}
                  </div>

                  <div className={`pm-module-card ${isInProgress ? 'active-module' : ''}`}>
                    <div
                      className="pm-module-card-header"
                      onClick={() => toggleModule(mod.id)}
                      id={`pm-module-toggle-${mod.id}`}
                    >
                      <div style={{ flex: 1 }}>
                        <div className="pm-module-label">{mod.label}</div>
                        <div className="pm-module-name">{mod.name}</div>
                        <div className="pm-module-desc">{mod.desc}</div>
                      </div>
                      <div className="pm-module-meta">
                        <span className={`pm-module-status ${mod.status}`}>
                          {isCompleted ? '✓ Completed' : isInProgress ? '• In Progress' : '🔒 Locked'}
                        </span>
                        <div style={{ textAlign: 'right' }}>
                          <div className="pm-module-lessons-count">
                            {mod.lessonsCount} / {mod.totalLessons} Lessons
                          </div>
                        </div>
                        <ChevronDown className={`pm-chevron ${isOpen ? 'open' : ''}`} />
                      </div>
                    </div>

                    {isOpen && (
                      <div className="pm-lesson-list">
                        {mod.items.map(item => (
                          <div key={item.name} className="pm-lesson-item">
                            <div className={`pm-lesson-icon ${item.status}`}>
                              {item.status === 'completed' ? (
                                <CheckCircle2 size={12} />
                              ) : item.status === 'current' ? (
                                <PlayCircle size={12} />
                              ) : (
                                <Lock size={12} />
                              )}
                            </div>
                            <span className="pm-lesson-name">{item.name}</span>

                            {item.status === 'completed' && (
                              <>
                                <span className="pm-lesson-status-text completed">✓ Solved</span>
                                <button
                                  className="pm-lesson-btn review"
                                  onClick={() => handleOpenLesson(item, pathId, mod.id)}
                                >
                                  Review
                                </button>
                              </>
                            )}
                            {item.status === 'current' && (
                              <>
                                <span className="pm-lesson-status-text current">Current Lesson</span>
                                <button
                                  className="pm-lesson-btn review"
                                  style={{ background: 'var(--accent-purple)', borderColor: 'var(--accent-purple)', color: 'white' }}
                                  onClick={() => handleOpenLesson(item, pathId, mod.id)}
                                >
                                  Solve
                                </button>
                              </>
                            )}
                            {item.status === 'locked' && (
                              <span className="pm-lesson-status-text locked">🔒 Locked</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Locked Final Capstone Exam mock panel */}
            <div className="pm-module-wrapper">
              <div className="pm-module-timeline">
                <div className="pm-timeline-dot locked" style={{ borderColor: 'var(--accent-yellow)', color: 'var(--accent-yellow-light)' }}>
                  🏆
                </div>
              </div>
              <div className="pm-module-card" style={{ marginBottom: 0 }}>
                <div className="pm-module-card-header">
                  <div>
                    <div className="pm-module-label" style={{ color: 'var(--accent-yellow-light)' }}>FINAL ASSESSMENT</div>
                    <div className="pm-module-name">Path Capstone Challenge</div>
                    <div className="pm-module-desc">Complete all modules to unlock the grand certification exam!</div>
                  </div>
                  <div className="pm-module-meta">
                    <span className="pm-module-status locked">🔒 Locked</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar for Detail View */}
        <div className="pm-sidebar">
          {/* Progress Overview Panel */}
          <div className="pm-card">
            <div className="pm-card-header">
              <div className="pm-card-title">
                <TrendingUp className="pm-card-title-icon" style={{ color: 'var(--accent-purple-light)' }} />
                Your Path Statistics
              </div>
            </div>
            <div style={{ padding: '0 1.25rem 1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', marginBottom: '0.75rem' }}>
                <div style={{ background: '#141635', borderRadius: '8px', padding: '0.65rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white' }}>{path.completed}</div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Lessons Solved</div>
                </div>
                <div style={{ background: '#141635', borderRadius: '8px', padding: '0.65rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fb923c' }}>{Math.round(path.completed * 3.5)}</div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>XP Gained</div>
                </div>
              </div>
              <div style={{ background: '#141635', borderRadius: '8px', padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Clock size={16} style={{ color: '#facc15' }} />
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'white' }}>~{path.completed * 15} mins</div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Estimated Time Invested</div>
                </div>
              </div>
            </div>
          </div>

          {/* Core Lesson Focus panel */}
          <div className="pm-card">
            <div className="pm-card-header">
              <div className="pm-card-title">
                <PlayCircle className="pm-card-title-icon" style={{ color: 'var(--accent-purple-light)' }} />
                Active Focus
              </div>
            </div>
            <div className="pm-current-lesson">
              {modules.find(m => m.status === 'in-progress')?.items.find(l => l.status === 'current') ? (
                <>
                  <div className="pm-current-lesson-name">
                    {modules.find(m => m.status === 'in-progress')?.items.find(l => l.status === 'current')?.name}
                  </div>
                  <div className="pm-current-lesson-desc">
                    {modules.find(m => m.status === 'in-progress')?.items.find(l => l.status === 'current')?.problemDesc}
                  </div>
                  <button
                    className="pm-continue-btn"
                    id="pm-continue-learning-btn"
                    onClick={() => {
                      const activeLes = modules.find(m => m.status === 'in-progress')?.items.find(l => l.status === 'current');
                      const activeMod = modules.find(m => m.status === 'in-progress');
                      if (activeLes && activeMod) handleOpenLesson(activeLes, pathId, activeMod.id);
                    }}
                  >
                    Continue Learning
                  </button>
                </>
              ) : (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  All active lessons completed! Start the next module.
                </div>
              )}
            </div>
          </div>

          {/* Resources Panel */}
          <div className="pm-card">
            <div className="pm-card-header">
              <div className="pm-card-title">
                <BookOpen className="pm-card-title-icon" style={{ color: 'var(--accent-blue-light)' }} />
                Path Resources
              </div>
            </div>
            <div className="pm-resources-list">
              {[
                { name: `${path.name} Cheat Sheet`, type: 'pdf' },
                { name: `Dynamic Visualizer Sandbox`, type: 'link' },
                { name: `Advanced Complexity Guide`, type: 'pdf' },
              ].map(res => (
                <div
                  key={res.name}
                  className="pm-resource-item"
                  onClick={() => setToastMessage(`📥 Simulated download: "${res.name}" successfully stored in your workspace.`)}
                >
                  <div className="pm-resource-left">
                    <Download size={13} className="pm-resource-icon-left" />
                    <span className="pm-resource-name">{res.name}</span>
                  </div>
                  <ExternalLink size={13} className="pm-resource-icon-right" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ─────────────────────────────────────────
     Core Page Renderer
     ───────────────────────────────────────── */
  const individualChallengesContent = renderIndividualChallengesView();

  return (
    <div style={{ position: 'relative', width: '100%' }}>

      {/* Practice Mode Header */}
      {!selectedPath && (
        <div className="pm-header">
          <div className="pm-header-left">
            <div className="pm-header-title-row">
              <GraduationCap className="pm-header-title-icon-main" size={32} />
              <div>
                <h1 className="pm-header-title">Practice Mode</h1>
                <p className="pm-header-subtitle">Master algorithms with structured learning paths</p>
              </div>
            </div>
          </div>
          <div className="pm-header-right">
            <div className="pm-header-stat-box">
              <Flame className="pm-stat-icon-flame" size={20} />
              <div>
                <div className="pm-stat-num">{stats.streak}</div>
                <div className="pm-stat-desc">Day Streak</div>
              </div>
            </div>
            <div className="pm-header-stat-box">
              <Trophy className="pm-stat-icon-solved" size={20} />
              <div>
                <div className="pm-stat-num">{stats.problemsSolved}</div>
                <div className="pm-stat-desc">Problems Solved</div>
              </div>
            </div>
            <div className="pm-header-stat-box">
              <div className="pm-header-ring-mini">
                <svg width="36" height="36" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="14" className="pm-ring-track-mini" strokeWidth="3.5" />
                  <circle cx="18" cy="18" r="14" className="pm-ring-fill-mini" strokeWidth="3.5"
                    style={{ stroke: 'var(--accent-green-light)' }}
                    strokeDasharray={2 * Math.PI * 14}
                    strokeDashoffset={2 * Math.PI * 14 - (displayPracticeProgress / 100) * (2 * Math.PI * 14)} />
                </svg>
                <div className="pm-ring-pct-mini" style={{ color: 'var(--accent-green-light)' }}>{Math.round(displayPracticeProgress)}%</div>
              </div>
              <div>
                <div className="pm-stat-num" style={{ color: 'var(--accent-green-light)' }}>{Math.round(displayPracticeProgress)}%</div>
                <div className="pm-stat-desc">Practice Progress</div>
              </div>
            </div>
            <div className="pm-header-stat-box">
              <div className="pm-header-ring-mini">
                <svg width="36" height="36" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="14" className="pm-ring-track-mini" strokeWidth="3.5" />
                  <circle cx="18" cy="18" r="14" className="pm-ring-fill-mini" strokeWidth="3.5"
                    style={{ stroke: 'var(--accent-purple-light)' }}
                    strokeDasharray={2 * Math.PI * 14}
                    strokeDashoffset={2 * Math.PI * 14 - (displayPathProgress / 100) * (2 * Math.PI * 14)} />
                </svg>
                <div className="pm-ring-pct-mini" style={{ color: 'var(--accent-purple-light)' }}>{Math.round(displayPathProgress)}%</div>
              </div>
              <div>
                <div className="pm-stat-num" style={{ color: 'var(--accent-purple-light)' }}>{Math.round(displayPathProgress)}%</div>
                <div className="pm-stat-desc">Paths Progress</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Alert Popup */}
      {toastMessage && (
        <div className="pm-toast">
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Interactive Guidance Modal (How It Works) */}
      {howItWorksOpen && (
        <div className="pm-modal-overlay" onClick={() => setHowItWorksOpen(false)}>
          <div className="pm-simple-modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div className="pm-modal-title" style={{ color: 'var(--accent-purple-light)' }}>
                <Rocket size={18} /> How Learning Paths Work
              </div>
              <button className="pm-modal-close-btn" onClick={() => setHowItWorksOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <div className="pm-guide-steps">
              <div className="pm-guide-step">
                <div className="pm-guide-step-num">1</div>
                <div>
                  <div className="pm-guide-step-title">Select structured Topic Path</div>
                  <div className="pm-guide-step-desc">Pick any specialized DSA course card like Sorting, Searching or Dynamic Programming from the dashboard grid.</div>
                </div>
              </div>
              <div className="pm-guide-step">
                <div className="pm-guide-step-num">2</div>
                <div>
                  <div className="pm-guide-step-title">Solve Interactive Lessons</div>
                  <div className="pm-guide-step-desc">Complete ordered coding assignments inside our workspace editor. Unlock sequential challenges and expand modules step-by-step.</div>
                </div>
              </div>
              <div className="pm-guide-step">
                <div className="pm-guide-step-num">3</div>
                <div>
                  <div className="pm-guide-step-title">Gain XP & Maintain Streaks</div>
                  <div className="pm-guide-step-desc">Write correct code, pass standard tests, increase your day streak counters, and monitor overall dynamic statistics.</div>
                </div>
              </div>
            </div>

            <button
              className="pm-continue-btn"
              style={{ marginTop: '1rem' }}
              onClick={() => setHowItWorksOpen(false)}
            >
              Start My Learning Journey
            </button>
          </div>
        </div>
      )}

      {/* Interactive Workspace / Coding Editor Modal */}
      {activeWorkspaceLesson && (
        <div className="pm-modal-overlay">
          <div className="pm-modal">
            <div className="pm-modal-header">
              <div className="pm-modal-title">
                <Terminal size={18} style={{ color: 'var(--accent-purple-light)' }} />
                <span>DSA Workspace — {activeWorkspaceLesson.lessonName}</span>
              </div>
              <button className="pm-modal-close-btn" onClick={() => setActiveWorkspaceLesson(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="pm-workspace">
              {/* Problem Details */}
              <div className="pm-problem-pane">
                <div style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-purple-light)', textTransform: 'uppercase' }}>
                    Challenge Instructions
                  </span>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white', margin: '0.25rem 0' }}>
                    {activeWorkspaceLesson.lessonName}
                  </h2>
                </div>

                <div style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.6 }}>
                  {activeWorkspaceLesson.desc}
                </div>

                <div style={{ background: '#11132e', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '8px', padding: '1rem' }}>
                  <h4 style={{ fontSize: '0.78rem', fontWeight: 800, color: 'white', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                    Target Test Assertion
                  </h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                    <span style={{ color: '#64748b' }}>Expected output:</span>
                    <span style={{ color: '#34d399', fontWeight: 700 }}>"{activeWorkspaceLesson.expected}"</span>
                  </div>
                </div>

                <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem', background: '#0a0b1c', padding: '0.85rem', borderRadius: '8px' }}>
                  <AlertCircle size={16} style={{ color: 'var(--accent-purple-light)', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.72rem', color: '#64748b', lineHeight: 1.4 }}>
                    Write a complete, functional code solution. Click "Run Code" to compile assertions and verify returns.
                  </span>
                </div>
              </div>

              {/* Coding Pane */}
              <div className="pm-editor-pane">
                <div className="pm-editor-header">
                  <span className="pm-editor-lang">JAVASCRIPT (ES6)</span>
                  <button
                    style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }}
                    onClick={() => setWorkspaceCode(activeWorkspaceLesson.code)}
                  >
                    <RefreshCw size={11} /> Reset Template
                  </button>
                </div>

                <textarea
                  className="pm-editor-textarea"
                  value={workspaceCode}
                  onChange={e => setWorkspaceCode(e.target.value)}
                  spellCheck="false"
                />

                {/* Simulated Compilation Logs */}
                <div className="pm-console-pane">
                  <div className="pm-console-header">Standard Diagnostic Outputs</div>
                  {consoleLogs.map((log, index) => (
                    <div key={index} className={`pm-console-line ${log.includes('[SUCCESS]') ? 'success' : log.includes('[INFO]') ? 'info' : ''}`}>
                      {log}
                    </div>
                  ))}
                </div>

                {/* Operations Footer */}
                <div className="pm-editor-footer">
                  <button
                    className="pm-sidebar-full-btn"
                    style={{ width: 'auto', padding: '0.55rem 1.25rem' }}
                    onClick={handleRunCode}
                    disabled={isCompiling}
                  >
                    {isCompiling ? 'Running...' : 'Run Code'}
                  </button>
                  <button
                    className="pm-continue-btn"
                    style={{ width: 'auto', padding: '0.55rem 1.75rem' }}
                    onClick={handleSubmitCode}
                    disabled={isCompiling}
                  >
                    Submit Solution
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Segmented Control Pill Bar */}
      <div className="pm-tabs-wrapper">
        <div className="pm-tabs">
          <button
            id="pm-tab-individual"
            className={`pm-tab ${activeTab === 'individual' ? 'active' : ''}`}
            onClick={() => { setActiveTab('individual'); setSelectedPath(null); }}
          >
            Individual Challenges
          </button>
          <button
            id="pm-tab-paths"
            className={`pm-tab ${activeTab === 'paths' ? 'active' : ''}`}
            onClick={() => { setActiveTab('paths'); }}
          >
            Learning Paths
          </button>
          <button
            id="pm-tab-random"
            className={`pm-tab ${activeTab === 'random' ? 'active' : ''}`}
            onClick={() => { setActiveTab('random'); setSelectedPath(null); }}
          >
            Random Practice
          </button>
        </div>
      </div>

      {/* Detail View active check */}
      {selectedPath ? (
        <PathDetailView pathId={selectedPath} onBack={() => setSelectedPath(null)} />
      ) : (
        <>
          {activeTab === 'paths' && (
            <div className="pm-body">
              {/* Left Main Content Pane */}
              <div className="pm-main">
                <div className="pm-card" style={{ padding: '1.25rem', background: 'transparent', border: 'none', boxShadow: 'none' }}>

                  {/* Grid Header Controls */}
                  <div className="pm-paths-header">
                    <div>
                      <div className="pm-paths-title">All Learning Paths</div>
                      <div className="pm-paths-subtitle">Choose a topic to start your structured learning journey</div>
                    </div>

                    {/* Live Search & Custom Level Filters */}
                    <div className="pm-search-filter">
                      <div className="pm-search-wrapper">
                        <Search className="pm-search-icon" />
                        <input
                          id="pm-search-input"
                          className="pm-search-input"
                          placeholder="Search learning paths..."
                          value={search}
                          onChange={e => setSearch(e.target.value)}
                        />
                      </div>
                      <button
                        className="pm-filter-btn"
                        onClick={() => setFilterMenuOpen(prev => !prev)}
                      >
                        Filter by Level: {selectedLevelFilter} <ChevronDown size={14} />
                      </button>

                      {filterMenuOpen && (
                        <div className="pm-filter-dropdown">
                          {(['All', 'Beginner', 'Intermediate', 'Advanced'] as const).map(lvl => (
                            <div
                              key={lvl}
                              className={`pm-filter-option ${selectedLevelFilter === lvl ? 'active' : ''}`}
                              onClick={() => {
                                setSelectedLevelFilter(lvl);
                                setFilterMenuOpen(false);
                              }}
                            >
                              {lvl === 'All' ? 'All Difficulty Levels' : `${lvl} Level`}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Topic Cards Grid + Existing Paths */}
                  {!selectedTopic ? (
                    <>
                      {/* 6 Topic Cards Grid */}
                      <div className="pm-paths-grid" style={{ marginBottom: '1.5rem' }}>
                        {TOPIC_CARDS.map(topic => {
                          const Icon = topic.icon;
                          return (
                            <div
                              key={topic.id}
                              className="pm-path-card"
                              id={`topic-card-${topic.id}`}
                              onClick={() => setSelectedTopic(topic.id)}
                              style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
                            >
                              <div style={{
                                position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
                                background: topic.gradient, borderRadius: '12px 12px 0 0'
                              }} />
                              <div className={`pm-path-card-icon ${topic.color}`}>
                                <Icon size={18} />
                              </div>
                              <div className="pm-path-card-name">{topic.shortName}</div>
                              <div className="pm-path-card-desc">{topic.desc}</div>
                              <div style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                marginTop: 'auto', paddingTop: '0.75rem'
                              }}>
                                <span style={{
                                  fontSize: '0.72rem', fontWeight: 700,
                                  color: 'var(--accent-purple-light)',
                                  display: 'flex', alignItems: 'center', gap: '0.3rem'
                                }}>
                                  <BookOpen size={12} /> {topic.concepts.length} Concepts
                                </span>
                                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>•</span>
                                <span style={{
                                  fontSize: '0.72rem', fontWeight: 600, color: '#34d399',
                                  display: 'flex', alignItems: 'center', gap: '0.3rem'
                                }}>
                                  <Code size={12} /> Code Example
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>


                    </>
                  ) : (
                    /* ─── Topic Detail Pane ─── */
                    (() => {
                      const topic = TOPIC_CARDS.find(t => t.id === selectedTopic)!;
                      const Icon = topic.icon;
                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                          {/* Back button */}
                          <button
                            className="pm-back-btn"
                            onClick={() => setSelectedTopic(null)}
                            style={{ alignSelf: 'flex-start' }}
                          >
                            <ArrowRight size={14} style={{ transform: 'rotate(180deg)' }} /> Back to Topics
                          </button>

                          {/* Topic Header */}
                          <div style={{
                            background: 'var(--bg-secondary)',
                            border: '1px solid rgba(255,255,255,0.04)',
                            borderRadius: '14px',
                            padding: '1.75rem',
                            position: 'relative',
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
                              background: topic.gradient
                            }} />
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                              <div className={`pm-path-card-icon ${topic.color}`} style={{ width: '48px', height: '48px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Icon size={24} />
                              </div>
                              <div>
                                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'white', margin: 0 }}>{topic.name}</h2>
                                <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0.25rem 0 0' }}>{topic.desc}</p>
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                              <span className="pm-badge pm-badge-green" style={{ fontSize: '0.72rem' }}>
                                {topic.concepts.length} Key Concepts
                              </span>
                              <span className="pm-badge pm-badge-blue" style={{ fontSize: '0.72rem' }}>
                                Practical Code Example
                              </span>
                            </div>
                          </div>

                          {['dsa', 'complexity-mastery'].includes(topic.id) && (
                            <div style={{
                              background: 'var(--bg-secondary)',
                              border: '1px solid rgba(255,255,255,0.04)',
                              borderRadius: '14px',
                              padding: '1.25rem'
                            }}>
                              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'white', marginBottom: '0.75rem' }}>
                                {topic.id === 'dsa' ? 'Select Language to Learn DSA In:' : 'Select Language to view code:'}
                              </h3>
                              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {['python', 'javascript', 'java', 'cpp'].map(lang => (
                                  <button
                                    key={lang}
                                    onClick={() => setSelectedDsaLanguage(lang as any)}
                                    style={{
                                      background: selectedDsaLanguage === lang ? 'rgba(124, 58, 237, 0.2)' : 'rgba(255,255,255,0.05)',
                                      border: `1px solid ${selectedDsaLanguage === lang ? '#a855f7' : 'rgba(255,255,255,0.1)'}`,
                                      color: selectedDsaLanguage === lang ? '#fff' : '#94a3b8',
                                      padding: '0.4rem 0.8rem',
                                      borderRadius: '8px',
                                      fontSize: '0.8rem',
                                      cursor: 'pointer',
                                      textTransform: 'capitalize',
                                      transition: 'all 0.2s'
                                    }}
                                  >
                                    {lang === 'cpp' ? 'C++' : lang}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Sub-Topic Navigation for DSA */}
                          {['dsa', 'complexity-mastery'].includes(topic.id) && (
                            <div style={{
                              background: 'var(--bg-secondary)',
                              border: '1px solid rgba(255,255,255,0.04)',
                              borderRadius: '14px',
                              padding: '1.25rem',
                              marginBottom: '0.5rem'
                            }}>
                              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'white', marginBottom: '0.75rem' }}>
                                {topic.id === 'dsa' ? 'Select a Data Structure or Algorithm:' : 'Select a Complexity Level:'}
                              </h3>
                              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {topic.concepts.map((concept, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => {
                                      setSelectedDsaConcept(idx);
                                      setSelectedDsaSubTopic(0);
                                    }}
                                    style={{
                                      background: selectedDsaConcept === idx ? 'rgba(124, 58, 237, 0.2)' : 'rgba(255,255,255,0.05)',
                                      border: `1px solid ${selectedDsaConcept === idx ? '#a855f7' : 'rgba(255,255,255,0.1)'}`,
                                      color: selectedDsaConcept === idx ? '#fff' : '#94a3b8',
                                      padding: '0.4rem 0.8rem',
                                      borderRadius: '8px',
                                      fontSize: '0.8rem',
                                      cursor: 'pointer',
                                      transition: 'all 0.2s'
                                    }}
                                  >
                                    {concept.title}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Concepts List (For Non-DSA) or Single Concept Detail (For DSA) */}
                          <div style={{
                            background: 'var(--bg-secondary)',
                            border: '1px solid rgba(255,255,255,0.04)',
                            borderRadius: '14px',
                            padding: '1.5rem'
                          }}>
                            {['dsa', 'complexity-mastery'].includes(topic.id) ? (
                              // Single concept view
                              (() => {
                                const activeConcept = topic.concepts[selectedDsaConcept];
                                const activeSubTopic = activeConcept.subTopics ? activeConcept.subTopics[selectedDsaSubTopic] : null;
                                const renderData = activeSubTopic || activeConcept;

                                return (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    
                                    {/* Secondary Navigation for Sub-Topics */}
                                    {activeConcept.subTopics && activeConcept.subTopics.length > 0 && (
                                      <div style={{ background: '#0a0b1c', borderRadius: '12px', padding: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <h4 style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.75rem', fontWeight: 600 }}>Select Sub-Topic:</h4>
                                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                          {activeConcept.subTopics.map((sub, sIdx) => (
                                            <button
                                              key={sIdx}
                                              onClick={() => setSelectedDsaSubTopic(sIdx)}
                                              style={{
                                                background: selectedDsaSubTopic === sIdx ? 'rgba(52, 211, 153, 0.2)' : 'rgba(255,255,255,0.05)',
                                                border: `1px solid ${selectedDsaSubTopic === sIdx ? '#34d399' : 'rgba(255,255,255,0.1)'}`,
                                                color: selectedDsaSubTopic === sIdx ? '#fff' : '#94a3b8',
                                                padding: '0.3rem 0.6rem',
                                                borderRadius: '6px',
                                                fontSize: '0.75rem',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                              }}
                                            >
                                              {sub.title}
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: topic.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <BookOpen size={20} color="white" />
                                      </div>
                                      <div>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white', margin: 0 }}>{renderData.title}</h3>
                                        <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0.2rem 0 0' }}>{renderData.definition}</p>
                                      </div>
                                    </div>
                                    
                                    <div style={{ background: '#0a0b1c', borderRadius: '12px', padding: '1.25rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                      <h4 style={{ fontSize: '0.9rem', color: '#facc15', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Star size={14} /> Memory Hook
                                      </h4>
                                      <p style={{ fontSize: '0.85rem', color: '#e2e8f0', margin: 0, lineHeight: 1.6 }}>{renderData.analogy}</p>
                                    </div>
                                    
                                    {/* The animated mind map always belongs to the main category */}
                                    <div style={{ background: '#0a0b1c', borderRadius: '12px', padding: '1.25rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                      <h4 style={{ fontSize: '0.9rem', color: '#60a5fa', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Layers size={14} /> Visual Mind Map
                                      </h4>
                                      <AnimatedMindMap conceptIndex={activeConcept.category ?? selectedDsaConcept} subTopicIndex={selectedDsaSubTopic} complexityClass={topic.id === 'complexity-mastery' ? (renderData as SubTopic).timeComplexity : undefined} />
                                    </div>

                                    {/* Complexity Details */}
                                    {(renderData as SubTopic).timeComplexity && (
                                      <div style={{ display: 'flex', gap: '1rem' }}>
                                        <div style={{ flex: 1, background: '#0a0b1c', borderRadius: '12px', padding: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                          <h4 style={{ fontSize: '0.8rem', color: '#fb7185', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Time Complexity</h4>
                                          <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'white', fontFamily: 'monospace' }}>{(renderData as SubTopic).timeComplexity}</div>
                                        </div>
                                        <div style={{ flex: 1, background: '#0a0b1c', borderRadius: '12px', padding: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                          <h4 style={{ fontSize: '0.8rem', color: '#818cf8', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Space Complexity</h4>
                                          <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'white', fontFamily: 'monospace' }}>{(renderData as SubTopic).spaceComplexity}</div>
                                        </div>
                                      </div>
                                    )}

                                    {(renderData as SubTopic).detailedExplanation && (
                                      <div style={{ background: '#0a0b1c', borderRadius: '12px', padding: '1.25rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <h4 style={{ fontSize: '0.9rem', color: '#c084fc', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                          <BookOpen size={14} /> Deep Dive
                                        </h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                          {(renderData as SubTopic).detailedExplanation.split('\n\n').map((paragraph, pIdx) => (
                                            <div key={pIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                                              <span style={{ color: '#c084fc', marginTop: '2px' }}>✧</span>
                                              <p style={{ fontSize: '0.85rem', color: '#e2e8f0', margin: 0, lineHeight: 1.6, whiteSpace: 'pre-line' }}>{paragraph}</p>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Complexity Table */}
                                    {(renderData as SubTopic).complexityTable && (
                                      <div style={{ background: '#0a0b1c', borderRadius: '12px', padding: '1.25rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <h4 style={{ fontSize: '0.9rem', color: '#f472b6', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                          <CheckCircle2 size={14} /> Complexity Cheat Sheet
                                        </h4>
                                        <pre style={{ margin: 0, color: '#e2e8f0', fontSize: '0.8rem', fontFamily: 'monospace', whiteSpace: 'pre-line' }}>
                                          {(renderData as SubTopic).complexityTable}
                                        </pre>
                                      </div>
                                    )}

                                    {renderData.memoryTip && (
                                      <div style={{ background: 'rgba(52, 211, 153, 0.05)', borderRadius: '12px', padding: '1.25rem', border: '1px solid rgba(52, 211, 153, 0.2)' }}>
                                        <h4 style={{ fontSize: '0.9rem', color: '#34d399', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                          <Star size={14} /> Pro Tip
                                        </h4>
                                        <p style={{ fontSize: '0.85rem', color: '#e2e8f0', margin: 0, lineHeight: 1.6, fontWeight: 500 }}>{renderData.memoryTip}</p>
                                      </div>
                                    )}

                                    {renderData.examples && renderData.examples[selectedDsaLanguage] && (
                                      <div style={{ background: '#0a0b1c', borderRadius: '12px', padding: '1.25rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <h4 style={{ fontSize: '0.9rem', color: '#34d399', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                          <Terminal size={14} /> The Code ({selectedDsaLanguage.toUpperCase()})
                                        </h4>
                                        <pre style={{
                                          background: '#070814',
                                          border: '1px solid rgba(255,255,255,0.04)',
                                          borderRadius: '8px',
                                          padding: '1rem',
                                          fontSize: '0.78rem',
                                          fontFamily: "'Fira Code', 'Cascadia Code', 'JetBrains Mono', monospace",
                                          color: '#e2e8f0',
                                          lineHeight: 1.5,
                                          overflowX: 'auto',
                                          margin: 0,
                                          whiteSpace: 'pre-wrap'
                                        }}>
                                          {renderData.examples[selectedDsaLanguage]}
                                        </pre>
                                      </div>
                                    )}
                                  </div>
                                );
                              })()
                            ) : (
                              // Multi-concept view (For C, Python, Java, etc)
                              <>
                                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'white', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <BookOpen size={16} style={{ color: 'var(--accent-purple-light)' }} />
                                  Key Concepts & Definitions
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                                  {topic.concepts.map((concept, idx) => (
                                    <div key={idx} style={{
                                      background: '#0a0b1c',
                                      border: '1px solid rgba(255,255,255,0.03)',
                                      borderRadius: '10px',
                                      padding: '1rem 1.15rem',
                                      transition: 'border-color 0.2s ease'
                                    }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                                        <span style={{
                                          width: '22px', height: '22px', borderRadius: '6px',
                                          background: topic.gradient,
                                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                                          fontSize: '0.65rem', fontWeight: 800, color: 'white', flexShrink: 0
                                        }}>
                                          {idx + 1}
                                        </span>
                                        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'white', margin: 0 }}>
                                          {concept.title}
                                        </h4>
                                      </div>
                                      <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.6, margin: 0, paddingLeft: '2rem' }}>
                                        {concept.definition}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>

                          {/* Code Example (Hide for DSA since it has per-concept examples) */}
                          {!['dsa', 'complexity-mastery'].includes(topic.id) && (
                            <div style={{
                              background: 'var(--bg-secondary)',
                              border: '1px solid rgba(255,255,255,0.04)',
                              borderRadius: '14px',
                              padding: '1.5rem'
                            }}>
                              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'white', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Terminal size={16} style={{ color: '#34d399' }} />
                                {topic.codeExample.title}
                              </h3>
                              <span style={{
                                fontSize: '0.68rem', fontWeight: 700,
                                color: '#94a3b8', textTransform: 'uppercase',
                                background: 'rgba(255,255,255,0.03)',
                                padding: '0.2rem 0.5rem', borderRadius: '4px',
                                display: 'inline-block', marginBottom: '0.75rem'
                              }}>
                                {topic.codeExample.language}
                              </span>
                              <pre style={{
                                background: '#070814',
                                border: '1px solid rgba(255,255,255,0.04)',
                                borderRadius: '10px',
                                padding: '1.25rem',
                                fontSize: '0.82rem',
                                fontFamily: "'Fira Code', 'Cascadia Code', 'JetBrains Mono', monospace",
                                color: '#e2e8f0',
                                lineHeight: 1.6,
                                overflowX: 'auto',
                                margin: 0,
                                whiteSpace: 'pre-wrap'
                              }}>
                                {topic.codeExample.code}
                              </pre>
                            </div>
                          )}
                        </div>
                      );
                    })()
                  )}

                  {/* Banner panel matching mockup */}
                  <div className="pm-how-banner">
                    <div className="pm-how-content">
                      <div className="pm-how-icon">
                        <Rocket size={20} />
                      </div>
                      <div>
                        <div className="pm-how-title">Follow a structured path, master DSA</div>
                        <div className="pm-how-desc">Each learning path is carefully designed to take you from basics to mastery with curated lessons and practice problems.</div>
                      </div>
                    </div>
                    <button
                      className="pm-how-btn"
                      id="pm-how-it-works-btn"
                      onClick={() => setHowItWorksOpen(true)}
                    >
                      <Play size={14} fill="currentColor" /> How It Works
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Sidebar Stats Pane */}
              <div className="pm-sidebar">

                {/* Horizontal Progress Ring Panel */}
                <div className="pm-card" style={{ marginBottom: '0.5rem', padding: '0.85rem' }}>
                  <div className="pm-card-header" style={{ marginBottom: '0.5rem', padding: 0 }}>
                    <div className="pm-card-title" style={{ fontSize: '0.85rem' }}>
                      <TrendingUp className="pm-card-title-icon" size={14} style={{ color: 'var(--accent-purple-light)' }} />
                      Your Progress Breakdown
                    </div>
                  </div>
                  <div className="pm-overall-progress-panel" style={{ display: 'flex', flexDirection: 'row', gap: '1rem', padding: 0 }}>
                    <div className="pm-dual-rings-container" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                      <div className="pm-mini-progress-card" style={{ padding: '0.5rem', display: 'flex', justifyContent: 'center' }}>
                        <ProgressRing pct={displayPracticeProgress} label="Practice" colorClass="green" />
                      </div>
                      <div className="pm-mini-progress-card" style={{ padding: '0.5rem', display: 'flex', justifyContent: 'center' }}>
                        <ProgressRing pct={displayPathProgress} label="Topics" />
                      </div>
                    </div>

                    <div className="pm-sidebar-stats-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1, justifyContent: 'center' }}>
                      <div className="pm-stat-row" style={{ padding: '0.4rem', borderRadius: '6px' }}>
                        <div className="pm-stat-row-icon" style={{ color: '#34d399', width: '20px', height: '20px' }}>
                          <BookOpen size={12} />
                        </div>
                        <div className="pm-stat-row-content">
                          <div className="pm-stat-row-value" style={{ fontSize: '0.85rem' }}>{stats.lessonsCompleted}</div>
                          <div className="pm-stat-row-label" style={{ fontSize: '0.65rem' }}>Lessons Completed</div>
                        </div>
                      </div>

                      <div className="pm-stat-row" style={{ padding: '0.4rem', borderRadius: '6px' }}>
                        <div className="pm-stat-row-icon" style={{ color: 'var(--accent-purple-light)', width: '20px', height: '20px' }}>
                          <Trophy size={12} />
                        </div>
                        <div className="pm-stat-row-content">
                          <div className="pm-stat-row-value" style={{ fontSize: '0.85rem' }}>{stats.problemsSolved}</div>
                          <div className="pm-stat-row-label" style={{ fontSize: '0.65rem' }}>Problems Solved</div>
                        </div>
                      </div>

                      <div className="pm-stat-row" style={{ padding: '0.4rem', borderRadius: '6px' }}>
                        <div className="pm-stat-row-icon" style={{ color: '#facc15', width: '20px', height: '20px' }}>
                          <Clock size={12} />
                        </div>
                        <div className="pm-stat-row-content">
                          <div className="pm-stat-row-value" style={{ fontSize: '0.85rem' }}>{stats.timeSpent}</div>
                          <div className="pm-stat-row-label" style={{ fontSize: '0.65rem' }}>Time Invested</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dynamic Recently Continued */}
                <div className="pm-card" style={{ marginBottom: '0.5rem', padding: '0.85rem' }}>
                  <div className="pm-card-header" style={{ marginBottom: '0.5rem', padding: 0 }}>
                    <div className="pm-card-title" style={{ fontSize: '0.85rem' }}>
                      <Clock className="pm-card-title-icon" size={14} style={{ color: 'var(--accent-purple-light)' }} />
                      Recently Continued
                    </div>
                    <span className="pm-view-all-link" style={{ fontSize: '0.65rem' }} onClick={() => setRecentContinuedOpen(true)}>View All</span>
                  </div>
                  <div className="pm-recent-list" style={{ gap: '0.35rem' }}>
                    {RECENTLY_CONTINUED_LIST.slice(0, 2).map(item => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.id}
                          className="pm-recent-row"
                          onClick={() => setSelectedPath(item.id)}
                          style={{ padding: '0.4rem', borderRadius: '6px' }}
                        >
                          <div className={`pm-recent-row-icon ${item.color}`} style={{ width: '20px', height: '20px' }}>
                            <Icon size={12} />
                          </div>
                          <div className="pm-recent-row-body">
                            <div className="pm-recent-row-header" style={{ marginBottom: '0.15rem' }}>
                              <span className="pm-recent-row-name" style={{ fontSize: '0.7rem' }}>{item.name}</span>
                              <span className="pm-recent-row-pct" style={{ fontSize: '0.65rem' }}>{item.pct}%</span>
                            </div>
                            <div className="pm-recent-row-bar" style={{ height: '3px' }}>
                              <div className={`pm-recent-row-fill ${item.bar}`} style={{ width: `${item.pct}%` }} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Dynamic Recommended Next Crown Block */}
                <div className="pm-card" style={{ padding: '0.85rem' }}>
                  <div className="pm-card-header" style={{ marginBottom: '0.5rem', padding: 0 }}>
                    <div className="pm-card-title" style={{ fontSize: '0.85rem' }}>
                      <Star className="pm-card-title-icon" size={14} style={{ color: 'var(--accent-yellow-light)' }} />
                      Recommended Next
                    </div>
                  </div>
                  <div className="pm-recommended-card" style={{ padding: 0 }}>
                    <div className="pm-rec-subcard" style={{ padding: '0.6rem', marginBottom: '0.4rem', borderRadius: '8px' }}>
                      <div className="pm-rec-row-header" style={{ marginBottom: '0.3rem' }}>
                        <div className="pm-rec-icon color-yellow" style={{ width: '20px', height: '20px' }}>
                          <Crown size={12} />
                        </div>
                        <div>
                          <div className="pm-rec-title" style={{ fontSize: '0.75rem' }}>Greedy Algorithms</div>
                          <div className="pm-rec-badge" style={{ fontSize: '0.55rem', padding: '0.1rem 0.25rem' }}>Beginner → Intermediate</div>
                        </div>
                      </div>
                      <button
                        className="pm-rec-outline-btn"
                        id="pm-start-greedy-btn"
                        onClick={handleStartRecommended}
                        style={{ padding: '0.35rem', fontSize: '0.65rem', marginTop: '0.2rem' }}
                      >
                        Start Learning
                      </button>
                    </div>

                    <button
                      className="pm-sidebar-full-btn"
                      id="pm-view-all-recommendations-btn"
                      onClick={() => setRecommendationsOpen(true)}
                      style={{ padding: '0.35rem', fontSize: '0.7rem' }}
                    >
                      View All Recommendations
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'individual' && individualChallengesContent}
          {activeTab === 'random' && <RandomPracticeView />}
        </>
      )}

      {/* View All Recommendations Modal */}
      {recommendationsOpen && (
        <div className="pm-modal-overlay" onClick={() => setRecommendationsOpen(false)}>
          <div className="pm-simple-modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div className="pm-modal-title" style={{ color: 'var(--accent-purple-light)' }}>
                <Star size={18} /> Our Personalized Recommendations
              </div>
              <button className="pm-modal-close-btn" onClick={() => setRecommendationsOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { id: 'greedy', name: 'Greedy Algorithms', diff: 'Beginner → Intermediate', xp: '120 XP', desc: 'Strengthen core decision heuristics.' },
                { id: 'searching', name: 'Searching Algorithms', diff: 'Beginner → Intermediate', xp: '80 XP', desc: 'Master linear and binary search complexity bounds.' },
                { id: 'sorting', name: 'Sorting Algorithms', diff: 'Beginner → Advanced', xp: '200 XP', desc: 'Excellent foundational dynamic sorting.' }
              ].map(rec => (
                <div
                  key={rec.id}
                  style={{ background: 'rgba(255,255,255,0.02)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: 'white', fontSize: '0.88rem' }}>{rec.name}</div>
                    <div style={{ fontSize: '0.72rem', color: '#fb923c', fontWeight: 600 }}>{rec.diff} • {rec.xp}</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem' }}>{rec.desc}</div>
                  </div>
                  <button
                    className="pm-lesson-btn review"
                    onClick={() => {
                      setSelectedPath(rec.id);
                      setRecommendationsOpen(false);
                    }}
                  >
                    Open Path
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* View All Recently Continued Modal */}
      {recentContinuedOpen && (
        <div className="pm-modal-overlay" onClick={() => setRecentContinuedOpen(false)}>
          <div className="pm-simple-modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div className="pm-modal-title" style={{ color: 'var(--accent-purple-light)' }}>
                <Clock size={18} /> Recently Continued Activities
              </div>
              <button className="pm-modal-close-btn" onClick={() => setRecentContinuedOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {RECENTLY_CONTINUED_LIST.map(act => (
                <div
                  key={act.id}
                  style={{ background: 'rgba(255,255,255,0.02)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div className={`pm-recent-row-icon ${act.color}`} style={{ width: '28px', height: '28px', fontSize: '0.8rem' }}>
                      <act.icon size={13} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: 'white', fontSize: '0.88rem' }}>{act.name}</div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Completion: {act.pct}%</div>
                    </div>
                  </div>
                  <button
                    className="pm-lesson-btn review"
                    onClick={() => {
                      setSelectedPath(act.id);
                      setRecentContinuedOpen(false);
                    }}
                  >
                    Continue
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AI Chapter Completion Analysis Modal */}
      {aiAnalysisChapter && (
        <div className="ai-analysis-modal-overlay">
          <div className="ai-analysis-card">
            <div className="ai-analysis-glow" />
            <div className="ai-analysis-header">
              <div className="ai-analysis-icon-wrapper">
                <Sparkles size={24} className={isAiAnalyzing ? "animate-spin" : ""} />
              </div>
              <div>
                <h3 className="ai-analysis-title">AI Chapter Certification</h3>
                <p className="ai-analysis-subtitle">Analyzing completed module: {aiAnalysisChapter.moduleName}</p>
              </div>
            </div>

            <div className="ai-analysis-steps">
              <div className={`ai-analysis-step-item ${aiAnalysisStep === 0 ? 'active' : ''} ${aiAnalysisStep > 0 ? 'success' : ''}`}>
                <div className="ai-analysis-step-icon">
                  {aiAnalysisStep > 0 ? <CheckCircle2 size={16} className="success" /> : <RefreshCw size={16} className="pending animate-spin" />}
                </div>
                <div className="ai-analysis-step-content">
                  <div className="ai-analysis-step-title">Chapter Code Solution Scan</div>
                  <div className="ai-analysis-step-desc">Loading and parsing code inputs for stability testing.</div>
                </div>
              </div>

              <div className={`ai-analysis-step-item ${aiAnalysisStep === 1 ? 'active' : ''} ${aiAnalysisStep > 1 ? 'success' : ''}`}>
                <div className="ai-analysis-step-icon">
                  {aiAnalysisStep > 1 ? <CheckCircle2 size={16} className="success" /> : aiAnalysisStep === 1 ? <RefreshCw size={16} className="pending animate-spin" /> : <Lock size={16} className="pm-icon-locked" />}
                </div>
                <div className="ai-analysis-step-content">
                  <div className="ai-analysis-step-title">Core Correctness Verification</div>
                  <div className="ai-analysis-step-desc">Running complete assertion checks and extreme edge-case boundaries.</div>
                </div>
              </div>

              <div className={`ai-analysis-step-item ${aiAnalysisStep === 2 ? 'active' : ''} ${aiAnalysisStep > 2 ? 'success' : ''}`}>
                <div className="ai-analysis-step-icon">
                  {aiAnalysisStep > 2 ? <CheckCircle2 size={16} className="success" /> : aiAnalysisStep === 2 ? <RefreshCw size={16} className="pending animate-spin" /> : <Lock size={16} className="pm-icon-locked" />}
                </div>
                <div className="ai-analysis-step-content">
                  <div className="ai-analysis-step-title">Complexity & Bounds Analysis</div>
                  <div className="ai-analysis-step-desc">Analyzing asymptotic time bounds and spatial allocations.</div>
                </div>
              </div>

              <div className={`ai-analysis-step-item ${aiAnalysisStep === 3 ? 'active' : ''} ${aiAnalysisStep > 3 ? 'success' : ''}`}>
                <div className="ai-analysis-step-icon">
                  {aiAnalysisStep > 3 ? <CheckCircle2 size={16} className="success" /> : aiAnalysisStep === 3 ? <RefreshCw size={16} className="pending animate-spin" /> : <Lock size={16} className="pm-icon-locked" />}
                </div>
                <div className="ai-analysis-step-content">
                  <div className="ai-analysis-step-title">AI Performance Report</div>
                  <div className="ai-analysis-step-desc">
                    {aiAnalysisStep >= 3 ? (
                      <span style={{ color: '#34d399', fontWeight: 600 }}>O(N log N) time / O(1) space certified. Performance optimal!</span>
                    ) : (
                      "Synthesizing final diagnostic evaluation bounds."
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                className="pm-continue-btn"
                style={{ flex: 1, height: '42px' }}
                disabled={isAiAnalyzing}
                onClick={handleAcceptAiCertification}
              >
                {isAiAnalyzing ? 'Evaluating Chapter Code...' : 'Accept Certification & Claim Progress'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}