/**
 * This application shows how to use the Tizen Content API.
 *
 * In short, Content API can be used to browse, filter and modify content of your devices.
 * The applications shows how to:
 * - Browse all available content
 * - Filter the content using different filters
 * - Display content's basic information, such as thumbnail, rating or description.
 * - Change content's rating and save that change
 * - Listen to any content changes (message will be displayed in Message section)
 */
(function () {
    'use strict';

    // Media browser component - loaded from mediaBrowser.js
    var mediaBrowser;
    // cached files list
    var files;

    /**
     * Register keys used in this application
     */
    function registerKeys() {
        var usedKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

        usedKeys.forEach(function (keyName) {
            tizen.tvinputdevice.registerKey(keyName);
        });
    }


    /**
     * Handle input from remote
     */
    function registerKeyHandler() {
        document.addEventListener('keydown', function (event) {
            switch (event.keyCode) {
                // Enter
                case 13:
                    changeRating();
                    break;
                // Down
                case 40:
                    mediaBrowser.down();
                    updateInfoPanel();
                    break;
                // Up
                case 38:
                    mediaBrowser.up();
                    updateInfoPanel();
                    break;
                // 0
                case 48:
                    loadAllItems();
                    document.getElementById('filter-name').innerText = 'none';
                    break;
                // 1
                case 49:
                    loadAllImages();
                    document.getElementById('filter-name').innerText = 'images';
                    break;
                // 2
                case 50:
                    loadAllApkFiles();
                    document.getElementById('filter-name').innerText = '*.apk';
                    break;
                // Key Return
                case 10009:
                    tizen.application.getCurrentApplication().exit();
                    break;
            }
        });
    }

    /**
     * Display application version
     */
    function displayVersion() {
        var el = document.createElement('div');
        el.id = 'version';
        el.innerHTML = 'ver: ' + tizen.application.getAppInfo().version;
        document.body.appendChild(el);
    }


    /**
     * Perform Info Panel update
     * it uses cached data stored in `files` variable
     * @type {Function}
     */
    function updateInfoPanel() {
        // Get currently focused item
        var currentItemIndex = mediaBrowser.getCurrentItemIndex();
        // Get file
        var file = files[currentItemIndex];

        if (file.type === 'IMAGE') {
            // Show the image
            document.getElementById('thumb').src = file.contentURI;

        } else if (file.thumbnailURIs.length > 0) {
            // Show content's thumbnail
            document.getElementById('thumb').src = file.thumbnailURIs[0];
        } else {
            // Don't show any thumbnail
            document.getElementById('thumb').src = '';
        }

        document.getElementById('rating').innerText = file.rating;
        document.getElementById('description').innerText = file.description;
        document.getElementById('message').innerText = '';
    }


    /**
     * Load success handler
     * Takes the data given in first argument and renders it in media browser
     * the data is being cached inside the `files` variable
     * @param {Array} items
     * @type {Function}
     */
    function onLoadSuccess(items) {
    	
    	if(items.length != 0) {
            // render items in media browser
            mediaBrowser.setItems(items);

            // caches the list
            files = items;

            // update the info panel
            updateInfoPanel();    		
    	}
    }


    /**
     * Load error handler
     * displays an error message
     * @param {Object} err - error details
     */
    function onLoadError(err) {
        // handle loading error
        mediaBrowser.displayError(err);
    }


    /**
     * Loads all available images on the device
     * It uses tizen.AttributeFilter to gather only image files
     * @type {Function}
     */
    function loadAllImages() {
        // Set filter to IMAGE type
        var filter = new tizen.AttributeFilter('type', 'EXACTLY', 'IMAGE');
        // Search in all directories - hence null
        var directoryId = null;

        // Find all files matching the filter
        // onLoadSuccess로 불리면 안되는것으로 보임.
        tizen.content.find(onLoadSuccess, onLoadError, directoryId, filter);
    }

    /**
     * Loads all available .apk files on the device
     * It uses tizen.AttributeFilter to gather files that names ends with .apk
     * @type {Function}
     */
    function loadAllApkFiles() {
        // Set filter to name ending with .apk
        var filter = new tizen.AttributeFilter('name', 'ENDSWITH', '.apk');
        // Search in all directories - hence null
        var directoryId = null;

        // Find all files matching the filter
        tizen.content.find(onLoadSuccess, onLoadError, directoryId, filter);
    }
    

    function errorCB(err) {
        console.log( 'The following error occurred: ' +  err.name);
    }
    function printDirectory(directory, index, directories) {
        console.log('directoryURI: ' + directory.directoryURI + ' Title: ' + directory.title);
    }
    function getDirectoriesCB(directories) {
        directories.forEach(printDirectory);
    }

    /**
     * Loads all available files on the device
     * Without filtering
     * @type {Function}
     */
    function loadAllItems() {    	
        // find all available files
        tizen.content.find(onLoadSuccess, onLoadError);
    }

    /**
     * Sets a custom ratting for focused file
     * @type {Function}
     */
    function changeRating() {

        if(files === undefined) {
            return;
        }

        // Get currently focused item
        var currentItemIndex = mediaBrowser.getCurrentItemIndex();
        
        // Get file
        var file = files[currentItemIndex];

        if (file.editableAttributes.indexOf('rating') >= 0) {
            file.rating++;
            if (file.rating > 5) {
                file.rating = 0;
            }
            tizen.content.update(file);
            updateInfoPanel();
        }
    }


    /**
     * Add listener for any content change
     */
    function registerContentChangeHandlers() {
        tizen.content.setChangeListener({
            // When new content is being added, this callback will be called
            oncontentadded: function (content) {
                document.getElementById('message').innerText = 'New content added: ' + content.contentURI;
            },
            // This is a callback handling every content's change
            oncontentupdated: function (content) {
                document.getElementById('message').innerText = 'Content was changed: ' + content.contentURI;
            },
            // And a callback for content being removed
            oncontentremoved: function (id) {
                document.getElementById('message').innerText = id + ' was removed';
            }
        });
    }


    /**
     * Start the application once loading is finished
     */
    window.onload = function onload() {

        // Create Media Browser component
        mediaBrowser = createMediaBrowser();

        if (window.tizen === undefined) {
            mediaBrowser.displayError({
                name: 'This application needs to be run on Tizen device'
            });
            return;
        }

        displayVersion();
        registerKeys();
        registerKeyHandler();
        registerContentChangeHandlers();

        // Add some initial data on beginning
        loadAllItems();
    };

}());

