
/*
 *
 * Scripts for the RMarkdown renderer webpage
 * Created Summer 2018 Sean McCurry
 *
 */


$(document).ready(function() {
    Init();
    SetEvents();
    TestingShit(); // todo: remove this whole thing before publish
});

// global vars AHAHAHAHAHA TRY AND STOP ME
var bibFiles = {};
var cookieStorage = {};

function Init() {
    // create edit menu based on stuff we have here
    CreateMenu();
    SetDefaults();

    // var setup
    bibFiles = [];
    cookieStorage.simples = [];
    cookieStorage.files = [];
    cookieStorage.headers = [];

    // cookie restore
    LoadFromCookies();
}
function TestingShit() {

    // modal work
    //$('#bibtex_modal').modal('show');
    //$('#advanced_options_wrapper').removeClass('hidden');

    /*
    // temp bibtex in var
    var txt = "@article{lee1971interpretation, title={The interpretation of protein structures: estimation of static accessibility}, author={Lee, Byungkook and Richards, Frederic M}, journal={Journal of molecular biology}, volume={55}, number={3}, pages={379--IN4}, year={1971}, publisher={Elsevier} } @article{hansen1959accessibility, title={How accessibility shapes land use}, author={Hansen, Walter G}, journal={Journal of the American Institute of planners}, volume={25}, number={2}, pages={73--76}, year={1959}, publisher={Taylor \& Francis} } @article{tory1977category, title={Category accessibility and impression formation}, author={Tory Higgins, E and Rholes, WS and Jones, CR}, journal={J Exp Soc Psychol}, volume={13}, pages={141--154}, year={1977} }";
    var b = new BibtexParser();
    b.setInput(txt);
    b.bibtex();
    var thisBib = {};
    thisBib.fileName = "daveOfDevon.txt";
    thisBib.data = b.getEntries();
    bibFiles.push(thisBib);
    */

    // insert bibtex work
    //InitReferenceInsert();
}
function SetEvents() {

    // custom header triggers
    $(document).on('click', '#advanced_options_trigger', function() {
        if ( $(this).html() == "Show Advanced Options" ) {
            $(this).html('Hide Advanced Options');
            $('#advanced_options_wrapper').removeClass('hidden');
        } else {
            $(this).html('Show Advanced Options');
            $('#advanced_options_wrapper').addClass('hidden');
        }
    });
    $(document).on('click', '.cust_header_del_trigger', function() {
        RemoveCustHeader(this);
    });
    $(document).on('click', '#cust_header_new_trigger', function() {
        MakeNewHeaderItem();
    });

    $(document).on('click', '#main_submit', function() {
        SubmitData();
    });

    // go to search box: alt + /
    $(document).on('keydown', 'body', function(e) {
        if ( ( e.keyCode == 191 && e.altKey ) ) {
            $('#menu_search').dropdown('toggle');
        }
    });
    $(document).on('shown.bs.dropdown', '#menu_search_wrapper', function() {
        $('#search_shortcuts_input').val('');
        FilterSearch();

        $('#search_shortcuts_input').focus();
    });
    $(document).on('keyup', '#search_shortcuts_input', function(e) {
        FilterSearch();
    });

    // arrow up and down to search box
    $(document).on('keyup', '#menu_search_ddl > div > button:not(.hidden), #menu_search_ddl > input#search_shortcuts_input', function(e) {
        if ( e.keyCode == 40 || e.keyCode == 38 ) {
            var currentSet = $('#menu_search_ddl > div > button:not(.hidden), #menu_search_ddl > input#search_shortcuts_input');
            var currentIndex = currentSet.index(this);

            if ( e.keyCode == 40 && currentIndex == 0 ) {
                $(currentSet[currentIndex+1]).focus();
            } else if ( e.keyCode == 38 && currentIndex == 1 ) {
                $(currentSet[currentIndex-1]).focus();
            }
        }

    });

    // arrow up and down to citation box
    $(document).on('keyup', '#citation_filter, .citation_insert_button', function(e) {
        if ( e.keyCode == 40 || e.keyCode == 38 ) {
            var currentSet = $('#citation_filter, .citation_insert_button');
            var currentIndex = currentSet.index(this);
            var key = e.keyCode;

            if ( e.keyCode == 40 && currentIndex < currentSet.length ) {
                $(currentSet[currentIndex+1]).focus();
            } else if ( e.keyCode == 38 && currentIndex > 0 ) {
                $(currentSet[currentIndex-1]).focus();
            }
        }

    });

    // go to edit menu
    $(document).on('keyup', 'body', function(e) {
        // triggers for menu all start with alt ctrl, so 
        // AND YES I KNOW IT WOULD BE BETTER TO WRITE THIS TO PULL FROM THE CLASS.
        if ( e.ctrlKey && e.altKey ) {
            var allMenus = GetFullMenuVar();
            for ( var i = 0 ; i < allMenus.length ; i++ ) {
                if ( allMenus[i].key == e.keyCode ) {
                    $('#menu_' + i).focus(); 
                    $('#menu_' + i).dropdown('toggle');
                }
            }

        }
    });

    // edit menu events
    // run from key binding
    $(document).on('keydown', '#rmd_text', function(e) {
        // all edit events MUST start with ctrl or alt, so, 
        // exceptions first
        if ( e.shiftKey && e.ctrlKey && ! e.altKey && e.keyCode == 67 ) {
            InitReferenceInsert();
        }
        else if ( e.ctrlKey || e.altKey ) {
            RunEditFromKey(e);
        }
    });

    // bibtex events
    $(document).on('change', '#bibtex_upload_file', function() {
        FileUploadHandler();
    });
    $(document).on('hide.bs.modal', '#bibtex_modal', function() {
        MaybeCreateFileFromTextarea();
    });
    $(document).on('click', '.bib_delete', function() {
        BibtexRemoveFile(this);
    });
    $(document).on('keydown', '#citation_filter', function() {
        FilterCitations();
    });
    $(document).on('click', '#citation_clear_filter', function() {
        $('#citation_filter').val('');
        FilterCitations();
        $('#citation_filter').focus();
    });
    $(document).on('click', '.citation_insert_button', function() {
        $('#citation_modal').modal('hide');
        InsertInTextareaAtCursor($('#rmd_text')[0], '@' + $(this).attr('data-article'));
    });
    $(document).on('shown.bs.modal', '#citation_modal', function() {
        $('#citation_filter').focus();
    });

    // run from button
    $(document).on('click', '#edit_menu > div > div > button, #menu_search_ddl > #autocomplete_list > .dropdown-item', function(e) {
        // exceptions first
        if ( $(this).html().indexOf("Citation") != -1 ) {
            InitReferenceInsert();
        } else {
            RunEditFromButton(this);
        }
    });

    // save input data as cookie
    $(document).on('blur', 'input, textarea, select', function() {
        SaveInputToCookie(this);
    });
}

