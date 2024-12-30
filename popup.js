// DOM Elements
const noteInput = document.getElementById("noteInput");
const addNoteButton = document.getElementById("addNote");
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const noteTree = document.getElementById("noteTree");
const searchResult = document.getElementById("searchResult");

// Nested tree data structure
let treeData = [
  { title: "Root", children: [] }
];

// Load the tree from Chrome storage
chrome.storage.local.get(["noteTree"], (result) => {
  treeData = result.noteTree || treeData;
  renderTree(treeData, noteTree);
});

// Save the tree to Chrome storage
function saveTree() {
  chrome.storage.local.set({ noteTree: treeData }, () => {
    renderTree(treeData, noteTree);
  });
}

// Render the tree
function renderTree(tree, parentElement) {
  parentElement.innerHTML = "";
  tree.forEach((node) => {
    const li = document.createElement("li");
    li.textContent = node.title;

    // Add buttons
    const addButton = document.createElement("button");
    addButton.textContent = "Add Child";
    addButton.addEventListener("click", () => {
      const childText = prompt("Enter child note:");
      if (childText) {
        node.children.push({ title: childText, children: [] });
        saveTree();
      }
    });

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.style.marginLeft = "10px";
    deleteButton.addEventListener("click", () => {
      deleteNode(tree, node);
      saveTree();
    });

    li.appendChild(addButton);
    li.appendChild(deleteButton);

    // Add child nodes recursively
    if (node.children.length > 0) {
      const ul = document.createElement("ul");
      renderTree(node.children, ul);
      li.appendChild(ul);
    }

    parentElement.appendChild(li);
  });
}

// Delete a node
function deleteNode(tree, targetNode) {
  const index = tree.findIndex((node) => node === targetNode);
  if (index > -1) {
    tree.splice(index, 1);
  } else {
    tree.forEach((node) => {
      if (node.children) {
        deleteNode(node.children, targetNode);
      }
    });
  }
}

// Add a note to the root
addNoteButton.addEventListener("click", () => {
  const newNote = noteInput.value.trim();
  if (newNote) {
    treeData[0].children.push({ title: newNote, children: [] });
    saveTree();
    noteInput.value = "";
  }
});

// Search functionality
searchButton.addEventListener("click", () => {
  const searchTerm = searchInput.value.trim().toLowerCase();
  if (searchTerm) {
    const results = searchTree(treeData, searchTerm);
    searchResult.innerHTML = results.length
      ? `Found: ${results.map((r) => r.title).join(", ")}`
      : "No matches found.";
  }
});

// Search in the tree
function searchTree(tree, searchTerm) {
  let results = [];
  tree.forEach((node) => {
    if (node.title.toLowerCase().includes(searchTerm)) {
      results.push(node);
    }
    if (node.children.length > 0) {
      results = results.concat(searchTree(node.children, searchTerm));
    }
  });
  return results;
}