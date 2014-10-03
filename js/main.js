var html5IndexedDB = {};
html5IndexedDB.indexedDB = {};

html5IndexedDB.indexedDB.open = function() {
    var version = 1;
    var request = indexedDB.open("todos", version);

    // We can only create Object stores in a versionchange transaction.
    request.onupgradeneeded = function(e) {
        var db = e.target.result;

        // A versionchange transaction is started automatically.
        e.target.transaction.onerror = html5IndexedDB.indexedDB.onerror;

        if(db.objectStoreNames.contains("todo")) {
            db.deleteObjectStore("todo");
        }

        var store = db.createObjectStore("todo",
            {keyPath: "timeStamp"});
    };

    request.onsuccess = function(e) {
        html5IndexedDB.indexedDB.db = e.target.result;
        html5IndexedDB.indexedDB.getAllTodoItems();
        console.log('success open db');
    };

    request.onerror = html5IndexedDB.indexedDB.onerror;
};

html5IndexedDB.indexedDB.addTodo = function(todoText) {
    var db = html5IndexedDB.indexedDB.db;
    var trans = db.transaction(["todo"], "readwrite");
    var store = trans.objectStore("todo");
    var request = store.put({
        "text": todoText,
        "timeStamp" : new Date().getTime()
    });

    trans.oncomplete = function(e) {
        // Re-render all the todos
        html5IndexedDB.indexedDB.getAllTodoItems();
    };

    request.onerror = function(e) {
        console.log(e.value);
    };
};

html5IndexedDB.indexedDB.getAllTodoItems = function() {
    var todos = document.getElementById("todoItems");
    todos.innerHTML = "";

    var db = html5IndexedDB.indexedDB.db;
    var trans = db.transaction(["todo"], "readwrite");
    var store = trans.objectStore("todo");

    // Get everything in the store;
    var keyRange = IDBKeyRange.lowerBound(0);
    var cursorRequest = store.openCursor(keyRange);

    cursorRequest.onsuccess = function(e) {
        var result = e.target.result;
        if(!!result == false)
            return;

        renderTodo(result.value);
        result.continue();
    };

    cursorRequest.onerror = html5IndexedDB.indexedDB.onerror;
};

html5IndexedDB.indexedDB.deleteTodo = function(id) {
    var db = html5IndexedDB.indexedDB.db;
    var trans = db.transaction(["todo"], "readwrite");
    var store = trans.objectStore("todo");

    var request = store.delete(id);

    trans.oncomplete = function(e) {
        html5IndexedDB.indexedDB.getAllTodoItems();  // Refresh the screen
    };

    request.onerror = function(e) {
        console.log(e);
    };
};

function renderTodo(row) {
    var todos = document.getElementById("todoItems");
    var li = document.createElement("li");
    var a = document.createElement("a");
    var t = document.createTextNode("");
    t.data = row.text;

    a.addEventListener("click", function(e) {
        console.log("deletando..", row.text);
        html5IndexedDB.indexedDB.deleteTodo(row.text);
    });

    a.textContent = " [Delete]";
    li.appendChild(t);
    li.appendChild(a);
    todos.appendChild(li);
}

function init() {
    html5IndexedDB.indexedDB.open(); // open displays the data previously saved
}

function addTodo() {
    var todo = document.getElementById('todo');

    html5IndexedDB.indexedDB.addTodo(todo.value);
    todo.value = '';
}

window.addEventListener("DOMContentLoaded", init, false);