function SetDefaults() {
    // date field in custom header area
    // todo
    
}

function LoadFromCookies() {
    var c_tmp = Cookies.getJSON('rmd_storage');
    if ( typeof(c_tmp) != "undefined") {
        cookieStorage = c_tmp;

        // simple inputs
        // just set them
        cookieStorage.simples.forEach(function(el) {
            if ( el != null ) {
                if ( el.type == "text" ) {
                    $('#' + el.id).val(el.val);
                } else {
                    $('#' + el.id).prop('checked', el.val);
                }
            }
        });

        // headers
        // if we have any, we want to first add them to the existing 4 inputs, and then make more inputs as needed
        var i = 0;
        cookieStorage.headers.forEach(function(el) {
            if ( el != null ) {
                if ( $('.header_key').length < i + 2 ) { // .header_key is 5 initially, 4 of them active. So we need i + 2
                    // need to add a row before we can update
                    MakeNewHeaderItem();
                }

                $('#cust_header_' + el.type + '_' + i).val(el.val);
                i++;
            }
        });

        // files
        i = 0;
        cookieStorage.files.forEach(function(el) {
            if ( el != null ) {
                if ( el.type == "bibtex_textarea" ) {
                    // actually a text area
                    $('#bibtex_textarea').val(el.val);
                    MaybeCreateFileFromTextarea();
                } else {
                    // proper file, get the text and send reponse data to handler
                    var res = {};
                    res.error = "";
                    res.ID = el.id;
                    res.message = "";
                    res.filePath = el.val;
                    res.uploadType = "cookie";

                    // redo filename, as it's a full file path atm, not http path
                    el.val = "output/" + el.id + "/" + el.val.split('/').pop();

                    $.ajax({
                        url: el.val, 
                        dataType: 'text', 
                        type: 'post', 
                        success: function(r) {
                            if ( r.length > 0 ) {
                                res.txt = r;
                                FileUploadFinisher(res);
                            }
                        }
                    });
                }

                i++;
            }
        });

    }
}

