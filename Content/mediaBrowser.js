
// Function that creates a small media browser that allows you to see the content of media source
function createMediaBrowser() {
    var items = [];
    var elBrowser = document.getElementById('browser');
    var currentItemIndex = 1;

    // Helper function - focus currently selected item
    function focusItem() {
        var focused = document.querySelector('#browser div.focused');
        var el = document.querySelector('#browser div:nth-child(' + currentItemIndex + ')');

        if (focused) {
            focused.classList.remove('focused');
        }

        el.classList.add('focused');
        el.scrollIntoView({
            block: 'end',
            behavior: 'smooth'
        });
    }

    // Create Media Browser object
    return {

        // Clears the contents of the Media Browser
        clear: function clear() {
            elBrowser.innerHTML = '';
        },

        // Moves up one item
        up: function up() {
            if (currentItemIndex > 1) {
                currentItemIndex--;
            }
            focusItem();
        },

        // Moves down one item
        down: function down() {
            if (currentItemIndex < items.length) {
                currentItemIndex++;
            }
            focusItem();
        },

        // Returns current item index
        getCurrentItemIndex: function getCurrentItemIndex() {
            return currentItemIndex - 1;
        },

        // Sets all items and renders them
        setItems: function setItems(newItems) {
            items = newItems;

            elBrowser.innerHTML = items.reduce(function (prev, item) {
                return prev + '<div class="' + item.type + '">' + item.contentURI + '</div>';
            }, '');

            currentItemIndex = 1;
            focusItem();

            window._items = items;
        },

        // Appear an error message
        displayError: function (err) {
            elBrowser.innerHTML = '<p>An error occured: ' + err.name + '</p>';
        }
    };
}