function SaveInputToCookie(sender) {
    // save this input as a cookie
    // for basic pre rendered inputs, this is easy
    // for dynamic fields (custom header) we'll have to also add the fields via the js function
    // for files, we'll have to use the ajax function here to call up the file in the background

    // save this input as a cookie. 
    // the method will depend on the input in question, so we'll just have sections of IDs
    var id = $(sender).attr('id');
    var simpleInputs = ['rmd_name', 'rmd_text', 'bibtex_textarea', 'choice_html', 'choice_docx', 'choice_pdf', 'choice_pptx' ];
    var thisCookie;
    var set;

    if ( simpleInputs.includes(id) ) {
        // simple pre rendered inputs
        thisCookie = {};
        if ( $(sender).is(':checkbox') ) {
            thisCookie.type = "checkbox";
            thisCookie.val = $(sender).prop('checked');
        } else {
            thisCookie.type = "text";
            thisCookie.val = $(sender).val();
        }
        thisCookie.id = id;

        set = "simples"
    } else if ( id == 'bibtex_upload_file' ) {
        // do nothing. We handle this in the post file area
    } else {
        // custom header
        thisCookie = {};

        thisCookie.index = Number(id.substr(-1, 1));
        thisCookie.type = id.substr(-5, 3);
        thisCookie.val = $(sender).val();

        set = "headers";
    }

    if ( thisCookie != null ) {
        // delete the old version of this cookie
        DeleteThisCookieOld(thisCookie);

        if ( thisCookie.val.length < 1 ) {
            // blank? don't add it back
        } else if ( typeof(thisCookie.index) != "undefined" ) {
            cookieStorage[set][thisCookie.index] = thisCookie;
        } else {
            cookieStorage[set].push(thisCookie);
        }
    }

    Cookies.set('rmd_storage', cookieStorage);
}

function DeleteThisCookieOld(thisCookie) {
    var set;
    if ( thisCookie.type == "text" || thisCookie.type == "checkbox" ) {
        set = "simples";
    } else if ( thisCookie.type == "key" || thisCookie.type == "val" ) {
        set = "headers";
    } else {
        set = "files";
    }

    for ( var i = 0 ; i < cookieStorage[set].length ; i++ ) {
        if ( cookieStorage[set][i].val == thisCookie.val ) {
            cookieStorage[set].splice(i, 1);
            break;
        }
    }
}

function RunEditFromKey(e) {
    // look through all current edit options for a key combo match
    var allMenus = GetFullMenuVar();
    for ( var k = 0 ; k < allMenus.length ; k++ ) {
        var numItems = allMenus[k].items.length;
        for ( var i = 0 ; i < numItems ; i++ ) {
            var thisItem = allMenus[k].items[i];
            if ( thisItem.isCtrl == e.ctrlKey && thisItem.isAlt == e.altKey && thisItem.isShift == e.shiftKey ) {
                if ( thisItem.key == e.keyCode) {
                    // got a match, run the edit
                    EditText(thisItem)
                } else if ( typeof(thisItem.key2) != "undefined" ) {
                    if ( thisItem.key2 == e.keyCode ) {
                        // this one has an alt key, and there's a match. Run the edit
                        EditText(thisItem)
                    }
                }
            }
        }
    }
}
function RunEditFromButton(sender) {
    var key = $(sender).attr('data-item');
    var menuIndex = Number(key.substr(13, 1)); // note: this will crash if we add more than 9 menus in class.js, and will need a regex lookup instead
    var itemIndex = Number(key.substr(15)); 
    var allMenus = GetFullMenuVar();
    var thisItem = allMenus[menuIndex].items[itemIndex];

    EditText(thisItem);
}

function FilterSearch() {
    var filterText = $('#search_shortcuts_input').val().toLowerCase();

    // we duplicate the potential list, filter it, and add it
    var list = $('#search_storage > div').clone();

    list.find('button.dropdown-item').each(function() {
        var thisText = $(this).html().toLowerCase();
        var show = thisText.indexOf(filterText) != -1 ;

        if (show && filterText.length > 0) {
        } else {
            $(this).remove();
        }
    });

    $('#menu_search_ddl > #autocomplete_list').remove();
    $('#menu_search_ddl').append(list);


    var numItems = list.find('button.dropdown-item').length;
    if ( numItems > 0 ) {
        $('#live_sr_search').html("<p>" + numItems + " available</p>\n");

        $('#search_shortcuts_input').attr('aria-owns', 'autocomplete_list');
        $('#search_shortcuts_input').attr('aria-activedescendant', 'autocomplete_list');
        $('#search_shortcuts_input').attr('aria-expanded', 'true');
    } else {
    }


}

function SubmitData() {

    // init
    $('#output').html('');
    $('#system_message').html('');

    // add header info (if any)
    var headerHtml = "";
    headerHtml += "---\n";
    if ( ! $('#advanced_options_wrapper').hasClass('.hidden') ) {
        $('.cust_header_row').each(function() {
            var thisKey = $(this).find('.header_key').val();
            var thisVal = $(this).find('.header_val').val();
            
            if ( thisKey.length > 0 && thisVal.length > 0 ) { // only accept non blank key val pairs
                headerHtml += thisKey + ': "' + thisVal + '"\n';
            }
        });
    }

    // add bibtex info (if any)
    if ( bibFiles.length > 0 ) {
        headerHtml += "bibliography: \n";
        for ( var i = 0 ; i < bibFiles.length ; i++ ) {
            headerHtml += "- " + bibFiles[i].fileName + "\n";
        }
    }

    headerHtml += "---\n";
    // end header info

    // compile data
    var data = {};
    data.rmd_name = $('#rmd_name').val();
    data.rmd_text = headerHtml + $('#rmd_text').val();
    data.formats = "";
    $('.format_choice').each(function() {
        if ( $(this).prop('checked') ) {
            data.formats += " " + $(this).attr('id').substr(7);
        }
        data.formats = data.formats.trim();
    });

    // send
    DisplayMessage("Processing...");
    $.ajax({
        url: "worker.php",
        type: "POST", 
        data: data,
        success: function(r) {
            var response = JSON.parse(r);
            var err = response.error;
            if ( err.toString() == "" ) {
                // success
                DisplaySuccess(response);

            } else {
                // error string detected
                DisplayMessage("Processing error");
                DisplayMessage(response.error, "output");
            }
        }
    });
}

function DisplaySuccess(response) { 
    var msg = "";
    var downloadMessage = "";
    var sysMessage = "";

    msg += "<p>Completed successfully!</p>\n";

    // display all files that were created
    var allFileNames = GetAllFileNames();
    if ( allFileNames.length == 0 ) {
        downloadMessage += '<p>No files created</p>\n';
    } else {
        for ( var i = 0 ; i < allFileNames.length ; i++ ) {
            // make sure they exist before outputting a link
            if ( typeof(response.created_filenames) != "undefined" ) {
                if ( response.created_filenames.indexOf(allFileNames[i]) != -1 ) {
                    downloadMessage += '<p><a href="output/' + response.ID + "/" + allFileNames[i] + '" target="_blank">Download ' + allFileNames[i] + '</a></p>\n';
                }
            }
        }
    }

    if ( typeof(response.message) != "undefined" ) {
        sysMessage += "<div>" + response.message + "</div>\n";
    }


    msg = msg.replace(/\n/g, "<br>");
    msg = msg.replace(/\r/g, "<br>");
    sysMessage = sysMessage.replace(/\n/g, "<br>");
    sysMessage = sysMessage.replace(/\r/g, "<br>");

    DisplayMessage(downloadMessage, "output")
    DisplayMessage(msg, "live_sr")
    DisplayMessage(msg, "live_visual")
    DisplayMessage(sysMessage, "system_message")
}

function GetAllFileNames() {
    var baseName = $('#rmd_name').val();
    var fileNames = [];

    $('.format_choice').each(function() {
        if ( $(this).prop('checked') ) {
            fileNames.push(baseName.replace(/ /g, "") + "." + $(this).attr('id').substr(7));
        }
    });

    return fileNames;
}

function CreateMenu() {
    var menuHtml = ""; // individual shortcut menus
    var searchHtmlFull = ""; // all in one searchable shortcut menu
    var searchHtml = "";
    var allMenus = GetFullMenuVar();

    searchHtmlFull += '<div class="inline btn-group" role="group" id="menu_search_wrapper">\n';
    searchHtmlFull += '<button class="btn btn-secondary dropdown-toggle" type="button" id="menu_search" aria-haspopup="true" aria-expanded="false" data-toggle="dropdown">Search (Alt + /)<i class="caret"></i></button>\n';
    searchHtmlFull += '<div class="dropdown-menu" aria-labelledby="menu_search" id="menu_search_ddl">\n';
    searchHtmlFull += '<input type="text" class="form-control" id="search_shortcuts_input" placeholder="Search Shortcuts" aria-label="Search Shortcuts" role="combobox" aria-autocomplete="list" aria-haspopup="false" aria-expanded="false">\n';
    searchHtml += '<div role="listbox" id="autocomplete_list" aria-expanded="true">\n';


    for ( var k = 0 ; k < allMenus.length ; k++ ) {
        var menu = allMenus[k];
        var menuId = "menu_" + k;
        var menuItems = menu.items;

        menuHtml += '<div class="inline btn-group" role="group">\n';
        menuHtml += '<button class="btn btn-secondary dropdown-toggle" type="button" id="' + menuId + '" aria-haspopup="true" aria-expanded="false" data-toggle="dropdown">' + menu.label + ' <i class="caret"></i>';
        if ( typeof(allMenus[k].key) != "undefined" ) {
            menuHtml += '<span class="sr-only"> (';
            if ( menu.isCtrl ) {
                menuHtml += "Ctrl + ";
            }
            if ( menu.isAlt ) {
                menuHtml += "Alt + ";
            }
            if ( menu.isShift ) {
                menuHtml += "Shift + ";
            }
            menuHtml += menu.keyName + ')</span>';
        }
        menuHtml += '</button>\n';
        menuHtml += '<div class="dropdown-menu" aria-labelledby="' + menuId + '">\n';

        var numItems = menuItems.length;
        for ( var i = 0 ; i < numItems ; i++ ) {
            var thisItem = menuItems[i];
            var buttonText = thisItem.label;
            buttonText += '<span class="key_binding_label">(';
            if ( thisItem.isCtrl ) {
                buttonText += "Ctrl + ";
            }
            if ( thisItem.isAlt ) {
                buttonText += "Alt + ";
            }
            if ( thisItem.isShift ) {
                buttonText += "Shift + ";
            }
            buttonText += thisItem.keyName + ')</span>';

            var buttonHtml = '<button class="invis_button dropdown-item" data-item="edit_trigger_' + k + '_' + i + '">' + buttonText + '</button>\n';
            var listHtml = '<button role="option" class="invis_button dropdown-item" data-item="edit_trigger_' + k + '_' + i + '">' + buttonText + '</button>\n';
            menuHtml += buttonHtml;
            searchHtml += listHtml;
        }
        
        menuHtml += "</div>\n";
        menuHtml += "</div>\n";
    }


    searchHtml += "</div>\n";
    searchHtmlFull += "</div>\n";
    searchHtmlFull += "</div>\n";

    // store the actual list somewhere else
    $('#search_storage').html(searchHtml);

    var html = menuHtml + searchHtmlFull;

    $('#edit_menu').html(html);
}

function MakeNewHeaderItem() {
    var newItem = $('#cust_header_template').clone();
    var thisItemNumber = Number($('.cust_header_row').length);
    if ( isNaN(thisItemNumber) ) {
        thisItemNumber = 0;
    }

    newItem.removeAttr('id');
    newItem.removeClass('hidden');
    newItem.addClass('cust_header_row');

    newItem.find('.header_key').attr('id', 'cust_header_key_' + thisItemNumber);
    newItem.find('.header_val').attr('id', 'cust_header_val_' + thisItemNumber);

    $('#cust_header_template').before(newItem);
    
}
function RemoveCustHeader(sender) {
    // remove cookie, kill row
    var val = $(sender).parent().parent().find('.header_val').val();
    var key = $(sender).parent().parent().find('.header_key').val();

    if ( typeof(val) != "undefined" && typeof(key) != "undefined" ) {
        cookieStorage.headers.forEach(function(item, index, object) {
            if ( item != null ) {
                if ( item.val == val || item.val == key ) {
                    object.splice(index, 1);
                }
            }
        });
    }

    Cookies.set('rmd_storage', cookieStorage);

    $(sender).parent().parent().remove();
}

function FileUploadHandler() {
    input = document.getElementById('bibtex_upload_file');

    var file = $('#bibtex_upload_file').prop('files')[0];
    var data = new FormData();
    data.append('file', file);
    $.ajax({
        url: 'bibtexhandler.php', 
        dataType: 'text', 
        cache: false, 
        contentType: false,
        processData: false, 
        data: data, 
        type: 'post', 
        success: function(r) {
            console.log(r);
            var response = JSON.parse(r);
            FileUploadFinisher(response);

            $('#bib_filename').focus();
        }
    });
}
function MaybeCreateFileFromTextarea() {
    // when we close the bibtex modal, if there's content in the textarea, save it

    var data = {};
    data.textarea = $('#bibtex_textarea').val().trim();
    data.fileName = "manual.bib";

    if ( data.textarea.length > 0 ) {
        var thisBib = {};

        console.log('sending jsondata');
        console.log(data);

        $.ajax({
            url: "bibtexhandler.php",
            data: data, 
            dataType: 'json',
            type: 'post', 
            success: function(r) {
                console.log(r);
                FileUploadFinisher(r);
            }
        });
    }

}

function FileUploadFinisher(response, _silent) {
    // on file input change, we add this file to the 'stack' (by which we mean storing its text internally), and update the interface to show the file was loaded (and can be deleted

    // catch errors
    if ( typeof(_silent) == "undefined" ) {
        silent = false;
    }
    if ( typeof(response.error) != 'undefined' ) {
        if ( response.error.length > 0 ) {
            DisplayMessage(response.error, 'error');
            return;
        }
    } else {
        DisplayMessage('There was an issue saving the file', 'error');
        return;
    }
    if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
        console.log("Your browser lacks the capability to save and convert this file");
        return;
    }   

    // init for file / txt read
    input = document.getElementById('bibtex_upload_file');
    var txt = "";
    var b = new BibtexParser();
    var thisBib = {};
    var thisType = "";
    if (!input) {
        console.log("Um, couldn't find the fileinput element.");
    }
    else if (!input.files) {
        console.log("This browser doesn't seem to support the `files` property of file inputs.");
    }
    else if (!input.files[0] && response.uploadType != "cookie") {
        // textarea
        if ( response.uploadType == "textarea" ) {
            // manually inserted from the textarea
            txt = $('#bibtex_textarea').val();

            thisType = "bibtex_textarea";

        } else {
            DisplayMessage("Try another file", "error");
        }
    }
    else if (response.uploadType == "cookie" ) {
        txt = response.txt;
        thisType = "cookie";
    } else {
        txt = response.fileContents;
        thisType = "file";
    }

    // process and save the bibtex
    thisBib.fileName = response.filePath;
    thisBib.data = b.getEntries();

    var b = new BibtexParser();
    b.setInput(txt);
    b.bibtex();
    var thisBib = {};
    thisBib.fileName = response.filePath;
    thisBib.data = b.getEntries();

    // remove the dup first
    for ( var i = 0 ; i < bibFiles.length ; i++ ) {
        if ( bibFiles[i].fileName = thisBib.fileName ) {
            bibFiles.splice(i, 1);
            break;
        }
    }
    bibFiles.push(thisBib);

    // store this as a cookie
    if ( thisType != "cookie" ) {
        var thisCookie = {};
        thisCookie.type = thisType;
        thisCookie.id = bibFiles.length; // a throwaway id. we can't rely on these as they'll be too dynamic
        thisCookie.val = thisBib.fileName;
        DeleteThisCookieOld(thisCookie);
        cookieStorage.files.push(thisCookie);
    }

    // update the UI
    if ( thisType == "file" || thisType == "cookie" ) {

        var justTheFileName = thisBib.fileName.split('/').pop();

        // remove potential dup UI
        $('#bib_list > li').each(function() {
            if ( $(this).html().indexOf(justTheFileName) != -1 ) {
                $(this).remove();
                return false;
            }
        });

        // update UI to show this one 
        var bibHtml = $('#bib_list_template').clone();
        bibHtml.find('.bib_filename').html(justTheFileName);
        bibHtml.find('.bib_file_length').html(Object.keys(thisBib.data).length + " articles");
        bibHtml.removeAttr('id');
        bibHtml.removeClass('hidden');
        $('#bib_list_template').before(bibHtml);
        $('#bib_list').focus();

        $('#bibtex_upload_file').val('');
    }

}

function BibtexRemoveFile(sender) {
    // remove data, and remove this li and cookie

    var fileName = $(sender).parent().find('.bib_filename').html();

    var numItems = bibFiles.length;
    for ( var i = 0 ; i < numItems ; i++ ) {
        if ( bibFiles[i].fileName.indexOf(fileName) > -1 ) {
            bibFiles.splice(i, 1);
            break;
        }
    }

    for ( var i = 0 ; i < cookieStorage.files.length ; i++ ) {
        if ( cookieStorage.files[i].val.indexOf(fileName) != -1 ) {
            cookieStorage.files.splice(i, 1);
            Cookies.set('rmd_storage', cookieStorage);
            break;
        }
    }


    $(sender).parent().remove(); 
}

function InitReferenceInsert() {
    // add all items to list to be filtered

    // first we'll add them to an array to sort
    var bibArr = [];
    var sortArr = [];
    var numFiles = bibFiles.length;
    for ( var i = 0 ; i < numFiles ; i++ ) {
        for ( var key in bibFiles[i].data ) {
            var thisBib = bibFiles[i].data[key];
            if ( ! bibArr.hasOwnProperty(key) ) { // avoid duplicates
                bibArr.push(thisBib); 
                sortArr.push(thisBib.TITLE); // we'll sort by title
            }
        }
    }

    // sort
    var data = [];
    for (var i = 0 ; i < sortArr.length ; i++) {
        data.push([sortArr[i], bibArr[i]]);
    }
    data.sort(function (a, b) {
        if (a[0] === b[0]) {
            return 0;
        }
        else {
            return (a[0] < b[0]) ? -1 : 1;
        }
    });

    // add to list
    $('#citation_list').html('');
    var numItems = data.length;
    for ( var i = 0 ; i < numItems ; i++ ) {
        var html = '';
        html += '<li class="list-group-item">\n';
        html += '<button class="invis_button citation_insert_button" data-article="' + data[i][1].BIBTEXKEY + '" role="button" title="' + data[i][1].TITLE + '">';
        html += data[i][1].TITLE;
        html += '</button>\n';
        html += '</li>\n';

        $('#citation_list').append(html);
    }

    $('#citation_modal').modal('show');
}

function FilterCitations() {
    var filterText = $('#citation_filter').val().toLowerCase();

    $('#citation_list > li').each(function() {
        var thisText = $(this).find('button').html().toLowerCase();

        if ( filterText.length == 0 || thisText.indexOf(filterText) != -1 ) {
            $(this).removeClass('hidden');
        } else {
            $(this).addClass('hidden');
        }
    });
}

function EditText(item) {
    // idea: we want to insert pre / post text from the item around our current selection 

    var ta = $('textarea').get(0);
    currentHighlight = ta.value.substring(ta.selectionStart, ta.selectionEnd);
    var insertThis = item.contentPre + currentHighlight + item.contentPost;

    InsertInTextareaAtCursor($('#rmd_text')[0], insertThis);
}

function InsertInTextareaAtCursor(myField, myValue) {
    // stolen from https://stackoverflow.com/questions/11076975/insert-text-into-textarea-at-cursor-position-javascript

    $(myField).focus();

    //IE support
    if (document.selection) {
        myField.focus();
        sel = document.selection.createRange();
        sel.text = myValue;
    }
    //MOZILLA and others
    else if (myField.selectionStart || myField.selectionStart == '0') {
        var startPos = myField.selectionStart;
        var endPos = myField.selectionEnd;
        myField.value = myField.value.substring(0, startPos)
            + myValue
            + myField.value.substring(endPos, myField.value.length);
        myField.selectionStart = startPos + myValue.length;
        myField.selectionEnd = startPos + myValue.length;
    } 
    // otherwise, just append it
    else {
        myField.value += myValue;
    }
}

function DisplayMessage(msg, where) {
    if ( typeof(where) == "undefined" ) {
        var where = "live";
    }

    if ( where == "system_message" ) {
        msg = "<hr>\n<h3>System log: </h3>\n" + msg;
    }

    if ( where == "error" ) {
        $('#error_modal .modal-body').html(msg);
        $('#error_modal').modal('show');
    }

    msg = msg.replace(/\n/g, "<br>");
    msg = msg.replace(/\r/g, "<br>");

    $('#' + where).html(msg);
}

